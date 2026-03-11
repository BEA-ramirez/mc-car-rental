import React from "react";
import { format } from "date-fns";
import { MoreHorizontal, ArrowUpRight } from "lucide-react";
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
      return "bg-emerald-500 text-white border-emerald-600 shadow-sm";
    case "Pending":
      return "bg-amber-100 text-amber-800 border-amber-300";
    case "Confirmed":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Overdue Return":
      return "bg-red-100 text-red-800 border-red-300";
    case "Late Arrival":
      return "bg-orange-100 text-orange-800 border-orange-300";
    case "Completed":
      return "bg-slate-100 text-slate-500 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600";
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
      <div className="w-full p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-10 w-full bg-slate-100 rounded-sm" />
        ))}
      </div>
    );
  }

  // 3. Empty State Fallback
  if (!recentBookings || recentBookings.length === 0) {
    return (
      <div className="w-full p-8 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
        No recent bookings found.
      </div>
    );
  }

  return (
    // Fixed max-height with custom scrollbar.
    // This allows the table to scroll internally without stretching the whole page.
    <div className="w-full max-h-[350px] overflow-y-auto custom-scrollbar relative">
      <Table className="w-full text-left border-collapse">
        <TableHeader className="sticky top-0 z-10 bg-slate-50 shadow-[0_1px_0_0_#f1f5f9]">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-[120px]">
              Booking ID
            </TableHead>
            <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Customer
            </TableHead>
            <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Vehicle
            </TableHead>
            <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Duration
            </TableHead>
            <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-right">
              Amount
            </TableHead>
            <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center w-[130px]">
              Status
            </TableHead>
            <TableHead className="h-9 px-4 w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recentBookings.map((b: any) => (
            <TableRow
              key={b.id}
              className="border-b border-slate-100 hover:bg-blue-50/30 transition-colors group"
            >
              {/* ID */}
              <TableCell className="px-4 py-2">
                <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 group-hover:bg-white group-hover:border-slate-300 transition-colors">
                  {b.id}
                </span>
              </TableCell>

              {/* CUSTOMER */}
              <TableCell className="px-4 py-2">
                <div className="flex items-center gap-2.5">
                  <Avatar className="h-7 w-7 rounded-sm border border-slate-200 shadow-sm shrink-0">
                    <AvatarFallback className="text-[9px] font-bold bg-white text-slate-600">
                      {getInitials(b.customer)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-900 leading-none mb-1">
                      {b.customer}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium leading-none">
                      {b.phone}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* VEHICLE */}
              <TableCell className="px-4 py-2">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800 leading-none mb-1">
                    {b.car}
                  </span>
                  <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider leading-none">
                    [{b.plate}]
                  </span>
                </div>
              </TableCell>

              {/* DURATION */}
              <TableCell className="px-4 py-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-700 leading-none mb-1">
                    {format(b.start, "MMM dd")}{" "}
                    <span className="text-slate-400 font-normal mx-0.5">→</span>{" "}
                    {format(b.end, "MMM dd")}
                  </span>
                  <span className="text-[9px] text-slate-500 font-medium leading-none">
                    {format(b.start, "h:mm a")} - {format(b.end, "h:mm a")}
                  </span>
                </div>
              </TableCell>

              {/* AMOUNT */}
              <TableCell className="px-4 py-2 text-right">
                <span className="text-xs font-bold font-mono text-slate-900">
                  ₱{b.amount.toLocaleString()}
                </span>
              </TableCell>

              {/* STATUS */}
              <TableCell className="px-4 py-2 text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm whitespace-nowrap",
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
                  className="h-7 w-7 rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-200"
                >
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
