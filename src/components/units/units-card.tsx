"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Fuel,
  Users,
  EllipsisVertical,
  Trash2,
  Pen,
  Eye,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CompleteCarType } from "@/lib/schemas/car";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface UnitsCardProps {
  unit: CompleteCarType;
  onRequestDelete: (unit: CompleteCarType) => void;
  onEdit: () => void;
}

export default function UnitsCard({
  unit,
  onRequestDelete,
  onEdit,
}: UnitsCardProps) {
  const router = useRouter(); // <-- INITIALIZE ROUTER
  const specifications = unit.specifications;
  const primaryImage =
    unit.images?.find((img) => img.is_primary)?.image_url ||
    unit.images?.[0]?.image_url ||
    "https://placehold.co/600x400?text=No+Image";

  const getStatusBadgeStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "available":
        return "bg-emerald-500 text-white border-transparent shadow-md";
      case "maintenance":
        return "bg-orange-500 text-white border-transparent shadow-md";
      case "rented":
      case "ongoing":
      case "deployed":
        return "bg-blue-500 text-white border-transparent shadow-md";
      default:
        return "bg-slate-700 text-white border-transparent shadow-md";
    }
  };

  // Handler for navigation
  const handleViewDetails = () => {
    // Assuming your routing structure is /admin/units/[carId]
    // Adjust the base path if your folder structure is different
    router.push(`/admin/units/${unit.car_id}`);
  };

  return (
    <Card className="w-full rounded-xl overflow-hidden border-border shadow-sm flex flex-col bg-card transition-all hover:shadow-md hover:border-primary/50 group cursor-default">
      {/* --- COMPACT IMAGE SECTION --- */}
      <div
        className="relative h-36 w-full bg-muted overflow-hidden shrink-0 cursor-pointer"
        onClick={handleViewDetails}
      >
        <Image
          src={primaryImage}
          alt={`${unit.brand} ${unit.model}`}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 opacity-90 group-hover:opacity-100"
        />

        {/* Top Overlay: Solid Status Badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] uppercase tracking-widest px-2 py-0.5 shadow-sm font-bold",
              getStatusBadgeStyle(unit.availability_status || ""),
            )}
          >
            {unit.availability_status}
          </Badge>
        </div>

        {/* Bottom Gradient Overlay: Plate & Price */}
        <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-2 z-10">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-mono font-bold text-white bg-black/50 px-1.5 py-0.5 rounded border border-white/10 backdrop-blur-md shadow-sm">
              {unit.plate_number}
            </span>
            <div className="flex items-baseline text-white drop-shadow-md">
              <span className="text-sm font-black leading-none">
                ₱{unit.rental_rate_per_day?.toLocaleString()}
              </span>
              <span className="text-[9px] font-medium opacity-80 ml-0.5">
                /day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- TIGHT INFO SECTION --- */}
      <div className="p-2.5 flex flex-col gap-2">
        {/* Title & Actions Row */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col pr-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              {/* Made title clickable too */}
              <h3
                className="text-xs font-bold text-foreground leading-tight line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
                onClick={handleViewDetails}
              >
                {unit.brand} {unit.model}
              </h3>
              <span className="text-[9px] font-semibold text-muted-foreground bg-secondary border border-border px-1 rounded">
                {unit.year}
              </span>
            </div>
            <p className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground truncate">
              {unit.owner?.full_name ||
                unit.owner?.business_name ||
                "Unknown Owner"}
            </p>
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-md shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary -mt-0.5 -mr-1 transition-colors"
              >
                <EllipsisVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-lg shadow-lg border-border bg-popover"
            >
              <DropdownMenuGroup>
                {/* ADDED VIEW DETAILS ACTION */}
                <DropdownMenuItem
                  className="text-[11px] font-medium cursor-pointer text-popover-foreground focus:bg-secondary"
                  onClick={handleViewDetails}
                >
                  <Eye className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  View Details
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-[11px] font-medium cursor-pointer text-popover-foreground focus:bg-secondary"
                  onClick={onEdit}
                >
                  <Pen className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[11px] font-medium cursor-pointer text-popover-foreground focus:bg-secondary">
                  <Wrench className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  Set Maintenance
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem
                  className="text-[11px] font-medium cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-500/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRequestDelete(unit);
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-2" />
                  Delete Unit
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Specs Row */}
        <div className="flex items-center justify-between bg-secondary/40 border border-border rounded-md p-1.5">
          <div className="flex items-center gap-1" title="Transmission">
            <Settings className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-foreground truncate max-w-[50px]">
              {specifications?.transmission
                ?.replace("Automatic", "Auto")
                .replace("Manual", "Man") || "N/A"}
            </span>
          </div>
          <Separator orientation="vertical" className="h-3 bg-border" />
          <div className="flex items-center gap-1" title="Fuel Type">
            <Fuel className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-foreground truncate max-w-[50px]">
              {specifications?.fuel_type || "N/A"}
            </span>
          </div>
          <Separator orientation="vertical" className="h-3 bg-border" />
          <div className="flex items-center gap-1" title="Capacity">
            <Users className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-[10px] font-semibold text-foreground">
              {specifications?.passenger_capacity
                ? `${specifications.passenger_capacity} pax`
                : "N/A"}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}
