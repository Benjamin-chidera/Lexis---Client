import { create } from "zustand";
import { persist } from "zustand/middleware";

const API_BASE = "http://localhost:8000/api";
//   const API_BASE = import.meta.env.VITE_API_URL;

export interface AuthUser {
  user_id: number;
  name: string;
  email: string;
  role: "admin" | "employee";
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
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
        try {
          await fetch(`${API_BASE}/auth/logout`, {
            method: "POST",
            credentials: "include",
          });
        } catch {
          // best-effort — clear local state regardless
        }
        set({ user: null });
      },

      checkSession: async () => {
        try {
          const response = await fetch(`${API_BASE}/auth/me`, {
            credentials: "include",
          });
          if (!response.ok) {
            set({ user: null });
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
          });
        } catch {
          set({ user: null });
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
