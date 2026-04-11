"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useUrlParams } from "../../../hooks/use-url-params";
import { cn } from "@/lib/utils";

interface SortableHeadProps {
  label: string;
  sortKey: string;
  className?: string;
}

export function SortableHead({ label, sortKey, className }: SortableHeadProps) {
  const { searchParams, setUrlParams } = useUrlParams();

  const currentSort = searchParams.get("sort");
  const isSortedByThisKey = currentSort?.startsWith(sortKey);
  const isDesc = currentSort === `${sortKey}.desc`;

  const handleSort = () => {
    if (!isSortedByThisKey) {
      setUrlParams({ sort: `${sortKey}.asc`, page: "1" });
    } else if (!isDesc) {
      setUrlParams({ sort: `${sortKey}.desc`, page: "1" });
    } else {
      setUrlParams({ sort: null, page: "1" });
    }
  };

  return (
    // Changed from TableHead to a standard div!
    <div
      className={cn(
        "flex items-center cursor-pointer select-none text-muted-foreground hover:text-foreground transition-colors group",
        className,
      )}
      onClick={handleSort}
    >
      {label}
      {isSortedByThisKey ? (
        isDesc ? (
          <ArrowDown className="ml-1.5 h-3 w-3 text-foreground" />
        ) : (
          <ArrowUp className="ml-1.5 h-3 w-3 text-foreground" />
        )
      ) : (
        <ArrowUpDown className="ml-1.5 h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </div>
  );
}
