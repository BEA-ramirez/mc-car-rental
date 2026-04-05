"use client";

import React from "react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Settings2,
  Car,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePartnerFleetUnits } from "../../../hooks/use-fleetPartners";

function getStatusStyle(status: string) {
  switch (status?.toLowerCase()) {
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
  // Use the hook with the selected partner's ID
  const { data: fleetUnits, isLoading } = usePartnerFleetUnits(
    selectedPartner?.car_owner_id,
  );

  if (!selectedPartner) return null;

  return (
    <div className="flex flex-col h-full w-full bg-transparent relative">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
          Active Fleet Units
        </h3>
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {fleetUnits?.length || 0} Units Total
        </span>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar px-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Loading Fleet Data...
            </span>
          </div>
        ) : !fleetUnits || fleetUnits.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-sm border border-dashed border-slate-200 z-10">
            <Car className="w-6 h-6 text-slate-300 mb-3 opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              No Active Vehicles
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-6">
            {fleetUnits.map((car: any) => (
              <div
                key={car.car_id}
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
                      <span className="text-xs font-bold text-[#0F172A] uppercase">
                        {car.brand} {car.model}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 uppercase tracking-widest">
                        {car.plate_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-bold w-fit h-4 px-1.5 uppercase tracking-widest rounded-[2px]",
                          getStatusStyle(car.availability_status),
                        )}
                      >
                        {car.availability_status || "Unknown"}
                      </Badge>
                      {/* Optional: Add year and color to make use of the extra RPC data */}
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        {car.year} • {car.color}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Menu */}
                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-sm shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity shadow-none text-slate-400 hover:text-[#0F172A] hover:bg-slate-100 focus:bg-slate-100 outline-none"
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
        )}
      </div>
    </div>
  );
}
