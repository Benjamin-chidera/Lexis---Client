import { create } from "zustand";
import { persist } from "zustand/middleware";
import * as Sentry from "@sentry/react";

const API_BASE = import.meta.env.VITE_API_URL;

export interface AuthUser {
  user_id: number;
  name: string;
  email: string;
  role: "admin" | "employee";
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  sessionChecked: boolean;
  checkEmail: (email: string) => Promise<{ name: string; has_password: boolean }>;
  login: (email: string, password: string) => Promise<void>;
  setPassword: (email: string, password: string, confirmPassword: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,
      sessionChecked: false,

      checkEmail: async (email: string) => {
        const response = await fetch(`${API_BASE}/auth/check-email`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ corporate_email: email }),
          credentials: "include",
        });

        if (!response.ok) {
          const err = await response.json();
          throw new Error(err.detail || "Could not verify email.");
        }

        return response.json();
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ corporate_email: email, password }),
            credentials: "include",
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Login failed.");
          }

          const data = await response.json();
          set({
            user: {
              user_id: data.user_id,
              name: data.name,
              email: data.email,
              role: data.role,
            },
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      setPassword: async (email: string, password: string, confirmPassword: string) => {
        set({ isLoading: true });
        try {
          const response = await fetch(`${API_BASE}/auth/set-password`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              corporate_email: email,
              password,
              confirm_password: confirmPassword,
            }),
            credentials: "include",
          });

          if (!response.ok) {
            const err = await response.json();
            throw new Error(err.detail || "Failed to set password.");
          }

          const data = await response.json();
          set({
            user: {
              user_id: data.user_id,
              name: data.name,
              email: data.email,
              role: data.role,
            },
            isLoading: false,
          });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        // Clear local session state immediately so UI updates instantly
        set({ user: null });

        // Fire-and-forget the server request with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            credentials: "include",
            signal: controller.signal,
          });
        } catch (error) {
          // Only log/capture if it's not a user-triggered abort or transient network drop
          if (error instanceof Error && error.name !== "AbortError") {
            console.error("Server logout failed:", error);
          }
        } finally {
          clearTimeout(timeoutId);
        }
      },

      checkSession: async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

        try {
          const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: "include",
            signal: controller.signal,
          });

          if (!response.ok) {
            set({ user: null, sessionChecked: true });
            return;
          }
          const data = await response.json();
          set({
            user: {
              user_id: data.user_id,
              name: data.name,
              email: data.email,
              role: data.role,
            },
            sessionChecked: true,
          });
        } catch (error) {
          // Avoid capturing AbortErrors (timeouts) in Sentry as they are expected during network outages
          if (error instanceof Error && error.name !== "AbortError") {
            Sentry.captureException(error);
          }
          set({ user: null, sessionChecked: true });
        } finally {
          clearTimeout(timeoutId);
        }
      },

      isAuthenticated: () => get().user !== null,
      isAdmin: () => get().user?.role === "admin",
    }),
    {
      name: "legal-assistant-auth",
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
