"use client";

import { Search, SlidersHorizontal, Users, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useBookingSettings } from "../../../hooks/use-settings";

// Export an interface so the parent page knows what shape the filters are
export interface FilterState {
  search: string;
  type: string;
  transmission: string;
  minSeating: number | null;
  maxPrice: number | null;
}

interface FleetFiltersProps {
  filters: FilterState;
  setFilters: (filters: FilterState) => void;
}

const TRANSMISSIONS = ["Any", "Automatic", "Manual"];
const SEATING_CAPACITIES = [
  { label: "Any", value: null },
  { label: "4+ Seats", value: 4 },
  { label: "5+ Seats", value: 5 },
  { label: "7+ Seats", value: 7 },
  { label: "10+ Seats", value: 10 },
];

export default function FleetFilters({
  filters,
  setFilters,
}: FleetFiltersProps) {
  // Pull real vehicle types from DB settings
  const { data: settings, isLoading } = useBookingSettings();

  // Safely extract the active vehicle types from the settings object
  // (Checking both variations just in case the hook mapping was missed)

  const rawVehicleTypes = settings?.vehicleTypes || [];
  const activeVehicleTypes = [
    { id: "all", label: "All", isActive: true },
    ...rawVehicleTypes.filter((t: any) => t.isActive),
  ];

  // Helper to update a single filter field
  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearAll = () => {
    setFilters({
      search: "",
      type: "All",
      transmission: "Any",
      minSeating: null,
      maxPrice: null,
    });
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-sm sticky top-24">
      <div className="flex items-center gap-2 mb-6">
        <SlidersHorizontal className="w-5 h-5 text-blue-600" />
        <h2 className="text-lg font-bold text-slate-900">Filter Search</h2>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search brand or model..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
        />
      </div>

      {/* Vehicle Type (Dynamic from DB) */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center justify-between">
          Vehicle Type
          {isLoading && (
            <span className="text-[10px] text-slate-400 font-normal animate-pulse">
              Loading...
            </span>
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
          {/* If it's loading, we just show 'All' temporarily to avoid layout shifts */}
          {activeVehicleTypes.map((cat) => {
            const isActive = filters.type === cat.label;
            return (
              <button
                key={cat.id}
                onClick={() => updateFilter("type", cat.label)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100 hover:border-slate-200",
                )}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seating Capacity */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <Users className="w-4 h-4 text-slate-400" /> Seating Capacity
        </h3>
        <div className="flex flex-wrap gap-2">
          {SEATING_CAPACITIES.map((seat) => {
            const isActive = filters.minSeating === seat.value;
            return (
              <button
                key={seat.label}
                onClick={() => updateFilter("minSeating", seat.value)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100 hover:border-slate-200",
                )}
              >
                {seat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transmission */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-slate-900 mb-3">Transmission</h3>
        <div className="flex flex-wrap gap-2">
          {TRANSMISSIONS.map((trans) => {
            const isActive = filters.transmission === trans;
            return (
              <button
                key={trans}
                onClick={() => updateFilter("transmission", trans)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold transition-all border",
                  isActive
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-100 hover:border-slate-200",
                )}
              >
                {trans}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-slate-400" /> Max Daily Rate
          </h3>
          <span className="text-xs font-bold text-blue-600">
            {filters.maxPrice ? `₱${filters.maxPrice.toLocaleString()}` : "Any"}
          </span>
        </div>
        <input
          type="range"
          min="1000"
          max="15000"
          step="500"
          value={filters.maxPrice || 15000}
          onChange={(e) => updateFilter("maxPrice", Number(e.target.value))}
          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <div className="flex justify-between text-[10px] text-slate-400 font-bold mt-2">
          <span>₱1k</span>
          <span>₱15k+</span>
        </div>
      </div>

      {/* Clear Filters Button */}
      <Button
        variant="ghost"
        onClick={clearAll}
        className="w-full rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 font-bold h-12"
      >
        Clear All Filters
      </Button>
    </div>
  );
}
