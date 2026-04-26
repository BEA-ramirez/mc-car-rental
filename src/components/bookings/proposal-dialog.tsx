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
  Receipt,
} from "lucide-react";
import { format, differenceInMinutes } from "date-fns";

type ProposalDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (agreedPrice: number) => void;
  original: SchedulerEvent | null;
  proposed: SchedulerEvent | null;
  isSending?: boolean;
  // Pricing calculation props
  newCar24hRate: number;
  newCar12hRate: number;
  // NEW: Explicit naming props so the UI never guesses
  originalCarName?: string;
  proposedCarName?: string;
};

export default function ProposalDialog({
  isOpen,
  onClose,
  onConfirm,
  original,
  proposed,
  isSending = false,
  newCar24hRate,
  newCar12hRate,
  originalCarName,
  proposedCarName,
}: ProposalDialogProps) {
  const [priceInput, setPriceInput] = useState<string>("0");
  const [autoCalculatedPrice, setAutoCalculatedPrice] = useState<number>(0);
  const [priceBreakdown, setPriceBreakdown] = useState<string>("");

  // Auto-calculate the new price and the breakdown blocks
  useEffect(() => {
    if (isOpen && original && proposed) {
      const diffMins = differenceInMinutes(
        new Date(proposed.end),
        new Date(proposed.start),
      );
      const diffHours = diffMins / 60;

      const fullDays = Math.floor(diffHours / 24);
      const remainderHours = diffHours % 24;

      let newBasePrice = 0;
      const labels: string[] = [];

      if (fullDays > 0) {
        newBasePrice += fullDays * newCar24hRate;
        labels.push(`${fullDays}x 24h Block`);
      }

      if (remainderHours > 0) {
        if (remainderHours <= 12 && newCar12hRate > 0) {
          newBasePrice += newCar12hRate;
          labels.push("1x 12h Block");
        } else {
          newBasePrice += newCar24hRate;
          labels.push("1x 24h Block");
        }
      }

      setAutoCalculatedPrice(newBasePrice);
      setPriceBreakdown(labels.length > 0 ? `(${labels.join(" + ")})` : "");
      setPriceInput(newBasePrice.toString());
    }
  }, [isOpen, original, proposed, newCar24hRate, newCar12hRate]);

  if (!original || !proposed) return null;

  const handleConfirm = () => {
    const finalPrice = parseFloat(priceInput) || 0;
    onConfirm(finalPrice);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-border bg-background rounded-xl shadow-2xl transition-colors duration-300">
        <div className="p-4 border-b border-border bg-card transition-colors">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground text-sm font-bold uppercase tracking-wider">
              <Car className="w-4 h-4 text-primary" />
              Confirm Vehicle Reassignment
            </DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-muted-foreground mt-1">
              You are moving this booking to a new unit. The system has
              calculated the new base rate, but you can adjust the final total.
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="p-4 bg-background flex flex-col gap-4">
          <div className="flex items-stretch justify-between gap-3">
            {/* ORIGINAL */}
            <div className="flex flex-col flex-1 p-3 bg-card rounded-xl border border-border shadow-sm opacity-70 transition-colors">
              <div className="text-[9px] uppercase font-bold text-muted-foreground mb-2 tracking-widest border-b border-border pb-1.5">
                Original Booking
              </div>
              <div className="space-y-2.5">
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-0.5">
                    Previous Unit
                  </div>
                  <div className="font-semibold text-[11px] text-foreground flex items-center gap-1.5">
                    <Car className="w-3 h-3 text-muted-foreground" />{" "}
                    <span className="truncate">
                      {originalCarName || original.subtitle || "Unknown Unit"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-0.5">
                    Date
                  </div>
                  <div className="font-semibold text-[11px] text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-muted-foreground" />{" "}
                    {format(new Date(original.start), "MMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest mb-0.5">
                    Original Total
                  </div>
                  <div className="font-semibold text-[11px] text-foreground flex items-center gap-1.5">
                    <Receipt className="w-3 h-3 text-muted-foreground" /> ₱{" "}
                    {original.amount?.toLocaleString() || "0"}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center shrink-0">
              <ArrowRight className="w-4 h-4 text-muted-foreground/50" />
            </div>

            {/* PROPOSED NEW UNIT */}
            <div className="flex flex-col flex-1 p-3 bg-primary/5 rounded-xl border border-primary/30 shadow-sm relative overflow-hidden transition-colors">
              <div className="text-[9px] uppercase font-bold text-primary mb-2 tracking-widest border-b border-primary/20 pb-1.5">
                New Assignment
              </div>
              <div className="space-y-2.5 relative z-10">
                <div>
                  <div className="text-[9px] font-bold text-primary/70 uppercase tracking-widest mb-0.5">
                    New Unit
                  </div>
                  <div className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                    <Car className="w-3 h-3 text-primary" />{" "}
                    <span className="truncate">
                      {proposedCarName || proposed.subtitle || "Unknown Unit"}
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-[9px] font-bold text-primary/70 uppercase tracking-widest mb-0.5">
                    Date
                  </div>
                  <div className="font-bold text-[11px] text-foreground flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-primary" />{" "}
                    {format(new Date(proposed.start), "MMM d, yyyy")}
                  </div>
                </div>
                <div>
                  <Label
                    htmlFor="proposed-price"
                    className="text-[9px] font-bold text-primary/70 uppercase tracking-widest mb-1 block"
                  >
                    Final Price
                    <span className="block mt-0.5 text-[8px] text-muted-foreground/80 normal-case tracking-normal font-medium leading-tight">
                      Calc: ₱{autoCalculatedPrice.toLocaleString()}{" "}
                      {priceBreakdown}
                    </span>
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-[11px]">
                      ₱
                    </span>
                    <Input
                      id="proposed-price"
                      type="number"
                      value={priceInput}
                      onChange={(e) => setPriceInput(e.target.value)}
                      className="h-8 pl-6 text-[11px] font-bold font-mono text-foreground bg-card border-border focus-visible:ring-primary shadow-sm rounded-lg transition-colors"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[10px] p-3 rounded-xl flex gap-2.5 items-start shadow-sm transition-colors">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-emerald-600" />
            <div className="flex flex-col gap-0.5">
              <span className="font-bold uppercase tracking-widest text-[9px] text-emerald-700/80 dark:text-emerald-400/80 mb-0.5">
                Immediate Override
              </span>
              <span className="font-medium leading-relaxed">
                This will immediately bypass the customer and set the booking
                status to <b className="font-bold">CONFIRMED</b> for the new
                vehicle. Make sure you have verbally agreed on this change and
                the final price with the customer.
              </span>
            </div>
          </div>
        </div>

        <div className="p-3 bg-card border-t border-border flex justify-end gap-2 transition-colors">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSending}
            className="h-8 text-[10px] font-semibold bg-card text-foreground hover:bg-secondary border-border rounded-lg shadow-none transition-colors"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={isSending}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
          >
            {isSending ? "Processing..." : "Confirm Reassignment"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
