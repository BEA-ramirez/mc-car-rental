"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useUrlParams } from "../../../hooks/use-url-params";
import { useEffect, useState } from "react";
import { useDebounce } from "../../../hooks/use-debounce"; // Assuming you have this!
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TableToolbarProps {
  searchPlaceholder?: string;
  filterKey?: string; // e.g., "status"
  filterOptions?: { label: string; value: string }[];
}

export function TableToolbar({
  searchPlaceholder = "Search...",
  filterKey,
  filterOptions,
}: TableToolbarProps) {
  const { searchParams, setUrlParams } = useUrlParams();

  // Local state for the input so it feels snappy to type
  const [searchTerm, setSearchTerm] = useState(
    searchParams.get("search") || "",
  );
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Sync debounced search to URL
  useEffect(() => {
    // Only update if it actually changed to prevent infinite loops
    if (debouncedSearch !== (searchParams.get("search") || "")) {
      setUrlParams({ search: debouncedSearch, page: "1" });
    }
  }, [debouncedSearch, searchParams, setUrlParams]);

  return (
    <div className="flex items-center gap-3 py-4">
      {/* Search Input */}
      <div className="relative w-full max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8 h-9 text-xs bg-card border-border shadow-sm focus-visible:ring-1"
        />
      </div>

      {/* Optional Dropdown Filter (e.g., Status: Completed/Voided) */}
      {filterKey && filterOptions && (
        <Select
          value={searchParams.get(filterKey) || "ALL"}
          onValueChange={(val) =>
            setUrlParams({ [filterKey]: val === "ALL" ? null : val, page: "1" })
          }
        >
          <SelectTrigger className="h-9 w-[150px] text-xs font-semibold shadow-sm">
            <SelectValue placeholder="Filter..." />
          </SelectTrigger>
          <SelectContent className="rounded-xl shadow-xl">
            <SelectItem
              value="ALL"
              className="text-xs font-bold text-muted-foreground"
            >
              All
            </SelectItem>
            {filterOptions.map((opt) => (
              <SelectItem
                key={opt.value}
                value={opt.value}
                className="text-xs font-medium"
              >
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
