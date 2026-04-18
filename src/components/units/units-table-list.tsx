"use client";

import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CompleteCarType } from "@/lib/schemas/car";
import {
  MoreHorizontal,
  Pen,
  Eye,
  Wrench,
  Trash2,
  CarFront,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface UnitsTableListProps {
  units: CompleteCarType[];
  onEdit: (unit: CompleteCarType) => void;
  onRequestDelete: (unit: CompleteCarType) => void;
}

const getStatusBadgeStyle = (status: string) => {
  switch (status?.toLowerCase()) {
    case "available":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "maintenance":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "rented":
    case "ongoing":
    case "deployed":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
};

export default function UnitsTableList({
  units,
  onEdit,
  onRequestDelete,
}: UnitsTableListProps) {
  if (units.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] bg-card border border-dashed border-border rounded-xl shadow-sm transition-colors">
        <CarFront className="h-8 w-8 text-muted-foreground/50 mb-3" />
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          No units match your criteria.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
      <div className="w-full max-h-[600px] overflow-y-auto custom-scrollbar relative">
        <Table className="w-full text-left border-collapse">
          <TableHeader className="sticky top-0 z-10 bg-secondary/80 backdrop-blur-md shadow-[0_1px_0_0_hsl(var(--border))]">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider w-[100px]">
                Plate No.
              </TableHead>
              <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Vehicle Details
              </TableHead>
              <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
                Specs
              </TableHead>
              <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">
                Owner / Partner
              </TableHead>
              <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-right">
                Daily Rate
              </TableHead>
              <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center w-[120px]">
                Status
              </TableHead>
              <TableHead className="h-8 px-4 w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.map((unit) => (
              <TableRow
                key={unit.car_id}
                className="border-b border-border hover:bg-muted/50 transition-colors group"
              >
                {/* PLATE NUMBER */}
                <TableCell className="px-4 py-2.5">
                  <span className="font-mono text-[10px] font-semibold text-foreground bg-secondary px-1.5 py-0.5 rounded border border-border group-hover:border-primary/30 transition-colors">
                    {unit.plate_number}
                  </span>
                </TableCell>

                {/* VEHICLE DETAILS */}
                <TableCell className="px-4 py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md bg-secondary border border-border overflow-hidden shrink-0 flex items-center justify-center">
                      {unit.images?.[0]?.image_url ? (
                        <Image
                          src={unit.images[0].image_url}
                          alt="car"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <CarFront className="w-4 h-4 text-muted-foreground/50" />
                      )}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                        {unit.brand} {unit.model}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[9px] font-semibold text-muted-foreground bg-secondary px-1 rounded">
                          {unit.year}
                        </span>
                        <span className="text-[9px] font-medium text-muted-foreground">
                          • {unit.color}
                        </span>
                      </div>
                    </div>
                  </div>
                </TableCell>

                {/* SPECS */}
                <TableCell className="px-4 py-2.5">
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-medium text-foreground">
                      {unit.specifications?.body_type || "N/A"}
                    </span>
                    <span className="text-[9px] text-muted-foreground">
                      {unit.specifications?.transmission
                        ?.replace("Automatic", "Auto")
                        .replace("Manual", "Man")}{" "}
                      • {unit.specifications?.fuel_type}
                    </span>
                  </div>
                </TableCell>

                {/* OWNER */}
                <TableCell className="px-4 py-2.5 hidden md:table-cell">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-semibold text-foreground truncate max-w-[150px]">
                      {unit.owner?.business_name ||
                        unit.owner?.full_name ||
                        "Company Owned"}
                    </span>
                  </div>
                </TableCell>

                {/* DAILY RATE */}
                <TableCell className="px-4 py-2.5 text-right">
                  <span className="text-[11px] font-black font-mono text-foreground">
                    ₱{unit.rental_rate_per_day.toLocaleString()}
                  </span>
                </TableCell>

                {/* STATUS */}
                <TableCell className="px-4 py-2.5 text-center">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded shadow-sm whitespace-nowrap",
                      getStatusBadgeStyle(unit.availability_status || ""),
                    )}
                  >
                    {unit.availability_status}
                  </Badge>
                </TableCell>

                {/* ACTIONS */}
                <TableCell className="px-4 py-2.5 text-right">
                  <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-40 rounded-lg shadow-lg border-border bg-popover"
                    >
                      <DropdownMenuGroup>
                        <DropdownMenuItem
                          className="text-[11px] font-medium cursor-pointer focus:bg-secondary"
                          onClick={() => onEdit(unit)}
                        >
                          <Pen className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                          Edit details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[11px] font-medium cursor-pointer focus:bg-secondary">
                          <Eye className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                          View History
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[11px] font-medium cursor-pointer focus:bg-secondary">
                          <Wrench className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                          Set Maintenance
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-border" />
                        <DropdownMenuItem
                          className="text-[11px] font-medium cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
