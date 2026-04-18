"use client";

import React, { useState } from "react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  format,
  isSameDay,
  isWithinInterval,
  intervalToDuration,
} from "date-fns";
import {
  Clock,
  MapPin,
  CalendarDays,
  Activity,
  User,
  Loader2,
  Phone,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useDriverSchedules } from "../../../hooks/use-drivers";

export default function DriverScheduleTab() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [highlightedBookingId, setHighlightedBookingId] = useState<
    string | null
  >(null);

  const { data: realBookings = [], isLoading } = useDriverSchedules();

  const getDurationString = (start: Date, end: Date) => {
    const duration = intervalToDuration({ start, end });
    const days = duration.days || 0;
    const hours = duration.hours || 0;
    if (days > 0 && hours > 0) return `${days}d ${hours}h`;
    if (days > 0) return `${days} Days`;
    return `${hours} Hours`;
  };

  const getBookingsForDay = (day: Date) => {
    return realBookings.filter((b: any) => {
      return (
        isSameDay(day, b.start) ||
        isSameDay(day, b.end) ||
        isWithinInterval(day, { start: b.start, end: b.end })
      );
    });
  };

  // Helper for initials
  const getInitials = (name: string) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-100 lg:h-125 bg-[#F8FAFC] border border-slate-200 rounded-sm">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Loading Dispatch Data...
        </span>
      </div>
    );
  }

  return (
    <div className="bg-[#F8FAFC] border border-slate-200 rounded-sm shadow-sm flex flex-col lg:flex-row overflow-hidden min-w-0">
      {/* --- CALENDAR SECTION --- */}
      <div className="w-full lg:w-2/3 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50 min-h-100 lg:min-h-125">
        <div className="p-4 border-b border-slate-200 bg-white flex justify-between items-center shrink-0">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <CalendarDays className="w-3.5 h-3.5" /> Dispatch Calendar
          </h3>
        </div>

        {/* Responsive horizontal scroll wrapper for mobile */}
        <div className="flex-1 p-0 sm:p-4 min-w-0 bg-white overflow-x-auto custom-scrollbar">
          <div className="min-w-150 lg:min-w-0 h-full p-4 sm:p-0">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="w-full h-full p-0 flex flex-col"
              classNames={{
                months: "flex flex-col flex-1 h-full w-full",
                month: "flex flex-col flex-1 h-full w-full",
                caption:
                  "flex justify-between pt-1 relative items-center mb-4 px-2 shrink-0",
                caption_label: "text-sm font-bold text-slate-900",
                nav: "space-x-1 flex items-center",
                nav_button:
                  "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-slate-200 rounded-sm flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors",
                table: "w-full h-full flex flex-col flex-1",
                head: "w-full shrink-0 flex",
                head_row: "flex w-full mb-2",
                head_cell:
                  "text-slate-500 font-bold text-[10px] uppercase tracking-widest flex-1 text-center",
                tbody: "flex flex-col flex-1 w-full border-t border-slate-200",
                row: "flex w-full flex-1 border-b border-slate-100 last:border-b-0",
                cell: "flex-1 relative p-0 text-center border-r border-slate-100 last:border-r-0 flex flex-col items-stretch overflow-hidden focus-within:relative focus-within:z-20",
                day: "w-full h-full p-0 font-normal aria-selected:opacity-100",
              }}
              components={{
                Day: (props: any) => {
                  const currentDay = props.day.date || props.date;

                  if (!currentDay)
                    return (
                      <td className="flex-1 w-full h-full p-0 bg-[#F8FAFC] border-r border-slate-100 last:border-r-0" />
                    );

                  const dayBookings = getBookingsForDay(currentDay);
                  const isBooked = dayBookings.length > 0;
                  const isTurnover = dayBookings.length > 1;

                  const isHighlighted = dayBookings.some(
                    (b: any) => b.id === highlightedBookingId,
                  );

                  const {
                    day: _day,
                    modifiers: _modifiers,
                    ...buttonProps
                  } = props;

                  return (
                    <td className="flex-1 flex flex-col w-full h-full p-0 relative focus-within:relative focus-within:z-20 border-r border-slate-100 last:border-r-0 bg-white">
                      <Popover>
                        <PopoverTrigger asChild>
                          <button
                            {...buttonProps}
                            className={cn(
                              "w-full h-full flex-1 flex flex-col items-start p-1.5 gap-1 transition-all outline-none hover:bg-slate-50 overflow-hidden",
                              props.selected &&
                                "bg-slate-50 ring-1 ring-inset ring-slate-300",
                              isHighlighted &&
                                "bg-blue-50 ring-2 ring-inset ring-blue-600",
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              if (buttonProps.onClick) buttonProps.onClick(e);
                            }}
                          >
                            <span
                              className={cn(
                                "text-[11px] font-bold w-6 h-6 flex items-center justify-center rounded-sm shrink-0 transition-colors",
                                props.selected || isHighlighted
                                  ? "bg-slate-900 text-white"
                                  : "text-slate-600",
                                isSameDay(currentDay, new Date()) &&
                                  !props.selected &&
                                  !isHighlighted &&
                                  "bg-blue-100 text-blue-700",
                              )}
                            >
                              {format(currentDay, "d")}
                            </span>

                            {isBooked && (
                              <div
                                className={cn(
                                  "w-full text-left px-2 py-1 rounded-sm text-[9px] font-bold uppercase tracking-widest truncate border mt-auto shadow-sm",
                                  isTurnover
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : dayBookings[0].status === "ACTIVE"
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-[#F1F5F9] text-slate-700 border-slate-200",
                                  isHighlighted &&
                                    "ring-1 ring-blue-600 border-transparent",
                                )}
                              >
                                {isTurnover
                                  ? "Turnover"
                                  : dayBookings[0].driver_name.split(" ")[0]}
                              </div>
                            )}
                          </button>
                        </PopoverTrigger>

                        {isBooked ? (
                          <PopoverContent
                            className="w-[calc(100vw-2rem)] sm:w-96 p-0 shadow-xl border-slate-200 rounded-sm overflow-hidden"
                            align="start"
                            sideOffset={8}
                          >
                            <div className="bg-[#F8FAFC] p-4 border-b border-slate-200 flex items-center justify-between">
                              <span className="font-bold text-xs text-slate-900 uppercase tracking-widest">
                                {format(currentDay, "MMM d, yyyy")}
                              </span>
                              {isTurnover && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] uppercase tracking-widest h-5 px-1.5 bg-amber-50 text-amber-700 border-amber-200 font-bold rounded-sm shadow-none"
                                >
                                  Turnover Day
                                </Badge>
                              )}
                            </div>

                            <Accordion
                              type="single"
                              collapsible
                              className="w-full"
                            >
                              {dayBookings.map((booking: any) => {
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
                                    <AccordionTrigger className="px-5 py-4 hover:bg-slate-50 hover:no-underline">
                                      <div className="flex flex-col items-start gap-1 text-left w-full pr-2">
                                        <div className="flex items-center justify-between w-full mb-1">
                                          <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                                            <User className="w-3.5 h-3.5 text-slate-400" />{" "}
                                            {booking.driver_name}
                                          </span>
                                          <Badge
                                            variant="outline"
                                            className="text-[9px] uppercase tracking-widest h-5 px-1.5 text-slate-500 border-slate-200 bg-white rounded-sm font-bold shadow-none"
                                          >
                                            {duration}
                                          </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
                                          <span className="font-bold text-slate-700">
                                            {booking.car}
                                          </span>
                                          <span>•</span>
                                          <span
                                            className={cn(
                                              "font-bold",
                                              booking.status === "ACTIVE"
                                                ? "text-emerald-600"
                                                : "text-blue-600",
                                            )}
                                          >
                                            {booking.status}
                                          </span>
                                        </div>
                                      </div>
                                    </AccordionTrigger>

                                    <AccordionContent className="px-5 pb-5 pt-0">
                                      <div className="space-y-4 pt-2">
                                        {/* Customer Info Block */}
                                        {booking.customer && (
                                          <div className="flex items-center gap-3 p-3 bg-[#F8FAFC] border border-slate-200 rounded-sm">
                                            <Avatar className="h-8 w-8 rounded-sm border border-slate-200">
                                              <AvatarImage
                                                src={
                                                  booking.customer.avatar ||
                                                  undefined
                                                }
                                                className="object-cover"
                                              />
                                              <AvatarFallback className="text-[10px] font-bold bg-white text-slate-600 rounded-sm">
                                                {getInitials(
                                                  booking.customer.name,
                                                )}
                                              </AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col min-w-0">
                                              <span className="text-[10px] font-bold text-slate-900 uppercase tracking-wide truncate">
                                                {booking.customer.name}
                                              </span>
                                              <span className="text-[9px] font-medium text-slate-500 flex items-center gap-1 truncate">
                                                <Phone className="w-2.5 h-2.5 shrink-0" />{" "}
                                                {booking.customer.phone}
                                              </span>
                                            </div>
                                          </div>
                                        )}

                                        <div className="flex items-start gap-2">
                                          <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                          <div className="text-[10px] space-y-2 w-full uppercase tracking-widest font-medium">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                                              <span className="text-slate-500">
                                                Start
                                              </span>
                                              <span className="text-slate-900 font-bold bg-[#F8FAFC] px-2 py-0.5 rounded-sm border border-slate-200 w-fit sm:w-auto">
                                                {format(
                                                  booking.start,
                                                  "MMM d, h:mm a",
                                                )}
                                              </span>
                                            </div>
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-0">
                                              <span className="text-slate-500">
                                                End
                                              </span>
                                              <span className="text-slate-900 font-bold bg-[#F8FAFC] px-2 py-0.5 rounded-sm border border-slate-200 w-fit sm:w-auto">
                                                {format(
                                                  booking.end,
                                                  "MMM d, h:mm a",
                                                )}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-start gap-2 pt-3 border-t border-slate-100">
                                          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                                          <div className="text-[10px] uppercase tracking-widest font-medium w-full">
                                            <p className="text-slate-500 mb-1">
                                              Destination
                                            </p>
                                            <p className="text-slate-900 font-bold bg-[#F8FAFC] px-2 py-1.5 rounded-sm border border-slate-200 wrap-break-words">
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
                          <PopoverContent
                            className="w-auto p-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 border-slate-200 shadow-lg rounded-sm"
                            sideOffset={8}
                          >
                            <p>No dispatch for {format(currentDay, "MMM d")}</p>
                          </PopoverContent>
                        )}
                      </Popover>
                    </td>
                  );
                },
              }}
            />
          </div>
        </div>
      </div>

      {/* --- AGENDA LIST SECTION --- */}
      <div className="w-full lg:w-1/3 flex flex-col bg-white min-w-0">
        <div className="p-4 border-b border-slate-200 shrink-0">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
            <Activity className="w-3.5 h-3.5" /> Active Assignments
          </h3>
        </div>

        <ScrollArea className="flex-1 h-100 lg:h-auto">
          <div className="p-4 space-y-3">
            {realBookings.length === 0 ? (
              <div className="p-8 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                No active assignments found.
              </div>
            ) : (
              realBookings.map((b: any) => {
                const isSelected = highlightedBookingId === b.id;
                return (
                  <div
                    key={b.id}
                    onClick={() =>
                      setHighlightedBookingId(isSelected ? null : b.id)
                    }
                    className={cn(
                      "p-4 border rounded-sm transition-all cursor-pointer shadow-none select-none",
                      isSelected
                        ? "bg-blue-50/50 border-blue-300 ring-1 ring-blue-500"
                        : "bg-white border-slate-200 hover:bg-[#F8FAFC]",
                    )}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="font-bold text-xs text-slate-900 pr-2 flex flex-col min-w-0">
                        <span className="truncate">{b.driver_name}</span>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest mt-1 truncate">
                          {b.car} • {b.plate}
                        </span>
                      </span>
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

                    {b.customer && (
                      <div className="flex items-center gap-2 mb-4 text-[9px] font-bold uppercase tracking-widest text-slate-600 bg-[#F8FAFC] p-2 rounded-sm border border-slate-200">
                        <User className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{b.customer.name}</span>
                        <span className="text-slate-300 mx-1 shrink-0">•</span>
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{b.customer.phone}</span>
                      </div>
                    )}

                    <div
                      className={cn(
                        "space-y-2 text-[9px] uppercase tracking-widest p-2.5 rounded-sm border transition-colors",
                        isSelected
                          ? "bg-white border-blue-200"
                          : "bg-[#F8FAFC] border-slate-200",
                      )}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
                        <span className="font-bold text-slate-400">Start</span>
                        <span className="font-bold text-slate-800">
                          {format(b.start, "MMM dd, h:mm a")}
                        </span>
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0 mt-1 sm:mt-0">
                        <span className="font-bold text-slate-400">End</span>
                        <span className="font-bold text-slate-800">
                          {format(b.end, "MMM dd, h:mm a")}
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
  );
}
