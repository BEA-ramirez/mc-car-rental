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
  CalendarClock,
  AlertCircle,
  CalendarIcon,
  Clock,
  Banknote,
} from "lucide-react";
import { format, differenceInMinutes, setHours, setMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

type ResizeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  // NEW: Passes back the exact date AND the automated charge
  onConfirm: (newEndDate: Date, addedCharge: number) => void;
  event: SchedulerEvent | null;
  newEnd: Date | null; // From the drag action
  isSaving?: boolean;
  car24hRate: number; // Passed from BookingMain
  car12hRate: number; // Passed from BookingMain
};

export default function ResizeDialog({
  isOpen,
  onClose,
  onConfirm,
  event,
  newEnd,
  isSaving = false,
  car24hRate,
  car12hRate,
}: ResizeDialogProps) {
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [endTime, setEndTime] = useState("12:00");

  // Sync state when dialog opens
  useEffect(() => {
    if (isOpen && newEnd) {
      setEndDate(newEnd);
      setEndTime(format(newEnd, "HH:mm"));
    }
  }, [isOpen, newEnd]);

  if (!event || !newEnd) return null;

  const oldEndObj = new Date(event.end);

  // Construct exact new Date
  let exactNewEnd = newEnd;
  if (endDate && endTime) {
    const [hours, mins] = endTime.split(":").map(Number);
    exactNewEnd = setMinutes(setHours(new Date(endDate), hours), mins);
  }

  // --- MATH ENGINE ---
  const diffMins = differenceInMinutes(exactNewEnd, oldEndObj);
  const diffHours = diffMins / 60;
  const isExtension = diffHours > 0;

  // Block Pricing Logic
  let addedCharge = 0;
  if (isExtension) {
    if (diffHours > 4) {
      const addedDays = Math.floor(diffHours / 24);
      const remainderHours = diffHours % 24;

      addedCharge += addedDays * car24hRate;

      // If the remainder breaches the 4hr grace period, bill the next block
      if (remainderHours > 4) {
        if (remainderHours <= 12 && car12hRate > 0) {
          addedCharge += car12hRate;
        } else {
          addedCharge += car24hRate;
        }
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden border-border bg-background rounded-xl shadow-2xl transition-colors duration-300">
        <div className="p-4 border-b border-border bg-card transition-colors">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-xs font-bold uppercase tracking-widest">
              <CalendarClock className="w-4 h-4 text-primary" />
              Adjust Booking Dates
            </DialogTitle>
            <DialogDescription className="text-[10px] font-medium text-muted-foreground mt-1">
              You are manually adjusting the end date for{" "}
              <b className="text-foreground font-bold">{event.title}</b>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 bg-background flex flex-col gap-4">
          {/* VISUAL COMPARISON */}
          <div className="flex items-center justify-between gap-3">
            {/* FROM */}
            <div className="flex flex-col flex-1 items-center p-3 bg-card rounded-lg border border-border shadow-sm text-center transition-colors">
              <span className="text-[9px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">
                Current End
              </span>
              <div className="font-bold text-xs text-foreground leading-tight">
                {format(oldEndObj, "MMM d, yyyy")}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                {format(oldEndObj, "h:mm a")}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />

            {/* TO */}
            <div className="flex flex-col flex-1 items-center p-3 bg-primary/10 rounded-lg border border-primary/30 shadow-sm text-center transition-colors">
              <span className="text-[9px] uppercase font-bold text-primary mb-1 tracking-widest">
                New End
              </span>
              <div className="font-bold text-xs text-primary leading-tight">
                {format(exactNewEnd, "MMM d, yyyy")}
              </div>
              <div className="text-[10px] font-medium text-primary/80 mt-0.5">
                {format(exactNewEnd, "h:mm a")}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border rounded-md",
                diffHours === 0
                  ? "bg-secondary text-muted-foreground"
                  : isExtension
                    ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
              )}
            >
              {diffHours === 0
                ? "No Change"
                : isExtension
                  ? `Extending by ${diffHours.toFixed(1)} Hours`
                  : `Shortening by ${Math.abs(diffHours).toFixed(1)} Hours`}
            </Badge>
          </div>

          <Separator className="bg-border" />

          {/* FINANCIAL PREVIEW */}
          {isExtension ? (
            diffHours <= 4 ? (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] font-medium p-3 rounded-lg flex gap-2 items-start shadow-sm transition-colors">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-emerald-500" />
                <div className="leading-relaxed">
                  <strong className="block font-bold mb-0.5 uppercase tracking-widest text-[9px]">
                    Grace Period Applied
                  </strong>
                  Extension is under 4 hours. The calendar will be updated, but
                  no automated block charges will be applied (₱0). Add manual
                  late fees in the ledger if needed.
                </div>
              </div>
            ) : (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-medium p-3 rounded-lg flex gap-2 items-start shadow-sm transition-colors">
                <Banknote className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
                <div className="leading-relaxed">
                  <strong className="block font-bold mb-0.5 uppercase tracking-widest text-[9px]">
                    Automated Block Charge
                  </strong>
                  This extension breached the 4-hour grace period. An automated
                  extension charge of{" "}
                  <strong>₱{addedCharge.toLocaleString()}</strong> will be
                  injected into the ledger.
                </div>
              </div>
            )
          ) : (
            <div className="bg-secondary/50 border border-border text-muted-foreground text-[10px] font-medium p-3 rounded-lg flex gap-2 items-start shadow-sm transition-colors">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <strong className="block font-bold mb-0.5 uppercase tracking-widest text-[9px]">
                  No Automated Refunds
                </strong>
                Shortening a booking does not automatically issue a refund.
                Review financials manually in the Command Center.
              </div>
            </div>
          )}

          {/* MANUAL OVERRIDE CONTROLS */}
          <div className="space-y-3 mt-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block">
              Set Exact End Date & Time
            </label>
            <div className="grid grid-cols-2 gap-3">
              {/* Date Picker */}
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full pl-3 text-left font-semibold h-9 bg-secondary border-border hover:bg-background text-[11px] rounded-lg shadow-sm transition-colors",
                      !endDate && "text-muted-foreground",
                    )}
                  >
                    {endDate ? (
                      format(endDate, "MMM d, yyyy")
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
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    // Prevent picking a date before the booking even starts
                    disabled={(date) =>
                      date <
                      new Date(new Date(event.start).setHours(0, 0, 0, 0))
                    }
                    className="bg-card text-foreground"
                  />
                </PopoverContent>
              </Popover>

              {/* Time Picker */}
              <div className="relative">
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="pl-8 h-9 text-[11px] font-semibold bg-secondary border-border hover:bg-background focus-visible:ring-primary rounded-lg shadow-sm transition-colors"
                />
                <Clock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-card border-t border-border flex justify-end gap-2 transition-colors">
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
            // Pass the exact date AND the calculated money back to the parent
            onClick={() => onConfirm(exactNewEnd, addedCharge)}
            disabled={isSaving}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
          >
            {isSaving ? "Updating..." : "Confirm Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
