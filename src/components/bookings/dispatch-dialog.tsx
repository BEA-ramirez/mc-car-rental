"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, differenceInDays, addDays, isAfter } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import {
  Calendar as CalendarIcon,
  UserCircle,
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  ChevronsUpDown,
  Check,
  Loader2,
  Car,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

import { useDriverDispatch } from "../../../hooks/use-drivers";
import { SchedulerEvent } from "../scheduler/timeline-scheduler";

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
  booking: SchedulerEvent | null;
}) {
  const bookingStart = booking ? new Date(booking.start) : new Date();
  const bookingEnd = booking ? new Date(booking.end) : new Date();
  // We use differenceInDays + 1 to count inclusive days (e.g. Mar 10 to Mar 12 is 3 days)
  const totalBookingDays = differenceInDays(bookingEnd, bookingStart) + 1;

  const [segments, setSegments] = useState<ShiftSegment[]>([]);
  const [comboboxOpen, setComboboxOpen] = useState<Record<string, boolean>>({});

  // 1. USE THE REAL HOOK
  const {
    availableDrivers,
    isLoadingAvailability,
    saveDispatchPlan,
    isSavingDispatch,
  } = useDriverDispatch(
    open ? bookingStart : undefined,
    open ? bookingEnd : undefined,
  );

  // 2. RESET STATE ON OPEN
  useEffect(() => {
    if (open && booking) {
      setSegments([
        {
          id: `seg-${Date.now()}`,
          start: bookingStart,
          end: bookingEnd,
          driverId: null,
        },
      ]);
    }
  }, [open, booking]);

  // 3. COVERAGE MATH
  const coverageStatus = useMemo(() => {
    let coveredDays = 0;
    let allAssigned = true;

    segments.forEach((seg) => {
      coveredDays += differenceInDays(seg.end, seg.start) + 1;
      if (!seg.driverId) allAssigned = false;
    });

    const hasGaps = coveredDays !== totalBookingDays;
    return {
      coveredDays,
      hasGaps,
      allAssigned,
      percentage: Math.min((coveredDays / totalBookingDays) * 100, 100),
    };
  }, [segments, totalBookingDays]);

  // 4. SEGMENT HANDLERS
  const handleAddSegment = () => {
    const lastSeg = segments[segments.length - 1];
    const newStart = lastSeg ? addDays(lastSeg.end, 1) : bookingStart;
    const newEnd = isAfter(newStart, bookingEnd) ? newStart : bookingEnd;
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

  // 5. CONFLICT CHECKER
  const checkDriverConflict = (driver: any, segStart: Date, segEnd: Date) => {
    if (!driver.conflicts || driver.conflicts.length === 0) return false;

    // Check if the driver has any shifts that overlap with this segment's dates
    return driver.conflicts.some((c: any) => {
      const cStart = new Date(c.start);
      const cEnd = new Date(c.end);
      return segStart < cEnd && segEnd > cStart;
    });
  };

  // 6. SUBMIT TO DB
  const handleConfirmSave = async () => {
    if (!booking) return;

    // Format segments exactly as the Server Action expects
    const validSegments = segments
      .filter((s) => s.driverId !== null)
      .map((s) => ({
        driverId: s.driverId as string,
        start: s.start,
        end: s.end,
      }));

    await saveDispatchPlan({ bookingId: booking.id, segments: validSegments });
    onOpenChange(false);
  };

  if (!booking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-0 rounded-sm overflow-hidden bg-slate-50 font-sans">
        {/* --- HEADER --- */}
        <div className="px-6 py-4 bg-white border-b border-slate-200 flex items-start justify-between shadow-sm z-10 relative">
          <div>
            <DialogTitle className="text-base font-black text-slate-900 flex items-center gap-2">
              Dispatch Configuration
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Assign drivers to fulfill{" "}
              <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1 rounded border border-slate-200">
                {booking.id.split("-")[0].toUpperCase()}
              </span>
            </DialogDescription>
          </div>
          <div className="text-right">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block mb-0.5">
              Booking Duration
            </span>
            <span className="text-xs font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-sm border border-slate-200 shadow-sm">
              {format(bookingStart, "MMM dd")} - {format(bookingEnd, "MMM dd")}
            </span>
          </div>
        </div>

        {/* --- COVERAGE BAR --- */}
        <div className="px-6 py-2.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {coverageStatus.hasGaps ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            )}
            <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Coverage: {coverageStatus.coveredDays} of {totalBookingDays} Days
            </span>
          </div>
          <div className="w-40 h-2 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-in-out",
                coverageStatus.hasGaps ? "bg-amber-400" : "bg-emerald-500",
              )}
              style={{ width: `${coverageStatus.percentage}%` }}
            />
          </div>
        </div>

        {/* --- SEGMENTS LIST --- */}
        <ScrollArea className="max-h-[55vh] p-6 bg-slate-50">
          <div className="space-y-4">
            {segments.map((seg, index) => (
              <div
                key={seg.id}
                className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col relative overflow-hidden"
              >
                {/* Segment Header */}
                <div className="bg-slate-50/80 border-b border-slate-100 px-4 py-2 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Shift Segment {index + 1}
                  </span>
                  {segments.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveSegment(seg.id)}
                      className="h-6 w-6 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-sm"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>

                <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* DATE PICKERS */}
                  <div className="space-y-4 border-r border-slate-100 pr-6">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Segment Start
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left text-xs font-bold h-9 rounded-sm shadow-none",
                              !seg.start && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                            {seg.start ? (
                              format(seg.start, "MMM dd, yyyy")
                            ) : (
                              <span>Pick date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 rounded-sm"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={seg.start}
                            onSelect={(d) =>
                              d && updateSegment(seg.id, "start", d)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                        Segment End
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left text-xs font-bold h-9 rounded-sm shadow-none",
                              !seg.end && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                            {seg.end ? (
                              format(seg.end, "MMM dd, yyyy")
                            ) : (
                              <span>Pick date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 rounded-sm"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={seg.end}
                            onSelect={(d) =>
                              d && updateSegment(seg.id, "end", d)
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* DRIVER SELECTION COMBOBOX */}
                  <div className="flex flex-col justify-center">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">
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
                            "w-full justify-between h-[86px] items-start p-3 rounded-sm shadow-none border-slate-200 hover:bg-slate-50 transition-colors",
                            !seg.driverId &&
                              "text-muted-foreground bg-slate-50/50 border-dashed",
                          )}
                        >
                          {seg.driverId && availableDrivers ? (
                            <div className="flex flex-col items-start gap-1.5 w-full overflow-hidden mt-1">
                              <span className="font-bold text-sm text-slate-900 truncate w-full text-left">
                                {
                                  availableDrivers.find(
                                    (d: any) => d.id === seg.driverId,
                                  )?.name
                                }
                              </span>
                              <Badge
                                variant="outline"
                                className="text-[9px] h-5 px-1.5 tracking-widest uppercase border bg-slate-100 text-slate-600 font-mono"
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
                            <div className="flex items-center text-xs font-medium text-slate-400 mt-2.5">
                              <UserCircle className="w-4 h-4 mr-2" /> Select
                              available driver...
                            </div>
                          )}
                          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50 mt-2.5" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[300px] p-0 rounded-sm shadow-xl border-slate-200"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search roster..."
                            className="text-xs h-10 shadow-none border-none focus:ring-0"
                          />
                          <CommandList className="max-h-[200px]">
                            <CommandEmpty className="text-xs py-6 text-center text-slate-500">
                              No drivers available.
                            </CommandEmpty>
                            <CommandGroup heading="Active Roster">
                              {isLoadingAvailability ? (
                                <div className="p-6 flex justify-center">
                                  <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
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
                                      className="flex flex-col items-start py-2.5 px-3 cursor-pointer data-[disabled]:opacity-50"
                                    >
                                      <div className="flex items-center w-full justify-between mb-1.5">
                                        <span className="font-bold text-xs text-slate-800 flex items-center gap-2">
                                          <Check
                                            className={cn(
                                              "h-3.5 w-3.5 text-blue-600",
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
                                          "text-[8px] h-4 px-1.5 ml-5 border uppercase tracking-wider",
                                          hasConflict
                                            ? "bg-red-50 text-red-600 border-red-200"
                                            : "bg-emerald-50 text-emerald-600 border-emerald-200",
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
            ))}

            <Button
              variant="outline"
              onClick={handleAddSegment}
              className="w-full border-dashed border-slate-300 text-slate-500 hover:text-slate-900 hover:bg-slate-50 h-10 text-xs font-bold rounded-sm shadow-none"
            >
              <Plus className="w-4 h-4 mr-2" /> Split / Add Shift Segment
            </Button>
          </div>
        </ScrollArea>

        {/* --- FOOTER --- */}
        <DialogFooter className="px-6 py-4 bg-white border-t border-slate-200 flex justify-end gap-2 sm:space-x-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs font-bold rounded-sm shadow-none border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmSave}
            disabled={
              coverageStatus.hasGaps ||
              !coverageStatus.allAssigned ||
              isSavingDispatch
            }
            className="h-9 text-xs font-bold rounded-sm bg-slate-900 hover:bg-slate-800 text-white shadow-none disabled:opacity-50 min-w-[160px]"
          >
            {isSavingDispatch ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : null}
            {isSavingDispatch ? "Saving Plan..." : "Confirm Dispatch Plan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
