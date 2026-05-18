import { create } from "zustand";
import axios from "axios";

// --- Types ---

export type CaseStatus = "active" | "archived" | "closed" | "success" | "abandoned";

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
  id: string;
  name: string;
  caseType: string;
  attorney: string;
  openedDate: string;
  status: CaseStatus;
  // Chat messages for this case
  messages: ChatMessage[];
  // Vault evidence for this case
  vault: VaultEvidence[];
  // Optional reason when a case status changes
  statusReason?: string;
  // Raw status of the AI research (e.g. pending, processing)
  researchStatus?: string;
}

interface CasesStore {
  cases: Case[];
  activeCaseId: string | null;
  isLoading: boolean;

  // True while the AI is generating a response for the active case
  isAiTyping: boolean;

  fetchCases: () => Promise<void>;

  // Loads persisted messages from the backend for a case
  loadMessages: (caseId: string) => Promise<void>;

  openCase: (caseId: string) => void;
  closeCase: () => void;

  addMessage: (caseId: string, message: Omit<ChatMessage, "id" | "timestamp">) => void;

  // Called when the socket pushes an ai_response event
  addAiMessage: (caseId: string, message: ChatMessage) => void;

  setAiTyping: (isTyping: boolean) => void;

  addPdfsToVault: (caseId: string, files: File[]) => void;
  addImagesToVault: (caseId: string, files: File[]) => void;
  addUrlToVault: (caseId: string, url: string) => void;
  removeFromVault: (caseId: string, evidenceId: string) => void;
  updateCaseStatus: (caseId: string, status: CaseStatus, reason?: string) => void;
}

// Helper: generate a simple unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

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
  isLoading: false,
  isAiTyping: false,

  fetchCases: async () => {
    // Only show loading state if we have no cases yet to prevent flicker on revisit
    if (get().cases.length === 0) {
      set({ isLoading: true });
    }

    try {
      const response = await axios.get("http://localhost:8000/api/cases");
      set({ cases: response.data, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch cases:", error);
      set({ cases: [], isLoading: false });
    }
  },

  loadMessages: async (caseId: string) => {
    try {
      const response = await axios.get(
        `http://localhost:8000/api/cases/${caseId}/messages`
      );
      const messages: ChatMessage[] = response.data;
      set((state) => ({
        cases: state.cases.map((c) => {
          if (c.id !== caseId) return c;
          return { ...c, messages };
        }),
      }));
    } catch (error) {
      console.error("Failed to load messages for case:", caseId, error);
    }
  },

  openCase: (caseId) => {
    set({ activeCaseId: caseId });
  },

  closeCase: () => {
    set({ activeCaseId: null, isAiTyping: false });
  },

  setAiTyping: (isTyping: boolean) => {
    set({ isAiTyping: isTyping });
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
    }
  },

  addUrlToVault: async (caseId, url) => {
    try {
      await axios.post(`http://localhost:8000/api/cases/${caseId}/add-url`, { url });
      const { fetchCases } = useCasesStore.getState();
      await fetchCases();
    } catch (error) {
      console.error("Failed to add URL to vault:", error);
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

  updateCaseStatus: (caseId, status, reason) => {
    set((state) => ({
      cases: state.cases.map((c) => {
        if (c.id !== caseId) return c;
        // Optionally you could store the reason in a new field if needed,
        // but the core requirement is to update the status.
        return { ...c, status, statusReason: reason };
      }),
    }));
  },
}));

// Derived helper: get the currently active case object
export const getActiveCase = (state: CasesStore) => {
  if (!state.activeCaseId) return null;
  return state.cases.find((c) => c.id === state.activeCaseId) ?? null;
};
