"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar"; // Assuming you have this
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
  ArrowRight,
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
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SplitBookingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  // CHANGED: onConfirm now accepts the final adjusted date
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
  // 1. Internal State for the Split Date
  const [splitDate, setSplitDate] = useState<Date | undefined>(undefined);
  const [timeString, setTimeString] = useState("12:00");

  // 2. Initialize State when dialog opens
  useEffect(() => {
    if (isOpen && initialSplitDate) {
      setSplitDate(initialSplitDate);
      setTimeString(format(initialSplitDate, "HH:mm"));
    }
  }, [isOpen, initialSplitDate]);

  if (!event || !splitDate) return null;

  // 3. Handle Time Change
  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = e.target.value;
    setTimeString(time);
    const [hours, minutes] = time.split(":").map(Number);
    if (!isNaN(hours) && !isNaN(minutes) && splitDate) {
      const newDate = setMinutes(setHours(splitDate, hours), minutes);
      setSplitDate(newDate);
    }
  };

  // 4. Handle Date Change
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      const [hours, minutes] = timeString.split(":").map(Number);
      const newDate = setMinutes(setHours(date, hours || 0), minutes || 0);
      setSplitDate(newDate);
    }
  };

  // 5. Validation & Duration Math
  // Ensure split is strictly inside the event (cannot equal start or end for safety)
  const isValidSplit = isWithinInterval(splitDate, {
    start: addMinutes(event.start, 1),
    end: addMinutes(event.end, -1),
  });

  const daysFirst = differenceInCalendarDays(splitDate, event.start);
  const daysSecond = differenceInCalendarDays(event.end, splitDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-800">
            <Scissors className="w-5 h-5 -rotate-90 text-indigo-600" />
            Adjust Split Point
          </DialogTitle>
          <DialogDescription>
            Choose exactly when to transfer the booking to the new car.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          {/* DATE PICKER CONTROLS */}
          <div className="flex gap-4 items-end bg-slate-50 p-4 rounded-lg border">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Split Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal bg-white",
                      !splitDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {splitDate ? (
                      format(splitDate, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={splitDate}
                    onSelect={handleDateSelect}
                    disabled={(date) =>
                      date < startOfDay(event.start) ||
                      date > startOfDay(event.end)
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="w-32 space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  type="time"
                  className="pl-9 bg-white"
                  value={timeString}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          </div>

          {/* VISUAL PREVIEW */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-xs">
            {/* Part 1 */}
            <div className="border border-emerald-200 bg-emerald-50/50 p-2 rounded text-center opacity-80">
              <div className="font-semibold text-emerald-700 mb-1">
                Part 1 (Keep)
              </div>
              <div className="text-slate-600">
                {format(event.start, "MMM d")} - {format(splitDate, "MMM d")}
              </div>
              <div className="font-mono text-[10px] text-slate-400 mt-1">
                ~{daysFirst} Days
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300" />

            {/* Part 2 */}
            <div className="border border-indigo-200 bg-indigo-50/50 p-2 rounded text-center opacity-80">
              <div className="font-semibold text-indigo-700 mb-1">
                Part 2 (Move)
              </div>
              <div className="text-slate-600">
                {format(splitDate, "MMM d")} - {format(event.end, "MMM d")}
              </div>
              <div className="font-mono text-[10px] text-slate-400 mt-1">
                ~{daysSecond} Days
              </div>
            </div>
          </div>

          {!isValidSplit && (
            <div className="bg-red-50 text-red-600 text-xs p-2 rounded text-center font-medium border border-red-100">
              Invalid split date. Must be between {format(event.start, "MMM d")}{" "}
              and {format(event.end, "MMM d")}.
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={() => onConfirm(splitDate)}
            disabled={!isValidSplit || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isProcessing ? "Splitting..." : "Confirm & Split"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
