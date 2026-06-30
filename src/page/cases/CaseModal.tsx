import { useState, useEffect } from "react";
import { X, Scale, MoreVertical } from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCasesStore, getActiveCase, type CaseStatus } from "@/store/casesStore";
import { CaseChatPanel } from "./CaseChatPanel";
import { CaseChatInput } from "./CaseChatInput";
import { useCaseSocket } from "@/hooks/useCaseSocket";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

export const CaseModal = () => {
  const closeCase = useCasesStore((state) => state.closeCase);
  const updateCaseStatus = useCasesStore((state) => state.updateCaseStatus);
  const loadMessages = useCasesStore((state) => state.loadMessages);
  const activeCase = useCasesStore(getActiveCase);

  const [menuOpen, setMenuOpen] = useState(false);
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [statusToChange, setStatusToChange] = useState<CaseStatus | null>(null);
  const [reason, setReason] = useState("");

  // Wire up socket listeners (ai_typing, ai_response) while the modal is open
  useCaseSocket();

  // Load persisted chat messages from the backend whenever a case opens
  useEffect(() => {
    if (activeCase?.id) {
      loadMessages(activeCase.id);
    }
  }, [activeCase?.id, loadMessages]);

  if (!activeCase) return null;

  return (
    <AlertDialog open={!!activeCase} onOpenChange={(open) => { if (!open) closeCase(); }}>
      <AlertDialogContent className="w-[95vw] sm:w-full max-w-6xl! h-[95vh] sm:h-[85vh] bg-[#0a0a0a] border-white/10 rounded-[1.25rem] sm:rounded-[1.75rem] shadow-[0_2.5rem_7.5rem_rgba(0,0,0,0.9)] flex flex-col overflow-hidden px-2 sm:px-3 gap-0">
        {/* ── Modal header ── */}
        <div className="relative z-10 flex items-center gap-2 sm:gap-6 py-3 sm:py-4 border-b border-white/6 bg-[#0a0a0a]/80 backdrop-blur-xl shrink-0 px-2 sm:px-0">
          {/* Case icon + info */}
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400" />
          </div>

          <div className="flex-1 min-w-0">
            <AlertDialogTitle className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
              {activeCase.name}
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Case details and active evidence vault for {activeCase.name}
            </AlertDialogDescription>
            <p className="text-[0.625rem] sm:text-[0.6875rem] text-slate-500 mt-0.5 truncate">
              {activeCase.caseType} · {activeCase.attorney}
            </p>
          </div>

          {/* Status badge */}
          <Badge
            className={`px-1.5 py-0.5 sm:px-3 sm:py-1 text-[0.5rem] sm:text-[0.625rem] font-bold uppercase tracking-wider border rounded-md sm:rounded-lg shrink-0 ${
              activeCase.case_result_status === "active"
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                : activeCase.case_result_status === "success"
                ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                : activeCase.case_result_status === "abandoned"
                ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                : "bg-red-500/10 text-red-400 border-red-500/30"
            }`}
          >
            {activeCase.case_result_status}
          </Badge>

          {/* Status Update Menu — only shown for active cases with accepted alerts */}
          {activeCase.case_result_status === "active" && activeCase.canResolve && (
          <div className="relative shrink-0 ml-1 sm:ml-2 sm:mr-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-slate-500 hover:text-white hover:bg-white/5"
            >
              <MoreVertical className="w-4 h-4" />
            </Button>
            {menuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                <div className="absolute right-0 top-full mt-2 w-40 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col py-1">
                  <button
                    className="px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors"
                    onClick={() => {
                      setStatusToChange("success");
                      setReasonModalOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    Success
                  </button>
                  <button
                    className="px-4 py-2 text-left text-sm text-white hover:bg-white/5 transition-colors"
                    onClick={() => {
                      setStatusToChange("abandoned");
                      setReasonModalOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    Abandoned
                  </button>
                  <button
                    className="px-4 py-2 text-left text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                    onClick={() => {
                      setStatusToChange("closed");
                      setReasonModalOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    Close
                  </button>
                </div>
              </>
            )}
          </div>
          )}

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={closeCase}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-slate-500 hover:text-white hover:bg-white/5 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Modal body: single chat column ── */}
        <div className="flex flex-1 overflow-hidden gap-4 p-1 pb-2 sm:p-4">
          {/* Intelligence Stream (chat + input stacked) */}
          <div className="flex flex-col flex-1 overflow-hidden gap-2 sm:gap-3">
            {/* Chat messages — scrollable */}
            <div className="flex-1 overflow-hidden border border-white/5 bg-black/20 rounded-xl sm:rounded-2xl">
              <CaseChatPanel
                caseId={activeCase.id}
                messages={activeCase.messages}
              />
            </div>

            {/* Input row — pinned below chat */}
            <div className="shrink-0">
              <div className="bg-[#0a0a0a] border border-white/5 rounded-xl sm:rounded-[1.25rem] overflow-hidden shadow-xl">
                <CaseChatInput caseId={activeCase.id} />
              </div>
            </div>
          </div>
        </div>

        {/* Local Absolute Overlay for Status Reason */}
        {reasonModalOpen && statusToChange && (
          <div className="absolute inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl p-6 flex flex-col gap-4 animate-in fade-in zoom-in duration-200">
              <div>
                <h3 className="text-lg font-bold text-white capitalize">{statusToChange} Case</h3>
                <p className="text-sm text-slate-400 mt-1">
                  {statusToChange === "success" && "What made this case successful?"}
                  {statusToChange === "abandoned" && "Why do you want to abandon this case?"}
                  {statusToChange === "closed" && "Why are you closing this case?"}
                </p>
              </div>
              <textarea
                autoFocus
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Enter your reason here..."
                className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500/50 resize-none"
              />
              <div className="flex justify-end gap-3 mt-2">
                <Button 
                  variant="ghost" 
                  onClick={() => { setReasonModalOpen(false); setReason(""); }}
                  className="text-slate-300 h-10 w-30 rounded-xl cursor-pointer bg-transparent border border-white/20 hover:text-white hover:bg-white/5"
                >
                  Cancel
                </Button>
                <Button
                  className="bg-white h-10 w-30 rounded-xl cursor-pointer hover:bg-zinc-200 text-black border border-white/20"
                  onClick={() => {
                    updateCaseStatus(activeCase.id, statusToChange, reason);
                    if (statusToChange === "success" && activeCase.canResolve) {
                      confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#a855f7', '#3b82f6', '#ec4899']
                      });
                    }
                    setReasonModalOpen(false);
                    setReason("");
                  }}
                >
                  Save
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Scrollbar styles */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar { width: 0.3125rem; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 0.625rem; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.12); }
        `}</style>
      </AlertDialogContent>
    </AlertDialog>
  );
};
