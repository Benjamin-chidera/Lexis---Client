import { X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LeftCall } from "@/components/call/left";
import { RightCall } from "@/components/call/right";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

interface CallModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CallModal = ({ isOpen, onClose }: CallModalProps) => {
  if (!isOpen) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <AlertDialogContent className="w-full max-w-6xl! h-[88vh] bg-[#0a0a0a] border-white/10 rounded-[28px] shadow-[0_40px_120px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden p-0 gap-0">
        {/* ── Modal header ── */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-white/6 bg-[#0a0a0a]/90 backdrop-blur-xl shrink-0">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <Phone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex-1">
            <AlertDialogTitle className="text-sm font-bold text-white">Call Session</AlertDialogTitle>
            <AlertDialogDescription className="sr-only">
              Active mock court simulation call session.
            </AlertDialogDescription>
            <p className="text-[11px] text-slate-500 mt-0.5">Mock Court Simulation · Agent Active</p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="w-9 h-9 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 shrink-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* ── Call panels: left (orb/audio) + right (document) ── */}
        <div className="flex flex-1 overflow-hidden gap-4 p-4">
          <LeftCall />
          <RightCall />
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};
