import { Filter, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FilterType = "all" | "date" | "deposition" | "settlement" | "strategic";

interface FilterBarProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
}

const filters: { key: FilterType; label: string; icon?: React.ReactNode }[] = [
  { key: "all", label: "All Cases", icon: <Filter className="w-3.5 h-3.5" /> },
  { key: "date", label: "Date Range", icon: <Calendar className="w-3.5 h-3.5" /> },
  { key: "deposition", label: "Type: Deposition" },
  { key: "settlement", label: "Type: Settlement" },
  { key: "strategic", label: "Type: Strategic" },
];

export const FilterBar = ({ activeFilter, onFilterChange }: FilterBarProps) => {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((f) => (
        <Button
          key={f.key}
          variant="outline"
          onClick={() => onFilterChange(f.key)}
          className={cn(
            "h-9 px-4 rounded-xl text-xs font-bold tracking-wide border gap-1.5 transition-all",
            activeFilter === f.key
              ? "bg-purple-600 border-purple-500 text-white hover:bg-purple-500 shadow-[0_0_12px_rgba(147,51,234,0.3)]"
              : "bg-[#0a0a0a] border-white/10 text-slate-400 hover:text-white hover:bg-white/5"
          )}
        >
          {f.icon}
          {f.label}
        </Button>
      ))}
    </div>
  );
};
