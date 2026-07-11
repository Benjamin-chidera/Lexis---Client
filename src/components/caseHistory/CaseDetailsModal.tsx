import { useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  MessageSquare,
  Bell,
  Bot,
  User,
  AlertTriangle,
  Search,
  Activity,
  Brain,
  FileText,
  X,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogOverlay,
  AlertDialogPortal,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCasesStore } from "@/store/casesStore";
import { useAlertStore } from "@/store/alertStore";
import type { ChatMessage } from "@/store/casesStore";
import type { AlertItem, AlertSeverity } from "@/store/alertStore";
import type { CaseStatus } from "./CaseCard";

// ---------- Severity style map for alert cards inside the modal ----------
const SEVERITY_STYLES: Record<
  AlertSeverity,
  {
    border: string;
    iconBg: string;
    badge: string;
    badgeLabel: string;
    icon: React.ReactNode;
  }
> = {
  urgent: {
    border: "border-red-500/30",
    iconBg: "bg-red-500/20 border-red-500/30",
    badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    badgeLabel: "Urgent",
    icon: <AlertTriangle className="w-4 h-4 text-red-400" />,
  },
  strategic: {
    border: "border-purple-500/20",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    badge: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    badgeLabel: "Strategic",
    icon: <Search className="w-4 h-4 text-purple-400" />,
  },
  routine: {
    border: "border-cyan-500/20",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    badge: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    badgeLabel: "Routine",
    icon: <Activity className="w-4 h-4 text-cyan-400" />,
  },
};

// ---------- Status accent colour ----------
const STATUS_ACCENT: Record<CaseStatus, string> = {
  success: "text-emerald-400",
  closed: "text-amber-400",
  abandoned: "text-red-400",
};

// ---------- Props ----------
interface CaseDetailsModalProps {
  open: boolean;
  onClose: () => void;
  caseId: string;
  caseName: string;
  status: CaseStatus;
}

// ---------- Component ----------
export const CaseDetailsModal = ({
  open,
  onClose,
  caseId,
  caseName,
  status,
}: CaseDetailsModalProps) => {
  const caseData = useCasesStore((state) =>
    state.cases.find((c) => c.id === caseId),
  );
  const loadMessages = useCasesStore((state) => state.loadMessages);

  const allAlerts = useAlertStore((state) => state.alerts);
  const fetchAlerts = useAlertStore((state) => state.fetchAlerts);

  // Fetch messages and alerts when the modal opens
  useEffect(() => {
    if (!open) return;
    loadMessages(caseId);
    fetchAlerts();
  }, [open, caseId, loadMessages, fetchAlerts]);

  const messages: ChatMessage[] = caseData?.messages ?? [];

  // Filter alerts belonging to this case (case_id is stored as a number)
  const caseAlerts: AlertItem[] = allAlerts.filter(
    (a) => String(a.case_id) === caseId,
  );

  return (
    <AlertDialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <AlertDialogPortal>
        <AlertDialogOverlay className="bg-black/60 backdrop-blur-sm" />
        <div
          data-slot="alert-dialog-content"
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div className="w-full max-w-7xl max-h-[85vh] flex flex-col bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in-0 zoom-in-95 duration-200">
            {/* ─── Header ─── */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <FileText
                  className={`w-5 h-5 shrink-0 ${STATUS_ACCENT[status]}`}
                />
                <h2 className="text-base font-bold text-white truncate">
                  {caseName}
                </h2>
                <span className="text-slate-500 text-xs font-mono shrink-0">
                  #{caseId}
                </span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-slate-400 hover:text-white h-8 w-8 rounded-lg shrink-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* ─── Tabs ─── */}
            <Tabs
              defaultValue="chat"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="px-5 pt-3 pb-0 border-b border-white/5 shrink-0">
                <TabsList className="bg-transparent border-0 p-0 h-auto gap-4 w-full justify-start">
                  <TabsTrigger
                    value="chat"
                    className="rounded-none border-b-2 border-transparent px-1 pb-2.5 text-xs font-bold tracking-wide text-slate-400 data-[state=active]:text-white data-[state=active]:border-purple-500 transition-colors flex items-center gap-2"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    Chat History
                    <Badge className="bg-white/5 text-slate-500 border-0 text-[0.5625rem] font-black h-4 px-1.5 py-0">
                      {messages.length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger
                    value="alerts"
                    className="rounded-none border-b-2 border-transparent px-1 pb-2.5 text-xs font-bold tracking-wide text-slate-400 data-[state=active]:text-white data-[state=active]:border-purple-500 transition-colors flex items-center gap-2"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    Alert Results
                    <Badge className="bg-white/5 text-slate-500 border-0 text-[0.5625rem] font-black h-4 px-1.5 py-0">
                      {caseAlerts.length}
                    </Badge>
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* ─── Chat Tab ─── */}
              <TabsContent
                value="chat"
                className="flex-1 overflow-y-auto m-0 p-0"
              >
                <ChatPanel messages={messages} caseId={caseId} />
              </TabsContent>

              {/* ─── Alerts Tab ─── */}
              <TabsContent
                value="alerts"
                className="flex-1 overflow-y-auto m-0 p-0"
              >
                <AlertsPanel alerts={caseAlerts} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </AlertDialogPortal>
    </AlertDialog>
  );
};

// ────────────────────────────────────────────────────────────
// Chat Panel — renders the conversation between user & Lexi
// ────────────────────────────────────────────────────────────
const ChatPanel = ({ messages, caseId }: { messages: ChatMessage[]; caseId: string }) => {
  const vault = useCasesStore(
    (state) => state.cases.find((c) => c.id === caseId)?.vault ?? []
  );

  const handleCitationClick = (filename: string) => {
    const cleanName = (name: string) => {
      try {
        return decodeURIComponent(name)
          .replace(/^(image|pdf|file|document|url):\s*/i, "")
          .trim()
          .toLowerCase();
      } catch {
        return name
          .replace(/^(image|pdf|file|document|url):\s*/i, "")
          .trim()
          .toLowerCase();
      }
    };

    const target = cleanName(filename);
    const match = vault.find((v) => {
      const vName = cleanName(v.name);
      return vName.includes(target) || target.includes(vName);
    });

    if (match?.url) {
      window.open(match.url, "_blank", "noopener,noreferrer");
    } else {
      console.warn("No match found in vault for citation:", filename, "target:", target);
    }
  };

  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <MessageSquare className="w-8 h-8 mb-3 opacity-30" />
        <p className="text-sm font-medium">No chat messages for this case</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 p-4">
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex gap-3 py-3 px-3 rounded-xl transition-colors ${
            msg.role === "ai"
              ? "bg-white/2"
              : ""
          }`}
        >
          {/* Avatar */}
          <div
            className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center mt-0.5 border ${
              msg.role === "ai"
                ? "bg-purple-500/10 border-purple-500/20"
                : "bg-white/5 border-white/10"
            }`}
          >
            {msg.role === "ai" ? (
              <Bot className="w-3.5 h-3.5 text-purple-400" />
            ) : (
              <User className="w-3.5 h-3.5 text-slate-400" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-xs font-bold ${
                  msg.role === "ai" ? "text-purple-400" : "text-white"
                }`}
              >
                {msg.role === "ai" ? "Lexi" : "You"}
              </span>
              <span className="text-[0.625rem] text-slate-600">
                {msg.timestamp}
              </span>
            </div>

            {msg.role === "ai" ? (
              <div className="text-slate-300 text-sm leading-relaxed prose prose-invert prose-sm max-w-none wrap-break-word">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="text-slate-300 mb-2">{children}</p>
                    ),
                    strong: ({ children }) => (
                      <strong className="text-white font-semibold">
                        {children}
                      </strong>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 underline underline-offset-2 break-all"
                      >
                        {children}
                      </a>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-inside space-y-1 text-slate-300 mb-2">
                        {children}
                      </ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 mb-2">
                        {children}
                      </ol>
                    ),
                    code: ({ children }) => (
                      <code className="bg-white/5 text-slate-300 text-xs px-1 py-0.5 rounded font-mono break-all">
                        {children}
                      </code>
                    ),
                  }}
                >
                  {msg.content}
                </ReactMarkdown>
              </div>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed wrap-break-word">
                {msg.content}
              </p>
            )}

            {/* Citation badge */}
            {msg.citation && (
              <div
                onClick={() => handleCitationClick(msg.citation!.filename)}
                className="mt-2 inline-flex items-center gap-1.5 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[0.625rem] font-bold px-2 py-1 rounded-md max-w-full min-w-0 cursor-pointer hover:bg-cyan-500/20 hover:border-cyan-500/40 transition-all"
              >
                <FileText className="w-3 h-3 shrink-0" />
                <span className="truncate" title={msg.citation.filename}>
                  {msg.citation.filename}
                </span>
                {msg.citation.page && <span className="shrink-0"> — p.{msg.citation.page}</span>}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Alerts Panel — renders the research result alerts for the case
// ────────────────────────────────────────────────────────────
const AlertsPanel = ({ alerts }: { alerts: AlertItem[] }) => {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500">
        <Bell className="w-8 h-8 mb-3 opacity-30" />
        <p className="text-sm font-medium">No alert results for this case</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">
      {alerts.map((alert) => {
        const style =
          SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.routine;

        return (
          <div
            key={alert.id}
            className={`bg-white/2 border rounded-xl p-4 transition-all ${style.border}`}
          >
            {/* Header row */}
            <div className="flex items-start gap-3 mb-2">
              <div
                className={`w-8 h-8 shrink-0 rounded-lg flex items-center justify-center border ${style.iconBg}`}
              >
                {style.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-sm font-bold text-white leading-snug">
                    {alert.title}
                  </h4>
                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      className={`px-1.5 py-0.5 rounded text-[0.5rem] font-black uppercase tracking-widest ${style.badge}`}
                    >
                      {style.badgeLabel}
                    </Badge>
                    {alert.review_status === "accepted" && (
                      <Badge className="bg-green-500/10 text-green-400 border border-green-500/20 px-1.5 py-0.5 rounded text-[0.5rem] font-black uppercase tracking-widest">
                        Accepted
                      </Badge>
                    )}
                    {alert.review_status === "rejected" && (
                      <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded text-[0.5rem] font-black uppercase tracking-widest">
                        Rejected
                      </Badge>
                    )}
                  </div>
                </div>
                <span className="text-[0.625rem] text-slate-600 mt-0.5 block">
                  {formatRelativeTime(alert.created_at)}
                </span>
              </div>
            </div>

            {/* Summary */}
            <div className="text-slate-400 text-xs leading-relaxed pl-11 prose prose-invert prose-sm max-w-none wrap-break-word">
              <ReactMarkdown
                components={{
                  p: ({ children }) => (
                    <p className="text-slate-400 mb-1.5">{children}</p>
                  ),
                  strong: ({ children }) => (
                    <strong className="text-white font-semibold">
                      {children}
                    </strong>
                  ),
                  a: ({ href, children }) => (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-400 hover:text-purple-300 underline underline-offset-2 break-all"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-0.5 text-slate-400 mb-1.5">
                      {children}
                    </ul>
                  ),
                  code: ({ children }) => (
                    <code className="bg-white/5 text-slate-300 text-xs px-1 py-0.5 rounded font-mono break-all">
                      {children}
                    </code>
                  ),
                }}
              >
                {alert.summary}
              </ReactMarkdown>
            </div>

            {/* AI Reasoning hint */}
            {alert.ai_reasoning && (
              <div className="mt-2 pl-11 flex items-start gap-1.5 text-[0.625rem] text-slate-600">
                <Brain className="w-3 h-3 mt-px shrink-0 text-purple-500/50" />
                <span className="line-clamp-2">{alert.ai_reasoning}</span>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

// ---------- Utility ----------
function formatRelativeTime(isoString: string): string {
  const isNaive =
    !isoString.endsWith("Z") &&
    !isoString.includes("+") &&
    !isoString.match(/-\d{2}:\d{2}$/);
  const date = new Date(isNaive ? `${isoString}Z` : isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}
