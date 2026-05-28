import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Zap } from "lucide-react";

import { Button } from "@/components/ui/button";
import { PdfSelectors } from "@/components/bottomNav/pdf-selectors";
import { Urls } from "@/components/bottomNav/urls";
import { ImageSelectors } from "@/components/bottomNav/image-selectors";
import { TextMicInput } from "@/components/bottomNav/text-mic-input";
import { useBriefingStore } from "@/store/briefingStore";
import socket from "@/lib/socket";
import { uploadPdfs, uploadImages } from "@/lib/api";
import { toast } from "sonner";

const BriefingPage = () => {
  const { pdfs, urls, images, context, clearAll } = useBriefingStore();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(false);

  const hasContent =
    pdfs.length > 0 ||
    urls.length > 0 ||
    images.length > 0 ||
    context.trim().length > 0;

  const handleStart = async () => {
    if (!hasContent) {
      toast.error("Add at least one document, URL, image, or context note before starting.");
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
      toast.error(error instanceof Error ? error.message : "Something went wrong.");
    }
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 flex flex-col items-center pt-5 pb-28 px-4 font-sans overflow-x-hidden relative">
      <div className="w-full max-w-3xl mb-4 relative z-10">
        <h1 className="text-4xl font-bold text-white tracking-tight mb-3">
          New Case Intelligence
        </h1>
        <p className="text-slate-400 text-lg font-medium">
          Ingest case documentation and establish strategic parameters.
        </p>
      </div>

      <div className="w-full max-w-3xl space-y-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <PdfSelectors />
           <ImageSelectors />
         </div>
        <Urls />
        <TextMicInput />

        <div className="flex justify-center pt-4">
          <Button
            onClick={handleStart}
            disabled={isLoading || !hasContent}
            className="h-16 px-14 bg-white hover:bg-slate-200 text-black font-black rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.15)] border border-white/40 flex items-center gap-4 text-xl uppercase tracking-[0.15em] transition-all hover:scale-105 active:scale-95 group relative overflow-hidden disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {isLoading ? "Starting..." : "Start Case Strategy"}
            </span>
            <Zap className="w-6 h-6 fill-current text-black animate-pulse group-hover:scale-125 transition-transform relative z-10" />
            <div className="absolute inset-0 bg-linear-to-r from-transparent via-black/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BriefingPage;
