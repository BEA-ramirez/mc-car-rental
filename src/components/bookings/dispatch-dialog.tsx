"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, isAfter, addHours, differenceInHours } from "date-fns";
import {
  Calendar,
  UserCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ChevronsUpDown,
  Check,
  Loader2,
  CarFront,
  SplitSquareHorizontal,
  RotateCcw,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

import { useDriverDispatch } from "../../../hooks/use-drivers";
import { SchedulerEvent } from "../scheduler/timeline-scheduler";

interface DispatchEvent extends SchedulerEvent {
  assignments?: any[];
}

interface ShiftSegment {
  id: string;
  start: Date;
  end: Date;
  driverId: string | null;
}

export default function DispatchDialog({
  open,
  onOpenChange,
  booking,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking: DispatchEvent | null;
}) {
  const bookingStart = useMemo(
    () => (booking ? new Date(booking.start) : new Date()),
    [booking],
  );
  const bookingEnd = useMemo(
    () => (booking ? new Date(booking.end) : new Date()),
    [booking],
  );

  const totalBookingHours = useMemo(() => {
    return Math.abs(differenceInHours(bookingEnd, bookingStart));
  }, [bookingStart, bookingEnd]);

  const [segments, setSegments] = useState<ShiftSegment[]>([]);
  const [comboboxOpen, setComboboxOpen] = useState<Record<string, boolean>>({});

  const {
    availableDrivers,
    isLoadingAvailability,
    saveDispatchPlan,
    isSavingDispatch,
  } = useDriverDispatch(
    open ? bookingStart : undefined,
    open ? bookingEnd : undefined,
  );

  useEffect(() => {
    if (open && booking) {
      if (booking.assignments && booking.assignments.length > 0) {
        setSegments(
          booking.assignments.map((a, i) => ({
            id: `seg-${Date.now()}-${i}`,
            start: new Date(a.shift_start),
            end: new Date(a.shift_end),
            driverId: a.driver_id,
          })),
        );
      } else {
        setSegments([
          {
            id: `seg-${Date.now()}`,
            start: bookingStart,
            end: bookingEnd,
            driverId: null,
          },
        ]);
      }
    }
  }, [open, booking, bookingStart, bookingEnd]);

  const coverageStatus = useMemo(() => {
    let coveredHours = 0;
    let allAssigned = true;

    segments.forEach((seg) => {
      const segHours = differenceInHours(seg.end, seg.start);
      if (segHours > 0) coveredHours += segHours;
      if (!seg.driverId) allAssigned = false;
    });

    const hasGaps = coveredHours < totalBookingHours;
    const isOverbooked = coveredHours > totalBookingHours;

    return {
      coveredHours,
      hasGaps,
      isOverbooked,
      allAssigned,
      percentage: Math.min((coveredHours / totalBookingHours) * 100, 100),
    };
  }, [segments, totalBookingHours]);

  const handleAutoSplit = () => {
    const newSegments: ShiftSegment[] = [];
    let currentStart = new Date(bookingStart);
    let index = 0;

    while (currentStart < bookingEnd && index < 20) {
      let currentEnd = addHours(currentStart, 12);
      if (currentEnd > bookingEnd) currentEnd = bookingEnd;

      newSegments.push({
        id: `seg-${Date.now()}-${index}`,
        start: currentStart,
        end: currentEnd,
        driverId: null,
      });

      currentStart = currentEnd;
      index++;
    }
    setSegments(newSegments);
    toast.success(`Booking split into ${newSegments.length} shifts.`);
  };

  // THE FIX: Chunks the booking into exact 24-hour daily shifts
  const handleDailySplit = () => {
    const newSegments: ShiftSegment[] = [];
    let currentStart = new Date(bookingStart);
    let index = 0;

    while (currentStart < bookingEnd && index < 20) {
      let currentEnd = addHours(currentStart, 24);
      if (currentEnd > bookingEnd) currentEnd = bookingEnd;

      newSegments.push({
        id: `seg-${Date.now()}-${index}`,
        start: currentStart,
        end: currentEnd,
        driverId: null,
      });

      currentStart = currentEnd;
      index++;
    }
    setSegments(newSegments);
    toast.success(`Booking split into ${newSegments.length} daily shifts.`);
  };

  const handleAddCustomSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart =
      lastSeg && lastSeg.end < bookingEnd ? lastSeg.end : bookingStart;
    let newEnd = addHours(newStart, 12);
    if (isAfter(newEnd, bookingEnd)) newEnd = bookingEnd;

    setSegments([
      ...segments,
      { id: `seg-${Date.now()}`, start: newStart, end: newEnd, driverId: null },
    ]);
  };

  const handleRemoveSegment = (id: string) => {
    setSegments(segments.filter((s) => s.id !== id));
  };

  const updateSegment = (id: string, field: keyof ShiftSegment, value: any) => {
    setSegments(
      segments.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const formatForInput = (date: Date) => format(date, "yyyy-MM-dd'T'HH:mm");
  const parseFromInput = (value: string, fallback: Date) => {
    const parsed = new Date(value);
    return isNaN(parsed.getTime()) ? fallback : parsed;
  };

  const checkDriverConflict = (driver: any, segStart: Date, segEnd: Date) => {
    if (!driver.conflicts || driver.conflicts.length === 0) return false;
    return driver.conflicts.some((c: any) => {
      const cStart = new Date(c.start);
      const cEnd = new Date(c.end);
      if (booking && c.bookingId === booking.id) return false;
      return segStart < cEnd && segEnd > cStart;
    });
  };

  const handleConfirmSave = async () => {
    if (!booking) return;

    const validSegments = segments
      .filter((s) => s.driverId !== null)
      .map((s) => ({
        driverId: s.driverId as string,
        start: s.start,
        end: s.end,
      }));

    try {
      await saveDispatchPlan({
        bookingId: booking.id,
        segments: validSegments,
      });
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.message || "Failed to save driver dispatch plan.");
    }
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 rounded-xl overflow-hidden bg-background border-border shadow-2xl transition-colors duration-300">
        {/* --- HEADER --- */}
        <div className="px-5 py-4 bg-card border-b border-border flex items-start justify-between shadow-sm z-10 relative transition-colors">
          <div>
            <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <CarFront className="w-4 h-4 text-primary" />
              Dispatch Configuration
            </DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-muted-foreground mt-1">
              Assign drivers to fulfill{" "}
              <span className="font-mono font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded border border-border">
                {booking.id.split("-")[0].toUpperCase()}
              </span>
            </DialogDescription>
          </div>
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
              Total Duration
            </span>
            <span className="text-[11px] font-bold text-foreground bg-secondary px-2.5 py-1 rounded-md border border-border shadow-sm">
              {totalBookingHours} Hours
            </span>
            <span className="text-[8px] text-muted-foreground font-mono mt-1.5">
              DB: {format(bookingStart, "MM/dd HH:mm")} to{" "}
              {format(bookingEnd, "MM/dd HH:mm")}
            </span>
          </div>
        </div>

        {/* --- SMART TOOLBAR & COVERAGE --- */}
        <div className="px-5 py-3 bg-secondary/50 border-b border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-colors">
          <div className="flex items-center gap-2">
            {coverageStatus.hasGaps ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : coverageStatus.isOverbooked ? (
              <AlertTriangle className="w-4 h-4 text-destructive" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            <span
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest",
                coverageStatus.hasGaps
                  ? "text-amber-600 dark:text-amber-500"
                  : coverageStatus.isOverbooked
                    ? "text-destructive"
                    : "text-foreground",
              )}
            >
              Covered: {coverageStatus.coveredHours} / {totalBookingHours} Hrs
            </span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDailySplit}
              className="flex-1 sm:flex-none h-7 text-[9px] font-bold uppercase tracking-widest bg-background shadow-none"
            >
              <RotateCcw className="w-3 h-3 mr-1.5" /> Split 24h
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAutoSplit}
              className="flex-1 sm:flex-none h-7 text-[9px] font-bold uppercase tracking-widest bg-background shadow-none border-primary/50 text-primary hover:bg-primary/10"
            >
              <SplitSquareHorizontal className="w-3 h-3 mr-1.5" /> Split 12h
            </Button>
          </div>
        </div>

        {/* --- SEGMENTS LIST --- */}
        <ScrollArea className="max-h-[50vh] p-4 md:p-5 bg-background custom-scrollbar">
          <div className="space-y-4">
            {segments.map((seg, index) => {
              const segHours = differenceInHours(seg.end, seg.start);

              return (
                <div
                  key={seg.id}
                  className={cn(
                    "bg-card border rounded-xl shadow-sm flex flex-col relative overflow-hidden transition-colors",
                    !seg.driverId ? "border-amber-500/30" : "border-border",
                  )}
                >
                  {/* Segment Header */}
                  <div
                    className={cn(
                      "px-4 py-2 flex items-center justify-between border-b",
                      !seg.driverId
                        ? "bg-amber-500/10 border-amber-500/20"
                        : "bg-secondary/30 border-border",
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Shift Segment {index + 1}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[8px] h-4 px-1.5 bg-background shadow-none rounded font-mono"
                      >
                        {segHours}h
                      </Badge>
                    </div>
                    {segments.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveSegment(seg.id)}
                        className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    )}
                  </div>

                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* NATIVE DATETIME PICKERS */}
                    <div className="space-y-3 border-r border-border pr-5">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          Segment Start
                        </label>
                        <input
                          type="datetime-local"
                          value={formatForInput(seg.start)}
                          onChange={(e) =>
                            updateSegment(
                              seg.id,
                              "start",
                              parseFromInput(e.target.value, seg.start),
                            )
                          }
                          className="flex h-8 w-full rounded-lg border border-border bg-secondary px-3 py-1 text-[11px] font-semibold shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          Segment End
                        </label>
                        <input
                          type="datetime-local"
                          value={formatForInput(seg.end)}
                          onChange={(e) =>
                            updateSegment(
                              seg.id,
                              "end",
                              parseFromInput(e.target.value, seg.end),
                            )
                          }
                          className="flex h-8 w-full rounded-lg border border-border bg-secondary px-3 py-1 text-[11px] font-semibold shadow-none focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
                        />
                      </div>
                    </div>

                    {/* DRIVER SELECTION COMBOBOX */}
                    <div className="flex flex-col justify-center">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                        Assigned Driver
                      </label>
                      <Popover
                        open={comboboxOpen[seg.id]}
                        onOpenChange={(isOpen) =>
                          setComboboxOpen({ ...comboboxOpen, [seg.id]: isOpen })
                        }
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "w-full justify-between h-[72px] items-start p-3 rounded-lg shadow-none border-border bg-card hover:bg-secondary transition-colors",
                              !seg.driverId &&
                                "text-amber-600 bg-amber-500/5 border-amber-500/30 border-dashed hover:text-amber-700",
                            )}
                          >
                            {seg.driverId && availableDrivers ? (
                              <div className="flex flex-col items-start gap-1.5 w-full overflow-hidden">
                                <span className="font-bold text-[11px] text-foreground truncate w-full text-left">
                                  {
                                    availableDrivers.find(
                                      (d: any) => d.id === seg.driverId,
                                    )?.name
                                  }
                                </span>
                                <Badge
                                  variant="outline"
                                  className="text-[8px] h-4 px-1.5 tracking-widest uppercase border border-border bg-secondary text-muted-foreground font-mono"
                                >
                                  ID:{" "}
                                  {
                                    availableDrivers.find(
                                      (d: any) => d.id === seg.driverId,
                                    )?.display_id
                                  }
                                </Badge>
                              </div>
                            ) : (
                              <div className="flex items-center text-[10px] font-semibold mt-2">
                                <UserCircle className="w-4 h-4 mr-2" /> Select
                                driver...
                              </div>
                            )}
                            <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 mt-2" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[300px] p-0 rounded-lg shadow-xl border-border bg-popover"
                          align="start"
                        >
                          <Command>
                            <CommandInput
                              placeholder="Search roster..."
                              className="text-[11px] h-9 font-medium"
                            />
                            {/* THE FIX: Added overflow-y-auto and overflow-x-hidden for proper scrolling */}
                            <CommandList className="max-h-[200px] overflow-y-auto overflow-x-hidden custom-scrollbar">
                              <CommandEmpty className="text-[10px] py-6 text-center text-muted-foreground font-semibold">
                                No drivers available.
                              </CommandEmpty>
                              <CommandGroup heading="Active Roster">
                                {isLoadingAvailability ? (
                                  <div className="p-6 flex justify-center">
                                    <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                  </div>
                                ) : (
                                  availableDrivers?.map((driver: any) => {
                                    const hasConflict = checkDriverConflict(
                                      driver,
                                      seg.start,
                                      seg.end,
                                    );
                                    return (
                                      <CommandItem
                                        key={driver.id}
                                        value={driver.name}
                                        disabled={hasConflict}
                                        onSelect={() => {
                                          updateSegment(
                                            seg.id,
                                            "driverId",
                                            driver.id,
                                          );
                                          setComboboxOpen({
                                            ...comboboxOpen,
                                            [seg.id]: false,
                                          });
                                        }}
                                        className="flex flex-col items-start py-2.5 px-3 cursor-pointer data-[disabled]:opacity-50 transition-colors focus:bg-secondary"
                                      >
                                        <div className="flex items-center w-full justify-between mb-1">
                                          <span className="font-bold text-[11px] text-foreground flex items-center gap-2">
                                            <Check
                                              className={cn(
                                                "h-3.5 w-3.5 text-primary",
                                                seg.driverId === driver.id
                                                  ? "opacity-100"
                                                  : "opacity-0",
                                              )}
                                            />
                                            {driver.name}
                                          </span>
                                        </div>
                                        <Badge
                                          variant="outline"
                                          className={cn(
                                            "text-[8px] h-4 px-1.5 ml-5 border uppercase tracking-widest font-bold",
                                            hasConflict
                                              ? "bg-destructive/10 text-destructive border-destructive/20"
                                              : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                                          )}
                                        >
                                          {hasConflict
                                            ? "Shift Conflict"
                                            : "Available"}
                                        </Badge>
                                      </CommandItem>
                                    );
                                  })
                                )}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              );
            })}

            <Button
              variant="outline"
              onClick={handleAddCustomSegment}
              className="w-full border-dashed text-muted-foreground bg-card hover:bg-secondary h-9 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-none transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-2" /> Add Custom Segment
            </Button>
          </div>
        </ScrollArea>

        {/* --- FOOTER --- */}
        <div className="px-5 py-3 bg-card border-t border-border flex justify-end gap-2 shrink-0 transition-colors">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSavingDispatch}
            className="h-8 text-[11px] font-semibold rounded-lg shadow-none border-border bg-card text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmSave}
            disabled={
              coverageStatus.hasGaps ||
              coverageStatus.isOverbooked ||
              !coverageStatus.allAssigned ||
              isSavingDispatch
            }
            className="h-8 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-primary hover:opacity-90 text-primary-foreground shadow-sm disabled:opacity-50 transition-opacity"
          >
            {isSavingDispatch && (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            )}
            {isSavingDispatch ? "Saving Plan..." : "Confirm Dispatch"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
