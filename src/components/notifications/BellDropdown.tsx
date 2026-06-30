import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, AlertTriangle, Search, Activity, X } from "lucide-react";
import { useAlertStore, getUnreadCount } from "@/store/alertStore";
import type { AlertItem } from "@/store/alertStore";

export const BellDropdown = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const alerts = useAlertStore((state) => state.alerts);
  const markAsRead = useAlertStore((state) => state.markAsRead);
  const unreadCount = useAlertStore(getUnreadCount);

  // Close the dropdown when clicking outside of it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleBellClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleAlertClick = (alert: AlertItem) => {
    markAsRead(alert.id);
    setIsOpen(false);
    navigate("/alerts");
  };

  // Show only the 5 most recent alerts in the dropdown
  const recentAlerts = alerts.slice(0, 5);

  return (
    // Fixed position at top-right corner, above everything else
    <div ref={dropdownRef} className="fixed top-5 right-5 z-40">

      {/* Bell button */}
      <button
        onClick={handleBellClick}
        className="relative w-10 h-10 rounded-xl bg-[#0a0a0a] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-purple-500/40 hover:bg-purple-500/10 transition-all duration-200 shadow-xl"
      >
        <Bell className="w-4 h-4" />

        {/* Unread count badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-4.5 h-4.5 bg-red-500 text-white text-[0.625rem] font-black rounded-full flex items-center justify-center px-1 shadow-lg shadow-red-500/40 animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {isOpen && (
        <div className="absolute top-12 right-0 w-80 bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

          {/* Header */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/60">
            <div>
              <p className="text-xs font-black text-white uppercase tracking-widest">
                Alerts
              </p>
              {unreadCount > 0 && (
                <p className="text-[0.625rem] text-slate-500 mt-0.5">
                  {unreadCount} unread
                </p>
              )}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-600 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alert list */}
          <div className="max-h-72 overflow-y-auto">
            {recentAlerts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-10 text-center px-4">
                <Bell className="w-8 h-8 text-slate-700 mb-2" />
                <p className="text-slate-600 text-xs font-medium">No alerts yet</p>
                <p className="text-slate-700 text-[0.6875rem] mt-1">
                  AI research alerts will appear here
                </p>
              </div>
            )}

            {recentAlerts.map((alert) => (
              <button
                key={alert.id}
                onClick={() => handleAlertClick(alert)}
                className="w-full text-left px-4 py-3 border-b border-white/4 hover:bg-white/3 transition-colors flex items-start gap-3 group"
              >
                <AlertIcon severity={alert.severity} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className={`text-xs font-bold truncate ${alert.status === "unread" ? "text-white" : "text-slate-400"}`}>
                      {alert.title}
                    </p>
                    {alert.status === "unread" && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-[0.6875rem] text-slate-500 line-clamp-2 leading-relaxed">
                    {alert.summary}
                  </p>
                  <p className="text-[0.625rem] text-slate-700 mt-1">
                    {formatTime(alert.created_at)}
                  </p>
                </div>
              </button>
            ))}
          </div>

          {/* Footer — view all */}
          <div className="px-4 py-3 border-t border-white/5 bg-[#0a0a0a]/40">
            <button
              onClick={() => {
                setIsOpen(false);
                navigate("/alerts");
              }}
              className="w-full text-center text-xs font-bold text-purple-400 hover:text-purple-300 transition-colors"
            >
              View All Alerts →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-components ---

const AlertIcon = ({ severity }: { severity: AlertItem["severity"] }) => {
  if (severity === "urgent") {
    return (
      <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
      </div>
    );
  }
  if (severity === "strategic") {
    return (
      <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
        <Search className="w-3.5 h-3.5 text-purple-400" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-0.5">
      <Activity className="w-3.5 h-3.5 text-cyan-400" />
    </div>
  );
};

// Formats an ISO timestamp into a human-readable "X ago" string
function formatTime(isoString: string): string {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}
