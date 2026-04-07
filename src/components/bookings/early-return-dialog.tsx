"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SchedulerEvent } from "@/components/scheduler/timeline-scheduler";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  format,
  differenceInHours,
  differenceInMinutes,
  addMinutes,
} from "date-fns";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type EarlyReturnDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (refundAmount: number, shouldRefund: boolean) => void;
  event: SchedulerEvent | null;
  isProcessing?: boolean;
};

export default function EarlyReturnDialog({
  isOpen,
  onClose,
  onConfirm,
  event,
  isProcessing = false,
}: EarlyReturnDialogProps) {
  const [shouldRefund, setShouldRefund] = useState(true);

  const calculation = useMemo(() => {
    if (!event) return null;

    const today = new Date();
    const actualReturnDate =
      today < new Date(event.start) ? new Date(event.start) : today;

    const originalHours = differenceInHours(
      new Date(event.end),
      new Date(event.start),
    );
    const originalDays = Math.ceil(originalHours / 24) || 1;

    const usedMinutes = differenceInMinutes(
      actualReturnDate,
      new Date(event.start),
    );
    const usedHours = usedMinutes / 60;

    const chargeableDays = Math.max(1, Math.ceil(usedHours / 24));
    const daysUnused = Math.max(0, originalDays - chargeableDays);

    const dailyRate = (event.amount || 0) / originalDays;
    const newTotal = dailyRate * chargeableDays;
    const refundAmount = (event.amount || 0) - newTotal;

    const bufferMins = event.bufferDuration || 0;
    const availableAt = addMinutes(actualReturnDate, bufferMins);

    return {
      actualReturnDate,
      availableAt,
      bufferMins,
      originalDays,
      chargeableDays,
      daysUnused,
      newTotal,
      refundAmount,
      dailyRate,
      usedHours,
    };
  }, [event]);

  if (!event || !calculation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-border bg-background rounded-xl shadow-2xl transition-colors duration-300">
        <div className="p-4 border-b border-border bg-card transition-colors">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-sm font-bold uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              Process Early Return
            </DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-muted-foreground mt-1">
              Finalize return time and calculate potential refunds.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 bg-background flex flex-col gap-4">
          {/* TIMELINE VISUALIZATION */}
          <div className="bg-card p-3 rounded-xl border border-border shadow-sm space-y-3 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-muted-foreground tracking-widest">
                  Scheduled Return
                </span>
                <span className="text-[11px] font-semibold text-muted-foreground/70 line-through decoration-muted-foreground/40 mt-0.5">
                  {format(new Date(event.end), "MMM d, h:mm a")}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-muted-foreground/50 shrink-0" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase font-bold text-emerald-600 dark:text-emerald-400 tracking-widest">
                  Actual Return
                </span>
                <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 mt-0.5 leading-none">
                  {format(calculation.actualReturnDate, "h:mm a")}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-widest text-emerald-600/70 dark:text-emerald-400/70 mt-1">
                  Today
                </span>
              </div>
            </div>

            {calculation.bufferMins > 0 && (
              <div className="bg-secondary/50 border border-border rounded-lg p-2 flex items-center gap-2 mt-1">
                <div className="bg-card p-1 rounded-md border border-border text-muted-foreground shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">
                    +{calculation.bufferMins / 60}h Turnaround Buffer
                  </span>
                  <span className="text-[9px] font-medium text-muted-foreground">
                    Next available:{" "}
                    <b className="text-foreground font-bold">
                      {format(calculation.availableAt, "h:mm a")}
                    </b>
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* BILLING SECTION */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="refund-mode"
                  checked={shouldRefund}
                  onCheckedChange={setShouldRefund}
                  disabled={calculation.daysUnused === 0}
                  className="scale-75 data-[state=checked]:bg-emerald-500"
                />
                <Label
                  htmlFor="refund-mode"
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-widest cursor-pointer select-none",
                    shouldRefund ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  Refund Unused Days ({calculation.daysUnused})
                </Label>
              </div>
            </div>

            {shouldRefund && calculation.daysUnused > 0 && (
              <div className="bg-card border border-border rounded-xl p-3 space-y-2 text-[11px] shadow-sm transition-colors">
                <div className="flex justify-between font-semibold text-muted-foreground">
                  <span>
                    Recalculated Rate ({calculation.chargeableDays} days)
                  </span>
                  <span className="font-mono">
                    ₱{" "}
                    {calculation.newTotal.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <Separator className="bg-border" />
                <div className="flex justify-between font-bold text-foreground text-xs uppercase tracking-wider">
                  <span>Refund Amount</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono font-black">
                    - ₱{" "}
                    {calculation.refundAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            )}

            {!shouldRefund && calculation.daysUnused > 0 && (
              <div className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-medium p-2.5 rounded-lg flex gap-2 items-start shadow-sm">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Returning early without refund. System will log the full
                  original payment of{" "}
                  <b className="font-bold">
                    ₱{(event.amount || 0).toLocaleString()}
                  </b>
                  .
                </span>
              </div>
            )}

            {calculation.daysUnused === 0 && (
              <div className="bg-secondary border border-border text-muted-foreground text-[10px] font-medium p-2.5 rounded-lg flex gap-2 items-start shadow-sm">
                <Clock className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span className="leading-relaxed">
                  Current 24h cycle already started (
                  <b className="font-bold">
                    {calculation.usedHours.toFixed(1)}h
                  </b>{" "}
                  used). No refund applicable.
                </span>
              </div>
            )}
          </div>
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
            onClick={() =>
              onConfirm(
                shouldRefund ? calculation.refundAmount : 0,
                shouldRefund,
              )
            }
            disabled={isProcessing}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm rounded-lg transition-colors"
          >
            {isProcessing ? "Processing..." : "Confirm Return"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
