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
import { ArrowRight, Sparkles } from "lucide-react";
import { format, addMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";

type BufferResizeDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  event: SchedulerEvent | null;
  newBuffer: number | null;
  isSaving?: boolean;
};

export default function BufferResizeDialog({
  isOpen,
  onClose,
  onConfirm,
  event,
  newBuffer,
  isSaving = false,
}: BufferResizeDialogProps) {
  if (!event || newBuffer === null) return null;

  const oldBuffer = event.bufferDuration || 0;
  const diff = newBuffer - oldBuffer;
  const isIncrease = diff > 0;

  // Timestamps
  const availableOld = addMinutes(event.end, oldBuffer);
  const availableNew = addMinutes(event.end, newBuffer);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-slate-200 rounded-lg shadow-xl">
        <div className="p-5 border-b border-slate-100 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 text-base">
              <Sparkles className="w-4 h-4 text-amber-500" />
              Update Turnaround Time
            </DialogTitle>
            <DialogDescription className="text-xs">
              Adjust the required maintenance buffer after this booking.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 bg-slate-50/50 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4">
            {/* FROM */}
            <div className="flex flex-col flex-1 items-center p-3 bg-white rounded-md border border-slate-200 shadow-sm">
              <div className="text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-wider">
                Current Buffer
              </div>
              <div className="text-base font-black text-slate-700">
                {oldBuffer / 60}h
              </div>
              <div className="text-[10px] font-medium text-slate-500 mt-1">
                Free at {format(availableOld, "h:mm a")}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

            {/* TO */}
            <div className="flex flex-col flex-1 items-center p-3 bg-blue-50/50 rounded-md border border-blue-200 shadow-sm">
              <div className="text-[9px] uppercase font-bold text-blue-500 mb-1 tracking-wider">
                New Buffer
              </div>
              <div className="text-base font-black text-blue-700">
                {newBuffer / 60}h
              </div>
              <div className="text-[10px] font-medium text-blue-600 mt-1">
                Free at {format(availableNew, "h:mm a")}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border ${
                isIncrease
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              {isIncrease
                ? `Adding ${diff / 60}h of maintenance`
                : `Reducing maintenance by ${Math.abs(diff) / 60}h`}
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
            onClick={onConfirm}
            disabled={isSaving}
            className="text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm"
          >
            {isSaving ? "Updating..." : "Confirm Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
