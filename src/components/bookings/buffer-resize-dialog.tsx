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
import { ArrowRight, Clock, Sparkles } from "lucide-react";
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-slate-700">
            <Sparkles className="w-5 h-5 text-amber-500" />
            Update Maintenance Buffer
          </DialogTitle>
          <DialogDescription>
            Adjust the cleaning or maintenance time for this booking.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-4 my-4">
          {/* FROM */}
          <div className="flex flex-col items-center p-3 bg-slate-50 rounded-lg border">
            <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
              Current
            </div>
            <div className="text-lg font-bold text-slate-700">
              {oldBuffer / 60}h
            </div>
            <div className="text-[10px] text-slate-400">
              Free at {format(availableOld, "h:mm a")}
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-slate-300" />

          {/* TO */}
          <div className="flex flex-col items-center p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="text-[10px] uppercase font-bold text-blue-600 mb-1">
              New
            </div>
            <div className="text-lg font-bold text-blue-700">
              {newBuffer / 60}h
            </div>
            <div className="text-[10px] text-blue-400">
              Free at {format(availableNew, "h:mm a")}
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <Badge variant={isIncrease ? "secondary" : "outline"}>
            {isIncrease
              ? `Adding ${diff / 60} hours`
              : `Reducing ${Math.abs(diff) / 60} hours`}
          </Badge>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={isSaving}>
            {isSaving ? "Updating..." : "Confirm Time"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
