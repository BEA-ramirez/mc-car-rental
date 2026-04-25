"use client";

import { useState } from "react";
import Image from "next/image";
import { format, differenceInHours } from "date-fns";
import {
  CheckCircle2,
  XCircle,
  Search,
  User,
  Car,
  Banknote,
  CalendarDays,
  ShieldCheck,
  ExternalLink,
  FileText,
  Loader2,
  Receipt,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// Hooks & Modals
import { usePendingPayments } from "../../../hooks/use-payments";
import { useDocumentMutations } from "../../../hooks/use-documents";
import ReviewModal, { ReviewDocument } from "../documents/review-modal";

export default function PaymentVerificationView() {
  const { payments, isLoading, isProcessing, handleVerify } =
    usePendingPayments();
  const { verifyDoc, rejectDoc } = useDocumentMutations(); // Document actions
  const [search, setSearch] = useState("");

  // Verification Modal State
  const [selectedPayment, setSelectedPayment] = useState<any | null>(null);
  const [editRef, setEditRef] = useState("");
  const [editAmount, setEditAmount] = useState("");

  // Rejection State inside the Modal
  const [isRejectMode, setIsRejectMode] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Document Review State
  const [reviewingDoc, setReviewingDoc] = useState<ReviewDocument | null>(null);

  const filteredPayments = payments.filter(
    (p) =>
      p.transaction_reference?.toLowerCase().includes(search.toLowerCase()) ||
      p.booking.user.full_name?.toLowerCase().includes(search.toLowerCase()),
  );

  const openReviewModal = (payment: any) => {
    setSelectedPayment(payment);
    setEditRef(payment.transaction_reference || "");
    setEditAmount(payment.amount?.toString() || "");
    setIsRejectMode(false);
    setRejectReason("");
  };

  const closeReviewModal = () => setSelectedPayment(null);

  // Helper to map DB doc to ReviewModal format
  const handleOpenDocReview = (doc: any, user: any) => {
    setReviewingDoc({
      id: doc.document_id,
      customerName: user.full_name || "Unknown",
      customerEmail: user.email || "N/A",
      customerPhone: user.phone_number || "N/A",
      trustScore: user.trust_score || 5,
      type: doc.category?.replace("_", " "),
      uploadedAt: format(new Date(doc.created_at), "MMM dd, yyyy - HH:mm"),
      imageUrl: doc.file_url || doc.file_path, // Map to whichever your DB uses
      status: doc.status,
    });
  };

  const submitApprove = () => {
    if (!selectedPayment) return;
    handleVerify(
      selectedPayment.payment_id,
      "approve",
      undefined,
      editAmount,
      editRef,
    );
    closeReviewModal();
  };

  const submitReject = () => {
    if (!selectedPayment || !rejectReason) return;
    handleVerify(selectedPayment.payment_id, "reject", rejectReason);
    closeReviewModal();
  };

  // Helper to format block-math duration cleanly
  const formatDuration = (start: string | Date, end: string | Date) => {
    const hours = differenceInHours(new Date(end), new Date(start));
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;

    if (days > 0 && remHours > 0)
      return `${days} day${days > 1 ? "s" : ""} and ${remHours} hr${remHours > 1 ? "s" : ""}`;
    if (days > 0) return `${days} day${days > 1 ? "s" : ""}`;
    return `${hours} hr${hours > 1 ? "s" : ""}`;
  };

  if (isLoading) {
    return (
      <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground p-12">
        <Loader2 className="w-8 h-8 animate-spin mb-4 text-primary" />
        <p className="text-xs font-bold uppercase tracking-widest">
          Loading Queue...
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card text-foreground font-sans">
      {/* --- COMPACT HEADER & SEARCH --- */}
      <header className="shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-sm font-bold flex items-center gap-2">
            VERIFICATION QUEUE
            <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-medium flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              {filteredPayments.length} Pending
            </span>
          </h2>
          <p className="text-[10px] font-medium text-muted-foreground mt-1">
            Review and confirm pending booking reservation fees.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ref or name..."
            className="pl-8 bg-card border-border text-foreground placeholder:text-muted-foreground rounded shadow-sm text-[11px] font-medium h-8 focus-visible:ring-1 focus-visible:ring-primary"
          />
        </div>
      </header>

      {/* --- MAIN QUEUE GRID --- */}
      {filteredPayments.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-secondary/30 rounded-xl border border-dashed border-border min-h-[300px]">
          <CheckCircle2 className="w-8 h-8 mb-3 opacity-50 text-primary" />
          <p className="text-[11px] font-bold uppercase tracking-widest text-foreground">
            Queue is Empty
          </p>
          <p className="text-[10px] font-medium opacity-60 mt-1">
            All reservation fees are caught up.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto custom-scrollbar pb-10 pr-2">
          {filteredPayments.map((p) => (
            <div
              key={p.payment_id}
              className="bg-card border border-border rounded-xl p-4 shadow-sm hover:border-primary/50 flex flex-col justify-between transition-colors group"
            >
              <div>
                <div className="flex justify-between items-start mb-3 border-b border-border pb-3">
                  <div className="bg-primary/10 text-primary p-2 rounded shrink-0">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Amount
                    </p>
                    <p className="text-sm font-black text-foreground">
                      ₱{p.amount?.toLocaleString() || "0"}
                    </p>
                  </div>
                </div>
                <div className="space-y-1 mb-4">
                  <p className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                    {p.booking.user?.full_name}
                  </p>
                  <p className="text-[10px] font-medium text-muted-foreground truncate flex items-center gap-1.5">
                    <Car className="w-3 h-3" />
                    {p.booking.car?.brand} {p.booking.car?.model}
                  </p>
                  <div className="mt-2 pt-2 border-t border-border">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-center">
                      <span>Ref No:</span>
                      <span className="text-foreground font-mono bg-secondary px-1.5 py-0.5 rounded border border-border">
                        {p.transaction_reference || "N/A"}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => openReviewModal(p)}
                className="w-full py-2 border border-border bg-secondary rounded text-[10px] font-medium flex items-center justify-center gap-1.5 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all"
              >
                <ShieldCheck className="w-3 h-3" /> Review Application
              </button>
            </div>
          ))}
        </div>
      )}

      {/* --- THE COMPREHENSIVE VERIFICATION MODAL --- */}
      <Dialog open={!!selectedPayment} onOpenChange={closeReviewModal}>
        <DialogContent className="max-w-6xl! w-[95vw]! bg-background border border-border text-foreground rounded-2xl p-0 overflow-hidden shadow-xl">
          {selectedPayment && (
            <div className="grid grid-cols-1 xl:grid-cols-12 h-full max-h-[90vh]">
              {/* Left Column: Receipt Explorer */}
              <div className="xl:col-span-5 bg-muted relative border-r border-border flex flex-col items-center justify-center p-6 group shrink-0">
                <div className="absolute top-4 left-4 z-10 bg-background/80 backdrop-blur-md px-2.5 py-1 rounded border border-border text-[9px] font-bold uppercase tracking-widest text-primary shadow-sm">
                  Scanned Receipt
                </div>
                <div className="relative w-full h-[300px] xl:h-full max-h-[70vh]">
                  <Image
                    src={
                      selectedPayment.receipt_url ||
                      "https://placehold.co/400x800?text=No+Receipt"
                    }
                    alt="Receipt"
                    fill
                    className="object-contain"
                  />
                </div>
                <button
                  onClick={() =>
                    window.open(selectedPayment.receipt_url, "_blank")
                  }
                  className="absolute bottom-6 bg-background/80 border border-border hover:border-primary/50 text-foreground rounded shadow-sm text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 z-10 flex items-center gap-1.5 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Open Full Screen
                </button>
              </div>

              {/* Right Column: Information & Actions */}
              <div className="xl:col-span-7 flex flex-col h-full overflow-y-auto custom-scrollbar p-6">
                <DialogHeader className="mb-5 border-b border-border pb-4">
                  <DialogTitle className="text-base font-bold text-foreground">
                    Booking Command Center
                  </DialogTitle>
                  <DialogDescription className="text-[11px] text-muted-foreground mt-1">
                    Verify documents, validate payment, and confirm the booking.
                  </DialogDescription>
                </DialogHeader>

                <div className="flex-1 flex flex-col gap-4">
                  {/* 1. Customer Intelligence & Documents */}
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm shrink-0">
                    <h3 className="text-[10px] font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Customer Profile & KYC
                    </h3>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div className="border border-border rounded p-2 bg-secondary/50">
                        <p className="text-[9px] font-medium text-muted-foreground mb-0.5">
                          Full Name
                        </p>
                        <p className="text-[11px] font-bold">
                          {selectedPayment.booking.user?.full_name}
                        </p>
                      </div>
                      <div className="border border-border rounded p-2 bg-secondary/50">
                        <p className="text-[9px] font-medium text-muted-foreground mb-0.5">
                          Contact
                        </p>
                        <p className="text-[11px] font-bold">
                          {selectedPayment.booking.user?.phone_number}
                        </p>
                      </div>
                    </div>

                    {/* INTERACTIVE DOCUMENT REVIEW */}
                    <div className="pt-3 border-t border-border">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                        Click to Review Documents:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPayment.booking.user?.documents?.map(
                          (doc: any, i: number) => {
                            const isVerified = doc.status === "VERIFIED";
                            const isRejected = doc.status === "REJECTED";
                            return (
                              <button
                                key={i}
                                onClick={() =>
                                  handleOpenDocReview(
                                    doc,
                                    selectedPayment.booking.user,
                                  )
                                }
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-bold border transition-all hover:opacity-80 shadow-sm",
                                  isVerified &&
                                    "bg-emerald-500/10 text-emerald-600 border-emerald-500/30",
                                  isRejected &&
                                    "bg-destructive/10 text-destructive border-destructive/30",
                                  !isVerified &&
                                    !isRejected &&
                                    "bg-yellow-500/10 text-yellow-600 border-yellow-500/30", // PENDING
                                )}
                              >
                                <FileText className="w-3 h-3" />
                                {doc.category.replace("_", " ")}
                              </button>
                            );
                          },
                        )}
                        {(!selectedPayment.booking.user?.documents ||
                          selectedPayment.booking.user.documents.length ===
                            0) && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold border bg-destructive/10 text-destructive border-destructive/20">
                            <AlertCircle className="w-3 h-3" /> No Documents
                            Uploaded
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Booking Logistics & Financials */}
                  <div className="bg-card border border-border rounded-xl p-4 shadow-sm shrink-0">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5">
                        <CalendarDays className="w-3.5 h-3.5" /> Logistics &
                        Financials
                      </h3>
                      <span
                        className={cn(
                          "px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest border",
                          selectedPayment.booking.is_with_driver
                            ? "bg-yellow-500/10 text-yellow-600 border-yellow-500/20"
                            : "bg-secondary text-foreground border-border",
                        )}
                      >
                        {selectedPayment.booking.is_with_driver
                          ? "With Driver"
                          : "Self-Drive"}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mb-3">
                      <div className="border border-border rounded p-2 bg-secondary/50 col-span-2">
                        <p className="text-[9px] font-medium text-muted-foreground mb-0.5">
                          Assigned Vehicle
                        </p>
                        <p className="text-[11px] font-bold truncate">
                          {selectedPayment.booking.car?.brand}{" "}
                          {selectedPayment.booking.car?.model} (
                          {selectedPayment.booking.car?.plate_number})
                        </p>
                      </div>
                      <div className="border border-border rounded p-2 bg-secondary/50 col-span-2">
                        <p className="text-[9px] font-medium text-muted-foreground mb-0.5">
                          Rental Duration
                        </p>
                        <p className="text-[11px] font-bold">
                          {formatDuration(
                            selectedPayment.booking.start_date,
                            selectedPayment.booking.end_date,
                          )}
                          <span className="text-muted-foreground font-normal ml-1">
                            (
                            {format(
                              new Date(selectedPayment.booking.start_date),
                              "MMM dd",
                            )}{" "}
                            -{" "}
                            {format(
                              new Date(selectedPayment.booking.end_date),
                              "MMM dd",
                            )}
                            )
                          </span>
                        </p>
                      </div>
                    </div>

                    {/* FINANCIAL SUMMARY GRID (Updated) */}
                    {(() => {
                      const actualBilled =
                        selectedPayment.booking.total_price || 0;
                      const reqDownpayment = 500; // Fixed per requirement
                      const amountPaid = selectedPayment.amount || 0;

                      return (
                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border">
                          <div className="bg-secondary/30 border border-border rounded p-2 text-center">
                            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                              Rental Billed
                            </p>
                            <p className="text-xs font-black text-foreground">
                              ₱{actualBilled.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-primary/5 border border-primary/20 rounded p-2 text-center">
                            <p className="text-[8px] font-bold text-primary uppercase tracking-widest mb-0.5">
                              Req. Downpayment
                            </p>
                            <p className="text-xs font-black text-primary">
                              ₱{reqDownpayment.toLocaleString()}
                            </p>
                          </div>
                          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded p-2 text-center">
                            <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">
                              Amount Paid
                            </p>
                            <p className="text-xs font-black text-emerald-600">
                              ₱{amountPaid.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* 3. OCR Edit Fields */}
                  <div className="bg-card border border-border rounded-xl p-4 shrink-0">
                    <h3 className="text-[10px] font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Receipt className="w-3.5 h-3.5" /> Validate Receipt
                      Details
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          Captured Ref No.
                        </Label>
                        <Input
                          value={editRef}
                          onChange={(e) => setEditRef(e.target.value)}
                          className="bg-secondary/50 border-border text-foreground font-mono text-xs h-8 shadow-none"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          Captured Amount
                        </Label>
                        <div className="relative flex items-center">
                          <span className="absolute left-2.5 text-muted-foreground font-bold text-xs">
                            ₱
                          </span>
                          <Input
                            type="number"
                            value={editAmount}
                            onChange={(e) => setEditAmount(e.target.value)}
                            className="bg-secondary/50 border-border text-foreground font-bold text-xs h-8 pl-6 shadow-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-4 mt-4 border-t border-border shrink-0">
                  {!isRejectMode ? (
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setIsRejectMode(true)}
                        className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive h-10 rounded shadow-sm text-[11px] font-bold transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                        Booking
                      </Button>
                      <Button
                        onClick={submitApprove}
                        disabled={isProcessing}
                        className="flex-[2] bg-primary text-primary-foreground hover:opacity-90 h-10 rounded shadow-sm text-[11px] font-bold transition-opacity"
                      >
                        {isProcessing ? (
                          <span className="flex items-center gap-2">
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />{" "}
                            Processing...
                          </span>
                        ) : (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />{" "}
                            Approve & Confirm Payment
                          </>
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] text-destructive font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <XCircle className="w-3 h-3" /> Reason for Rejection
                        </Label>
                        <Input
                          value={rejectReason}
                          onChange={(e) => setRejectReason(e.target.value)}
                          placeholder="e.g., Reference number invalid, insufficient amount..."
                          className="bg-destructive/5 border-destructive/30 text-foreground placeholder:text-destructive/40 focus-visible:ring-destructive h-8 text-xs shadow-sm"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          onClick={() => setIsRejectMode(false)}
                          className="flex-1 hover:bg-secondary text-muted-foreground h-9 rounded text-[10px] font-bold uppercase tracking-widest"
                        >
                          Cancel
                        </Button>
                        <Button
                          onClick={submitReject}
                          disabled={!rejectReason || isProcessing}
                          className="flex-[2] bg-destructive hover:bg-destructive/90 text-destructive-foreground h-9 rounded text-[10px] font-bold uppercase tracking-widest shadow-sm transition-all"
                        >
                          {isProcessing ? "Rejecting..." : "Confirm Rejection"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* --- RENDER THE EXTERNAL REVIEW MODAL --- */}
      <ReviewModal
        isOpen={!!reviewingDoc}
        onClose={() => setReviewingDoc(null)}
        document={reviewingDoc}
        onVerify={async (id, expiry) => {
          try {
            await verifyDoc({ id, expiry });
            setReviewingDoc(null);
          } catch {}
        }}
        onReject={async (id, reason) => {
          try {
            await rejectDoc({ id, reason });
            setReviewingDoc(null);
          } catch {}
        }}
      />
    </div>
  );
}
