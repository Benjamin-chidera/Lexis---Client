import { useState } from "react";
import { Link as LinkIcon, Globe, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useBriefingStore } from "@/store/briefingStore";
import { toast } from "sonner";

export const Urls = () => {
  const { urls, addUrl, removeUrl } = useBriefingStore();
  const [input, setInput] = useState("");

  const isValid = (value: string) => {
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  };

  const handleAdd = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (!isValid(trimmed)) {
      toast.error("Please enter a valid URL including https://");
      return;
    }
    addUrl(trimmed);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAdd();
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative group flex-1">
          <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
            <LinkIcon className="w-4 h-4 text-slate-500 group-focus-within:text-purple-400 transition-colors" />
          </div>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter case-related URLs (pacer.gov, news archives, corporate registries)..."
            className="bg-white/3 border-white/10 pl-11 h-14 text-slate-200 placeholder:text-slate-600 focus:border-purple-500/40 focus:ring-purple-500/5 transition-all rounded-2xl backdrop-blur-sm text-sm shadow-lg"
          />
        </div>
        <Button
          type="button"
          onClick={handleAdd}
          disabled={!input}
          className="h-14 w-20   bg-white hover:bg-zinc-200 text-black border border-white/20 rounded-2xl font-bold shrink-0"
        >
          Add
        </Button>
      </div>

      {urls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {urls.map((url, i) => (
            <Badge
              key={`${url}-${i}`}
              className="bg-purple-500/10 text-purple-300 border-purple-500/1.25rem-4 py-2 flex items-center gap-2.5 rounded-full text-xs font-bold tracking-wider backdrop-blur-md max-w-full"
            >
              <Globe className="w-3.5 h-3.5 shrink-0" />
              <span className="truncate max-w-65">{url}</span>
              <button
                type="button"
                onClick={() => removeUrl(i)}
                className="ml-1 text-purple-400/50 hover:text-purple-300 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};
