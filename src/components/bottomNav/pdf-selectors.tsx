import { useRef, useState } from "react";
import { FileText, FilePlus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useBriefingStore } from "@/store/briefingStore";

export const PdfSelectors = () => {
  const { pdfs, addPdfs, removePdf } = useBriefingStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const pdfsOnly = Array.from(files).filter((f) =>
      f.type === "application/pdf"
    );
    if (pdfsOnly.length) addPdfs(pdfsOnly);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  return (
    <Card
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={`bg-white/3 border-white/10 p-3 md:p-8 flex flex-col items-center justify-center text-center backdrop-blur-md shadow-2xl relative overflow-hidden group rounded-3xl cursor-pointer transition-all duration-300 ${
        dragging ? "border-purple-500/50 bg-purple-500/5" : ""
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="absolute inset-0 bg-linear-to-b from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="w-10 h-10 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-2 md:mb-4 border border-purple-500/20 shadow-[0_0_1.25rem_rgba(168,85,247,0.15)] group-hover:scale-110 transition-transform duration-300">
        <FilePlus className="w-6 h-6 text-purple-400" />
      </div>
      <h2 className="text-lg md:text-xl font-bold text-white mb-1">
        Deposit Case Evidence
      </h2>
      <p className="text-slate-400 text-xs mb-3 md:mb-6 max-w-md leading-relaxed">
        {dragging
          ? "Drop your PDFs here..."
          : "Add depositions, transcripts, or discovery files here to initiate neural indexing."}
      </p>

      {pdfs.length > 0 && (
        <div
          className="flex gap-2 flex-wrap justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {pdfs.map((file, i) => (
            <Badge
              key={`${file.name}-${i}`}
              variant="secondary"
              className="bg-white/5 text-slate-300 border-white/0.625rem-3 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-all rounded-lg backdrop-blur-sm"
            >
              <FileText className="w-3.5 h-3.5 text-purple-400/80 shrink-0" />
              <span className="text-[0.6875rem] font-medium max-w-30 truncate">
                {file.name}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removePdf(i); }}
                className="ml-1 text-slate-500 hover:text-white transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </Card>
  );
};
