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
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- TYPES ---
// Removed PENDING, CANCELLED, NO_SHOW. Only actionable states remain.
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

  // --- EVENT FILTERING & SPLITTING ---
  const visibleBookings = useMemo(() => {
    return bookings.filter((b) => {
      const start = new Date(b.startDate);
      const end = new Date(b.endDate);
      const overlapsWeek = start <= weekEnd && end >= weekStart;
      return overlapsWeek;
    });
  }, [bookings, weekStart, weekEnd]);

  // Split into Morning (AM starts) and Afternoon (PM starts)
  const morningBookings = visibleBookings.filter(
    (b) => getHours(new Date(b.startDate)) < 12,
  );
  const afternoonBookings = visibleBookings.filter(
    (b) => getHours(new Date(b.startDate)) >= 12,
  );

  // --- LAYOUT ALGORITHM (GANTT STYLE) ---
  const calculateLayout = (events: OpsEvent[]) => {
    const sorted = [...events].sort(
      (a, b) =>
        new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
    );

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
      rows[rowIndex] = endMs;

      layout.push({ event, leftPercent, widthPercent, rowIndex });
    }

    return layout;
  };

  const morningLayout = calculateLayout(morningBookings);
  const afternoonLayout = calculateLayout(afternoonBookings);

  const maxMorningRows =
    Math.max(0, ...morningLayout.map((l) => l.rowIndex)) + 1;
  const maxAfternoonRows =
    Math.max(0, ...afternoonLayout.map((l) => l.rowIndex)) + 1;
  const ROW_HEIGHT = 32; // Tighter bars to match the image
  const morningSectionHeight = Math.max(150, maxMorningRows * ROW_HEIGHT + 40);
  const afternoonSectionHeight = Math.max(
    150,
    maxAfternoonRows * ROW_HEIGHT + 40,
  );

  // --- STYLING HELPERS ---
  const getEventColors = (status: string) => {
    switch (status) {
      case "ONGOING":
        return "bg-[#bbf7d0] text-[#166534] hover:bg-[#86efac]"; // Green
      case "CONFIRMED":
        return "bg-[#fef08a] text-[#854d0e] hover:bg-[#fde047]"; // Yellow
      case "COMPLETED":
      default:
        return "bg-[#e2e8f0] text-[#334155] hover:bg-[#cbd5e1]"; // Gray
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
    const title = `${event.customerName} - ${event.carBrand} ${event.carModel}`;

    return (
      <div
        key={event.id}
        onClick={() => handleBarClick(event.id)}
        className={cn(
          "absolute h-[26px] rounded flex items-center justify-between px-2.5 text-[10px] font-semibold cursor-pointer transition-colors shadow-sm overflow-hidden z-10",
          colors,
        )}
        style={{
          left: `calc(${leftPercent}% + 2px)`,
          width: `calc(${widthPercent}% - 4px)`,
          top: `${rowIndex * ROW_HEIGHT + 16}px`,
        }}
        title={`${title} (${startStr} to ${endStr})`}
      >
        <span className="shrink-0 opacity-80">{startStr}</span>
        <span className="truncate px-3 flex-1 text-center">{title}</span>
        <span className="shrink-0 opacity-80">{endStr}</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm overflow-hidden font-sans border border-border">
      {/* HEADER TOOLBAR */}
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left: Controls */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={goToToday}
            className="h-8 text-xs font-semibold px-4 text-muted-foreground hover:text-foreground"
          >
            Today
          </Button>
          <div className="flex items-center gap-1 bg-secondary/30 rounded-md p-0.5 border border-border">
            <Button
              variant="ghost"
              size="icon"
              onClick={prevWeek}
              className="h-7 w-7 rounded-sm text-muted-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextWeek}
              className="h-7 w-7 rounded-sm text-muted-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Center: Month/Year */}
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {format(weekStart, "MMMM yyyy")}
        </h2>

        {/* Right: Filters */}
        <div className="flex items-center bg-secondary/30 p-1 rounded-lg border border-border">
          <Button
            variant={timeFilter === "ALL" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTimeFilter("ALL")}
            className={cn(
              "h-7 text-[11px] font-bold px-4 rounded-md transition-all shadow-none",
              timeFilter === "ALL"
                ? "bg-emerald-500 text-white hover:bg-emerald-600"
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
              "h-7 text-[11px] font-bold px-4 rounded-md transition-all shadow-none",
              timeFilter === "MORNING"
                ? "bg-white text-foreground shadow-sm"
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
              "h-7 text-[11px] font-bold px-4 rounded-md transition-all shadow-none",
              timeFilter === "AFTERNOON"
                ? "bg-white text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Afternoon
          </Button>
        </div>
      </div>

      {/* LEGEND ROW */}
      <div className="flex items-center gap-6 px-6 py-2.5 bg-slate-50 border-y border-border">
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-[#4ade80]" /> Ongoing
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-[#facc15]" /> Confirmed
          (Upcoming)
        </div>
        <div className="flex items-center gap-2 text-[11px] font-bold text-muted-foreground">
          <div className="w-2.5 h-2.5 rounded-full bg-[#94a3b8]" /> Returned
        </div>
      </div>

      {/* DAYS HEADER */}
      <div className="grid grid-cols-7 border-b-[3px] border-foreground shrink-0 bg-white">
        {daysInGrid.map((day) => {
          const isTodayDate = isToday(day);
          return (
            <div
              key={day.toISOString()}
              className="flex flex-col items-center justify-center py-3 border-r border-border last:border-r-0"
            >
              <span
                className={cn(
                  "text-xl font-bold leading-none",
                  isTodayDate ? "text-primary" : "text-foreground",
                )}
              >
                {format(day, "dd")}
              </span>
              <span
                className={cn(
                  "text-[10px] font-bold uppercase tracking-widest mt-1",
                  isTodayDate ? "text-primary" : "text-muted-foreground",
                )}
              >
                {format(day, "EEE")}
              </span>
            </div>
          );
        })}
      </div>

      {/* TIMELINE BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-white">
        {/* Vertical Grid Lines */}
        <div className="absolute inset-0 grid grid-cols-7 pointer-events-none">
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="border-r border-border h-full last:border-r-0"
            />
          ))}
        </div>

        {/* MORNING SECTION */}
        {(timeFilter === "ALL" || timeFilter === "MORNING") && (
          <div
            className="relative w-full border-b border-border border-dashed"
            style={{ height: `${morningSectionHeight}px` }}
          >
            {morningLayout.map(renderBar)}
          </div>
        )}

        {/* AFTERNOON SECTION */}
        {(timeFilter === "ALL" || timeFilter === "AFTERNOON") && (
          <div
            className="relative w-full"
            style={{ height: `${afternoonSectionHeight}px` }}
          >
            {afternoonLayout.map(renderBar)}
          </div>
        )}
      </div>
    </div>
  );
}
