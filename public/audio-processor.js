/**
 * audio-processor.js
 *
 * AudioWorklet processor that captures raw PCM audio from the microphone,
 * downsamples it from the browser's native sample rate (usually 48kHz)
 * to 16kHz mono PCM16, and sends chunks to the main thread.
 *
 * This runs in a separate audio thread so it never blocks the UI.
 *
 * Usage:
 *   await audioContext.audioWorklet.addModule("/audio-processor.js");
 *   const processorNode = new AudioWorkletNode(audioContext, "audio-capture-processor");
 */

class AudioCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();

    // Target sample rate for Voxtral Realtime
    this.TARGET_SAMPLE_RATE = 16000;

    // Buffer to accumulate samples before sending
    // We send chunks every ~100ms (1600 samples at 16kHz)
    this.CHUNK_SIZE = 1600;
    this.buffer = new Float32Array(0);
  }

  /**
   * Called by the browser for every 128-sample audio frame.
   *
   * inputs[0][0] = mono float32 audio data at the AudioContext's sample rate
   */
  process(inputs) {
    const inputChannel = inputs[0][0];

    // If no input data (mic disconnected, etc.), skip
    if (!inputChannel) {
      return true;
    }

    // Downsample from native sample rate to 16kHz
    const downsampledData = this.downsample(inputChannel, sampleRate, this.TARGET_SAMPLE_RATE);

    // Append to our internal buffer
    const newBuffer = new Float32Array(this.buffer.length + downsampledData.length);
    newBuffer.set(this.buffer);
    newBuffer.set(downsampledData, this.buffer.length);
    this.buffer = newBuffer;

    // If we have enough samples, send a chunk to the main thread
    while (this.buffer.length >= this.CHUNK_SIZE) {
      // Extract a chunk
      const chunk = this.buffer.slice(0, this.CHUNK_SIZE);
      this.buffer = this.buffer.slice(this.CHUNK_SIZE);

      // Convert float32 (-1 to 1) to int16 (-32768 to 32767)
      const pcm16 = this.float32ToPCM16(chunk);

      // Send to main thread
      this.port.postMessage(pcm16.buffer, [pcm16.buffer]);
    }

    // Return true to keep the processor alive
    return true;
  }

  /**
   * Simple linear downsampling.
   * Takes float32 audio at sourceSampleRate and produces float32 at targetSampleRate.
   */
  downsample(inputData, sourceSampleRate, targetSampleRate) {
    // If sample rates match, no downsampling needed
    if (sourceSampleRate === targetSampleRate) {
      return inputData;
    }

    const ratio = sourceSampleRate / targetSampleRate;
    const outputLength = Math.floor(inputData.length / ratio);
    const output = new Float32Array(outputLength);

    for (let i = 0; i < outputLength; i++) {
      // Pick the nearest sample (simple nearest-neighbor)
      const sourceIndex = Math.floor(i * ratio);
      output[i] = inputData[sourceIndex];
    }

    return output;
  }

  /**
   * Converts float32 audio samples to 16-bit signed integer PCM.
   * This is the format Voxtral Realtime expects (pcm_s16le).
   */
  float32ToPCM16(float32Array) {
    const pcm16 = new Int16Array(float32Array.length);

    for (let i = 0; i < float32Array.length; i++) {
      // Clamp the value to -1.0 to 1.0
      let sample = float32Array[i];
      if (sample > 1.0) {
        sample = 1.0;
      } else if (sample < -1.0) {
        sample = -1.0;
      }

      // Scale to 16-bit integer range
      pcm16[i] = Math.floor(sample * 32767);
    }

    return pcm16;
  }
}

// Register the processor with the name "audio-capture-processor"
registerProcessor("audio-capture-processor", AudioCaptureProcessor);