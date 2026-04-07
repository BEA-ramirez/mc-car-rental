"use client";

import { useState } from "react";
import Image from "next/image";
import {
  CheckCircle2,
  XCircle,
  Search,
  User,
  Car,
  Banknote,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { usePendingPayments } from "../../../hooks/use-payments"; // Adjust path
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

export default function PaymentVerificationView() {
  const { payments, isLoading, isProcessing, handleVerify } =
    usePendingPayments();
  const [search, setSearch] = useState("");

  // Track edits per payment card
  const [edits, setEdits] = useState<
    Record<string, { ref?: string; amount?: string }>
  >({});

  // Rejection Dialog State
  const [rejectId, setRejectId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const filteredPayments = payments.filter(
    (p) =>
      p.transaction_reference?.toLowerCase().includes(search.toLowerCase()) ||
      p.booking.user.full_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleEditChange = (
    paymentId: string,
    field: "ref" | "amount",
    value: string,
  ) => {
    setEdits((prev) => ({
      ...prev,
      [paymentId]: {
        ...prev[paymentId],
        [field]: value,
      },
    }));
  };

  const submitApprove = (paymentId: string) => {
    const updatedRef = edits[paymentId]?.ref;
    const updatedAmount = edits[paymentId]?.amount;

    // Pass the overridden values to the hook
    handleVerify(paymentId, "approve", undefined, updatedAmount, updatedRef);
  };

  const submitReject = () => {
    if (!rejectId || !rejectReason) return;
    handleVerify(rejectId, "reject", rejectReason);
    setRejectId(null);
    setRejectReason("");
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 animate-pulse uppercase tracking-widest text-xs font-bold">
        Loading Queue...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black uppercase tracking-tighter text-white">
            Payment Verification Queue
          </h2>
          <p className="text-xs font-medium text-gray-400">
            Review uploaded receipts and correct OCR data if needed before
            approving.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Reference or Name..."
            className="pl-10 bg-black/40 border-white/10 text-white placeholder:text-gray-600 rounded-xl text-xs uppercase tracking-widest h-10"
          />
        </div>
      </div>

      {/* The Queue Grid */}
      {filteredPayments.length === 0 ? (
        <div className="flex-1 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-gray-500 min-h-[300px]">
          <Banknote className="w-10 h-10 mb-3 opacity-30" />
          <p className="text-[11px] font-bold uppercase tracking-widest">
            Queue is Empty
          </p>
          <p className="text-xs font-medium opacity-60">
            All reservation fees have been verified.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 overflow-y-auto custom-scrollbar pb-10 pr-2">
          {filteredPayments.map((p) => {
            const currentRef =
              edits[p.payment_id]?.ref ?? p.transaction_reference ?? "";
            const currentAmount = edits[p.payment_id]?.amount ?? p.amount ?? "";

            return (
              <div
                key={p.payment_id}
                className="bg-black/40 border border-[#64c5c3]/20 rounded-2xl p-5 flex flex-col xl:flex-row gap-5 shadow-lg relative"
              >
                <div className="absolute top-4 right-4 text-gray-500 opacity-50 pointer-events-none">
                  <Edit3 className="w-4 h-4" />
                </div>

                {/* Receipt Image */}
                <div className="relative w-full xl:w-40 h-48 xl:h-full bg-black rounded-xl overflow-hidden border border-white/10 shrink-0 group">
                  <Image
                    src={
                      p.receipt_url ||
                      "https://placehold.co/400x800?text=No+Receipt"
                    }
                    alt="Receipt"
                    fill
                    className="object-cover group-hover:object-contain transition-all duration-300 cursor-pointer"
                    onClick={() => window.open(p.receipt_url, "_blank")}
                  />
                  <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-center pointer-events-none">
                    <p className="text-[8px] text-white uppercase tracking-widest font-bold">
                      Click to Enlarge
                    </p>
                  </div>
                </div>

                {/* Details & Actions */}
                <div className="flex-1 flex flex-col justify-between pt-2 xl:pt-0">
                  <div className="space-y-3">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      {/* Editable Ref Input */}
                      <div className="w-full sm:w-1/2">
                        <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                          OCR Ref No.
                        </Label>
                        <Input
                          value={currentRef}
                          onChange={(e) =>
                            handleEditChange(
                              p.payment_id,
                              "ref",
                              e.target.value,
                            )
                          }
                          placeholder="Ref No."
                          className="font-mono text-xs text-[#64c5c3] bg-[#64c5c3]/10 border border-[#64c5c3]/30 focus-visible:ring-[#64c5c3] h-8 rounded-lg w-full"
                        />
                      </div>

                      {/* Editable Amount Input */}
                      <div className="w-full sm:w-auto text-left sm:text-right">
                        <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">
                          Amount Paid
                        </Label>
                        <div className="relative flex items-center sm:justify-end">
                          <span className="absolute left-3 text-sm font-black text-white pointer-events-none">
                            ₱
                          </span>
                          <Input
                            type="number"
                            value={currentAmount}
                            onChange={(e) =>
                              handleEditChange(
                                p.payment_id,
                                "amount",
                                e.target.value,
                              )
                            }
                            className="pl-7 text-lg font-black text-white bg-white/5 border-white/10 focus-visible:ring-[#64c5c3] h-8 w-full sm:w-32 rounded-lg text-left sm:text-right"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 bg-white/5 p-3 rounded-xl border border-white/5">
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                          <User className="w-3 h-3" /> Customer
                        </p>
                        <p className="text-[10px] font-bold text-white truncate">
                          {p.booking.user?.full_name}
                        </p>
                      </div>
                      <div>
                        <p className="text-[8px] text-gray-500 uppercase tracking-widest flex items-center gap-1 mb-1">
                          <Car className="w-3 h-3" /> Vehicle
                        </p>
                        <p className="text-[10px] font-bold text-white truncate">
                          {p.booking.car?.brand} {p.booking.car?.model}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-white/10">
                    <Button
                      onClick={() => submitApprove(p.payment_id)}
                      disabled={isProcessing}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-black h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Approve
                    </Button>
                    <Button
                      onClick={() => setRejectId(p.payment_id)}
                      disabled={isProcessing}
                      variant="outline"
                      className="flex-1 border-red-500/50 hover:bg-red-500/10 text-red-400 h-10 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                    >
                      <XCircle className="w-4 h-4 mr-2" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Reject Reason Dialog */}
      <Dialog open={!!rejectId} onOpenChange={() => setRejectId(null)}>
        <DialogContent className="bg-[#0a1118] border-red-500/30 text-white rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-red-400 uppercase tracking-widest font-bold flex items-center gap-2">
              <XCircle className="w-5 h-5" /> Reject Payment
            </DialogTitle>
            <DialogDescription className="text-xs text-gray-400">
              This will mark the payment as failed and **cancel the booking**.
              Please provide a reason to email the customer.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase tracking-widest text-gray-500">
                Rejection Reason
              </Label>
              <Input
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g., Reference number not found in GCash..."
                className="bg-black/50 border-white/10 focus-visible:border-red-500"
              />
            </div>
            <Button
              onClick={submitReject}
              disabled={!rejectReason || isProcessing}
              className="w-full bg-red-500 hover:bg-red-600 text-white rounded-xl uppercase tracking-widest font-bold text-[10px] h-12"
            >
              Confirm Rejection & Cancel Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
