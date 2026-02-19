"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SchedulerEvent } from "@/components/scheduler/timeline-scheduler";
import { ArrowRight, CalendarClock, AlertCircle } from "lucide-react";
import { format, differenceInCalendarDays } from "date-fns";
import { Badge } from "@/components/ui/badge";

type ResizeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: SchedulerEvent | null;
  newEnd: Date | null;
  isSaving?: boolean;
};

export default function ResizeDialog({
  isOpen,
  onClose,
  onConfirm,
  event,
  newEnd,
  isSaving = false,
}: ResizeDialogProps) {
  if (!event || !newEnd) return null;

  const oldDays = differenceInCalendarDays(event.end, event.start);
  const newDays = differenceInCalendarDays(newEnd, event.start);
  const diffDays = newDays - oldDays;
  const isExtension = diffDays > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5 text-blue-600" />
            Confirm Booking Change
          </DialogTitle>
          <DialogDescription>
            You are rescheduling the booking for{" "}
            <span className="font-semibold text-slate-700">{event.title}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="bg-slate-50 border rounded-lg p-4 my-4 flex items-center justify-between gap-4">
          {/* FROM */}
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mb-1">
              Current End
            </span>
            <div className="font-mono font-medium text-sm text-slate-700">
              {format(event.end, "MMM d, yyyy")}
            </div>
            <div className="text-xs text-slate-400">
              {format(event.end, "h:mm a")}
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-300" />

          {/* TO */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-bold text-blue-600 tracking-wider mb-1">
              New End Date
            </span>
            <div className="font-mono font-bold text-sm text-blue-700">
              {format(newEnd, "MMM d, yyyy")}
            </div>
            <div className="text-xs text-blue-400">
              {format(newEnd, "h:mm a")}
            </div>
          </div>
        </div>

        {/* SUMMARY BADGE */}
        <div className="flex justify-center mb-2">
          <Badge
            variant={isExtension ? "default" : "destructive"}
            className="px-3 py-1 text-sm"
          >
            {isExtension
              ? `Extend by ${diffDays} Day(s)`
              : `Shorten by ${Math.abs(diffDays)} Day(s)`}
          </Badge>
        </div>

        {/* Warning if shortening */}
        {!isExtension && (
          <div className="flex items-start gap-2 bg-amber-50 text-amber-800 p-3 rounded-md text-xs">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>
              Shortening a booking might require a refund. Please verify the
              payment details manually.
            </span>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSaving}>
            {isSaving ? "Updating..." : "Confirm Update"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
