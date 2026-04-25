"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  format,
  addWeeks,
  subWeeks,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isToday,
  getHours,
  startOfDay,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Route,
  ArrowDownRight,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// --- TYPES ---
export type OpsEvent = {
  id: string;
  carBrand: string;
  carModel: string;
  plate: string;
  customerName: string;
  startDate: Date | string;
  endDate: Date | string;
  status: "CONFIRMED" | "ONGOING" | "COMPLETED";
};

type OperationsCalendarProps = {
  bookings: OpsEvent[];
};

export default function OperationsCalendar({
  bookings,
}: OperationsCalendarProps) {
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- NEW: DUAL FILTER STATE ---
  const [opMode, setOpMode] = useState<"RECEIVING" | "DISPATCH">("RECEIVING");
  const [timeFilter, setTimeFilter] = useState<"ALL" | "MORNING" | "AFTERNOON">(
    "ALL",
  );

  // --- CALENDAR MATH ---
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const daysInGrid = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const nextWeek = () => setCurrentDate(addWeeks(currentDate, 1));
  const prevWeek = () => setCurrentDate(subWeeks(currentDate, 1));
  const goToToday = () => setCurrentDate(new Date());

  // --- EVENT FILTERING ---
  const visibleBookings = useMemo(() => {
    return bookings.filter((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      const overlapsWeek = start <= weekEnd && end >= weekStart;

      // Filter against the relevant date based on the Operation Mode
      const targetDate = opMode === "RECEIVING" ? end : start;

      if (timeFilter === "MORNING" && getHours(targetDate) >= 12) return false;
      if (timeFilter === "AFTERNOON" && getHours(targetDate) < 12) return false;

      return overlapsWeek;
    });
  }, [bookings, weekStart, weekEnd, timeFilter, opMode]);

  // --- DYNAMIC LAYOUT ALGORITHM ---
  const calculateLayout = (events: OpsEvent[]) => {
    const sorted = [...events].sort((a, b) => {
      const startA = new Date(a.startDate).getTime();
      const startB = new Date(b.startDate).getTime();
      const endA = new Date(a.endDate).getTime();
      const endB = new Date(b.endDate).getTime();

      if (opMode === "RECEIVING") {
        // Reverse Waterfall: Sort by End Date
        const dayEndA = startOfDay(new Date(a.endDate)).getTime();
        const dayEndB = startOfDay(new Date(b.endDate)).getTime();
        if (dayEndA !== dayEndB) return dayEndA - dayEndB;
        if (endA !== endB) return endA - endB;
        return startA - startB; // Tie-breaker
      } else {
        // Standard Waterfall: Sort by Start Date
        const dayStartA = startOfDay(new Date(a.startDate)).getTime();
        const dayStartB = startOfDay(new Date(b.startDate)).getTime();
        if (dayStartA !== dayStartB) return dayStartA - dayStartB;
        if (startA !== startB) return startA - startB;
        return endA - endB; // Tie-breaker
      }
    });

    const rows: number[] = [];
    const layout = [];
    const totalWeekMs = 7 * 24 * 60 * 60 * 1000;
    const weekStartMs = weekStart.getTime();

    for (const event of sorted) {
      const startMs = new Date(event.startDate).getTime();
      const endMs = new Date(event.endDate).getTime();

      const boundedStartMs = Math.max(startMs, weekStartMs);
      const boundedEndMs = Math.min(endMs, weekEnd.getTime());

      const leftPercent = ((boundedStartMs - weekStartMs) / totalWeekMs) * 100;
      const widthPercent =
        ((boundedEndMs - boundedStartMs) / totalWeekMs) * 100;

      let rowIndex = 0;
      while (rows[rowIndex] && rows[rowIndex] > startMs) {
        rowIndex++;
      }
      rows[rowIndex] = endMs + 60 * 60 * 1000;

      layout.push({ event, leftPercent, widthPercent, rowIndex });
    }

    return layout;
  };

  const layout = calculateLayout(visibleBookings);
  const maxRows = Math.max(0, ...layout.map((l) => l.rowIndex)) + 1;

  const ROW_HEIGHT = 44;
  const timelineHeight = Math.max(400, maxRows * ROW_HEIGHT + 60);

  // --- STYLING HELPERS ---
  const getEventColors = (status: string) => {
    switch (status) {
      case "ONGOING":
        return "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30";
      case "CONFIRMED":
        return "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-amber-500/50 hover:bg-amber-500/30";
      case "COMPLETED":
      default:
        return "bg-slate-500/20 text-slate-700 dark:text-slate-400 border-slate-500/50 hover:bg-slate-500/30";
    }
  };

  const handleBarClick = (id: string) => {
    router.push(`/admin/bookings/${id}`);
  };

  // --- RENDER EVENT BAR ---
  const renderBar = (item: any) => {
    const { event, leftPercent, widthPercent, rowIndex } = item;
    const colors = getEventColors(event.status);
    const startStr = format(new Date(event.startDate), "h:mm a");
    const endStr = format(new Date(event.endDate), "h:mm a");

    const isNarrow = widthPercent < 12;

    return (
      <div
        key={event.id}
        onClick={() => handleBarClick(event.id)}
        className={cn(
          "absolute h-[32px] rounded-md border flex items-center justify-between px-2.5 text-[10px] font-semibold cursor-pointer transition-all shadow-sm overflow-hidden z-20 backdrop-blur-md group",
          colors,
        )}
        style={{
          left: `calc(${leftPercent}% + 4px)`,
          width: `calc(${widthPercent}% - 8px)`,
          top: `${rowIndex * ROW_HEIGHT + 20}px`,
        }}
        title={`[${event.status}] ${event.customerName} - ${event.carBrand} ${event.carModel} (${startStr} to ${endStr})`}
      >
        <span
          className={cn(
            "shrink-0 hidden sm:block font-mono tracking-tight",
            opMode === "DISPATCH"
              ? "opacity-90 font-black underline decoration-current/40 underline-offset-2"
              : "opacity-50 font-normal",
          )}
        >
          {startStr}
        </span>

        <span className="truncate px-2 flex-1 text-center">
          {event.plate}{" "}
          {!isNarrow && (
            <span className="font-medium opacity-80 border-l border-current/20 pl-2 ml-2">
              {event.carBrand} {event.carModel}
            </span>
          )}
        </span>

        <span
          className={cn(
            "shrink-0 hidden md:block font-mono tracking-tight",
            opMode === "RECEIVING"
              ? "opacity-90 font-black underline decoration-current/40 underline-offset-2"
              : "opacity-50 font-normal",
          )}
        >
          {endStr}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl shadow-sm overflow-hidden font-sans border border-border">
      {/* HEADER TOOLBAR */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between px-5 py-3 gap-4 border-b border-border bg-secondary/20 shrink-0">
        {/* Navigation & Month */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="h-8 text-xs font-bold px-4 text-foreground shadow-sm bg-background border-border hover:bg-secondary"
            >
              Today
            </Button>
            <div className="flex items-center bg-background rounded-md border border-border shadow-sm overflow-hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={prevWeek}
                className="h-8 w-9 rounded-none text-muted-foreground hover:text-foreground border-r border-border hover:bg-secondary"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextWeek}
                className="h-8 w-9 rounded-none text-muted-foreground hover:text-foreground hover:bg-secondary"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <h2 className="text-lg hidden sm:flex font-black tracking-tight text-foreground uppercase items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            {format(weekStart, "MMMM yyyy")}
          </h2>
        </div>

        {/* Dynamic Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Operational Mode Dropdown */}
          <Select value={opMode} onValueChange={(val: any) => setOpMode(val)}>
            <SelectTrigger className="h-8 w-[200px] text-[10px] font-bold uppercase tracking-widest bg-background border-border shadow-sm focus:ring-primary">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem
                value="RECEIVING"
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                <div className="flex items-center gap-2">
                  <ArrowDownRight className="w-3.5 h-3.5 text-emerald-500" />
                  Receiving (Returns)
                </div>
              </SelectItem>
              <SelectItem
                value="DISPATCH"
                className="text-[10px] font-bold uppercase tracking-widest"
              >
                <div className="flex items-center gap-2">
                  <ArrowUpRight className="w-3.5 h-3.5 text-amber-500" />
                  Dispatch (Pickups)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Time Block Pills */}
          <div className="flex items-center bg-secondary/50 p-1 rounded-lg border border-border">
            <Button
              variant={timeFilter === "ALL" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("ALL")}
              className={cn(
                "h-7 text-[10px] font-bold px-3 rounded-md transition-all shadow-none uppercase tracking-widest",
                timeFilter === "ALL"
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              All
            </Button>
            <Button
              variant={timeFilter === "MORNING" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("MORNING")}
              className={cn(
                "h-7 text-[10px] font-bold px-3 rounded-md transition-all shadow-none uppercase tracking-widest",
                timeFilter === "MORNING"
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Morning
            </Button>
            <Button
              variant={timeFilter === "AFTERNOON" ? "default" : "ghost"}
              size="sm"
              onClick={() => setTimeFilter("AFTERNOON")}
              className={cn(
                "h-7 text-[10px] font-bold px-3 rounded-md transition-all shadow-none uppercase tracking-widest",
                timeFilter === "AFTERNOON"
                  ? "bg-background text-foreground shadow-sm border border-border"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Afternoon
            </Button>
          </div>
        </div>
      </div>

      {/* LEGEND ROW */}
      <div className="flex items-center gap-6 px-6 py-2.5 bg-background border-b border-border z-10 shrink-0">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-400/20" />{" "}
          Ongoing
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400 ring-2 ring-amber-400/20" />{" "}
          Upcoming
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-400 ring-2 ring-slate-400/20" />{" "}
          Returned
        </div>
      </div>

      {/* DAYS HEADER */}
      <div className="grid grid-cols-7 shrink-0 bg-background z-20 shadow-[0_4px_10px_-4px_rgba(0,0,0,0.1)] relative">
        {daysInGrid.map((day) => {
          const isTodayDate = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "flex flex-col items-center justify-center py-3 border-r border-b border-border last:border-r-0 relative transition-colors",
                isTodayDate ? "bg-primary/5 border-b-primary" : "",
              )}
            >
              {isTodayDate && (
                <div className="absolute top-0 left-0 w-full h-[3px] bg-primary rounded-t-full" />
              )}
              <span
                className={cn(
                  "text-[10px] font-black uppercase tracking-widest mb-0.5",
                  isTodayDate ? "text-primary" : "text-muted-foreground",
                )}
              >
                {format(day, "EEE")}
              </span>
              <span
                className={cn(
                  "text-xl font-black leading-none",
                  isTodayDate ? "text-primary" : "text-foreground",
                )}
              >
                {format(day, "dd")}
              </span>
            </div>
          );
        })}
      </div>

      {/* UNIFIED TIMELINE BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-background">
        {/* Background Day Columns (Grid Lines) */}
        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
          {daysInGrid.map((day, i) => (
            <div
              key={i}
              className={cn(
                "border-r border-border h-full last:border-r-0 transition-colors",
                isToday(day) ? "bg-primary/[0.02]" : "",
              )}
            />
          ))}
        </div>

        {/* Unified Canvas */}
        <div
          className="relative w-full"
          style={{ height: `${timelineHeight}px` }}
        >
          {layout.length > 0 ? (
            layout.map(renderBar)
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none opacity-40">
              <Route className="w-8 h-8 mb-2 text-muted-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                No active operations for this view
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
