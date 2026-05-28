import { Mic, MicOff, PhoneOff, Volume2 } from "lucide-react";
import { Button } from "../ui/button";

interface LeftCallProps {
  onEnd?: () => void;
  callStatus: "idle" | "connecting" | "active" | "error";
  transcript: string;
  aiResponse: string;
  isAiSpeaking: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const LeftCall = ({
  onEnd,
  callStatus,
  transcript,
  aiResponse,
  isAiSpeaking,
  isMuted,
  onToggleMute,
}: LeftCallProps) => {
  // Determine the status badge text and color
  let statusLabel = "Connecting...";
  let statusColor = "text-yellow-400";
  let statusDotClass = "bg-yellow-400 animate-pulse";

  if (callStatus === "active") {
    if (isAiSpeaking) {
      statusLabel = "Agent Speaking";
      statusColor = "text-purple-400";
      statusDotClass = "bg-purple-400 animate-pulse";
    } else {
      statusLabel = "Listening";
      statusColor = "text-emerald-400";
      statusDotClass = "bg-emerald-400 animate-pulse";
    }
  } else if (callStatus === "error") {
    statusLabel = "Connection Error";
    statusColor = "text-red-400";
    statusDotClass = "bg-red-400";
  }

  // Dynamic orb styling based on state
  let orbGradient = "from-[#b5e0ff] to-[#a3a3ff]";
  let orbShadow = "shadow-[0_0_30px_rgba(168,85,247,0.3)]";

  if (isAiSpeaking) {
    orbGradient = "from-[#c084fc] to-[#7c3aed]";
    orbShadow = "shadow-[0_0_40px_rgba(168,85,247,0.5)]";
  } else if (callStatus === "connecting") {
    orbGradient = "from-[#fbbf24] to-[#f59e0b]";
    orbShadow = "shadow-[0_0_20px_rgba(245,158,11,0.3)]";
  }



  return (
    <div className="flex-1 rounded-[32px] overflow-hidden relative flex flex-col items-center py-12 px-6 shadow-2xl bg-[#0a0a0a] border border-white/5">
      {/* Background glows - Removed heavy blurs for performance */}

      {/* Top Status Badge */}
      <div className="flex flex-col items-center gap-6 relative z-10 w-full">
        <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full flex items-center gap-3 backdrop-blur-md">
          <div className={`w-2 h-2 rounded-full ${statusDotClass}`} />
          <span
            className={`text-[11px] font-bold tracking-[0.15em] uppercase ${statusColor}`}
          >
            {statusLabel}
          </span>
        </div>

        {/* Live transcript display — shows what the user is saying */}
        {transcript && callStatus === "active" && (
          <div className="bg-white/5 border border-white/8 rounded-2xl px-5 py-3 max-w-md text-center backdrop-blur-md">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">
              You said
            </p>
            <p className="text-slate-200 text-sm font-medium leading-relaxed">
              {transcript}
            </p>
          </div>
        )}
      </div>

      {/* Center Orb Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        {/* Concentric Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/3" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/5" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/8" />

        {/* Main glowing orb */}
        <div
          className={`w-56 h-56 rounded-full bg-linear-to-b ${orbGradient} ${orbShadow} flex items-center justify-center relative overflow-hidden transition-all duration-300`}
        >
          {/* Audio waveform inside orb */}
          <div
            className={`flex items-center gap-1.5 z-10 ${isAiSpeaking ? "animate-pulse" : ""}`}
          >
            {isAiSpeaking ? (
              <Volume2 className="w-10 h-10 text-white/90" />
            ) : (
              <>
                <div className="w-1 h-3 bg-white/80 rounded-full" />
                <div className="w-1 h-6 bg-white/80 rounded-full" />
                <div className="w-1 h-10 bg-white/80 rounded-full" />
                <div className="w-1 h-6 bg-white/80 rounded-full" />
                <div className="w-1 h-3 bg-white/80 rounded-full" />
              </>
            )}
          </div>
        </div>

        {/* AI Response text — shows below the orb */}
        {aiResponse && callStatus === "active" && (
          <div className="mt-8 bg-white/3 border border-white/8 rounded-2xl px-6 py-4 max-w-lg text-center backdrop-blur-md">
            <p className="text-[10px] font-bold text-purple-400 uppercase tracking-widest mb-2">
              Lexis AI
            </p>
            <p className="text-slate-300 text-sm leading-relaxed">
              {aiResponse}
            </p>
          </div>
        )}

        {/* Bottom Audio Visualizer */}
        {/* <div className="absolute bottom-8 flex items-end justify-center gap-2 h-16 w-full opacity-80">
          {barHeights.map((h, i) => (
            <div
              key={i}
              className={`w-2.5 rounded-full bg-gradient-to-t from-purple-500 via-indigo-400 to-[#b5e0ff] transition-all duration-300`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div> */}
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-8 relative z-10 mt-8">
        {/* Mute/Unmute toggle */}
        <Button
          size="icon"
          onClick={onToggleMute}
          className={`w-14 h-14 rounded-full border transition-all shadow-xl ${
            isMuted
              ? "bg-red-900/30 border-red-500/30 text-red-400 hover:bg-red-900/50"
              : "bg-[#0a0a0a] border-white/5 text-slate-400 hover:text-white hover:bg-white/10"
          }`}
        >
          {isMuted ? (
            <MicOff className="w-5 h-5" />
          ) : (
            <Mic className="w-5 h-5" />
          )}
        </Button>

        {/* End call button */}
        <Button
          onClick={onEnd}
          className="h-14 px-10 rounded-full bg-[#b91c1c] hover:bg-red-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(185,28,28,0.3)] border border-red-500/30 flex items-center gap-3 transition-all"
        >
          <PhoneOff className="w-5 h-5" />
          End Session
        </Button>
      </div>
    </div>
  );
};
