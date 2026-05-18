import { Mic, MicOff, PhoneOff, Settings } from "lucide-react";
import { Button } from "../ui/button";

export const LeftCall = () => {
  return (
    <div className="flex-1 rounded-[32px] overflow-hidden relative flex flex-col items-center py-12 px-6 shadow-2xl bg-[#0a0a0a] border border-white/5">
      {/* Background glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Top Status */}
      <div className="flex flex-col items-center gap-8 relative z-10 w-full">
        <div className="bg-white/5 border border-white/10 px-6 py-2 rounded-full flex items-center gap-3 backdrop-blur-md">
          <Mic className="w-4 h-4 text-red-500 animate-pulse" />
          <span className="text-[11px] font-bold text-slate-300 tracking-[0.15em] uppercase">Agent Active: Mock Court Simulation</span>
        </div>
        <p className="text-slate-400 italic font-serif text-lg tracking-wide">"Listen to the opposing counsel's argument..."</p>
      </div>

      {/* Center Orb Area */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10">
        
        {/* Concentric Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/[0.03]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-white/[0.05]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full border border-white/[0.08]" />
        
        {/* Main glowing orb */}
        <div className="w-56 h-56 rounded-full bg-gradient-to-b from-[#b5e0ff] to-[#a3a3ff] shadow-[0_0_100px_rgba(168,85,247,0.4)] flex items-center justify-center relative overflow-hidden animate-pulse">
          {/* Audio waveform inside orb */}
          <div className="flex items-center gap-1.5 z-10">
             <div className="w-1 h-3 bg-white/80 rounded-full" />
             <div className="w-1 h-6 bg-white/80 rounded-full" />
             <div className="w-1 h-10 bg-white/80 rounded-full" />
             <div className="w-1 h-6 bg-white/80 rounded-full" />
             <div className="w-1 h-3 bg-white/80 rounded-full" />
          </div>
        </div>

        {/* Bottom Audio Visualizer */}
        <div className="absolute bottom-8 flex items-end justify-center gap-2 h-16 w-full opacity-80">
          {[30, 45, 60, 80, 100, 80, 60, 45, 30].map((h, i) => (
            <div 
              key={i} 
              className="w-2.5 rounded-full bg-gradient-to-t from-purple-500 via-indigo-400 to-[#b5e0ff]"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="flex items-center justify-center gap-8 relative z-10 mt-8">
        <Button size="icon" className="w-14 h-14 rounded-full bg-[#0a0a0a] border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl">
          <MicOff className="w-5 h-5" />
        </Button>
        <Button className="h-14 px-10 rounded-full bg-[#b91c1c] hover:bg-red-600 text-white font-bold text-lg shadow-[0_0_30px_rgba(185,28,28,0.3)] border border-red-500/30 flex items-center gap-3 transition-all">
          <PhoneOff className="w-5 h-5" />
          End Session
        </Button>
        <Button size="icon" className="w-14 h-14 rounded-full bg-[#0a0a0a] border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all shadow-xl">
          <Settings className="w-5 h-5" />
        </Button>
      </div>
    </div>
  )
}
