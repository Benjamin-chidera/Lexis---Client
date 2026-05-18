import { useState, useEffect } from "react";
import { Briefcase, FileText, Globe, Image as ImageIcon, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useCasesStore } from "@/store/casesStore";
import type { VaultEvidence } from "@/store/casesStore";
import { VaultPdfViewer } from "./VaultPdfViewer";
import { VaultUrlCard } from "./VaultUrlCard";

interface CaseVaultPanelProps {
  caseId: string;
  vault: VaultEvidence[];
}

export const CaseVaultPanel = ({ caseId, vault }: CaseVaultPanelProps) => {
  const { removeFromVault } = useCasesStore();

  // Which category is active
  const [activeCategory, setActiveCategory] = useState<"pdf" | "image" | "url">("pdf");
  // Which vault item the user is currently viewing
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Auto-select the first item in the category whenever the category or vault changes
  useEffect(() => {
    const itemsInCategory = vault.filter((v) => v.type === activeCategory);
    if (itemsInCategory.length === 0) {
      setSelectedId(null);
      return;
    }

    const selectedStillExists = itemsInCategory.some((item) => item.id === selectedId);

    if (!selectedStillExists) {
      // Default to first item if nothing valid is selected in this category
      setSelectedId(itemsInCategory[0].id);
    }
  }, [vault, activeCategory, selectedId]);

  // Find the full evidence object for whatever is selected
  const selectedEvidence = vault.find((item) => item.id === selectedId) ?? null;

  const handleRemove = (evidenceId: string) => {
    removeFromVault(caseId, evidenceId);
    // The useEffect above will handle re-selecting after vault updates
  };

  // --- Empty state ---
  if (vault.length === 0) {
    return (
      <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl">
        <VaultHeader count={0} />
        <div className="flex-1 flex flex-col items-center justify-center py-16 text-center px-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-4">
            <Briefcase className="w-7 h-7 text-blue-400/40" />
          </div>
          <p className="text-slate-600 text-sm font-medium">Vault is empty</p>
          <p className="text-slate-700 text-xs mt-1">
            Use the paperclip button to add PDFs or URLs
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#0a0a0a] border border-white/5 rounded-[24px] overflow-hidden shadow-2xl">
      <VaultHeader count={vault.length} />

      {/* Categories */}
      <div className="px-4 py-3 flex items-center gap-3 border-b border-white/5 bg-[#0a0a0a]/30 shrink-0">
        <button
          onClick={() => setActiveCategory("pdf")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeCategory === "pdf"
              ? "bg-orange-500/20 text-orange-400 border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)]"
              : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-white"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          PDF
          <Badge className="ml-1 bg-black/40 text-current border-0 px-1.5 py-0 rounded-md">
            {vault.filter((v) => v.type === "pdf").length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveCategory("url")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeCategory === "url"
              ? "bg-purple-500/20 text-purple-400 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
              : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-white"
          }`}
        >
          <Globe className="w-3.5 h-3.5" />
          URL
          <Badge className="ml-1 bg-black/40 text-current border-0 px-1.5 py-0 rounded-md">
            {vault.filter((v) => v.type === "url").length}
          </Badge>
        </button>
        <button
          onClick={() => setActiveCategory("image")}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            activeCategory === "image"
              ? "bg-blue-500/20 text-blue-400 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.15)]"
              : "bg-white/5 text-slate-400 border border-transparent hover:bg-white/10 hover:text-white"
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          Image
          <Badge className="ml-1 bg-black/40 text-current border-0 px-1.5 py-0 rounded-md">
            {vault.filter((v) => v.type === "image").length}
          </Badge>
        </button>
      </div>

      {/* Tab strip — scrolls horizontally if there are many items */}
      <div className="px-3 pt-3 flex gap-1.5 overflow-x-auto flex-nowrap border-b border-white/5 shrink-0 pb-0">
        {vault
          .filter((v) => v.type === activeCategory)
          .map((item) => (
            <VaultTab
              key={item.id}
              item={item}
              isSelected={item.id === selectedId}
              onClick={() => setSelectedId(item.id)}
              onRemove={() => handleRemove(item.id)}
            />
          ))}
      </div>

      {/* Viewer area — takes up remaining height */}
      <div className="flex-1 overflow-hidden">
        {selectedEvidence === null && (
          <div className="flex items-center justify-center h-full text-slate-600 text-sm">
            Select an item above
          </div>
        )}

        {selectedEvidence !== null && selectedEvidence.type === "pdf" && (
          <VaultPdfViewer evidence={selectedEvidence} />
        )}

        {selectedEvidence !== null && selectedEvidence.type === "url" && (
          <VaultUrlCard evidence={selectedEvidence} />
        )}

        {selectedEvidence !== null && selectedEvidence.type === "image" && (
          <div className="flex items-center justify-center h-full p-4 bg-black/40">
             {selectedEvidence.file ? (
                <img 
                   src={URL.createObjectURL(selectedEvidence.file)} 
                   alt={selectedEvidence.name}
                   className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10"
                />
             ) : selectedEvidence.url ? (
                <img 
                   src={selectedEvidence.url} 
                   alt={selectedEvidence.name}
                   className="max-w-full max-h-full object-contain rounded-xl shadow-2xl border border-white/10"
                />
             ) : (
                <div className="text-slate-500 text-sm">Image not available</div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Sub-components ---

const VaultHeader = ({ count }: { count: number }) => (
  <div className="px-6 py-4 flex items-center justify-between border-b border-white/5 bg-[#0a0a0a]/50 backdrop-blur-sm shrink-0">
    <div className="flex items-center gap-3">
      <Briefcase className="w-5 h-5 text-blue-400" />
      <h2 className="text-lg font-bold text-white tracking-tight">Vault</h2>
    </div>
    <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20 px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
      {count} {count === 1 ? "item" : "items"}
    </Badge>
  </div>
);

interface VaultTabProps {
  item: VaultEvidence;
  isSelected: boolean;
  onClick: () => void;
  onRemove: () => void;
}

const VaultTab = ({ item, isSelected, onClick, onRemove }: VaultTabProps) => {
  const activeStyle =
    item.type === "pdf"
      ? "bg-orange-500/10 text-orange-300 border-orange-500/25"
      : item.type === "image"
      ? "bg-blue-500/10 text-blue-300 border-blue-500/25"
      : "bg-purple-500/10 text-purple-300 border-purple-500/25";

  const inactiveStyle =
    "bg-white/[0.02] text-slate-500 border-white/5 hover:text-slate-300 hover:bg-white/5";

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-t-xl text-[11px] font-semibold transition-all border-t border-x whitespace-nowrap mb-0 ${
        isSelected ? activeStyle : inactiveStyle
      }`}
    >
      {item.type === "pdf" && <FileText className="w-3.5 h-3.5 shrink-0" />}
      {item.type === "url" && <Globe className="w-3.5 h-3.5 shrink-0" />}
      {item.type === "image" && <ImageIcon className="w-3.5 h-3.5 shrink-0" />}

      {/* Truncate long filenames */}
      <span className="max-w-[110px] truncate">{item.name}</span>

      {/* Remove button — stop propagation so click doesn't also trigger onClick */}
      <span
        role="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="ml-0.5 text-slate-600 hover:text-red-400 transition-colors cursor-pointer"
      >
        <X className="w-3 h-3" />
      </span>
    </button>
  );
};
