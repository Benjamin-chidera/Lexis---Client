// Plays a two-tone chime using the Web Audio API — no audio files needed.
// The sound is a rising 5th interval (440Hz → 660Hz) with a soft fade-out.

export function playNotificationSound() {
  try {
    const AudioContextClass =
      window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();

    // First tone: 440Hz (A4)
    const osc1 = audioCtx.createOscillator();
    const gain1 = audioCtx.createGain();
    osc1.connect(gain1);
    gain1.connect(audioCtx.destination);
    osc1.type = "sine";
    osc1.frequency.setValueAtTime(440, audioCtx.currentTime);
    gain1.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.4);
    osc1.start(audioCtx.currentTime);
    osc1.stop(audioCtx.currentTime + 0.4);

    // Second tone: 660Hz (E5) — starts 0.15s after the first
    const osc2 = audioCtx.createOscillator();
    const gain2 = audioCtx.createGain();
    osc2.connect(gain2);
    gain2.connect(audioCtx.destination);
    osc2.type = "sine";
    osc2.frequency.setValueAtTime(660, audioCtx.currentTime + 0.15);
    gain2.gain.setValueAtTime(0, audioCtx.currentTime);
    gain2.gain.setValueAtTime(0.35, audioCtx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.7);
    osc2.start(audioCtx.currentTime + 0.15);
    osc2.stop(audioCtx.currentTime + 0.7);

    // Close the context after the sound finishes to free resources
    setTimeout(() => {
      audioCtx.close();
    }, 1000);

  } catch (error) {
    // Browser doesn't support Web Audio API — fail silently
    console.warn("Notification sound unavailable:", error);
  }
}
