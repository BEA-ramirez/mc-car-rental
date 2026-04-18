"use client";

import { useState } from "react";
import { format } from "date-fns";
import {
  ShieldCheck,
  CarFront,
  CalendarDays,
  Wallet,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import ReceiptScanner from "@/components/bookings/receipt-scanner";

// Mock data for the booking (In reality, you'd fetch this based on the booking ID in the URL)
const mockBooking = {
  id: "BK-9A772",
  carName: "2023 Toyota Fortuner",
  startDate: new Date(2026, 3, 10), // April 10, 2026
  endDate: new Date(2026, 3, 13), // April 13, 2026
  totalPrice: 12500,
};

export default function CheckoutPage() {
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [referenceNumber, setReferenceNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [scannedAmount, setScannedAmount] = useState("");

  // This function receives the data from our ReceiptScanner component
  const handleScanComplete = (file: File, refNum: string, amount: string) => {
    setReceiptFile(file);
    setReferenceNumber(refNum);
    setScannedAmount(amount); // Save the amount!
  };

  const handleSubmitPayment = async () => {
    if (!receiptFile || !referenceNumber || !scannedAmount) {
      toast.error("Please upload a receipt and confirm the details.");
      return;
    }

    // Security Check: Did they type in a lower amount?
    if (Number(scannedAmount) < mockBooking.totalPrice) {
      toast.error(
        `The amount entered (₱${scannedAmount}) is less than the total required (₱${mockBooking.totalPrice}).`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // --- BACKEND LOGIC GOES HERE ---
      // 1. Upload `receiptFile` to Supabase Storage (e.g., 'payment_receipts' bucket)
      // 2. Get the public URL of the uploaded image
      // 3. Update the `bookings` table:
      //    - status: 'Pending Verification'
      //    - payment_reference: referenceNumber
      //    - payment_receipt_url: the URL from step 2

      // Simulating a network request for now
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Payment submitted successfully!");
      setIsSuccess(true);
    } catch {
      toast.error("Failed to submit payment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 bg-white border border-slate-200 rounded-sm shadow-sm text-center">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Payment Received!
        </h2>
        <p className="text-slate-600 mb-6">
          Thank you for choosing MC Ormoc Car Rental. Our team is verifying your
          GCash payment (Ref:{" "}
          <span className="font-mono font-bold">{referenceNumber}</span>). We
          will send you a confirmation email shortly.
        </p>
        <Button className="bg-slate-900 text-white hover:bg-slate-800 rounded-sm px-8">
          View My Bookings
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight">
          Complete Your Booking
        </h1>
        <p className="text-slate-500 mt-1">
          Review your details and complete your payment below.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-50 border border-slate-200 rounded-sm p-6">
            <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
              <CarFront className="w-4 h-4" /> Rental Summary
            </h3>

            <div className="mb-6">
              <p className="text-xs text-slate-500 font-mono mb-1">
                Booking ID: {mockBooking.id}
              </p>
              <h2 className="text-xl font-bold text-slate-900 leading-tight">
                {mockBooking.carName}
              </h2>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <CalendarDays className="w-4 h-4 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-widest">
                    Pick-up & Drop-off
                  </p>
                  <p className="text-sm text-slate-900 font-medium mt-0.5">
                    {format(mockBooking.startDate, "MMM dd, yyyy")}{" "}
                    <ArrowRight className="inline w-3 h-3 mx-1 text-slate-400" />{" "}
                    {format(mockBooking.endDate, "MMM dd, yyyy")}
                  </p>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4 mt-4">
              <div className="flex items-end justify-between">
                <p className="text-sm font-bold text-slate-700">Total Amount</p>
                <p className="text-3xl font-black font-mono text-blue-600">
                  ₱{mockBooking.totalPrice.toLocaleString()}
                </p>
              </div>
              <p className="text-[10px] text-slate-400 text-right mt-1">
                Includes all taxes and fees
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-sm text-emerald-700">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <p className="text-xs font-medium leading-snug">
              Your payment is secure. We manually verify all transactions to
              ensure your booking is safely confirmed.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Payment Instructions & Scanner */}
        <div className="lg:col-span-7 space-y-6">
          {/* Instructions Card */}
          <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Wallet className="w-5 h-5 text-blue-600" /> Pay via GCash
            </h3>

            <div className="bg-blue-50 border border-blue-100 rounded-sm p-4 mb-6">
              <ol className="list-decimal list-inside space-y-2 text-sm text-slate-700">
                <li>
                  Open your GCash App and tap <strong>Send Money</strong>.
                </li>
                <li>
                  Send exactly{" "}
                  <strong className="text-blue-700 font-mono">
                    ₱{mockBooking.totalPrice.toLocaleString()}
                  </strong>{" "}
                  to the number below.
                </li>
                <li>Take a screenshot of the GCash receipt.</li>
              </ol>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start p-4 bg-slate-50 border border-slate-200 rounded-sm">
              {/* Fake QR Code Box (You can replace this with an actual image of your GCash QR later) */}
              <div className="w-32 h-32 bg-white border-2 border-dashed border-slate-300 rounded-sm flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Your QR
                  <br />
                  Here
                </span>
              </div>

              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Account Name
                </p>
                <p className="text-lg font-bold text-slate-900 mb-3">
                  MC Ormoc Car Rental
                </p>

                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                  GCash Number
                </p>
                <p className="text-2xl font-black font-mono text-blue-600 tracking-wider">
                  0912 345 6789
                </p>
              </div>
            </div>
          </div>

          {/* Our Custom Scanner Component! */}
          <ReceiptScanner
            onScanComplete={handleScanComplete}
            expectedAmount={mockBooking.totalPrice}
          />

          {/* Submit Action */}
          <div className="pt-4 border-t border-slate-200 flex justify-end">
            <Button
              size="lg"
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white rounded-sm font-bold px-8 h-12"
              onClick={handleSubmitPayment}
              disabled={!receiptFile || !referenceNumber || isSubmitting}
            >
              {isSubmitting
                ? "Submitting Payment..."
                : "Confirm & Complete Booking"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
