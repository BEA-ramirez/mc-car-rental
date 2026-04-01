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
    <div className="group bg-[#111623]/80 backdrop-blur-md rounded-xl border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/20 hover:-translate-y-1 flex flex-col h-full">
      {/* Image Container - Reduced height to h-44 for a tighter card */}
      <div className="relative h-44 w-full bg-[#050608] flex items-center justify-center overflow-hidden border-b border-white/5">
        <Image
          src={
            car.images?.[0] ||
            car.imageUrl ||
            "https://placehold.co/1200x800?text=No+Image"
          }
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover opacity-60 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 group-hover:opacity-100 transition-all duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111623]/80 via-transparent to-transparent opacity-80" />

        {/* Compact Year badge */}
        <div className="absolute top-3 left-3 bg-white/10 backdrop-blur-md border border-white/10 text-white/80 px-2 py-0.5 rounded-sm text-[8px] font-medium tracking-[0.2em] uppercase z-10">
          {car.year}
        </div>
      </div>

      {/* Content Container - Reduced padding to p-4 */}
      <div className="p-4 flex flex-col flex-1">
        <div className="mb-4">
          <p className="text-[8px] font-medium text-blue-500 uppercase tracking-[0.3em] mb-1">
            {car.brand}
          </p>
          <h3 className="text-lg font-light text-white leading-tight tracking-tight">
            {car.model}
          </h3>
        </div>

        {/* Specs Row - Tighter gap, smaller icons, reduced padding */}
        <div className="grid grid-cols-3 gap-1.5 mb-5 mt-auto">
          <div className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white/[0.02] border border-white/5 rounded-sm">
            <Users className="w-3 h-3 text-white/40" />
            <span className="text-[9px] font-medium text-slate-300 tracking-wide">
              {car.seats}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white/[0.02] border border-white/5 rounded-sm">
            <Settings2 className="w-3 h-3 text-white/40" />
            <span className="text-[9px] font-medium text-slate-300 tracking-wide text-center">
              {car.transmission === "Automatic" ? "Auto" : car.transmission}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center gap-1.5 p-2 bg-white/[0.02] border border-white/5 rounded-sm">
            <Fuel className="w-3 h-3 text-white/40" />
            <span className="text-[9px] font-medium text-slate-300 tracking-wide">
              {car.fuel}
            </span>
          </div>
        </div>

        {/* Footer: Price & Action - Compact height and smaller font sizes */}
        <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-auto">
          <div>
            <p className="text-[8px] font-medium text-white/40 uppercase tracking-[0.2em] mb-0.5">
              Daily Rate
            </p>
            <p className="text-lg font-light text-white">
              ₱{car.price.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={onViewDetails}
            variant="outline"
            className="bg-transparent border border-white/20 text-white hover:bg-white hover:text-black rounded-none h-9 px-4 font-bold text-[8px] uppercase tracking-[0.2em] transition-all duration-500 group/btn"
          >
            Inspect{" "}
            <ArrowRight className="w-2.5 h-2.5 ml-1.5 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
          </Button>
        </div>
      </div>
    </div>
  );
}
