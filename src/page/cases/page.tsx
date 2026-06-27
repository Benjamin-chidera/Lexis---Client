import { useState, useEffect } from "react";
import { FolderOpen, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useCasesStore } from "@/store/casesStore";
import { CaseListCard } from "./CaseListCard";
import { CaseModal } from "./CaseModal";
import { CallModal } from "./CallModal";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

type FilterTab = "all" | "active" | "archived" | "closed";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "archived", label: "Archived" },
  { key: "closed", label: "Closed" },
];

const CasesPage = () => {
  const cases = useCasesStore((state) => state.cases);
  const openCase = useCasesStore((state) => state.openCase);
  const fetchCases = useCasesStore((state) => state.fetchCases);
  const isLoading = useCasesStore((state) => state.isLoading);
  const [activeFilter, setActiveFilter] = useState<FilterTab>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate(); 

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Filter by status tab
  const filteredByTab =
    activeFilter === "all"
      ? cases
      : cases.filter((c) => c.status === activeFilter);

  // Further filter by search query (name, case type, or attorney)
  const visibleCases = filteredByTab.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.caseType.toLowerCase().includes(query) ||
      c.attorney.toLowerCase().includes(query)
    );
  });

  // Count per filter tab
  const countFor = (filter: FilterTab) => {
    if (filter === "all") return cases.length;
    return cases.filter((c) => c.status === filter).length;
  };

  return (
    // The page itself fills the screen height and does NOT scroll —
    // only the case list inside scrolls.
    <div className="h-screen bg-black flex flex-col text-slate-200 font-sans selection:bg-purple-500/30 overflow-hidden">
      {/* Case detail modal — renders as a dialog overlay */}
      <CaseModal />

      {/* Call session modal — renders as a dialog overlay */}
      <CallModal />

      {/* ── Fixed header ── */}
      <div className="shrink-0-6 pt-5 pb-4 md:px-10 bg-transparent">
        {/* Page title row */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight mb-1">Cases</h1>
            <p className="text-slate-500 text-sm">
              Your active and archived case workspaces
            </p>
          </div>

          <Button className="bg-white hover:bg-zinc-200 text-black border border-white/20 rounded-xl px-5 h-10 gap-2 font-bold shadow-lg shadow-purple-500/20 text-sm"  onClick={() => navigate("/")}> 
            <Plus className="w-4 h-4" />
            New Case
          </Button>
        </div>

        {/* Search + Filter row — also fixed */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {/* Search input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search cases..."
              className="bg-white/3 border-white/10 pl-9 h-9 text-sm text-slate-200 placeholder:text-slate-600 rounded-xl focus:border-purple-500/40 focus:ring-0"
            />
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <Button
                key={tab.key}
                variant="outline"
                size="sm"
                onClick={() => setActiveFilter(tab.key)}
                className={cn(
                  "h-0.5625rem-4 rounded-xl text-xs font-bold tracking-wide border gap-2 transition-all",
                  activeFilter === tab.key
                    ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                    : "bg-[#0a0a0a] border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {tab.label}
                <Badge
                  className={cn(
                    "ml-0-1.5 py-0 h-4 text-[0.5625rem] font-black rounded border-0",
                    activeFilter === tab.key
                      ? "bg-purple-500/20 text-purple-300"
                      : "bg-white/5 text-slate-500"
                  )}
                >
                  {countFor(tab.key)}
                </Badge>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scrollable case list ── */}
      {/* flex-1 + overflow-y-auto makes this section fill remaining height and scroll */}
      <div className="flex-1 overflow-y-auto px-6 pb-36 md:px-10 custom-scrollbar">
        {!isLoading && visibleCases.length > 0 && (
          <div className="flex flex-col gap-3 pt-2">
            {visibleCases.map((caseData) => (
              <CaseListCard
                key={caseData.id}
                caseData={caseData}
                onClick={() => openCase(caseData.id)}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && visibleCases.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-slate-600">
            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
              <FolderOpen className="w-7 h-7 opacity-30" />
            </div>
            <p className="text-sm font-medium">No cases found</p>
            <p className="text-xs mt-1 text-slate-700">
              Try adjusting your search or filter
            </p>
          </div>
        )}

        {/* Loading state — skeleton cards */}
        {isLoading && (
          <div className="flex flex-col gap-3 pt-2">
            {Array.from({ length: cases.length || 3 }).map((_, i) => (
              <div
                key={i}
                className="w-full bg-white/2 border border-white/6 rounded-2xl p-6"
              >
                <div className="flex justify-between gap-4">
                  {/* Left: icon + text skeleton */}
                  <div className="flex items-start gap-4">
                    <Skeleton className="w-11 h-11 rounded-xl bg-white/5 shrink-0" />
                    <div>
                      <Skeleton className="h-5 w-48 rounded-lg bg-white/5 mb-1" />
                      <Skeleton className="h-3 w-36 rounded-lg bg-white/5 mb-3" />
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-3 w-24 rounded-lg bg-white/5" />
                        <Skeleton className="h-3 w-28 rounded-lg bg-white/5" />
                        <Skeleton className="h-3 w-20 rounded-lg bg-white/5" />
                      </div>
                    </div>
                  </div>
                  {/* Right: badge + arrow on top, research status on bottom — matches actual card layout */}
                  <div className="flex flex-col items-end justify-between shrink-0">
                    <div className="flex items-center gap-3">
                      <Skeleton className="h-7 w-16 rounded-lg bg-white/5" />
                      <Skeleton className="w-8 h-8 rounded-full bg-white/5" />
                    </div>
                    <Skeleton className="h-3 w-20 rounded-lg bg-white/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Custom scrollbar styles scoped to this page */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0.3125rem; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 0.625rem; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
      `}</style>
    </div>
  );
};

export default CasesPage;
