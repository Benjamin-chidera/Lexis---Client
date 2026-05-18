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
    };

    // Server is sending back the AI's completed response
    const handleAiResponse = (data: {
      case_id: number;
      message: ChatMessage;
    }) => {
      addAiMessage(String(data.case_id), data.message);
    };

    socket.on("ai_typing", handleAiTyping);
    socket.on("ai_typing_done", handleAiTypingDone);
    socket.on("ai_response", handleAiResponse);

    // Clean up listeners when the modal closes
    return () => {
      socket.off("ai_typing", handleAiTyping);
      socket.off("ai_typing_done", handleAiTypingDone);
      socket.off("ai_response", handleAiResponse);
    };
  }, [setAiTyping, addAiMessage]);
}
