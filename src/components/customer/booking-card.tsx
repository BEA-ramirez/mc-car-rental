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
  FileText,
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

  let statusStyles = "bg-white/5 text-gray-400 border-white/10";
  let StatusIcon = Clock;

  if (booking.status === "Pending Approval") {
    statusStyles = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    StatusIcon = Clock;
  } else if (booking.status === "Awaiting Payment") {
    statusStyles = "bg-[#64c5c3]/10 text-[#64c5c3] border-[#64c5c3]/20";
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

  const handleViewContract = () => {
    toast.info("Generating Contract Document...");
  };

  return (
    <>
      <div className="bg-[#0a1118] rounded-2xl md:rounded-3xl border border-white/5 overflow-hidden transition-all duration-300 hover:border-white/10 hover:shadow-xl flex flex-col md:flex-row group">
        {/* --- Left Side: Image (Extremely compact on mobile) --- */}
        <div className="md:w-72 h-32 md:h-auto shrink-0 bg-black relative overflow-hidden">
          <Image
            src={
              booking.car.image || "https://placehold.co/1200x800?text=No+Image"
            }
            alt={booking.car.model}
            fill
            sizes="(max-width: 768px) 100vw, 288px"
            className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B10] via-transparent to-transparent opacity-80" />

          {/* Status Badge */}
          <div className="absolute top-2 left-2 md:top-4 md:left-4">
            <div
              className={cn(
                "flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md shadow-lg",
                statusStyles,
              )}
            >
              <StatusIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
              {booking.status}
            </div>
          </div>
        </div>

        {/* --- Right Side: Details (Tightened for mobile) --- */}
        <div className="p-4 md:p-8 flex-1 flex flex-col justify-between">
          {/* Header Row - Title & Price Side-by-Side on Mobile */}
          <div className="flex flex-row justify-between items-start gap-2 md:gap-6 mb-4 md:mb-6">
            <div>
              <p className="text-[8px] md:text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest mb-1 md:mb-2">
                ID: {booking.id}
              </p>
              <h3 className="text-lg sm:text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1.5 md:mb-3">
                {booking.car.brand}{" "}
                <span className="text-gray-400">{booking.car.model}</span>
              </h3>
              <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500">
                <CalendarDays className="w-3 h-3 md:w-4 md:h-4 text-[#64c5c3]" />
                {format(booking.startDate, "MMM dd")} —{" "}
                {format(booking.endDate, "MMM dd")}
              </div>
            </div>

            <div className="text-right">
              <p className="text-[8px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-0.5 md:mb-1">
                Total Due
              </p>
              <p className="text-xl md:text-3xl font-black text-white tracking-tighter">
                ₱{booking.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress & Actions Box */}
          <div className="bg-white/5 border border-white/10 p-3 md:p-5 rounded-xl md:rounded-2xl">
            <div className="flex justify-between items-end mb-2 md:mb-3">
              <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                Payment Progress
              </p>
              <p className="text-[8px] md:text-[10px] font-bold text-white tracking-widest uppercase">
                <span className="text-[#64c5c3]">
                  ₱{booking.amountPaid.toLocaleString()}
                </span>{" "}
                / ₱{booking.totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="w-full h-1 md:h-1.5 bg-black/50 rounded-full overflow-hidden mb-3 md:mb-4">
              <div
                className={cn(
                  "h-full transition-all duration-[2000ms] ease-out rounded-full",
                  isFullyPaid ? "bg-emerald-500" : "bg-[#64c5c3]",
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {booking.pendingAmount > 0 && (
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4 text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-400/5 p-2 md:p-3 rounded-lg md:rounded-xl border border-amber-400/10">
                <Clock className="w-3 h-3 md:w-4 md:h-4 shrink-0" />₱
                {booking.pendingAmount.toLocaleString()} pending
              </div>
            )}

            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 mt-1 md:mt-2">
              <p className="text-[9px] md:text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                {isFullyPaid
                  ? "Verified & Settled"
                  : `Balance: ₱${balance.toLocaleString()}`}
              </p>

              {/* Action Buttons - Side-by-Side on Mobile for space saving */}
              <div className="flex flex-row w-full md:w-auto gap-2 md:gap-3">
                <Button
                  onClick={handleViewContract}
                  variant="outline"
                  className="flex-1 md:w-auto border-white/20 bg-transparent hover:bg-white/10 text-white rounded-lg md:rounded-xl h-9 md:h-12 px-3 md:px-6 font-bold text-[8px] md:text-[10px] uppercase tracking-widest transition-all duration-300"
                >
                  <FileText className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                  <span className="hidden md:inline">View Contract</span>
                  <span className="md:hidden ml-1">Contract</span>
                </Button>

                {!isFullyPaid && booking.status !== "Pending Approval" && (
                  <Button
                    onClick={() => setIsPaymentModalOpen(true)}
                    className="flex-1 md:w-auto bg-[#64c5c3] hover:bg-[#52a3a1] text-black rounded-lg md:rounded-xl h-9 md:h-12 px-3 md:px-6 font-bold text-[8px] md:text-[10px] uppercase tracking-widest transition-all duration-300 shadow-[0_0_10px_rgba(100,197,195,0.2)]"
                  >
                    <CreditCard className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                    <span className="hidden md:inline">Make Payment</span>
                    <span className="md:hidden ml-1">Pay</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Payment Modal (Kept the same UI) --- */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="sm:max-w-xl bg-[#0a1118] border-white/10 p-0 overflow-hidden text-white rounded-2xl md:rounded-3xl w-[95vw] md:w-full">
          <DialogHeader className="p-6 md:p-8 bg-black/40 border-b border-white/5">
            <DialogTitle className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
              Settle Payment
            </DialogTitle>
            <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1 md:mt-2">
              Remaining Balance:{" "}
              <span className="text-[#64c5c3] ml-1 text-xs md:text-sm">
                ₱{balance.toLocaleString()}
              </span>
            </p>
          </DialogHeader>

          <div className="p-4 md:p-8 overflow-y-auto max-h-[75vh] md:max-h-[70vh] custom-scrollbar">
            <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-10">
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
                      "flex flex-col items-center gap-2 md:gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border transition-all duration-300",
                      selectedMethod === method
                        ? "border-[#64c5c3] bg-[#64c5c3]/10 text-[#64c5c3]"
                        : "border-white/5 bg-white/5 text-gray-500 hover:border-white/20 hover:text-white",
                    )}
                  >
                    <Icon className="w-5 h-5 md:w-6 md:h-6" />
                    <span className="text-[8px] md:text-[9px] font-bold uppercase tracking-widest">
                      {method}
                    </span>
                  </button>
                );
              })}
            </div>

            {selectedMethod !== "cash" ? (
              <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="relative group p-[1px] bg-gradient-to-br from-white/10 to-transparent rounded-xl md:rounded-2xl overflow-hidden">
                  <div className="bg-black p-6 md:p-8 flex flex-col items-center justify-center relative rounded-xl md:rounded-2xl border border-white/5">
                    <QrCode className="w-20 h-20 md:w-24 md:h-24 text-white mb-3 md:mb-4 group-hover:scale-110 group-hover:text-[#64c5c3] transition-all duration-500" />
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
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
              <div className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-xl md:rounded-2xl text-center animate-in zoom-in-95 duration-500">
                <Banknote className="w-10 h-10 md:w-12 md:h-12 text-[#64c5c3] mx-auto mb-3 md:mb-4" />
                <h4 className="text-xs md:text-sm font-bold text-white mb-1 md:mb-2 uppercase tracking-widest">
                  In-Person Settlement
                </h4>
                <p className="text-[9px] md:text-[10px] font-bold text-gray-400 leading-relaxed uppercase tracking-widest">
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
              className="w-full mt-6 md:mt-10 bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-lg md:rounded-xl h-12 md:h-14 font-black text-[10px] md:text-[11px] uppercase tracking-widest transition-all duration-300 group disabled:opacity-40 disabled:bg-[#64c5c3] disabled:cursor-not-allowed"
            >
              {isSubmittingPayment ? (
                "Authenticating..."
              ) : (
                <span className="flex items-center gap-2 md:gap-3">
                  {selectedMethod === "cash"
                    ? "Confirm Arrangement"
                    : "Submit Receipt"}
                  <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform" />
                </span>
              )}
            </Button>

            <div className="mt-6 md:mt-8 flex items-center gap-2 justify-center text-[8px] md:text-[9px] font-bold text-gray-500 uppercase tracking-widest">
              <ShieldCheck className="w-3 h-3 md:w-4 md:h-4 text-[#64c5c3]" />{" "}
              Secure Payment Protocol
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
