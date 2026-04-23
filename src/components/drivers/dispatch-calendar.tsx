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
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface ScheduleBooking {
  id: string; // This is now the ASSIGNMENT ID, not the booking ID
  driver_id: string;
  driver_name: string;
  start: Date;
  end: Date;
  car: string;
  plate: string;
  location: string;
  dropoffLocation?: string;
  pickupCoordinates?: string | null;
  dropoffCoordinates?: string | null;
  status: string;
  customer: {
    name: string;
    phone: string;
    avatar: string | null;
  } | null;
}

interface DispatchCalendarProps {
  bookings: ScheduleBooking[]; // These are technically "Assignments" now
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

  const monthlyAgendaBookings = useMemo(() => {
    return bookings
      .filter(
        (b) =>
          isSameMonth(b.start, currentDate) || isSameMonth(b.end, currentDate),
      )
      .sort((a, b) => b.start.getTime() - a.start.getTime());
  }, [bookings, currentDate]);

  const handleOpenMap = (
    coords?: string | null,
    fallbackTextAddress?: string,
  ) => {
    if (coords) {
      window.open(`https://maps.google.com/?q=${coords}`, "_blank");
    } else if (fallbackTextAddress) {
      window.open(
        `https://maps.google.com/?q=${encodeURIComponent(fallbackTextAddress)}`,
        "_blank",
      );
    } else {
      toast.error("No location data available to map.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] lg:h-[600px] bg-card border border-border rounded-xl transition-colors">
        <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Loading Calendar...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col lg:flex-row overflow-hidden min-w-0 h-[600px] transition-colors">
      {/* --- CALENDAR SECTION --- */}
      <div className="w-full lg:w-[70%] border-b lg:border-b-0 lg:border-r border-border flex flex-col bg-background h-full transition-colors">
        {/* Calendar Header */}
        <div className="h-[60px] px-3 sm:px-4 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0 transition-colors">
          <div className="flex items-center gap-2 sm:gap-4">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
              <CalendarDays className="w-3.5 h-3.5 hidden sm:block" />
              <span className="hidden sm:inline">
                {mode === "global" ? "Master Dispatch" : "Driver Schedule"}
              </span>
            </h3>
            <div className="h-4 w-px bg-border hidden sm:block" />

            <div className="flex items-center bg-background border border-border rounded-lg px-2 py-1 shadow-sm transition-colors">
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
                className="text-xs sm:text-[13px] font-bold text-foreground bg-transparent outline-none cursor-pointer appearance-none px-1"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option
                    key={i}
                    value={i}
                    className="text-background bg-foreground font-sans"
                  >
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
                className="text-xs sm:text-[13px] font-bold text-foreground bg-transparent outline-none cursor-pointer appearance-none px-1"
              >
                {Array.from({ length: 10 }).map((_, i) => {
                  const yr = new Date().getFullYear() - 2 + i;
                  return (
                    <option
                      key={yr}
                      value={yr}
                      className="text-background bg-foreground font-sans"
                    >
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
              className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-secondary shadow-none transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-secondary shadow-none transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Custom Calendar Grid */}
        <div className="flex-1 min-w-0 bg-background overflow-x-auto custom-scrollbar flex flex-col transition-colors">
          <div className="min-w-[500px] lg:min-w-0 flex-1 flex flex-col p-2 sm:p-4">
            <div className="grid grid-cols-7 mb-1 shrink-0">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div
                  key={day}
                  className="text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground py-1"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 flex-1 border-t border-l border-border bg-secondary/30 rounded-tl-lg transition-colors">
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
                          "relative flex flex-col items-start p-1.5 sm:p-2 border-r border-b border-border min-h-[60px] sm:min-h-[70px] transition-all outline-none group bg-background hover:bg-secondary/50",
                          !isCurrentMonth &&
                            "bg-secondary/20 text-muted-foreground/50",
                          isSelected && "ring-1 ring-inset ring-primary z-10",
                          isHighlighted &&
                            "bg-primary/5 ring-2 ring-inset ring-primary z-20 shadow-sm",
                        )}
                      >
                        <span
                          className={cn(
                            "text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded shrink-0 transition-colors mb-1",
                            isSelected || isHighlighted
                              ? "bg-foreground text-background"
                              : isTodayDate
                                ? "bg-primary/20 text-primary"
                                : !isCurrentMonth
                                  ? "text-muted-foreground/50"
                                  : "text-foreground",
                          )}
                        >
                          {format(day, "d")}
                        </span>

                        {isBooked && (
                          <div
                            className={cn(
                              "w-full text-left px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest truncate border mt-auto shadow-sm transition-all",
                              isTurnover
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                                : dayBookings[0].status === "ACTIVE"
                                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                  : "bg-secondary text-muted-foreground border-border",
                              isHighlighted &&
                                "ring-1 ring-primary border-transparent",
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
                      <PopoverContent
                        className="w-[calc(100vw-24px)] sm:w-80 p-0 shadow-xl border-border rounded-xl bg-card overflow-hidden transition-colors"
                        align="start"
                      >
                        <div className="bg-secondary/30 p-3 border-b border-border flex items-center justify-between transition-colors">
                          <span className="font-bold text-xs text-foreground">
                            {format(day, "MMMM d, yyyy")}
                          </span>
                          {isTurnover && (
                            <Badge
                              variant="outline"
                              className="text-[8px] uppercase tracking-widest h-5 px-1.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-bold rounded"
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
                                className="border-b border-border last:border-0 transition-colors"
                              >
                                <AccordionTrigger className="px-4 py-3 hover:bg-secondary/50 hover:no-underline transition-colors">
                                  <div className="flex flex-col items-start gap-1.5 text-left w-full pr-2">
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-bold text-[11px] text-foreground truncate pr-2">
                                        {mode === "global"
                                          ? booking.driver_name
                                          : booking.car}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-[8px] uppercase tracking-widest h-4 px-1.5 text-muted-foreground shrink-0 bg-background border-border rounded shadow-none"
                                      >
                                        {duration}
                                      </Badge>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-2 text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                                      <span className="font-mono bg-secondary px-1.5 rounded border border-border">
                                        {booking.plate}
                                      </span>
                                      <span
                                        className={cn(
                                          booking.status === "ACTIVE"
                                            ? "text-emerald-600 dark:text-emerald-400"
                                            : "text-blue-600 dark:text-blue-400",
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
                                      <Clock className="w-3.5 h-3.5 text-muted-foreground mt-0.5" />
                                      <div className="text-[10px] space-y-1.5 w-full">
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-muted-foreground uppercase tracking-widest w-8">
                                            Start
                                          </span>
                                          <span className="font-semibold text-foreground bg-secondary px-1.5 py-0.5 rounded border border-border font-mono">
                                            {format(
                                              booking.start,
                                              "MMM d, h:mm a",
                                            )}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span className="font-bold text-muted-foreground uppercase tracking-widest w-8">
                                            End
                                          </span>
                                          <span className="font-semibold text-foreground bg-secondary px-1.5 py-0.5 rounded border border-border font-mono">
                                            {format(
                                              booking.end,
                                              "MMM d, h:mm a",
                                            )}
                                          </span>
                                        </div>
                                      </div>
                                    </div>

                                    <div className="flex flex-col gap-2.5 pt-3 border-t border-border">
                                      <div className="flex items-start gap-2 w-full">
                                        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                        <div className="text-[10px] flex-1">
                                          <p className="font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                                            Pickup Location
                                          </p>
                                          <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-foreground leading-tight">
                                              {booking.location}
                                            </p>
                                            <Button
                                              variant="secondary"
                                              size="icon"
                                              className="h-6 w-6 shrink-0 rounded bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-none"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenMap(
                                                  booking.pickupCoordinates,
                                                  booking.location,
                                                );
                                              }}
                                              title="Open Pickup in Maps"
                                            >
                                              <Navigation className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-start gap-2 w-full">
                                        <MapPin className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                                        <div className="text-[10px] flex-1">
                                          <p className="font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                                            Dropoff Location
                                          </p>
                                          <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-foreground leading-tight">
                                              {booking.dropoffLocation || "N/A"}
                                            </p>
                                            <Button
                                              variant="secondary"
                                              size="icon"
                                              className="h-6 w-6 shrink-0 rounded bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border border-amber-500/20 shadow-none"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                handleOpenMap(
                                                  booking.dropoffCoordinates,
                                                  booking.dropoffLocation,
                                                );
                                              }}
                                              title="Open Dropoff in Maps"
                                            >
                                              <Navigation className="w-3 h-3" />
                                            </Button>
                                          </div>
                                        </div>
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
                      <PopoverContent className="w-auto p-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground border-border bg-card shadow-md rounded-lg">
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
      <div className="w-full lg:w-[30%] flex flex-col bg-card min-w-0 border-t lg:border-t-0 lg:border-l border-border h-full transition-colors">
        <div className="h-[60px] px-3 sm:px-4 border-b border-border bg-secondary/30 shrink-0 flex items-center justify-between transition-colors">
          <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" />
            {format(currentDate, "MMMM")} Agenda
          </h3>
          <Badge
            variant="outline"
            className="text-[9px] bg-background text-muted-foreground border-border shadow-none font-bold uppercase rounded-md transition-colors"
          >
            {monthlyAgendaBookings.length} Shifts
          </Badge>
        </div>

        {/* THE FIX: min-h-0 wrapper forces ScrollArea to adhere to parent bounds and not stretch! */}
        <div className="flex-1 min-h-0 overflow-hidden">
          <ScrollArea className="h-full w-full bg-background custom-scrollbar">
            <div className="p-3 sm:p-4 space-y-3">
              {monthlyAgendaBookings.length === 0 ? (
                <div className="p-8 text-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground border border-dashed border-border rounded-xl transition-colors">
                  No assignments for {format(currentDate, "MMMM")}.
                </div>
              ) : (
                monthlyAgendaBookings.map((b) => {
                  const isSelected = highlightedBookingId === b.id;
                  return (
                    <div
                      key={b.id}
                      onClick={() =>
                        setHighlightedBookingId(isSelected ? null : b.id)
                      }
                      className={cn(
                        "p-3.5 border rounded-xl transition-all cursor-pointer select-none bg-card shrink-0",
                        isSelected
                          ? "bg-primary/5 border-primary shadow-sm ring-1 ring-primary"
                          : "border-border hover:border-primary/50 hover:shadow-sm",
                      )}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="font-bold text-[11px] text-foreground truncate">
                            {mode === "global" ? b.driver_name : b.car}
                          </span>
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1 truncate flex items-center gap-1.5">
                            <Car className="w-3 h-3 shrink-0" />
                            <span className="font-mono bg-secondary px-1.5 rounded border border-border">
                              {b.plate}
                            </span>
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] h-4 px-1.5 uppercase font-bold tracking-widest shrink-0 rounded shadow-none border",
                            b.status === "ACTIVE"
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : "bg-secondary text-muted-foreground border-border",
                          )}
                        >
                          {b.status}
                        </Badge>
                      </div>

                      <div
                        className={cn(
                          "space-y-1.5 text-[9px] font-bold uppercase tracking-widest p-2.5 rounded-lg border transition-colors",
                          isSelected
                            ? "bg-background border-primary/20"
                            : "bg-secondary/50 border-border",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">Start</span>
                          <span className="font-mono text-foreground">
                            {format(b.start, "MMM dd, HH:mm")}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-muted-foreground">End</span>
                          <span className="font-mono text-foreground">
                            {format(b.end, "MMM dd, HH:mm")}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
