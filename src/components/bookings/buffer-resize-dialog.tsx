"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SchedulerEvent } from "@/components/scheduler/timeline-scheduler";
import { ArrowRight, Sparkles } from "lucide-react";
import { format, addMinutes } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

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
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-border bg-background rounded-xl shadow-2xl transition-colors duration-300">
        <div className="p-4 border-b border-border bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-xs font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Update Turnaround
            </DialogTitle>
            <DialogDescription className="text-[10px] font-medium text-muted-foreground mt-1">
              Adjust the required maintenance buffer after this booking.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 bg-background flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            {/* FROM */}
            <div className="flex flex-col flex-1 items-center p-2.5 bg-card rounded-lg border border-border shadow-sm">
              <div className="text-[9px] uppercase font-bold text-muted-foreground mb-0.5 tracking-widest">
                Current Buffer
              </div>
              <div className="text-sm font-black text-foreground font-mono">
                {oldBuffer / 60}h
              </div>
              <div className="text-[9px] font-semibold text-muted-foreground mt-1">
                Free at {format(availableOld, "h:mm a")}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />

            {/* TO */}
            <div className="flex flex-col flex-1 items-center p-2.5 bg-primary/10 rounded-lg border border-primary/30 shadow-sm">
              <div className="text-[9px] uppercase font-bold text-primary mb-0.5 tracking-widest">
                New Buffer
              </div>
              <div className="text-sm font-black text-primary font-mono">
                {newBuffer / 60}h
              </div>
              <div className="text-[9px] font-semibold text-primary/80 mt-1">
                Free at {format(availableNew, "h:mm a")}
              </div>
            </div>
          </div>

          <div className="flex justify-center mt-1">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border rounded-md",
                isIncrease
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
              )}
            >
              {isIncrease
                ? `Adding ${diff / 60}h of maintenance`
                : `Reducing maintenance by ${Math.abs(diff) / 60}h`}
            </Badge>
          </div>
        </div>

        <div className="p-3 bg-card border-t border-border flex justify-end gap-2">
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
            onClick={onConfirm}
            disabled={isSaving}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-sm transition-opacity"
          >
            {isSaving ? "Updating..." : "Confirm Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
