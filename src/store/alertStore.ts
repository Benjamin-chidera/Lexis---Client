import { create } from "zustand";
import axios from "axios";

const API_BASE = "http://localhost:8000/api";

export type AlertSeverity = "urgent" | "strategic" | "routine";
export type AlertStatus = "unread" | "read" | "archived";

export interface AlertItem {
  id: number;
  case_id: number | null;
  case_name: string | null;
  title: string;
  summary: string;
  severity: AlertSeverity;
  status: AlertStatus;
  created_at: string;
}

interface AlertStore {
  alerts: AlertItem[];
  isLoading: boolean;

  // The alert to show in the in-app notification popup (null = no popup)
  incomingAlert: AlertItem | null;

  fetchAlerts: () => Promise<void>;

  // Called when the socket pushes a new_alert event
  addIncomingAlert: (alert: AlertItem) => void;

  // Dismisses the current in-app popup
  dismissIncomingAlert: () => void;

  markAsRead: (alertId: number) => Promise<void>;
  archiveAll: () => Promise<void>;
}

export const useAlertStore = create<AlertStore>((set, get) => ({
  alerts: [],
  isLoading: false,
  incomingAlert: null,

  fetchAlerts: async () => {
    // Only show loading state if we have no alerts yet
    if (get().alerts.length === 0) {
      set({ isLoading: true });
    }
    
    try {
      const response = await axios.get(`${API_BASE}/alerts`);
      set({ alerts: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch alerts:", error);
      set({ isLoading: false });
    }
  },

  addIncomingAlert: (alert: AlertItem) => {
    // Add to the top of the alerts list and show in the popup
    set((state) => ({
      alerts: [alert, ...state.alerts],
      incomingAlert: alert,
    }));
  },

  dismissIncomingAlert: () => {
    set({ incomingAlert: null });
  },

  markAsRead: async (alertId: number) => {
    try {
      await axios.patch(`${API_BASE}/alerts/${alertId}/read`);
      set((state) => ({
        alerts: state.alerts.map((a) => {
          if (a.id !== alertId) return a;
          return { ...a, status: "read" };
        }),
      }));
    } catch (error) {
      console.error("Failed to mark alert as read:", error);
    }
  },

  archiveAll: async () => {
    try {
      await axios.patch(`${API_BASE}/alerts/archive-all`);
      set((state) => ({
        alerts: state.alerts.map((a) => ({ ...a, status: "archived" })),
      }));
    } catch (error) {
      console.error("Failed to archive alerts:", error);
    }
  },
}));

// Helper: count unread alerts (used by the bell badge)
export const getUnreadCount = (state: AlertStore) => {
  return state.alerts.filter((a) => a.status === "unread").length;
};
