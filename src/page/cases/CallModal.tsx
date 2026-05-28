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
      <AlertDialogContent className="w-full max-w-6xl! h-[88vh] bg-[#0a0a0a] border-white/10 rounded-[28px] shadow-[0_40px_120px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden p-0 gap-0">
        {/* ── Modal header ── */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6 bg-[#0a0a0a]/90 backdrop-blur-xl shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <AlertDialogTitle className="text-sm font-bold text-white">
              Call Session
            </AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Active mock court simulation call session.
            </AlertDialogDescription>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Mock Court Simulation · {statusText}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleEndCall}
            className="w-9 h-9 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Call panels: left (orb/audio) ── */}
        <div className="flex flex-1 overflow-hidden gap-4 p-4">
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
