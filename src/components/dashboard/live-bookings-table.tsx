"use client";

import React from "react";
import { format } from "date-fns";
import { ArrowUpRight } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "../../../hooks/use-dashboard";
import { cn } from "@/lib/utils";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "Ongoing":
      return "bg-primary/10 text-primary border-primary/20"; // Signature Teal
    case "Pending":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "Confirmed":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "Overdue Return":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    case "Late Arrival":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "Completed":
      return "bg-secondary text-muted-foreground border-border";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
};

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export default function LiveBookingsTable() {
  const { recentBookings, isRecentLoading } = useDashboard();

  if (isRecentLoading) {
    return (
      <div className="w-full p-4 space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-9 w-full bg-muted rounded-md" />
        ))}
      </div>
    );
  }

  // 3. Empty State Fallback
  if (!recentBookings || recentBookings.length === 0) {
    return (
      <div className="w-full p-8 text-center text-muted-foreground text-[11px] font-medium">
        No recent bookings found.
      </div>
    );
  }

  return (
    // Fixed max-height with custom scrollbar.
    <div className="w-full max-h-[350px] overflow-y-auto custom-scrollbar relative">
      <Table className="w-full text-left border-collapse">
        <TableHeader className="sticky top-0 z-10 bg-secondary/80 backdrop-blur-md shadow-[0_1px_0_0_hsl(var(--border))]">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground w-[120px]">
              Booking ID
            </TableHead>
            <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground">
              Customer
            </TableHead>
            <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground">
              Vehicle
            </TableHead>
            <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground">
              Duration
            </TableHead>
            <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground text-right">
              Amount
            </TableHead>
            <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground text-center w-[130px]">
              Status
            </TableHead>
            <TableHead className="h-8 px-4 w-[40px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentBookings.map((b: any) => (
            <TableRow
              key={b.id}
              className="border-b border-border hover:bg-muted/50 transition-colors group"
            >
              {/* ID */}
              <TableCell className="px-4 py-2">
                <span className="font-mono text-[10px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border group-hover:bg-background group-hover:text-foreground transition-colors">
                  {b.id}
                </span>
              </TableCell>

              {/* CUSTOMER */}
              <TableCell className="px-4 py-2">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-6 w-6 rounded-md border border-border shadow-sm shrink-0">
                    <AvatarFallback className="text-[9px] font-semibold bg-secondary text-foreground">
                      {getInitials(b.customer)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold text-foreground leading-none mb-1">
                      {b.customer}
                    </span>
                    <span className="text-[9px] text-muted-foreground font-medium leading-none">
                      {b.phone}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* VEHICLE */}
              <TableCell className="px-4 py-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-semibold text-foreground leading-none mb-1">
                    {b.car}
                  </span>
                  <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider leading-none">
                    [{b.plate}]
                  </span>
                </div>
              </TableCell>

              {/* DURATION */}
              <TableCell className="px-4 py-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-semibold text-foreground leading-none mb-1">
                    {format(b.start, "MMM dd")}{" "}
                    <span className="text-muted-foreground/50 font-normal mx-0.5">
                      →
                    </span>{" "}
                    {format(b.end, "MMM dd")}
                  </span>
                  <span className="text-[9px] text-muted-foreground font-medium leading-none">
                    {format(b.start, "h:mm a")} - {format(b.end, "h:mm a")}
                  </span>
                </div>
              </TableCell>

              {/* AMOUNT */}
              <TableCell className="px-4 py-2 text-right">
                <span className="text-[11px] font-bold font-mono text-foreground">
                  ₱{b.amount.toLocaleString()}
                </span>
              </TableCell>

              {/* STATUS */}
              <TableCell className="px-4 py-2 text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-semibold px-2 py-0.5 rounded whitespace-nowrap",
                    getStatusBadge(b.status),
                  )}
                >
                  {b.status}
                </Badge>
              </TableCell>

              {/* ACTION */}
              <TableCell className="px-4 py-2 text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
                >
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
