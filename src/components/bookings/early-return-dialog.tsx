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
      <DialogContent className="sm:max-w-[450px] p-0 overflow-hidden border-slate-200 rounded-lg shadow-xl">
        <div className="p-5 border-b border-slate-100 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800 text-base">
              <CheckCircle2 className="w-4 h-4" />
              Process Early Return
            </DialogTitle>
            <DialogDescription className="text-xs">
              Finalize return time and calculate potential refunds.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 bg-slate-50/50 flex flex-col gap-5">
          {/* TIMELINE VISUALIZATION */}
          <div className="bg-white p-3.5 rounded-md border border-slate-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                  Scheduled Return
                </span>
                <span className="text-xs font-semibold text-slate-500 line-through decoration-slate-300 mt-0.5">
                  {format(new Date(event.end), "MMM d, h:mm a")}
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300" />
              <div className="flex flex-col items-end">
                <span className="text-[9px] uppercase font-bold text-emerald-600 tracking-wider">
                  Actual Return
                </span>
                <span className="text-sm font-black text-emerald-700 mt-0.5">
                  {format(calculation.actualReturnDate, "h:mm a")}
                </span>
                <span className="text-[10px] font-medium text-emerald-600/80">
                  Today
                </span>
              </div>
            </div>

            {calculation.bufferMins > 0 && (
              <div className="bg-slate-50 border border-slate-100 rounded p-2 flex items-center gap-2 mt-2">
                <div className="bg-white p-1 rounded border border-slate-200 text-slate-400 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-600">
                    +{calculation.bufferMins / 60}h Turnaround Buffer
                  </span>
                  <span className="text-[9px] font-medium text-slate-500">
                    Next available:{" "}
                    <b className="text-slate-700">
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
                  className="text-xs font-bold text-slate-700 cursor-pointer"
                >
                  Refund Unused Days ({calculation.daysUnused})
                </Label>
              </div>
            </div>

            {shouldRefund && calculation.daysUnused > 0 && (
              <div className="bg-white border border-slate-200 rounded-md p-3 space-y-2 text-xs shadow-sm">
                <div className="flex justify-between text-slate-500 font-medium">
                  <span>
                    Recalculated Rate ({calculation.chargeableDays} days)
                  </span>
                  <span>
                    ₱{" "}
                    {calculation.newTotal.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
                <Separator className="border-slate-100" />
                <div className="flex justify-between font-black text-slate-800 text-sm">
                  <span>Refund Amount</span>
                  <span className="text-emerald-600">
                    - ₱{" "}
                    {calculation.refundAmount.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </div>
            )}

            {!shouldRefund && calculation.daysUnused > 0 && (
              <div className="bg-blue-50 border border-blue-100 text-blue-800 text-[11px] font-medium p-2.5 rounded-md flex gap-2 items-start shadow-sm">
                <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                <span>
                  Returning early without refund. System will log the full
                  original payment of{" "}
                  <b>₱{(event.amount || 0).toLocaleString()}</b>.
                </span>
              </div>
            )}

            {calculation.daysUnused === 0 && (
              <div className="bg-slate-100 border border-slate-200 text-slate-600 text-[11px] font-medium p-2.5 rounded-md flex gap-2 items-center shadow-sm">
                <Clock className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Current 24h cycle already started (
                  {calculation.usedHours.toFixed(1)}h used). No refund
                  applicable.
                </span>
              </div>
            )}
          </div>
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
            onClick={() =>
              onConfirm(
                shouldRefund ? calculation.refundAmount : 0,
                shouldRefund,
              )
            }
            disabled={isProcessing}
            className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
          >
            {isProcessing ? "Processing..." : "Confirm Return"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
