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
  ArrowRight,
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
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-slate-200 rounded-lg shadow-xl">
        <div className="p-5 border-b border-slate-100 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 text-base">
              <Scissors className="w-4 h-4 -rotate-90 text-indigo-600" />
              Split Booking
            </DialogTitle>
            <DialogDescription className="text-xs">
              Select the exact date and time to cut this booking in half.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 bg-slate-50/50 flex flex-col gap-5">
          {/* DATE PICKER CONTROLS */}
          <div className="flex gap-3 items-end bg-white p-3 rounded-md border border-slate-200 shadow-sm">
            <div className="flex-1 space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Split Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-medium h-8 bg-slate-50 border-slate-200 text-xs shadow-none",
                      !splitDate && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                    {splitDate ? (
                      format(splitDate, "MMM d, yyyy")
                    ) : (
                      <span>Pick date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border-slate-200 shadow-xl rounded-xl"
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

            <div className="w-28 space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="time"
                  className="pl-8 bg-slate-50 border-slate-200 h-8 text-xs font-medium shadow-none"
                  value={timeString}
                  onChange={handleTimeChange}
                />
              </div>
            </div>
          </div>

          {/* VISUAL PREVIEW */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
            {/* Part 1 */}
            <div className="border border-slate-200 bg-white p-3 rounded-md shadow-sm">
              <div className="text-[10px] uppercase font-bold text-emerald-600 mb-1 tracking-wider">
                Part 1 (Keep)
              </div>
              <div className="text-xs font-bold text-slate-700">
                {format(new Date(event.start), "MMM d")} -{" "}
                {format(splitDate, "MMM d")}
              </div>
              <div className="font-mono text-[10px] text-slate-400 mt-1 font-medium">
                ~{daysFirst} Days
              </div>
            </div>

            <div className="bg-slate-200 p-1 rounded-full">
              <Scissors className="w-3 h-3 text-slate-500 -rotate-90" />
            </div>

            {/* Part 2 */}
            <div className="border border-indigo-200 bg-indigo-50 p-3 rounded-md shadow-sm">
              <div className="text-[10px] uppercase font-bold text-indigo-600 mb-1 tracking-wider">
                Part 2 (Move)
              </div>
              <div className="text-xs font-bold text-slate-700">
                {format(splitDate, "MMM d")} -{" "}
                {format(new Date(event.end), "MMM d")}
              </div>
              <div className="font-mono text-[10px] text-slate-400 mt-1 font-medium">
                ~{daysSecond} Days
              </div>
            </div>
          </div>

          {!isValidSplit && (
            <div className="bg-red-50 text-red-600 text-[11px] p-2.5 rounded-md font-medium border border-red-200 flex items-center gap-2 shadow-sm">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>
                Invalid split date. Must fall strictly between{" "}
                {format(new Date(event.start), "MMM d")} and{" "}
                {format(new Date(event.end), "MMM d")}.
              </span>
            </div>
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isProcessing}
            className="text-xs font-semibold text-slate-600"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onConfirm(splitDate)}
            disabled={!isValidSplit || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm"
          >
            {isProcessing ? "Processing..." : "Confirm Split"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
