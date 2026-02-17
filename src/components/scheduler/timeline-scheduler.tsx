"use client";

import React, { useState, useMemo } from "react";
import {
  format,
  addDays,
  addWeeks,
  addMonths,
  startOfDay,
  startOfWeek,
  startOfMonth,
  endOfWeek,
  endOfMonth,
  differenceInMinutes,
  setHours,
  isSameDay,
  isWithinInterval,
  eachDayOfInterval,
  addHours,
} from "date-fns";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  CalendarRange,
  CalendarDays,
  Search,
  Filter,
  User,
  CreditCard,
  Car,
  MapPin,
  Phone,
  Mail,
  Edit,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Shadcn UI Imports
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// --- TYPES ---
export type ViewType = "day" | "week" | "month";

export type SchedulerResource = {
  id: string;
  title: string;
  subtitle: string;
  image?: string;
  tags?: string[];
};

export type SchedulerEvent = {
  id: string;
  resourceId: string;
  start: Date;
  end: Date;
  title: string;
  subtitle?: string;
  color?: string;
  status?: "confirmed" | "pending" | "maintenance";
  // Extra Details
  paymentStatus?: "Paid" | "Pending" | "Partial" | "Unpaid";
  amount?: number;
  customerPhone?: string;
  customerEmail?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
};

type TimelineSchedulerProps = {
  resources: SchedulerResource[];
  events: SchedulerEvent[];
  onEmptyClick?: (resourceId: string, date: Date) => void;
  onEditClick?: (event: SchedulerEvent) => void;
};

// --- CONFIG ---
const CELL_WIDTH_HOUR = 80;
const CELL_WIDTH_MONTH = 60;
const SIDEBAR_WIDTH = 240;

export default function TimelineScheduler({
  resources,
  events,
  onEmptyClick,
  onEditClick,
}: TimelineSchedulerProps) {
  const [view, setView] = useState<ViewType>("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- STATE FOR POPOVER ---
  // We track WHICH event ID is open to control the popover
  const [openEventId, setOpenEventId] = useState<string | null>(null);

  // --- FILTERS ---
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "booked" | "available">(
    "all",
  );

  // --- NAVIGATION ---
  const handleNavigate = (direction: "prev" | "next") => {
    const modifier = direction === "next" ? 1 : -1;
    if (view === "day") setCurrentDate(addDays(currentDate, modifier));
    if (view === "week") setCurrentDate(addWeeks(currentDate, modifier));
    if (view === "month") setCurrentDate(addMonths(currentDate, modifier));
  };

  // --- HEADER LOGIC ---
  const {
    timelineStart,
    timelineEnd,
    mainHeaders,
    subHeaders,
    totalWidth,
    pxPerMinute,
  } = useMemo(() => {
    let start: Date, end: Date;
    let mainHeaders: { label: string; width: number; date: Date }[] = [];
    let subHeaders: { label: string; width: number }[] = [];
    let pxPerMin = 0;

    if (view === "month") {
      start = startOfMonth(currentDate);
      end = endOfMonth(currentDate);
      pxPerMin = CELL_WIDTH_MONTH / 1440;

      mainHeaders = eachDayOfInterval({ start, end }).map((d) => ({
        label: format(d, "d"),
        width: CELL_WIDTH_MONTH,
        date: d,
      }));
      subHeaders = mainHeaders.map((h) => ({
        label: format(h.date, "EEEEE"),
        width: CELL_WIDTH_MONTH,
      }));
    } else {
      if (view === "day") {
        start = startOfDay(currentDate);
        end = addHours(start, 24);
      } else {
        start = startOfWeek(currentDate, { weekStartsOn: 1 });
        end = addWeeks(start, 1);
      }
      pxPerMin = CELL_WIDTH_HOUR / 60;

      const days = eachDayOfInterval({ start, end: addHours(end, -1) });
      mainHeaders = days.map((d) => ({
        label: format(d, "EEE d"),
        width: CELL_WIDTH_HOUR * 24,
        date: d,
      }));

      days.forEach(() => {
        for (let i = 0; i < 24; i++) {
          const hourDate = setHours(new Date(), i);
          subHeaders.push({
            label: format(hourDate, "h a"),
            width: CELL_WIDTH_HOUR,
          });
        }
      });
    }

    const totalWidth = subHeaders.reduce((acc, h) => acc + h.width, 0);
    return {
      timelineStart: start,
      timelineEnd: end,
      mainHeaders,
      subHeaders,
      totalWidth,
      pxPerMinute: pxPerMin,
    };
  }, [view, currentDate]);

  // --- FILTER RESOURCES ---
  const filteredResources = useMemo(() => {
    return resources.filter((res) => {
      const matchesSearch =
        res.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.subtitle.toLowerCase().includes(searchQuery.toLowerCase());
      if (!matchesSearch) return false;

      if (filterMode === "all") return true;
      const hasBooking = events.some(
        (evt) =>
          evt.resourceId === res.id &&
          evt.end > timelineStart &&
          evt.start < timelineEnd,
      );
      if (filterMode === "booked") return hasBooking;
      if (filterMode === "available") return !hasBooking;
      return true;
    });
  }, [resources, events, searchQuery, filterMode, timelineStart, timelineEnd]);

  // --- RENDER HELPERS ---
  const getEventStyle = (event: SchedulerEvent) => {
    const diffStart = Math.max(
      0,
      differenceInMinutes(event.start, timelineStart),
    );
    const effectiveEnd = event.end > timelineEnd ? timelineEnd : event.end;
    const diffDuration = Math.max(
      15,
      differenceInMinutes(
        effectiveEnd,
        event.start < timelineStart ? timelineStart : event.start,
      ),
    );

    return {
      left: `${diffStart * pxPerMinute}px`,
      width: `${diffDuration * pxPerMinute}px`,
    };
  };

  const dateLabel = useMemo(() => {
    if (view === "day") return format(currentDate, "MMMM d, yyyy");
    if (view === "week")
      return `${format(timelineStart, "MMM d")} - ${format(addDays(timelineEnd, -1), "MMM d, yyyy")}`;
    return format(currentDate, "MMMM yyyy");
  }, [view, currentDate, timelineStart, timelineEnd]);

  return (
    <div className="flex flex-col h-full bg-white border rounded-xl shadow-sm overflow-hidden">
      {/* 1. TOP TOOLBAR */}
      <div className="flex flex-col gap-4 p-4 border-b bg-white shrink-0 z-30">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 bg-slate-50 p-1 rounded-lg border">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleNavigate("prev")}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-7 text-sm font-semibold w-48 justify-center"
                >
                  <CalendarIcon className="mr-2 h-3 w-3 opacity-50" />
                  {dateLabel}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="center">
                <Calendar
                  mode="single"
                  selected={currentDate}
                  onSelect={(d) => d && setCurrentDate(d)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => handleNavigate("next")}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          <Tabs
            value={view}
            onValueChange={(v) => setView(v as ViewType)}
            className="w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 h-8">
              <TabsTrigger value="day" className="text-xs px-2">
                <Clock className="w-3 h-3 mr-1" /> Day
              </TabsTrigger>
              <TabsTrigger value="week" className="text-xs px-2">
                <CalendarRange className="w-3 h-3 mr-1" /> Week
              </TabsTrigger>
              <TabsTrigger value="month" className="text-xs px-2">
                <CalendarDays className="w-3 h-3 mr-1" /> Month
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search vehicle..."
              className="pl-9 h-9 text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={filterMode}
            onValueChange={(v: any) => setFilterMode(v)}
          >
            <SelectTrigger className="w-[150px] h-9 text-xs">
              <Filter className="w-3 h-3 mr-2" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Show All</SelectItem>
              <SelectItem value="booked">Booked</SelectItem>
              <SelectItem value="available">Available</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* 2. SCROLLABLE GRID AREA */}
      <div className="flex-1 overflow-auto relative bg-slate-50/50">
        <div className="relative min-w-max">
          {/* A. STICKY HEADER ROW */}
          <div className="sticky top-0 z-20 bg-white border-b shadow-sm flex h-14">
            <div
              className="sticky left-0 top-0 z-30 bg-slate-100 border-r border-b h-14 flex items-center px-4 font-bold text-xs text-slate-500 uppercase tracking-wider shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]"
              style={{ width: `${SIDEBAR_WIDTH}px` }}
            >
              Resources ({filteredResources.length})
            </div>

            <div className="flex flex-col">
              <div className="flex h-7 bg-slate-50 border-b">
                {mainHeaders.map((h, i) => (
                  <div
                    key={i}
                    className="shrink-0 border-r flex items-center justify-center font-bold text-xs text-slate-600 uppercase tracking-wide bg-slate-50"
                    style={{ width: `${h.width}px` }}
                  >
                    {h.label}
                  </div>
                ))}
              </div>
              <div className="flex h-7 bg-white">
                {subHeaders.map((h, i) => (
                  <div
                    key={i}
                    className="shrink-0 border-r flex items-center justify-center text-[10px] text-slate-400 font-mono"
                    style={{ width: `${h.width}px` }}
                  >
                    {h.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* B. RESOURCE ROWS */}
          <div>
            {filteredResources.map((res) => (
              <div
                key={res.id}
                className="flex group hover:bg-slate-100/50 transition-colors h-[72px] border-b bg-white"
              >
                {/* Sidebar Cell */}
                <div
                  className="sticky left-0 z-20 bg-white group-hover:bg-slate-50 border-r flex items-center px-4 gap-3 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]"
                  style={{ width: `${SIDEBAR_WIDTH}px` }}
                >
                  <Avatar className="h-9 w-9 border border-slate-200">
                    <AvatarImage src={res.image} />
                    <AvatarFallback className="bg-slate-100">
                      {res.title[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col overflow-hidden">
                    <span className="text-sm font-semibold truncate text-slate-700">
                      {res.title}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {res.subtitle}
                    </span>
                    <div className="flex gap-1 mt-0.5">
                      {res.tags?.slice(0, 2).map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="px-1 py-0 text-[8px] h-3.5 border-slate-200 bg-slate-50"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Timeline Cells */}
                <div
                  className="relative flex-1"
                  style={{ width: `${totalWidth}px` }}
                >
                  {/* Grid Lines */}
                  <div className="absolute inset-0 flex pointer-events-none">
                    {subHeaders.map((h, i) => (
                      <div
                        key={i}
                        className={cn(
                          "border-r h-full",
                          view !== "month" && i % 24 === 0
                            ? "border-slate-300"
                            : "border-slate-100",
                        )}
                        style={{ width: `${h.width}px` }}
                      />
                    ))}
                  </div>

                  {/* Event Bars with Popover */}
                  {events
                    .filter((evt) => evt.resourceId === res.id)
                    .map((evt) => {
                      const style = getEventStyle(evt);
                      if (evt.end < timelineStart || evt.start > timelineEnd)
                        return null;

                      return (
                        <Popover
                          key={evt.id}
                          open={openEventId === evt.id}
                          onOpenChange={(isOpen) =>
                            setOpenEventId(isOpen ? evt.id : null)
                          }
                        >
                          <PopoverTrigger asChild>
                            <div
                              className={cn(
                                "absolute top-3 bottom-3 rounded-md border px-2 text-xs shadow-sm cursor-pointer hover:brightness-105 hover:shadow-md transition-all z-10 overflow-hidden flex flex-col justify-center",
                                evt.status === "confirmed"
                                  ? "bg-emerald-100 border-emerald-200 text-emerald-800"
                                  : evt.status === "pending"
                                    ? "bg-amber-100 border-amber-200 text-amber-800"
                                    : "bg-blue-100 border-blue-200 text-blue-800",
                              )}
                              style={style}
                              onClick={(e) => e.stopPropagation()} // Let Popover handle it
                            >
                              <div className="font-bold truncate leading-tight">
                                {evt.title}
                              </div>
                              {evt.subtitle && (
                                <div className="text-[10px] opacity-80 truncate">
                                  {evt.subtitle}
                                </div>
                              )}
                            </div>
                          </PopoverTrigger>

                          <PopoverContent
                            className="w-80 p-0 shadow-xl"
                            align="start"
                          >
                            {/* Header */}
                            <div className="p-4 border-b bg-slate-50/50">
                              <div className="flex items-center justify-between mb-2">
                                <Badge
                                  variant={
                                    evt.status === "confirmed"
                                      ? "default"
                                      : "secondary"
                                  }
                                  className={cn(
                                    "uppercase text-[10px]",
                                    evt.status === "confirmed" &&
                                      "bg-emerald-600 hover:bg-emerald-700",
                                  )}
                                >
                                  {evt.status || "BOOKING"}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() =>
                                    onEditClick && onEditClick(evt)
                                  }
                                >
                                  <Edit className="h-3 w-3 text-slate-500" />
                                </Button>
                              </div>
                              <div className="font-bold text-lg leading-tight">
                                {evt.title}
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Booking ID:{" "}
                                <span className="font-mono">{evt.id}</span>
                              </div>
                            </div>

                            {/* Accordion Content */}
                            <Accordion
                              type="single"
                              collapsible
                              className="w-full"
                              defaultValue="schedule"
                            >
                              {/* 1. Schedule */}
                              <AccordionItem value="schedule">
                                <AccordionTrigger className="px-4 py-2 text-xs font-semibold hover:no-underline bg-slate-50/30">
                                  <div className="flex items-center gap-2">
                                    <CalendarIcon className="w-3 h-3" /> Trip
                                    Schedule
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 py-3 space-y-3">
                                  <div className="grid grid-cols-[20px_1fr] items-start gap-1">
                                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                    <div>
                                      <div className="text-xs font-semibold">
                                        Pick-up
                                      </div>
                                      <div className="text-[10px] text-muted-foreground">
                                        {format(
                                          evt.start,
                                          "MMM d, yyyy • h:mm a",
                                        )}
                                      </div>
                                      {evt.pickupLocation && (
                                        <div className="text-[10px] text-slate-600 mt-0.5 flex gap-1">
                                          <MapPin className="w-3 h-3 inline" />{" "}
                                          {evt.pickupLocation}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-[20px_1fr] items-start gap-1">
                                    <div className="mt-0.5 w-1.5 h-1.5 rounded-full bg-slate-300" />
                                    <div>
                                      <div className="text-xs font-semibold">
                                        Return
                                      </div>
                                      <div className="text-[10px] text-muted-foreground">
                                        {format(
                                          evt.end,
                                          "MMM d, yyyy • h:mm a",
                                        )}
                                      </div>
                                      {evt.dropoffLocation && (
                                        <div className="text-[10px] text-slate-600 mt-0.5 flex gap-1">
                                          <MapPin className="w-3 h-3 inline" />{" "}
                                          {evt.dropoffLocation}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>

                              {/* 2. Customer Contact */}
                              <AccordionItem value="contact">
                                <AccordionTrigger className="px-4 py-2 text-xs font-semibold hover:no-underline bg-slate-50/30">
                                  <div className="flex items-center gap-2">
                                    <User className="w-3 h-3" /> Customer Info
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 py-3 space-y-2">
                                  <div className="flex items-center gap-2 text-xs">
                                    <Phone className="w-3 h-3 text-slate-400" />
                                    <span>
                                      {evt.customerPhone || "No phone provided"}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs">
                                    <Mail className="w-3 h-3 text-slate-400" />
                                    <span className="truncate">
                                      {evt.customerEmail || "No email provided"}
                                    </span>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>

                              {/* 3. Payment */}
                              <AccordionItem
                                value="payment"
                                className="border-b-0"
                              >
                                <AccordionTrigger className="px-4 py-2 text-xs font-semibold hover:no-underline bg-slate-50/30">
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="w-3 h-3" /> Payment
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent className="px-4 py-3">
                                  <div className="flex justify-between items-center mb-2">
                                    <span className="text-xs text-muted-foreground">
                                      Total
                                    </span>
                                    <span className="font-bold text-sm">
                                      ₱ {evt.amount?.toLocaleString() || "0.00"}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs text-muted-foreground">
                                      Status
                                    </span>
                                    <Badge
                                      variant="outline"
                                      className={cn(
                                        "text-[10px] h-5",
                                        evt.paymentStatus === "Paid"
                                          ? "border-emerald-200 text-emerald-700 bg-emerald-50"
                                          : "border-amber-200 text-amber-700 bg-amber-50",
                                      )}
                                    >
                                      {evt.paymentStatus || "Pending"}
                                    </Badge>
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          </PopoverContent>
                        </Popover>
                      );
                    })}

                  {isWithinInterval(new Date(), {
                    start: timelineStart,
                    end: timelineEnd,
                  }) && (
                    <div
                      className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-0 pointer-events-none"
                      style={{
                        left: `${Math.max(0, differenceInMinutes(new Date(), timelineStart)) * pxPerMinute}px`,
                      }}
                    >
                      <div className="w-2 h-2 bg-red-500 rounded-full -ml-[3px] -mt-1" />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
