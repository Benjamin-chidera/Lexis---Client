import { Scale, Gavel, Users, FileText, ArrowRight, FolderOpen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { Case } from "@/store/casesStore";

// Map of case type → icon to display on the card
const CASE_TYPE_ICONS: Record<string, React.ReactNode> = {
  "Corporate Litigation": <Scale className="w-5 h-5 text-purple-400" />,
  "Intellectual Property": <FileText className="w-5 h-5 text-blue-400" />,
  "Estate & Probate": <Users className="w-5 h-5 text-emerald-400" />,
  "Contract Dispute": <Gavel className="w-5 h-5 text-amber-400" />,
};

const DEFAULT_ICON = <FolderOpen className="w-5 h-5 text-slate-400" />;

// Status badge styling map
const STATUS_STYLES: Record<string, string> = {
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  archived: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  closed: "bg-red-500/10 text-red-400 border-red-500/30",
};

interface CaseListCardProps {
  caseData: Case;
  onClick: () => void;
}

export const CaseListCard = ({ caseData, onClick }: CaseListCardProps) => {
  const icon = CASE_TYPE_ICONS[caseData.caseType] ?? DEFAULT_ICON;
  const statusStyle = STATUS_STYLES[caseData.case_result_status] ?? STATUS_STYLES.active;

  // const messageCount = caseData.messages.length;
  const vaultCount = caseData.vault.length;

  return (
    <button
      onClick={onClick}
      className="w-full text-left group relative bg-white/2 hover:bg-white/5 border border-white/6 hover:border-purple-500/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer"
    >
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-purple-500/0 group-hover:bg-purple-500/3 transition-all duration-500 pointer-events-none" />

      <div className="flex justify-between gap-4 relative z-10 h-full">
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-4">
          {/* Case type icon */}
          <div className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-300">
            {icon}
          </div>

          {/* Text info */}
          <div>
            <h3 className="text-base font-bold text-white tracking-tight mb-1 group-hover:text-purple-200 transition-colors">
              {caseData.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mb-3">
              {caseData.caseType} · {caseData.attorney}
            </p>

            {/* Stats row */}
            <div className="flex items-center gap-4">
              {/* <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <MessageSquare className="w-3 h-3" />
                {messageCount} {messageCount === 1 ? "message" : "messages"}
              </span> */}
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <FolderOpen className="w-3 h-3" />
                {vaultCount} {vaultCount === 1 ? "file" : "files"} in vault
              </span>
              <span className="text-[11px] text-slate-600">
                Opened {caseData.openedDate}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Status badge + Arrow */}
        <div className="flex flex-col items-end justify-between shrink-0">
          <div className="flex items-center gap-3">
            <Badge
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-lg ${statusStyle}`}
            >
              {caseData.case_result_status}
            </Badge>
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-purple-500/40 group-hover:bg-purple-500/10 transition-all duration-300">
              <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all duration-300" />
            </div>
          </div>
          {caseData.researchStatus && (
            <div className="flex items-center gap-1.5 mt-2 mr-1">
              <div className={`w-1.5 h-1.5 rounded-full ${caseData.researchStatus === 'processing' ? 'bg-amber-400 animate-pulse' : caseData.researchStatus === 'success' || caseData.researchStatus === 'completed' ? 'bg-emerald-400' : 'bg-slate-400'}`} />
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                {caseData.researchStatus === 'processing' ? 'In Progress' 
                 : (caseData.researchStatus === 'success' || caseData.researchStatus === 'completed') ? 'Completed' 
                 : caseData.researchStatus === 'pending' ? 'Pending' 
                 : caseData.researchStatus}
              </span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
};
