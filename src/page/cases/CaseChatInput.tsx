import { useRef, useState } from "react";
import {
  Send,
  FileText,
  Image as ImageIcon,
  Link as LinkIcon,
  X,
  Globe,
  Paperclip,
  PhoneCall,
  NotebookPen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCasesStore } from "@/store/casesStore";
import { toast } from "sonner";

interface CaseChatInputProps {
  caseId: string;
}

// Allowed image MIME types
const IMAGE_ACCEPT = "image/png,image/jpeg,image/jpg,image/webp,image/gif";

export const CaseChatInput = ({ caseId }: CaseChatInputProps) => {
  // Use individual selectors instead of destructuring the whole store.
  // Zustand action functions are referentially stable, so these will never
  // trigger a re-render — but they prevent the component from subscribing
  // to unrelated state changes (e.g. activeCaseId, isAiTyping).
  const addMessage = useCasesStore((state) => state.addMessage);
  const addPdfsToVault = useCasesStore((state) => state.addPdfsToVault);
  const addImagesToVault = useCasesStore((state) => state.addImagesToVault);
  const addUrlToVault = useCasesStore((state) => state.addUrlToVault);
  const addContextToVault = useCasesStore((state) => state.addContextToVault);
  const startCall = useCasesStore((state) => state.startCall);

  // Text input for the chat message
  const [chatText, setChatText] = useState("");

  // URL input state
  const [urlInput, setUrlInput] = useState("");

  // Context notes state
  const [contextInput, setContextInput] = useState("");
  const [contextSaving, setContextSaving] = useState(false);

  // Whether the attachment panel is expanded
  const [attachmentPanelOpen, setAttachmentPanelOpen] = useState(false);

  // File input refs
  const pdfInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers ---

  const handleSendMessage = () => {
    const trimmed = chatText.trim();
    if (!trimmed) return;

    // Add the user message to the store immediately (optimistic UI)
    addMessage(caseId, {
      role: "user",
      content: trimmed,
    });

    // Send the message to the AI via socket
    import("@/lib/socket").then(({ default: socket }) => {
      if (!socket.connected) socket.connect();
      socket.emit("chat_message", {
        case_id: Number(caseId),
        content: trimmed,
      });
    });

    setChatText("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Send on Enter (but not Shift+Enter)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePdfFiles = (files: FileList | null) => {
    if (!files) return;
    const pdfs = Array.from(files).filter((f) => f.type === "application/pdf");
    if (pdfs.length > 0) {
      addPdfsToVault(caseId, pdfs);
    }
  };

  const handleImageFiles = (files: FileList | null) => {
    if (!files) return;
    const images = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (images.length > 0) {
      addImagesToVault(caseId, images);
    }
  };

  const isValidUrl = (value: string): boolean => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleAddContext = async () => {
    const trimmed = contextInput.trim();
    if (!trimmed) return;
    setContextSaving(true);
    await addContextToVault(caseId, trimmed);
    setContextInput("");
    setContextSaving(false);
  };

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    if (!isValidUrl(trimmed)) {
      toast.error("Please enter a valid URL including https://");
      return;
    }

    addUrlToVault(caseId, trimmed);
    setUrlInput("");
  };

  const handleUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddUrl();
    }
  };

  return (
    <>
      <div className="border-t border-white/5 bg-[#0a0a0a]/80 backdrop-blur-xl px-5 py-4 space-y-3">
        {/* Attachment panel (PDF, Image, URL) */}
        {attachmentPanelOpen && (
          <div className="bg-white/2 border border-white/10 rounded-2xl p-4 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-200">
            <p className="text-[0.625rem] uppercase tracking-widest font-bold text-slate-500">
              Add to Vault
            </p>

            {/* PDF Upload Row */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4 text-orange-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300 mb-0.5">
                  PDF Documents
                </p>
                <p className="text-[0.6875rem] text-slate-600">
                  Depositions, contracts, exhibits
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => pdfInputRef.current?.click()}
                className="text-xs text-orange-400 border border-orange-500/20 hover:bg-orange-500/10 rounded-xl px-3 h-8"
              >
                Browse
              </Button>
              <input
                ref={pdfInputRef}
                type="file"
                accept=".pdf,application/pdf"
                multiple
                className="hidden"
                onChange={(e) => handlePdfFiles(e.target.files)}
              />
            </div>

            {/* Image Upload Row */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                <ImageIcon className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-300 mb-0.5">
                  Images
                </p>
                <p className="text-[0.6875rem] text-slate-600">
                  Photos, screenshots, scanned docs
                </p>
              </div>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => imageInputRef.current?.click()}
                className="text-xs text-blue-400 border border-blue-500/20 hover:bg-blue-500/10 rounded-xl px-3 h-8"
              >
                Browse
              </Button>
              <input
                ref={imageInputRef}
                type="file"
                accept={IMAGE_ACCEPT}
                multiple
                className="hidden"
                onChange={(e) => handleImageFiles(e.target.files)}
              />
            </div>

            {/* URL Input Row */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-300 mb-0.5">
                    Web URLs
                  </p>
                  <p className="text-[0.6875rem] text-slate-600">
                    Legal databases, news archives, PACER
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 pl-11">
                <div className="relative flex-1">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <Input
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={handleUrlKeyDown}
                    placeholder="https://..."
                    className="bg-white/5 border-white/10 pl-9 h-9 text-base md:text-xs text-slate-200 placeholder:text-slate-600 rounded-xl focus:border-purple-500/40 focus:ring-0"
                  />
                </div>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddUrl}
                  className="h-0.5625rem-4 bg-purple-600/80 hover:bg-white text-black shadow-xl shadow-white/10 border border-white/20 rounded-xl text-xs font-bold shrink-0"
                >
                  Add
                </Button>
              </div>
            </div>

            {/* Context Notes Row */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center shrink-0">
                  <NotebookPen className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-300 mb-0.5">
                    Context Notes
                  </p>
                  <p className="text-[0.6875rem] text-slate-600">
                    Additional facts, timeline, or instructions for the agent
                  </p>
                </div>
              </div>
              <div className="flex gap-2 pl-11">
                <textarea
                  value={contextInput}
                  onChange={(e) => setContextInput(e.target.value)}
                  placeholder="Add more context for the AI agent..."
                  rows={3}
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-base md:text-xs text-slate-200 placeholder:text-slate-600 resize-none focus:outline-none focus:border-green-500/40"
                />
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddContext}
                  disabled={!contextInput.trim() || contextSaving}
                  className="h-9 self-start px-4 bg-green-700/80 hover:bg-green-600 text-white rounded-xl text-xs font-bold shrink-0 disabled:opacity-40"
                >
                  {contextSaving ? "Saving..." : "Add"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main input row */}
        <div className="flex items-center gap-2">
          {/* Attachment toggle button (paperclip) */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setAttachmentPanelOpen((prev) => !prev)}
            className={`w-10 h-10 rounded-xl border transition-all duration-200 shrink-0 ${
              attachmentPanelOpen
                ? "border-purple-500/40 bg-purple-500/10 text-purple-400"
                : "border-white/10 text-slate-500 hover:text-slate-200 hover:border-white/20 hover:bg-white/5"
            }`}
            title="Add files, images, or URLs to vault"
          >
            {attachmentPanelOpen ? (
              <X className="w-4 h-4" />
            ) : (
              <Paperclip className="w-4 h-4" />
            )}
          </Button>

          {/* Call log button (phone icon) */}
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => startCall(caseId)}
            className="w-10 h-10 rounded-xl border border-white/10 text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all duration-200 shrink-0"
            title="Open call session"
          >
            <PhoneCall className="w-4 h-4" />
          </Button>

          {/* Text input */}
          <div className="relative flex-1">
            <Input
              value={chatText}
              onChange={(e) => setChatText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Lexis AI about this case..."
              className="bg-white/3 border-white/10 h-10 rounded-xl text-base md:text-sm text-slate-200 placeholder:text-slate-600 focus:border-purple-500/40 focus:ring-0 transition-all"
            />
          </div>

          {/* Send button */}
          <Button
            type="button"
            size="icon"
            onClick={handleSendMessage}
            disabled={!chatText.trim()}
            className="w-10 h-10 rounded-xl bg-white hover:bg-zinc-200 text-black border border-purple-400/20 shadow-lg shadow-purple-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </>
  );
};
