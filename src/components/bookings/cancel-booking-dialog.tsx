"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "../ui/badge";
import { cn } from "@/lib/utils";

import { useBookings } from "../../../hooks/use-bookings";

type CancelBookingDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
  amountPaid: number;
};

export default function CancelBookingDialog({
  isOpen,
  onClose,
  bookingId,
  amountPaid,
}: CancelBookingDialogProps) {
  const { cancelBooking, isCancelling } = useBookings();
  const [reason, setReason] = useState("");
  const [refundAction, setRefundAction] = useState<"forfeit" | "refund">(
    "forfeit",
  );
  const [refundMethod, setRefundMethod] = useState<string>("GCash");

  // State for the editable amount
  const [processAmount, setProcessAmount] = useState<number | "">(amountPaid);

  // Reset amount when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setProcessAmount(amountPaid);
      setReason("");
      setRefundAction("forfeit");
    }
  }, [isOpen, amountPaid]);

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }

    const finalAmount = Number(processAmount);
    if (processAmount === "" || finalAmount < 0 || finalAmount > amountPaid) {
      toast.error(
        `Amount must be between ₱0 and ₱${amountPaid.toLocaleString()}`,
      );
      return;
    }

    try {
      await cancelBooking({
        bookingId,
        reason,
        refundAction,
        amountPaid: finalAmount, // Pass the EDITED amount to the backend
        refundMethod: refundAction === "refund" ? refundMethod : undefined,
      });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking.");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 border-red-500/20 shadow-2xl rounded-xl overflow-hidden bg-background">
        <div className="p-5 border-b border-border bg-red-500/5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-500 font-bold uppercase tracking-widest text-sm">
              <AlertTriangle className="w-5 h-5" /> Cancel Booking
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-muted-foreground mt-2">
              You are about to permanently cancel booking{" "}
              <span className="font-mono text-foreground font-bold">
                {bookingId.split("-")[0]}
              </span>
              . This will free up the vehicle on the calendar.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 space-y-6">
          {/* Reservation Fee Handling */}
          {amountPaid > 0 ? (
            <div className="space-y-4 border border-border p-4 rounded-lg bg-secondary/30">
              <div className="flex items-center justify-between">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Handling Reservation Fee
                </Label>
                <Badge
                  variant="outline"
                  className="text-[9px] font-mono bg-background"
                >
                  Max: ₱{amountPaid.toLocaleString()}
                </Badge>
              </div>

              <RadioGroup
                value={refundAction}
                onValueChange={(val: "forfeit" | "refund") => {
                  setRefundAction(val);
                  // If they switch back to forfeit, reset the amount to full automatically
                  if (val === "forfeit") {
                    setProcessAmount(amountPaid);
                  }
                }}
                className="flex flex-col gap-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="forfeit" id="forfeit" />
                  <Label
                    htmlFor="forfeit"
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="text-sm w-full font-bold text-foreground">
                      Forfeit Downpayment
                    </span>
                    <span className="text-[10px]  text-muted-foreground mt-0.5">
                      Keep the entire amount as a cancellation penalty.
                    </span>
                  </Label>
                </div>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="refund" id="refund" />
                    <Label
                      htmlFor="refund"
                      className="flex flex-col cursor-pointer"
                    >
                      <span className="text-sm w-full font-bold text-foreground">
                        Refund Downpayment
                      </span>
                      <span className="text-[10px] text-muted-foreground mt-0.5">
                        Return the amount to the customer (Full or Partial).
                      </span>
                    </Label>
                  </div>

                  {/* ONLY SHOW METHOD & AMOUNT IF REFUND IS SELECTED */}
                  {refundAction === "refund" && (
                    <div className="flex items-start justify-between w-full gap-3 pl-7 pt-2 animate-in fade-in slide-in-from-top-1 space-y-4">
                      {/* Refund Method */}
                      <div className="w-full">
                        <Label className="text-[10px] font-bold text-muted-foreground mb-1.5 block">
                          REFUND METHOD
                        </Label>
                        <Select
                          value={refundMethod}
                          onValueChange={setRefundMethod}
                        >
                          <SelectTrigger className="h-8 w-full text-xs bg-card">
                            <SelectValue placeholder="Select method" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="GCash">GCash</SelectItem>
                            <SelectItem value="Bank Transfer">
                              Bank Transfer
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Refund Amount */}
                      <div className="w-full">
                        <Label className="text-[10px] font-bold text-muted-foreground mb-1.5 block">
                          AMOUNT TO REFUND
                        </Label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                            ₱
                          </span>
                          <Input
                            type="number"
                            value={processAmount}
                            onChange={(e) =>
                              setProcessAmount(
                                e.target.value === ""
                                  ? ""
                                  : Number(e.target.value),
                              )
                            }
                            className="pl-7 h-9 text-xs font-bold bg-card"
                            max={amountPaid}
                            min={0}
                          />
                        </div>

                        {/* Helper text for partial refunds */}
                        {typeof processAmount === "number" &&
                          processAmount < amountPaid && (
                            <p className="text-[9px] text-amber-600 dark:text-amber-400 mt-2 font-medium bg-amber-500/10 p-1.5 rounded border border-amber-500/20">
                              * Note: The remaining ₱
                              {(amountPaid - processAmount).toLocaleString()}{" "}
                              will be permanently forfeited.
                            </p>
                          )}
                      </div>
                    </div>
                  )}
                </div>
              </RadioGroup>
            </div>
          ) : (
            <div className="p-3 bg-secondary/30 border border-border rounded-lg text-xs text-muted-foreground text-center font-medium">
              No reservation fee was paid for this booking.
            </div>
          )}

          {/* Reason Input */}
          <div className="space-y-2">
            <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Reason for Cancellation <span className="text-red-500">*</span>
            </Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Customer no-show, Customer requested partial refund..."
              className="resize-none h-20 text-xs bg-card"
            />
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isCancelling}
            className="h-9 text-xs font-semibold shadow-none"
          >
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isCancelling || !reason.trim() || processAmount === ""}
            className="h-9 text-xs font-bold uppercase tracking-widest shadow-sm"
          >
            {isCancelling ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            Confirm Cancellation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
