import { useEffect } from "react";
import { LeftCall } from "@/components/call/left";
import { useNavigate } from "react-router-dom";
import { useCasesStore } from "@/store/casesStore";
import { useVoiceCall } from "@/hooks/useVoiceCall";

export const CallPage = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (activeCallCaseId) {
      startCall();
    }
  }, [activeCallCaseId, startCall]);

  const handleEndCall = () => {
    endCall();
    endCallStore();
    navigate("/cases");
  };

  return (
    <main className="h-screen bg-black overflow-hidden text-slate-200 flex p-6 gap-6 selection:bg-purple-500/30">
      <LeftCall 
        onEnd={handleEndCall}
        callStatus={callStatus}
        transcript={transcript}
        aiResponse={aiResponse}
        isAiSpeaking={isAiSpeaking}
        isMuted={isMuted}
        onToggleMute={toggleMute}
      />
    </main>
  );
};
