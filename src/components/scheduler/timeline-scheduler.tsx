"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    | "CONFIRMED"
    | "PENDING"
    | "MAINTENANCE"
    | "DISPLACED"
    | "ONGOING"
    | "COMPLETED"
    | "NO_SHOW"
    | "CANCELLED";
  bufferDuration?: number;
  paymentStatus?: "PAID" | "PENDING" | "PARTIAL" | "UNPAID";
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
  onDispatchClick?: (event: SchedulerEvent) => void;
  isOverrideMode?: boolean;
  onApproveClick?: (event: SchedulerEvent) => void;
  onReleaseClick?: (event: SchedulerEvent) => void;
  onReturnClick?: (event: SchedulerEvent) => void;
  onNoShowClick?: (event: SchedulerEvent) => void;
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
  onDispatchClick,
  isOverrideMode = false,
  onApproveClick,
  onReleaseClick,
  onReturnClick,
  onNoShowClick,
}: TimelineSchedulerProps) {
  const [view, setView] = useState<ViewType>("day");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [clickOffsets, setClickOffsets] = useState<Record<string, number>>({});
  const router = useRouter();

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

  // PERFORMANCE FIX: Request Animation Frame for Dragging
  useEffect(() => {
    if (!resizingEventId) return;
    let frameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (frameId) cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
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
      });
    };

    const handleMouseUp = () => {
      if (frameId) cancelAnimationFrame(frameId);
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
      if (frameId) cancelAnimationFrame(frameId);
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

  // PERFORMANCE FIX: Request Animation Frame for Creating
  useEffect(() => {
    if (!creationState?.isDragging) return;
    let frameId: number;

    const handleMouseMove = (e: MouseEvent) => {
      if (frameId) cancelAnimationFrame(frameId);

      frameId = requestAnimationFrame(() => {
        const deltaX = e.clientX - creationState.startClientX;
        if (Math.abs(deltaX) > 10) wasDragged.current = true;
        setCreationState((prev) =>
          prev ? { ...prev, currentX: prev.startX + deltaX } : null,
        );
      });
    };

    const handleMouseUp = () => {
      if (frameId) cancelAnimationFrame(frameId);
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
      if (frameId) cancelAnimationFrame(frameId);
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
          evt.status !== "NO_SHOW" &&
          evt.status !== "CANCELLED",
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

  // PERFORMANCE FIX: Memoize the thousands of grid line DOM nodes
  const BackgroundGridLines = useMemo(() => {
    return (
      <div className="absolute inset-0 flex pointer-events-none">
        {subHeaders.map((h: SubHeader, i: number) => (
          <div
            key={i}
            className={cn(
              "border-r h-full", // Stripped transition-colors to prevent layout thrashing
              view !== "month" && i % 24 === 0
                ? "border-border bg-secondary/10"
                : "border-border/50",
            )}
            style={{ width: `${h.width}px` }}
          />
        ))}
      </div>
    );
  }, [subHeaders, view]);

  return (
    <div className="flex flex-col h-full bg-card shadow-sm overflow-hidden transition-colors duration-300">
      {/* TOOLBAR */}
      <div className="flex flex-wrap md:flex-nowrap items-center gap-3 px-4 py-2.5 border-b border-border bg-card shrink-0 z-10 w-full transition-colors">
        <div className="flex items-center bg-secondary rounded-lg border border-border shadow-sm h-8 p-0.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-7 rounded-md hover:bg-background text-muted-foreground transition-colors"
            onClick={() => handleNavigate("prev")}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Separator orientation="vertical" className="h-4 bg-border mx-1" />
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-full text-[11px] font-semibold px-3 min-w-[140px] flex justify-center text-foreground hover:bg-background transition-colors"
              >
                <CalendarIcon className="mr-2 h-3.5 w-3.5 text-primary" />{" "}
                {dateLabel}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 border-border shadow-xl rounded-xl bg-card"
              align="center"
            >
              <Calendar
                mode="single"
                selected={currentDate}
                onSelect={handleDateSelect}
                initialFocus
                className="bg-card text-foreground"
              />
            </PopoverContent>
          </Popover>
          <Separator orientation="vertical" className="h-4 bg-border mx-1" />
          <Button
            variant="ghost"
            size="icon"
            className="h-full w-7 rounded-md hover:bg-background text-muted-foreground transition-colors"
            onClick={() => handleNavigate("next")}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Tabs
          value={view}
          onValueChange={(v) => setView(v as ViewType)}
          className="h-8"
        >
          <TabsList className="grid w-[200px] grid-cols-3 h-full p-0.5 bg-secondary border border-border rounded-lg">
            <TabsTrigger
              value="day"
              className="text-[10px] font-semibold h-full rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
            >
              Day
            </TabsTrigger>
            <TabsTrigger
              value="week"
              className="text-[10px] font-semibold h-full rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
            >
              Week
            </TabsTrigger>
            <TabsTrigger
              value="month"
              className="text-[10px] font-semibold h-full rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
            >
              Month
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex-1 hidden lg:block" />

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-[220px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search vehicles..."
              className="pl-8 h-8 text-[11px] bg-secondary border-border focus-visible:bg-background text-foreground rounded-lg shadow-none transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={filterMode}
            onValueChange={(v: any) => setFilterMode(v)}
          >
            <SelectTrigger className="w-[140px] h-8 text-[11px] bg-secondary border-border text-foreground font-semibold rounded-lg shadow-none transition-colors">
              <Filter className="w-3.5 h-3.5 text-muted-foreground mr-1.5" />{" "}
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border rounded-lg">
              <SelectItem value="all" className="text-[11px]">
                Show All Fleet
              </SelectItem>
              <SelectItem value="booked" className="text-[11px]">
                Currently Booked
              </SelectItem>
              <SelectItem value="available" className="text-[11px]">
                Available Now
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* LEGEND ROW */}
      <div className="h-8 bg-secondary/30 border-b border-border flex items-center px-4 gap-5 shrink-0 overflow-x-auto text-[9px] font-bold text-muted-foreground uppercase tracking-widest custom-scrollbar select-none transition-colors">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/20 border border-emerald-500" />{" "}
          Confirmed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-600" />{" "}
          Ongoing
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500/20 border border-amber-500" />{" "}
          Pending
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-secondary border border-border" />{" "}
          Completed
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-orange-500/20 border border-orange-500" />{" "}
          Late Arrival
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500/20 border border-red-500" />{" "}
          Overdue Return
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-[3px] bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.1)_50%,rgba(255,255,255,0.1)_75%,transparent_75%,transparent)] bg-[length:6px_6px] border border-border dark:bg-[linear-gradient(45deg,rgba(0,0,0,0.2)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.2)_50%,rgba(0,0,0,0.2)_75%,transparent_75%,transparent)]" />{" "}
          Maintenance
        </div>
      </div>

      {/* TIMELINE BODY */}
      <div className="flex-1 overflow-auto bg-background custom-scrollbar relative transition-colors">
        <div
          className="min-w-max flex flex-col"
          style={{ width: `${SIDEBAR_WIDTH + totalWidth}px` }}
        >
          <div className="sticky top-0 z-40 flex border-b border-border shadow-sm bg-card transition-colors">
            {/* FIXED LEFT SIDEBAR HEADER */}
            <div
              className="sticky left-0 z-50 bg-secondary border-r border-border flex items-center px-4 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.1)] transition-colors"
              style={{
                width: `${SIDEBAR_WIDTH}px`,
                minWidth: `${SIDEBAR_WIDTH}px`,
              }}
            >
              <div className="font-bold text-[10px] text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                Fleet Resources{" "}
                <Badge
                  variant="secondary"
                  className="text-[9px] px-1.5 py-0 rounded border-border"
                >
                  {filteredResources.length}
                </Badge>
              </div>
            </div>

            {/* TIMELINE HEADERS */}
            <div className="flex flex-col bg-card transition-colors">
              <div className="flex h-7 border-b border-border bg-secondary/30 transition-colors">
                {mainHeaders.map((h: MainHeader, i: number) => (
                  <div
                    key={i}
                    className="shrink-0 border-r border-border flex items-center justify-center font-bold text-[10px] text-foreground uppercase tracking-widest"
                    style={{ width: `${h.width}px` }}
                  >
                    {h.label}
                  </div>
                ))}
              </div>
              <div className="flex h-5 bg-card transition-colors">
                {subHeaders.map((h: SubHeader, i: number) => (
                  <div
                    key={i}
                    className="shrink-0 border-r border-border flex items-center justify-center text-[9px] text-muted-foreground font-mono font-semibold"
                    style={{ width: `${h.width}px` }}
                  >
                    {h.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative flex flex-col">
            {/* CURRENT TIME INDICATOR */}
            {nowOffset >= 0 && nowOffset <= totalWidth && (
              <div
                className="absolute top-0 bottom-0 w-[2px] bg-red-500 z-20 pointer-events-none"
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
                    "CONFIRMED",
                    "ONGOING",
                    "MAINTENANCE",
                    "PENDING",
                    "DISPLACED",
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
                "bg-emerald-500 border-emerald-600 text-white shadow-lg shadow-emerald-500/20";
              let ghostLabel = "PROPOSAL (CLEAR)";
              let ghostIcon = (
                <CheckCircle
                  className={cn(isMonthView ? "w-2.5 h-2.5" : "w-3 h-3")}
                />
              );

              if (hasConflict) {
                if (isOverrideMode) {
                  ghostStyleClass =
                    "bg-amber-500 border-amber-600 text-white ring-2 ring-amber-500/30 shadow-lg shadow-amber-500/30";
                  ghostLabel = "FORCE OVERRIDE";
                  ghostIcon = (
                    <ShieldAlert
                      className={cn(isMonthView ? "w-2.5 h-2.5" : "w-3 h-3")}
                    />
                  );
                } else {
                  ghostStyleClass =
                    "bg-red-500 border-red-600 text-white shadow-lg shadow-red-500/30 animate-pulse opacity-90 z-50";
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
                  className="flex border-b border-border bg-card h-[52px] group hover:bg-secondary/30 transition-colors relative"
                >
                  {/* RESOURCE SIDEBAR CELL */}
                  <div
                    className="sticky left-0 z-30 bg-card group-hover:bg-secondary/30 border-r border-border flex items-center px-4 gap-3 shadow-[4px_0_12px_-6px_rgba(0,0,0,0.1)] transition-colors"
                    style={{
                      width: `${SIDEBAR_WIDTH}px`,
                      minWidth: `${SIDEBAR_WIDTH}px`,
                    }}
                  >
                    <Avatar className="h-8 w-8 border border-border shadow-sm rounded-md">
                      <AvatarImage src={res.image} className="object-cover" />
                      <AvatarFallback className="bg-secondary font-bold text-muted-foreground text-xs rounded-md">
                        {res.title[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-[11px] font-bold truncate text-foreground tracking-tight group-hover:text-primary transition-colors">
                        {res.title}
                      </span>
                      <span className="text-[9px] font-medium text-muted-foreground truncate uppercase tracking-widest">
                        {res.subtitle}
                      </span>
                    </div>
                  </div>

                  {/* TIMELINE GRID CELL */}
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
                          {/* PERFORMANCE FIX: Use Memoized Background Grid */}
                          {BackgroundGridLines}
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-56 rounded-lg shadow-xl border-border bg-popover">
                        <ContextMenuItem
                          className="text-[11px] font-medium cursor-pointer text-popover-foreground focus:bg-secondary"
                          onClick={() =>
                            onAddMaintenance &&
                            clickedTimeRef.current &&
                            onAddMaintenance(res.id, clickedTimeRef.current)
                          }
                        >
                          <Wrench className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{" "}
                          Add Maintenance Block
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>

                    {/* DRAG TO CREATE PREVIEW */}
                    {creationState?.isDragging &&
                      creationState.resourceId === res.id && (
                        <div
                          className="absolute top-1.5 bottom-1.5 bg-primary/20 border border-primary border-dashed rounded-md z-40 flex items-center justify-center pointer-events-none overflow-hidden backdrop-blur-sm"
                          style={{
                            left: `${Math.min(creationState.startX, creationState.currentX)}px`,
                            width: `${Math.abs(creationState.currentX - creationState.startX)}px`,
                          }}
                        >
                          {Math.abs(
                            creationState.currentX - creationState.startX,
                          ) > 60 && (
                            <div className="bg-card px-2 py-0.5 rounded shadow-sm text-primary font-bold text-[9px] whitespace-nowrap border border-border">
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

                    {/* GHOST PROPOSAL BLOCK */}
                    {isGhostHere && ghostStyle && parsedGhostBooking && (
                      <div
                        className={cn(
                          "absolute top-1 bottom-1 rounded-md border text-xs z-50 flex flex-col justify-center pointer-events-none transition-all",
                          ghostStyleClass,
                          isMonthView ? "px-1" : "px-2",
                        )}
                        style={ghostStyle}
                      >
                        <div className="font-bold flex items-center gap-1.5">
                          {ghostIcon} {!isMonthView && ghostLabel}
                        </div>
                        {!isMonthView && (
                          <div className="text-[9px] font-medium opacity-90 truncate mt-0.5 uppercase tracking-widest">
                            {parsedGhostBooking.title}
                          </div>
                        )}
                      </div>
                    )}

                    {/* RENDER ACTUAL EVENTS */}
                    {events
                      .filter(
                        (evt) =>
                          evt.resourceId === res.id &&
                          evt.status !== "CANCELLED" &&
                          evt.status !== "NO_SHOW",
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

                        const isMaintenance = evt.status === "MAINTENANCE";
                        const isDisplaced = evt.status === "DISPLACED";
                        const isOngoing = evt.status === "ONGOING";
                        const isCompleted = evt.status === "COMPLETED";
                        const isLateArrival =
                          evt.status === "CONFIRMED" &&
                          now > (evt.start as Date);
                        const isOverdueReturn =
                          evt.status === "ONGOING" && now > (evt.end as Date);

                        // --- DRIVER ASSIGNMENT LOGIC ---
                        const needsDriver = evt.withDriver === true;
                        const hasAssignedDriver =
                          evt.driverName && evt.driverName.trim() !== "";
                        const missingDriverWarning =
                          needsDriver &&
                          !hasAssignedDriver &&
                          evt.status !== "COMPLETED" &&
                          evt.status !== "MAINTENANCE";

                        let isOverlappingOther = false;
                        if (!isResizing && !isCompleted) {
                          isOverlappingOther = events.some(
                            (other) =>
                              other.id !== evt.id &&
                              other.resourceId === evt.resourceId &&
                              other.status !== "DISPLACED" &&
                              other.status !== "CANCELLED" &&
                              other.status !== "NO_SHOW" &&
                              (other.start as Date) <
                                addMinutes(displayEnd, displayBuffer || 0) &&
                              addMinutes(
                                other.end as Date,
                                other.bufferDuration || 0,
                              ) > (evt.start as Date),
                          );
                        }

                        // --- THEME-AWARE EVENT COLORS ---
                        let eventColorClass =
                          "bg-primary/20 border-primary/30 text-foreground shadow-sm backdrop-blur-sm"; // Default

                        if (isMaintenance) {
                          eventColorClass =
                            "bg-secondary border-border text-muted-foreground bg-[linear-gradient(45deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] dark:bg-[linear-gradient(45deg,rgba(0,0,0,0.1)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1)_75%,transparent_75%,transparent)] bg-[length:10px_10px]";
                        } else if (isDisplaced || isOverlappingOther) {
                          eventColorClass =
                            "bg-destructive/80 border-destructive text-destructive-foreground shadow-md animate-pulse z-20 backdrop-blur-md";
                        } else if (isCompleted) {
                          eventColorClass =
                            "bg-secondary border-border text-muted-foreground opacity-80";
                        } else if (isOverdueReturn) {
                          eventColorClass =
                            "bg-red-500/20 border-red-500 text-red-600 dark:text-red-400 shadow-md animate-pulse";
                        } else if (isOngoing) {
                          eventColorClass =
                            "bg-emerald-500 border-emerald-600 text-white shadow-md";
                        } else if (isLateArrival) {
                          eventColorClass =
                            "bg-orange-500/20 border-orange-500 text-orange-600 dark:text-orange-400 shadow-md animate-pulse";
                        } else if (evt.status === "CONFIRMED") {
                          eventColorClass =
                            "bg-emerald-500/20 border-emerald-500/50 text-foreground shadow-sm";
                        } else if (evt.status === "PENDING") {
                          eventColorClass =
                            "bg-amber-500/20 border-amber-500/50 text-foreground shadow-sm";
                        }

                        const textColorClass =
                          isOngoing || isDisplaced || isOverlappingOther
                            ? "text-white"
                            : "text-foreground";
                        const subtextColorClass =
                          isOngoing || isDisplaced || isOverlappingOther
                            ? "text-white/80"
                            : "text-muted-foreground";
                        const iconClass = cn(
                          isMonthView ? "w-2.5 h-2.5" : "w-3 h-3",
                          textColorClass,
                        );

                        return (
                          <React.Fragment key={evt.id}>
                            {/* BUFFER BLOCK */}
                            {displayBuffer !== undefined &&
                              displayBuffer > 0 &&
                              getBufferStyle(
                                evt,
                                displayEnd,
                                displayBuffer,
                              ) && (
                                <div
                                  className="absolute top-1 bottom-1 z-0 bg-secondary/80 border border-border border-l-0 flex items-center justify-center opacity-90 group/buffer rounded-r-md backdrop-blur-sm"
                                  style={{
                                    ...getBufferStyle(
                                      evt,
                                      displayEnd,
                                      displayBuffer,
                                    ),
                                    height: undefined,
                                    backgroundImage:
                                      "repeating-linear-gradient(45deg, transparent, transparent 5px, rgba(100, 197, 195, 0.1) 5px, rgba(100, 197, 195, 0.1) 10px)",
                                  }}
                                  title={`Turnaround: ${displayBuffer / 60}h`}
                                >
                                  <div
                                    className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center hover:bg-primary/20 transition-colors z-20 opacity-0 group-hover/buffer:opacity-100 rounded-r-md"
                                    onMouseDown={(e) =>
                                      handleResizeStart(e, evt, "buffer")
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="w-[1px] h-3 bg-muted-foreground rounded-full" />
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
                                      "absolute top-1 bottom-1 rounded-md border cursor-pointer hover:border-primary transition-all z-10 overflow-hidden flex flex-col justify-center group/event",
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
                                    {/* MISSING DRIVER WARNING BADGE */}
                                    {missingDriverWarning && !isMonthView && (
                                      <div className="absolute top-0 right-0 bg-destructive text-destructive-foreground text-[8px] font-bold px-1.5 py-0.5 rounded-bl-sm z-20 flex items-center gap-0.5">
                                        <ShieldAlert className="w-2.5 h-2.5" />{" "}
                                        Dispatch Needed
                                      </div>
                                    )}

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
                                            ? "gap-1 text-[8px]"
                                            : "gap-1.5 text-[10px]",
                                        )}
                                      >
                                        {isDisplaced && (
                                          <AlertCircle className={iconClass} />
                                        )}
                                        {isLateArrival && !isDisplaced && (
                                          <ClockAlert
                                            className={cn(
                                              iconClass,
                                              "text-orange-500",
                                            )}
                                          />
                                        )}
                                        {isOverdueReturn && !isDisplaced && (
                                          <ClockAlert
                                            className={cn(
                                              iconClass,
                                              "text-red-500",
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
                                          "truncate font-medium tracking-widest uppercase",
                                          subtextColorClass,
                                          isMonthView
                                            ? "text-[7px] mt-0"
                                            : "text-[8px] mt-[1px]",
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
                                        className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors z-20 opacity-0 group-hover/event:opacity-100"
                                        onMouseDown={(e) =>
                                          handleResizeStart(e, evt, "event")
                                        }
                                        onClick={(e) => e.stopPropagation()}
                                      >
                                        <div
                                          className={cn(
                                            "w-[1px] h-3 rounded-full",
                                            isOngoing || isDisplaced
                                              ? "bg-white/70"
                                              : "bg-muted-foreground",
                                          )}
                                        />
                                      </div>
                                    )}
                                  </div>
                                </ContextMenuTrigger>

                                {/* CONTEXT MENU CONTENT */}
                                <ContextMenuContent className="w-48 rounded-lg shadow-xl border-border bg-popover">
                                  {isMaintenance ? (
                                    <ContextMenuItem
                                      className="text-[11px] font-semibold text-destructive cursor-pointer focus:bg-secondary"
                                      onClick={() =>
                                        onDeleteClick && onDeleteClick(evt)
                                      }
                                    >
                                      <Trash className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{" "}
                                      Delete Block
                                    </ContextMenuItem>
                                  ) : (
                                    <>
                                      <ContextMenuLabel className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">
                                        Booking Actions
                                      </ContextMenuLabel>
                                      <ContextMenuItem
                                        className="text-[11px] font-medium cursor-pointer focus:bg-secondary text-popover-foreground"
                                        onClick={() =>
                                          router.push(
                                            `/admin/bookings/${evt.id}`,
                                          )
                                        }
                                      >
                                        <ExternalLink className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{" "}
                                        Open Command Center
                                      </ContextMenuItem>
                                      <ContextMenuItem
                                        className="text-[11px] font-medium cursor-pointer focus:bg-secondary text-popover-foreground"
                                        onClick={() =>
                                          onExtendClick && onExtendClick(evt)
                                        }
                                      >
                                        <CalendarRange className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{" "}
                                        Change Dates / Extend
                                      </ContextMenuItem>

                                      {/* DISPATCH ACTION */}
                                      {needsDriver && (
                                        <ContextMenuItem
                                          className="text-[11px] font-medium cursor-pointer focus:bg-secondary text-popover-foreground"
                                          onClick={() =>
                                            onDispatchClick &&
                                            onDispatchClick(evt)
                                          }
                                        >
                                          <Car className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{" "}
                                          Manage Dispatch
                                        </ContextMenuItem>
                                      )}

                                      {/* NEW: SPECIFIC WORKFLOW ACTIONS */}
                                      {evt.status === "PENDING" && (
                                        <ContextMenuItem
                                          className="text-[11px] font-medium cursor-pointer text-amber-600 focus:bg-secondary focus:text-amber-700"
                                          onClick={() =>
                                            router.push(
                                              `/admin/bookings/${evt.id}`,
                                            )
                                          }
                                        >
                                          <Check className="w-3.5 h-3.5 mr-2 text-amber-600" />{" "}
                                          Review & Approve
                                        </ContextMenuItem>
                                      )}
                                      {evt.status === "CONFIRMED" && (
                                        <ContextMenuItem
                                          className="text-[11px] font-medium cursor-pointer text-primary focus:bg-secondary focus:text-primary"
                                          onClick={() =>
                                            onReleaseClick &&
                                            onReleaseClick(evt)
                                          }
                                        >
                                          <Key className="w-3.5 h-3.5 mr-2 text-primary" />{" "}
                                          Execute Handover
                                        </ContextMenuItem>
                                      )}
                                      {evt.status === "ONGOING" && (
                                        <ContextMenuItem
                                          className="text-[11px] font-medium cursor-pointer text-emerald-600 focus:bg-secondary focus:text-emerald-700"
                                          onClick={() =>
                                            onReturnClick && onReturnClick(evt)
                                          }
                                        >
                                          <Flag className="w-3.5 h-3.5 mr-2 text-emerald-600" />{" "}
                                          Process Return
                                        </ContextMenuItem>
                                      )}

                                      <ContextMenuSeparator className="bg-border" />

                                      {/* EMERGENCY OVERRIDES (Keep existing onStatusChange logic here) */}
                                      <ContextMenuSub>
                                        <ContextMenuSubTrigger className="text-[11px] font-medium cursor-pointer focus:bg-secondary text-popover-foreground">
                                          <CheckSquare className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{" "}
                                          Force Status Override
                                        </ContextMenuSubTrigger>
                                        <ContextMenuSubContent className="w-40 rounded-lg shadow-xl border-border bg-popover">
                                          <ContextMenuItem
                                            onClick={() =>
                                              onStatusChange?.(evt, "PENDING")
                                            }
                                          >
                                            Set Pending
                                          </ContextMenuItem>
                                          <ContextMenuItem
                                            onClick={() =>
                                              onStatusChange?.(evt, "CONFIRMED")
                                            }
                                          >
                                            Set Confirmed
                                          </ContextMenuItem>
                                          <ContextMenuItem
                                            onClick={() =>
                                              onStatusChange?.(evt, "ONGOING")
                                            }
                                          >
                                            Set Ongoing
                                          </ContextMenuItem>
                                          <ContextMenuItem
                                            onClick={() =>
                                              onStatusChange?.(evt, "COMPLETED")
                                            }
                                          >
                                            Set Completed
                                          </ContextMenuItem>
                                          <ContextMenuSeparator className="bg-border" />
                                          <ContextMenuItem
                                            className="text-destructive"
                                            onClick={() =>
                                              onStatusChange?.(evt, "NO_SHOW")
                                            }
                                          >
                                            Set No-Show
                                          </ContextMenuItem>
                                        </ContextMenuSubContent>
                                      </ContextMenuSub>

                                      <ContextMenuSeparator className="bg-border" />
                                      <ContextMenuItem
                                        className="text-[11px] font-semibold text-destructive cursor-pointer focus:bg-secondary focus:text-destructive"
                                        onClick={() =>
                                          onDeleteClick && onDeleteClick(evt)
                                        }
                                      >
                                        <Trash className="w-3.5 h-3.5 mr-2" />{" "}
                                        Archive Booking
                                      </ContextMenuItem>
                                    </>
                                  )}
                                </ContextMenuContent>
                              </ContextMenu>

                              {/* EVENT POPOVER DETAILS */}
                              <PopoverContent
                                className="w-[280px] p-0 shadow-2xl border-border rounded-xl overflow-hidden bg-card"
                                align="start"
                              >
                                {isMaintenance ? (
                                  <div className="p-4 bg-secondary/50 text-center">
                                    <div className="w-10 h-10 rounded-lg bg-card border border-border flex items-center justify-center mx-auto mb-2 shadow-sm">
                                      <Wrench className="w-4 h-4 text-muted-foreground" />
                                    </div>
                                    <div className="font-bold text-foreground text-xs uppercase tracking-widest">
                                      Maintenance Block
                                    </div>
                                    <div className="text-[10px] font-medium text-muted-foreground mt-1">
                                      {format(
                                        evt.start as Date,
                                        "MMM d, h:mm a",
                                      )}{" "}
                                      - {format(evt.end as Date, "h:mm a")}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    <div className="p-3 bg-card border-b border-border relative">
                                      <div className="absolute top-2 right-2">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                          onClick={() =>
                                            onEditClick && onEditClick(evt)
                                          }
                                        >
                                          <Edit className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                          onClick={() =>
                                            router.push(
                                              `/admin/bookings/${evt.id}`,
                                            )
                                          }
                                        >
                                          <ExternalLink className="h-3 w-3" />
                                        </Button>
                                      </div>
                                      <div className="flex items-center mb-1.5 gap-2">
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "uppercase text-[8px] tracking-widest font-bold border px-1.5 py-0 rounded-sm",
                                            evt.status === "CONFIRMED" &&
                                              !isLateArrival &&
                                              "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
                                            evt.status === "ONGOING" &&
                                              !isOverdueReturn &&
                                              "bg-emerald-500 text-white border-emerald-600 shadow-sm",
                                            isLateArrival &&
                                              "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30",
                                            isOverdueReturn &&
                                              "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30",
                                            evt.status === "PENDING" &&
                                              "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30",
                                          )}
                                        >
                                          {isLateArrival
                                            ? "LATE ARRIVAL"
                                            : isOverdueReturn
                                              ? "OVERDUE RETURN"
                                              : evt.status || "BOOKING"}
                                        </Badge>
                                      </div>
                                      <div className="font-bold text-xs text-foreground leading-tight pr-6 truncate">
                                        {evt.title}
                                      </div>
                                      <div className="text-[9px] text-muted-foreground mt-1 font-mono bg-secondary inline-block px-1.5 py-0.5 rounded border border-border truncate max-w-full">
                                        ID: {evt.id}
                                      </div>
                                    </div>

                                    <Accordion
                                      type="multiple"
                                      className="w-full bg-background"
                                      defaultValue={["schedule", "driver"]}
                                    >
                                      <AccordionItem
                                        value="schedule"
                                        className="border-b border-border"
                                      >
                                        <AccordionTrigger className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:no-underline hover:bg-secondary transition-colors">
                                          <div className="flex items-center gap-2 text-foreground">
                                            <CalendarIcon className="w-3 h-3 text-muted-foreground" />{" "}
                                            Trip Schedule
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-3 py-3 space-y-3 bg-card border-t border-border">
                                          <div className="grid grid-cols-[20px_1fr] items-start gap-2">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20 mx-auto" />
                                            <div>
                                              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                                Pick-up
                                              </div>
                                              <div className="text-[11px] font-semibold text-foreground mt-1 leading-none">
                                                {format(
                                                  evt.start as Date,
                                                  "MMM d, yyyy • h:mm a",
                                                )}
                                              </div>
                                              {evt.pickupLocation && (
                                                <div className="text-[10px] font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
                                                  <MapPin className="w-3 h-3 text-muted-foreground/70" />{" "}
                                                  {evt.pickupLocation}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-[20px_1fr] items-start gap-2 relative">
                                            <div className="absolute left-[9px] top-[-16px] bottom-[20px] w-[1px] bg-border" />
                                            <div
                                              className={cn(
                                                "mt-1 w-1.5 h-1.5 rounded-full ring-2 mx-auto relative z-10",
                                                isOverdueReturn
                                                  ? "bg-destructive ring-destructive/20"
                                                  : "bg-primary ring-primary/20",
                                              )}
                                            />
                                            <div>
                                              <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                                                Return
                                              </div>
                                              <div className="text-[11px] font-semibold text-foreground mt-1 leading-none">
                                                {format(
                                                  evt.end as Date,
                                                  "MMM d, yyyy • h:mm a",
                                                )}
                                              </div>
                                              {evt.dropoffLocation && (
                                                <div className="text-[10px] font-medium text-muted-foreground mt-1 flex items-center gap-1.5">
                                                  <MapPin className="w-3 h-3 text-muted-foreground/70" />{" "}
                                                  {evt.dropoffLocation}
                                                </div>
                                              )}
                                              {evt.bufferDuration &&
                                                evt.bufferDuration > 0 && (
                                                  <div className="text-[9px] font-medium text-muted-foreground mt-2 flex items-center gap-1 bg-secondary px-1.5 py-0.5 rounded w-fit border border-border">
                                                    <Clock className="w-2.5 h-2.5" />{" "}
                                                    +{evt.bufferDuration / 60}h
                                                    turnaround
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>

                                      {/* --- DRIVER DISPATCH ACCORDION --- */}
                                      {needsDriver && (
                                        <AccordionItem
                                          value="driver"
                                          className="border-b border-border"
                                        >
                                          <AccordionTrigger className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:no-underline hover:bg-secondary transition-colors">
                                            <div className="flex items-center gap-2 text-foreground">
                                              <UserCircle className="w-3 h-3 text-muted-foreground" />{" "}
                                              Assigned Driver
                                              {missingDriverWarning && (
                                                <span className="flex h-2 w-2 rounded-full bg-destructive ml-1"></span>
                                              )}
                                            </div>
                                          </AccordionTrigger>
                                          <AccordionContent className="px-3 py-3 space-y-3 bg-card border-t border-border">
                                            {hasAssignedDriver ? (
                                              <>
                                                <div className="flex items-center gap-2.5 text-[11px]">
                                                  <div className="w-6 h-6 rounded-md bg-secondary border border-border flex items-center justify-center">
                                                    <User className="w-3.5 h-3.5 text-muted-foreground" />
                                                  </div>
                                                  <span className="font-bold text-foreground">
                                                    {evt.driverName}
                                                  </span>
                                                </div>
                                                {evt.driverPhone && (
                                                  <div className="flex items-center gap-2 text-[10px] pl-8">
                                                    <Phone className="w-3 h-3 text-muted-foreground/70" />
                                                    <span className="font-semibold text-muted-foreground">
                                                      {evt.driverPhone}
                                                    </span>
                                                  </div>
                                                )}
                                                <Button
                                                  variant="outline"
                                                  size="sm"
                                                  className="w-full mt-2 h-7 text-[9px] font-bold uppercase tracking-widest bg-card border-border hover:bg-secondary text-foreground"
                                                  onClick={() =>
                                                    onDispatchClick &&
                                                    onDispatchClick(evt)
                                                  }
                                                >
                                                  Change Driver
                                                </Button>
                                              </>
                                            ) : (
                                              <div className="flex flex-col items-center justify-center gap-2 py-2">
                                                <ShieldAlert className="w-5 h-5 text-destructive opacity-50" />
                                                <p className="text-[9px] font-medium text-muted-foreground text-center max-w-[180px]">
                                                  This booking requested a
                                                  driver but none is assigned
                                                  yet.
                                                </p>
                                                <Button
                                                  size="sm"
                                                  className="w-full h-7 text-[9px] font-bold uppercase tracking-widest bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20 mt-1 shadow-none"
                                                  onClick={() =>
                                                    onDispatchClick &&
                                                    onDispatchClick(evt)
                                                  }
                                                >
                                                  Assign Driver Now
                                                </Button>
                                              </div>
                                            )}
                                          </AccordionContent>
                                        </AccordionItem>
                                      )}

                                      <AccordionItem
                                        value="contact"
                                        className="border-b border-border"
                                      >
                                        <AccordionTrigger className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:no-underline hover:bg-secondary transition-colors">
                                          <div className="flex items-center gap-2 text-foreground">
                                            <User className="w-3 h-3 text-muted-foreground" />{" "}
                                            Customer Contact
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-3 py-3 space-y-2 bg-card border-t border-border">
                                          <div className="flex items-center gap-2 text-[10px]">
                                            <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="font-semibold text-foreground">
                                              {evt.customerPhone || "N/A"}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-[10px]">
                                            <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="font-semibold text-foreground truncate">
                                              {evt.customerEmail || "N/A"}
                                            </span>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>

                                      <AccordionItem
                                        value="payment"
                                        className="border-none"
                                      >
                                        <AccordionTrigger className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:no-underline hover:bg-secondary transition-colors">
                                          <div className="flex items-center gap-2 text-foreground">
                                            <CreditCard className="w-3 h-3 text-muted-foreground" />{" "}
                                            Financials
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-3 py-3 bg-card border-t border-border space-y-2.5">
                                          <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                              Total Amount
                                            </span>
                                            <span className="font-black font-mono text-[11px] text-foreground">
                                              ₱
                                              {evt.amount?.toLocaleString() ||
                                                "0.00"}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                              Status
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "text-[8px] font-bold uppercase tracking-widest h-4 px-1.5 rounded",
                                                evt.paymentStatus === "PAID"
                                                  ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10"
                                                  : "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10",
                                              )}
                                            >
                                              {evt.paymentStatus || "PENDING"}
                                            </Badge>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>
                                    </Accordion>

                                    {/* Action Footer inside Popover */}
                                    <div className="p-2.5 bg-secondary/30 border-t border-border flex flex-col gap-1.5">
                                      {/* PENDING STATE -> Routes to details page to handle ledger */}
                                      {evt.status === "PENDING" && (
                                        <Button
                                          size="sm"
                                          className="w-full h-8 text-[9px] font-bold uppercase tracking-widest bg-amber-500 hover:bg-amber-600 text-white rounded-md shadow-none transition-colors"
                                          onClick={() =>
                                            router.push(
                                              `/admin/bookings/${evt.id}`,
                                            )
                                          }
                                        >
                                          <Check className="w-3 h-3 mr-1" />{" "}
                                          Review & Approve
                                        </Button>
                                      )}

                                      {/* CONFIRMED STATE -> Handover Check */}
                                      {evt.status === "CONFIRMED" &&
                                        !isLateArrival && (
                                          <Button
                                            size="sm"
                                            className="w-full h-8 text-[9px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow-none transition-opacity"
                                            onClick={() =>
                                              onReleaseClick?.(evt)
                                            }
                                          >
                                            Release Vehicle{" "}
                                            <MoveRight className="w-3 h-3 ml-1.5" />
                                          </Button>
                                        )}

                                      {/* LATE ARRIVAL -> Handover or No-Show */}
                                      {evt.status === "CONFIRMED" &&
                                        isLateArrival && (
                                          <div className="flex gap-1.5 w-full">
                                            <Button
                                              size="sm"
                                              className="flex-1 h-8 text-[9px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 rounded-md shadow-none transition-opacity"
                                              onClick={() =>
                                                onReleaseClick?.(evt)
                                              }
                                            >
                                              <Key className="w-3 h-3 mr-1" />{" "}
                                              Arrived
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="outline"
                                              className="flex-1 h-8 text-[9px] font-bold uppercase tracking-widest text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 rounded-md shadow-none bg-card transition-colors"
                                              onClick={() =>
                                                onNoShowClick?.(evt)
                                              }
                                            >
                                              <UserX className="w-3 h-3 mr-1" />{" "}
                                              No-Show
                                            </Button>
                                          </div>
                                        )}

                                      {/* ONGOING STATE -> Return Check */}
                                      {evt.status === "ONGOING" && (
                                        <Button
                                          size="sm"
                                          className="w-full h-8 text-[9px] font-bold uppercase tracking-widest bg-emerald-600 text-white hover:bg-emerald-700 rounded-md shadow-none transition-opacity"
                                          onClick={() => onReturnClick?.(evt)}
                                        >
                                          <Flag className="w-3 h-3 mr-1.5" />{" "}
                                          Process Return
                                        </Button>
                                      )}

                                      {/* COMPLETED STATE */}
                                      {evt.status === "COMPLETED" && (
                                        <div className="w-full text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground py-1.5 flex items-center justify-center bg-secondary/50 rounded border border-border">
                                          <CheckCircle className="w-3 h-3 mr-1.5 text-muted-foreground/70" />{" "}
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
