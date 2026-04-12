"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Download,
  Calendar as CalendarIcon,
  User,
  CheckCircle,
  FileText,
  Loader2,
  Receipt,
  Hash,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { generatePayoutPDF } from "@/utils/export-pdf";

import { useFinancials, usePayoutDetails } from "../../../hooks/use-financials";

type PayoutBreakdownModalProps = {
  isOpen: boolean;
  onClose: () => void;
  payout: any | null; // This is the lightweight row data passed from the table
};

export default function PayoutBreakdownModal({
  isOpen,
  onClose,
  payout,
}: PayoutBreakdownModalProps) {
  const payoutId = payout?.payout_id;

  // This hook calls our new get_payout_breakdown RPC
  const { data: details, isLoading } = usePayoutDetails(payoutId);
  const { markAsPaid, isMarkingPaid } = useFinancials();

  if (!payout) return null;

  const handleMarkAsPaid = async () => {
    if (!payoutId) return;
    try {
      await markAsPaid(payoutId);
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  // Safely extract the full RPC payload
  const fullPayout = details?.payout || payout;
  const bookings = details?.bookings || [];
  const maintenance = details?.maintenance || [];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl xl:max-w-[900px] gap-0! p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[85vh] max-h-[800px] transition-colors duration-300 [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              <Receipt className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                Payout Settlement
              </DialogTitle>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none font-mono">
                REF: {payoutId?.split("-")[0]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest rounded h-6 px-2 border transition-colors",
                fullPayout.status === "PAID"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
              )}
            >
              {fullPayout.status}
            </Badge>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* SPLIT BODY */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* LEFT: SUMMARY TOTALS */}
          <div className="w-[380px] bg-background flex flex-col border-r border-border shrink-0 h-full transition-colors">
            <ScrollArea className="flex-1 h-full custom-scrollbar">
              <div className="p-5 space-y-6">
                {/* Meta Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <User className="w-3 h-3" /> Fleet Owner
                    </span>
                    <span className="text-[11px] font-bold text-foreground block truncate">
                      {fullPayout.car_owner?.business_name ||
                        fullPayout.car_owner?.users?.full_name ||
                        "..."}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <CalendarIcon className="w-3 h-3" /> Period
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      {fullPayout.period_start
                        ? format(new Date(fullPayout.period_start), "MMM dd")
                        : ""}{" "}
                      -{" "}
                      {fullPayout.period_end
                        ? format(
                            new Date(fullPayout.period_end),
                            "MMM dd, yyyy",
                          )
                        : ""}
                    </span>
                  </div>

                  {/* Show Payment Details if Paid */}
                  {fullPayout.status === "PAID" && (
                    <>
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                          <CheckCircle className="w-3 h-3" /> Paid On
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                          {fullPayout.paid_at
                            ? format(
                                new Date(fullPayout.paid_at),
                                "MMM dd, yyyy",
                              )
                            : "N/A"}
                        </span>
                      </div>
                      <div>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                          <Hash className="w-3 h-3" /> Ledger ID
                        </span>
                        <span className="text-[11px] font-bold text-foreground font-mono">
                          {fullPayout.transaction_id?.split("-")[0] || "N/A"}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <hr className="border-border" />

                {/* Financial Summary */}
                <div>
                  <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-4">
                    Calculation Summary
                  </h4>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 text-muted-foreground/30 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Gross Revenue ({bookings.length} trips)
                        </span>
                        <span className="text-[11px] font-bold text-foreground font-mono">
                          ₱{" "}
                          {Number(
                            fullPayout.total_revenue || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Company Share (
                          {fullPayout.car_owner?.revenue_share_percentage
                            ? 100 -
                              fullPayout.car_owner.revenue_share_percentage
                            : 0}
                          %)
                        </span>
                        <span className="text-[11px] font-bold text-destructive font-mono">
                          - ₱{" "}
                          {Number(
                            fullPayout.commission_deducted || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Maintenance Deductions
                        </span>
                        <span className="text-[11px] font-bold text-destructive font-mono">
                          - ₱{" "}
                          {maintenance
                            .reduce(
                              (sum: number, m: any) => sum + Number(m.cost),
                              0,
                            )
                            .toLocaleString()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex justify-between items-center transition-colors">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Net Payout
                  </span>
                  <span className="text-xl font-black text-foreground tracking-tight font-mono">
                    ₱ {Number(fullPayout.net_payout).toLocaleString()}
                  </span>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: ITEMIZED LEDGER */}
          <div className="flex-[2] bg-secondary/30 relative flex flex-col overflow-hidden min-h-0 h-full transition-colors">
            <div className="bg-card border-b border-border px-5 py-3 flex justify-between items-center shrink-0 transition-colors">
              <span className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                Itemized Breakdown
              </span>
            </div>

            <ScrollArea className="flex-1 h-full custom-scrollbar">
              <div className="p-5 space-y-5">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-40 text-muted-foreground/30 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Loading Items...
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Bookings List */}
                    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                      <div className="bg-secondary/50 border-b border-border px-3 py-2">
                        <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          Settled Bookings ({bookings.length})
                        </h4>
                      </div>
                      <div className="divide-y divide-border">
                        {bookings.length === 0 ? (
                          <div className="p-4 text-center text-[10px] text-muted-foreground uppercase tracking-widest">
                            No bookings in this period.
                          </div>
                        ) : (
                          bookings.map((b: any) => (
                            <div
                              key={b.booking_id}
                              className="p-3 hover:bg-secondary/30 flex justify-between items-center transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-foreground">
                                  {b.car?.brand}{" "}
                                  <span className="text-muted-foreground font-mono">
                                    ({b.car?.plate_number})
                                  </span>
                                </span>
                                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                                  {format(new Date(b.start_date), "MMM d")} -{" "}
                                  {format(new Date(b.end_date), "MMM d")} • REF:{" "}
                                  {b.booking_id.split("-")[0]}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                +₱ {Number(b.total_price).toLocaleString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Maintenance List */}
                    {maintenance.length > 0 && (
                      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                        <div className="bg-secondary/50 border-b border-border px-3 py-2">
                          <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            Maintenance Deductions ({maintenance.length})
                          </h4>
                        </div>
                        <div className="divide-y divide-border">
                          {maintenance.map((m: any) => (
                            <div
                              key={m.maintenance_id}
                              className="p-3 hover:bg-secondary/30 flex justify-between items-center transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-foreground truncate">
                                  {m.service_type.replace(/_/g, " ")}{" "}
                                  <span className="text-muted-foreground font-mono">
                                    ({m.car?.plate_number})
                                  </span>
                                </span>
                                <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest mt-0.5">
                                  REF: {m.maintenance_id.split("-")[0]}
                                </span>
                              </div>
                              <span className="text-[11px] font-bold text-destructive font-mono">
                                -₱ {Number(m.cost).toLocaleString()}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end gap-2 z-10 transition-colors">
          <Button
            variant="outline"
            className="h-8 px-4 text-[10px] font-semibold text-foreground bg-card hover:bg-secondary border-border rounded-lg shadow-none transition-colors"
            onClick={onClose}
          >
            Close
          </Button>

          {fullPayout.status === "PENDING" && (
            <Button
              variant="outline"
              onClick={handleMarkAsPaid}
              disabled={isMarkingPaid || isLoading}
              className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 rounded-lg shadow-none transition-colors"
            >
              {isMarkingPaid ? (
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-3.5 h-3.5 mr-2" />
              )}
              Mark as Paid
            </Button>
          )}

          <Button
            onClick={() => generatePayoutPDF(details)}
            disabled={isLoading}
            className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
          >
            <Download className="w-3.5 h-3.5 mr-2" /> Download Statement
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
