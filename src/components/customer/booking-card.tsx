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

  // Scanner State
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

  let statusColor = "bg-slate-100 text-slate-700";
  let StatusIcon = Clock;

  if (booking.status === "Pending Approval") {
    statusColor = "bg-amber-100 text-amber-800 border-amber-200";
    StatusIcon = Clock;
  } else if (booking.status === "Awaiting Payment") {
    statusColor = "bg-blue-100 text-blue-800 border-blue-200";
    StatusIcon = AlertCircle;
  } else if (booking.status === "Completed" || booking.status === "Confirmed") {
    statusColor = "bg-emerald-100 text-emerald-800 border-emerald-200";
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
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Image */}
        <div className="md:w-64 h-48 md:h-auto shrink-0 bg-slate-100 relative">
          <Image
            src={
              booking.car.image || "https://placehold.co/600x400?text=No+Image"
            }
            alt={booking.car.model}
            fill
            sizes="(max-width: 768px) 100vw, 256px"
            className="object-cover"
          />
          <div className="absolute top-4 left-4">
            <div
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border shadow-sm backdrop-blur-md bg-white/90",
                statusColor,
              )}
            >
              <StatusIcon className="w-3.5 h-3.5" />
              {booking.status}
            </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">
                Booking ID: {booking.id}
              </p>
              <h3 className="text-xl font-black text-slate-900 leading-tight">
                {booking.car.brand} {booking.car.model}
              </h3>
              <div className="flex items-center gap-2 mt-3 text-sm font-medium text-slate-600">
                <CalendarDays className="w-4 h-4 text-slate-400" />
                {format(booking.startDate, "MMM dd, yyyy")} -{" "}
                {format(booking.endDate, "MMM dd, yyyy")}
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Grand Total
              </p>
              <p className="text-2xl font-black font-mono text-slate-900">
                ₱{booking.totalAmount.toLocaleString()}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
            <div className="flex justify-between items-end mb-2">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Payment Progress
              </p>
              <p className="text-sm font-bold text-slate-900">
                <span className="text-blue-600">
                  ₱{booking.amountPaid.toLocaleString()}
                </span>{" "}
                / ₱{booking.totalAmount.toLocaleString()}
              </p>
            </div>

            <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden mb-3">
              <div
                className={cn(
                  "h-full transition-all duration-1000 ease-out",
                  isFullyPaid ? "bg-emerald-500" : "bg-blue-600",
                )}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {booking.pendingAmount > 0 && (
              <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-100">
                <Clock className="w-3.5 h-3.5 shrink-0" />₱
                {booking.pendingAmount.toLocaleString()} is currently pending
                admin verification.
              </div>
            )}

            <div className="flex items-center justify-between mt-2">
              <p className="text-xs font-medium text-slate-500">
                {isFullyPaid
                  ? "Fully Paid"
                  : `Remaining Balance: ₱${balance.toLocaleString()}`}
              </p>

              {!isFullyPaid && booking.status !== "Pending Approval" && (
                <Button
                  onClick={() => setIsPaymentModalOpen(true)}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Make Payment
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Selection & Upload Modal */}
      <Dialog
        open={isPaymentModalOpen}
        onOpenChange={(open) => {
          setIsPaymentModalOpen(open);
          if (!open) {
            setScannedFile(null);
            setScannedRef("");
            setScannedAmount("");
          }
        }}
      >
        <DialogContent className="sm:max-w-xl rounded-3xl p-0 overflow-hidden border-slate-200 bg-white max-h-[90vh] flex flex-col">
          <DialogHeader className="p-6 bg-slate-50 border-b border-slate-100 shrink-0">
            <DialogTitle className="text-xl font-bold text-slate-900">
              Make a Payment
            </DialogTitle>
            <p className="text-sm text-slate-500 mt-1">
              Remaining balance: <strong>₱{balance.toLocaleString()}</strong>
            </p>
          </DialogHeader>

          <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-3 mb-6 shrink-0">
              <button
                onClick={() => setSelectedMethod("gcash")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  selectedMethod === "gcash"
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-100 hover:border-slate-200",
                )}
              >
                <Smartphone
                  className={cn(
                    "w-5 h-5",
                    selectedMethod === "gcash"
                      ? "text-blue-600"
                      : "text-slate-400",
                  )}
                />
                <span className="text-xs font-bold text-slate-900">GCash</span>
              </button>
              <button
                onClick={() => setSelectedMethod("bank")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  selectedMethod === "bank"
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-100 hover:border-slate-200",
                )}
              >
                <Landmark
                  className={cn(
                    "w-5 h-5",
                    selectedMethod === "bank"
                      ? "text-blue-600"
                      : "text-slate-400",
                  )}
                />
                <span className="text-xs font-bold text-slate-900">
                  Bank Transfer
                </span>
              </button>
              <button
                onClick={() => setSelectedMethod("cash")}
                className={cn(
                  "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                  selectedMethod === "cash"
                    ? "border-blue-600 bg-blue-50/50"
                    : "border-slate-100 hover:border-slate-200",
                )}
              >
                <Banknote
                  className={cn(
                    "w-5 h-5",
                    selectedMethod === "cash"
                      ? "text-blue-600"
                      : "text-slate-400",
                  )}
                />
                <span className="text-xs font-bold text-slate-900">Cash</span>
              </button>
            </div>

            {selectedMethod !== "cash" ? (
              <div className="space-y-6">
                {/* Dummy QR Code Area */}
                <div className="bg-slate-100 rounded-xl p-6 flex flex-col items-center justify-center border border-slate-200 border-dashed">
                  <QrCode className="w-16 h-16 text-slate-300 mb-2" />
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Scan to Pay via {selectedMethod.toUpperCase()}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Official Company Account
                  </p>
                </div>

                {/* Upload Scanner */}
                <ReceiptScanner
                  expectedAmount={balance}
                  onScanComplete={handleScanUpdate}
                />
              </div>
            ) : (
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-6 text-center">
                <Banknote className="w-12 h-12 text-amber-500 mx-auto mb-3" />
                <h4 className="font-bold text-amber-900 mb-1">
                  Pay upon Pickup
                </h4>
                <p className="text-sm text-amber-700">
                  You have selected to pay the remaining balance in cash when
                  you pick up your vehicle.
                </p>
              </div>
            )}

            <Button
              onClick={handleSubmitPayment}
              disabled={
                (selectedMethod !== "cash" && !scannedFile) ||
                isSubmittingPayment
              }
              className="w-full mt-6 bg-slate-900 hover:bg-slate-800 text-white rounded-xl h-12 font-bold shadow-md disabled:opacity-50 shrink-0"
            >
              {isSubmittingPayment
                ? "Processing..."
                : selectedMethod === "cash"
                  ? "Confirm Cash Payment"
                  : "Submit Receipt"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
