import { useState } from "react";
import { Calendar, User, Tag, Info, ChevronDown, ChevronUp } from "lucide-react";
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
  onViewCase?: () => void;
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
    btnBg:
      "bg-emerald-600 hover:bg-emerald-500 shadow-[0_0_0.75rem_rgba(16,185,129,0.25)]",
    label: "View Case",
    reasonAccent: "text-emerald-400/70 hover:text-emerald-400",
    tooltipBorder: "border-emerald-500/20",
  },
  closed: {
    border: "border-amber-500/30 hover:border-amber-500/50",
    iconBg: "bg-amber-500/10 border border-amber-500/20",
    badge: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    badgeText: "CLOSED",
    btnBg:
      "bg-amber-600 hover:bg-amber-500 shadow-[0_0_0.75rem_rgba(245,158,11,0.25)]",
    label: "View Details",
    reasonAccent: "text-amber-400/70 hover:text-amber-400",
    tooltipBorder: "border-amber-500/20",
  },
  abandoned: {
    border: "border-red-500/30 hover:border-red-500/50",
    iconBg: "bg-red-500/10 border border-red-500/20",
    badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    badgeText: "ABANDONED",
    btnBg:
      "bg-red-600 hover:bg-red-500 shadow-[0_0_0.75rem_rgba(239,68,68,0.25)]",
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
  onViewCase,
}: CaseCardProps) => {
  const s = statusStyles[status];
  const [showReason, setShowReason] = useState(false);

  return (
    <div
      className={cn(
        "bg-[#0a0a0a] border rounded-2xl p-5 md:p-4 transition-all hover:bg-white/1",
        s.border,
      )}
    >
      {/* Top Header Row: Icon, Title, and Status Badge */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-start gap-3 md:gap-4 min-w-0">
          <div
            className={cn(
              "w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-xl flex items-center justify-center mt-0.5",
              s.iconBg,
            )}
          >
            {icon}
          </div>
          <div className="min-w-0">
            <h3 className="text-white font-bold text-base md:text-lg leading-tight truncate">
              {caseName}
            </h3>
            <span className="text-slate-500 text-xs font-mono block mt-1">#{id}</span>
          </div>
        </div>

        <Badge
          className={cn(
            "px-2 py-0.5 md:px-2.5 md:py-1 rounded-md text-[0.625rem] font-black uppercase tracking-widest shrink-0 border-0",
            s.badge,
          )}
        >
          {s.badgeText}
        </Badge>
      </div>

      {/* Outcome / Description */}
      <p className="text-slate-400 text-xs md:text-sm leading-relaxed mb-5 pl-0 md:pl-16">
        {outcome}
      </p>

      {/* Footer Details: Metadata & Action Button */}
      <div className="border-t border-white/5 pt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-x-4 gap-y-2 flex-wrap text-slate-500 text-xs pl-0 md:pl-16">
          <span className="flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-slate-600" />
            {caseType}
          </span>
          <span className="flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-slate-600" />
            {attorney}
          </span>
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-slate-600" />
            {openedDate} — {closedDate}
          </span>

          {/* Reason Toggle Button */}
          <button
            onClick={() => setShowReason(!showReason)}
            className={cn(
              "flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer focus:outline-none",
              s.reasonAccent,
            )}
          >
            <Info className="w-3.5 h-3.5" />
            <span>{reasonLabel[status]}</span>
            {showReason ? (
              <ChevronUp className="w-3 h-3 opacity-60" />
            ) : (
              <ChevronDown className="w-3 h-3 opacity-60" />
            )}
          </button>
        </div>

        {/* Action Button */}
        <Button
          onClick={onViewCase}
          className={cn(
            "text-white rounded-xl h-9 text-xs font-bold tracking-wide w-full sm:w-auto px-5 shadow-lg shrink-0",
            s.btnBg,
          )}
        >
          {s.label}
        </Button>
      </div>

      {/* Expandable Reason Details */}
      {showReason && (
        <div className="mt-4 p-4 bg-white/2 border border-white/5 rounded-xl md:ml-16 animate-in fade-in slide-in-from-top-2 duration-200">
          <p className="text-[0.625rem] font-black uppercase tracking-widest text-slate-500 mb-1.5">
            {reasonLabel[status]}
          </p>
          <p className="text-slate-300 text-xs leading-relaxed">
            {reason}
          </p>
        </div>
      )}
    </div>
  );
};
