"use client";

import Image from "next/image";
import { Users, Settings2, Fuel, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarCardProps {
  car: any;
  onViewDetails: () => void;
}

export default function CarCard({ car, onViewDetails }: CarCardProps) {
  return (
    <div className="group bg-[#0a1118] rounded-xl sm:rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-[#64c5c3]/30 flex flex-col h-full shadow-lg">
      {/* Image Container - Increased to h-32 for better mobile clarity, expands on sm (h-40) */}
      <div className="relative h-32 sm:h-40 w-full bg-black flex items-center justify-center overflow-hidden">
        <Image
          src={
            car.images?.[0] ||
            car.imageUrl ||
            "https://placehold.co/1200x800?text=No+Image"
          }
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
          className="object-cover opacity-80 group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1118] via-transparent to-transparent" />

        {/* Year Badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider z-10">
          {car.year}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-3 sm:p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="mb-2 sm:mb-4 flex items-baseline gap-1.5 sm:gap-2 overflow-hidden">
          <p className="text-[9px] sm:text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest flex-shrink-0">
            {car.brand}
          </p>
          <h3 className="text-xs sm:text-base font-black uppercase text-white leading-tight truncate">
            {car.model}
          </h3>
        </div>

        {/* Specs Row */}
        <div className="hidden sm:grid grid-cols-3 gap-2 mb-5 mt-auto">
          <div className="flex flex-col items-center justify-center gap-1.5 py-2 bg-white/5 rounded-lg border border-white/5">
            <Users className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider">
              {car.seats}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 py-2 bg-white/5 rounded-lg border border-white/5">
            <Settings2 className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider text-center line-clamp-1">
              {car.transmission === "Automatic" ? "Auto" : "Manual"}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 py-2 bg-white/5 rounded-lg border border-white/5">
            <Fuel className="w-3 h-3 text-gray-400" />
            <span className="text-[9px] font-bold text-gray-300 uppercase tracking-wider text-center line-clamp-1">
              {car.fuel}
            </span>
          </div>
        </div>

        {/* Spacer to push footer down on mobile when specs are hidden */}
        <div className="flex-1 sm:hidden" />

        {/* Footer: Price & Action */}
        <div className="pt-2 sm:pt-4 border-t border-white/5 flex items-end justify-between gap-2 mt-auto">
          <div>
            <p className="text-[7px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
              / Day
            </p>
            <p className="text-sm sm:text-lg font-black text-white whitespace-nowrap leading-none">
              ₱{car.price?.toLocaleString()}
            </p>
          </div>

          <Button
            onClick={onViewDetails}
            className="bg-white/5 hover:bg-[#64c5c3] hover:text-black text-white border border-white/10 rounded-lg h-7 sm:h-10 px-2.5 sm:px-4 font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-all duration-300 group/btn"
          >
            <span className="hidden sm:inline mr-1.5">View</span>
            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 sm:group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
