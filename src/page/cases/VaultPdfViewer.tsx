import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import type { VaultEvidence } from "@/store/casesStore";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Configure worker for PDF parsing
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface VaultPdfViewerProps {
  evidence: VaultEvidence;
}

export const VaultPdfViewer = ({ evidence }: VaultPdfViewerProps) => {
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState<number>(1);

  useEffect(() => {
    if (evidence.file) {
      // It's a local file upload
      const url = URL.createObjectURL(evidence.file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
      };
    } else if (evidence.url) {
      // It's a URL fetched from the backend
      setObjectUrl(evidence.url);
    } else {
      // Fallback
      setObjectUrl(null);
    }
  }, [evidence]);

  function onDocumentLoadSuccess({ numPages }: { numPages: number }) {
    setNumPages(numPages);
    setPageNumber(1);
  }

  if (!objectUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm">
        <p>No PDF source available.</p>
        <p className="text-xs mt-1 text-slate-600">(This case might only have metadata)</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center h-full overflow-y-auto bg-black/40 custom-scrollbar p-2">
      <Document
        file={objectUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        className="max-w-full flex justify-center"
        loading={
          <div className="flex items-center justify-center text-slate-500 py-20 text-sm">
            Parsing PDF Document...
          </div>
        }
      >
        <Page
          pageNumber={pageNumber}
          width={700} // Increased width for the wider vault layout
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="rounded-lg overflow-hidden border border-white/10 shadow-2xl"
        />
      </Document>

      {numPages && numPages > 1 && (
        <div className="flex items-center gap-4 mt-4 bg-[#0a0a0a]/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 sticky bottom-2 z-10 shadow-xl">
          <button
            disabled={pageNumber <= 1}
            onClick={() => setPageNumber((p) => p - 1)}
            className="text-white text-xs disabled:opacity-30 hover:text-purple-400 font-bold transition-colors"
          >
            Prev
          </button>
          <span className="text-[10px] font-bold text-slate-400">
            {pageNumber} / {numPages}
          </span>
          <button
            disabled={pageNumber >= numPages}
            onClick={() => setPageNumber((p) => p + 1)}
            className="text-white text-xs disabled:opacity-30 hover:text-purple-400 font-bold transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};
