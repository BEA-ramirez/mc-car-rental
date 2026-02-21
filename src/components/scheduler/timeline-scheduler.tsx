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
  Ban,
  GripVertical,
  ShieldAlert,
  Key,
  Flag,
  UserX,
  UserCircle, // NEW: For Driver details
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
  start: Date;
  end: Date;
  title: string;
  subtitle?: string;
  color?: string;
  status?:
    | "confirmed"
    | "pending"
    | "maintenance"
    | "displaced"
    | "ongoing"
    | "completed"
    | "no_show"
    | "cancelled";
  bufferDuration?: number; // In Minutes
  paymentStatus?: "Paid" | "Pending" | "Partial" | "Unpaid";
  amount?: number;
  customerPhone?: string;
  customerEmail?: string;
  pickupLocation?: string;
  dropoffLocation?: string;
  // NEW: Driver Info
  withDriver?: boolean;
  driverName?: string;
  driverPhone?: string;
};

type TimelineSchedulerProps = {
  resources: SchedulerResource[];
  events: SchedulerEvent[];
  ghostBooking?: SchedulerEvent | null;
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
  isOverrideMode?: boolean;
};

// --- CONFIG ---
const CELL_WIDTH_HOUR = 80;
const CELL_WIDTH_MONTH = 60;
const SIDEBAR_WIDTH = 240;

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
  events,
  ghostBooking,
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
  isOverrideMode = false,
}: TimelineSchedulerProps) {
  const [view, setView] = useState<ViewType>("day");
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- HYDRATION FIX: Prevent rendering dynamic time elements on server ---
  const [isMounted, setIsMounted] = useState(false);
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    setIsMounted(true);
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

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
    if (view === "day") setCurrentDate(addDays(currentDate, modifier));
    if (view === "week") setCurrentDate(addWeeks(currentDate, modifier));
    if (view === "month") setCurrentDate(addMonths(currentDate, modifier));
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
    setResizePreviewEnd(event.end);
    setResizePreviewBuffer(event.bufferDuration || 0);
    dragStartX.current = e.clientX;
    originalEndRef.current = event.end;
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
          if (resizePreviewEnd.getTime() !== evt.end.getTime())
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
        if (onTimeRangeSelect && startMins !== endMins) {
          onTimeRangeSelect(resourceId, startDate, endDate);
        }
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
          evt.end > timelineStart &&
          evt.start < timelineEnd &&
          evt.status !== "no_show" &&
          evt.status !== "cancelled",
      );
      if (filterMode === "booked") return hasBooking;
      if (filterMode === "available") return !hasBooking;
      return true;
    });
  }, [resources, events, searchQuery, filterMode, timelineStart, timelineEnd]);

  const getEventStyle = (event: SchedulerEvent, overrideEnd?: Date) => {
    const start = event.start;
    const end = overrideEnd || event.end;
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
    const bufferStart = overrideEnd || event.end;
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

  return (
    <div className="flex flex-col h-full bg-white shadow-sm overflow-hidden">
      {/* TOOLBAR */}
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

      {/* GRID AREA */}
      <div className="flex-1 overflow-auto relative bg-slate-50/50">
        <div className="relative min-w-max">
          {/* STICKY HEADER */}
          <div className="sticky top-0 z-30 bg-white border-b shadow-sm flex h-14">
            <div
              className="sticky left-0 top-0 z-40 bg-slate-100 border-r border-b h-14 flex items-center px-4 font-bold text-xs text-slate-500 uppercase tracking-wider shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]"
              style={{ width: `${SIDEBAR_WIDTH}px` }}
            >
              Resources ({filteredResources.length})
            </div>
            <div className="flex flex-col">
              <div className="flex h-7 bg-slate-50 border-b">
                {mainHeaders.map((h: MainHeader, i: number) => (
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
                {subHeaders.map((h: SubHeader, i: number) => (
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

          {/* GLOBAL CURRENT TIME LINE (RED LINE) */}
          {nowOffset >= 0 && nowOffset <= totalWidth && (
            <div
              className="absolute top-14 bottom-0 w-[2px] bg-red-500 z-20 pointer-events-none"
              style={{ left: `${SIDEBAR_WIDTH + nowOffset}px` }}
            >
              <div className="absolute top-0 -left-1.5 w-3.5 h-3.5 bg-red-500 rounded-full shadow-md flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>
          )}

          {/* RESOURCE ROWS */}
          <div>
            {filteredResources.map((res) => {
              const isGhostHere =
                ghostBooking && ghostBooking.resourceId === res.id;

              const hasConflict =
                isGhostHere &&
                events.some((e) => {
                  if (
                    e.resourceId !== res.id ||
                    e.status === "no_show" ||
                    e.status === "cancelled"
                  )
                    return false;
                  if (
                    e.status !== "confirmed" &&
                    e.status !== "maintenance" &&
                    e.status !== "ongoing"
                  )
                    return false;
                  const eEndWithBuffer = addMinutes(
                    e.end,
                    e.bufferDuration || 0,
                  );
                  const ghostEndWithBuffer = addMinutes(
                    ghostBooking.end,
                    ghostBooking.bufferDuration || 0,
                  );
                  return (
                    ghostBooking.start < eEndWithBuffer &&
                    ghostEndWithBuffer > e.start
                  );
                });

              let ghostStyleClass =
                "bg-emerald-100/80 border-emerald-500 text-emerald-900";
              let ghostLabel = "PROPOSAL";
              let ghostIcon = <CheckCircle className="w-3 h-3" />;

              if (hasConflict) {
                if (isOverrideMode) {
                  ghostStyleClass =
                    "bg-amber-100/90 border-amber-600 text-amber-900 ring-2 ring-amber-500";
                  ghostLabel = "FORCE OVERRIDE";
                  ghostIcon = <ShieldAlert className="w-3 h-3" />;
                } else {
                  ghostStyleClass = "bg-red-100/80 border-red-500 text-red-900";
                  ghostLabel = "CONFLICT";
                  ghostIcon = <AlertCircle className="w-3 h-3" />;
                }
              }

              const ghostStyle =
                isGhostHere && ghostBooking
                  ? getEventStyle(ghostBooking)
                  : undefined;

              return (
                <div
                  key={res.id}
                  className="flex group hover:bg-slate-100/50 transition-colors h-[72px] border-b bg-white relative"
                >
                  {/* Sidebar Cell */}
                  <div
                    className="sticky left-0 z-30 bg-white group-hover:bg-slate-50 border-r flex items-center px-4 gap-3 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]"
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
                    </div>
                  </div>

                  <div
                    className="relative flex-1"
                    style={{ width: `${totalWidth}px` }}
                  >
                    {/* Track Background & Interactions */}
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
                            if (ghostBooking && onGhostMove) {
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
                                    ? "border-slate-300"
                                    : "border-slate-100",
                                )}
                                style={{ width: `${h.width}px` }}
                              />
                            ))}
                          </div>
                        </div>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-56 rounded-none shadow-md border-slate-200">
                        <ContextMenuLabel className="text-xs">
                          Slot Actions
                        </ContextMenuLabel>
                        <ContextMenuItem
                          className="text-xs"
                          onClick={() =>
                            onAddMaintenance &&
                            clickedTimeRef.current &&
                            onAddMaintenance(res.id, clickedTimeRef.current)
                          }
                        >
                          <Wrench className="w-3 h-3 mr-2" /> Block for
                          Maintenance
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>

                    {/* Drag-to-Create Preview */}
                    {creationState?.isDragging &&
                      creationState.resourceId === res.id && (
                        <div
                          className="absolute top-3 bottom-3 bg-blue-100/60 border-2 border-blue-500 border-dashed rounded-md z-40 flex items-center justify-center pointer-events-none overflow-hidden"
                          style={{
                            left: `${Math.min(creationState.startX, creationState.currentX)}px`,
                            width: `${Math.abs(creationState.currentX - creationState.startX)}px`,
                          }}
                        >
                          {Math.abs(
                            creationState.currentX - creationState.startX,
                          ) > 60 && (
                            <div className="bg-white/90 px-1.5 py-0.5 rounded shadow-sm text-blue-700 font-bold text-[10px] whitespace-nowrap">
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

                    {/* Ghost Element */}
                    {isGhostHere && ghostStyle && ghostBooking && (
                      <div
                        className={cn(
                          "absolute top-3 bottom-3 rounded-md border-2 border-dashed px-2 text-xs shadow-lg z-50 flex flex-col justify-center animate-pulse pointer-events-none",
                          ghostStyleClass,
                        )}
                        style={ghostStyle}
                      >
                        <div className="font-bold flex items-center gap-1">
                          {ghostIcon}
                          {ghostLabel}
                        </div>
                        <div className="text-[10px] font-medium opacity-90 truncate">
                          {ghostBooking.title}
                        </div>
                      </div>
                    )}

                    {/* EVENTS LOOP */}
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
                            : evt.end;
                        const displayBuffer =
                          isResizing &&
                          resizeMode === "buffer" &&
                          resizePreviewBuffer !== null
                            ? resizePreviewBuffer
                            : evt.bufferDuration;
                        const style = getEventStyle(evt, displayEnd);

                        if (
                          displayEnd < timelineStart ||
                          evt.start > timelineEnd
                        )
                          return null;

                        const isMaintenance = evt.status === "maintenance";
                        const isDisplaced = evt.status === "displaced";
                        const isOngoing = evt.status === "ongoing";
                        const isCompleted = evt.status === "completed";

                        const isLate =
                          evt.status === "confirmed" && now > evt.start;

                        let isOverlappingOther = false;
                        if (!isResizing && !isCompleted) {
                          isOverlappingOther = events.some(
                            (other) =>
                              other.id !== evt.id &&
                              other.resourceId === evt.resourceId &&
                              other.status !== "displaced" &&
                              other.status !== "cancelled" &&
                              other.status !== "no_show" &&
                              other.start <
                                addMinutes(displayEnd, displayBuffer || 0) &&
                              addMinutes(other.end, other.bufferDuration || 0) >
                                evt.start,
                          );
                        }

                        let eventColorClass =
                          "bg-blue-100 border-blue-200 text-blue-800";
                        if (isMaintenance) {
                          eventColorClass =
                            "bg-slate-100 border-slate-300 text-slate-500 bg-[linear-gradient(45deg,rgba(0,0,0,0.02)_25%,transparent_25%,transparent_50%,rgba(0,0,0,0.02)_50%,rgba(0,0,0,0.02)_75%,transparent_75%,transparent)] bg-[length:10px_10px]";
                        } else if (isDisplaced || isOverlappingOther) {
                          eventColorClass =
                            "bg-red-600 border-red-700 text-white shadow-md animate-pulse";
                        } else if (isCompleted) {
                          eventColorClass =
                            "bg-slate-200 border-slate-300 text-slate-500 opacity-80";
                        } else if (isOngoing) {
                          eventColorClass =
                            "bg-emerald-500 border-emerald-600 text-white shadow-sm";
                        } else if (isLate) {
                          eventColorClass =
                            "bg-orange-100 border-orange-500 text-orange-900 shadow-md animate-pulse";
                        } else if (evt.status === "confirmed") {
                          eventColorClass =
                            "bg-emerald-100 border-emerald-300 text-emerald-900";
                        } else if (evt.status === "pending") {
                          eventColorClass =
                            "bg-amber-100 border-amber-300 text-amber-900";
                        }

                        if (isResizing) {
                          const newBufferEnd = addMinutes(
                            displayEnd,
                            displayBuffer || 0,
                          );
                          const isResizeConflict = events.some(
                            (other) =>
                              other.id !== evt.id &&
                              other.resourceId === evt.resourceId &&
                              (other.status === "confirmed" ||
                                other.status === "maintenance") &&
                              other.start < newBufferEnd &&
                              addMinutes(other.end, other.bufferDuration || 0) >
                                evt.start,
                          );
                          if (isResizeConflict)
                            eventColorClass =
                              "bg-red-100 border-red-500 text-red-900 ring-2 ring-red-500 z-50 opacity-95";
                        }

                        const textColorClass =
                          isOngoing || isDisplaced || isOverlappingOther
                            ? "text-white"
                            : "text-slate-900";
                        const subtextColorClass =
                          isOngoing || isDisplaced || isOverlappingOther
                            ? "text-white/80"
                            : "opacity-80";

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
                                  className="absolute top-3 bottom-3 z-0 bg-slate-100 border border-slate-300/50 border-l-0 flex items-center justify-center opacity-80 group/buffer"
                                  style={{
                                    ...getBufferStyle(
                                      evt,
                                      displayEnd,
                                      displayBuffer,
                                    ),
                                    height: undefined,
                                    backgroundImage:
                                      "repeating-linear-gradient(45deg, transparent, transparent 5px, #cbd5e1 5px, #cbd5e1 10px)",
                                  }}
                                  title={`Turnaround: ${displayBuffer / 60}h`}
                                >
                                  <div
                                    className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center hover:bg-black/10 transition-colors z-20 opacity-0 group-hover/buffer:opacity-100"
                                    onMouseDown={(e) =>
                                      handleResizeStart(e, evt, "buffer")
                                    }
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <div className="w-0.5 h-3 bg-slate-500 rounded-full" />
                                  </div>
                                </div>
                              )}

                            {/* --- MAIN BOOKING BAR --- */}
                            <Popover
                              open={openEventId === evt.id}
                              onOpenChange={(isOpen) =>
                                !isResizing &&
                                setOpenEventId(isOpen ? evt.id : null)
                              }
                            >
                              <ContextMenu>
                                <ContextMenuTrigger asChild>
                                  <PopoverTrigger asChild>
                                    <div
                                      className={cn(
                                        "absolute top-3 bottom-3 rounded-md border px-2 text-xs shadow-sm cursor-pointer hover:shadow-md transition-all z-10 overflow-hidden flex flex-col justify-center group/event",
                                        eventColorClass,
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
                                            addMinutes(evt.start, roundedMins),
                                          );
                                          return;
                                        }
                                      }}
                                    >
                                      <div
                                        className={cn(
                                          "font-bold truncate leading-tight flex justify-between items-center w-full",
                                          textColorClass,
                                        )}
                                      >
                                        <span className="truncate flex items-center gap-1">
                                          {isDisplaced && (
                                            <AlertCircle className="w-3 h-3 text-white" />
                                          )}
                                          {isLate && (
                                            <AlertCircle className="w-3 h-3 text-orange-600" />
                                          )}
                                          {isMaintenance && (
                                            <Wrench className="w-3 h-3" />
                                          )}
                                          {evt.title}
                                        </span>
                                      </div>

                                      {evt.subtitle && !isMaintenance && (
                                        <div
                                          className={cn(
                                            "text-[10px] truncate font-medium tracking-wide",
                                            subtextColorClass,
                                          )}
                                        >
                                          {isDisplaced
                                            ? "DISPLACED - ACTION NEEDED"
                                            : isLate
                                              ? "LATE: CUSTOMER MISSING"
                                              : evt.subtitle}
                                        </div>
                                      )}

                                      {!isCompleted && (
                                        <div
                                          className="absolute right-0 top-0 bottom-0 w-3 cursor-col-resize flex items-center justify-center hover:bg-black/5 transition-colors z-20 opacity-0 group-hover/event:opacity-100"
                                          onMouseDown={(e) =>
                                            handleResizeStart(e, evt, "event")
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div
                                            className={cn(
                                              "w-0.5 h-3 rounded-full",
                                              isOngoing || isDisplaced
                                                ? "bg-white/50"
                                                : "bg-slate-400",
                                            )}
                                          />
                                        </div>
                                      )}
                                    </div>
                                  </PopoverTrigger>
                                </ContextMenuTrigger>

                                <ContextMenuContent className="w-48 rounded-none text-xs shadow-md border-slate-200">
                                  {isMaintenance ? (
                                    <ContextMenuItem
                                      className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                                      onClick={() =>
                                        onDeleteClick && onDeleteClick(evt)
                                      }
                                    >
                                      <Trash className="w-3 h-3 mr-2" /> Delete
                                      Block
                                    </ContextMenuItem>
                                  ) : (
                                    <>
                                      <ContextMenuLabel className="text-xs">
                                        Booking Actions
                                      </ContextMenuLabel>
                                      <ContextMenuItem
                                        className="text-xs"
                                        onClick={() =>
                                          onEditClick && onEditClick(evt)
                                        }
                                      >
                                        <Edit className="w-3 h-3 mr-2" /> Edit
                                        Booking
                                      </ContextMenuItem>
                                      <ContextMenuItem
                                        className="text-xs"
                                        onClick={() =>
                                          navigator.clipboard.writeText(evt.id)
                                        }
                                      >
                                        <Copy className="w-3 h-3 mr-2" /> Copy
                                        ID
                                      </ContextMenuItem>
                                      <ContextMenuSeparator />
                                      <ContextMenuSub>
                                        <ContextMenuSubTrigger className="text-xs">
                                          <CheckSquare className="w-3 h-3 mr-2" />{" "}
                                          Force Status Change
                                        </ContextMenuSubTrigger>
                                        <ContextMenuSubContent className="w-40 rounded-none text-xs shadow-md border-slate-200">
                                          <ContextMenuItem
                                            className="text-xs"
                                            onClick={() =>
                                              onStatusChange &&
                                              onStatusChange(evt, "confirmed")
                                            }
                                          >
                                            Set Confirmed
                                          </ContextMenuItem>
                                          <ContextMenuItem
                                            className="text-xs"
                                            onClick={() =>
                                              onStatusChange &&
                                              onStatusChange(evt, "ongoing")
                                            }
                                          >
                                            Set Ongoing
                                          </ContextMenuItem>
                                          <ContextMenuItem
                                            className="text-xs"
                                            onClick={() =>
                                              onStatusChange &&
                                              onStatusChange(evt, "completed")
                                            }
                                          >
                                            Set Completed
                                          </ContextMenuItem>
                                          <ContextMenuSeparator />
                                          <ContextMenuItem
                                            className="text-xs text-red-600"
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
                                        className="text-xs text-red-600 focus:text-red-600 focus:bg-red-50"
                                        onClick={() =>
                                          onDeleteClick && onDeleteClick(evt)
                                        }
                                      >
                                        <Trash className="w-3 h-3 mr-2" />{" "}
                                        Delete Booking
                                      </ContextMenuItem>
                                    </>
                                  )}
                                </ContextMenuContent>
                              </ContextMenu>

                              {/* --- SLEEK POPOVER --- */}
                              <PopoverContent
                                className="w-80 p-0 shadow-xl border-slate-200 rounded-lg overflow-hidden"
                                align="start"
                              >
                                {isMaintenance ? (
                                  <div className="p-4 bg-slate-50 text-center">
                                    <Wrench className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                                    <div className="font-bold text-slate-700">
                                      Maintenance Block
                                    </div>
                                    <div className="text-xs text-slate-500 mt-1">
                                      {format(evt.start, "MMM d, h:mm a")} -{" "}
                                      {format(evt.end, "h:mm a")}
                                    </div>
                                  </div>
                                ) : (
                                  <>
                                    {/* HEADER */}
                                    <div className="p-4 bg-white border-b">
                                      <div className="flex items-center justify-between mb-2">
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "uppercase text-[10px] tracking-wider border",
                                            evt.status === "confirmed" &&
                                              !isLate &&
                                              "bg-emerald-50 text-emerald-700 border-emerald-200",
                                            evt.status === "ongoing" &&
                                              "bg-blue-50 text-blue-700 border-blue-200",
                                            isLate &&
                                              "bg-orange-50 text-orange-700 border-orange-300",
                                          )}
                                        >
                                          {isLate
                                            ? "LATE"
                                            : evt.status || "BOOKING"}
                                        </Badge>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                                          onClick={() =>
                                            onEditClick && onEditClick(evt)
                                          }
                                        >
                                          <Edit className="h-3.5 w-3.5" />
                                        </Button>
                                      </div>
                                      <div className="font-bold text-base text-slate-800 leading-tight">
                                        {evt.title}
                                      </div>
                                      <div className="text-[10px] text-slate-400 mt-0.5 font-mono">
                                        ID: {evt.id}
                                      </div>
                                    </div>

                                    {/* ACCORDIONS */}
                                    <Accordion
                                      type="multiple"
                                      className="w-full bg-slate-50/50"
                                      defaultValue={["schedule"]}
                                    >
                                      <AccordionItem
                                        value="schedule"
                                        className="border-b-slate-100"
                                      >
                                        <AccordionTrigger className="px-4 py-2.5 text-xs font-semibold hover:no-underline hover:bg-slate-50">
                                          <div className="flex items-center gap-2 text-slate-700">
                                            <CalendarIcon className="w-3.5 h-3.5" />{" "}
                                            Trip Schedule
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 py-3 space-y-3 bg-white border-t border-slate-100">
                                          <div className="grid grid-cols-[20px_1fr] items-start gap-1">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                                            <div>
                                              <div className="text-xs font-semibold text-slate-800">
                                                Pick-up
                                              </div>
                                              <div className="text-[10px] text-slate-500">
                                                {format(
                                                  evt.start,
                                                  "MMM d, yyyy • h:mm a",
                                                )}
                                              </div>
                                              {evt.pickupLocation && (
                                                <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                                                  <MapPin className="w-3 h-3 text-slate-400" />{" "}
                                                  {evt.pickupLocation}
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                          <div className="grid grid-cols-[20px_1fr] items-start gap-1">
                                            <div className="mt-1 w-1.5 h-1.5 rounded-full bg-slate-300" />
                                            <div>
                                              <div className="text-xs font-semibold text-slate-800">
                                                Return
                                              </div>
                                              <div className="text-[10px] text-slate-500">
                                                {format(
                                                  evt.end,
                                                  "MMM d, yyyy • h:mm a",
                                                )}
                                              </div>
                                              {evt.dropoffLocation && (
                                                <div className="text-[10px] text-slate-600 mt-0.5 flex items-center gap-1">
                                                  <MapPin className="w-3 h-3 text-slate-400" />{" "}
                                                  {evt.dropoffLocation}
                                                </div>
                                              )}
                                              {evt.bufferDuration &&
                                                evt.bufferDuration > 0 && (
                                                  <div className="text-[10px] text-slate-400 mt-1 italic">
                                                    + {evt.bufferDuration / 60}h
                                                    turnaround
                                                  </div>
                                                )}
                                            </div>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>

                                      {/* OPTIONAL DRIVER */}
                                      {evt.withDriver && (
                                        <AccordionItem
                                          value="driver"
                                          className="border-b-slate-100"
                                        >
                                          <AccordionTrigger className="px-4 py-2.5 text-xs font-semibold hover:no-underline hover:bg-slate-50">
                                            <div className="flex items-center gap-2 text-slate-700">
                                              <UserCircle className="w-3.5 h-3.5" />{" "}
                                              Assigned Driver
                                            </div>
                                          </AccordionTrigger>
                                          <AccordionContent className="px-4 py-3 space-y-2 bg-white border-t border-slate-100">
                                            <div className="flex items-center gap-2 text-xs">
                                              <User className="w-3.5 h-3.5 text-slate-400" />
                                              <span className="font-medium text-slate-700">
                                                {evt.driverName ||
                                                  "Pending Assignment"}
                                              </span>
                                            </div>
                                            {evt.driverPhone && (
                                              <div className="flex items-center gap-2 text-xs">
                                                <Phone className="w-3.5 h-3.5 text-slate-400" />
                                                <span className="text-slate-600">
                                                  {evt.driverPhone}
                                                </span>
                                              </div>
                                            )}
                                          </AccordionContent>
                                        </AccordionItem>
                                      )}

                                      <AccordionItem
                                        value="contact"
                                        className="border-b-slate-100"
                                      >
                                        <AccordionTrigger className="px-4 py-2.5 text-xs font-semibold hover:no-underline hover:bg-slate-50">
                                          <div className="flex items-center gap-2 text-slate-700">
                                            <User className="w-3.5 h-3.5" />{" "}
                                            Customer Info
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 py-3 space-y-2 bg-white border-t border-slate-100">
                                          <div className="flex items-center gap-2 text-xs">
                                            <Phone className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-600">
                                              {evt.customerPhone ||
                                                "No phone provided"}
                                            </span>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs">
                                            <Mail className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-slate-600 truncate">
                                              {evt.customerEmail ||
                                                "No email provided"}
                                            </span>
                                          </div>
                                        </AccordionContent>
                                      </AccordionItem>

                                      <AccordionItem
                                        value="payment"
                                        className="border-none"
                                      >
                                        <AccordionTrigger className="px-4 py-2.5 text-xs font-semibold hover:no-underline hover:bg-slate-50">
                                          <div className="flex items-center gap-2 text-slate-700">
                                            <CreditCard className="w-3.5 h-3.5" />{" "}
                                            Payment
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="px-4 py-3 bg-white border-t border-slate-100">
                                          <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs text-slate-500">
                                              Total
                                            </span>
                                            <span className="font-bold text-sm text-slate-800">
                                              ₱{" "}
                                              {evt.amount?.toLocaleString() ||
                                                "0.00"}
                                            </span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                            <span className="text-xs text-slate-500">
                                              Status
                                            </span>
                                            <Badge
                                              variant="outline"
                                              className={cn(
                                                "text-[10px] h-5 px-2",
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

                                    {/* --- QUICK ACTIONS BAR --- */}
                                    <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                                      {evt.status === "confirmed" &&
                                        !isLate && (
                                          <Button
                                            size="sm"
                                            className="w-full h-8 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                                            onClick={() =>
                                              onStatusChange?.(evt, "ongoing")
                                            }
                                          >
                                            <Key className="w-3.5 h-3.5 mr-2" />{" "}
                                            Release Vehicle
                                          </Button>
                                        )}

                                      {evt.status === "confirmed" && isLate && (
                                        <>
                                          <Button
                                            size="sm"
                                            className="flex-1 h-8 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                                            onClick={() =>
                                              onStatusChange?.(evt, "ongoing")
                                            }
                                          >
                                            <Key className="w-3.5 h-3.5 mr-1.5" />{" "}
                                            Arrived
                                          </Button>
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-1 h-8 text-xs font-medium text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300 shadow-sm"
                                            onClick={() =>
                                              onStatusChange?.(evt, "no_show")
                                            }
                                          >
                                            <UserX className="w-3.5 h-3.5 mr-1.5" />{" "}
                                            No-Show
                                          </Button>
                                        </>
                                      )}

                                      {evt.status === "ongoing" && (
                                        <Button
                                          size="sm"
                                          className="w-full h-8 text-xs font-medium bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
                                          onClick={() =>
                                            onStatusChange?.(evt, "completed")
                                          }
                                        >
                                          <Flag className="w-3.5 h-3.5 mr-2" />{" "}
                                          Process Return
                                        </Button>
                                      )}

                                      {evt.status === "completed" && (
                                        <div className="w-full text-center text-[11px] font-medium text-slate-400 py-1.5 flex items-center justify-center bg-slate-50 rounded-md border border-slate-100">
                                          <CheckCircle className="w-3.5 h-3.5 mr-1.5 opacity-50" />{" "}
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
