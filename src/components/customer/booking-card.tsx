"use client";

import { useState } from "react";
import { format } from "date-fns";
import Image from "next/image";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard,
  Smartphone,
  Landmark,
  Banknote,
  QrCode,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import ReceiptScanner from "@/components/bookings/receipt-scanner";

import { useBookings } from "../../../hooks/use-bookings";
import { uploadFile } from "@/actions/helper/upload-file";
import { useUser } from "@/providers/auth-provider";

interface BookingCardProps {
  booking: any;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<
    "gcash" | "bank" | "cash"
  >("gcash");

  const [scannedFile, setScannedFile] = useState<File | null>(null);
  const [scannedRef, setScannedRef] = useState<string>("");
  const [scannedAmount, setScannedAmount] = useState<string>("");

  const { user } = useUser();
  const { submitPayment, isSubmittingPayment } = useBookings();

  const balance = booking.totalAmount - booking.amountPaid;
  const progressPercent = Math.min(
    100,
    Math.max(0, (booking.amountPaid / booking.totalAmount) * 100),
  );
  const isFullyPaid = balance <= 0;

  let statusStyles = "bg-white/5 text-slate-400 border-white/10";
  let StatusIcon = Clock;

  if (booking.status === "Pending Approval") {
    statusStyles = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    StatusIcon = Clock;
  } else if (booking.status === "Awaiting Payment") {
    statusStyles = "bg-blue-500/10 text-blue-400 border-blue-500/20";
    StatusIcon = AlertCircle;
  } else if (booking.status === "Completed" || booking.status === "Confirmed") {
    statusStyles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    StatusIcon = CheckCircle2;
  }

  const handleScanUpdate = (file: File, refNum: string, amount: string) => {
    setScannedFile(file);
    setScannedRef(refNum);
    setScannedAmount(amount);
  };

  const handleSubmitPayment = async () => {
    if (selectedMethod === "cash") {
      toast.info("Cash payment noted. Please pay upon pickup.");
      setIsPaymentModalOpen(false);
      return;
    }
    if (!scannedFile || !scannedAmount) {
      toast.error("Please upload a receipt and verify the amount.");
      return;
    }
    const numericAmount = Number(scannedAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      toast.error("Please enter a valid payment amount.");
      return;
    }
    try {
      if (!user) throw new Error("You must be logged in.");
      const uploadResult = await uploadFile(
        scannedFile,
        "documents",
        "receipts",
        user.id,
      );
      if (!uploadResult) throw new Error("Failed to upload image.");
      await submitPayment({
        bookingId: booking.original_id,
        amount: numericAmount,
        ref: scannedRef,
        url: uploadResult.url,
      });
      toast.success("Receipt uploaded successfully! Awaiting verification.");
      setIsPaymentModalOpen(false);
      setScannedFile(null);
      setScannedRef("");
      setScannedAmount("");
    } catch (error: any) {
      toast.error(error.message || "Failed to submit payment.");
    }
  };

  return (
    <>
      <div className="bg-white/[0.02] backdrop-blur-xl rounded-sm border border-white/5 overflow-hidden transition-all duration-500 hover:border-white/10 flex flex-col md:flex-row group">
        {/* --- Left Side: Image --- */}
        <div className="md:w-72 h-56 md:h-auto shrink-0 bg-[#050608] relative overflow-hidden">
          <Image
            src={
              booking.car.image || "https://placehold.co/1200x800?text=No+Image"
            }
            alt={booking.car.model}
            fill
            sizes="(max-width: 768px) 100vw, 288px"
            className="object-cover opacity-60 mix-blend-luminosity group-hover:opacity-100 group-hover:scale-105 transition-all duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10] via-transparent to-transparent opacity-80" />

          <div className="absolute top-4 left-4">
            <div
              className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-sm text-[9px] font-bold uppercase tracking-widest border backdrop-blur-md",
                statusStyles,
              )}
            >
              <StatusIcon className="w-3 h-3" />
              {booking.status}
            </div>
          </div>
        </div>

        {/* --- Right Side: Details --- */}
        <div className="p-8 flex-1 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-6 mb-8">
            <div>
              <p className="text-[9px] font-medium text-white/30 uppercase tracking-[0.3em] mb-2">
                ID: {booking.id}
              </p>
              <h3 className="text-3xl font-light text-white tracking-tight leading-none mb-4">
                {booking.car.brand}{" "}
                <span className="italic text-white/60">
                  {booking.car.model}
                </span>
              </h3>
              <div className="flex items-center gap-3 text-[10px] font-medium uppercase tracking-widest text-slate-400">
                <CalendarDays className="w-3.5 h-3.5 text-blue-500" />
                {format(booking.startDate, "MMM dd, yyyy")} —{" "}
                {format(booking.endDate, "MMM dd, yyyy")}
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[9px] font-medium text-white/30 uppercase tracking-[0.3em] mb-1">
                Amount Due
              </p>
              <p className="text-3xl font-light text-white tracking-tighter">
                ₱{booking.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-6 rounded-sm">
            <div className="flex justify-between items-end mb-3">
              <p className="text-[9px] font-medium text-white/40 uppercase tracking-[0.2em]">
                Payment Progress
              </p>
              <p className="text-[10px] font-medium text-white tracking-widest uppercase">
                <span className="text-blue-400">
                  ₱{booking.amountPaid.toLocaleString()}
                </span>{" "}
                / ₱{booking.totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden mb-4">
              <div
                className={cn(
                  "h-full transition-all duration-[2000ms] ease-out",
                  isFullyPaid ? "bg-emerald-500" : "bg-blue-600",
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {booking.pendingAmount > 0 && (
              <div className="flex items-center gap-3 mb-4 text-[9px] font-medium uppercase tracking-widest text-amber-400 bg-amber-400/5 p-3 border border-amber-400/10 rounded-sm">
                <Clock className="w-3.5 h-3.5 shrink-0" />₱
                {booking.pendingAmount.toLocaleString()} awaiting verification
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <p className="text-[9px] font-medium text-white/20 uppercase tracking-[0.2em]">
                {isFullyPaid
                  ? "Verified & Settled"
                  : `Balance: ₱${balance.toLocaleString()}`}
              </p>

              {!isFullyPaid && booking.status !== "Pending Approval" && (
                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-none h-10 px-6 font-bold text-[9px] uppercase tracking-[0.3em] transition-all duration-300"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-2" /> Make Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- Payment Modal --- */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-xl bg-[#0A0C10] border-white/10 p-0 overflow-hidden text-slate-300">
          <DialogHeader className="p-8 bg-white/[0.02] border-b border-white/5">
            <DialogTitle className="text-2xl font-light text-white tracking-tight">
              Settle <span className="italic text-white/50">Payment.</span>
            </DialogTitle>
            <p className="text-[10px] text-white/40 uppercase tracking-[0.2em] mt-2">
              Remaining:{" "}
              <span className="text-white font-bold ml-1">
                ₱{balance.toLocaleString()}
              </span>
            </p>
          </DialogHeader>

          <div className="p-8 overflow-y-auto max-h-[70vh] custom-scrollbar">
            <div className="grid grid-cols-3 gap-4 mb-10">
              {(["gcash", "bank", "cash"] as const).map((method) => {
                const Icon =
                  method === "gcash"
                    ? Smartphone
                    : method === "bank"
                      ? Landmark
                      : Banknote;
                return (
                  <button
                    key={method}
                    onClick={() => setSelectedMethod(method)}
                    className={cn(
                      "flex flex-col items-center gap-3 p-5 rounded-sm border transition-all duration-300",
                      selectedMethod === method
                        ? "border-blue-500 bg-blue-500/5 text-white"
                        : "border-white/5 bg-white/[0.02] text-white/40 hover:border-white/10",
                    )}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-[9px] font-bold uppercase tracking-widest">
                      {method}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedMethod !== "cash" ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="relative group p-[1px] bg-gradient-to-br from-white/10 to-transparent rounded-sm overflow-hidden">
                  <div className="bg-gradient-to-br from-slate-800 to-black p-8 flex flex-col items-center justify-center relative rounded-sm">
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
                    <QrCode className="w-20 h-20 text-white/80 mb-4 group-hover:scale-110 transition-transform duration-500" />
                    <p className="text-[9px] font-bold text-white/60 uppercase tracking-[0.3em]">
                      Scan Official QR
                    </p>
                  </div>
                </div>

                <ReceiptScanner
                  expectedAmount={balance}
                  onScanComplete={handleScanUpdate}
                />
              </div>
            ) : (
              <div className="bg-blue-500/5 border border-blue-500/20 p-8 rounded-sm text-center animate-in zoom-in-95 duration-500">
                <Banknote className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                <h4 className="text-sm font-medium text-white mb-2 uppercase tracking-widest">
                  In-Person Settlement
                </h4>
                <p className="text-[10px] text-slate-400 leading-relaxed uppercase tracking-widest">
                  Present the balance upon pickup of your vehicle.
                </p>
              </div>
            )}

            <Button
              onClick={handleSubmitPayment}
              disabled={
                (selectedMethod !== "cash" && !scannedFile) ||
                isSubmittingPayment
              }
              className="w-full mt-10 bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-none h-14 font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-500 group"
            >
              {isSubmittingPayment ? (
                "Authenticating..."
              ) : (
                <span className="flex items-center gap-3">
                  {selectedMethod === "cash"
                    ? "Confirm Arrangement"
                    : "Submit Receipt"}
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <div className="mt-8 flex items-center gap-2 justify-center text-[9px] text-white/20 uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3" /> Secure Payment Protocol
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
