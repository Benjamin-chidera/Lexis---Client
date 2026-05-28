import { useEffect, useRef, useCallback, useState } from "react";
import socket from "@/lib/socket";

/**
 * useVoiceCall — manages the full voice call lifecycle using React local state.
 *
 * Handles:
 *  1. Mic capture via AudioWorklet (PCM16, 16kHz)
 *  2. Streaming audio chunks to server via Socket.IO
 *  3. Receiving transcription, AI text, and AI audio from server
 *  4. Playing AI audio and handling user interruption
 *  5. Mute/unmute toggle
 *
 * Usage:
 *   const { startCall, endCall, toggleMute, isMuted, callStatus, transcript, aiResponse, isAiSpeaking } = useVoiceCall(caseId);
 */
export function useVoiceCall(caseId: string | null) {
  const [callStatus, setCallStatus] = useState<"idle" | "connecting" | "active" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiSpeaking, setAiSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Refs for audio context and nodes (persist across re-renders)
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const isMutedRef = useRef(false);

  // Helper to play AI audio response (base64 encoded mp3) using Web Audio API to bypass Brave/Chrome data-url and autoplay blocks
  const playAiAudio = useCallback(async (base64Mp3: string) => {
    // Stop any currently playing audio
    try {
      audioSourceRef.current?.stop();
    } catch {}
    audioSourceRef.current = null;

    try {
      // Decode base64 to ArrayBuffer
      const binaryString = atob(base64Mp3);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const arrayBuffer = bytes.buffer;

      // Reuse the existing AudioContext or create a new one if not ready
      if (!audioContextRef.current || audioContextRef.current.state === "closed") {
        audioContextRef.current = new AudioContext({ sampleRate: 48000 });
      }
      const ctx = audioContextRef.current;
      await ctx.resume();

      // Decode the audio data array buffer into an AudioBuffer
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

      // Create a buffer source node
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      audioSourceRef.current = source;
      
      setAiSpeaking(true);

      source.onended = () => {
        // Only trigger done signal if this source was not interrupted by a newer one
        if (audioSourceRef.current === source) {
          setAiSpeaking(false);
          socket.emit("call_ai_speaking_done");
        }
      };

      source.start();
    } catch (err) {
      console.error("[useVoiceCall] Web Audio playback error:", err);
      setAiSpeaking(false);
      socket.emit("call_ai_speaking_done");
    }
  }, []);

  const stopAiAudio = useCallback(() => {
    try {
      audioSourceRef.current?.stop();
    } catch {}
    audioSourceRef.current = null;
    setAiSpeaking(false);
  }, []);

  const toggleMute = useCallback(() => {
    isMutedRef.current = !isMutedRef.current;
    setIsMuted(isMutedRef.current);
    
    // Disable/enable the microphone track so it outputs silence when muted
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMutedRef.current;
      });
    }
  }, []);

  const endCall = useCallback(() => {
    console.log("[useVoiceCall] Ending call...");
    
    // Stop recording tracks
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    // Disconnect worklet nodes and source
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }

    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }

    // Close AudioContext
    if (audioContextRef.current) {
      audioContextRef.current.close().catch((err) =>
        console.error("[useVoiceCall] Error closing AudioContext:", err)
      );
      audioContextRef.current = null;
    }

    // Stop playing active AI responses
    stopAiAudio();

    // Reset local state
    setCallStatus("idle");
    setTranscript("");
    setAiResponse("");

    // Emit end_call_session to the server
    socket.emit("end_call_session");
  }, [stopAiAudio]);

  const startCall = useCallback(async () => {
    if (!caseId) return;

    setCallStatus("connecting");
    setTranscript("");
    setAiResponse("");

    try {
      if (!socket.connected) {
        socket.connect();
      }

      // Step 1: Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000, // Hint to browser mic hardware
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // Step 2: Create AudioContext and load downsampler worklet module
      console.log("[useVoiceCall] Creating AudioContext...");
      const audioContext = new AudioContext({ sampleRate: 48000 });
      audioContextRef.current = audioContext;

      if (audioContext.state === "suspended") {
        console.log("[useVoiceCall] AudioContext is suspended. Attempting to resume...");
        await audioContext.resume();
      }

      console.log("[useVoiceCall] Loading AudioWorklet module...");
      await audioContext.audioWorklet.addModule("/audio-processor.js");

      // Step 3: Connect mic stream -> AudioWorklet processor
      const sourceNode = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = sourceNode;

      const workletNode = new AudioWorkletNode(audioContext, "audio-capture-processor");
      workletNodeRef.current = workletNode;

      // When the worklet node downsamples to PCM16, forward it to the server
      workletNode.port.onmessage = (event: MessageEvent) => {
        const pcm16Buffer = event.data;
        if (socket.connected) {
          socket.emit("audio_chunk", pcm16Buffer);
        }
      };

      // Connect standard audio chain nodes: mic -> worklet
      sourceNode.connect(workletNode);
      // Don't connect worklet node to speakers destination to avoid user feedback echo

      // Step 4: Emit start_call_session to server
      socket.emit("start_call_session", {
        case_id: Number(caseId),
      });

    } catch (error) {
      console.error("[useVoiceCall] Failed to start call:", error);
      setCallStatus("error");
    }
  }, [caseId]);

  useEffect(() => {
    const handleSessionStarted = () => {
      setCallStatus("active");
      console.log("[useVoiceCall] Call session successfully started on server");
    };

    // User speech transcription
    const handleTranscript = (data: { text: string }) => {
      setTranscript(data.text);
      
      // Stop AI voice playback if user interrupts
      if (audioSourceRef.current) {
        stopAiAudio();
        if (socket.connected) {
          socket.emit("call_user_speaking");
        }
      }
    };

    // AI text responses
    const handleAiText = (data: { text: string }) => {
      setAiResponse(data.text);
    };

    // AI speech response (base64 base audio)
    const handleAiAudio = (data: { audio_data: string }) => {
      playAiAudio(data.audio_data);
    };

    // Interrupted by server confirmation
    const handleInterrupted = () => {
      stopAiAudio();
    };

    const handleError = (data: { message: string }) => {
      console.error("[useVoiceCall] Server error:", data.message);
      setCallStatus("error");
    };

    socket.on("call_session_started", handleSessionStarted);
    socket.on("call_transcript", handleTranscript);
    socket.on("call_ai_text", handleAiText);
    socket.on("call_ai_audio", handleAiAudio);
    socket.on("call_interrupted", handleInterrupted);
    socket.on("call_error", handleError);

    return () => {
      socket.off("call_session_started", handleSessionStarted);
      socket.off("call_transcript", handleTranscript);
      socket.off("call_ai_text", handleAiText);
      socket.off("call_ai_audio", handleAiAudio);
      socket.off("call_interrupted", handleInterrupted);
      socket.off("call_error", handleError);
    };
  }, [playAiAudio, stopAiAudio]);

  return {
    startCall,
    endCall,
    toggleMute,
    callStatus,
    transcript,
    aiResponse,
    isAiSpeaking,
    isMuted,
  };
}