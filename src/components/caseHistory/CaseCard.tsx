import { Calendar, User, Tag, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type CaseStatus = "success" | "closed" | "abandoned";

export interface CaseCardProps {
  caseName: string;
  id: string;
  caseType: string;
  attorney: string;
  openedDate: string;
  closedDate: string;
  outcome: string;
  reason: string;
  status: CaseStatus;
  icon: React.ReactNode;
}

const statusStyles: Record<
  CaseStatus,
  {
    border: string;
    iconBg: string;
    badge: string;
    badgeText: string;
    btnBg: string;
    label: string;
    reasonAccent: string;
    tooltipBorder: string;
  }
> = {
  success: {
    border: "border-emerald-500/30 hover:border-emerald-500/50",
    iconBg: "bg-emerald-500/10 border border-emerald-500/20",
    badge: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    badgeText: "RESOLVED",
    btnBg: "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.25)]",
    label: "View Case",
    reasonAccent: "text-emerald-400/70 hover:text-emerald-400",
    tooltipBorder: "border-emerald-500/20",
  },
  closed: {
    border: "border-amber-500/30 hover:border-amber-500/50",
    iconBg: "bg-amber-500/10 border border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    badgeText: "CLOSED",
    btnBg: "bg-amber-600 hover:bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
    label: "View Details",
    reasonAccent: "text-amber-400/70 hover:text-amber-400",
    tooltipBorder: "border-amber-500/20",
  },
  abandoned: {
    border: "border-red-500/30 hover:border-red-500/50",
    iconBg: "bg-red-500/10 border border-red-500/20",
    badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    badgeText: "ABANDONED",
    btnBg: "bg-red-600 hover:bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.25)]",
    label: "View Report",
    reasonAccent: "text-red-400/70 hover:text-red-400",
    tooltipBorder: "border-red-500/20",
  },
};

const reasonLabel: Record<CaseStatus, string> = {
  success: "Resolution Reason",
  closed: "Closure Reason",
  abandoned: "Abandonment Reason",
};

export const CaseCard = ({
  caseName,
  id,
  caseType,
  attorney,
  openedDate,
  closedDate,
  outcome,
  reason,
  status,
  icon,
}: CaseCardProps) => {
  const s = statusStyles[status];

  return (
    <div className={cn("bg-[#0a0a0a] border rounded-2xl p-6 transition-all relative", s.border)}>
      <div className="flex items-start gap-5">
        <div className={cn("w-12 h-12 shrink-0 rounded-xl flex items-center justify-center mt-0.5", s.iconBg)}>
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
            <div>
              <h3 className="text-white font-bold text-lg leading-tight">{caseName}</h3>
              <span className="text-slate-500 text-xs font-mono">#{id}</span>
            </div>
          </div>

          <p className="text-slate-400 text-sm leading-relaxed mb-4">{outcome}</p>

          <div className="flex items-center gap-5 flex-wrap">
            <span className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Tag className="w-3 h-3" />
              {caseType}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 text-xs">
              <User className="w-3 h-3" />
              {attorney}
            </span>
            <span className="flex items-center gap-1.5 text-slate-500 text-xs">
              <Calendar className="w-3 h-3" />
              {openedDate} — {closedDate}
            </span>

            {/* Reason tooltip trigger */}
            <div className="relative group/reason">
              <button
                className={cn(
                  "flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-default",
                  s.reasonAccent
                )}
              >
                <Info className="w-3 h-3" />
                {reasonLabel[status]}
              </button>

              {/* Tooltip */}
              <div
                className={cn(
                  "absolute bottom-full left-0 mb-3 z-50 w-72 p-4 rounded-xl shadow-2xl",
                  "bg-[#13161f] border",
                  s.tooltipBorder,
                  "opacity-0 invisible group-hover/reason:opacity-100 group-hover/reason:visible",
                  "transition-all duration-200 ease-out",
                  "translate-y-1 group-hover/reason:translate-y-0"
                )}
              >
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                  {reasonLabel[status]}
                </p>
                <p className="text-slate-300 text-xs leading-relaxed">{reason}</p>
                {/* Arrow */}
                <div
                  className={cn(
                    "absolute top-full left-5 w-2.5 h-2.5 bg-[#13161f] border-r border-b rotate-45 mt-[-5px]",
                    s.tooltipBorder
                  )}
                />
              </div>
            </div>
          </div>
        </div>

        <Button
          className={cn(
            "text-white rounded-xl h-9 px-5 text-xs font-bold tracking-wide shrink-0 mt-0.5",
            s.btnBg
          )}
        >
          {s.label}
        </Button>
      </div>

      {/* Status badge — bottom right */}
      <div className="absolute bottom-4 right-6">
        <Badge className={cn("px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest", s.badge)}>
          {s.badgeText}
        </Badge>
      </div>
    </div>
  );
};
