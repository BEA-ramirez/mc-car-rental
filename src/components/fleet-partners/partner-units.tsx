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
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "rented":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "maintenance":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    default:
      return "bg-secondary text-muted-foreground border-border";
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
    <div className="flex flex-col h-full w-full bg-transparent relative transition-colors duration-300">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-3 shrink-0 border-b border-border pb-2.5 transition-colors">
        <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-none">
          Active Fleet Units
        </h3>
        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
          {fleetUnits?.length || 0} Units Total
        </span>
      </div>

      {/* List Area */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 transition-colors">
            <Loader2 className="w-5 h-5 animate-spin text-primary mb-2" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Loading Fleet Data...
            </span>
          </div>
        ) : !fleetUnits || fleetUnits.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/30 rounded-xl border border-dashed border-border z-10 transition-colors">
            <Car className="w-6 h-6 text-muted-foreground/30 mb-2 opacity-80" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              No Active Vehicles
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-2 pb-4">
            {fleetUnits.map((car: any) => (
              <div
                key={car.car_id}
                className="group flex items-center justify-between p-2.5 px-3.5 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-sm transition-all shrink-0"
              >
                <div className="flex items-center gap-3.5">
                  {/* Icon Container */}
                  <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center border border-border shrink-0 transition-colors">
                    <Car className="w-4 h-4 text-muted-foreground" />
                  </div>

                  {/* Info Text */}
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-bold text-foreground uppercase tracking-tight transition-colors">
                        {car.brand} {car.model}
                      </span>
                      <span className="text-[9px] font-mono font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border uppercase tracking-widest transition-colors">
                        {car.plate_number}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[8px] font-bold w-fit h-4 px-1.5 uppercase tracking-widest rounded shadow-none transition-colors",
                          getStatusStyle(car.availability_status),
                        )}
                      >
                        {car.availability_status || "Unknown"}
                      </Badge>
                      {/* Optional: Add year and color to make use of the extra RPC data */}
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
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
                      className="h-7 w-7 rounded-lg shrink-0 lg:opacity-0 group-hover:opacity-100 transition-all shadow-none text-muted-foreground hover:text-foreground hover:bg-secondary focus:bg-secondary outline-none"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-40 rounded-xl border-border shadow-xl bg-popover p-1"
                  >
                    <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground focus:bg-secondary focus:text-foreground cursor-pointer rounded-lg transition-colors py-2">
                      <Eye className="w-3.5 h-3.5 mr-2" /> View Unit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground focus:bg-secondary focus:text-foreground cursor-pointer rounded-lg transition-colors py-2">
                      <Settings2 className="w-3.5 h-3.5 mr-2" /> Edit Config
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-border my-1" />
                    <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-lg transition-colors py-2">
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
