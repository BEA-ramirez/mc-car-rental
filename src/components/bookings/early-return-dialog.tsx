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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

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
    // Safety: Actual return cannot be before start
    const actualReturnDate = today < event.start ? event.start : today;

    // 1. Calculate Billing (24h Cycles)
    const originalHours = differenceInHours(event.end, event.start);
    const originalDays = Math.ceil(originalHours / 24) || 1;

    const usedMinutes = differenceInMinutes(actualReturnDate, event.start);
    const usedHours = usedMinutes / 60;

    // Round UP to nearest day
    const chargeableDays = Math.max(1, Math.ceil(usedHours / 24));
    const daysUnused = Math.max(0, originalDays - chargeableDays);

    // 2. Money Math
    const dailyRate = (event.amount || 0) / originalDays;
    const newTotal = dailyRate * chargeableDays;
    const refundAmount = (event.amount || 0) - newTotal;

    // 3. Buffer / Availability Math
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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
            Early Return Checkout
          </DialogTitle>
          <DialogDescription>
            Confirm return time. The timeline and availability will be updated
            immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* TIMELINE VISUALIZATION */}
          <div className="bg-slate-50 p-4 rounded-lg border shadow-sm space-y-4">
            {/* Row 1: Return Time */}
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Scheduled End
                </span>
                <span className="font-mono text-sm text-slate-500 line-through decoration-red-400">
                  {format(event.end, "MMM d, h:mm a")}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <div className="flex flex-col items-end">
                <span className="text-[10px] uppercase font-bold text-emerald-600 tracking-wider">
                  Actual Return
                </span>
                <span className="font-mono text-lg font-bold text-emerald-700">
                  {format(calculation.actualReturnDate, "h:mm a")}
                </span>
                <span className="text-[10px] text-slate-500">Today</span>
              </div>
            </div>

            {/* Row 2: Availability (Buffer) Logic */}
            {calculation.bufferMins > 0 && (
              <div className="bg-white border border-slate-200 rounded-md p-2 flex items-center gap-3">
                <div className="bg-slate-100 p-1.5 rounded text-slate-500">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex flex-col text-xs">
                  <span className="font-semibold text-slate-700">
                    Unit Maintenance ({calculation.bufferMins / 60}h)
                  </span>
                  <span className="text-slate-500">
                    Available for next booking at:{" "}
                    <b className="text-slate-700">
                      {format(calculation.availableAt, "h:mm a")}
                    </b>
                  </span>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* BILLING SECTION */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch
                  id="refund-mode"
                  checked={shouldRefund}
                  onCheckedChange={setShouldRefund}
                  disabled={calculation.daysUnused === 0}
                />
                <Label htmlFor="refund-mode" className="text-sm font-medium">
                  Refund Unused Days ({calculation.daysUnused})
                </Label>
              </div>
            </div>

            {shouldRefund && calculation.daysUnused > 0 && (
              <div className="bg-slate-50 border rounded-md p-3 space-y-2 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>New Total ({calculation.chargeableDays} days):</span>
                  <span>
                    ₱
                    {calculation.newTotal.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <Separator className="my-1" />
                <div className="flex justify-between font-bold text-slate-800">
                  <span>Refund to Customer:</span>
                  <span className="text-emerald-600">
                    - ₱
                    {calculation.refundAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            )}

            {!shouldRefund && calculation.daysUnused > 0 && (
              <div className="bg-blue-50 border border-blue-100 text-blue-800 text-xs p-3 rounded-md flex gap-2 items-start">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Returning early <b>without refund</b>. You keep the full ₱
                  {(event.amount || 0).toLocaleString()}.
                </span>
              </div>
            )}

            {calculation.daysUnused === 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-md flex gap-2 items-center">
                <Clock className="w-4 h-4" />
                <span>
                  Customer started a new 24h cycle (
                  {calculation.usedHours.toFixed(1)} hrs used). No refund
                  applicable.
                </span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            onClick={() =>
              onConfirm(
                shouldRefund ? calculation.refundAmount : 0,
                shouldRefund,
              )
            }
            disabled={isProcessing}
            className="bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isProcessing ? "Processing..." : "Confirm & Free Up Unit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
