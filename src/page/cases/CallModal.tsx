import { useEffect } from "react";
import { X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCasesStore } from "@/store/casesStore";
import { useVoiceCall } from "@/hooks/useVoiceCall";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { LeftCall } from "@/components/call/left";

export const CallModal = () => {
  const activeCallCaseId = useCasesStore((state) => state.activeCallCaseId);
  const endCallStore = useCasesStore((state) => state.endCall);

  const {
    startCall,
    endCall,
    toggleMute,
    callStatus,
    transcript,
    aiResponse,
    isAiSpeaking,
    isMuted,
  } = useVoiceCall(activeCallCaseId);

  // Auto-start the call when the modal opens
  useEffect(() => {
    if (activeCallCaseId) {
      startCall();
    }
  }, [activeCallCaseId, startCall]);

  // Handle ending the call — clean up audio + update store
  const handleEndCall = () => {
    endCall();
    endCallStore();
  };

  if (!activeCallCaseId) return null;

  // Build the status text based on call state
  let statusText = "Connecting...";
  if (callStatus === "active") {
    statusText = "Agent Active";
  } else if (callStatus === "error") {
    statusText = "Connection Error";
  }

  return (
    <AlertDialog
      open={!!activeCallCaseId}
      onOpenChange={(open) => {
        if (!open) handleEndCall();
      }}
    >
      <AlertDialogContent className="w-[95vw] sm:w-full max-w-4xl! h-[90vh] sm:h-[85vh] bg-[#0a0a0a] border-white/10 rounded-[1.25rem] sm:rounded-[1.75rem] shadow-[0_2.5rem_7.5rem_rgba(0,0,0,0.9)] flex flex-col overflow-hidden p-0 gap-0 z-200">
        {/* ── Modal header ── */}
        <div className="flex items-center gap-3 sm:gap-4 py-3 sm:py-4 border-b border-white/6 bg-[#0a0a0a]/90 backdrop-blur-xl shrink-0 px-4 sm:px-6">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Phone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <AlertDialogTitle className="text-xs sm:text-sm font-bold text-white truncate leading-tight">
              Call Session
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Active mock court simulation call session.
            </AlertDialogDescription>
            <p className="text-[0.625rem] sm:text-[0.6875rem] text-slate-500 mt-0.5 truncate">
              Mock Court Simulation · {statusText}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEndCall}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-slate-500 hover:text-white hover:bg-white/5 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Call panels: left (orb/audio) ── */}
        <div className="flex flex-1 overflow-hidden gap-4 p-2 sm:p-4">
          <LeftCall
            onEnd={handleEndCall}
            callStatus={callStatus}
            transcript={transcript}
            aiResponse={aiResponse}
            isAiSpeaking={isAiSpeaking}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
