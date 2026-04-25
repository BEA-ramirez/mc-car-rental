"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SchedulerEvent } from "@/components/scheduler/timeline-scheduler";
import {
  ArrowRight,
  Sparkles,
  CalendarIcon,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { format, addMinutes, differenceInMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "../ui/separator";
import { Calendar } from "@/components/ui/calendar";

type BufferResizeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newBufferMinutes: number) => void;
  event: SchedulerEvent | null;
  newBuffer: number | null; // The initial estimate from the drag action
  isSaving?: boolean;
};

// Helper function to format raw minutes into a clean "Xh Ym" string
const formatMins = (totalMins: number) => {
  const h = Math.floor(Math.abs(totalMins) / 60);
  const m = Math.abs(totalMins) % 60;
  if (h > 0 && m > 0) return `${h}h ${m}m`;
  if (h > 0) return `${h}h`;
  return `${m}m`;
};

export default function BufferResizeDialog({
  isOpen,
  onClose,
  onConfirm,
  event,
  newBuffer,
  isSaving = false,
}: BufferResizeDialogProps) {
  // Local state for manual date/time overrides
  const [freeDate, setFreeDate] = useState<Date | undefined>(undefined);
  const [freeTime, setFreeTime] = useState("12:00");

  // Sync local state when dialog opens based on the dragged timeline value
  useEffect(() => {
    if (isOpen && event && newBuffer !== null) {
      // CRITICAL FIX: Force parse into a Date object to prevent NaN math errors
      const endObj = new Date(event.end);
      const initialFreeTime = addMinutes(endObj, newBuffer);
      setFreeDate(initialFreeTime);
      setFreeTime(format(initialFreeTime, "HH:mm"));
    }
  }, [isOpen, event, newBuffer]);

  if (!event || newBuffer === null) return null;

  const endObj = new Date(event.end);
  const oldBuffer = event.bufferDuration || 0;
  const availableOld = addMinutes(endObj, oldBuffer);

  // Calculate exact New Free Date based on Admin's manual input
  let exactNewAvailable = availableOld;
  if (freeDate && freeTime) {
    const [hours, mins] = freeTime.split(":").map(Number);
    // Construct the new date safely
    exactNewAvailable = new Date(freeDate);
    exactNewAvailable.setHours(hours || 0, mins || 0, 0, 0);
  }

  // Calculate the newly requested buffer in raw minutes
  const calculatedBuffer = differenceInMinutes(exactNewAvailable, endObj);
  const diff = calculatedBuffer - oldBuffer;
  const isIncrease = diff > 0;

  // Safeguard: Buffer cannot be negative (Free time cannot be before booking ends)
  const isInvalid = calculatedBuffer < 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-border bg-background rounded-xl shadow-2xl transition-colors duration-300">
        <div className="p-4 border-b border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Update Turnaround
            </DialogTitle>
            <DialogDescription className="text-[10px] font-medium text-muted-foreground mt-1">
              Adjust when this vehicle will be cleaned and ready for the next
              customer.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 bg-background flex flex-col gap-4">
          {/* VISUAL COMPARISON */}
          <div className="flex items-center justify-between gap-3">
            {/* FROM */}
            <div className="flex flex-col flex-1 items-center p-3 bg-card rounded-lg border border-border shadow-sm">
              <div className="text-[9px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">
                Current Buffer
              </div>
              <div className="text-sm font-black text-foreground font-mono">
                {formatMins(oldBuffer)}
              </div>
              <div className="text-[9px] font-semibold text-muted-foreground mt-1.5 text-center leading-tight">
                Vehicle Free At: <br />
                <span className="text-foreground">
                  {format(availableOld, "MMM dd, h:mm a")}
                </span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

            {/* TO */}
            <div
              className={cn(
                "flex flex-col flex-1 items-center p-3 rounded-lg border shadow-sm transition-colors",
                isInvalid
                  ? "bg-destructive/10 border-destructive/30"
                  : "bg-primary/10 border-primary/30",
              )}
            >
              <div
                className={cn(
                  "text-[9px] uppercase font-bold mb-1 tracking-widest",
                  isInvalid ? "text-destructive" : "text-primary",
                )}
              >
                New Buffer
              </div>
              <div
                className={cn(
                  "text-sm font-black font-mono",
                  isInvalid ? "text-destructive" : "text-primary",
                )}
              >
                {isInvalid ? "INVALID" : formatMins(calculatedBuffer)}
              </div>
              <div
                className={cn(
                  "text-[9px] font-semibold mt-1.5 text-center leading-tight",
                  isInvalid ? "text-destructive/80" : "text-primary/80",
                )}
              >
                Vehicle Free At: <br />
                <span
                  className={cn(
                    "font-bold",
                    isInvalid ? "text-destructive" : "text-primary",
                  )}
                >
                  {format(exactNewAvailable, "MMM dd, h:mm a")}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            {isInvalid ? (
              <Badge
                variant="outline"
                className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border rounded-md bg-destructive/10 text-destructive border-destructive/20"
              >
                <AlertTriangle className="w-3 h-3 mr-1" /> Cannot be before
                drop-off
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border rounded-md",
                  isIncrease
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                )}
              >
                {diff === 0
                  ? "No change in duration"
                  : isIncrease
                    ? `Adding ${formatMins(diff)} of maintenance`
                    : `Reducing maintenance by ${formatMins(Math.abs(diff))}`}
              </Badge>
            )}
          </div>

          <Separator className="bg-border" />

          {/* MANUAL OVERRIDE CONTROLS */}
          <div className="space-y-3">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
              Manual Override: Vehicle Ready Date & Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-semibold h-9 bg-secondary border-border hover:bg-background text-[11px] rounded-lg shadow-sm transition-colors",
                      !freeDate && "text-muted-foreground",
                    )}
                  >
                    {freeDate ? (
                      format(freeDate, "MMM d, yyyy")
                    ) : (
                      <span>Pick date</span>
                    )}
                    <CalendarIcon className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border-border shadow-xl rounded-xl bg-card"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={freeDate}
                    onSelect={setFreeDate}
                    initialFocus
                    // Prevent picking a date before the booking ends
                    disabled={(date) =>
                      date < new Date(new Date(endObj).setHours(0, 0, 0, 0))
                    }
                    className="bg-card text-foreground"
                  />
                </PopoverContent>
              </Popover>

              {/* Time Picker */}
              <div className="relative">
                <Input
                  type="time"
                  value={freeTime}
                  onChange={(e) => setFreeTime(e.target.value)}
                  className="pl-8 h-9 text-[11px] font-semibold bg-secondary border-border hover:bg-background focus-visible:ring-primary rounded-lg shadow-sm transition-colors"
                />
                <Clock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            <div className="bg-secondary/30 p-2.5 rounded-lg border border-border text-center">
              <p className="text-[10px] font-medium text-muted-foreground">
                Booking officially ends on{" "}
                <strong className="text-foreground">
                  {format(endObj, "MMM dd, yyyy 'at' h:mm a")}
                </strong>
              </p>
            </div>
          </div>
        </div>

        <div className="p-3 bg-card border-t border-border flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="h-8 text-[10px] font-semibold bg-card text-foreground hover:bg-secondary border-border rounded-lg shadow-none transition-colors"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onConfirm(calculatedBuffer)}
            disabled={isSaving || isInvalid}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-sm transition-opacity"
          >
            {isSaving ? "Updating..." : "Confirm Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
