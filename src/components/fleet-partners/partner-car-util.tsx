"use client";

import React from "react";
import { Progress } from "@/components/ui/progress";

const dummyCarUtilization = [
  { model: "Toyota Vios", plate: "ABC-123", utilization: 66 },
  { model: "Honda Civic", plate: "DEF-456", utilization: 75 },
  { model: "Toyota Corolla", plate: "GHI-789", utilization: 50 },
  { model: "Honda Accord", plate: "JKL-012", utilization: 80 },
  { model: "Toyota Camry", plate: "MNO-345", utilization: 40 },
];

export default function PartnerCarUtil() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-800 leading-none">
          Car Utilization
        </h3>
        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1.5">
          Active Fleet Usage
        </p>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        {dummyCarUtilization.map((car, index) => (
          <div key={index} className="flex flex-col gap-1.5 w-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-700">
                  {car.model}
                </span>
                <span className="text-[9px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {car.plate}
                </span>
              </div>
              <span className="text-[10px] font-bold text-slate-600">
                {car.utilization}%
              </span>
            </div>
            <Progress value={car.utilization} className="h-1.5 bg-slate-100" />
          </div>
        ))}
      </div>
    </div>
  );
}
