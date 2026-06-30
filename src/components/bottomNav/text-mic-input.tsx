import { useEffect, useRef, useState } from "react";
import { Mic, MicOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBriefingStore } from "@/store/briefingStore";

interface SpeechRecognitionResult {
  readonly isFinal: boolean;
  [index: number]: {
    readonly transcript: string;
  };
}

interface SpeechRecognitionResults {
  readonly length: number;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionEvent {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResults;
}

interface SpeechRecognitionErrorEvent {
  readonly error: string;
}

interface ISpeechRecognition {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((this: ISpeechRecognition, ev: SpeechRecognitionEvent) => void) | null;
  onend: ((this: ISpeechRecognition, ev: Event) => void) | null;
  onerror: ((this: ISpeechRecognition, ev: SpeechRecognitionErrorEvent) => void) | null;
  start(): void;
  stop(): void;
}

export const TextMicInput = () => {
  const context = useBriefingStore((state) => state.context);
  const setContext = useBriefingStore((state) => state.setContext);
  const [listening, setListening] = useState(false);
  const [supported] = useState(() => {
    if (typeof window === "undefined") return false;
    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => ISpeechRecognition;
      webkitSpeechRecognition?: new () => ISpeechRecognition;
    };
    return !!(windowWithSpeech.SpeechRecognition ?? windowWithSpeech.webkitSpeechRecognition);
  });
  const [interimResult, setInterimResult] = useState("");
  
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const isIntendedListeningRef = useRef(false);

  useEffect(() => {
    if (!supported) return;

    const windowWithSpeech = window as unknown as {
      SpeechRecognition?: new () => ISpeechRecognition;
      webkitSpeechRecognition?: new () => ISpeechRecognition;
    };
    const SR = windowWithSpeech.SpeechRecognition ?? windowWithSpeech.webkitSpeechRecognition;
    if (!SR) return;
    
    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (e: SpeechRecognitionEvent) => {
      let finalChunk = "";
      let interimChunk = "";

      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finalChunk += e.results[i][0].transcript;
        } else {
          interimChunk += e.results[i][0].transcript;
        }
      }

      setInterimResult(interimChunk);

      if (finalChunk) {
        // Read latest context from Zustand directly to avoid stale closures
        const store = useBriefingStore.getState();
        const currentContext = store.context;
        const newContext = currentContext 
          ? currentContext + " " + finalChunk.trim() 
          : finalChunk.trim();
        store.setContext(newContext);
      }
    };

    recognition.onend = () => {
      if (isIntendedListeningRef.current) {
        // Delay restarting to prevent rapid loop errors or browser blockages
        setTimeout(() => {
          if (isIntendedListeningRef.current) {
            try {
              recognition.start();
            } catch (error) {
              console.error("Error restarting speech recognition:", error);
              setListening(false);
              setInterimResult("");
              isIntendedListeningRef.current = false;
            }
          }
        }, 150);
      } else {
        setListening(false);
        setInterimResult("");
      }
    };

    recognition.onerror = (e: SpeechRecognitionErrorEvent) => {
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
  }, [supported]);

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
    <div className="w-full border border-white/10 rounded-[1.5rem] bg-white/3 focus-within:border-purple-500/40 focus-within:ring-8 focus-within:ring-purple-500/5 transition-all duration-300 shadow-2xl backdrop-blur-md flex flex-col group">
      <textarea
        value={displayedText}
        onChange={(e) => {
          setContext(e.target.value);
          setInterimResult("");
        }}
        placeholder="Describe the strategic context, desired outcomes, and key legal theories to explore..."
        className="w-full min-h-[180px] bg-transparent border-0 p-5 pb-2 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-0 resize-none text-base leading-relaxed"
      />
      
      <div className="flex items-center justify-between px-5 pb-4 pt-2 bg-transparent shrink-0">
        <div className="flex items-center gap-2">
          {supported ? (
            listening ? (
              <div className="flex items-center gap-2 text-red-400 text-xs font-semibold animate-pulse">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span>Listening...</span>
              </div>
            ) : (
              <span className="text-xs text-slate-500 group-focus-within:text-slate-400 transition-colors">
                Click mic to speak case notes
              </span>
            )
          ) : (
            <span className="text-xs text-slate-600">
              Speech not supported in this browser
            </span>
          )}
        </div>

        {supported ? (
          <Button
            type="button"
            size="icon"
            onClick={toggleMic}
            className={`rounded-xl w-10 h-10 text-white shadow-lg border transition-all duration-300 active:scale-95 cursor-pointer ${
              listening
                ? "bg-red-500 hover:bg-red-400 border-red-400/30 shadow-red-500/20 animate-pulse"
                : "bg-white hover:bg-zinc-200 text-black border border-white/20 shadow-purple-500/10"
            }`}
          >
            {listening ? (
              <MicOff className="w-4.5 h-4.5" />
            ) : (
              <Mic className="w-4.5 h-4.5 transition-transform" />
            )}
          </Button>
        ) : (
          <Button
            type="button"
            size="icon"
            disabled
            title="Speech recognition not supported in this browser"
            className="rounded-xl w-10 h-10 bg-white/5 text-slate-600 border border-white/10 cursor-not-allowed"
          >
            <MicOff className="w-4.5 h-4.5" />
          </Button>
        )}
      </div>
    </div>
  );
};
