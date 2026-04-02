"use client";

import React, { useState, useMemo } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  format,
  isSameDay,
  isWithinInterval,
  intervalToDuration,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isToday,
} from "date-fns";
import {
  Clock,
  MapPin,
  CalendarDays,
  Activity,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Car,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface ScheduleBooking {
  id: string;
  driver_id: string;
  driver_name: string;
  start: Date;
  end: Date;
  car: string;
  plate: string;
  location: string;
  status: string;
  customer: {
    name: string;
    phone: string;
    avatar: string | null;
  } | null;
}

interface DispatchCalendarProps {
  bookings: ScheduleBooking[];
  isLoading: boolean;
  mode: "global" | "specific";
}

export default function DispatchCalendar({
  bookings,
  isLoading,
  mode,
}: DispatchCalendarProps) {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [highlightedBookingId, setHighlightedBookingId] = useState<
    string | null
  >(null);

  const daysInMonth = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const getDurationString = (start: Date, end: Date) => {
    const duration = intervalToDuration({ start, end });
    const days = duration.days || 0;
    const hours = duration.hours || 0;
    if (days > 0 && hours > 0) return `${days}d ${hours}h`;
    if (days > 0) return `${days} Days`;
    return `${hours} Hours`;
  };

  const getBookingsForDay = (day: Date) => {
    return bookings.filter(
      (b) =>
        isSameDay(day, b.start) ||
        isSameDay(day, b.end) ||
        isWithinInterval(day, { start: b.start, end: b.end }),
    );
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] lg:h-full bg-[#F8FAFC] border border-slate-200 rounded-sm">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Loading Calendar...
        </span>
      </div>
    );
  }

  const sortedBookings = [...bookings].sort(
    (a, b) => a.start.getTime() - b.start.getTime(),
  );

  return (
    <div className="bg-[#F8FAFC] border border-slate-200 rounded-sm shadow-sm flex flex-col lg:flex-row overflow-hidden min-w-0 h-full">
      {/* --- CALENDAR SECTION --- */}
      <div className="w-full lg:w-[70%] border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-white min-h-[400px]">
        {/* Calendar Header - Fixed Height for Alignment */}
        <div className="h-[60px] px-3 sm:px-4 border-b border-slate-200 bg-[#F8FAFC] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2 sm:gap-4">
            <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 hidden sm:block" />
              <span className="hidden sm:inline">
                {mode === "global" ? "Master Dispatch" : "Driver Schedule"}
              </span>
            </h3>
            <div className="h-4 w-px bg-slate-300 hidden sm:block" />

            {/* Native Selectors for Mobile Ease */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-sm px-1.5 py-1">
              <select
                value={currentDate.getMonth()}
                onChange={(e) =>
                  setCurrentDate(
                    new Date(
                      currentDate.getFullYear(),
                      parseInt(e.target.value),
                      1,
                    ),
                  )
                }
                className="text-xs sm:text-sm font-bold text-[#0F172A] bg-transparent outline-none cursor-pointer appearance-none px-1"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {format(new Date(2000, i, 1), "MMM")}
                  </option>
                ))}
              </select>
              <select
                value={currentDate.getFullYear()}
                onChange={(e) =>
                  setCurrentDate(
                    new Date(
                      parseInt(e.target.value),
                      currentDate.getMonth(),
                      1,
                    ),
                  )
                }
                className="text-xs sm:text-sm font-bold text-[#0F172A] bg-transparent outline-none cursor-pointer appearance-none px-1"
              >
                {Array.from({ length: 10 }).map((_, i) => {
                  const yr = new Date().getFullYear() - 2 + i;
                  return (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <Button
              variant="outline"
              size="icon"
              onClick={prevMonth}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-sm border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-7 w-7 sm:h-8 sm:w-8 rounded-sm border-slate-200 text-slate-600 hover:bg-slate-100"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Custom Calendar Grid */}
        <div className="flex-1 min-w-0 bg-white overflow-x-auto custom-scrollbar flex flex-col">
          <div className="min-w-[500px] lg:min-w-0 flex-1 flex flex-col p-1.5 sm:p-4">
            <div className="grid grid-cols-7 mb-1 shrink-0">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-slate-400 py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 flex-1 border-t border-l border-slate-100 bg-[#F8FAFC]">
              {daysInMonth.map((day) => {
                const dayBookings = getBookingsForDay(day);
                const isBooked = dayBookings.length > 0;
                const isTurnover =
                  mode === "specific" && dayBookings.length > 1;
                const isHighlighted = dayBookings.some(
                  (b) => b.id === highlightedBookingId,
                );
                const isCurrentMonth = isSameMonth(day, currentDate);
                const isSelected = isSameDay(day, selectedDate);
                const isTodayDate = isToday(day);

                return (
                  <Popover key={day.toISOString()}>
                    <PopoverTrigger asChild>
                      <button
                        onClick={() => setSelectedDate(day)}
                        className={cn(
                          "relative flex flex-col items-start p-1 sm:p-1.5 border-r border-b border-slate-100 min-h-[50px] sm:min-h-[70px] transition-all outline-none group bg-white hover:bg-slate-50",
                          !isCurrentMonth && "bg-[#F8FAFC]/50 text-slate-400",
                          isSelected && "ring-1 ring-inset ring-slate-300 z-10",
                          isHighlighted &&
                            "bg-blue-50/30 ring-2 ring-inset ring-[#0F172A] z-20 shadow-sm",
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px] sm:text-[11px] font-bold w-5 h-5 flex items-center justify-center rounded-sm shrink-0 transition-colors mb-0.5",
                            isSelected || isHighlighted
                              ? "bg-[#0F172A] text-white"
                              : isTodayDate
                                ? "bg-blue-100 text-blue-700"
                                : !isCurrentMonth
                                  ? "text-slate-400"
                                  : "text-slate-700",
                          )}
                        >
                          {format(day, "d")}
                        </span>

                        {isBooked && (
                          <div
                            className={cn(
                              "w-full text-left px-1 sm:px-1.5 py-0.5 rounded-sm text-[7px] sm:text-[9px] font-bold uppercase tracking-widest truncate border mt-auto shadow-sm transition-all",
                              isTurnover
                                ? "bg-amber-50 text-amber-700 border-amber-200 group-hover:border-amber-300"
                                : dayBookings[0].status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  : "bg-[#F8FAFC] text-slate-600 border-slate-200",
                              isHighlighted &&
                                "ring-1 ring-[#0F172A] border-transparent",
                            )}
                          >
                            {isTurnover
                              ? "Turnover"
                              : mode === "global"
                                ? dayBookings.length > 1
                                  ? `${dayBookings.length} Trips`
                                  : dayBookings[0].driver_name.split(" ")[0]
                                : dayBookings[0].car}
                          </div>
                        )}
                      </button>
                    </PopoverTrigger>

                    {isBooked ? (
                      // CRITICAL FIX: w-[calc(100vw-24px)] prevents horizontal overflow on small mobile screens
                      <PopoverContent
                        className="w-[calc(100vw-24px)] sm:w-80 p-0 shadow-xl border-slate-200 rounded-lg overflow-hidden"
                        align="start"
                      >
                        <div className="bg-slate-50 p-3 border-b border-slate-100 flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-800">
                            {format(day, "MMMM d, yyyy")}
                          </span>
                          {isTurnover && (
                            <Badge
                              variant="outline"
                              className="text-[9px] uppercase tracking-wider h-5 px-1.5 bg-amber-50 text-amber-700 border-amber-200 font-bold"
                            >
                              Turnover
                            </Badge>
                          )}
                        </div>

                        <Accordion
                          type="single"
                          collapsible
                          className="w-full max-h-[50vh] overflow-y-auto custom-scrollbar"
                        >
                          {dayBookings.map((booking) => {
                            const duration = getDurationString(
                              booking.start,
                              booking.end,
                            );
                            return (
                              <AccordionItem
                                value={booking.id}
                                key={booking.id}
                                className="border-b border-slate-100 last:border-0"
                              >
                                <AccordionTrigger className="px-4 py-3 hover:bg-slate-50 hover:no-underline">
                                  <div className="flex flex-col items-start gap-1 text-left w-full pr-2">
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-bold text-xs text-slate-800 truncate pr-2">
                                        {mode === "global"
                                          ? booking.driver_name
                                          : booking.car}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-[8px] sm:text-[9px] uppercase tracking-wider h-4 px-1.5 text-slate-500 shrink-0 bg-white"
                                      >
                                        {duration}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                                      <span className="font-mono bg-slate-100 px-1 rounded border border-slate-200">
                                        {booking.plate}
                                      </span>
                                      <span
                                        className={cn(
                                          booking.status === "ACTIVE"
                                            ? "text-emerald-600 font-bold"
                                            : "text-blue-600",
                                        )}
                                      >
                                        {booking.status}
                                      </span>
                                    </div>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 pb-4 pt-0">
                                  <div className="space-y-3 pt-2">
                                    <div className="flex items-start gap-2">
                                      <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                      <div className="text-[10px] space-y-1.5 w-full">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-500 uppercase tracking-wider w-8">
                                            Start
                                          </span>
                                          <span className="font-medium text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                            {format(
                                              booking.start,
                                              "MMM d, h:mm a",
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-slate-500 uppercase tracking-wider w-8">
                                            End
                                          </span>
                                          <span className="font-medium text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                            {format(
                                              booking.end,
                                              "MMM d, h:mm a",
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                                      <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                      <div className="text-[10px] pr-2">
                                        <p className="font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                                          Destination
                                        </p>
                                        <p className="font-medium text-slate-800 leading-tight">
                                          {booking.location}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            );
                          })}
                        </Accordion>
                      </PopoverContent>
                    ) : (
                      <PopoverContent className="w-auto p-3 text-[10px] font-medium text-slate-500 border-slate-200 shadow-md">
                        <p>No schedule for {format(day, "MMM d")}</p>
                      </PopoverContent>
                    )}
                  </Popover>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- AGENDA LIST SECTION --- */}
      <div className="w-full lg:w-[30%] flex flex-col bg-white min-w-0 border-t lg:border-t-0 lg:border-l border-slate-200">
        {/* Agenda Header - Matches height with Calendar Header */}
        <div className="h-[60px] px-3 sm:px-4 border-b border-slate-200 bg-[#F8FAFC] shrink-0 flex items-center justify-between">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            {mode === "global" ? "Fleet Agenda" : "Driver Agenda"}
          </h3>
          <Badge
            variant="outline"
            className="text-[9px] bg-white text-slate-500 border-slate-200 shadow-none font-bold uppercase"
          >
            {sortedBookings.length} Total
          </Badge>
        </div>

        {/* Native flex column layout - Mobile friendly scrolling */}
        <div className="flex-1 min-h-[300px] overflow-y-auto custom-scrollbar bg-[#F8FAFC]/50 p-3 sm:p-4 space-y-3">
          {sortedBookings.length === 0 ? (
            <div className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 border border-dashed border-slate-200 rounded-sm">
              No active assignments.
            </div>
          ) : (
            sortedBookings.map((b) => {
              const isSelected = highlightedBookingId === b.id;
              return (
                <div
                  key={b.id}
                  onClick={() =>
                    setHighlightedBookingId(isSelected ? null : b.id)
                  }
                  className={cn(
                    "p-4 border rounded-sm transition-all cursor-pointer select-none bg-white shrink-0",
                    isSelected
                      ? "bg-blue-50/50 border-[#0F172A] shadow-sm ring-1 ring-[#0F172A]"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm",
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="font-bold text-xs text-[#0F172A] truncate">
                        {mode === "global" ? b.driver_name : b.car}
                      </span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 truncate flex items-center gap-1.5">
                        <Car className="w-3 h-3 shrink-0" />
                        <span className="font-mono bg-slate-100 px-1 rounded">
                          {b.plate}
                        </span>
                      </span>
                    </div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[8px] h-5 px-1.5 uppercase font-bold tracking-widest shrink-0 rounded-sm shadow-none border",
                        b.status === "ACTIVE"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-[#F8FAFC] text-slate-600 border-slate-200",
                      )}
                    >
                      {b.status}
                    </Badge>
                  </div>

                  <div
                    className={cn(
                      "space-y-1.5 text-[9px] uppercase tracking-widest p-2.5 rounded-sm border transition-colors",
                      isSelected
                        ? "bg-white border-blue-100"
                        : "bg-[#F8FAFC] border-slate-100",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-400">Start</span>
                      <span className="font-bold text-[#0F172A]">
                        {format(b.start, "MMM dd, HH:mm")}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-slate-400">End</span>
                      <span className="font-bold text-[#0F172A]">
                        {format(b.end, "MMM dd, HH:mm")}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
