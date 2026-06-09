import { useEffect, useState } from "react";
import {
  Archive,
  Eye,
  Hourglass,
  Bell,
  Scale,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlertStore } from "@/store/alertStore";
import type { AlertItem } from "@/store/alertStore";
import { useCasesStore } from "@/store/casesStore";
import { AlertCard } from "@/components/CaseAlert/alert-card";

// Groups alerts by their case_id (null = uncategorised)
interface CaseGroup {
  caseId: number | null;
  caseName: string;
  alerts: AlertItem[];
}

function groupAlertsByCase(alerts: AlertItem[]): CaseGroup[] {
  const groupMap = new Map<number | null, CaseGroup>();

  for (const alert of alerts) {
    const key = alert.case_id;

    if (!groupMap.has(key)) {
      // Use the case_name from the API, fallback for null case_id
      const name = alert.case_name || (key ? `Case #${key}` : "General Alerts");
      groupMap.set(key, { caseId: key, caseName: name, alerts: [] });
    }

    groupMap.get(key)!.alerts.push(alert);
  }

  return Array.from(groupMap.values());
}

export const CaseAlertPage = () => {
  const { alerts, isLoading, fetchAlerts, markAsRead, archiveAll } =
    useAlertStore();
  const cases = useCasesStore((state) => state.cases);

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const researchingCases = cases.filter(
    (c) => c.researchStatus === "processing" || c.researchStatus === "pending",
  );
  const isResearching = researchingCases.length > 0;

  const urgentCount = alerts.filter(
    (a) => a.severity === "urgent" && a.status !== "archived",
  ).length;
  const strategicCount = alerts.filter(
    (a) => a.severity === "strategic" && a.status !== "archived",
  ).length;
  const routineCount = alerts.filter(
    (a) => a.severity === "routine" && a.status !== "archived",
  ).length;

  const visibleAlerts = alerts.filter((a) => a.status !== "archived");
  const caseGroups = groupAlertsByCase(visibleAlerts);

  return (
    <div className="min-h-screen bg-black text-slate-200 pt-5 font-sans selection:bg-purple-500/30 pb-30">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
            Command Center
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Intelligent alert synthesis for active case management.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={archiveAll}
          className="bg-[#0a0a0a] border-white/10 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl h-10 px-5 text-xs font-semibold tracking-wide"
        >
          <Archive className="w-4 h-4 mr-2" />
          Archive All
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left sidebar */}
        <div className="w-full lg:w-72 flex flex-col gap-6 shrink-0">
          {/* Active Vigilance card */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Active Vigilance
              </span>
              <Eye className="w-4 h-4 text-cyan-500" />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Urgent</span>
                <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/20 px-2 rounded-md font-bold">
                  {String(urgentCount).padStart(2, "0")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Strategic</span>
                <Badge className="bg-purple-500/20 text-purple-400 hover:bg-purple-500/20 px-2 rounded-md font-bold">
                  {String(strategicCount).padStart(2, "0")}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Routine</span>
                <Badge className="bg-slate-500/20 text-slate-400 hover:bg-slate-500/20 px-2 rounded-md font-bold">
                  {String(routineCount).padStart(2, "0")}
                </Badge>
              </div>
            </div>
          </div>

          {/* Deep Dig Status card */}
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 shadow-xl">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-5">
              Deep Dig Status
            </span>
            <div className="flex items-center gap-3 mb-4">
              <Hourglass
                className={`w-5 h-5 ${isResearching ? "text-purple-400 animate-spin" : "text-slate-600"}`}
              />
              <span className="text-sm font-semibold text-white">
                Background Research
              </span>
            </div>
            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-3">
              {isResearching ? (
                <div className="h-full bg-purple-500 rounded-full animate-pulse w-full" />
              ) : (
                <div className="h-full bg-green-500/60 rounded-full w-full" />
              )}
            </div>
            <span
              className="text-xs font-medium"
              style={{ color: isResearching ? "#a78bfa" : "#6b7280" }}
            >
              {isResearching
                ? `${researchingCases.length} case${researchingCases.length > 1 ? "s" : ""} in research`
                : "All research complete"}
            </span>
          </div>
        </div>

        {/* Right: Alert list grouped by case */}
        <div className="flex-1 flex flex-col gap-6">
          {/* Loading state — skeleton cards */}
          {isLoading && (
            <div className="flex flex-col gap-6">
              {(caseGroups.length > 0
                ? caseGroups
                : [
                    { caseId: "loading1", alerts: [1] },
                    { caseId: "loading2", alerts: [1, 2] },
                  ]
              ).map((group: any) => (
                <div key={group.caseId} className="flex flex-col gap-4">
                  {/* Skeleton case header — matches CaseGroupSection button layout */}
                  <div className="flex items-center gap-3">
                    <Skeleton className="w-8 h-8 rounded-xl bg-white/5" />
                    <Skeleton className="h-4 w-40 rounded-lg bg-white/5" />
                    <Skeleton className="h-5 w-14 rounded-md bg-white/5" />
                    <Skeleton className="h-3 w-16 rounded-md bg-white/5" />
                  </div>
                  {/* Skeleton alert cards — matches AlertCard layout exactly */}
                  {group.alerts.map((alert: any, idx: number) => (
                    <div
                      key={alert.id || idx}
                      className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6"
                    >
                      <div className="flex items-start gap-5">
                        <Skeleton className="w-12 h-12 rounded-xl bg-white/5 shrink-0 mt-1" />
                        <div className="flex-1 min-w-0">
                          {/* Title row: h3 text-xl + badge + timestamp */}
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <Skeleton className="h-7 w-56 rounded-lg bg-white/5" />
                            <div className="flex items-center gap-3 shrink-0">
                              <Skeleton className="h-5 w-16 rounded-md bg-white/5" />
                              <Skeleton className="h-3 w-12 rounded-md bg-white/5" />
                            </div>
                          </div>
                          {/* Summary lines — text-sm leading-relaxed */}
                          <div className="space-y-2 mb-5">
                            <Skeleton className="h-4 w-full rounded-lg bg-white/5" />
                            <Skeleton className="h-4 w-4/5 rounded-lg bg-white/5" />
                          </div>
                          {/* Action button */}
                          <Skeleton className="h-9 w-32 rounded-lg bg-white/5" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!isLoading && visibleAlerts.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
                <Bell className="w-8 h-8 text-slate-700" />
              </div>
              <p className="text-slate-500 text-sm font-medium">
                No alerts yet
              </p>
              <p className="text-slate-700 text-xs mt-1 max-w-xs">
                AI research alerts will appear here as background agents find
                relevant information for your cases.
              </p>
            </div>
          )}

          {/* Case-grouped alert cards */}
          {!isLoading &&
            caseGroups.map((group) => (
              <CaseGroupSection
                key={group.caseId ?? "general"}
                group={group}
                onMarkRead={markAsRead}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

// --- Case group collapsible section ---

interface CaseGroupSectionProps {
  group: CaseGroup;
  onMarkRead: (alertId: number) => void;
}

const CaseGroupSection = ({ group, onMarkRead }: CaseGroupSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const unreadCount = group.alerts.filter((a) => a.status === "unread").length;

  return (
    <div className="flex flex-col gap-4">
      {/* Case header — clickable to collapse/expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-3 group cursor-pointer"
      >
        {/* Case icon */}
        <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
          <Scale className="w-4 h-4 text-purple-400" />
        </div>

        {/* Case name */}
        <h2 className="text-sm font-bold text-white group-hover:text-purple-200 transition-colors">
          {group.caseName}
        </h2>

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <Badge className="bg-purple-500/15 text-purple-400 hover:bg-purple-500/15 px-2 py-0 h-5 text-[10px] font-bold rounded-md">
            {unreadCount} new
          </Badge>
        )}

        {/* Alert count */}
        <span className="text-[11px] text-slate-600 font-medium">
          {group.alerts.length} {group.alerts.length === 1 ? "alert" : "alerts"}
        </span>

        {/* Expand/collapse chevron */}
        <div className="ml-auto text-slate-600 group-hover:text-slate-400 transition-colors">
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </div>
      </button>

      {/* Alert cards within the group */}
      {isExpanded && (
        <div className="flex flex-col gap-4 pl-2">
          {group.alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onMarkRead={() => onMarkRead(alert.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

