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
  const specifications = unit.specifications;
  const primaryImage =
    unit.images?.find((img) => img.is_primary)?.image_url ||
    unit.images?.[0]?.image_url ||
    "https://placehold.co/600x400?text=No+Image";

  const getStatusBadgeStyle = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-emerald-500 text-white border-transparent";
      case "maintenance":
        return "bg-orange-500 text-white border-transparent";
      case "rented":
      case "ongoing":
        return "bg-blue-500 text-white border-transparent";
      default:
        return "bg-slate-500 text-white border-transparent";
    }
  };

  return (
    <Card className="w-[260px] rounded-lg overflow-hidden border-slate-200 shadow-sm flex flex-col bg-white transition-all hover:shadow-md">
      {/* --- BIG IMAGE SECTION WITH OVERLAYS --- */}
      <div className="relative h-40 w-full bg-slate-100 group">
        <img
          src={primaryImage}
          alt={`${unit.brand} ${unit.model}`}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Top Overlay: Status Badge */}
        <div className="absolute top-2 right-2 z-10">
          <Badge
            variant="outline"
            className={cn(
              "text-[9px] uppercase tracking-wider px-1.5 py-0 h-4 shadow-sm font-semibold",
              getStatusBadgeStyle(unit.availability_status || ""),
            )}
          >
            {unit.availability_status}
          </Badge>
        </div>

        {/* Bottom Gradient Overlay: Plate & Price */}
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-900/90 to-transparent flex items-end p-2.5 z-10">
          <div className="flex justify-between items-center w-full">
            <span className="text-[10px] font-mono font-medium text-white/90 bg-black/40 px-1.5 py-0.5 rounded border border-white/20 backdrop-blur-sm">
              {unit.plate_number}
            </span>
            <div className="flex items-baseline text-white">
              <span className="text-sm font-bold leading-none">
                ₱{unit.rental_rate_per_day.toLocaleString()}
              </span>
              <span className="text-[9px] font-medium opacity-80 ml-0.5">
                /day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- DENSE INFO SECTION --- */}
      <div className="p-2.5 flex flex-col gap-2">
        {/* Title & Actions Row */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col pr-2">
            <div className="flex items-center gap-1.5 mb-0.5">
              <h3 className="text-[13px] font-bold text-slate-800 leading-tight line-clamp-1">
                {unit.brand} {unit.model}
              </h3>
              <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-1 py-0 rounded">
                {unit.year}
              </span>
            </div>
            <p className="text-[9px] font-medium uppercase tracking-wider text-slate-400 truncate">
              {unit.owner?.full_name || "Unknown Owner"}
            </p>
          </div>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded shrink-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 -mt-0.5 -mr-1"
              >
                <EllipsisVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-lg shadow-md border-slate-200"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="text-[11px] cursor-pointer"
                  onClick={onEdit}
                >
                  <Pen className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Edit details
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[11px] cursor-pointer">
                  <Eye className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  View History
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[11px] cursor-pointer">
                  <Wrench className="w-3.5 h-3.5 mr-2 text-slate-500" />
                  Set Maintenance
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-[11px] cursor-pointer text-red-600 focus:text-red-700 focus:bg-red-50"
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
        <div className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-md p-1.5 mt-0.5">
          <div className="flex items-center gap-1" title="Transmission">
            <Settings className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-medium text-slate-600 truncate max-w-[50px]">
              {specifications?.transmission
                ?.replace("Automatic", "Auto")
                .replace("Manual", "Man") || "N/A"}
            </span>
          </div>
          <Separator orientation="vertical" className="h-3 bg-slate-200" />
          <div className="flex items-center gap-1" title="Fuel Type">
            <Fuel className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-medium text-slate-600 truncate max-w-[50px]">
              {specifications?.fuel_type || "N/A"}
            </span>
          </div>
          <Separator orientation="vertical" className="h-3 bg-slate-200" />
          <div className="flex items-center gap-1" title="Capacity">
            <Users className="w-3 h-3 text-slate-400" />
            <span className="text-[9px] font-medium text-slate-600">
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
