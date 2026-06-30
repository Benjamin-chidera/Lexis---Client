import { CheckCircle2, XCircle, Ban } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsOverviewProps {
  successCount: number;
  closedCount: number;
  abandonedCount: number;
  total: number;
}

const stats = (successCount: number, closedCount: number, abandonedCount: number, total: number) => [
  {
    label: "Successful",
    count: successCount,
    percent: total > 0 ? Math.round((successCount / total) * 100) : 0,
    icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    iconBg: "bg-emerald-500/10 border border-emerald-500/20",
    barColor: "bg-emerald-500",
    textColor: "text-emerald-400",
  },
  {
    label: "Closed",
    count: closedCount,
    percent: total > 0 ? Math.round((closedCount / total) * 100) : 0,
    icon: <Ban className="w-5 h-5 text-amber-400" />,
    iconBg: "bg-amber-500/10 border border-amber-500/20",
    barColor: "bg-amber-500",
    textColor: "text-amber-400",
  },
  {
    label: "Abandoned",
    count: abandonedCount,
    percent: total > 0 ? Math.round((abandonedCount / total) * 100) : 0,
    icon: <XCircle className="w-5 h-5 text-red-400" />,
    iconBg: "bg-red-500/10 border border-red-500/20",
    barColor: "bg-red-500",
    textColor: "text-red-400",
  },
];

export const StatsOverview = ({ successCount, closedCount, abandonedCount, total }: StatsOverviewProps) => {
  return (
    <>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <div className="flex flex-row md:grid md:grid-cols-3 gap-4 mb-2 md:mb-10 overflow-x-auto no-scrollbar flex-nowrap pb-2 md:pb-0 snap-x snap-mandatory">
        {stats(successCount, closedCount, abandonedCount, total).map((s) => (
          <div key={s.label} className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shrink-0 w-full sm:w-[280px] md:w-auto snap-start">
            <div className="flex items-center justify-between mb-4">
              <span className="text-[0.625rem] font-black text-slate-500 uppercase tracking-widest">{s.label}</span>
              <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", s.iconBg)}>
                {s.icon}
              </div>
            </div>
            <p className={cn("text-3xl font-bold mb-1", s.textColor)}>{s.count}</p>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mt-3">
              <div className={cn("h-full rounded-full", s.barColor)} style={{ width: `${s.percent}%` }} />
            </div>
            <span className="text-xs text-slate-500 mt-2 block">{s.percent}% of total cases</span>
          </div>
        ))}
      </div>
    </>
  );
};
