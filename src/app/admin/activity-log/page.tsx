"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Search,
  Filter,
  Download,
  Calendar as CalendarIcon,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Info,
  MoreHorizontal,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

// --- MOCK AUDIT DATA ---
type Severity = "critical" | "warning" | "success" | "info";

const mockLogs = [
  {
    id: "LOG-8890",
    timestamp: new Date(2026, 2, 11, 14, 30),
    severity: "critical",
    event: "Overdue Return",
    details: "Toyota Fortuner [ABC-1234] is 2 hours late. Customer contacted.",
    refId: "BKG-1021",
    user: "System Auto",
  },
  {
    id: "LOG-8889",
    timestamp: new Date(2026, 2, 11, 14, 15),
    severity: "success",
    event: "Booking Approved",
    details: "ID verified and booking confirmed for Juan Luna.",
    refId: "BKG-1025",
    user: "Admin (Maria C.)",
  },
  {
    id: "LOG-8888",
    timestamp: new Date(2026, 2, 11, 13, 0),
    severity: "info",
    event: "Dispatch Assigned",
    details: "Driver Ricardo D. assigned to upcoming airport transfer.",
    refId: "DSP-409",
    user: "Dispatcher (Jose R.)",
  },
  {
    id: "LOG-8887",
    timestamp: new Date(2026, 2, 11, 11, 45),
    severity: "success",
    event: "Payment Cleared",
    details: "₱15,000 received via Credit Card (Stripe).",
    refId: "PAY-9921",
    user: "System Auto",
  },
  {
    id: "LOG-8886",
    timestamp: new Date(2026, 2, 11, 10, 30),
    severity: "warning",
    event: "Maintenance Flag",
    details: "Nissan Urvan [XYZ-987] reached 10,000km threshold.",
    refId: "VEH-088",
    user: "Telematics API",
  },
  {
    id: "LOG-8885",
    timestamp: new Date(2026, 2, 10, 18, 20),
    severity: "critical",
    event: "Payment Failed",
    details: "Insufficient funds for GCash charge attempt.",
    refId: "PAY-9920",
    user: "System Auto",
  },
  {
    id: "LOG-8884",
    timestamp: new Date(2026, 2, 10, 16, 10),
    severity: "info",
    event: "Vehicle Returned",
    details: "Honda CR-V [DEF-5678] returned and inspected (Clean).",
    refId: "BKG-1018",
    user: "Garage (Andres B.)",
  },
  {
    id: "LOG-8883",
    timestamp: new Date(2026, 2, 10, 9, 0),
    severity: "warning",
    event: "Late Arrival",
    details: "Customer reported flight delay. ETA adjusted to 14:00.",
    refId: "BKG-1022",
    user: "Admin (Maria C.)",
  },
];

const getSeverityStyles = (severity: Severity) => {
  switch (severity) {
    case "critical":
      return {
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-50",
        border: "border-red-200",
      };
    case "warning":
      return {
        icon: ShieldAlert,
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-200",
      };
    case "success":
      return {
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-50",
        border: "border-emerald-200",
      };
    case "info":
      return {
        icon: Info,
        color: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-200",
      };
  }
};

export default function ActivityLogPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-1">
            System Activity Log
          </h1>
          <p className="text-xs font-medium text-slate-500">
            Immutable audit trail of all fleet, booking, and user events.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-none border-slate-200 bg-white hover:bg-slate-50 text-slate-700"
        >
          <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          Export CSV
        </Button>
      </div>

      {/* MAIN DATA CARD */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col overflow-hidden">
        {/* CONTROL BAR */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col lg:flex-row items-center gap-3">
          {/* Search */}
          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
            <Input
              placeholder="Search Ref ID, event, or details..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs font-medium bg-white border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-slate-300 rounded-sm w-full"
            />
          </div>

          <div className="h-6 w-px bg-slate-200 hidden lg:block mx-1" />

          {/* Filters */}
          <div className="flex items-center gap-3 w-full lg:w-auto overflow-x-auto custom-scrollbar">
            <Select defaultValue="all">
              <SelectTrigger className="h-8 w-[130px] text-[11px] font-bold shadow-none rounded-sm bg-white border-slate-200 shrink-0">
                <Filter className="w-3 h-3 mr-1.5 text-slate-400" />
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="info">Info</SelectItem>
              </SelectContent>
            </Select>

            <Select defaultValue="7d">
              <SelectTrigger className="h-8 w-[140px] text-[11px] font-bold shadow-none rounded-sm bg-white border-slate-200 shrink-0">
                <CalendarIcon className="w-3 h-3 mr-1.5 text-slate-400" />
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent className="text-xs">
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="custom">Custom Range...</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* DATA TABLE */}
        <div className="w-full overflow-x-auto custom-scrollbar">
          <Table className="w-full text-left border-collapse min-w-[900px]">
            <TableHeader className="bg-slate-50/80 border-b border-slate-200">
              <TableRow className="hover:bg-transparent border-none">
                <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-[160px]">
                  Timestamp
                </TableHead>
                <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-[140px]">
                  Severity
                </TableHead>
                <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest min-w-[300px]">
                  Event & Details
                </TableHead>
                <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-[120px]">
                  Reference
                </TableHead>
                <TableHead className="h-9 px-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest w-[150px]">
                  Origin / User
                </TableHead>
                <TableHead className="h-9 px-4 w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLogs.map((log) => {
                const config = getSeverityStyles(log.severity as Severity);
                const Icon = config.icon;

                return (
                  <TableRow
                    key={log.id}
                    className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors group"
                  >
                    {/* TIMESTAMP */}
                    <TableCell className="px-4 py-2.5 align-top">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-900 leading-none mb-1">
                          {format(log.timestamp, "MMM dd, yyyy")}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono tracking-wider leading-none">
                          {format(log.timestamp, "HH:mm:ss")}
                        </span>
                      </div>
                    </TableCell>

                    {/* SEVERITY BADGE */}
                    <TableCell className="px-4 py-2.5 align-top">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-sm border",
                          config.bg,
                          config.border,
                        )}
                      >
                        <Icon className={cn("w-3 h-3", config.color)} />
                        <span
                          className={cn(
                            "text-[9px] font-bold uppercase tracking-widest leading-none mt-px",
                            config.color,
                          )}
                        >
                          {log.severity}
                        </span>
                      </div>
                    </TableCell>

                    {/* EVENT & DETAILS */}
                    <TableCell className="px-4 py-2.5 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-bold text-slate-900 leading-tight">
                          {log.event}
                        </span>
                        <span className="text-[11px] font-medium text-slate-500 leading-snug max-w-md">
                          {log.details}
                        </span>
                      </div>
                    </TableCell>

                    {/* REFERENCE ID */}
                    <TableCell className="px-4 py-2.5 align-top">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded border border-slate-200 bg-slate-100 text-[10px] font-bold font-mono text-slate-600 uppercase tracking-wider group-hover:bg-white transition-colors cursor-pointer hover:border-slate-300">
                        {log.refId}
                      </span>
                    </TableCell>

                    {/* ORIGIN / USER */}
                    <TableCell className="px-4 py-2.5 align-top">
                      <span className="text-[11px] font-semibold text-slate-700">
                        {log.user}
                      </span>
                    </TableCell>

                    {/* ACTION */}
                    <TableCell className="px-4 py-2.5 align-top text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-sm text-slate-400 hover:text-slate-900 hover:bg-slate-200 shadow-none"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* PAGINATION FOOTER */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-2">
            Showing 1-8 of 1,204 logs
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled
              className="h-7 w-7 rounded-sm border-slate-200 shadow-none bg-white"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
            <div className="flex items-center px-2 gap-1">
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 text-[11px] font-bold rounded-sm bg-slate-200 text-slate-900"
              >
                1
              </Button>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 text-[11px] font-bold rounded-sm text-slate-500 hover:bg-slate-100"
              >
                2
              </Button>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 text-[11px] font-bold rounded-sm text-slate-500 hover:bg-slate-100"
              >
                3
              </Button>
              <span className="text-slate-400 text-[10px] px-1">...</span>
              <Button
                variant="ghost"
                className="h-7 w-7 p-0 text-[11px] font-bold rounded-sm text-slate-500 hover:bg-slate-100"
              >
                150
              </Button>
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-7 w-7 rounded-sm border-slate-200 shadow-none bg-white hover:bg-slate-50 text-slate-700"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
