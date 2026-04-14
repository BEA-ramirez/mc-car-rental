"use client";

import React, { useState, useMemo, useEffect } from "react";
import { format, differenceInDays, addDays, isAfter } from "date-fns";
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
  CarFront,
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
import { toast } from "sonner";

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
  const totalBookingDays = differenceInDays(bookingEnd, bookingStart) + 1;

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

  const checkDriverConflict = (driver: any, segStart: Date, segEnd: Date) => {
    if (!driver.conflicts || driver.conflicts.length === 0) return false;
    return driver.conflicts.some((c: any) => {
      const cStart = new Date(c.start);
      const cEnd = new Date(c.end);
      return segStart < cEnd && segEnd > cStart;
    });
  };

  // UPDATED: Proper async error handling
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
          <div className="text-right shrink-0">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">
              Booking Duration
            </span>
            <span className="text-[11px] font-bold text-foreground bg-secondary px-2.5 py-1 rounded-md border border-border shadow-sm">
              {format(bookingStart, "MMM dd")} - {format(bookingEnd, "MMM dd")}
            </span>
          </div>
        </div>

        {/* --- COVERAGE BAR --- */}
        <div className="px-5 py-2.5 bg-secondary/50 border-b border-border flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            {coverageStatus.hasGaps ? (
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            )}
            <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
              Coverage: {coverageStatus.coveredDays} of {totalBookingDays} Days
            </span>
          </div>
          <div className="w-32 h-1.5 bg-secondary border border-border rounded-full overflow-hidden flex shadow-inner">
            <div
              className={cn(
                "h-full transition-all duration-500 ease-in-out",
                coverageStatus.hasGaps ? "bg-amber-500" : "bg-emerald-500",
              )}
              style={{ width: `${coverageStatus.percentage}%` }}
            />
          </div>
        </div>

        {/* --- SEGMENTS LIST --- */}
        <ScrollArea className="max-h-[55vh] p-4 md:p-5 bg-background custom-scrollbar">
          <div className="space-y-4">
            {segments.map((seg, index) => (
              <div
                key={seg.id}
                className="bg-card border border-border rounded-xl shadow-sm flex flex-col relative overflow-hidden transition-colors"
              >
                {/* Segment Header */}
                <div className="bg-secondary/30 border-b border-border px-4 py-2 flex items-center justify-between">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    Shift Segment {index + 1}
                  </span>
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
                  {/* DATE PICKERS */}
                  <div className="space-y-3 border-r border-border pr-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Segment Start
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left text-[11px] font-semibold h-8 rounded-lg shadow-none bg-secondary border-border hover:bg-background text-foreground transition-colors",
                              !seg.start && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            {seg.start ? (
                              format(seg.start, "MMM dd, yyyy")
                            ) : (
                              <span>Pick date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 rounded-xl shadow-xl border-border bg-popover"
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
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Segment End
                      </label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left text-[11px] font-semibold h-8 rounded-lg shadow-none bg-secondary border-border hover:bg-background text-foreground transition-colors",
                              !seg.end && "text-muted-foreground",
                            )}
                          >
                            <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            {seg.end ? (
                              format(seg.end, "MMM dd, yyyy")
                            ) : (
                              <span>Pick date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 rounded-xl shadow-xl border-border bg-popover"
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
                              "text-muted-foreground bg-secondary/50 border-dashed",
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
                            <div className="flex items-center text-[10px] font-semibold text-muted-foreground mt-2">
                              <UserCircle className="w-4 h-4 mr-2" /> Select
                              available driver...
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
                          <CommandList className="max-h-[200px] custom-scrollbar">
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
            ))}

            <Button
              variant="outline"
              onClick={handleAddSegment}
              className="w-full border-dashed border-border text-muted-foreground hover:text-foreground bg-card hover:bg-secondary h-9 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-none transition-colors"
            >
              <Plus className="w-3.5 h-3.5 mr-2" /> Split / Add Shift Segment
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
              !coverageStatus.allAssigned ||
              isSavingDispatch
            }
            className="h-8 text-[11px] font-bold uppercase tracking-widest rounded-lg bg-primary hover:opacity-90 text-primary-foreground shadow-sm disabled:opacity-50 transition-opacity"
          >
            {isSavingDispatch ? (
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
            ) : null}
            {isSavingDispatch ? "Saving Plan..." : "Confirm Dispatch"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
