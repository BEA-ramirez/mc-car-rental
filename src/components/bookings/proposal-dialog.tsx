"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SchedulerEvent } from "@/components/scheduler/timeline-scheduler";
import {
  ArrowRight,
  Car,
  Calendar,
  AlertTriangle,
  Send,
  Receipt,
} from "lucide-react";
import { format } from "date-fns";

type ProposalDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (agreedPrice: number) => void;
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
  const [priceInput, setPriceInput] = useState<string>("0");

  useEffect(() => {
    if (isOpen && original) {
      setPriceInput(original.amount?.toString() || "0");
    }
  }, [isOpen, original]);

  if (!original || !proposed) return null;

  const handleConfirm = () => {
    const finalPrice = parseFloat(priceInput) || 0;
    onConfirm(finalPrice);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-slate-200 rounded-lg shadow-xl">
        <div className="p-5 border-b border-slate-100 bg-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-slate-800 text-base">
              <Send className="w-4 h-4 text-blue-600" />
              Send Booking Proposal
            </DialogTitle>
            <DialogDescription className="text-xs">
              Resolve conflict by proposing a new unit. Price can be adjusted
              before sending.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-5 bg-slate-50/50 flex flex-col gap-4">
          <div className="flex items-stretch justify-between gap-3">
            {/* ORIGINAL */}
            <div className="flex flex-col flex-1 p-3 bg-white rounded-md border border-slate-200 shadow-sm opacity-80">
              <div className="text-[9px] uppercase font-bold text-slate-400 mb-2 tracking-wider border-b border-slate-100 pb-1">
                Current Request
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Unit
                  </div>
                  <div className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                    <Car className="w-3 h-3 text-slate-400" />{" "}
                    {original.subtitle}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Date
                  </div>
                  <div className="font-semibold text-xs text-slate-600 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-slate-400" />{" "}
                    {format(new Date(original.start), "MMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                    Original Price
                  </div>
                  <div className="font-semibold text-xs text-slate-600 flex items-center gap-1.5">
                    <Receipt className="w-3 h-3 text-slate-400" /> ₱{" "}
                    {original.amount?.toLocaleString() || "0"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-slate-300" />
            </div>

            {/* PROPOSED */}
            <div className="flex flex-col flex-1 p-3 bg-blue-50/50 rounded-md border border-blue-200 shadow-sm relative overflow-hidden">
              <div className="text-[9px] uppercase font-bold text-blue-600 mb-2 tracking-wider border-b border-blue-100 pb-1">
                Proposed Change
              </div>
              <div className="space-y-2.5 relative z-10">
                <div>
                  <div className="text-[9px] font-semibold text-blue-500/80 uppercase tracking-wider mb-0.5">
                    Unit
                  </div>
                  <div className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                    <Car className="w-3 h-3 text-blue-500" />{" "}
                    {proposed.subtitle}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-semibold text-blue-500/80 uppercase tracking-wider mb-0.5">
                    Date
                  </div>
                  <div className="font-semibold text-xs text-blue-800 flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-blue-500" />{" "}
                    {format(new Date(proposed.start), "MMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="proposed-price"
                    className="text-[9px] font-semibold text-blue-500/80 uppercase tracking-wider mb-0.5 block"
                  >
                    Proposed Price
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">
                      ₱
                    </span>
                    <Input
                      id="proposed-price"
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="h-7 pl-6 text-xs font-bold text-blue-900 bg-white border-blue-200 focus-visible:ring-blue-500 shadow-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 text-amber-800 text-[11px] p-2.5 rounded-md flex gap-2 items-start shadow-sm">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold uppercase tracking-wider text-[9px] text-amber-600">
                What happens next?
              </span>
              <span className="font-medium text-amber-700">
                The customer receives this proposal via Email/SMS. Booking
                status becomes{" "}
                <b className="text-amber-900">"Pending Proposal"</b> until
                accepted.
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSending}
            className="text-xs font-semibold text-slate-600"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isSending}
            className="text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
          >
            {isSending ? "Sending..." : "Send Proposal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
