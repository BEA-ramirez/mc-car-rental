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
import { ChevronLeft, ChevronRight, Sun, Sunset, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const morningBookings = visibleBookings.filter(
    (b) => getHours(new Date(b.startDate)) < 12,
  );
  const afternoonBookings = visibleBookings.filter(
    (b) => getHours(new Date(b.startDate)) >= 12,
  );

  // --- LAYOUT ALGORITHM ---
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

      // Slight padding to ensure bars don't touch the absolute edges of the day columns
      const leftPercent = ((boundedStartMs - weekStartMs) / totalWeekMs) * 100;
      const widthPercent =
        ((boundedEndMs - boundedStartMs) / totalWeekMs) * 100;

      let rowIndex = 0;
      while (rows[rowIndex] && rows[rowIndex] > startMs) {
        rowIndex++;
      }
      // Add a tiny buffer to the end time so events back-to-back don't overlap in the same row
      rows[rowIndex] = endMs + 60 * 60 * 1000;

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

  // INCREASED ROW HEIGHT FOR BETTER BREATHING ROOM
  const ROW_HEIGHT = 40;
  // Base height plus room for the section title
  const morningSectionHeight = Math.max(160, maxMorningRows * ROW_HEIGHT + 50);
  const afternoonSectionHeight = Math.max(
    160,
    maxAfternoonRows * ROW_HEIGHT + 50,
  );

  // --- STYLING HELPERS ---
  const getEventColors = (status: string) => {
    switch (status) {
      case "ONGOING":
        return "bg-emerald-100/80 text-emerald-800 border-emerald-500 hover:bg-emerald-200/80";
      case "CONFIRMED":
        return "bg-amber-100/80 text-amber-800 border-amber-500 hover:bg-amber-200/80";
      case "COMPLETED":
      default:
        return "bg-slate-100/80 text-slate-700 border-slate-400 hover:bg-slate-200/80";
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

    // Determine if the bar is wide enough to show the full text, otherwise just show name
    const isNarrow = widthPercent < 15;

    return (
      <div
        key={event.id}
        onClick={() => handleBarClick(event.id)}
        className={cn(
          "absolute h-[30px] rounded-md border-l-4 flex items-center justify-between px-2 text-[10px] font-semibold cursor-pointer transition-all shadow-sm overflow-hidden z-10 backdrop-blur-sm",
          colors,
        )}
        style={{
          left: `calc(${leftPercent}% + 4px)`,
          width: `calc(${widthPercent}% - 8px)`,
          // Shift down to account for the section title
          top: `${rowIndex * ROW_HEIGHT + 40}px`,
        }}
        title={`${event.customerName} - ${event.carBrand} ${event.carModel} (${startStr} to ${endStr})`}
      >
        <span className="shrink-0 opacity-70 hidden sm:block font-mono tracking-tight">
          {startStr}
        </span>
        <span className="truncate px-2 flex-1 text-center">
          {event.plate}{" "}
          {!isNarrow && (
            <span className="font-normal opacity-80 border-l border-current/20 pl-2 ml-2">
              {event.carBrand} {event.carModel}
            </span>
          )}
        </span>
        <span className="shrink-0 opacity-70 hidden md:block font-mono tracking-tight">
          {endStr}
        </span>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl shadow-sm overflow-hidden font-sans border border-border">
      {/* HEADER TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between px-5 py-3 gap-4 border-b border-border bg-secondary/20">
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

        <h2 className="text-lg font-black tracking-tight text-foreground uppercase flex items-center gap-2">
          <Calendar className="w-4 h-4 text-primary" />
          {format(weekStart, "MMMM yyyy")}
        </h2>

        {/* Filters */}
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
            All Day
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

      {/* LEGEND ROW */}
      <div className="flex items-center gap-6 px-6 py-2.5 bg-background border-b border-border z-10">
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
      <div className="grid grid-cols-7 shrink-0 bg-background z-10 shadow-sm relative">
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

      {/* TIMELINE BODY */}
      <div className="flex-1 overflow-y-auto custom-scrollbar relative bg-background">
        {/* Background Grid - Added "Today" highlight */}
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

        {/* MORNING SECTION */}
        {(timeFilter === "ALL" || timeFilter === "MORNING") && (
          <div
            className="relative w-full border-b border-border border-dashed"
            style={{ height: `${morningSectionHeight}px` }}
          >
            {/* Section Label */}
            <div className="sticky top-0 left-0 z-20 px-3 py-2 flex items-center gap-1.5 opacity-50">
              <Sun className="w-3.5 h-3.5 text-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground bg-background/50 backdrop-blur-sm px-1 rounded">
                Morning Starts
              </span>
            </div>

            {morningLayout.length > 0 ? (
              morningLayout.map(renderBar)
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
                  No morning releases
                </span>
              </div>
            )}
          </div>
        )}

        {/* AFTERNOON SECTION */}
        {(timeFilter === "ALL" || timeFilter === "AFTERNOON") && (
          <div
            className="relative w-full"
            style={{ height: `${afternoonSectionHeight}px` }}
          >
            {/* Section Label */}
            <div className="sticky top-0 left-0 z-20 px-3 py-2 flex items-center gap-1.5 opacity-50">
              <Sunset className="w-3.5 h-3.5 text-foreground" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-foreground bg-background/50 backdrop-blur-sm px-1 rounded">
                Afternoon Starts
              </span>
            </div>

            {afternoonLayout.length > 0 ? (
              afternoonLayout.map(renderBar)
            ) : (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/30">
                  No afternoon releases
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
