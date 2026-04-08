"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Loader2, XCircle } from "lucide-react";
import { toast } from "sonner";
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
  const { cancelBooking } = useBookings();
  const [isProcessing, setIsProcessing] = useState(false);
  const [reason, setReason] = useState("");
  const [refundAction, setRefundAction] = useState<"forfeit" | "refund">(
    "forfeit",
  );

  const handleCancel = async () => {
    if (!reason.trim()) {
      toast.error("Please provide a reason for cancellation.");
      return;
    }
    setIsProcessing(true);
    try {
      await cancelBooking({ bookingId, reason, refundAction });
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Failed to cancel booking.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] p-0 border-red-500/20 shadow-2xl rounded-xl overflow-hidden bg-background">
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
            <div className="space-y-3 border border-border p-4 rounded-lg bg-secondary/30">
              <Label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Handling the ₱{amountPaid.toLocaleString()} Reservation Fee
              </Label>
              <RadioGroup
                value={refundAction}
                onValueChange={(val: "forfeit" | "refund") =>
                  setRefundAction(val)
                }
                className="flex flex-col gap-3"
              >
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="forfeit" id="forfeit" />
                  <Label
                    htmlFor="forfeit"
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="text-sm font-bold text-foreground">
                      Forfeit Downpayment
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Keep the ₱{amountPaid.toLocaleString()} as a cancellation
                      penalty.
                    </span>
                  </Label>
                </div>
                <div className="flex items-center space-x-3">
                  <RadioGroupItem value="refund" id="refund" />
                  <Label
                    htmlFor="refund"
                    className="flex flex-col cursor-pointer"
                  >
                    <span className="text-sm font-bold text-foreground">
                      Refund Downpayment
                    </span>
                    <span className="text-[10px] text-muted-foreground mt-0.5">
                      Return the ₱{amountPaid.toLocaleString()} to the customer.
                    </span>
                  </Label>
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
              placeholder="e.g., Customer no-show, Customer requested via phone..."
              className="resize-none h-20 text-xs bg-card"
            />
            <p className="text-[9px] text-muted-foreground italic">
              This reason will be included in the automated email to the
              customer.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-border bg-card flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isProcessing}
            className="h-9 text-xs font-semibold shadow-none"
          >
            Go Back
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isProcessing || !reason.trim()}
            className="h-9 text-xs font-bold uppercase tracking-widest shadow-sm"
          >
            {isProcessing ? (
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
