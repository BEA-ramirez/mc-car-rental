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
    <div className="bg-[#111623]/50 backdrop-blur-xl rounded-2xl border border-white/5 p-6 shadow-2xl sticky top-28">
      <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
        <SlidersHorizontal className="w-4 h-4 text-blue-500" />
        <h2 className="text-[10px] font-medium uppercase tracking-[0.2em] text-white">
          Refine Search
        </h2>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-white/30" />
        <Input
          placeholder="Search brand or model..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="pl-12 h-11 rounded-none bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-1 focus-visible:ring-blue-500 font-light text-sm transition-colors"
        />
      </div>

      {/* Vehicle Type */}
      <div className="mb-8">
        <h3 className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/60 mb-4 flex items-center justify-between">
          Vehicle Type
          {isLoading && (
            <span className="text-[8px] text-blue-400 animate-pulse">
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
                  "px-4 py-2 rounded-sm text-[10px] font-medium tracking-wide transition-all border",
                  isActive
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-transparent text-white/50 border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20",
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
        <h3 className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/60 mb-4 flex items-center gap-2">
          <Users className="w-3 h-3 text-white/30" /> Capacity
        </h3>
        <div className="flex flex-wrap gap-2">
          {SEATING_CAPACITIES.map((seat) => {
            const isActive = filters.minSeating === seat.value;
            return (
              <button
                key={seat.label}
                onClick={() => updateFilter("minSeating", seat.value)}
                className={cn(
                  "px-4 py-2 rounded-sm text-[10px] font-medium tracking-wide transition-all border",
                  isActive
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-transparent text-white/50 border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20",
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
        <h3 className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/60 mb-4">
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
                  "px-4 py-2 rounded-sm text-[10px] font-medium tracking-wide transition-all border",
                  isActive
                    ? "bg-white text-black border-white shadow-sm"
                    : "bg-transparent text-white/50 border-white/10 hover:bg-white/5 hover:text-white hover:border-white/20",
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
          <h3 className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/60 flex items-center gap-2">
            <Banknote className="w-3 h-3 text-white/30" /> Max Daily Rate
          </h3>
          <span className="text-[10px] font-medium tracking-widest text-blue-400">
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
          className="w-full h-1 bg-white/10 rounded-none appearance-none cursor-pointer accent-white"
        />
        <div className="flex justify-between text-[9px] text-white/30 tracking-widest font-medium mt-3">
          <span>₱1k</span>
          <span>₱15k+</span>
        </div>
      </div>

      {/* Clear Filters Button */}
      <Button
        variant="ghost"
        onClick={clearAll}
        className="w-full rounded-none border border-white/10 text-[9px] uppercase tracking-[0.2em] text-white/50 hover:text-white hover:bg-white/5 font-medium h-12 transition-all duration-300"
      >
        Clear Parameters
      </Button>
    </div>
  );
}
