import { create } from "zustand";

interface BriefingStore {
  pdfs: File[];
  urls: string[];
  images: File[];
  context: string;
  addPdfs: (files: File[]) => void;
  removePdf: (index: number) => void;
  addUrl: (url: string) => void;
  removeUrl: (index: number) => void;
  addImages: (files: File[]) => void;
  removeImage: (index: number) => void;
  setContext: (text: string) => void;
}

export const useBriefingStore = create<BriefingStore>((set) => ({
  pdfs: [],
  urls: [],
  images: [],
  context: "",

  addPdfs: (files) =>
    set((state) => ({
      pdfs: [
        ...state.pdfs,
        ...files.filter((f) => !state.pdfs.some((p) => p.name === f.name)),
      ],
    })),

  removePdf: (index) =>
    set((state) => ({ pdfs: state.pdfs.filter((_, i) => i !== index) })),

  addUrl: (url) =>
    set((state) =>
      state.urls.includes(url) ? state : { urls: [...state.urls, url] }
    ),

  removeUrl: (index) =>
    set((state) => ({ urls: state.urls.filter((_, i) => i !== index) })),

  addImages: (files) =>
    set((state) => ({
      images: [
        ...state.images,
        ...files.filter((f) => !state.images.some((img) => img.name === f.name)),
      ],
    })),

  removeImage: (index) =>
    set((state) => ({ images: state.images.filter((_, i) => i !== index) })),

  setContext: (text) => set({ context: text }),
}));
