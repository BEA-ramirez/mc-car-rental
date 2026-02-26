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
import { ArrowRight, CalendarRange, Clock, CalendarIcon } from "lucide-react";
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
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-slate-200 rounded-lg shadow-xl">
        <div className="p-5 border-b border-slate-100 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 text-base">
              <CalendarRange className="w-4 h-4 text-blue-600" />
              Extend or Shorten Booking
            </DialogTitle>
            <DialogDescription className="text-xs">
              Manually change the return date for{" "}
              <b className="text-slate-700 font-semibold">{event.title}</b>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 bg-slate-50/50 flex flex-col gap-5">
          <div className="flex gap-3 items-end bg-white p-3 rounded-md border border-slate-200 shadow-sm">
            <div className="flex-1 space-y-1.5">
              <label className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                New Return Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-medium h-8 bg-slate-50 border-slate-200 text-xs shadow-none",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                    {format(newDate, "MMM d, yyyy")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 border-slate-200 shadow-xl rounded-xl"
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

          <div className="flex items-center justify-between gap-4">
            <div className="flex flex-col flex-1 items-center p-3 bg-white rounded-md border border-slate-200 shadow-sm text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                Current End
              </span>
              <div className="font-bold text-sm text-slate-700">
                {format(new Date(event.end), "MMM d")}
              </div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                {format(new Date(event.end), "h:mm a")}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

            <div className="flex flex-col flex-1 items-center p-3 bg-blue-50/50 rounded-md border border-blue-200 shadow-sm text-center">
              <span className="text-[9px] uppercase font-bold text-blue-500 mb-1 tracking-wider">
                New End
              </span>
              <div className="font-bold text-sm text-blue-700">
                {format(newDate, "MMM d")}
              </div>
              <div className="text-[10px] font-medium text-blue-600 mt-0.5">
                {format(newDate, "h:mm a")}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${
                diffDays === 0
                  ? "bg-slate-50 text-slate-600 border-slate-200"
                  : isExtension
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {diffDays === 0
                ? "Time Adjustment Only"
                : isExtension
                  ? `Extending by ${diffDays} Day(s)`
                  : `Shortening by ${Math.abs(diffDays)} Day(s)`}
            </Badge>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSaving}
            className="text-xs font-semibold text-slate-600"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={() => onConfirm(newDate)}
            disabled={!isValid || isSaving}
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            {isSaving ? "Updating..." : "Save New Date"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
