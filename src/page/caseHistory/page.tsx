import { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  Ban,
  Scale,
  Users,
  FileText,
  Gavel,
  Building2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CaseCard, type CaseStatus } from "@/components/caseHistory/CaseCard";
import { StatsOverview } from "@/components/caseHistory/StatsOverview";
import { cn } from "@/lib/utils";

type TabType = "all" | "success" | "canceled" | "failed";

const cases = [
  {
    id: "882-J",
    caseName: "Miller vs. Apex Corporation",
    caseType: "Corporate Litigation",
    attorney: "Sarah Whitmore",
    openedDate: "Jan 12, 2023",
    closedDate: "Oct 24, 2023",
    outcome: "Settlement reached for $4.2M. Client obligations fulfilled. All exhibits archived in Vault.",
    reason: "Mediation revealed significant liability exposure on both sides. Settling avoided a costly trial and protected the client's public reputation while securing full financial recovery.",
    status: "success" as CaseStatus,
    icon: <Scale className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: "719-A",
    caseName: "Nakamura IP Licensing Review",
    caseType: "Intellectual Property",
    attorney: "James Okafor",
    openedDate: "Mar 5, 2023",
    closedDate: "Sep 18, 2023",
    outcome: "Licensing agreement signed. Royalty terms established for 5-year exclusivity window.",
    reason: "Our prior art documentation proved ownership conclusively. The competitor's legal team accepted licensing terms once the filing timeline was verified, avoiding an injunction.",
    status: "success" as CaseStatus,
    icon: <Search className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: "553-C",
    caseName: "Estate of Harrison — Probate",
    caseType: "Estate & Probate",
    attorney: "Elena Voss",
    openedDate: "Feb 20, 2023",
    closedDate: "Aug 30, 2023",
    outcome: "Estate distribution completed per will directive. Minor heir trust established with court approval.",
    reason: "Clear will documentation and cooperative beneficiaries enabled smooth probate proceedings. No contests were filed within the statutory window, allowing full distribution.",
    status: "success" as CaseStatus,
    icon: <Users className="w-5 h-5 text-emerald-400" />,
  },
  {
    id: "301-D",
    caseName: "Chen & Associates Merger Review",
    caseType: "M&A Advisory",
    attorney: "Marcus Bell",
    openedDate: "Apr 10, 2023",
    closedDate: "Jul 22, 2023",
    outcome: "Client withdrew from merger proceedings citing internal restructuring. Matter closed by mutual agreement.",
    reason: "Client's board voted against the merger before due diligence was completed due to internal budget constraints. No legal fault — a purely strategic business decision by the client.",
    status: "canceled" as CaseStatus,
    icon: <Building2 className="w-5 h-5 text-amber-400" />,
  },
  {
    id: "490-F",
    caseName: "Thornwood Zoning Dispute",
    caseType: "Real Estate",
    attorney: "Priya Chandran",
    openedDate: "May 3, 2023",
    closedDate: "Oct 1, 2023",
    outcome: "Case canceled after opposing party settled directly with municipality outside of counsel scope.",
    reason: "The municipality offered the opposing party direct concessions outside of legal proceedings without notifying counsel. This rendered further legal representation unnecessary.",
    status: "canceled" as CaseStatus,
    icon: <FileText className="w-5 h-5 text-amber-400" />,
  },
  {
    id: "641-G",
    caseName: "Global Logistics vs. Port Authority",
    caseType: "Contract Dispute",
    attorney: "Daniel Reyes",
    openedDate: "Jun 8, 2023",
    closedDate: "Nov 14, 2023",
    outcome: "Judgment ruled against client. Port Authority awarded $1.1M in damages. Appeal options reviewed and declined.",
    reason: "A key contract clause was deemed ambiguous under maritime law. The court's interpretation favored the Port Authority's reading. Appeal cost-benefit analysis did not justify further proceedings.",
    status: "failed" as CaseStatus,
    icon: <Gavel className="w-5 h-5 text-red-400" />,
  },
  {
    id: "278-H",
    caseName: "Cyberdyne Patent Infringement",
    caseType: "Patent Litigation",
    attorney: "Sarah Whitmore",
    openedDate: "Jan 28, 2023",
    closedDate: "Sep 5, 2023",
    outcome: "Patent claims invalidated during trial. Client's prior art defense insufficient. Case closed unfavorably.",
    reason: "Opposing counsel submitted prior art that pre-dated the client's filing by 11 months. This invalidated the core patent claims during trial, and no viable rebuttal evidence was available.",
    status: "failed" as CaseStatus,
    icon: <XCircle className="w-5 h-5 text-red-400" />,
  },
];

const tabs: { key: TabType; label: string; icon: React.ReactNode; activeClass: string }[] = [
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
    key: "canceled",
    label: "Canceled",
    icon: <Ban className="w-3.5 h-3.5" />,
    activeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    key: "failed",
    label: "Failed",
    icon: <XCircle className="w-3.5 h-3.5" />,
    activeClass: "bg-red-500/10 text-red-400 border-red-500/30",
  },
];

const successCount = cases.filter((c) => c.status === "success").length;
const canceledCount = cases.filter((c) => c.status === "canceled").length;
const failedCount = cases.filter((c) => c.status === "failed").length;

export const CaseHistoryPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("all");

  const filtered =
    activeTab === "all" ? cases : cases.filter((c) => c.status === activeTab);

  return (
    <div className="min-h-screen bg-black text-slate-200 p-8 md:p-5 font-sans selection:bg-purple-500/30 pb-36">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-2">
          Case History
        </h1>
        <p className="text-slate-400 text-sm">
          Complete record of resolved, canceled, and failed cases.
        </p>
      </div>

      {/* Stats */}
      <StatsOverview
        successCount={successCount}
        canceledCount={canceledCount}
        failedCount={failedCount}
        total={cases.length}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant="outline"
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "h-9 px-4 rounded-xl text-xs font-bold tracking-wide border gap-1.5 transition-all",
              activeTab === tab.key
                ? tab.activeClass
                : "bg-[#0a0a0a] border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
            )}
          >
            {tab.icon}
            {tab.label}
            <Badge
              className={cn(
                "ml-1 px-1.5 py-0 h-4 text-[9px] font-black rounded border-0",
                activeTab === tab.key ? "bg-white/20 text-current" : "bg-white/5 text-slate-500"
              )}
            >
              {tab.key === "all"
                ? cases.length
                : tab.key === "success"
                ? successCount
                : tab.key === "canceled"
                ? canceledCount
                : failedCount}
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
