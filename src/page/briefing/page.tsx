import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Zap,
  PlayCircle,
  X,
  Info,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
} from "lucide-react";

// REPLACE THIS URL with your own Loom or YouTube embed link (e.g. https://www.youtube.com/embed/...)
const DEMO_VIDEO_URL =
  "https://player.vimeo.com/video/1205495312?badge=0&autopause=0&player_id=0&app_id=58479";

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

const TEST_KIT_PROMPT = `ROLE

You are a Senior UK Legal Scenario Engineer.

Your task is to construct a fictional but professionally realistic litigation case pack that resembles the evidence bundle a UK solicitor might receive during the early stages of a dispute.

The case pack is intended solely for benchmarking an AI legal assistant. It should be internally consistent, legally realistic, and concise enough to fit within a single response while still requiring cross-document reasoning.

Everything must be fictional.

Do not use the names of real companies, employees, claimants, or disputes.

Use realistic UK legal drafting conventions.

STEP 1 — Select the Matter

Choose exactly one:

UK Workplace Negligence / Health & Safety
UK Employment Dispute
UK Commercial Breach of Contract
UK Breach of Confidence / Trade Secrets
UK Defamation / IP Infringement / Passing Off

State your choice.

Ground every document in the correct legislation and regulatory framework.

STEP 2 — Generate the Benchmark Case Pack

Create 12–15 concise but realistic documents.

Each document should be approximately 150–350 words.

Do not generate placeholder text.

Every document must share the same:

Case Reference
Company
Employee IDs
Asset IDs (if applicable)
Contract references
Ticket numbers
Certificate numbers

The warning signs must pre-date the triggering event.

Required Documents
Internal
Incident Report
Internal Investigation Report
Audit Report
Maintenance Log / HR Record / Contract Register
Risk Assessment
Training Record
Relevant Policy Extract
Timeline Summary
Communications
Supervisor Email
Management Email
Short Email Chain (2–4 emails)
Teams or Slack Conversation
Meeting Minutes
External

Generate whichever are appropriate for the chosen practice area:

Witness Statement
Contractor Report
Customer Complaint
Occupational or Medical Summary

If the chosen matter is Defamation / IP Infringement / Passing Off, also generate:

Cease and Desist Letter
Copy or Extract of the Allegedly Infringing/Defamatory Material (as published by the third party, reproduced fictionally)

Each document should include realistic:

dates
signatures or approval blocks
document owners
version numbers
internal reference numbers

STEP 3 — Cross-Document Reasoning

Embed 8–12 subtle factual inconsistencies across the documents.

Examples include:

inconsistent dates
conflicting serial numbers
certificate validity issues
maintenance timing
policy version mismatch
contradictory witness recollections
email inconsistencies
revision conflicts

Do not identify or explain them.

Lexis should discover them.

STEP 4 — Image Evidence Guide

Provide 3–5 search queries (3–6 words each).

Each should represent realistic evidence a solicitor might obtain.

For each query, identify the anticipated defence it would help rebut.

Do not fabricate photographs.

STEP 5 — Case Vault Web Evidence (Input)

Assume the solicitor can upload webpages directly into Lexis as an evidence ingestion tool — this is not a link to a Case Management System (CMS) profile such as Clio or MyCase. The purpose is for the AI to scrape, read, and analyse the contents of a given webpage just as it would a PDF.

These are inputs, not research outputs.

For each recommended webpage, provide:

webpage type
why it should be ingested
expected evidential value

Include, as relevant to the chosen matter:

Company policy webpage (e.g. Terms of Service, Privacy Policy, Return Policy — for breach of contract matters, to confirm the exact policy version live at the relevant date)
Regulator guidance webpage
Legislation webpage
Public announcement, press release, or regulatory filing (to establish what the company knew and when — public disclosure timing)
Third-party website containing the allegedly infringing, defamatory, or misappropriated content (e.g. a competitor's site, a blog post, or republished material — for defamation, IP infringement, or breach of confidence matters, to evidence the offending publication itself)

If live browsing is unavailable, state that live URLs cannot be retrieved and specify the type of webpage instead.

Do not invent URLs.

STEP 6 — Legal Research Targets

Identify the legal authorities Lexis should research after ingesting the evidence.

Include:

legislation
regulator guidance
leading case law

List only the authorities.

Do not summarise them.

If browsing is available, use official sources.

STEP 7 — Case Context

Write a 3–5 sentence paragraph suitable for Lexis.

Reference the document numbers.

Identify the anticipated defence.

Instruct Lexis to:

build the chronology
compare all documents
identify inconsistencies
determine whether policies, records and communications align
identify missing disclosure
identify leverage points

Do not explain where the inconsistencies are.

Constraints

Do NOT:

invent real litigation
accuse real companies
fabricate legislation
fabricate court decisions
explain the hidden discrepancies
use placeholder text
produce more than 15 documents

The objective is to create a compact but realistic benchmark case pack that exercises
document ingestion, evidence synthesis, chronology reconstruction, legal research, and cross-document reasoning while
remaining small enough to fit comfortably within a single AI response.`;

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

  const hasContext = context.trim().length > 0;

  const handleStart = async () => {
    if (!hasContext) {
      toast.error(
        "Please describe the case context before starting.",
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
            disabled={isLoading || !hasContext}
            title={!hasContext ? "Add case context to start" : ""}
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
                    <span className="text-[11px] text-slate-500 font-medium">
                      Use this prompt in ChatGPT/Claude:
                    </span>
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
