"use client";

import React from "react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Settings2,
  ArrowUpRight,
  Car,
  AlertCircle,
} from "lucide-react";
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
    <div className="flex flex-col h-full w-full">
      {/* List Area */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar">
        <div className="divide-y divide-slate-100 border border-slate-200 rounded-lg overflow-hidden bg-white shadow-sm">
          {dummyCar.map((car) => (
            <div
              key={car.plate}
              className="flex items-center justify-between p-3 px-4 hover:bg-slate-50/80 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="h-9 w-9 rounded-md bg-slate-50 flex items-center justify-center border border-slate-100 shrink-0">
                  <Car className="w-4 h-4 text-slate-400" />
                </div>

                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-800">
                      {car.model}
                    </span>
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                      {car.plate}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "mt-1 text-[9px] w-fit h-4 px-1.5 uppercase tracking-wider",
                      getStatusStyle(car.availabilityStatus),
                    )}
                  >
                    {car.availabilityStatus}
                  </Badge>
                </div>
              </div>

              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-400 hover:text-slate-900"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44 rounded-lg">
                  <DropdownMenuItem className="text-xs cursor-pointer">
                    <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" /> View
                    Unit
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-xs cursor-pointer">
                    <Settings2 className="w-3.5 h-3.5 mr-2 text-slate-400" />{" "}
                    Edit Config
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="text-xs text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer">
                    <AlertCircle className="w-3.5 h-3.5 mr-2" /> Offboard Unit
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}
        </div>
      </div>

      {/* Mini-Footer for the list */}
      <div className="mt-3 flex items-center justify-between px-1">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {dummyCar.length} Units Active
        </span>
        <Button
          variant="link"
          className="h-auto p-0 text-[10px] font-bold uppercase text-blue-600"
        >
          Request Expansion <ArrowUpRight className="ml-1 w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}
