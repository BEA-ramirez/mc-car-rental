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
  Scissors,
  Calendar as CalendarIcon,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  format,
  differenceInCalendarDays,
  startOfDay,
  setHours,
  setMinutes,
  isWithinInterval,
  addMinutes,
} from "date-fns";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SplitBookingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (finalSplitDate: Date) => void;
  event: SchedulerEvent | null;
  initialSplitDate: Date | null;
  isProcessing?: boolean;
};

export default function SplitBookingDialog({
  isOpen,
  onClose,
  onConfirm,
  event,
  initialSplitDate,
  isProcessing = false,
}: SplitBookingDialogProps) {
  const [splitDate, setSplitDate] = useState<Date | undefined>(undefined);
  const [timeString, setTimeString] = useState("12:00");

  useEffect(() => {
    if (isOpen && initialSplitDate) {
      setSplitDate(initialSplitDate);
      setTimeString(format(initialSplitDate, "HH:mm"));
    }
  }, [isOpen, initialSplitDate]);

  if (!event || !splitDate) return null;

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setTimeString(time);
    const [hours, minutes] = time.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes) && splitDate) {
      const newDate = setMinutes(setHours(splitDate, hours), minutes);
      setSplitDate(newDate);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const newDate = setMinutes(setHours(date, hours || 0), minutes || 0);
      setSplitDate(newDate);
    }
  };

  const isValidSplit = isWithinInterval(splitDate, {
    start: addMinutes(new Date(event.start), 1),
    end: addMinutes(new Date(event.end), -1),
  });

  const daysFirst = differenceInCalendarDays(splitDate, new Date(event.start));
  const daysSecond = differenceInCalendarDays(new Date(event.end), splitDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-border bg-background rounded-xl shadow-2xl transition-colors duration-300">
        <div className="p-4 border-b border-border bg-card transition-colors">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-sm font-bold uppercase tracking-wider">
              <Scissors className="w-4 h-4 -rotate-90 text-indigo-500" />
              Split Booking
            </DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-muted-foreground mt-1">
              Select the exact date and time to cut this booking in half.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 bg-background flex flex-col gap-4">
          {/* DATE PICKER CONTROLS */}
          <div className="flex gap-3 items-end bg-card p-3 rounded-xl border border-border shadow-sm transition-colors">
            <div className="flex-1 space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                Split Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-semibold h-8 bg-secondary border-border hover:bg-background text-[11px] text-foreground shadow-none rounded-lg transition-colors",
                      !splitDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    {splitDate ? (
                      format(splitDate, "MMM d, yyyy")
                    ) : (
                      <span>Pick date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border-border shadow-xl rounded-xl bg-card"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={splitDate}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date < startOfDay(new Date(event.start)) ||
                      date > startOfDay(new Date(event.end))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-38 space-y-1.5">
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

          {/* VISUAL PREVIEW */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* Part 1 */}
            <div className="border border-border bg-card p-3 rounded-xl shadow-sm transition-colors text-center">
              <div className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 mb-1 tracking-widest">
                Part 1 (Keep)
              </div>
              <div className="text-[11px] font-bold text-foreground">
                {format(new Date(event.start), "MMM d")} -{" "}
                {format(splitDate, "MMM d")}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1 font-medium">
                ~{daysFirst} Days
              </div>
            </div>

            <div className="bg-secondary p-1.5 rounded-full border border-border shadow-sm">
              <Scissors className="w-3.5 h-3.5 text-muted-foreground -rotate-90" />
            </div>

            {/* Part 2 */}
            <div className="border border-indigo-500/20 bg-indigo-500/10 p-3 rounded-xl shadow-sm transition-colors text-center">
              <div className="text-[9px] uppercase font-bold text-indigo-600 dark:text-indigo-400 mb-1 tracking-widest">
                Part 2 (Move)
              </div>
              <div className="text-[11px] font-bold text-foreground">
                {format(splitDate, "MMM d")} -{" "}
                {format(new Date(event.end), "MMM d")}
              </div>
              <div className="font-mono text-[10px] text-muted-foreground mt-1 font-medium">
                ~{daysSecond} Days
              </div>
            </div>
          </div>

          {!isValidSplit && (
            <div className="bg-destructive/10 text-destructive text-[10px] p-2.5 rounded-lg font-medium border border-destructive/20 flex items-center gap-2 shadow-sm transition-colors">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="leading-relaxed">
                Invalid split date. Must fall strictly between{" "}
                <b className="font-bold">
                  {format(new Date(event.start), "MMM d")}
                </b>{" "}
                and{" "}
                <b className="font-bold">
                  {format(new Date(event.end), "MMM d")}
                </b>
                .
              </span>
            </div>
          )}
        </div>

        <div className="p-3 bg-card border-t border-border flex justify-end gap-2 transition-colors">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
            className="h-8 text-[10px] font-semibold bg-card text-foreground hover:bg-secondary border-border rounded-lg shadow-none transition-colors"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onConfirm(splitDate)}
            disabled={!isValidSplit || isProcessing}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm rounded-lg transition-opacity"
          >
            {isProcessing ? "Processing..." : "Confirm Split"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
