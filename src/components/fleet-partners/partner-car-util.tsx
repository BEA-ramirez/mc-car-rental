"use client";

import React from "react";
import { Loader2, CarFront } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePartnerCarUtilization } from "../../../hooks/use-fleetPartners";

interface PartnerCarUtilProps {
  ownerId: string;
}

export default function PartnerCarUtil({ ownerId }: PartnerCarUtilProps) {
  const { data: utilizationData, isLoading } =
    usePartnerCarUtilization(ownerId);

  return (
    <div className="flex flex-col h-full w-full relative">
      <div className="mb-6 shrink-0">
        <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest leading-none">
          Fleet Utilization
        </h3>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1.5">
          Active Usage (Last 30 Days)
        </p>
      </div>

      <div className="flex-1 min-h-0 w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Loading Fleet Data...
            </span>
          </div>
        ) : !utilizationData || utilizationData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-sm border border-dashed border-slate-200 z-10">
            <CarFront className="w-6 h-6 text-slate-300 mb-3 opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              No Vehicles Active
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto pr-3 space-y-5 custom-scrollbar">
            {utilizationData.map((car: any, index: any) => {
              // Determine color based on utilization threshold
              const isHigh = car.utilization_percentage >= 70;
              const isLow = car.utilization_percentage <= 30;

              return (
                <div
                  key={car.car_id || index}
                  className="flex flex-col gap-2 w-full group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-[#0F172A] uppercase tracking-tight">
                        {car.brand} {car.model}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[2px] border border-slate-200 uppercase tracking-widest">
                        {car.plate_number}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold font-mono tracking-widest",
                        isHigh
                          ? "text-emerald-600"
                          : isLow
                            ? "text-amber-600"
                            : "text-slate-600",
                      )}
                    >
                      {car.utilization_percentage}%
                    </span>
                  </div>

                  {/* Custom Progress Bar Styling */}
                  <div className="relative h-1.5 w-full bg-slate-100 rounded-none overflow-hidden">
                    <div
                      className={cn(
                        "absolute top-0 left-0 h-full transition-all duration-1000 ease-out",
                        isHigh
                          ? "bg-emerald-500"
                          : isLow
                            ? "bg-amber-500"
                            : "bg-[#0F172A]",
                      )}
                      style={{
                        width: `${Math.min(100, Math.max(0, car.utilization_percentage))}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
