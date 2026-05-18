import { useEffect } from "react";
import { X, AlertTriangle, Search, Activity } from "lucide-react";
import { useAlertStore } from "@/store/alertStore";
import type { AlertItem } from "@/store/alertStore";

// Auto-dismiss the popup after this many milliseconds
const AUTO_DISMISS_MS = 6000;

export const InAppNotification = () => {
  const incomingAlert = useAlertStore((state) => state.incomingAlert);
  const dismissIncomingAlert = useAlertStore((state) => state.dismissIncomingAlert);

  // Auto-dismiss after AUTO_DISMISS_MS
  useEffect(() => {
    if (!incomingAlert) return;

    const timer = setTimeout(() => {
      dismissIncomingAlert();
    }, AUTO_DISMISS_MS);

    // If a new alert comes in before the timer fires, reset the timer
    return () => clearTimeout(timer);
  }, [incomingAlert, dismissIncomingAlert]);

  if (!incomingAlert) return null;

  return (
    // Fixed position at the bottom-right corner
    <div className="fixed bottom-32 right-6 z-[200] pointer-events-none">
      <div
        className="pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300"
      >
        <NotificationCard
          alert={incomingAlert}
          onDismiss={dismissIncomingAlert}
        />
      </div>
    </div>
  );
};

// --- Sub-component ---

interface NotificationCardProps {
  alert: AlertItem;
  onDismiss: () => void;
}

const NotificationCard = ({ alert, onDismiss }: NotificationCardProps) => {
  const icon = getSeverityIcon(alert.severity);
  const colors = getSeverityColors(alert.severity);

  return (
    <div
      className={`w-80 bg-[#0a0a0a] border rounded-2xl shadow-2xl overflow-hidden ${colors.border}`}
      style={{ boxShadow: `0 20px 60px rgba(0,0,0,0.8), ${colors.glow}` }}
    >
      {/* Top accent bar */}
      <div className={`h-0.5 w-full ${colors.bar}`} />

      <div className="p-4 flex items-start gap-3">
        {/* Severity icon */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colors.iconBg}`}
        >
          {icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Label row */}
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-widest ${colors.label}`}>
              {alert.severity} alert
            </span>
          </div>

          {/* Title */}
          <p className="text-sm font-bold text-white leading-tight mb-1 truncate">
            {alert.title}
          </p>

          {/* Summary preview */}
          <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-2">
            {alert.summary}
          </p>
        </div>

        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="text-slate-600 hover:text-white transition-colors shrink-0 mt-0.5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar — shrinks over AUTO_DISMISS_MS */}
      <div className="px-4 pb-3">
        <div className="h-0.5 w-full bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${colors.progress}`}
            style={{
              animation: `shrink ${AUTO_DISMISS_MS}ms linear forwards`,
            }}
          />
        </div>
      </div>

      {/* CSS for the shrink animation */}
      <style>{`
        @keyframes shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>
    </div>
  );
};

// --- Helpers ---

function getSeverityIcon(severity: AlertItem["severity"]) {
  if (severity === "urgent") {
    return <AlertTriangle className="w-4 h-4 text-red-400" />;
  }
  if (severity === "strategic") {
    return <Search className="w-4 h-4 text-purple-400" />;
  }
  return <Activity className="w-4 h-4 text-cyan-400" />;
}

function getSeverityColors(severity: AlertItem["severity"]) {
  if (severity === "urgent") {
    return {
      border: "border-red-500/30",
      bar: "bg-red-500",
      iconBg: "bg-red-500/10 border-red-500/20",
      label: "text-red-400",
      glow: "0 0 30px rgba(239,68,68,0.15)",
      progress: "bg-red-500",
    };
  }
  if (severity === "strategic") {
    return {
      border: "border-purple-500/30",
      bar: "bg-purple-500",
      iconBg: "bg-purple-500/10 border-purple-500/20",
      label: "text-purple-400",
      glow: "0 0 30px rgba(147,51,234,0.15)",
      progress: "bg-purple-500",
    };
  }
  return {
    border: "border-cyan-500/20",
    bar: "bg-cyan-500",
    iconBg: "bg-cyan-500/10 border-cyan-500/20",
    label: "text-cyan-400",
    glow: "0 0 30px rgba(6,182,212,0.10)",
    progress: "bg-cyan-500",
  };
}
