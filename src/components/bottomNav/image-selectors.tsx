import { useRef, useState } from "react";
import { FileImage, X, ImagePlus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useBriefingStore } from "@/store/briefingStore";

export const ImageSelectors = () => {
  const { images, addImages, removeImage } = useBriefingStore();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const imagesOnly = Array.from(files).filter((f) =>
      f.type.startsWith("image/")
    );
    if (imagesOnly.length) addImages(imagesOnly);
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
      className={`bg-white/3 border-white/10 p-8 flex flex-col items-center justify-center text-center backdrop-blur-md shadow-2xl relative overflow-hidden group rounded-3xl cursor-pointer transition-all duration-300 ${
        dragging ? "border-blue-500/50 bg-blue-500/5" : ""
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        onClick={(e) => e.stopPropagation()}
      />

      <div className="absolute inset-0 bg-linear-to-b from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

      <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.15)] group-hover:scale-110 transition-transform duration-300">
        <ImagePlus className="w-6 h-6 text-blue-400" />
      </div>
      <h2 className="text-xl font-bold text-white mb-1">
        Visual Evidence
      </h2>
      <p className="text-slate-400 text-xs mb-6 max-w-md leading-relaxed">
        {dragging
          ? "Drop your images here..."
          : "Add court exhibits, diagrams, or site photographs for multimodal analysis."}
      </p>

      {images.length > 0 && (
        <div
          className="flex gap-2 flex-wrap justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((file, i) => (
            <Badge
              key={`${file.name}-${i}`}
              variant="secondary"
              className="bg-white/5 text-slate-300 border-white/10 px-3 py-1.5 flex items-center gap-2 hover:bg-white/10 transition-all rounded-lg backdrop-blur-sm"
            >
              <FileImage className="w-3.5 h-3.5 text-blue-400/80 shrink-0" />
              <span className="text-[11px] font-medium max-w-[120px] truncate">
                {file.name}
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeImage(i); }}
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
