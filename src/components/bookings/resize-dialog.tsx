"use client";

import React, { useState, useMemo } from "react";
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
import { cn } from "@/lib/utils";

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
      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden border-border bg-background rounded-xl shadow-2xl transition-colors duration-300">
        <div className="p-4 border-b border-border bg-card transition-colors">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-sm font-bold uppercase tracking-wider">
              <CalendarClock className="w-4 h-4 text-primary" />
              Confirm Booking Change
            </DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-muted-foreground mt-1">
              You are manually adjusting the end date for{" "}
              <b className="text-foreground font-bold">{event.title}</b>.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 bg-background flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3">
            {/* FROM */}
            <div className="flex flex-col flex-1 items-center p-2.5 bg-card rounded-lg border border-border shadow-sm text-center transition-colors">
              <span className="text-[9px] uppercase font-bold text-muted-foreground mb-1 tracking-widest">
                Current End
              </span>
              <div className="font-bold text-xs text-foreground leading-tight">
                {format(new Date(event.end), "MMM d, yyyy")}
              </div>
              <div className="text-[10px] font-medium text-muted-foreground mt-0.5">
                {format(new Date(event.end), "h:mm a")}
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />

            {/* TO */}
            <div className="flex flex-col flex-1 items-center p-2.5 bg-primary/10 rounded-lg border border-primary/30 shadow-sm text-center transition-colors">
              <span className="text-[9px] uppercase font-bold text-primary mb-1 tracking-widest">
                New End
              </span>
              <div className="font-bold text-xs text-primary leading-tight">
                {format(newEnd, "MMM d, yyyy")}
              </div>
              <div className="text-[10px] font-medium text-primary/80 mt-0.5">
                {format(newEnd, "h:mm a")}
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 border rounded-md",
                isExtension
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20",
              )}
            >
              {isExtension
                ? `Extending by ${diffDays} Day(s)`
                : `Shortening by ${Math.abs(diffDays)} Day(s)`}
            </Badge>
          </div>

          {!isExtension && (
            <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-medium p-2.5 rounded-lg flex gap-2 items-start shadow-sm mt-1 transition-colors">
              <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
              <span className="leading-relaxed">
                Shortening a booking does not automatically issue a refund.
                Review financials manually.
              </span>
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
            onClick={onConfirm}
            disabled={isSaving}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
          >
            {isSaving ? "Updating..." : "Confirm Update"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
