import { useEffect } from "react";
import socket from "@/lib/socket";
import { useCasesStore } from "@/store/casesStore";
import type { ChatMessage } from "@/store/casesStore";

/**
 * Listens for case-related socket events while a case modal is open.
 *
 * - ai_typing      → shows the typing indicator in the chat panel
 * - ai_typing_done → hides the typing indicator (on error)
 * - ai_response    → adds the AI's message to the case in the store
 *
 * Call this hook inside the CaseModal component so it only
 * runs while a case is open.
 */
export function useCaseSocket() {
  const setAiTyping = useCasesStore((state) => state.setAiTyping);
  const addAiMessage = useCasesStore((state) => state.addAiMessage);
  const setResearchStage = useCasesStore((state) => state.setResearchStage);

  useEffect(() => {
    // Connect socket if not already connected
    if (!socket.connected) {
      socket.connect();
    }

    // Server is telling us the AI is thinking
    const handleAiTyping = () => {
      setAiTyping(true);
    };

    // Server is telling us the AI stopped (error case)
    const handleAiTypingDone = () => {
      setAiTyping(false);
      setResearchStage(null);
    };

    // Server is sending back the AI's completed response
    const handleAiResponse = (data: {
      case_id: number;
      message: ChatMessage;
    }) => {
      setResearchStage(null);
      addAiMessage(String(data.case_id), data.message);
    };

    // Live pipeline stage updates (analyst → researcher → strategist)
    const handleStageUpdate = (data: {
      case_id: number;
      stage: string;
      message: string;
    }) => {
      setResearchStage(data.message);
    };

    socket.on("ai_typing", handleAiTyping);
    socket.on("ai_typing_done", handleAiTypingDone);
    socket.on("ai_response", handleAiResponse);
    socket.on("stage_update", handleStageUpdate);

    // Clean up listeners when the modal closes
    return () => {
      socket.off("ai_typing", handleAiTyping);
      socket.off("ai_typing_done", handleAiTypingDone);
      socket.off("ai_response", handleAiResponse);
      socket.off("stage_update", handleStageUpdate);
    };
  }, [setAiTyping, addAiMessage, setResearchStage]);
}
