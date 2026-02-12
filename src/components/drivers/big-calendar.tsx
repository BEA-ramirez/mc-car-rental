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
import { Car, Clock, MapPin, CalendarDays } from "lucide-react";
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
    <div className="p-3 border rounded-xl shadow-sm bg-card w-fit h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 px-1 shrink-0">
        <CalendarDays className="w-4 h-4 text-primary" />
        <h3 className="font-semibold text-sm">Driver Schedule</h3>
      </div>

      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        className="p-0"
        classNames={{
          month: "space-y-1",
          caption: "flex justify-center pt-1 relative items-center mb-1",
          caption_label: "text-sm font-bold",
          nav_button: "h-6 w-6 p-0 hover:opacity-100",
          head_cell:
            "text-muted-foreground rounded-md w-9 font-normal text-[0.75rem]",
          // NOTE: We manually apply cell sizing in the custom component below
          cell: "p-0 relative focus-within:relative focus-within:z-20 text-center",
          day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 text-xs",
        }}
        components={{
          Day: (props: any) => {
            const currentDay = props.day.date || props.date;

            // FIX: Ensure empty days are wrapped in <td> to prevent hydration errors
            if (!currentDay) return <td className="h-9 w-9 p-0" />;

            const dayBookings = getBookingsForDay(currentDay);
            const isBooked = dayBookings.length > 0;
            const isTurnover = dayBookings.length > 1;

            let shapeClass = "rounded-none";
            let colorClass = "bg-primary text-primary-foreground";

            if (isTurnover) {
              colorClass = "bg-slate-500 text-white";
            } else if (isBooked) {
              const b = dayBookings[0];
              const isStart = isSameDay(currentDay, b.start);
              const isEnd = isSameDay(currentDay, b.end);
              const isSingleDay = isStart && isEnd;

              if (isSingleDay) shapeClass = "rounded-full";
              else if (isStart) shapeClass = "rounded-l-full";
              else if (isEnd) shapeClass = "rounded-r-full";
            }

            const { day, modifiers, ...buttonProps } = props;

            return (
              // FIX: Wrapped everything in a <td> tag
              <td className="h-9 w-9 p-0 relative focus-within:relative focus-within:z-20 text-center">
                <Popover>
                  <PopoverTrigger asChild>
                    <button
                      {...buttonProps}
                      className={cn(
                        "h-9 w-9 flex items-center justify-center text-xs transition-all relative z-10",
                        !isBooked &&
                          "hover:bg-muted rounded-full text-foreground",
                        isBooked && colorClass,
                        isBooked && shapeClass,
                        props.selected && !isBooked && "ring-2 ring-primary",
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        // If you need the calendar to select the date too:
                        if (buttonProps.onClick) buttonProps.onClick(e);
                      }}
                    >
                      {format(currentDay, "d")}
                    </button>
                  </PopoverTrigger>

                  {isBooked ? (
                    <PopoverContent
                      className="w-80 p-0 shadow-xl"
                      align="center"
                    >
                      <div className="bg-muted/40 p-3 border-b flex items-center justify-between">
                        <span className="font-bold text-sm">
                          {format(currentDay, "MMMM d")}
                        </span>
                        {isTurnover && (
                          <Badge
                            variant="destructive"
                            className="text-[10px] h-5 px-1.5"
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
                              className="border-b last:border-0"
                            >
                              <AccordionTrigger className="px-4 py-3 hover:bg-muted/50 hover:no-underline">
                                <div className="flex flex-col items-start gap-1 text-left">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm">
                                      {booking.car}
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className="text-[10px] h-5 font-normal px-1.5"
                                    >
                                      {duration} Trip
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground font-normal">
                                    <span>{booking.plate}</span>
                                    <span>•</span>
                                    <span
                                      className={cn(
                                        "font-medium",
                                        booking.status === "Confirmed"
                                          ? "text-green-600"
                                          : "text-amber-600",
                                      )}
                                    >
                                      {booking.status}
                                    </span>
                                  </div>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="px-4 pb-4 pt-0 bg-muted/10">
                                <div className="space-y-3 pt-2">
                                  <div className="flex items-start gap-3">
                                    <Clock className="w-4 h-4 text-primary mt-0.5" />
                                    <div className="text-xs space-y-1">
                                      <div className="flex justify-between w-full gap-4">
                                        <span className="text-muted-foreground">
                                          Start:
                                        </span>
                                        <span className="font-medium">
                                          {format(
                                            booking.start,
                                            "MMM d, h:mm a",
                                          )}
                                        </span>
                                      </div>
                                      <div className="flex justify-between w-full gap-4">
                                        <span className="text-muted-foreground">
                                          End:
                                        </span>
                                        <span className="font-medium">
                                          {format(booking.end, "MMM d, h:mm a")}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-start gap-3">
                                    <MapPin className="w-4 h-4 text-primary mt-0.5" />
                                    <div className="text-xs">
                                      <p className="font-medium">Destination</p>
                                      <p className="text-muted-foreground">
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
                    <PopoverContent className="w-auto p-2 text-xs text-muted-foreground">
                      <p>No schedule for {format(currentDay, "MMM d")}</p>
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
