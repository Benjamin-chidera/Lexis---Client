import { create } from "zustand";
import axios from "axios";
import * as Sentry from "@sentry/react";
import { useAuthStore } from "./authStore";

// --- Types ---

export type CaseStatus =
  | "active"
  | "archived"
  | "closed"
  | "success"
  | "abandoned";

const API_BASE = import.meta.env.VITE_API_URL;

export interface ChatMessage {
  id: string;
  role: "user" | "ai";
  content: string;
  timestamp: string;
  // Optional citation the AI references
  citation?: {
    filename: string;
    exhibit: string;
    page?: number;
  };
}

export interface VaultEvidence {
  id: string;
  type: "pdf" | "image" | "url";
  name: string;
  // For PDFs and images: the File object
  file?: File;
  // For URLs: the URL string
  url?: string;
  // Pre-generated markdown summary for the URL
  summary?: string;
  addedAt: string;
}

export interface Case {
  status: string;
  id: string;
  name: string;
  caseType: string;
  attorney: string;
  openedDate: string;
  case_result_status: CaseStatus;
  // Chat messages for this case
  messages: ChatMessage[];
  // Vault evidence for this case
  vault: VaultEvidence[];
  // Optional reason when a case status changes
  case_result_reason?: string;
  // Raw status of the AI research (e.g. pending, processing)
  researchStatus?: string;
  // Whether the case has at least one accepted alert (allows status changes)
  canResolve?: boolean;
}

interface CasesStore {
  cases: Case[];
  activeCaseId: string | null;
  activeCallCaseId: string | null;
  isLoading: boolean;

  // True while the AI is generating a response for the active case
  isAiTyping: boolean;

  // Current pipeline stage label shown in the typing indicator (analyst/researcher/strategist)
  researchStage: string | null;

  fetchCases: () => Promise<void>;

  // Loads persisted messages from the backend for a case
  loadMessages: (caseId: string) => Promise<void>;

  openCase: (caseId: string) => void;
  closeCase: () => void;
  startCall: (caseId: string) => void;
  endCall: () => void;

  addMessage: (
    caseId: string,
    message: Omit<ChatMessage, "id" | "timestamp">,
  ) => void;

  // Called when the socket pushes an ai_response event
  addAiMessage: (caseId: string, message: ChatMessage) => void;

  setAiTyping: (isTyping: boolean) => void;
  setResearchStage: (stage: string | null) => void;

  addPdfsToVault: (caseId: string, files: File[]) => void;
  addImagesToVault: (caseId: string, files: File[]) => void;
  addUrlToVault: (caseId: string, url: string) => void;
  addContextToVault: (caseId: string, text: string) => Promise<void>;
  removeFromVault: (caseId: string, evidenceId: string) => void;
  updateCaseStatus: (
    caseId: string,
    status: CaseStatus,
    reason?: string,
  ) => Promise<void>;
}

// Helper: generate a simple unique ID
const generateId = () =>
  `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

// Helper: get current timestamp string
const getTimestamp = () => {
  const now = new Date();
  return now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

// --- Seed Data ---
// Pre-populated cases so the UI isn't empty on first load

// --- Store ---

export const useCasesStore = create<CasesStore>((set, get) => ({
  cases: [],
  activeCaseId: null,
  activeCallCaseId: null,
  isLoading: false,
  isAiTyping: false,
  researchStage: null,

  fetchCases: async () => {
    // Only show loading state if we have no cases yet to prevent flicker on revisit
    if (get().cases.length === 0) {
      set({ isLoading: true });
    }

    try {
      const response = await axios.get(`${API_BASE}/cases`);
      set({ cases: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch cases:", error);
      if (useAuthStore.getState().user && !axios.isCancel(error)) {
        Sentry.captureException(error);
      }
      set({ cases: [], isLoading: false });
    }
  },

  loadMessages: async (caseId: string) => {
    try {
      const response = await axios.get(`${API_BASE}/cases/${caseId}/messages`);
      const messages: ChatMessage[] = response.data;
      set((state) => ({
        cases: state.cases.map((c) => {
          if (c.id !== caseId) return c;
          return { ...c, messages };
        }),
      }));
    } catch (error) {
      console.error("Failed to load messages for case:", caseId, error);
      if (useAuthStore.getState().user && !axios.isCancel(error)) {
        Sentry.captureException(error);
      }
    }
  },

  openCase: (caseId) => {
    set({ activeCaseId: caseId });
  },

  closeCase: () => {
    set({ activeCaseId: null, isAiTyping: false, researchStage: null });
  },

  startCall: (caseId) => {
    set({
      activeCaseId: null,
      activeCallCaseId: caseId,
      isAiTyping: false,
      researchStage: null,
    });
  },

  endCall: () => {
    const caseId = get().activeCallCaseId;
    set({
      activeCallCaseId: null,
      activeCaseId: caseId, // Reopen CaseModal
    });
    if (caseId) {
      get().loadMessages(caseId); // Refresh messages from DB
    }
  },

  setAiTyping: (isTyping: boolean) => {
    set({ isAiTyping: isTyping });
  },

  setResearchStage: (stage: string | null) => {
    set({ researchStage: stage });
  },

  addMessage: (caseId, messageData) => {
    const newMessage: ChatMessage = {
      ...messageData,
      id: generateId(),
      timestamp: getTimestamp(),
    };
    set((state) => ({
      cases: state.cases.map((c) => {
        if (c.id !== caseId) return c;
        return { ...c, messages: [...c.messages, newMessage] };
      }),
    }));
  },

  addAiMessage: (caseId: string, message: ChatMessage) => {
    set((state) => ({
      isAiTyping: false,
      cases: state.cases.map((c) => {
        if (c.id !== caseId) return c;
        return { ...c, messages: [...c.messages, message] };
      }),
    }));
  },

  addPdfsToVault: async (caseId, files) => {
    try {
      const { uploadPdfs } = await import("@/lib/api");
      await uploadPdfs(files, Number(caseId));
      // Refresh the local cases list to show the new items
      const { fetchCases } = useCasesStore.getState();
      await fetchCases();
    } catch (error) {
      console.error("Failed to add PDFs to vault:", error);
      if (useAuthStore.getState().user && !axios.isCancel(error)) {
        Sentry.captureException(error);
      }
    }
  },

  addImagesToVault: async (caseId, files) => {
    try {
      const { uploadImages } = await import("@/lib/api");
      await uploadImages(files, Number(caseId));
      const { fetchCases } = useCasesStore.getState();
      await fetchCases();
    } catch (error) {
      console.error("Failed to add images to vault:", error);
      if (useAuthStore.getState().user && !axios.isCancel(error)) {
        Sentry.captureException(error);
      }
    }
  },

  addUrlToVault: async (caseId, url) => {
    try {
      await axios.post(`${API_BASE}/cases/${caseId}/add-url`, { url });
      const { fetchCases } = useCasesStore.getState();
      await fetchCases();
    } catch (error) {
      console.error("Failed to add URL to vault:", error);
      if (useAuthStore.getState().user && !axios.isCancel(error)) {
        Sentry.captureException(error);
      }
    }
  },

  addContextToVault: async (caseId, text) => {
    try {
      await axios.post(`${API_BASE}/cases/${caseId}/add-context`, {
        context: text,
      });
      const { fetchCases } = useCasesStore.getState();
      await fetchCases();
    } catch (error) {
      console.error("Failed to add context to vault:", error);
      if (useAuthStore.getState().user && !axios.isCancel(error)) {
        Sentry.captureException(error);
      }
    }
  },

  removeFromVault: (caseId, evidenceId) => {
    set((state) => ({
      cases: state.cases.map((c) => {
        if (c.id !== caseId) return c;
        return { ...c, vault: c.vault.filter((v) => v.id !== evidenceId) };
      }),
    }));
  },

  updateCaseStatus: async (caseId, status, reason) => {
    // Optimistically update local state
    set((state) => ({
      cases: state.cases.map((c) => {
        if (c.id !== caseId) return c;
        return { ...c, case_result_status: status, case_result_reason: reason };
      }),
    }));

    try {
      await axios.patch(`${API_BASE}/cases/${caseId}/status`, {
        case_result_status: status,
        case_result_reason: reason ?? "",
      });
    } catch (error) {
      console.error("Failed to update case status:", error);
      if (useAuthStore.getState().user && !axios.isCancel(error)) {
        Sentry.captureException(error);
      }
      // Re-fetch to revert optimistic update on failure
      const { fetchCases } = useCasesStore.getState();
      await fetchCases();
    }
  },
}));

// Derived helper: get the currently active case object
export const getActiveCase = (state: CasesStore) => {
  if (!state.activeCaseId) return null;
  return state.cases.find((c) => c.id === state.activeCaseId) ?? null;
};
