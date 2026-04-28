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
    <div className="flex flex-col h-full w-full relative transition-colors duration-300">
      {/* Content Area */}
      <div className="flex-1 w-full relative mt-2">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 transition-colors rounded-lg">
            <Loader2 className="w-5 h-5 animate-spin text-primary mb-2" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Loading Fleet Data...
            </span>
          </div>
        ) : !utilizationData || utilizationData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/30 rounded-xl border border-dashed border-border z-10 transition-colors">
            <CarFront className="w-6 h-6 text-muted-foreground/30 mb-2 opacity-80" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              No Vehicles Active
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 overflow-y-auto pr-2 space-y-5 custom-scrollbar transition-colors">
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
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-foreground uppercase tracking-tight transition-colors">
                        {car.brand} {car.model}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border uppercase tracking-widest transition-colors">
                        {car.plate_number}
                      </span>
                    </div>
                    <span
                      className={cn(
                        "text-[10px] font-bold font-mono tracking-widest transition-colors",
                        isHigh
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isLow
                            ? "text-amber-600 dark:text-amber-400"
                            : "text-primary",
                      )}
                    >
                      {car.utilization_percentage}%
                    </span>
                  </div>

                  {/* Custom Progress Bar Styling */}
                  <div className="relative h-1.5 w-full bg-secondary rounded-full overflow-hidden transition-colors">
                    <div
                      className={cn(
                        "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out",
                        isHigh
                          ? "bg-emerald-500"
                          : isLow
                            ? "bg-amber-500"
                            : "bg-primary",
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
