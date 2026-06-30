import { useState, useEffect, useMemo } from "react";
import { CheckCircle2, XCircle, Ban, Scale, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaseCard, type CaseStatus } from "@/components/caseHistory/CaseCard";
import { StatsOverview } from "@/components/caseHistory/StatsOverview";
import { useCasesStore } from "@/store/casesStore";
import { cn } from "@/lib/utils";

type TabType = "all" | "success" | "closed" | "abandoned";

const tabs: {
  key: TabType;
  label: string;
  icon: React.ReactNode;
  activeClass: string;
}[] = [
  {
    key: "all",
    label: "All Cases",
    icon: null,
    activeClass: "bg-white/10 text-white border-white/20",
  },
  {
    key: "success",
    label: "Successful",
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    activeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    key: "closed",
    label: "Closed",
    icon: <Ban className="w-3.5 h-3.5" />,
    activeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    key: "abandoned",
    label: "Abandoned",
    icon: <XCircle className="w-3.5 h-3.5" />,
    activeClass: "bg-red-500/10 text-red-400 border-red-500/30",
  },
];

// Resolve which CaseCard icon to show based on status
const STATUS_ICONS: Record<CaseStatus, React.ReactNode> = {
  success: <Scale className="w-5 h-5 text-emerald-400" />,
  closed: <Ban className="w-5 h-5 text-amber-400" />,
  abandoned: <XCircle className="w-5 h-5 text-red-400" />,
};

export const CaseHistoryPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");
  const allCases = useCasesStore((state) => state.cases);
  const fetchCases = useCasesStore((state) => state.fetchCases);

  // Fetch cases on mount so history is always up to date
  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Only show resolved cases (not active)
  const historyCases = useMemo(() => {
    const HISTORY_STATUSES: CaseStatus[] = ["success", "closed", "abandoned"];
    return allCases
      .filter((c) =>
        HISTORY_STATUSES.includes(c.case_result_status as CaseStatus),
      )
      .map((c) => ({
        id: c.id,
        caseName: c.name,
        caseType: c.caseType,
        attorney: c.attorney,
        openedDate: c.openedDate,
        closedDate: c.openedDate, // we don't track a separate close date yet
        outcome: c.case_result_reason ?? "No details recorded.",
        reason: c.case_result_reason ?? "No reason provided.",
        status: c.case_result_status as CaseStatus,
        icon:
          STATUS_ICONS[c.case_result_status as CaseStatus] ??
          STATUS_ICONS.closed,
      }));
  }, [allCases]);

  const successCount = historyCases.filter(
    (c) => c.status === "success",
  ).length;
  const closedCount = historyCases.filter((c) => c.status === "closed").length;
  const abandonedCount = historyCases.filter(
    (c) => c.status === "abandoned",
  ).length;

  const filtered =
    activeTab === "all"
      ? historyCases
      : historyCases.filter((c) => c.status === activeTab);

  return (
    <div className="min-h-screen bg-black text-slate-200 pt-17 font-sans selection:bg-purple-500/30 pb-36">
      {/* Hide scrollbar styles */}
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      {/* Header */}
      <div className="mb-3 md:mb-10">
        <h1 className=" text-xl md:text-4xl font-bold text-white tracking-tight mb-2">
          Case History
        </h1>
        <p className="text-slate-400 text-xs md:text-sm">
          Complete record of resolved, closed, and abandoned cases.
        </p>
      </div>

      {/* Stats */}
      <StatsOverview
        successCount={successCount}
        closedCount={closedCount}
        abandonedCount={abandonedCount}
        total={historyCases.length}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-3 overflow-x-auto no-scrollbar flex-nowrap pb-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant="outline"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "h-10 w-36 md:w-40 rounded-xl text-xs font-bold tracking-wide border gap-1.5 transition-all shrink-0",
              activeTab === tab.key
                ? tab.activeClass
                : "bg-[#0a0a0a] border-white/10 text-slate-400 hover:text-white hover:bg-white/5",
            )}
          >
            {tab.icon}
            {tab.label}
            <Badge
              className={cn(
                "ml-1.5 py-0 h-4 text-[0.5625rem] font-black rounded border-0",
                activeTab === tab.key
                  ? "bg-white/20 text-current"
                  : "bg-white/5 text-slate-500",
              )}
            >
              {tab.key === "all"
                ? historyCases.length
                : tab.key === "success"
                  ? successCount
                  : tab.key === "closed"
                    ? closedCount
                    : abandonedCount}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Cases List */}
      <div className="flex flex-col gap-4">
        {filtered.map((c) => (
          <CaseCard key={c.id} {...c} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <FileText className="w-10 h-10 mb-4 opacity-30" />
          <p className="text-sm font-medium">No cases in this category</p>
        </div>
      )}
    </div>
  );
};
