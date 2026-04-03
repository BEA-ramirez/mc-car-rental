"use client";

import React from "react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Eye, Settings2, Car, AlertCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

const dummyCar = [
  { model: "Toyota Vios", plate: "ABC-123", availabilityStatus: "Available" },
  { model: "Honda Civic", plate: "DEF-456", availabilityStatus: "Rented" },
  {
    model: "Toyota Corolla",
    plate: "GHI-789",
    availabilityStatus: "Maintenance",
  },
  { model: "Honda Accord", plate: "JKL-012", availabilityStatus: "Available" },
  { model: "Toyota Camry", plate: "MNO-345", availabilityStatus: "Available" },
];

function getStatusStyle(status: string) {
  switch (status.toLowerCase()) {
    case "available":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "rented":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "maintenance":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-slate-50 text-slate-600 border-slate-200";
  }
}

export default function PartnerUnits({
  selectedPartner,
}: {
  selectedPartner: FleetPartnerType | null;
}) {
  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
          Active Fleet Units
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {dummyCar.length} Units Total
        </span>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar px-1">
        <div className="flex flex-col gap-2 pb-6">
          {dummyCar.map((car) => (
            <div
              key={car.plate}
              className="group flex items-center justify-between p-3 rounded-sm border border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm transition-colors shrink-0"
            >
              <div className="flex items-center gap-4">
                {/* Icon Container */}
                <div className="h-10 w-10 rounded-sm bg-slate-50 flex items-center justify-center border border-slate-200 shrink-0">
                  <Car className="w-4 h-4 text-slate-400" />
                </div>

                {/* Info Text */}
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0F172A]">
                      {car.model}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {car.plate}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1 text-[9px] font-bold w-fit h-4 px-1.5 uppercase tracking-widest rounded-[2px]",
                      getStatusStyle(car.availabilityStatus),
                    )}
                  >
                    {car.availabilityStatus}
                  </Badge>
                </div>
              </div>

              {/* Action Menu */}
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-sm shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-none text-slate-400 hover:text-white hover:bg-slate-800 focus:bg-slate-800 outline-none"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-40 rounded-sm border-slate-200 shadow-xl"
                >
                  <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-slate-700 cursor-pointer">
                    <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" /> View
                    Unit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-slate-700 cursor-pointer">
                    <Settings2 className="w-3.5 h-3.5 mr-2 text-slate-400" />{" "}
                    Edit Config
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer">
                    <AlertCircle className="w-3.5 h-3.5 mr-2" /> Offboard Unit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
