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
import { ArrowRight, Car, Calendar, AlertTriangle, Send } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

type ProposalDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  original: SchedulerEvent | null;
  proposed: SchedulerEvent | null;
  isSending?: boolean;
};

export default function ProposalDialog({
  isOpen,
  onClose,
  onConfirm,
  original,
  proposed,
  isSending = false,
}: ProposalDialogProps) {
  if (!original || !proposed) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5 text-blue-600" />
            Send Booking Proposal
          </DialogTitle>
          <DialogDescription>
            There is a conflict with the original booking. Send a proposal to
            switch the customer to a different unit.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-[1fr_auto_1fr] gap-2 items-center my-4">
          {/* ORIGINAL */}
          <div className="bg-slate-50 border rounded-lg p-4 space-y-3 opacity-70">
            <Badge
              variant="outline"
              className="bg-white text-xs text-slate-500 mb-1"
            >
              Current Request
            </Badge>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Unit
              </div>
              <div className="font-bold text-sm flex items-center gap-2">
                <Car className="w-4 h-4 text-slate-400" />
                {original.subtitle}{" "}
                {/* Assuming subtitle holds the car name logic from your mapper */}
                {/* Note: In your mapper, title is User, Subtitle is Status. 
                    We might need to pass the Car Name explicitly or fetch it. 
                    For now, I'll use a placeholder if resourceId matches logic 
                */}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
                Date
              </div>
              <div className="text-sm font-medium flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                {format(original.start, "MMM d")}
              </div>
            </div>
          </div>

          {/* ARROW */}
          <div className="flex justify-center">
            <ArrowRight className="w-6 h-6 text-slate-300" />
          </div>

          {/* PROPOSED */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-100/50 rounded-bl-full -mr-8 -mt-8" />
            <Badge className="bg-blue-600 hover:bg-blue-700 text-xs mb-1">
              Proposed Change
            </Badge>
            <div className="space-y-1 relative z-10">
              <div className="text-xs text-blue-600/80 font-semibold uppercase tracking-wider">
                Unit
              </div>
              <div className="font-bold text-sm text-blue-900 flex items-center gap-2">
                <Car className="w-4 h-4 text-blue-500" />
                {proposed.subtitle} {/* Should be the new Car Name */}
              </div>
            </div>
            <div className="space-y-1 relative z-10">
              <div className="text-xs text-blue-600/80 font-semibold uppercase tracking-wider">
                Date
              </div>
              <div className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-500" />
                {format(proposed.start, "MMM d")}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-100 rounded-md p-3 flex gap-3 items-start">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <p className="font-semibold mb-1">What happens next?</p>
            The customer will receive an email/SMS with this proposal. The
            booking status will change to{" "}
            <span className="font-bold">"Proposed"</span> until they accept.
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isSending}>
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={isSending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSending ? "Sending..." : "Send Proposal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
