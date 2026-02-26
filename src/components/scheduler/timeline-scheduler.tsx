"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
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
  addMinutes,
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
  CheckCircle,
  AlertCircle,
  Copy,
  Trash,
  CheckSquare,
  Wrench,
  ShieldAlert,
  Key,
  Flag,
  UserX,
  UserCircle,
  ClockAlert,
  MoveRight,
  Check,
  Undo2,
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
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuLabel,
} from "@/components/ui/context-menu";

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
  start: Date | string;
  end: Date | string;
  title: string;
  subtitle?: string;
  color?: string;
  group_id?: string;
  status?:
    | "confirmed"
    | "pending"
    | "maintenance"
    | "displaced"
    | "ongoing"
    | "completed"
    | "no_show"
    | "cancelled";
  bufferDuration?: number;
  paymentStatus?: "Paid" | "Pending" | "Partial" | "Unpaid";
  amount?: number;
  customerPhone?: string;
  customerEmail?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  withDriver?: boolean;
  driverName?: string;
  driverPhone?: string;
};

type TimelineSchedulerProps = {
  resources: SchedulerResource[];
  events: SchedulerEvent[];
  ghostBooking?: SchedulerEvent | null;
  onDateChange?: (date: Date) => void;
  onEmptyClick?: (resourceId: string, date: Date) => void;
  onTimeRangeSelect?: (resourceId: string, start: Date, end: Date) => void;
  onEditClick?: (event: SchedulerEvent) => void;
  onGhostMove?: (resourceId: string) => void;
  onStatusChange?: (event: SchedulerEvent, newStatus: string) => void;
  onDeleteClick?: (event: SchedulerEvent) => void;
  onResizeEvent?: (event: SchedulerEvent, newEnd: Date) => void;
  onResizeBuffer?: (event: SchedulerEvent, newBufferDuration: number) => void;
  onEarlyReturnClick?: (event: SchedulerEvent) => void;
  onAddMaintenance?: (resourceId: string, startDate: Date) => void;
  onSplitEvent?: (event: SchedulerEvent, splitDate: Date) => void;
  onExtendClick?: (event: SchedulerEvent) => void;
  isOverrideMode?: boolean;
};

// --- CONFIG ---
const CELL_WIDTH_HOUR = 80;
const CELL_WIDTH_MONTH = 60;
const SIDEBAR_WIDTH = 260;

interface MainHeader {
  label: string;
  width: number;
  date: Date;
}
interface SubHeader {
  label: string;
  width: number;
}

export default function TimelineScheduler({
  resources,
  events: rawEvents,
  ghostBooking,
  onDateChange,
  onEmptyClick,
  onTimeRangeSelect,
  onEditClick,
  onGhostMove,
  onStatusChange,
  onDeleteClick,
  onResizeEvent,
  onResizeBuffer,
  onEarlyReturnClick,
  onAddMaintenance,
  onSplitEvent,
  onExtendClick,
  isOverrideMode = false,
}: TimelineSchedulerProps) {
  const [view, setView] = useState<ViewType>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clickOffsets, setClickOffsets] = useState<Record<string, number>>({});

  const events = useMemo(() => {
    return rawEvents.map((evt) => ({
      ...evt,
      start: new Date(evt.start),
      end: new Date(evt.end),
    }));
  }, [rawEvents]);

  const parsedGhostBooking = useMemo(() => {
    if (!ghostBooking) return null;
    return {
      ...ghostBooking,
      start: new Date(ghostBooking.start),
      end: new Date(ghostBooking.end),
    };
  }, [ghostBooking]);

  const [isMounted, setIsMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (parsedGhostBooking && parsedGhostBooking.start) {
      const targetDate = parsedGhostBooking.start as Date;
      const viewStart = startOfMonth(currentDate);
      const viewEnd = endOfMonth(currentDate);
      if (targetDate < viewStart || targetDate > viewEnd) {
        setCurrentDate(targetDate);
        if (onDateChange) onDateChange(targetDate);
      }
    }
  }, [parsedGhostBooking?.id]);

  const [openEventId, setOpenEventId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterMode, setFilterMode] = useState<"all" | "booked" | "available">(
    "all",
  );

  const [resizingEventId, setResizingEventId] = useState<string | null>(null);
  const [resizeMode, setResizeMode] = useState<"event" | "buffer">("event");
  const [resizePreviewEnd, setResizePreviewEnd] = useState<Date | null>(null);
  const [resizePreviewBuffer, setResizePreviewBuffer] = useState<number | null>(
    null,
  );

  const dragStartX = useRef<number>(0);
  const originalEndRef = useRef<Date | null>(null);
  const originalBufferRef = useRef<number>(0);
  const clickedTimeRef = useRef<Date | null>(null);

  const [creationState, setCreationState] = useState<{
    isDragging: boolean;
    resourceId: string;
    startX: number;
    currentX: number;
    startClientX: number;
  } | null>(null);
  const wasDragged = useRef(false);

  const handleNavigate = (direction: "prev" | "next") => {
    const modifier = direction === "next" ? 1 : -1;
    let newDate = currentDate;
    if (view === "day") newDate = addDays(currentDate, modifier);
    if (view === "week") newDate = addWeeks(currentDate, modifier);
    if (view === "month") newDate = addMonths(currentDate, modifier);

    setCurrentDate(newDate);
    if (onDateChange) onDateChange(newDate);
  };

  const handleDateSelect = (d: Date | undefined) => {
    if (d) {
      setCurrentDate(d);
      if (onDateChange) onDateChange(d);
    }
  };

  const {
    timelineStart,
    timelineEnd,
    mainHeaders,
    subHeaders,
    totalWidth,
    pxPerMinute,
    nowOffset,
  } = useMemo(() => {
    let start: Date = new Date();
    let end: Date = new Date();
    let mainHeaders: MainHeader[] = [];
    let subHeaders: SubHeader[] = [];
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
    const calculatedNowOffset = differenceInMinutes(now, start) * pxPerMin;

    return {
      timelineStart: start,
      timelineEnd: end,
      mainHeaders,
      subHeaders,
      totalWidth,
      pxPerMinute: pxPerMin,
      nowOffset: calculatedNowOffset,
    };
  }, [view, currentDate, now]);

  const handleResizeStart = (
    e: React.MouseEvent,
    event: SchedulerEvent,
    mode: "event" | "buffer",
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setResizingEventId(event.id);
    setResizeMode(mode);
    setResizePreviewEnd(event.end as Date);
    setResizePreviewBuffer(event.bufferDuration || 0);
    dragStartX.current = e.clientX;
    originalEndRef.current = event.end as Date;
    originalBufferRef.current = event.bufferDuration || 0;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  useEffect(() => {
    if (!resizingEventId) return;
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - dragStartX.current;
      if (resizeMode === "event") {
        if (!originalEndRef.current) return;
        const pxPerDay = pxPerMinute * 1440;
        const daysDragged = Math.round(deltaX / pxPerDay);
        setResizePreviewEnd(addDays(originalEndRef.current, daysDragged));
      } else {
        const minutesDragged = deltaX / pxPerMinute;
        const snappedMinutes = Math.round(minutesDragged / 60) * 60;
        setResizePreviewBuffer(
          Math.max(0, originalBufferRef.current + snappedMinutes),
        );
      }
    };
    const handleMouseUp = () => {
      const evt = events.find((e) => e.id === resizingEventId);
      if (evt) {
        if (resizeMode === "event" && resizePreviewEnd && onResizeEvent) {
          if (resizePreviewEnd.getTime() !== (evt.end as Date).getTime())
            onResizeEvent(evt, resizePreviewEnd);
        } else if (
          resizeMode === "buffer" &&
          resizePreviewBuffer !== null &&
          onResizeBuffer
        ) {
          if (resizePreviewBuffer !== evt.bufferDuration)
            onResizeBuffer(evt, resizePreviewBuffer);
        }
      }
      setResizingEventId(null);
      setResizePreviewEnd(null);
      setResizePreviewBuffer(null);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    resizingEventId,
    resizeMode,
    resizePreviewEnd,
    resizePreviewBuffer,
    events,
    pxPerMinute,
    onResizeEvent,
    onResizeBuffer,
  ]);

  useEffect(() => {
    if (!creationState?.isDragging) return;
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - creationState.startClientX;
      if (Math.abs(deltaX) > 10) wasDragged.current = true;
      setCreationState((prev) =>
        prev ? { ...prev, currentX: prev.startX + deltaX } : null,
      );
    };

    const handleMouseUp = () => {
      if (creationState && wasDragged.current) {
        const { startX, currentX, resourceId } = creationState;
        const minX = Math.min(startX, currentX);
        const maxX = Math.max(startX, currentX);
        const snapMins = 30;
        const startMins = Math.round(minX / pxPerMinute / snapMins) * snapMins;
        const endMins = Math.round(maxX / pxPerMinute / snapMins) * snapMins;
        const startDate = addMinutes(timelineStart, startMins);
        const endDate = addMinutes(timelineStart, endMins);
        if (onTimeRangeSelect && startMins !== endMins)
          onTimeRangeSelect(resourceId, startDate, endDate);
      }
      setCreationState(null);
      setTimeout(() => {
        wasDragged.current = false;
      }, 50);
    };
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [creationState, pxPerMinute, timelineStart, onTimeRangeSelect]);

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
          (evt.end as Date) > timelineStart &&
          (evt.start as Date) < timelineEnd &&
          evt.status !== "no_show" &&
          evt.status !== "cancelled",
      );
      if (filterMode === "booked") return hasBooking;
      if (filterMode === "available") return !hasBooking;
      return true;
    });
  }, [resources, events, searchQuery, filterMode, timelineStart, timelineEnd]);

  const getEventStyle = (event: SchedulerEvent, overrideEnd?: Date) => {
    const start = event.start as Date;
    const end = overrideEnd || (event.end as Date);
    const safeEnd = end <= start ? addDays(start, 1) : end;
    const diffStart = Math.max(0, differenceInMinutes(start, timelineStart));
    const effectiveEnd = safeEnd > timelineEnd ? timelineEnd : safeEnd;
    const diffDuration = Math.max(
      15,
      differenceInMinutes(
        effectiveEnd,
        start < timelineStart ? timelineStart : start,
      ),
    );
    return {
      left: `${diffStart * pxPerMinute}px`,
      width: `${diffDuration * pxPerMinute}px`,
    };
  };

  const getBufferStyle = (
    event: SchedulerEvent,
    overrideEnd?: Date,
    overrideDuration?: number,
  ) => {
    const bufferMins = overrideDuration ?? event.bufferDuration ?? 0;
    if (bufferMins <= 0) return null;
    const bufferStart = overrideEnd || (event.end as Date);
    const bufferEnd = addMinutes(bufferStart, bufferMins);
    if (bufferEnd < timelineStart || bufferStart > timelineEnd) return null;
    const effectiveStart =
      bufferStart < timelineStart ? timelineStart : bufferStart;
    const effectiveEnd = bufferEnd > timelineEnd ? timelineEnd : bufferEnd;
    const diffStart = differenceInMinutes(effectiveStart, timelineStart);
    const duration = differenceInMinutes(effectiveEnd, effectiveStart);
    if (duration <= 0) return null;
    return {
      left: `${diffStart * pxPerMinute}px`,
      width: `${duration * pxPerMinute}px`,
    };
  };

  const dateLabel = useMemo(() => {
    if (view === "day") return format(currentDate, "MMMM d, yyyy");
    if (view === "week")
      return `${format(timelineStart, "MMM d")} - ${format(addDays(timelineEnd, -1), "MMM d, yyyy")}`;
    return format(currentDate, "MMMM yyyy");
  }, [view, currentDate, timelineStart, timelineEnd]);

  const isMonthView = view === "month";

  return (
    <div className="flex flex-col h-full bg-white shadow-sm overflow-hidden border-t">
      <div className="flex flex-wrap md:flex-nowrap items-center gap-4 px-4 py-2 border-b bg-white shrink-0 z-10 w-full">
        <div className="flex items-center bg-slate-50 rounded-lg border shadow-sm h-8 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-7 rounded-md"
            onClick={() => handleNavigate("prev")}
          >
            <ChevronLeft className="h-4 w-4 text-slate-600" />
          </Button>
          <Separator orientation="vertical" className="h-4" />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-full text-xs font-semibold px-3 min-w-[140px] flex justify-center text-slate-700"
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 opacity-50" />{" "}
                {dateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-slate-200 shadow-xl rounded-xl"
              align="center"
            >
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          <Separator orientation="vertical" className="h-4" />
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-7 rounded-md"
            onClick={() => handleNavigate("next")}
          >
            <ChevronRight className="h-4 w-4 text-slate-600" />
          </Button>
        </div>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as ViewType)}
          className="h-8"
        >
          <TabsList className="grid w-[240px] grid-cols-3 h-full p-0.5 bg-slate-100 border">
            <TabsTrigger
              value="day"
              className="text-[11px] font-semibold h-full data-[state=active]:shadow-sm"
            >
              Day
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="text-[11px] font-semibold h-full data-[state=active]:shadow-sm"
            >
              Week
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="text-[11px] font-semibold h-full data-[state=active]:shadow-sm"
            >
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1 hidden lg:block" />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search vehicles..."
              className="pl-8 h-8 text-xs bg-slate-50 border-slate-200 focus-visible:bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={filterMode}
            onValueChange={(v: any) => setFilterMode(v)}
          >
            <SelectTrigger className="w-[160px] h-8 text-xs bg-slate-50 border-slate-200 font-medium">
              <Filter className="w-3 h-3 text-slate-400" />
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                Show All Fleet
              </SelectItem>
              <SelectItem value="booked" className="text-xs">
                Currently Booked
              </SelectItem>
              <SelectItem value="available" className="text-xs">
                Available Now
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="h-8 bg-slate-50 border-b flex items-center px-6 gap-6 shrink-0 overflow-x-auto text-[10px] font-bold text-slate-500 uppercase tracking-wider custom-scrollbar select-none">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-100 border border-emerald-300" />{" "}
          Confirmed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600" />{" "}
          Ongoing
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-100 border border-amber-300" />{" "}
          Pending
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-slate-200 border border-slate-300" />{" "}
          Completed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-100 border border-orange-400" />{" "}
          Late Arrival
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-100 border border-red-500" />{" "}
          Overdue Return
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 border border-red-600" />{" "}
          Conflict
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[3px] bg-[linear-gradient(45deg,rgba(0,0,0,0.06)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.06)_50%,rgba(0,0,0,0.06)_75%,transparent_75%,transparent)] bg-[length:6px_6px] border border-slate-300" />{" "}
          Maintenance
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-slate-50/30 custom-scrollbar relative">
        <div
          className="min-w-max flex flex-col"
          style={{ width: `${SIDEBAR_WIDTH + totalWidth}px` }}
        >
          <div className="sticky top-0 z-40 flex border-b shadow-sm bg-white">
            <div
              className="sticky left-0 z-50 bg-slate-100 border-r flex items-center px-4 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.05)]"
              style={{
                width: `${SIDEBAR_WIDTH}px`,
                minWidth: `${SIDEBAR_WIDTH}px`,
              }}
            >
              <div className="font-bold text-[11px] text-slate-500 uppercase tracking-wider">
                Fleet Resources{" "}
                <span className="ml-1 bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm">
                  {filteredResources.length}
                </span>
              </div>
            </div>
            <div className="flex flex-col bg-white">
              <div className="flex h-7 border-b bg-slate-50/80">
                {mainHeaders.map((h: MainHeader, i: number) => (
                  <div
                    key={i}
                    className="shrink-0 border-r flex items-center justify-center font-bold text-[11px] text-slate-700 uppercase tracking-wide"
                    style={{ width: `${h.width}px` }}
                  >
                    {h.label}
                  </div>
                ))}
              </div>
              <div className="flex h-5 bg-white">
                {subHeaders.map((h: SubHeader, i: number) => (
                  <div
                    key={i}
                    className="shrink-0 border-r flex items-center justify-center text-[10px] text-slate-400 font-mono font-medium"
                    style={{ width: `${h.width}px` }}
                  >
                    {h.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex flex-col">
            {nowOffset >= 0 && nowOffset <= totalWidth && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-red-500/80 z-20 pointer-events-none"
                style={{ left: `${SIDEBAR_WIDTH + nowOffset}px` }}
              >
                <div className="absolute top-0 -left-1.5 w-3.5 h-3.5 bg-red-500 rounded-full shadow-md flex items-center justify-center">
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                </div>
              </div>
            )}

            {filteredResources.map((res) => {
              const isGhostHere =
                parsedGhostBooking && parsedGhostBooking.resourceId === res.id;

              const hasConflict =
                isGhostHere &&
                events.some((e) => {
                  if (e.id === parsedGhostBooking.id) return false;
                  const isConflictStatus = [
                    "confirmed",
                    "ongoing",
                    "maintenance",
                    "pending",
                    "displaced",
                  ].includes(e.status || "");
                  if (e.resourceId !== res.id || !isConflictStatus)
                    return false;

                  const eEndWithBuffer = addMinutes(
                    e.end as Date,
                    e.bufferDuration || 0,
                  );
                  const ghostEndWithBuffer = addMinutes(
                    parsedGhostBooking.end as Date,
                    parsedGhostBooking.bufferDuration || 0,
                  );
                  return (
                    (parsedGhostBooking.start as Date) < eEndWithBuffer &&
                    ghostEndWithBuffer > (e.start as Date)
                  );
                });

              let ghostStyleClass =
                "bg-emerald-500/90 border-emerald-600 text-white shadow-xl shadow-emerald-500/20";
              let ghostLabel = "PROPOSAL (CLEAR)";
              let ghostIcon = (
                <CheckCircle
                  className={cn(isMonthView ? "w-2.5 h-2.5" : "w-3 h-3")}
                />
              );

              if (hasConflict) {
                if (isOverrideMode) {
                  ghostStyleClass =
                    "bg-amber-500/95 border-amber-600 text-white ring-4 ring-amber-500/30 shadow-xl shadow-amber-500/30";
                  ghostLabel = "FORCE OVERRIDE";
                  ghostIcon = (
                    <ShieldAlert
                      className={cn(isMonthView ? "w-2.5 h-2.5" : "w-3 h-3")}
                    />
                  );
                } else {
                  ghostStyleClass =
                    "bg-red-500 border-red-600 text-white shadow-xl shadow-red-500/30 animate-pulse opacity-90 z-50";
                  ghostLabel = "CONFLICT (MOVE ME)";
                  ghostIcon = (
                    <AlertCircle
                      className={cn(isMonthView ? "w-2.5 h-2.5" : "w-3 h-3")}
                    />
                  );
                }
              }

              const ghostStyle =
                isGhostHere && parsedGhostBooking
                  ? getEventStyle(parsedGhostBooking)
                  : undefined;

              return (
                <div
                  key={res.id}
                  className="flex border-b border-slate-100 bg-white h-[60px] group hover:bg-blue-50/30 transition-colors relative"
                >
                  <div
                    className="sticky left-0 z-30 bg-white group-hover:bg-blue-50/30 border-r flex items-center px-4 gap-3 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.05)] transition-colors"
                    style={{
                      width: `${SIDEBAR_WIDTH}px`,
                      minWidth: `${SIDEBAR_WIDTH}px`,
                    }}
                  >
                    <Avatar className="h-9 w-9 border border-slate-200 shadow-sm">
                      <AvatarImage src={res.image} className="object-cover" />
                      <AvatarFallback className="bg-slate-100 font-bold text-slate-400 text-xs">
                        {res.title[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-sm font-bold truncate text-slate-800 tracking-tight">
                        {res.title}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500 truncate">
                        {res.subtitle}
                      </span>
                    </div>
                  </div>

                  <div
                    className="relative flex-1"
                    style={{ width: `${totalWidth}px` }}
                  >
                    <ContextMenu>
                      <ContextMenuTrigger>
                        <div
                          className="absolute inset-0 z-0"
                          onContextMenu={(e) => {
                            const rect =
                              e.currentTarget.getBoundingClientRect();
                            clickedTimeRef.current = addMinutes(
                              timelineStart,
                              (e.clientX - rect.left) / pxPerMinute,
                            );
                          }}
                          onMouseDown={(e) => {
                            if (e.button !== 0 || e.altKey) return;
                            const offsetX =
                              e.clientX -
                              e.currentTarget.getBoundingClientRect().left;
                            setCreationState({
                              isDragging: true,
                              resourceId: res.id,
                              startX: offsetX,
                              currentX: offsetX,
                              startClientX: e.clientX,
                            });
                          }}
                          onClick={(e) => {
                            if (wasDragged.current) return;
                            if (parsedGhostBooking && onGhostMove) {
                              onGhostMove(res.id);
                            } else if (onEmptyClick) {
                              onEmptyClick(
                                res.id,
                                addMinutes(
                                  timelineStart,
                                  (e.clientX -
                                    e.currentTarget.getBoundingClientRect()
                                      .left) /
                                    pxPerMinute,
                                ),
                              );
                            }
                          }}
                        >
                          <div className="absolute inset-0 flex pointer-events-none">
                            {subHeaders.map((h: SubHeader, i: number) => (
                              <div
                                key={i}
                                className={cn(
                                  "border-r h-full",
                                  view !== "month" && i % 24 === 0
                                    ? "border-slate-300 bg-slate-50/30"
                                    : "border-slate-100",
                                )}
                                style={{ width: `${h.width}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-56 rounded-lg shadow-xl border-slate-200">
                        <ContextMenuItem
                          className="text-xs font-medium cursor-pointer"
                          onClick={() =>
                            onAddMaintenance &&
                            clickedTimeRef.current &&
                            onAddMaintenance(res.id, clickedTimeRef.current)
                          }
                        >
                          <Wrench className="w-3.5 h-3.5 mr-2 text-slate-400" />{" "}
                          Add Maintenance Block
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>

                    {creationState?.isDragging &&
                      creationState.resourceId === res.id && (
                        <div
                          className="absolute top-1.5 bottom-1.5 bg-blue-100/50 border-2 border-blue-500 border-dashed rounded-md z-40 flex items-center justify-center pointer-events-none overflow-hidden"
                          style={{
                            left: `${Math.min(creationState.startX, creationState.currentX)}px`,
                            width: `${Math.abs(creationState.currentX - creationState.startX)}px`,
                          }}
                        >
                          {Math.abs(
                            creationState.currentX - creationState.startX,
                          ) > 60 && (
                            <div className="bg-white px-2 py-1 rounded shadow-sm text-blue-700 font-bold text-[10px] whitespace-nowrap border border-blue-100">
                              {format(
                                addMinutes(
                                  timelineStart,
                                  Math.round(
                                    Math.min(
                                      creationState.startX,
                                      creationState.currentX,
                                    ) /
                                      pxPerMinute /
                                      30,
                                  ) * 30,
                                ),
                                "h:mm a",
                              )}{" "}
                              -{" "}
                              {format(
                                addMinutes(
                                  timelineStart,
                                  Math.round(
                                    Math.max(
                                      creationState.startX,
                                      creationState.currentX,
                                    ) /
                                      pxPerMinute /
                                      30,
                                  ) * 30,
                                ),
                                "h:mm a",
                              )}
                            </div>
                          )}
                        </div>
                      )}

                    {isGhostHere && ghostStyle && parsedGhostBooking && (
                      <div
                        className={cn(
                          "absolute top-1.5 bottom-1.5 rounded-md border-2 border-dashed text-xs z-50 flex flex-col justify-center pointer-events-none transition-all",
                          ghostStyleClass,
                          isMonthView ? "px-1" : "px-2.5",
                        )}
                        style={ghostStyle}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          {ghostIcon} {!isMonthView && ghostLabel}
                        </div>
                        {!isMonthView && (
                          <div className="text-[9px] font-medium opacity-90 truncate mt-0.5">
                            {parsedGhostBooking.title}
                          </div>
                        )}
                      </div>
                    )}

                    {events
                      .filter(
                        (evt) =>
                          evt.resourceId === res.id &&
                          evt.status !== "cancelled" &&
                          evt.status !== "no_show",
                      )
                      .map((evt) => {
                        const isResizing = resizingEventId === evt.id;
                        const displayEnd =
                          isResizing &&
                          resizeMode === "event" &&
                          resizePreviewEnd
                            ? resizePreviewEnd
                            : (evt.end as Date);
                        const displayBuffer =
                          isResizing &&
                          resizeMode === "buffer" &&
                          resizePreviewBuffer !== null
                            ? resizePreviewBuffer
                            : evt.bufferDuration;
                        const style = getEventStyle(evt, displayEnd);

                        if (
                          displayEnd.getTime() < timelineStart.getTime() ||
                          (evt.start as Date).getTime() > timelineEnd.getTime()
                        )
                          return null;

                        const isMaintenance = evt.status === "maintenance";
                        const isDisplaced = evt.status === "displaced";
                        const isOngoing = evt.status === "ongoing";
                        const isCompleted = evt.status === "completed";
                        const isLateArrival =
                          evt.status === "confirmed" &&
                          now > (evt.start as Date);
                        const isOverdueReturn =
                          evt.status === "ongoing" && now > (evt.end as Date);

                        let isOverlappingOther = false;
                        if (!isResizing && !isCompleted) {
                          isOverlappingOther = events.some(
                            (other) =>
                              other.id !== evt.id &&
                              other.resourceId === evt.resourceId &&
                              other.status !== "displaced" &&
                              other.status !== "cancelled" &&
                              other.status !== "no_show" &&
                              (other.start as Date) <
                                addMinutes(displayEnd, displayBuffer || 0) &&
                              addMinutes(
                                other.end as Date,
                                other.bufferDuration || 0,
                              ) > (evt.start as Date),
                          );
                        }

                        let eventColorClass =
                          "bg-blue-100 border-blue-300 text-blue-900 shadow-sm";
                        if (isMaintenance) {
                          eventColorClass =
                            "bg-slate-100 border-slate-300 text-slate-500 bg-[linear-gradient(45deg,rgba(0,0,0,0.03)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.03)_50%,rgba(0,0,0,0.03)_75%,transparent_75%,transparent)] bg-[length:10px_10px] shadow-inner";
                        } else if (isDisplaced || isOverlappingOther) {
                          // Transparent/Blend overlap logic
                          eventColorClass =
                            "bg-red-500/80 border-red-600/80 text-white shadow-md animate-pulse z-20 backdrop-blur-[1px]";
                        } else if (isCompleted) {
                          eventColorClass =
                            "bg-slate-200 border-slate-300 text-slate-500 opacity-80 shadow-inner";
                        } else if (isOverdueReturn) {
                          eventColorClass =
                            "bg-red-100 border-red-500 text-red-900 shadow-md animate-pulse";
                        } else if (isOngoing) {
                          eventColorClass =
                            "bg-emerald-500 border-emerald-600 text-white shadow-md";
                        } else if (isLateArrival) {
                          eventColorClass =
                            "bg-orange-100 border-orange-400 text-orange-900 shadow-md animate-pulse";
                        } else if (evt.status === "confirmed") {
                          eventColorClass =
                            "bg-emerald-100 border-emerald-300 text-emerald-900 shadow-sm";
                        } else if (evt.status === "pending") {
                          eventColorClass =
                            "bg-amber-100 border-amber-300 text-amber-900 shadow-sm";
                        }

                        const textColorClass =
                          isOngoing || isDisplaced || isOverlappingOther
                            ? "text-white"
                            : "text-slate-900";
                        const subtextColorClass =
                          isOngoing || isDisplaced || isOverlappingOther
                            ? "text-white/90"
                            : "text-slate-600";

                        // Icon sizing logic for compact month view
                        const iconClass = cn(
                          isMonthView ? "w-2.5 h-2.5" : "w-3 h-3",
                          textColorClass,
                        );

                        return (
                          <React.Fragment key={evt.id}>
                            {displayBuffer !== undefined &&
                              displayBuffer > 0 &&
                              getBufferStyle(
                                evt,
                                displayEnd,
                                displayBuffer,
                              ) && (
                                <div
                                  className="absolute top-1.5 bottom-1.5 z-0 bg-slate-100/80 border border-slate-300 border-l-0 flex items-center justify-center opacity-90 group/buffer rounded-r-md"
                                  style={{
                                    ...getBufferStyle(
                                      evt,
                                      displayEnd,
                                      displayBuffer,
                                    ),
                                    height: undefined,
                                    backgroundImage:
                                      "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(203, 213, 225, 0.4) 5px, rgba(203, 213, 225, 0.4) 10px)",
                                  }}
                                  title={`Turnaround: ${displayBuffer / 60}h`}
                                >
                                  <div
                                    className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center hover:bg-black/10 transition-colors z-20 opacity-0 group-hover/buffer:opacity-100 rounded-r-md"
                                    onMouseDown={(e) =>
                                      handleResizeStart(e, evt, "buffer")
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="w-0.5 h-3 bg-slate-400 rounded-full" />
                                  </div>
                                </div>
                              )}

                            <Popover
                              open={openEventId === evt.id}
                              onOpenChange={(isOpen) => {
                                if (!isResizing)
                                  setOpenEventId(isOpen ? evt.id : null);
                              }}
                            >
                              <ContextMenu>
                                <ContextMenuTrigger asChild>
                                  <div
                                    className={cn(
                                      "absolute top-1.5 bottom-1.5 rounded-md border cursor-pointer hover:shadow-lg transition-all z-10 overflow-hidden flex flex-col justify-center group/event",
                                      eventColorClass,
                                      isMonthView ? "px-1" : "px-2",
                                    )}
                                    style={style}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (e.altKey && onSplitEvent) {
                                        const rect =
                                          e.currentTarget.getBoundingClientRect();
                                        const snapMins = 30;
                                        const roundedMins =
                                          Math.round(
                                            (e.clientX - rect.left) /
                                              pxPerMinute /
                                              snapMins,
                                          ) * snapMins;
                                        onSplitEvent(
                                          evt,
                                          addMinutes(
                                            evt.start as Date,
                                            roundedMins,
                                          ),
                                        );
                                      } else {
                                        // Save exact click position for perfect popover anchoring
                                        const rect =
                                          e.currentTarget.getBoundingClientRect();
                                        setClickOffsets((prev) => ({
                                          ...prev,
                                          [evt.id]: e.clientX - rect.left,
                                        }));
                                        if (!isResizing) setOpenEventId(evt.id);
                                      }
                                    }}
                                  >
                                    {/* INVISIBLE POPOVER ANCHOR */}
                                    <PopoverTrigger asChild>
                                      <div
                                        className="absolute top-1/2 w-px h-px opacity-0 pointer-events-none"
                                        style={{
                                          left: `${clickOffsets[evt.id] || 0}px`,
                                        }}
                                      />
                                    </PopoverTrigger>

                                    <div
                                      className={cn(
                                        "font-bold truncate leading-tight flex justify-between items-center w-full",
                                        textColorClass,
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "truncate flex items-center",
                                          isMonthView
                                            ? "gap-1 text-[9px]"
                                            : "gap-1.5 text-[11px]",
                                        )}
                                      >
                                        {isDisplaced && (
                                          <AlertCircle className={iconClass} />
                                        )}
                                        {isLateArrival && !isDisplaced && (
                                          <ClockAlert
                                            className={cn(
                                              iconClass,
                                              "text-orange-600",
                                            )}
                                          />
                                        )}
                                        {isOverdueReturn && !isDisplaced && (
                                          <ClockAlert
                                            className={cn(
                                              iconClass,
                                              "text-red-600",
                                            )}
                                          />
                                        )}
                                        {isMaintenance && (
                                          <Wrench className={iconClass} />
                                        )}
                                        {evt.title}
                                      </span>
                                    </div>
                                    {evt.subtitle && !isMaintenance && (
                                      <div
                                        className={cn(
                                          "truncate font-medium tracking-wide",
                                          subtextColorClass,
                                          isMonthView
                                            ? "text-[7px] mt-0"
                                            : "text-[9px] mt-[1px]",
                                        )}
                                      >
                                        {isDisplaced
                                          ? "DISPLACED"
                                          : isLateArrival
                                            ? "LATE ARRIVAL"
                                            : isOverdueReturn
                                              ? "OVERDUE RETURN"
                                              : evt.subtitle}
                                      </div>
                                    )}
                                    {!isCompleted && (
                                      <div
                                        className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center hover:bg-black/10 transition-colors z-20 opacity-0 group-hover/event:opacity-100"
                                        onMouseDown={(e) =>
                                          handleResizeStart(e, evt, "event")
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div
                                          className={cn(
                                            "w-0.5 h-3 rounded-full",
                                            isOngoing || isDisplaced
                                              ? "bg-white/70"
                                              : "bg-slate-400",
                                          )}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </ContextMenuTrigger>

                                <ContextMenuContent className="w-48 rounded-lg shadow-xl border-slate-200">
                                  {isMaintenance ? (
                                    <ContextMenuItem
                                      className="text-xs font-medium text-red-600 cursor-pointer"
                                      onClick={() =>
                                        onDeleteClick && onDeleteClick(evt)
                                      }
                                    >
                                      <Trash className="w-3.5 h-3.5 mr-2" />{" "}
                                      Delete Block
                                    </ContextMenuItem>
                                  ) : (
                                    <>
                                      <ContextMenuLabel className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                                        Booking Actions
                                      </ContextMenuLabel>
                                      <ContextMenuItem
                                        className="text-xs font-medium cursor-pointer"
                                        onClick={() =>
                                          onEditClick && onEditClick(evt)
                                        }
                                      >
                                        <Edit className="w-3.5 h-3.5 mr-2 text-slate-400" />{" "}
                                        Edit Booking
                                      </ContextMenuItem>
                                      <ContextMenuItem
                                        className="text-xs font-medium cursor-pointer"
                                        onClick={() =>
                                          onExtendClick && onExtendClick(evt)
                                        }
                                      >
                                        <CalendarRange className="w-3.5 h-3.5 mr-2 text-slate-400" />{" "}
                                        Change Dates / Extend
                                      </ContextMenuItem>

                                      {/* --- NEW RIGHT CLICK OPTION --- */}
                                      {isOngoing && (
                                        <ContextMenuItem
                                          className="text-xs font-medium cursor-pointer text-emerald-700"
                                          onClick={() => {
                                            if (now < (evt.end as Date)) {
                                              if (onEarlyReturnClick)
                                                onEarlyReturnClick(evt);
                                            } else {
                                              if (onStatusChange)
                                                onStatusChange(
                                                  evt,
                                                  "completed",
                                                );
                                            }
                                          }}
                                        >
                                          <Flag className="w-3.5 h-3.5 mr-2 text-emerald-600" />{" "}
                                          Process Return
                                        </ContextMenuItem>
                                      )}
                                      <ContextMenuSeparator />
                                      <ContextMenuSub>
                                        <ContextMenuSubTrigger className="text-xs font-medium cursor-pointer">
                                          <CheckSquare className="w-3.5 h-3.5 mr-2 text-slate-400" />{" "}
                                          Force Status
                                        </ContextMenuSubTrigger>
                                        <ContextMenuSubContent className="w-40 rounded-lg shadow-xl border-slate-200">
                                          <ContextMenuItem
                                            className="text-xs font-medium cursor-pointer"
                                            onClick={() =>
                                              onStatusChange &&
                                              onStatusChange(evt, "pending")
                                            }
                                          >
                                            Set Pending
                                          </ContextMenuItem>
                                          <ContextMenuItem
                                            className="text-xs font-medium cursor-pointer"
                                            onClick={() =>
                                              onStatusChange &&
                                              onStatusChange(evt, "confirmed")
                                            }
                                          >
                                            Set Confirmed
                                          </ContextMenuItem>
                                          <ContextMenuItem
                                            className="text-xs font-medium cursor-pointer"
                                            onClick={() =>
                                              onStatusChange &&
                                              onStatusChange(evt, "ongoing")
                                            }
                                          >
                                            Set Ongoing
                                          </ContextMenuItem>
                                          <ContextMenuItem
                                            className="text-xs font-medium cursor-pointer"
                                            onClick={() =>
                                              onStatusChange &&
                                              onStatusChange(evt, "completed")
                                            }
                                          >
                                            Set Completed
                                          </ContextMenuItem>
                                          <ContextMenuSeparator />
                                          <ContextMenuItem
                                            className="text-xs font-medium text-red-600 cursor-pointer"
                                            onClick={() =>
                                              onStatusChange &&
                                              onStatusChange(evt, "no_show")
                                            }
                                          >
                                            Set No-Show
                                          </ContextMenuItem>
                                        </ContextMenuSubContent>
                                      </ContextMenuSub>
                                      <ContextMenuSeparator />
                                      <ContextMenuItem
                                        className="text-xs font-medium text-red-600 cursor-pointer"
                                        onClick={() =>
                                          onDeleteClick && onDeleteClick(evt)
                                        }
                                      >
                                        <Trash className="w-3.5 h-3.5 mr-2" />{" "}
                                        Delete Booking
                                      </ContextMenuItem>
                                    </>
                                  )}
                                </ContextMenuContent>
                              </ContextMenu>

                              <PopoverContent
                                className="w-[280px] p-0 shadow-xl border-slate-200 rounded-md overflow-hidden"
                                align="start"
                              >
                                {isMaintenance ? (
                                  <div className="p-4 bg-slate-50 text-center">
                                    <div className="w-10 h-10 rounded-md bg-slate-200 flex items-center justify-center mx-auto mb-2">
                                      <Wrench className="w-5 h-5 text-slate-500" />
                                    </div>
                                    <div className="font-semibold text-slate-800 text-sm">
                                      Maintenance Block
                                    </div>
                                    <div className="text-[11px] font-medium text-slate-500 mt-1">
                                      {format(
                                        evt.start as Date,
                                        "MMM d, h:mm a",
                                      )}{" "}
                                      - {format(evt.end as Date, "h:mm a")}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {/* COMPACT HEADER */}
                                    <div className="p-3 bg-white border-b relative">
                                      <div className="absolute top-2 right-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 rounded-sm hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                                          onClick={() =>
                                            onEditClick && onEditClick(evt)
                                          }
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center mb-1.5 gap-2">
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "uppercase text-[9px] tracking-wider font-semibold border px-1.5 py-0 rounded-sm",
                                            evt.status === "confirmed" &&
                                              !isLateArrival &&
                                              "bg-emerald-50 text-emerald-700 border-emerald-200",
                                            evt.status === "ongoing" &&
                                              !isOverdueReturn &&
                                              "bg-emerald-500 text-white border-emerald-600 shadow-sm",
                                            isLateArrival &&
                                              "bg-orange-100 text-orange-800 border-orange-300",
                                            isOverdueReturn &&
                                              "bg-red-100 text-red-800 border-red-300",
                                            evt.status === "pending" &&
                                              "bg-amber-100 text-amber-800 border-amber-300",
                                          )}
                                        >
                                          {isLateArrival
                                            ? "LATE ARRIVAL"
                                            : isOverdueReturn
                                              ? "OVERDUE RETURN"
                                              : evt.status || "BOOKING"}
                                        </Badge>
                                      </div>
                                      <div className="font-semibold text-sm text-slate-900 leading-tight pr-6 truncate">
                                        {evt.title}
                                      </div>
                                      <div className="text-[9px] text-slate-400 mt-1 font-mono bg-slate-50 inline-block px-1.5 py-0.5 rounded-sm border border-slate-100 truncate max-w-full">
                                        ID: {evt.id}
                                      </div>
                                    </div>

                                    {/* COMPACT ACCORDIONS */}
                                    <Accordion
                                      type="multiple"
                                      className="w-full bg-slate-50"
                                      defaultValue={["schedule"]}
                                    >
                                      {/* SCHEDULE ACCORDION */}
                                      <AccordionItem
                                        value="schedule"
                                        className="border-b-slate-200"
                                      >
                                        <AccordionTrigger className="px-3 py-2.5 text-[11px] font-semibold hover:no-underline hover:bg-slate-100/50 transition-colors">
                                          <div className="flex items-center gap-2 text-slate-700">
                                            <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />{" "}
                                            Trip Schedule
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-3 py-2.5 space-y-3 bg-white border-t border-slate-100">
                                          <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-50 mx-auto" />
                                            <div>
                                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                                                Pick-up
                                              </div>
                                              <div className="text-xs font-semibold text-slate-800 mt-1 leading-none">
                                                {format(
                                                  evt.start as Date,
                                                  "MMM d, yyyy • h:mm a",
                                                )}
                                              </div>
                                              {evt.pickupLocation && (
                                                <div className="text-[10px] font-medium text-slate-600 mt-1 flex items-center gap-1.5">
                                                  <MapPin className="w-3 h-3 text-slate-400" />{" "}
                                                  {evt.pickupLocation}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-[20px_1fr] items-start gap-2 relative">
                                            <div className="absolute left-[9px] top-[-16px] bottom-[20px] w-px bg-slate-200" />
                                            <div
                                              className={cn(
                                                "mt-1 w-1.5 h-1.5 rounded-full ring-2 mx-auto relative z-10",
                                                isOverdueReturn
                                                  ? "bg-red-500 ring-red-50"
                                                  : "bg-blue-500 ring-blue-50",
                                              )}
                                            />
                                            <div>
                                              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none">
                                                Return
                                              </div>
                                              <div className="text-xs font-semibold text-slate-800 mt-1 leading-none">
                                                {format(
                                                  evt.end as Date,
                                                  "MMM d, yyyy • h:mm a",
                                                )}
                                              </div>
                                              {evt.dropoffLocation && (
                                                <div className="text-[10px] font-medium text-slate-600 mt-1 flex items-center gap-1.5">
                                                  <MapPin className="w-3 h-3 text-slate-400" />{" "}
                                                  {evt.dropoffLocation}
                                                </div>
                                              )}
                                              {evt.bufferDuration &&
                                                evt.bufferDuration > 0 && (
                                                  <div className="text-[9px] font-medium text-slate-500 mt-1.5 flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded-sm w-fit border border-slate-100">
                                                    <Clock className="w-2.5 h-2.5" />{" "}
                                                    +{evt.bufferDuration / 60}h
                                                    turnaround
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>

                                      {/* DRIVER ACCORDION */}
                                      {evt.withDriver && (
                                        <AccordionItem
                                          value="driver"
                                          className="border-b-slate-200"
                                        >
                                          <AccordionTrigger className="px-3 py-2.5 text-[11px] font-semibold hover:no-underline hover:bg-slate-100/50 transition-colors">
                                            <div className="flex items-center gap-2 text-slate-700">
                                              <UserCircle className="w-3.5 h-3.5 text-slate-400" />{" "}
                                              Assigned Driver
                                            </div>
                                          </AccordionTrigger>
                                          <AccordionContent className="px-3 py-2 space-y-2 bg-white border-t border-slate-100">
                                            <div className="flex items-center gap-2.5 text-xs">
                                              <div className="w-6 h-6 rounded-md bg-slate-100 flex items-center justify-center">
                                                <User className="w-3.5 h-3.5 text-slate-500" />
                                              </div>
                                              <span className="font-semibold text-slate-800">
                                                {evt.driverName || "Pending"}
                                              </span>
                                            </div>
                                            {evt.driverPhone && (
                                              <div className="flex items-center gap-2.5 text-[10px] pl-8">
                                                <Phone className="w-3 h-3 text-slate-400" />
                                                <span className="font-medium text-slate-600">
                                                  {evt.driverPhone}
                                                </span>
                                              </div>
                                            )}
                                          </AccordionContent>
                                        </AccordionItem>
                                      )}

                                      {/* CONTACT ACCORDION */}
                                      <AccordionItem
                                        value="contact"
                                        className="border-b-slate-200"
                                      >
                                        <AccordionTrigger className="px-3 py-2.5 text-[11px] font-semibold hover:no-underline hover:bg-slate-100/50 transition-colors">
                                          <div className="flex items-center gap-2 text-slate-700">
                                            <User className="w-3.5 h-3.5 text-slate-400" />{" "}
                                            Customer Contact
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-3 py-2.5 space-y-2 bg-white border-t border-slate-100">
                                          <div className="flex items-center gap-2 text-[11px]">
                                            <Phone className="w-3 h-3 text-slate-400" />
                                            <span className="font-medium text-slate-700">
                                              {evt.customerPhone || "N/A"}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-[11px]">
                                            <Mail className="w-3 h-3 text-slate-400" />
                                            <span className="font-medium text-slate-700 truncate">
                                              {evt.customerEmail || "N/A"}
                                            </span>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>

                                      {/* PAYMENT ACCORDION */}
                                      <AccordionItem
                                        value="payment"
                                        className="border-none"
                                      >
                                        <AccordionTrigger className="px-3 py-2.5 text-[11px] font-semibold hover:no-underline hover:bg-slate-100/50 transition-colors">
                                          <div className="flex items-center gap-2 text-slate-700">
                                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />{" "}
                                            Financials
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-3 py-2.5 bg-white border-t border-slate-100">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                              Total Amount
                                            </span>
                                            <span className="font-bold text-sm text-slate-900">
                                              ₱{" "}
                                              {evt.amount?.toLocaleString() ||
                                                "0.00"}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                              Status
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "text-[9px] font-bold h-4 px-1.5 rounded-sm",
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

                                    {/* --- COMPACT QUICK ACTIONS --- */}
                                    <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex flex-col gap-1.5">
                                      {/* SCENARIO 0: Pending */}
                                      {evt.status === "pending" && (
                                        <div className="flex gap-1.5 w-full">
                                          {now >= (evt.start as Date) && (
                                            <Button
                                              size="sm"
                                              className="flex-1 h-8 text-[10px] font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-sm shadow-sm"
                                              onClick={() =>
                                                onStatusChange?.(evt, "ongoing")
                                              }
                                            >
                                              Approve & Release
                                            </Button>
                                          )}
                                          <Button
                                            size="sm"
                                            variant={
                                              now >= (evt.start as Date)
                                                ? "outline"
                                                : "default"
                                            }
                                            className={cn(
                                              "flex-1 h-8 text-[10px] font-semibold rounded-sm shadow-sm",
                                              now < (evt.start as Date)
                                                ? "bg-slate-900 text-white hover:bg-slate-800"
                                                : "bg-white text-slate-700 border-slate-300",
                                            )}
                                            onClick={() =>
                                              onStatusChange?.(evt, "confirmed")
                                            }
                                          >
                                            <Check className="w-3 h-3 mr-1" />{" "}
                                            Approve
                                          </Button>
                                        </div>
                                      )}

                                      {/* SCENARIO 1: Confirmed (Normal) */}
                                      {evt.status === "confirmed" &&
                                        !isLateArrival && (
                                          <Button
                                            size="sm"
                                            className="w-full h-8 text-[11px] font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-sm shadow-sm"
                                            onClick={() =>
                                              onStatusChange?.(evt, "ongoing")
                                            }
                                          >
                                            Release Vehicle{" "}
                                            <MoveRight className="w-3 h-3 ml-1.5" />{" "}
                                            Start Trip
                                          </Button>
                                        )}

                                      {/* SCENARIO 2: Confirmed (Customer is Late) */}
                                      {evt.status === "confirmed" &&
                                        isLateArrival && (
                                          <div className="flex gap-1.5 w-full">
                                            <Button
                                              size="sm"
                                              className="flex-1 h-8 text-[10px] font-semibold bg-slate-900 text-white hover:bg-slate-800 rounded-sm shadow-sm"
                                              onClick={() =>
                                                onStatusChange?.(evt, "ongoing")
                                              }
                                            >
                                              <Key className="w-3 h-3 mr-1" />{" "}
                                              Arrived
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="flex-1 h-8 text-[10px] font-semibold text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 rounded-sm shadow-sm bg-white"
                                              onClick={() =>
                                                onStatusChange?.(evt, "no_show")
                                              }
                                            >
                                              <UserX className="w-3 h-3 mr-1" />{" "}
                                              No-Show
                                            </Button>
                                          </div>
                                        )}

                                      {/* SCENARIO 3: Ongoing (Normal or Overdue) - THIS IS THE FIX */}
                                      {evt.status === "ongoing" && (
                                        <Button
                                          size="sm"
                                          className="w-full h-8 text-[11px] font-semibold bg-blue-600 text-white hover:bg-blue-700 rounded-sm shadow-sm"
                                          onClick={() => {
                                            // Determine if it's early or on-time
                                            if (now < (evt.end as Date)) {
                                              // Early Return -> Open Dialog
                                              if (onEarlyReturnClick)
                                                onEarlyReturnClick(evt);
                                            } else {
                                              // On Time / Late Return -> Just complete it
                                              if (onStatusChange)
                                                onStatusChange(
                                                  evt,
                                                  "completed",
                                                );
                                            }
                                          }}
                                        >
                                          <Flag className="w-3 h-3 mr-1.5" />{" "}
                                          Process Return
                                        </Button>
                                      )}

                                      {/* SCENARIO 4: Completed */}
                                      {evt.status === "completed" && (
                                        <div className="w-full text-center text-[10px] font-semibold text-slate-500 py-1.5 flex items-center justify-center bg-slate-200/50 rounded-sm border border-slate-200">
                                          <CheckCircle className="w-3 h-3 mr-1.5 text-slate-400" />{" "}
                                          Trip Completed
                                        </div>
                                      )}
                                    </div>
                                  </>
                                )}
                              </PopoverContent>
                            </Popover>
                          </React.Fragment>
                        );
                      })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
