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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

import { useFinancials, usePayoutDetails } from "../../../hooks/use-financials";

type PayoutBreakdownModalProps = {
  isOpen: boolean;
  onClose: () => void;
  payout: any | null;
};

export default function PayoutBreakdownModal({
  isOpen,
  onClose,
  payout,
}: PayoutBreakdownModalProps) {
  const payoutId = payout?.payout_id;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl xl:max-w-[1150px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[85vh] max-h-[800px] transition-colors duration-300 [&>button.absolute]:hidden">
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
                payout.status === "PAID"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
              )}
            >
              {payout.status}
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
                      {details?.payout?.car_owner?.business_name ||
                        details?.payout?.car_owner?.users?.full_name ||
                        payout.car_owner?.users?.full_name ||
                        "..."}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <CalendarIcon className="w-3 h-3" /> Period
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      {payout.period_start
                        ? format(new Date(payout.period_start), "MMM dd")
                        : ""}{" "}
                      -{" "}
                      {payout.period_end
                        ? format(new Date(payout.period_end), "MMM dd, yyyy")
                        : ""}
                    </span>
                  </div>
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
                          Gross Revenue
                        </span>
                        <span className="text-[11px] font-bold text-foreground font-mono">
                          ₱{" "}
                          {Number(
                            details?.payout?.total_revenue || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Share (
                          {details?.payout?.car_owner?.revenue_share_percentage}
                          %)
                        </span>
                        <span className="text-[11px] font-bold text-destructive font-mono">
                          - ₱{" "}
                          {Number(
                            details?.payout?.commission_deducted || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] font-semibold text-muted-foreground">
                          Maintenance
                        </span>
                        <span className="text-[11px] font-bold text-destructive font-mono">
                          - ₱{" "}
                          {details?.maintenance
                            ?.reduce(
                              (sum: number, m: any) => sum + Number(m.cost),
                              0,
                            )
                            .toLocaleString() || "0"}
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
                    ₱ {Number(payout.net_payout).toLocaleString()}
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
                          Settled Bookings ({details?.bookings?.length || 0})
                        </h4>
                      </div>
                      <div className="divide-y divide-border">
                        {details?.bookings?.map((b: any) => (
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
                                {format(new Date(b.end_date), "MMM d")} • ID:{" "}
                                {b.booking_id.split("-")[0]}
                              </span>
                            </div>
                            <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                              +₱ {Number(b.total_price).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Maintenance List */}
                    {details?.maintenance && details.maintenance.length > 0 && (
                      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                        <div className="bg-secondary/50 border-b border-border px-3 py-2">
                          <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            Maintenance Deductions ({details.maintenance.length}
                            )
                          </h4>
                        </div>
                        <div className="divide-y divide-border">
                          {details.maintenance.map((m: any) => (
                            <div
                              key={m.maintenance_id}
                              className="p-3 hover:bg-secondary/30 flex justify-between items-center transition-colors"
                            >
                              <div className="flex flex-col">
                                <span className="text-[11px] font-bold text-foreground truncate">
                                  {m.service_type.replace("_", " ")}{" "}
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

          {payout.status === "PENDING" && (
            <Button
              variant="outline"
              onClick={handleMarkAsPaid}
              disabled={isMarkingPaid}
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

          <Button className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity">
            <Download className="w-3.5 h-3.5 mr-2" /> Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
