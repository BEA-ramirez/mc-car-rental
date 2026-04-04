"use client";

import { Search, SlidersHorizontal, Users, Banknote } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useBookingSettings } from "../../../hooks/use-settings";

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

const TRANSMISSIONS = ["Any", "Auto", "Manual", "CVT"];
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
  const { data: settings, isLoading } = useBookingSettings();

  const rawVehicleTypes = settings?.vehicleTypes || [];
  const activeVehicleTypes = [
    { id: "all", label: "All", isActive: true },
    ...rawVehicleTypes.filter((t: any) => t.isActive),
  ];

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
    // Updated background to have that light white opaque contrast + a stronger border
    <div className="bg-[#161d24] backdrop-blur-2xl rounded-3xl border border-white/20 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.5)] sticky top-28">
      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-4">
        <SlidersHorizontal className="w-5 h-5 text-[#64c5c3]" />
        <h2 className="text-xs font-bold uppercase tracking-widest text-white">
          Refine Search
        </h2>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search brand or model..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-12 h-12 rounded-xl bg-black/50 border-white/10 text-white placeholder:text-gray-500 focus-visible:ring-[#64c5c3] focus-visible:border-transparent font-medium text-sm transition-all"
        />
      </div>

      {/* Vehicle Type */}
      <div className="mb-8">
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center justify-between">
          Vehicle Type
          {isLoading && (
            <span className="text-[8px] text-[#64c5c3] animate-pulse">
              Loading...
            </span>
          )}
        </h3>
        <div className="flex flex-wrap gap-2">
          {activeVehicleTypes.map((cat) => {
            const isActive = filters.type === cat.label;
            return (
              <button
                key={cat.id}
                onClick={() => updateFilter("type", cat.label)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all border",
                  isActive
                    ? "bg-[#64c5c3] text-black border-[#64c5c3]"
                    : "bg-black/30 text-gray-300 border-white/10 hover:border-[#64c5c3]/50 hover:bg-white/5",
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
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
          <Users className="w-3 h-3 text-gray-400" /> Capacity
        </h3>
        <div className="flex flex-wrap gap-2">
          {SEATING_CAPACITIES.map((seat) => {
            const isActive = filters.minSeating === seat.value;
            return (
              <button
                key={seat.label}
                onClick={() => updateFilter("minSeating", seat.value)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all border",
                  isActive
                    ? "bg-[#64c5c3] text-black border-[#64c5c3]"
                    : "bg-black/30 text-gray-300 border-white/10 hover:border-[#64c5c3]/50 hover:bg-white/5",
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
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-4">
          Transmission
        </h3>
        <div className="flex flex-wrap gap-2">
          {TRANSMISSIONS.map((trans) => {
            const isActive = filters.transmission === trans;
            return (
              <button
                key={trans}
                onClick={() => updateFilter("transmission", trans)}
                className={cn(
                  "px-4 py-2 rounded-full text-xs font-bold tracking-wider transition-all border",
                  isActive
                    ? "bg-[#64c5c3] text-black border-[#64c5c3]"
                    : "bg-black/30 text-gray-300 border-white/10 hover:border-[#64c5c3]/50 hover:bg-white/5",
                )}
              >
                {trans}
              </button>
            );
          })}
        </div>
      </div>

      {/* Max Price Slider */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
            <Banknote className="w-3 h-3 text-gray-400" /> Max Daily Rate
          </h3>
          <span className="text-[10px] font-bold tracking-widest text-[#64c5c3]">
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
          className="w-full h-1.5 bg-white/20 rounded-full appearance-none cursor-pointer accent-[#64c5c3]"
        />
        <div className="flex justify-between text-[9px] text-gray-400 tracking-widest font-bold mt-3">
          <span>₱1k</span>
          <span>₱15k+</span>
        </div>
      </div>

      {/* Clear Filters Button */}
      <Button
        variant="ghost"
        onClick={clearAll}
        className="w-full rounded-xl border border-white/20 bg-white/5 text-xs font-bold uppercase tracking-widest text-white hover:bg-[#64c5c3] hover:text-black hover:border-transparent h-12 transition-all duration-300"
      >
        Clear Parameters
      </Button>
    </div>
  );
}
