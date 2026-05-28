import { useState, useEffect } from "react";
import { Sparkles, Globe, ExternalLink, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";
import type { VaultEvidence } from "@/store/casesStore";
import { toast } from "sonner";

interface VaultUrlCardProps {
  evidence: VaultEvidence;
}

export const VaultUrlCard = ({ evidence }: VaultUrlCardProps) => {
  const [summary, setSummary] = useState<string>(evidence.summary || "");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    // If the backend has already generated and provided the summary, use it instantly.
    if (evidence.summary) {
      setSummary(evidence.summary);
      setIsLoading(false);
      return;
    }

    // Fallback: If summary is empty (e.g. still generating in background or old case),
    // we can either show a processing state or try to fetch it.
    // For now, we'll try to fetch it live to ensure it displays eventually.
    if (!evidence.url) return;

    let isMounted = true;
    const fetchSummary = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/vault/summarize-url`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: evidence.url }),
        });

        if (!res.ok) throw new Error("Failed to fetch summary");

        const data = await res.json();
        if (isMounted) {
          setSummary(data.summary);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load summary");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchSummary();

    return () => {
      isMounted = false;
    };
  }, [evidence.url, evidence.summary]);

  return (
    <div className="flex flex-col h-full bg-black/80 overflow-y-auto custom-scrollbar">
      {/* Header section fixed to top of scroll area */}
      <div className="w-full max-w-3xl mx-auto p-8 pb-4 shrink-0">
        <div className="flex items-center justify-between border-b border-white/10 pb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center border border-purple-500/20">
              <Globe className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">Web Intelligence</h3>
              <a 
                href={evidence.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-xs text-slate-400 hover:text-purple-300 font-mono flex items-center gap-1.5 transition-colors mt-1"
              >
                {evidence.url}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
          
          <div className="px-3 py-1.5 bg-white/5 rounded-lg border border-white/10 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span className="text-[10px] text-slate-300 font-bold uppercase tracking-widest">AI Extracted</span>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="w-full max-w-3xl mx-auto px-8 pb-12 flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64 space-y-4">
            <RefreshCw className="w-8 h-8 text-purple-500/50 animate-spin" />
            <p className="text-slate-400 text-sm font-medium animate-pulse">Extracting and summarizing web page...</p>
          </div>
        ) : (
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-8 shadow-2xl">
            <ReactMarkdown
              components={{
                h1: ({node, ...props}) => <h1 className="text-2xl font-bold text-white mb-6 border-b border-white/10 pb-4" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-semibold text-purple-300 mt-8 mb-4 flex items-center gap-2 before:content-[''] before:block before:w-1.5 before:h-1.5 before:bg-purple-500 before:rounded-full" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-md font-medium text-slate-200 mt-6 mb-3" {...props} />,
                p: ({node, ...props}) => <p className="text-slate-300 leading-relaxed mb-4 text-sm" {...props} />,
                ul: ({node, ...props}) => <ul className="space-y-2 mb-6" {...props} />,
                li: ({node, ...props}) => (
                  <li className="flex gap-3 text-slate-300 text-sm">
                    <span className="text-purple-500 mt-0.5 shrink-0">•</span>
                    <span {...props} />
                  </li>
                ),
                strong: ({node, ...props}) => <strong className="font-bold text-white" {...props} />,
              }}
            >
              {summary || "*No content extracted.*"}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

