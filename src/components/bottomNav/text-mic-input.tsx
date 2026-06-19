import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBriefingStore } from "@/store/briefingStore";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;

export const TextMicInput = () => {
  const { context, setContext } = useBriefingStore();
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(true);
  const [interimResult, setInterimResult] = useState("");
  
  const recognitionRef = useRef<AnySpeechRecognition>(null);
  const isIntendedListeningRef = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SR: any =
      (window as any).SpeechRecognition ??
      (window as any).webkitSpeechRecognition;
      
    if (!SR) {
      setSupported(false);
      return;
    }
    
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e: any) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalChunk += e.results[i][0].transcript;
        } else {
          interimChunk += e.results[i][0].transcript;
        }
      }

      // Update the interim result immediately so you see words as you speak
      setInterimResult(interimChunk);

      if (finalChunk) {
        // Read latest context from Zustand directly to avoid stale closures
        const currentContext = useBriefingStore.getState().context;
        const newContext = currentContext 
          ? currentContext + " " + finalChunk.trim() 
          : finalChunk.trim();
        setContext(newContext);
      }
    };

    recognition.onend = () => {
      if (isIntendedListeningRef.current) {
        try {
          recognition.start();
        } catch (error) {
          console.error("Error restarting speech recognition:", error);
          setListening(false);
          setInterimResult("");
          isIntendedListeningRef.current = false;
        }
      } else {
        setListening(false);
        setInterimResult("");
      }
    };

    recognition.onerror = (e: any) => {
      console.error("Speech recognition error:", e.error);
      if (e.error === 'not-allowed' || e.error === 'audio-capture') {
        isIntendedListeningRef.current = false;
        setListening(false);
        setInterimResult("");
      }
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.stop();
    };
  }, [setContext]);

  const toggleMic = () => {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    
    if (listening) {
      isIntendedListeningRef.current = false;
      recognition.stop();
      setListening(false);
      setInterimResult("");
    } else {
      isIntendedListeningRef.current = true;
      try {
        recognition.start();
        setListening(true);
      } catch (e) {
        console.error("Failed to start recognition:", e);
      }
    }
  };

  const displayedText = context + (interimResult ? (context ? " " : "") + interimResult : "");

  return (
    <div className="relative group">
      <textarea
        value={displayedText}
        onChange={(e) => {
          setContext(e.target.value);
          setInterimResult("");
        }}
        placeholder="Describe the strategic context, desired outcomes, and key legal theories to explore..."
        className="w-full min-h-[10rem] bg-white/3 border border-white/10 rounded-[1.5rem] p-6 pr-24 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-purple-500/40 focus:ring-8 focus:ring-purple-500/5 transition-all resize-none shadow-2xl backdrop-blur-md text-base leading-relaxed"
      />
      <div className="absolute bottom-6 right-6">
        {supported ? (
          <Button
            type="button"
            size="icon"
            onClick={toggleMic}
            className={`rounded-2xl w-14 h-14 text-white shadow-2xl border transition-all duration-300 active:scale-90 ${
              listening
                ? "bg-red-500 hover:bg-red-400 border-red-400/30 shadow-red-500/40 animate-pulse"
                : "bg-white hover:bg-zinc-200 text-black border border-white/20 border-purple-400/30 shadow-purple-500/40"
            }`}
          >
            {listening ? (
              <MicOff className="w-6 h-6" />
            ) : (
              <Mic className="w-6 h-6 group-hover:scale-110 transition-transform" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            disabled
            title="Speech recognition not supported in this browser"
            className="rounded-2xl w-14 h-14 bg-white/5 text-slate-600 border border-white/10 cursor-not-allowed"
          >
            <MicOff className="w-6 h-6" />
          </Button>
        )}
      </div>
    </div>
  );
};
