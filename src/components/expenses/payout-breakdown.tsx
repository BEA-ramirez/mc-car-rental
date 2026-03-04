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
  Calculator,
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
  payout: any | null; // Takes the basic row data from the table
};

export default function PayoutBreakdownModal({
  isOpen,
  onClose,
  payout,
}: PayoutBreakdownModalProps) {
  // Use the Payout ID passed from the row click to fetch the deep details
  const payoutId = payout?.payout_id;
  const { data: details, isLoading } = usePayoutDetails(payoutId);
  const { markAsPaid, isMarkingPaid } = useFinancials();

  if (!payout) return null;

  const handleMarkAsPaid = async () => {
    if (!payoutId) return;
    try {
      await markAsPaid(payoutId);
      onClose(); // Close the modal after successful payment
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl xl:max-w-[1150px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col h-[85vh] max-h-[800px] [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
              <Receipt className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Owner Payout Settlement
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                Ref: {payoutId?.split("-")[0]}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest rounded-sm h-7 px-3 border",
                payout.status === "PAID"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200",
              )}
            >
              {payout.status}
            </Badge>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* SPLIT BODY */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* LEFT: SUMMARY TOTALS (Fixed at 400px) */}
          <div className="w-[400px] bg-slate-50 flex flex-col border-r border-slate-200 shrink-0 h-full">
            <ScrollArea className="flex-1 h-full">
              <div className="p-6 space-y-6">
                {/* Meta Details */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <User className="w-3 h-3" /> Fleet Owner
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {details?.payout?.car_owner?.business_name ||
                        details?.payout?.car_owner?.users?.full_name ||
                        payout.car_owner?.users?.full_name ||
                        "Loading..."}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <CalendarIcon className="w-3 h-3" /> Billing Period
                    </span>
                    <span className="text-sm font-bold text-slate-800">
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

                <hr className="border-slate-200" />

                {/* Financial Summary */}
                <div>
                  <h4 className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest mb-4">
                    Financial Summary
                  </h4>
                  {isLoading ? (
                    <div className="flex justify-center py-4">
                      <Loader2 className="w-5 h-5 text-slate-300 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-600">
                          Gross Booking Revenue
                        </span>
                        <span className="text-xs font-bold text-slate-900">
                          ₱{" "}
                          {Number(
                            details?.payout?.total_revenue || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-600">
                          Platform Commission (
                          {details?.payout?.car_owner?.revenue_share_percentage}
                          %)
                        </span>
                        <span className="text-xs font-bold text-red-600">
                          - ₱{" "}
                          {Number(
                            details?.payout?.commission_deducted || 0,
                          ).toLocaleString()}
                        </span>
                      </div>
                      {/* Calculate sum of maintenance directly from fetched array */}
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-600">
                          Maintenance Deductions
                        </span>
                        <span className="text-xs font-bold text-red-600">
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
                <div className="bg-slate-900 p-4 rounded-sm shadow-sm flex justify-between items-end text-white">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Net Payout
                  </span>
                  <span className="text-2xl font-bold tracking-tight">
                    ₱ {Number(payout.net_payout).toLocaleString()}
                  </span>
                </div>
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: ITEMIZED LEDGER */}
          <div className="flex-[2] bg-white relative flex flex-col overflow-hidden min-h-0 h-full">
            <div className="bg-white border-b border-slate-200 px-5 py-3 flex justify-between items-center shrink-0">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-4 h-4" /> Itemized Breakdown
              </span>
            </div>

            <ScrollArea className="flex-1 h-full">
              <div className="p-6 space-y-6">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="text-xs font-medium uppercase tracking-widest">
                      Loading Line Items...
                    </span>
                  </div>
                ) : (
                  <>
                    {/* Bookings List */}
                    <div>
                      <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                        Settled Bookings ({details?.bookings?.length || 0})
                      </h4>
                      <div className="border border-slate-200 rounded-sm overflow-hidden divide-y divide-slate-100">
                        {details?.bookings?.map((b: any) => (
                          <div
                            key={b.booking_id}
                            className="p-3 bg-white flex justify-between items-center"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800">
                                {b.car?.brand}{" "}
                                <span className="text-slate-400 font-mono ml-1">
                                  ({b.car?.plate_number})
                                </span>
                              </span>
                              <span className="text-[10px] font-medium text-slate-500">
                                {format(new Date(b.start_date), "MMM dd")} -{" "}
                                {format(new Date(b.end_date), "MMM dd")} • Ref:{" "}
                                {b.booking_id.split("-")[0]}
                              </span>
                            </div>
                            <span className="text-xs font-bold text-slate-900">
                              +₱ {Number(b.total_price).toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {details?.bookings?.length === 0 && (
                          <div className="p-4 text-xs text-slate-400 text-center bg-slate-50">
                            No bookings associated with this payout.
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Maintenance List */}
                    {details?.maintenance && details.maintenance.length > 0 && (
                      <div>
                        <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
                          Maintenance Deductions ({details.maintenance.length})
                        </h4>
                        <div className="border border-slate-200 rounded-sm overflow-hidden divide-y divide-slate-100">
                          {details.maintenance.map((m: any) => (
                            <div
                              key={m.maintenance_id}
                              className="p-3 bg-white flex justify-between items-center"
                            >
                              <div className="flex flex-col">
                                <span className="text-xs font-bold text-slate-800">
                                  {m.service_type.replace("_", " ")}{" "}
                                  <span className="text-slate-400 font-mono ml-1">
                                    ({m.car?.plate_number})
                                  </span>
                                </span>
                                <span className="text-[10px] font-medium text-slate-500">
                                  Ref: {m.maintenance_id.split("-")[0]}
                                </span>
                              </div>
                              <span className="text-xs font-bold text-red-600">
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
        <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex justify-end gap-2 z-10">
          <Button
            variant="ghost"
            className="h-9 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={onClose}
          >
            Close
          </Button>

          {/* Only show Mark as Paid if it's currently PENDING */}
          {payout.status === "PENDING" && (
            <Button
              variant="outline"
              onClick={handleMarkAsPaid}
              disabled={isMarkingPaid}
              className="h-9 px-4 text-xs font-bold border-slate-300 text-slate-700 hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 rounded-sm shadow-sm transition-colors"
            >
              <CheckCircle className="w-3.5 h-3.5 mr-2" />
              {isMarkingPaid ? "Updating..." : "Mark as Paid"}
            </Button>
          )}

          <Button className="h-9 px-4 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-sm shadow-sm">
            <Download className="w-3.5 h-3.5 mr-2" /> Download Invoice
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
