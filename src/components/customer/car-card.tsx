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
    <div className="group bg-[#0a1118] rounded-2xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-[#64c5c3]/30 flex flex-col h-full shadow-lg">
      {/* Image Container - Highly compact on mobile (h-28), scales up on sm (h-36) */}
      <div className="relative h-28 sm:h-36 w-full bg-black flex items-center justify-center overflow-hidden">
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

        {/* Compact Year Badge */}
        <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider z-10">
          {car.year}
        </div>
      </div>

      {/* Content Container - Tighter padding */}
      <div className="p-3 sm:p-4 flex flex-col flex-1">
        <div className="mb-3">
          <p className="text-[9px] font-bold text-[#64c5c3] uppercase tracking-widest mb-0.5 line-clamp-1">
            {car.brand}
          </p>
          <h3 className="text-sm sm:text-base font-black uppercase text-white leading-tight line-clamp-1">
            {car.model}
          </h3>
        </div>

        {/* Specs Row - Ultra compact pills */}
        <div className="grid grid-cols-3 gap-1.5 mb-4 mt-auto">
          <div className="flex flex-col items-center justify-center gap-1 py-1.5 bg-white/5 rounded-lg border border-white/5">
            <Users className="w-3 h-3 text-gray-400" />
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-300 uppercase tracking-wider">
              {car.seats}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 py-1.5 bg-white/5 rounded-lg border border-white/5">
            <Settings2 className="w-3 h-3 text-gray-400" />
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-300 uppercase tracking-wider text-center line-clamp-1">
              {car.transmission === "Automatic" ? "Auto" : "Manual"}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1 py-1.5 bg-white/5 rounded-lg border border-white/5">
            <Fuel className="w-3 h-3 text-gray-400" />
            <span className="text-[8px] sm:text-[9px] font-bold text-gray-300 uppercase tracking-wider text-center line-clamp-1">
              {car.fuel}
            </span>
          </div>
        </div>

        {/* Footer: Price & Action */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between mt-auto gap-2">
          <div>
            <p className="text-[8px] sm:text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-0.5">
              / Day
            </p>
            <p className="text-sm sm:text-lg font-black text-white whitespace-nowrap">
              ₱{car.price.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={onViewDetails}
            className="bg-white/5 hover:bg-[#64c5c3] hover:text-black text-white border border-white/10 rounded-lg h-8 sm:h-10 px-2 sm:px-4 font-bold text-[9px] sm:text-xs uppercase tracking-widest transition-all duration-300 group/btn"
          >
            <span className="hidden sm:inline mr-1">View</span>
            <ArrowRight className="w-3 h-3 sm:group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}
