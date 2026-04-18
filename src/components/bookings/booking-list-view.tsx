"use client";

import React from "react";
import { format } from "date-fns";
import {
  ArrowUpRight,
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useRouter } from "next/navigation";
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
import { cn } from "@/lib/utils";
import { useBookings } from "../../../hooks/use-bookings";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "ONGOING":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "PENDING":
      return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
    case "CONFIRMED":
      return "bg-primary/10 text-primary border-primary/20";
    case "COMPLETED":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "NO_SHOW":
    case "CANCELLED":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "bg-secondary text-muted-foreground border-border";
  }
};

const getInitials = (name: string) => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export default function BookingListView() {
  const router = useRouter();

  // Use the hook!
  const { bookings, isLoading, page, setPage, filterStatus, setFilterStatus } =
    useBookings();

  return (
    <div className="w-full flex flex-col h-full">
      {/* Table Controls */}
      <div className="flex justify-between items-center mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search Reference ID..."
            className="pl-8 h-8 w-full text-[10px] font-medium bg-secondary border border-border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          {/* Simple Status Filter Dropdown */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setPage(1); // Reset to page 1 on filter change
            }}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-secondary border border-border rounded-md px-2 focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="All">All Statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="ONGOING">Ongoing</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="border border-border rounded-xl overflow-hidden flex-1 flex flex-col relative">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-20 bg-background/50 backdrop-blur-sm flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        )}

        <div className="overflow-y-auto custom-scrollbar flex-1">
          <Table className="w-full text-left border-collapse">
            <TableHeader className="sticky top-0 z-10 bg-secondary/95 backdrop-blur-md shadow-[0_1px_0_0_hsl(var(--border))]">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="h-8 px-4 text-[10px] font-semibold text-muted-foreground w-[120px]">
                  Ref ID
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
              {!isLoading && bookings.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-32 text-center text-muted-foreground text-[11px] font-bold uppercase tracking-widest border-dashed"
                  >
                    No bookings found.
                  </TableCell>
                </TableRow>
              ) : (
                bookings.map((b: any) => (
                  <TableRow
                    key={b.booking_id}
                    onClick={() =>
                      router.push(`/admin/bookings/${b.booking_id}`)
                    }
                    className="border-b border-border hover:bg-muted/50 transition-colors group cursor-pointer"
                  >
                    {/* ID */}
                    <TableCell className="px-4 py-2">
                      <span className="font-mono text-[10px] font-medium text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border group-hover:bg-background transition-colors">
                        {b.booking_id.split("-")[0].toUpperCase()}
                      </span>
                    </TableCell>

                    {/* CUSTOMER */}
                    <TableCell className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <Avatar className="h-6 w-6 rounded-md border border-border shadow-sm shrink-0">
                          <AvatarFallback className="text-[9px] font-semibold bg-secondary text-foreground">
                            {getInitials(b.user?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-[11px] font-semibold text-foreground leading-none mb-1">
                            {b.user?.full_name || "Unknown Customer"}
                          </span>
                          <span className="text-[9px] text-muted-foreground font-medium leading-none">
                            {b.user?.phone_number || "No phone"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* VEHICLE */}
                    <TableCell className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-semibold text-foreground leading-none mb-1">
                          {b.car?.brand} {b.car?.model}
                        </span>
                        <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-wider leading-none">
                          [{b.car?.plate_number || "NO PLATE"}]
                        </span>
                      </div>
                    </TableCell>

                    {/* DURATION */}
                    <TableCell className="px-4 py-2">
                      <div className="flex flex-col">
                        <span className="text-[10px] font-semibold text-foreground leading-none mb-1">
                          {format(new Date(b.start_date), "MMM dd")}{" "}
                          <span className="text-muted-foreground/50 font-normal mx-0.5">
                            →
                          </span>{" "}
                          {format(new Date(b.end_date), "MMM dd")}
                        </span>
                      </div>
                    </TableCell>

                    {/* AMOUNT */}
                    <TableCell className="px-4 py-2 text-right">
                      <span className="text-[11px] font-bold font-mono text-foreground">
                        ₱{Number(b.total_price).toLocaleString()}
                      </span>
                    </TableCell>

                    {/* STATUS */}
                    <TableCell className="px-4 py-2 text-center">
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[9px] font-semibold px-2 py-0.5 rounded whitespace-nowrap uppercase tracking-widest",
                          getStatusBadge(b.booking_status),
                        )}
                      >
                        {b.booking_status}
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
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between pt-4">
        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
          Page {page}
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((old) => Math.max(old - 1, 1))}
            disabled={page === 1 || isLoading}
            className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((old) => old + 1)}
            disabled={bookings.length < 10 || isLoading} // Assuming limit is 10
            className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
