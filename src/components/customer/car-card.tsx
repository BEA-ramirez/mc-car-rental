"use client";

import Image from "next/image";
import { Users, Settings2, Fuel } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CarCardProps {
  car: any;
  onViewDetails: () => void;
}

export default function CarCard({ car, onViewDetails }: CarCardProps) {
  return (
    <div className="group bg-white rounded-3xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image Container */}
      <div className="relative h-44 w-full bg-slate-100 flex items-center justify-center border-b border-slate-100/50">
        <Image
          src={
            car.images?.[0] ||
            car.imageUrl ||
            "https://placehold.co/600x400?text=No+Image"
          }
          alt={`${car.brand} ${car.model}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-contain group-hover:scale-105 transition-transform duration-500 ease-in-out p-4"
        />
        {/* Year badge */}
        <div className="absolute top-3 left-3 bg-slate-500 text-white px-3 py-1 rounded-full text-[11px] font-black tracking-wide shadow-sm z-10">
          {car.year}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex justify-between items-start mb-3">
          <div>
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">
              {car.brand}
            </p>
            <h3 className="text-lg font-black text-slate-900 leading-tight">
              {car.model}
            </h3>
          </div>
        </div>

        {/* Specs Row */}
        <div className="flex flex-wrap gap-1.5 mb-4 mt-auto">
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-md text-[11px] font-bold text-slate-700">
            <Users className="w-3.5 h-3.5 text-slate-500" /> {car.seats}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-md text-[11px] font-bold text-slate-700">
            <Settings2 className="w-3.5 h-3.5 text-slate-500" />{" "}
            {car.transmission === "Automatic" ? "Auto" : car.transmission}
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100/80 px-2 py-1 rounded-md text-[11px] font-bold text-slate-700">
            <Fuel className="w-3.5 h-3.5 text-slate-500" /> {car.fuel}
          </div>
        </div>

        {/* Footer: Price & Action  */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
              Daily Rate
            </p>
            <p className="text-xl font-black text-blue-600">
              ₱{car.price.toLocaleString()}
            </p>
          </div>
          <Button
            onClick={onViewDetails}
            size="sm"
            className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-5 font-bold shadow-md transition-all"
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}
