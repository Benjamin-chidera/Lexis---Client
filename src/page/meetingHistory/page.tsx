import { useState } from "react";
import {
  Scale,
  Users,
  FileText,
  Search,
  ChevronDown,
  RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { SessionCard } from "@/components/meetingHistory/SessionCard";
import { FilterBar } from "@/components/meetingHistory/FilterBar";

type FilterType = "all" | "date" | "deposition" | "settlement" | "strategic";

const sessions = [
  {
    id: "1",
    caseName: "Miller vs. Apex Corp",
    caseType: "SETTLEMENT",
    caseTypeBg: "bg-slate-500/20",
    caseTypeColor: "text-slate-300",
    date: "Oct 24, 2023",
    time: "14:00",
    participantCount: 2,
    status: "ready" as const,
    hasTranscript: true,
    hasInsights: true,
    accent: null,
    icon: <Scale className="w-5 h-5 text-rose-400" />,
    iconBg: "bg-rose-500/10 border border-rose-500/20",
    filterKey: "settlement",
  },
  {
    id: "2",
    caseName: "Estate of Harrison — Internal",
    caseType: "STRATEGIC",
    caseTypeBg: "bg-purple-500/20",
    caseTypeColor: "text-purple-300",
    date: "Oct 22, 2023",
    time: "09:30",
    participantCount: 2,
    status: "ready" as const,
    hasTranscript: true,
    hasInsights: false,
    accent: "red" as const,
    icon: <Users className="w-5 h-5 text-purple-400" />,
    iconBg: "bg-purple-500/10 border border-purple-500/20",
    filterKey: "strategic",
  },
  {
    id: "3",
    caseName: "Global Logistics vs. Port Auth",
    caseType: "DEPOSITION",
    caseTypeBg: "bg-blue-500/20",
    caseTypeColor: "text-blue-300",
    date: "Oct 20, 2023",
    time: "11:15",
    participantCount: 2,
    status: "processing" as const,
    hasTranscript: false,
    hasInsights: false,
    accent: null,
    icon: <FileText className="w-5 h-5 text-blue-400" />,
    iconBg: "bg-blue-500/10 border border-blue-500/20",
    filterKey: "deposition",
  },
  {
    id: "4",
    caseName: "Cyberdyne Patent Inquiry",
    caseType: "QUERY",
    caseTypeBg: "bg-cyan-500/20",
    caseTypeColor: "text-cyan-300",
    date: "Oct 18, 2023",
    time: "15:30",
    participantCount: 2,
    status: "ready" as const,
    hasTranscript: true,
    hasInsights: true,
    accent: null,
    icon: <Search className="w-5 h-5 text-cyan-400" />,
    iconBg: "bg-cyan-500/10 border border-cyan-500/20",
    filterKey: "deposition",
  },
  {
    id: "5",
    caseName: "Nakamura IP Licensing Review",
    caseType: "STRATEGIC",
    caseTypeBg: "bg-purple-500/20",
    caseTypeColor: "text-purple-300",
    date: "Oct 15, 2023",
    time: "10:00",
    participantCount: 3,
    status: "ready" as const,
    hasTranscript: true,
    hasInsights: true,
    accent: null,
    icon: <Scale className="w-5 h-5 text-purple-400" />,
    iconBg: "bg-purple-500/10 border border-purple-500/20",
    filterKey: "strategic",
  },
  {
    id: "6",
    caseName: "Reynolds & Co. Deposition — Day 2",
    caseType: "DEPOSITION",
    caseTypeBg: "bg-blue-500/20",
    caseTypeColor: "text-blue-300",
    date: "Oct 12, 2023",
    time: "08:45",
    participantCount: 2,
    status: "processing" as const,
    hasTranscript: false,
    hasInsights: false,
    accent: null,
    icon: <FileText className="w-5 h-5 text-blue-400" />,
    iconBg: "bg-blue-500/10 border border-blue-500/20",
    filterKey: "deposition",
  },
];

export const MeetingHistoryPage = () => {
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");

  const filtered = sessions.filter((s) => {
    if (activeFilter === "all" || activeFilter === "date") return true;
    return s.filterKey === activeFilter;
  });

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8 md:p-12 font-sans selection:bg-purple-500/30 pb-36">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
            Meeting Archive
          </h1>
          <div className="flex items-center gap-3">
            <Badge className="bg-purple-500/20 text-purple-300 border border-purple-500/30 font-black text-[10px] tracking-widest uppercase px-3 py-1 rounded-full">
              128 Sessions Found
            </Badge>
            <span className="flex items-center gap-1.5 text-slate-500 text-sm">
              <span className="w-1 h-1 rounded-full bg-slate-600" />
              Updated 2 minutes ago
            </span>
          </div>
        </div>

        <div className="flex flex-col items-end gap-3">
          <FilterBar activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          <button className="flex items-center gap-1.5 text-slate-500 hover:text-slate-300 text-xs transition-colors self-end">
            <RefreshCw className="w-3 h-3" />
            Refresh
          </button>
        </div>
      </div>

      {/* Session List */}
      <div className="flex flex-col gap-3">
        {filtered.map((session) => (
          <SessionCard key={session.id} {...session} />
        ))}
      </div>

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500">
          <FileText className="w-10 h-10 mb-4 opacity-30" />
          <p className="text-sm font-medium">No sessions match this filter</p>
        </div>
      )}

      {/* Load More */}
      <div className="flex justify-center mt-10">
        <Button
          variant="outline"
          className="bg-[#0a0a0a] border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-2xl h-11 px-8 text-sm font-bold tracking-wide gap-2"
        >
          Load More Archives
          <ChevronDown className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
