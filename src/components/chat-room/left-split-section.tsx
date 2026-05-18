import { FileText, Brain, Terminal, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export const LeftSplitSection = () => {
  return (
    <main className="">
      {" "}
      <div className="flex-1 flex flex-col bg-[#0a0a0a] border border-white/5 rounded-[32px] overflow-hidden relative shadow-2xl">
        {/* Header */}
        <div className="px-8 py-6 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm z-20">
          <div className="flex items-center gap-3">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-2xl font-bold text-white tracking-tight">
              Intelligence Stream
            </h2>
          </div>
          <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 px-3 py-1 rounded-[6px] text-[10px] font-bold uppercase tracking-widest backdrop-blur-xl">
            AI Active
          </Badge>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-8 space-y-10 custom-scrollbar scroll-smooth">
          <div className="flex flex-col items-center">
            <span className="text-[10px] uppercase tracking-[0.4em] font-black text-slate-600 mb-8 px-4 py-1.5 rounded-full">
              SESSION START: 14:02 UTC
            </span>
          </div>

          {/* User Message */}
          <div className="flex flex-col items-end gap-2 max-w-[85%] ml-auto group">
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-5 text-slate-300 text-sm leading-relaxed shadow-xl">
              Hey, I'm worried about the witness's credibility regarding the
              timeline.
            </div>
            <div className="flex items-center mr-2">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                You • 14:15
              </span>
            </div>
          </div>

          {/* AI Message */}
          <div className="flex flex-col items-start gap-4 max-w-[92%]">
            <div className="flex items-center gap-3 ml-1">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Terminal className="w-4 h-4 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-purple-400 uppercase tracking-[0.25em]">
                  Lexis AI
                </span>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 relative overflow-hidden group shadow-xl">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
              <p className="text-slate-200 text-[17px] font-medium leading-relaxed mb-6">
                Wait, the deposition on Page 14 says he was at the office,{" "}
                <span className="text-white font-bold underline decoration-purple-500/50 underline-offset-4 decoration-2">
                  not the bar
                </span>
                . Look here...
              </p>

              {/* Citation Card */}
              <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-center justify-between group/card hover:border-white/20 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200 mb-0.5">
                      Deposition_Witness_J.pdf
                    </h4>
                    <span className="text-[10px] text-slate-500 font-medium tracking-wide">
                      Exhibit B-12 • Page 14
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-600 group-hover/card:text-slate-400" />
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">
              Lexis AI • 14:16
            </span>
          </div>
        </div>

        {/* Chat Input */}
        <div className="p-8 pt-0 mt-4 relative z-20">
          <div className="relative">
            <Input
              placeholder="Direct query to case history..."
              className="bg-white/[0.03] border-white/10 h-14 pl-6 pr-20 rounded-xl text-slate-200 placeholder:text-slate-600 focus:border-purple-500/40 focus:ring-0 transition-all text-sm shadow-lg"
            />
          </div>
        </div>
      </div>
    </main>
  );
};
