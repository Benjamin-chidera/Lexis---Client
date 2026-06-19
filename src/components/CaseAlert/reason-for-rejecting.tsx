import * as React from "react";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

interface ReasonForRejectingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => void;
}

export function ReasonForRejectingModal({
  isOpen,
  onClose,
  onSubmit,
}: ReasonForRejectingModalProps) {
  const [reason, setReason] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit(reason);
    setReason("");
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="bg-[#0f0f10] border border-white/10 text-white rounded-2xl max-w-md p-6 shadow-2xl">
        <AlertDialogHeader className="text-left mb-4">
          <AlertDialogTitle className="text-xl font-bold text-white">
            Reason for Rejecting
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400 text-sm">
            Please provide a detailed explanation of why this research result is being rejected. This feedback will help improve future AI analysis.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <textarea
              className="w-full h-32 rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-500 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 outline-none resize-none transition-all"
              placeholder="Type your reason here..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>

          <AlertDialogFooter className="flex justify-end gap-3 pt-2">
            <AlertDialogCancel onClick={onClose} className="bg-[#0a0a0a] border border-white/5 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl h-10 w-20 text-xs font-semibold tracking-wide">
              Cancel
            </AlertDialogCancel>
            <Button
              type="submit"
              disabled={!reason.trim()}
              className="bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] rounded-lg h-10 w-40 text-xs font-semibold disabled:opacity-50"
            >
              Reject & Re-research
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
