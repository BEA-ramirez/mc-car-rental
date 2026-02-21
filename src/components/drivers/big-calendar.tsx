"use client";

import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
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
import {
  format,
  isSameDay,
  isWithinInterval,
  intervalToDuration,
} from "date-fns";
import { Clock, MapPin, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// --- MOCK DATA ---
const bookings = [
  {
    id: "trip-1",
    start: new Date(2026, 1, 14, 15, 0),
    end: new Date(2026, 1, 15, 15, 0),
    car: "Toyota Vios",
    plate: "ABC-1234",
    location: "NAIA Terminal 3",
    status: "Confirmed",
  },
  {
    id: "trip-2",
    start: new Date(2026, 1, 15, 17, 0),
    end: new Date(2026, 1, 17, 17, 0),
    car: "Innova",
    plate: "XYZ-888",
    location: "Batangas Pier",
    status: "Pending",
  },
  {
    id: "trip-3",
    start: new Date(2026, 1, 1, 17, 0),
    end: new Date(2026, 1, 3, 17, 0),
    car: "Innova",
    plate: "XYZ-888",
    location: "Batangas Pier",
    status: "Pending",
  },
  {
    id: "trip-4",
    start: new Date(2026, 1, 9, 17, 0),
    end: new Date(2026, 1, 10, 17, 0),
    car: "Innova",
    plate: "XYZ-888",
    location: "Batangas Pier",
    status: "Pending",
  },
];

export default function DriverSchedule() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const getDurationString = (start: Date, end: Date) => {
    const duration = intervalToDuration({ start, end });
    const days = duration.days || 0;
    const hours = duration.hours || 0;
    if (days > 0 && hours > 0) return `${days}d ${hours}h`;
    if (days > 0) return `${days} Days`;
    return `${hours} Hours`;
  };

  const getBookingsForDay = (day: Date) => {
    return bookings.filter((b) => {
      return (
        isSameDay(day, b.start) ||
        isSameDay(day, b.end) ||
        isWithinInterval(day, { start: b.start, end: b.end })
      );
    });
  };

  return (
    <div className="w-full h-full flex flex-col bg-white rounded-md">
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="w-full h-full p-0 flex flex-col"
        classNames={{
          months: "flex flex-col flex-1 h-full w-full",
          month: "flex flex-col flex-1 h-full w-full",
          caption:
            "flex justify-between pt-1 relative items-center mb-3 px-2 shrink-0",
          caption_label: "text-sm font-bold text-slate-800",
          nav: "space-x-1 flex items-center",
          nav_button:
            "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-slate-200 rounded-md flex items-center justify-center text-slate-600 hover:bg-slate-50",

          // --- FLEXBOX OVERRIDES FOR THE TABLE ---
          table: "w-full h-full flex flex-col flex-1",
          head: "w-full shrink-0 flex",
          head_row: "flex w-full mb-2",
          head_cell:
            "text-slate-500 font-bold text-[10px] uppercase tracking-wider flex-1 text-center",
          tbody: "flex flex-col flex-1 w-full",
          row: "flex w-full flex-1 border-t border-slate-100",
          cell: "flex-1 relative p-0 text-center border-r border-slate-100 last:border-r-0 flex flex-col items-stretch overflow-hidden focus-within:relative focus-within:z-20",
          day: "w-full h-full p-0 font-normal aria-selected:opacity-100",
        }}
        components={{
          Day: (props: any) => {
            const currentDay = props.day.date || props.date;

            // Empty cells must also flex to keep the grid aligned
            if (!currentDay)
              return (
                <td className="flex-1 w-full h-full p-0 bg-slate-50/30 border-r border-slate-100 last:border-r-0" />
              );

            const dayBookings = getBookingsForDay(currentDay);
            const isBooked = dayBookings.length > 0;
            const isTurnover = dayBookings.length > 1;

            const { day, modifiers, ...buttonProps } = props;

            return (
              <td className="flex-1 flex flex-col w-full h-full p-0 relative focus-within:relative focus-within:z-20 border-r border-slate-100 last:border-r-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      {...buttonProps}
                      className={cn(
                        "w-full h-full flex-1 flex flex-col items-start p-1.5 gap-1 transition-colors outline-none hover:bg-slate-50 overflow-hidden",
                        props.selected &&
                          "bg-slate-50 ring-1 ring-inset ring-slate-300",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (buttonProps.onClick) buttonProps.onClick(e);
                      }}
                    >
                      {/* Date Number */}
                      <span
                        className={cn(
                          "text-[11px] font-semibold w-5 h-5 flex items-center justify-center rounded-[4px] shrink-0",
                          props.selected
                            ? "bg-slate-800 text-white"
                            : "text-slate-600",
                          isSameDay(currentDay, new Date()) &&
                            !props.selected &&
                            "bg-blue-100 text-blue-700",
                        )}
                      >
                        {format(currentDay, "d")}
                      </span>

                      {/* Event Bar */}
                      {isBooked && (
                        <div
                          className={cn(
                            "w-full text-left px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold uppercase tracking-wider truncate border mt-auto",
                            isTurnover
                              ? "bg-amber-50 text-amber-700 border-amber-200"
                              : dayBookings[0].status === "Confirmed"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-blue-50 text-blue-700 border-blue-200",
                          )}
                        >
                          {isTurnover ? "Turnover" : dayBookings[0].car}
                        </div>
                      )}
                    </button>
                  </PopoverTrigger>

                  {isBooked ? (
                    <PopoverContent
                      className="w-80 p-0 shadow-xl border-slate-200 rounded-lg overflow-hidden"
                      align="start"
                    >
                      <div className="bg-slate-50 p-3 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-800">
                          {format(currentDay, "MMMM d, yyyy")}
                        </span>
                        {isTurnover && (
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase tracking-wider h-5 px-1.5 bg-amber-50 text-amber-700 border-amber-200 font-bold"
                          >
                            Turnover Day
                          </Badge>
                        )}
                      </div>

                      <Accordion type="single" collapsible className="w-full">
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
                                    <span className="font-bold text-xs text-slate-800">
                                      {booking.car}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[9px] uppercase tracking-wider h-4 px-1.5 text-slate-500 border-slate-200 bg-white"
                                    >
                                      {duration}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium mt-0.5">
                                    <span className="font-mono bg-slate-100 px-1 rounded border border-slate-200">
                                      {booking.plate}
                                    </span>
                                    <span>•</span>
                                    <span
                                      className={cn(
                                        booking.status === "Confirmed"
                                          ? "text-emerald-600"
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
                                        <span className="font-bold text-slate-500 uppercase tracking-wider w-10">
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
                                        <span className="font-bold text-slate-500 uppercase tracking-wider w-10">
                                          End
                                        </span>
                                        <span className="font-medium text-slate-800 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                                          {format(booking.end, "MMM d, h:mm a")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-2 pt-2 border-t border-slate-100">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5" />
                                    <div className="text-[10px]">
                                      <p className="font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                                        Destination
                                      </p>
                                      <p className="font-medium text-slate-800">
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
                      <p>No schedule for {format(currentDay, "MMMM d")}</p>
                    </PopoverContent>
                  )}
                </Popover>
              </td>
            );
          },
        }}
      />
    </div>
  );
}
