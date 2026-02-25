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

  const oldDays = differenceInCalendarDays(
    new Date(event.end),
    new Date(event.start),
  );
  const newDays = differenceInCalendarDays(newEnd, new Date(event.start));
  const diffDays = newDays - oldDays;
  const isExtension = diffDays > 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-slate-200 rounded-lg shadow-xl">
        <div className="p-5 border-b border-slate-100 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 text-base">
              <CalendarClock className="w-4 h-4 text-blue-600" />
              Confirm Booking Change
            </DialogTitle>
            <DialogDescription className="text-xs">
              You are manually adjusting the end date for{" "}
              <b className="text-slate-700 font-semibold">{event.title}</b>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 bg-slate-50/50 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            {/* FROM */}
            <div className="flex flex-col flex-1 items-center p-3 bg-white rounded-md border border-slate-200 shadow-sm text-center">
              <span className="text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                Current End
              </span>
              <div className="font-bold text-sm text-slate-700">
                {format(new Date(event.end), "MMM d, yyyy")}
              </div>
              <div className="text-[10px] font-medium text-slate-500 mt-0.5">
                {format(new Date(event.end), "h:mm a")}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

            {/* TO */}
            <div className="flex flex-col flex-1 items-center p-3 bg-blue-50/50 rounded-md border border-blue-200 shadow-sm text-center">
              <span className="text-[9px] uppercase font-bold text-blue-500 mb-1 tracking-wider">
                New End
              </span>
              <div className="font-bold text-sm text-blue-700">
                {format(newEnd, "MMM d, yyyy")}
              </div>
              <div className="text-[10px] font-medium text-blue-600 mt-0.5">
                {format(newEnd, "h:mm a")}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${
                isExtension
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }`}
            >
              {isExtension
                ? `Extending by ${diffDays} Day(s)`
                : `Shortening by ${Math.abs(diffDays)} Day(s)`}
            </Badge>
          </div>

          {!isExtension && (
            <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-2.5 rounded-md flex gap-2 items-start shadow-sm mt-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
              <span className="font-medium text-amber-700">
                Shortening a booking does not automatically issue a refund.
                Review financials manually.
              </span>
            </div>
          )}
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
            onClick={onConfirm}
            disabled={isSaving}
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            {isSaving ? "Updating..." : "Confirm Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
