import { Clock, Sparkles, Play } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SessionCardProps {
  caseName: string;
  caseType: string;
  caseTypeBg: string;
  caseTypeColor: string;
  date: string;
  time: string;
  participantCount?: number;
  status: "ready" | "processing";
  hasTranscript: boolean;
  hasInsights: boolean;
  accent?: "red" | "blue" | "purple" | null;
  icon: React.ReactNode;
  iconBg: string;
}

const accentBorderMap = {
  red: "border-l-[0.1875rem] border-l-red-500",
  blue: "border-l-[0.1875rem] border-l-blue-500",
  purple: "border-l-[0.1875rem] border-l-purple-500",
};

export const SessionCard = ({
  caseName,
  caseType,
  caseTypeBg,
  caseTypeColor,
  date,
  time,
  participantCount = 2,
  status,
  hasTranscript,
  hasInsights,
  accent,
  icon,
  iconBg,
}: SessionCardProps) => {
  return (
    <div
      className={cn(
        "bg-[#0a0a0a] border border-white/5 rounded-2xl p-5 flex items-center gap-5 transition-all hover:border-white/10",
        accent && accentBorderMap[accent]
      )}
    >
      <div className={cn("w-12 h-12 shrink-0 rounded-xl flex items-center justify-center", iconBg)}>
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-white font-bold text-[0.9375rem] truncate mb-1">{caseName}</h3>
        <div className="flex items-center gap-2 flex-wrap">
          <Clock className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="text-slate-500 text-xs">
            {date} • {time}
          </span>
          <Badge
            className={cn(
              "text-[0.5625rem] font-black uppercase tracking-widest px-2 py-0 h-4 rounded border-0",
              caseTypeBg,
              caseTypeColor
            )}
          >
            {caseType}
          </Badge>
        </div>
      </div>

      <div className="flex items-center -space-x-2 shrink-0">
        {Array.from({ length: participantCount }).map((_, i) => (
          <div
            key={i}
            className="w-7 h-7 rounded-full bg-linear-to-br from-slate-600 to-slate-800 border-2 border-[#11141e]"
            style={{ zIndex: participantCount - i }}
          />
        ))}
      </div>

      <div className="flex items-center gap-3 shrink-0 min-w-[13.125rem] justify-center">
        {status === "processing" ? (
          <span className="text-slate-400 text-xs font-medium px-3 py-1 bg-white/5 rounded-full border border-white/5">
            Processing...
          </span>
        ) : (
          <>
            {hasTranscript && (
              <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_0.375rem_rgba(52,211,153,0.6)]" />
                Transcript Ready
              </span>
            )}
            {hasInsights && (
              <span className="flex items-center gap-1 text-purple-400 text-xs font-semibold">
                <Sparkles className="w-3 h-3" />
                AI Insights
              </span>
            )}
          </>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {status === "processing" ? (
          <Button
            variant="outline"
            disabled
            className="bg-[#0a0a0a] border-white/5 text-slate-600 rounded-xl h-0.5625rem-5 text-xs font-bold tracking-wide cursor-default"
          >
            Pending
          </Button>
        ) : (
          <>
            <Button
              variant="outline"
              className="bg-transparent border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl h-0.5625rem-4 text-xs font-bold tracking-wide"
            >
              View Transcript
            </Button>
            {hasInsights ? (
              <Button className="bg-white hover:bg-zinc-200 text-black border border-white/20 rounded-xl h-0.5625rem-4 text-xs font-bold tracking-wide shadow-[0_0_0.9375rem_rgba(147,51,234,0.25)]">
                See Insights
              </Button>
            ) : (
              <Button
                variant="ghost"
                className="w-9 h-9 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 p-0 flex items-center justify-center border border-white/10"
              >
                <Play className="w-3.5 h-3.5" />
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
};
