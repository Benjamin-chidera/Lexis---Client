import { FileText, Sparkles } from "lucide-react";

export const RightCall = () => {
  return (
    <div className="flex-1 flex flex-col bg-[#0a0a0a] border border-white/5 rounded-[32px] overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <FileText className="w-6 h-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">Legal Contract Review</h2>
        </div>
        <div className="bg-white/5 border border-white/10 px-4 py-1.5 rounded-lg">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page 05 / 24</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-12 custom-scrollbar">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-12 leading-tight">
            ARTICLE IV: TERMINATION & CONFLICTS
          </h1>

          <div className="space-y-8 text-slate-300 font-sans leading-relaxed text-[15px] antialiased">
            <p className="text-slate-400">
              4.1. The parties agree that this agreement shall continue in perpetuity unless terminated by either party with ninety (90) days written notice. All outstanding obligations at the time of termination must be fulfilled within thirty (30) days of said notice.
            </p>

            {/* Highlighted Section */}
            <div className="bg-[#0a0a0a] border-l-[3px] border-[#a277ff] rounded-r-2xl p-6 relative overflow-hidden shadow-lg my-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#a277ff]" />
                <span className="text-[9px] font-black text-[#a277ff] uppercase tracking-[0.2em]">Agent Triggered Highlight</span>
              </div>
              <p className="text-white font-medium relative z-10 text-[16px] leading-relaxed">
                4.2. In the event of a material breach, the non-breaching party shall be entitled to seek injunctive relief and damages. Any conflict arising from the interpretation of this section shall be subject to mandatory arbitration in the jurisdiction of Delaware.
              </p>
            </div>

            <p className="text-slate-400">
              4.3. FORCE MAJEURE. Neither party shall be liable for any failure of or delay in the performance of this Agreement for the period that such failure or delay is due to causes beyond its reasonable control, including but not limited to acts of God, war, strikes or labor disputes, embargoes, government orders or any other force majeure event.
            </p>

            <p className="text-slate-400">
              4.4. SEVERABILITY. If any provision of this Agreement is held to be invalid or unenforceable, the remaining provisions shall continue to be valid and enforceable. If a court finds that any provision of this Agreement is invalid or unenforceable, but that by limiting such provision it would become valid and enforceable, then such provision shall be deemed to be written, construed, and enforced as so limited.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}