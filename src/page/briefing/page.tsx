import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap, PlayCircle, X, Info, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

// REPLACE THIS URL with your own Loom or YouTube embed link (e.g. https://www.youtube.com/embed/...)
const DEMO_VIDEO_URL = "https://player.vimeo.com/video/1205495312?badge=0&autopause=0&player_id=0&app_id=58479";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";
import { PdfSelectors } from "@/components/bottomNav/pdf-selectors";
import { Urls } from "@/components/bottomNav/urls";
import { ImageSelectors } from "@/components/bottomNav/image-selectors";
import { TextMicInput } from "@/components/bottomNav/text-mic-input";
import { useBriefingStore } from "@/store/briefingStore";
import socket from "@/lib/socket";
import { uploadPdfs, uploadImages } from "@/lib/api";
import { toast } from "sonner";

const TEST_KIT_PROMPT = `You are a Legal Scenario Engineer. I am testing an autonomous, multi-modal legal research AI named "Lexis." I need you to generate a "Mock Legal Case Test Kit" to test its ability to synthesize internal documents, visual evidence, and web search results. Please generate a high-stakes corporate or commercial liability scenario (e.g., Corporate Negligence, IP Theft, Breach of Contract, or Employment Dispute). Provide the output strictly in the following format:

1. [PDF FILE CONTENT] Generate the exact text for an internal corporate document (e.g., an Incident Report, Internal Audit, or Confidential Memo). Include case IDs, timestamps, and a specific "hidden" detail or gap that proves liability (e.g., a missing inspection log, a suspicious data transfer, or a signed waiver with a fatal flaw).

2. [IMAGE EVIDENCE GUIDE] Tell me exactly what kind of image I need to search for online to download as visual evidence. Provide 2-3 specific search queries. The image must contain visual proof that contradicts a standard legal defense (e.g., "search for 'wet floor sign missing' to prove lack of hazard notice").

3. [VERIFIED URLs] Provide 3 real, active URLs that are highly relevant to this specific scenario. These should include:
- 1 official government legislation or statute link.
- 1 regulatory body guideline or enforcement page.
- 1 real case precedent (preferably from BAILII or a verified legal database).

4. [CASE CONTEXT INPUT] Write the exact 3-4 sentence paragraph I will paste into the Lexis AI "Case Context" input box. It should outline the dispute, mention the attached evidence, and ask the AI to find a specific legal leverage point based on the opponent's likely defense. Keep the tone highly professional, adversarial, and realistic.`;

const BriefingPage = () => {
  const { pdfs, urls, images, context, clearAll } = useBriefingStore();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);
  const [isWalkthroughOpen, setIsWalkthroughOpen] = useState(() => {
    return !localStorage.getItem("has_seen_briefing_walkthrough");
  });
  const [isTestKitExpanded, setIsTestKitExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(TEST_KIT_PROMPT);
    setCopied(true);
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const closeWalkthrough = () => {
    localStorage.setItem("has_seen_briefing_walkthrough", "true");
    setIsWalkthroughOpen(false);
  };

  const hasContent =
    pdfs.length > 0 ||
    urls.length > 0 ||
    images.length > 0 ||
    context.trim().length > 0;

  const handleStart = async () => {
    if (!hasContent) {
      toast.error(
        "Add at least one document, URL, image, or context note before starting.",
      );
      return;
    }
    setIsLoading(true);

    try {
      // Step 1: Upload PDFs and Images
      let savedPdfPaths: string[] = [];
      if (pdfs.length > 0) {
        savedPdfPaths = await uploadPdfs(pdfs);
      }

      let savedImagePaths: string[] = [];
      if (images.length > 0) {
        savedImagePaths = await uploadImages(images);
      }

      // Step 2: Connect socket
      if (!socket.connected) {
        socket.connect();
      }

      // Step 3: Listen for success
      socket.once("case_created", (data: { case_id: number }) => {
        setIsLoading(false);
        clearAll();
        navigate(`/cases?case_id=${data.case_id}`);
      });

      // Step 4: Send all case data
      socket.emit("start_case", {
        context: context,
        urls: urls,
        pdf_paths: savedPdfPaths,
        image_paths: savedImagePaths,
      });
    } catch (error) {
      setIsLoading(false);
      toast.error(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col items-center pt-17 pb-28 font-sans overflow-x-hidden relative">
      <div className="w-full max-w-3xl mb-4 relative z-10 flex justify-between items-end">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-white tracking-tight mb-1">
            Upload Case Evidence
          </h1>
          <p className=" text-xs md:text-sm text-slate-400">
            Brief the AI with case facts and evidence to start.
          </p>
        </div>
        <Button
          onClick={() => setIsWalkthroughOpen(true)}
          variant="outline"
          className="bg-purple-950/20 hover:bg-purple-900/30 text-purple-300 hover:text-purple-200 border border-purple-500/30 hover:border-purple-500/50 rounded-xl px-4 py-2 text-xs flex items-center gap-2 transition-all active:scale-95 cursor-pointer"
        >
          <PlayCircle className="w-4 h-4" />
          <span className="">Watch Walkthrough</span>
        </Button>
      </div>

      <div className="w-full max-w-3xl space-y-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <PdfSelectors />
          <ImageSelectors />
        </div>
        <Urls />
        <TextMicInput />

        <div className="flex justify-center">
          <Button
            onClick={handleStart}
            disabled={isLoading || !hasContent}
            className="h-15 w-60 bg-white hover:bg-slate-200 text-black font-black rounded-2xl shadow-[0_0_3.125rem_rgba(255,255,255,0.15)] border border-white/40 flex items-center gap-4 text-xl uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 group relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {isLoading ? "Starting..." : "Start Case"}
            </span>
            <Zap className="w-6 h-6 fill-current text-black animate-pulse group-hover:scale-125 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </div>
      </div>

      {/* Walkthrough Video Modal */}
      <AlertDialog
        open={isWalkthroughOpen}
        onOpenChange={(open) => {
          if (!open) closeWalkthrough();
          else setIsWalkthroughOpen(true);
        }}
      >
        <AlertDialogContent className="w-[calc(100%-2rem)] sm:w-full max-w-2xl! h-[80vh] bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(147,51,234,0.15)] flex flex-col p-0 gap-0">
          {/* Header */}
          <div className="flex justify-between items-center px-4 py-3 sm:px-6 sm:py-4 border-b border-white/5 bg-zinc-950/40 shrink-0">
            <div>
              <AlertDialogTitle className="font-bold text-base sm:text-lg text-white">
                Lexis AI Walkthrough
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[10px] sm:text-xs text-purple-400 font-medium">
                How to test this feature
              </AlertDialogDescription>
            </div>
            <button
              onClick={closeWalkthrough}
              className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Video & Info Container */}
          <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
            <div className="aspect-video w-full rounded-xl overflow-hidden border border-white/5 bg-black relative shrink-0">
              <iframe
                src={DEMO_VIDEO_URL}
                title="Lexis AI Demo Walkthrough"
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Guide steps */}
            <div className="space-y-3 bg-white/1 border border-white/5 p-3.5 sm:p-4 rounded-xl text-sm">
              <h4 className="font-semibold flex items-center gap-2 text-xs uppercase tracking-wider text-purple-300">
                <Info className="w-3.5 h-3.5" /> Quick Testing Guide
              </h4>
              <ul className="space-y-2 text-xs text-slate-400 list-disc list-inside">
                <li>
                  <strong className="text-slate-200">Upload Evidence:</strong>{" "}
                  Paste case context notes, upload a PDF (e.g. medical record or
                  contract), or add a URL.
                </li>
                <li>
                  <strong className="text-slate-200">Start Case:</strong> Click
                  "Start Case" to spin up the background AI researcher (runs
                  CrewAI).
                </li>
              </ul>
            </div>

            {/* Case Generation Test Kit */}
            <div className="bg-white/1 border border-white/5 p-3.5 sm:p-4 rounded-xl text-sm transition-all duration-300">
              <button 
                onClick={() => setIsTestKitExpanded(!isTestKitExpanded)}
                className="w-full flex items-center justify-between text-left group cursor-pointer outline-none"
              >
                <h4 className="font-semibold flex items-center gap-2 text-xs uppercase tracking-wider text-purple-300 group-hover:text-purple-200 transition-colors">
                  <Zap className="w-3.5 h-3.5" /> Case Generation Test Kit
                </h4>
                {isTestKitExpanded ? (
                  <ChevronUp className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors" />
                )}
              </button>
              
              {isTestKitExpanded && (
                <div className="animate-in slide-in-from-top-2 fade-in duration-200 mt-4 relative">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[11px] text-slate-500 font-medium">Use this prompt in ChatGPT/Claude:</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] text-slate-400 bg-white/5 border border-white/10 rounded-md hover:bg-white/10 hover:text-white transition-all cursor-pointer outline-none"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3 h-3 text-green-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Prompt</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-400 bg-black/50 border border-white/5 p-3 rounded-lg select-all leading-relaxed whitespace-pre-wrap">
                    {TEST_KIT_PROMPT}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 px-4 py-3 sm:px-6 sm:py-4 border-t border-white/5 bg-zinc-950/40 shrink-0">
            <Button
              onClick={closeWalkthrough}
              className="bg-white hover:bg-zinc-200 text-black font-semibold rounded-xl w-full sm:w-auto px-5 h-10 transition-all text-xs"
            >
              Let's Get Started
            </Button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BriefingPage;
