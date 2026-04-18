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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SchedulerEvent } from "@/components/scheduler/timeline-scheduler";
import {
  ArrowRight,
  CalendarRange,
  Clock,
  CalendarIcon,
  Info,
} from "lucide-react";
import {
  format,
  differenceInCalendarDays,
  setHours,
  setMinutes,
} from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ExtendBookingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newEndDate: Date) => void;
  event: SchedulerEvent | null;
  isSaving?: boolean;
};

export default function ExtendBookingDialog({
  isOpen,
  onClose,
  onConfirm,
  event,
  isSaving = false,
}: ExtendBookingDialogProps) {
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [timeString, setTimeString] = useState("12:00");

  useEffect(() => {
    if (isOpen && event) {
      setNewDate(new Date(event.end));
      setTimeString(format(new Date(event.end), "HH:mm"));
    }
  }, [isOpen, event]);

  if (!event || !newDate) return null;

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setTimeString(time);
    const [hours, minutes] = time.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes)) {
      setNewDate(setMinutes(setHours(newDate, hours), minutes));
    }
  };

  const handleDateSelect = (d: Date | undefined) => {
    if (d) {
      const [hours, minutes] = timeString.split(":").map(Number);
      setNewDate(setMinutes(setHours(d, hours || 0), minutes || 0));
    }
  };

  const oldDays = differenceInCalendarDays(
    new Date(event.end),
    new Date(event.start),
  );
  const newDays = differenceInCalendarDays(newDate, new Date(event.start));
  const diffDays = newDays - oldDays;
  const isExtension = diffDays >= 0;

  // Prevent setting an end date before the start date
  const isValid = newDate > new Date(event.start);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-border bg-background rounded-xl shadow-2xl transition-colors duration-300">
        <div className="p-4 border-b border-border bg-card transition-colors">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-sm font-bold uppercase tracking-wider">
              <CalendarRange className="w-4 h-4 text-primary" />
              Extend or Shorten
            </DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-muted-foreground mt-1">
              Manually change the return date for{" "}
              <b className="text-foreground font-bold">{event.title}</b>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 bg-background flex flex-col gap-4">
          <div className="flex gap-3 items-end bg-card p-3 rounded-xl border border-border shadow-sm transition-colors">
            <div className="flex-1 space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                New Return Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-semibold h-8 bg-secondary border-border text-[11px] text-foreground shadow-none hover:bg-background rounded-lg transition-colors",
                      !newDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    {format(newDate, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border-border shadow-xl rounded-xl bg-card"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={newDate}
                    onSelect={handleDateSelect}
                    disabled={(date) => date < new Date(event.start)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-40 space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="time"
                  className="pl-8 bg-secondary border-border h-8 text-[11px] text-foreground font-semibold shadow-none hover:bg-background focus-visible:ring-primary rounded-lg transition-colors"
                  value={timeString}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex flex-col flex-1 items-center p-2.5 bg-card rounded-lg border border-border shadow-sm text-center transition-colors">
              <span className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5 tracking-widest">
                Current End
              </span>
              <div className="font-bold text-xs text-foreground">
                {format(new Date(event.end), "MMM d")}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                {format(new Date(event.end), "h:mm a")}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />

            <div className="flex flex-col flex-1 items-center p-2.5 bg-primary/10 rounded-lg border border-primary/30 shadow-sm text-center">
              <span className="text-[9px] uppercase font-bold text-primary mb-0.5 tracking-widest">
                New End
              </span>
              <div className="font-bold text-xs text-primary">
                {format(newDate, "MMM d")}
              </div>
              <div className="text-[10px] font-medium text-primary/80 mt-0.5">
                {format(newDate, "h:mm a")}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-1">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border rounded-md",
                diffDays === 0
                  ? "bg-secondary text-muted-foreground border-border"
                  : isExtension
                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                    : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
              )}
            >
              {diffDays === 0
                ? "Time Adjustment Only"
                : isExtension
                  ? `Extending by ${diffDays} Day(s)`
                  : `Shortening by ${Math.abs(diffDays)} Day(s)`}
            </Badge>
          </div>

          {/* NEW: Financial Recalculation Warning */}
          {diffDays !== 0 && (
            <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 p-2.5 rounded-lg mt-1">
              <Info className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium text-blue-700 dark:text-blue-300 leading-tight">
                The total bill will be automatically recalculated based on the
                vehicle&apos;s locked-in base rate. You may need to collect
                additional payment.
              </p>
            </div>
          )}
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
            onClick={() => onConfirm(newDate)}
            disabled={!isValid || isSaving}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
          >
            {isSaving ? "Updating..." : "Save New Date"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
