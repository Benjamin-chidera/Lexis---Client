import { useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  AlertTriangle,
  Search,
  Activity,
  Brain,
  Check,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAlertStore } from "@/store/alertStore";
import type { AlertItem } from "@/store/alertStore";
import { ReasonForRejectingModal } from "./reason-for-rejecting";

// Style maps per severity level
const SEVERITY_STYLES = {
  urgent: {
    border: "border-red-500/30 hover:border-red-500/50",
    iconBg: "bg-red-500/20 border-red-500/30",
    badge: "bg-red-500/10 text-red-400 border border-red-500/20",
    badgeLabel: "Urgent",
    icon: <AlertTriangle className="w-6 h-6 text-red-400" />,
    actionBg:
      "bg-red-600 hover:bg-red-500 shadow-[0_0_0.9375rem_rgba(220,38,38,0.3)]",
  },
  strategic: {
    border: "border-white/5 hover:border-purple-500/30",
    iconBg: "bg-purple-500/10 border-purple-500/20",
    badge: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    badgeLabel: "Strategic",
    icon: <Search className="w-6 h-6 text-purple-400" />,
    actionBg:
      "bg-white hover:bg-zinc-200 text-black border border-white/20 shadow-[0_0_0.9375rem_rgba(147,51,234,0.3)]",
  },
  routine: {
    border: "border-white/5 hover:border-cyan-500/30",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    badge: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    badgeLabel: "Routine",
    icon: <Activity className="w-6 h-6 text-cyan-400" />,
    actionBg: "bg-cyan-700 hover:bg-cyan-600",
  },
};

interface AlertCardProps {
  alert: AlertItem;
  onMarkRead: () => void;
}

export const AlertCard = ({ alert, onMarkRead }: AlertCardProps) => {
  const style = SEVERITY_STYLES[alert.severity] ?? SEVERITY_STYLES.routine;
  const isUnread = alert.status === "unread";
  const [showReasoning, setShowReasoning] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  const acceptAlert = useAlertStore((state) => state.acceptAlert);
  const rejectAlert = useAlertStore((state) => state.rejectAlert);

  // Only show accept/reject buttons when the alert hasn't been reviewed yet
  const isPendingReview = alert.review_status === "pending";
  const isAccepted = alert.review_status === "accepted";
  const isRejected = alert.review_status === "rejected";

  const handleAccept = async () => {
    await acceptAlert(alert.id);
    toast.success("Research result accepted.");
  };

  const handleRejectSubmit = async (reason: string) => {
    setIsRejectModalOpen(false);
    await rejectAlert(alert.id, reason);
    toast.info("Research rejected — Lexi is re-running with your feedback.");
  };

  return (
    <>
      <div
        className={`bg-[#0a0a0a] border rounded-2xl p-6 shadow-xl relative group transition-all overflow-hidden ${style.border} ${isUnread ? "shadow-[0_0_0_0.0625rem_rgba(168,85,247,0.05)]" : ""} `}
      >
        {/* Unread dot */}
        {isUnread && (
          <span className="absolute top-4 right-4 w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
        )}

        <div className="flex items-start gap-5">
          {/* Icon */}
          <div
            className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center border mt-1 ${style.iconBg}`}
          >
            {style.icon}
          </div>

          <div className="flex-1 min-w-0">
            {/* Title + badge row */}
            <div className="flex items-start justify-between gap-4 mb-2">
              <h3 className="text-xl font-bold text-white truncate">
                {alert.title}
              </h3>
              <div className="flex items-center gap-3 shrink-0">
                {/* Brain icon — hover shows AI reasoning popup */}
                <div
                  className="relative"
                  onMouseEnter={() => setShowReasoning(true)}
                  onMouseLeave={() => setShowReasoning(false)}
                >
                  <Brain
                    className={`w-4 h-4 cursor-pointer transition-opacity ${alert.ai_reasoning ? "opacity-100" : "opacity-30"} ${style.badge} border-none`}
                  />

                  {showReasoning && alert.ai_reasoning && (
                    <div className="absolute right-0 top-6 z-50 w-80 bg-[#111] border border-white/10 rounded-xl shadow-2xl p-4">
                      <p className="text-[0.625rem] font-black text-purple-400 uppercase tracking-widest mb-2">
                        Why this matters
                      </p>
                      <p className="text-slate-300 text-xs leading-relaxed">
                        {alert.ai_reasoning}
                      </p>
                    </div>
                  )}
                </div>

                <Badge
                  className={`px-2.5 py-0.5 rounded-md text-[0.625rem] font-black uppercase tracking-widest ${style.badge}`}
                >
                  {style.badgeLabel}
                </Badge>

                <span className="text-[0.6875rem] font-medium text-slate-500">
                  {formatRelativeTime(alert.created_at)}
                </span>
              </div>
            </div>

            {/* Accept / Reject actions — only shown when pending review */}
            {isPendingReview && (
              <div className="flex justify-end gap-2 mb-2">
                <button
                  onClick={handleAccept}
                  title="Accept research result"
                  className="hover:bg-green-400/15 p-2 rounded-lg hover:scale-110 transition-all cursor-pointer"
                >
                  <Check className="w-5 h-5" color="#4ade80" />
                </button>

                <button
                  onClick={() => setIsRejectModalOpen(true)}
                  title="Reject research result"
                  className="hover:bg-red-400/15 p-2 rounded-lg hover:scale-110 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" color="#f43f5e" />
                </button>
              </div>
            )}

            {/* Review status badge — shown after the attorney has decided */}
            {isAccepted && (
              <div className="flex justify-end mb-2">
                <Badge className="bg-green-500/10 text-green-400 border border-green-500/1.25rem-2.5 py-0.5 rounded-md text-[0.625rem] font-black uppercase tracking-widest">
                  Accepted
                </Badge>
              </div>
            )}
            {isRejected && (
              <div className="flex justify-end mb-2">
                <Badge className="bg-red-500/10 text-red-400 border border-red-500/1.25rem-2.5 py-0.5 rounded-md text-[0.625rem] font-black uppercase tracking-widest">
                  Rejected
                </Badge>
              </div>
            )}

            {/* Summary — rendered as Markdown so headings, links, and lists display correctly */}
            <div className="text-slate-400 text-sm leading-relaxed mb-5 prose prose-invert prose-sm max-w-none wrap-break-word overflow-hidden w-full overflow-x-hidden">
              <ReactMarkdown
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-white font-bold text-base mt-3 mb-1 wrap-break-word">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-white font-bold text-sm mt-3 mb-1 wrap-break-word">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-slate-200 font-semibold text-sm mt-2 mb-1 wrap-break-word">
                      {children}
                    </h3>
                  ),
                  h4: ({ children }) => (
                    <h4 className="text-slate-300 font-semibold text-xs mt-2 mb-1 uppercase tracking-wide wrap-break-word">
                      {children}
                    </h4>
                  ),
                  p: ({ children }) => (
                    <p className="text-slate-400 mb-2 wrap-break-word">
                      {children}
                    </p>
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
                      className="text-purple-400 hover:text-purple-300 underline underline-offset-2 transition-colors break-all"
                    >
                      {children}
                    </a>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 text-slate-400 mb-2 wrap-break-word">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 text-slate-400 mb-2 wrap-break-word">
                      {children}
                    </ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-slate-400 wrap-break-word">{children}</li>
                  ),
                  hr: () => <hr className="border-white/10 my-3" />,
                  code: ({ children }) => (
                    <code className="bg-white/5 text-slate-300 text-xs px-1.5 py-0.5 rounded font-mono break-all">
                      {children}
                    </code>
                  ),
                }}
              >
                {alert.summary}
              </ReactMarkdown>
            </div>

            {/* Citation disclaimer */}
            <p className="text-[0.625rem] text-slate-700 mb-4">
              Links are AI-generated and may not resolve — verify before relying
              on them.
            </p>

            {/* Actions */}
            {isUnread && (
              <div className="flex items-center gap-3">
                <Button
                  onClick={onMarkRead}
                  className={`text-white rounded-lg h-12 w-30 text-xs font-bold tracking-wide ${style.actionBg}`}
                >
                  MARK AS READ
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <ReasonForRejectingModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onSubmit={handleRejectSubmit}
      />
    </>
  );
};

function formatRelativeTime(isoString: string): string {
  // Python datetime.utcnow() creates naive timestamps that lack 'Z'
  // Append 'Z' to force the browser to parse it as UTC instead of local time
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
