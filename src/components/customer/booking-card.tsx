"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import Image from "next/image";
import {
  CalendarDays,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  ShieldCheck,
  FileText,
  Navigation,
  Maximize2,
  XCircle,
  Car,
  UserCircle2,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Import the action we just created
import { cancelPendingBooking } from "@/actions/bookings";

interface BookingCardProps {
  booking: any;
}

export default function BookingCard({ booking }: BookingCardProps) {
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isCancelling, startTransition] = useTransition();

  console.log("Booking:", booking);

  // Financials & Pending State
  const balance = booking.balanceDueAtPickup || 0;
  const progressPercent = Math.min(
    100,
    Math.max(0, ((booking.amountPaid || 0) / (booking.totalAmount || 1)) * 100),
  );

  const isFullyPaid = balance <= 0;
  const isPaymentPending = booking.pendingAmount > 0;
  const isRejected = booking.displayStatus === "Cancelled"; // Fallback for rejected

  // Status Styling
  let statusStyles = "bg-white/5 text-gray-400 border-white/10";
  let StatusIcon = Clock;

  if (booking.displayStatus === "Pending") {
    statusStyles = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    StatusIcon = Clock;
  } else if (booking.displayStatus === "Upcoming Trip") {
    statusStyles = "bg-[#64c5c3]/10 text-[#64c5c3] border-[#64c5c3]/20";
    StatusIcon = CheckCircle2;
  } else if (booking.displayStatus === "Currently Driving") {
    statusStyles = "bg-blue-500/10 text-blue-400 border-blue-500/20";
    StatusIcon = Car;
  } else if (booking.displayStatus === "Completed") {
    statusStyles = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    StatusIcon = CheckCircle2;
  } else if (booking.displayStatus === "Cancelled") {
    statusStyles = "bg-red-500/10 text-red-400 border-red-500/20";
    StatusIcon = XCircle;
  }

  // Date Formatting
  const startDateStr = format(new Date(booking.startDate), "MMM dd, yyyy");
  const startTimeStr = format(new Date(booking.startDate), "h:mm a");
  const endDateStr = format(new Date(booking.endDate), "MMM dd, yyyy");
  const endTimeStr = format(new Date(booking.endDate), "h:mm a");

  const showLateWarning =
    booking.displayStatus === "Upcoming Trip" ||
    booking.displayStatus === "Currently Driving";

  const handleViewContract = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (booking.contractPdfUrl) {
      window.open(booking.contractPdfUrl, "_blank");
    } else {
      toast.error("Contract document is not yet available.");
    }
  };

  const handleGetDirections = (
    e: React.MouseEvent,
    type: "pickup" | "dropoff",
  ) => {
    e.stopPropagation();
    const coords =
      type === "pickup"
        ? booking.pickupCoordinates
        : booking.dropoffCoordinates;
    const locationName =
      type === "pickup" ? booking.pickupLocation : booking.dropoffLocation;

    if (coords) {
      // Clean coordinates if they are stored as "lat,lng" string
      const cleanCoords = coords.replace(/\s+/g, "");
      window.open(
        `https://www.google.com/maps/dir/?api=1&destination=${cleanCoords}`,
        "_blank",
      );
    } else {
      // Fallback to text search if no coords
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationName + " Ormoc")}`,
        "_blank",
      );
    }
  };

  const handleCancelBooking = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (
      confirm(
        "Are you sure you want to cancel this booking request? This action cannot be undone.",
      )
    ) {
      startTransition(async () => {
        const res = await cancelPendingBooking(booking.id);
        if (res.success) {
          toast.success(res.message);
          setIsDetailsOpen(false);
        } else {
          toast.error(res.message);
        }
      });
    }
  };

  return (
    <>
      {/* --- THE CARD --- */}
      <div
        onClick={() => setIsDetailsOpen(true)}
        className={cn(
          "bg-[#0a1118] rounded-2xl md:rounded-3xl border overflow-hidden transition-all duration-300 hover:shadow-[0_0_30px_rgba(100,197,195,0.1)] flex flex-col md:flex-row group cursor-pointer relative",
          isRejected
            ? "border-red-500/20 opacity-75 grayscale-[0.5]"
            : "border-white/5 hover:border-[#64c5c3]/30",
        )}
      >
        <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/50 p-2 rounded-full backdrop-blur-md border border-white/10 hidden md:block">
          <Maximize2 className="w-4 h-4 text-white" />
        </div>

        {/* Left Side: Image */}
        <div className="md:w-72 h-36 md:h-auto shrink-0 bg-black relative overflow-hidden">
          <Image
            src={
              booking.car?.image ||
              "https://placehold.co/1200x800?text=No+Image"
            }
            alt={booking.car?.model || "Car"}
            fill
            sizes="(max-width: 768px) 100vw, 288px"
            className="object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-700 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050B10] via-transparent to-transparent opacity-80" />

          <div className="absolute top-2 left-2 md:top-4 md:left-4">
            <div
              className={cn(
                "flex items-center gap-1.5 md:gap-2 px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md shadow-lg",
                statusStyles,
              )}
            >
              <StatusIcon className="w-3 h-3 md:w-3.5 md:h-3.5" />
              {booking.displayStatus}
            </div>
          </div>
        </div>

        {/* Right Side: Details */}
        <div className="p-4 md:p-8 flex-1 flex flex-col justify-between">
          <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4 md:mb-6">
            <div className="w-full">
              <p className="text-[8px] md:text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest mb-1">
                Ref: {booking.displayId || booking.id.split("-")[0]}
              </p>
              <h3 className="text-xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                {booking.car?.brand}{" "}
                <span className="text-gray-400">{booking.car?.model}</span>
              </h3>

              {/* Detailed Times */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 bg-white/5 border border-white/5 rounded-xl p-3 inline-flex w-full md:w-auto">
                <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-white">
                  <CalendarDays className="w-4 h-4 text-[#64c5c3]" />
                  {startDateStr} <span className="text-gray-500">at</span>{" "}
                  {startTimeStr}
                </div>
                <div className="hidden sm:block text-gray-600">→</div>
                <div className="flex items-center gap-2 text-[10px] md:text-[11px] font-bold uppercase tracking-widest text-white">
                  <Clock className="w-4 h-4 text-amber-400" />
                  {endDateStr} <span className="text-gray-500">at</span>{" "}
                  {endTimeStr}
                </div>
              </div>

              {showLateWarning && (
                <p className="text-[9px] md:text-[10px] text-amber-400/80 font-bold uppercase tracking-widest mt-3 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" /> Note: Return by{" "}
                  {endTimeStr} sharp to avoid late fees.
                </p>
              )}
            </div>

            <div className="text-left md:text-right hidden md:block shrink-0">
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                Total Booking
              </p>
              <p className="text-3xl font-black text-white tracking-tighter">
                ₱{booking.totalAmount?.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Progress & Actions Box */}
          <div className="bg-white/5 border border-white/10 p-3 md:p-5 rounded-xl md:rounded-2xl mt-auto">
            {isRejected ? (
              <div className="bg-red-500/10 border border-red-500/20 p-3 md:p-4 rounded-xl mb-3 md:mb-4 flex gap-3 items-start">
                <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="w-full">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">
                    Booking Cancelled / Rejected
                  </p>
                  <p className="text-[9px] md:text-[10px] text-red-400/80 font-medium leading-relaxed">
                    {booking.notes ||
                      "This booking request was rejected by the administration or cancelled. Please return to the fleet to create a new booking."}
                  </p>
                </div>
              </div>
            ) : isPaymentPending && booking.displayStatus === "Pending" ? (
              <div className="bg-amber-500/10 border border-amber-500/20 p-3 md:p-4 rounded-xl mb-3 md:mb-4 flex gap-3 items-start">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="w-full">
                  <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1 flex items-center justify-between w-full">
                    <span>Receipt Under Review</span>
                    <span className="text-amber-300">
                      ₱{booking.pendingAmount.toLocaleString()}
                    </span>
                  </p>
                  <p className="text-[9px] md:text-[10px] text-amber-400/80 font-medium leading-relaxed">
                    We've received your submitted payment. The admin is
                    currently verifying your receipt. Your dates are fully
                    secured during this review!
                  </p>
                </div>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-end mb-2 md:mb-3">
                  <p className="text-[8px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Reservation Paid
                  </p>
                  <p className="text-[8px] md:text-[10px] font-bold text-white tracking-widest uppercase">
                    <span className="text-[#64c5c3]">
                      ₱{booking.amountPaid?.toLocaleString()}
                    </span>{" "}
                    / ₱{booking.totalAmount?.toLocaleString()}
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

                {!isFullyPaid && booking.displayStatus !== "Cancelled" && (
                  <div className="flex items-center justify-between text-[8px] md:text-[10px] font-bold uppercase tracking-widest text-white bg-black/40 p-2.5 md:p-3 rounded-lg md:rounded-xl border border-white/5 mb-3 md:mb-4">
                    <span className="flex items-center gap-2 text-gray-400">
                      <ShieldCheck className="w-4 h-4 text-[#64c5c3]" /> Due at
                      Handover:
                    </span>
                    <span className="text-[#64c5c3]">
                      ₱{balance.toLocaleString()}
                    </span>
                  </div>
                )}
              </>
            )}

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-3 h-3 text-gray-500" />
                <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  Pick-up:{" "}
                  <span className="text-white">{booking.pickupLocation}</span>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-row w-full sm:w-auto gap-2">
                {booking.displayStatus === "Pending" && !isRejected && (
                  <Button
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                    variant="outline"
                    className="flex-1 sm:w-auto border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 bg-transparent rounded-lg h-9 md:h-10 px-4 font-bold text-[8px] md:text-[9px] uppercase tracking-widest z-10"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Request"}
                  </Button>
                )}

                {booking.contractPdfUrl && !isRejected && (
                  <Button
                    onClick={handleViewContract}
                    variant="outline"
                    className="flex-1 sm:w-auto border-white/20 bg-transparent hover:bg-white/10 text-white rounded-lg h-9 md:h-10 px-4 font-bold text-[8px] md:text-[9px] uppercase tracking-widest z-10"
                  >
                    <FileText className="w-3 h-3 mr-2" /> Contract
                  </Button>
                )}

                {(booking.displayStatus === "Upcoming Trip" ||
                  booking.displayStatus === "Currently Driving") &&
                  !isRejected && (
                    <Button
                      onClick={(e) => handleGetDirections(e, "pickup")}
                      className="flex-1 sm:w-auto bg-[#64c5c3] hover:bg-[#52a3a1] text-black rounded-lg h-9 md:h-10 px-4 font-bold text-[8px] md:text-[9px] uppercase tracking-widest z-10"
                    >
                      <Navigation className="w-3 h-3 mr-2" /> Navigate
                    </Button>
                  )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- DETAILED ITINERARY MODAL --- */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-6xl! w-[95vw] sm:w-[80vw] lg:w-[60vw]! bg-[#0a1118]/95 backdrop-blur-3xl border border-[#64c5c3]/20 p-0 rounded-3xl shadow-[0_0_50px_rgba(100,197,195,0.15)] text-white overflow-hidden overflow-y-auto max-h-[90vh] custom-scrollbar">
          {/* Header Hero */}
          <div className="relative h-48 w-full bg-black">
            <Image
              src={
                booking.car?.image ||
                "https://placehold.co/1200x800?text=No+Image"
              }
              alt={booking.car?.model || "Car"}
              fill
              className={cn(
                "object-cover opacity-60",
                isRejected && "grayscale",
              )}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1118] via-[#0a1118]/50 to-transparent" />

            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest mb-1">
                  Ref: {booking.displayId || booking.id.split("-")[0]}
                </p>
                <DialogTitle className="text-3xl font-black text-white uppercase tracking-tighter">
                  {booking.car?.brand} {booking.car?.model}
                </DialogTitle>
              </div>
              <div
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest border backdrop-blur-md",
                  statusStyles,
                )}
              >
                <StatusIcon className="w-3 h-3" /> {booking.displayStatus}
              </div>
            </div>
          </div>

          <div className="p-6 md:p-8 space-y-8">
            {/* Rejection / Cancellation Banner */}
            {isRejected && (
              <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl flex items-start gap-3 text-red-400">
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest mb-1">
                    Booking Cancelled
                  </p>
                  <p className="text-[10px] md:text-xs leading-relaxed font-medium text-red-400/80">
                    {booking.notes ||
                      "This booking was rejected or cancelled. Any uploaded payments that were not verified have been discarded. If you believe this is an error, please contact support."}
                  </p>
                </div>
              </div>
            )}

            {/* Grid Layout for details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-8">
                {/* Schedule Block */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">
                    Trip Schedule
                  </h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <CalendarDays className="w-3 h-3" /> Pick-up
                      </p>
                      <p className="text-sm font-bold text-white uppercase tracking-wider">
                        {startDateStr}
                      </p>
                      <p className="text-[11px] font-black text-[#64c5c3] tracking-widest">
                        {startTimeStr}
                      </p>
                    </div>
                    <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                        <Clock className="w-3 h-3" /> Drop-off
                      </p>
                      <p className="text-sm font-bold text-white uppercase tracking-wider">
                        {endDateStr}
                      </p>
                      <p className="text-[11px] font-black text-amber-400 tracking-widest">
                        {endTimeStr}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Logistics Block */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">
                    Logistics & Handover
                  </h4>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-start justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex gap-3">
                        <div className="bg-[#64c5c3]/10 p-2 rounded-lg shrink-0 h-fit">
                          <MapPin className="w-4 h-4 text-[#64c5c3]" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Pick-up Location
                          </p>
                          <p className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">
                            {booking.pickupLocation}
                          </p>
                        </div>
                      </div>
                      {!isRejected && (
                        <Button
                          onClick={(e) => handleGetDirections(e, "pickup")}
                          variant="ghost"
                          size="icon"
                          className="text-[#64c5c3] hover:bg-[#64c5c3]/20 shrink-0"
                        >
                          <Navigation className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="flex items-start justify-between bg-white/5 p-4 rounded-2xl border border-white/5">
                      <div className="flex gap-3">
                        <div className="bg-[#64c5c3]/10 p-2 rounded-lg shrink-0 h-fit">
                          <MapPin className="w-4 h-4 text-[#64c5c3]" />
                        </div>
                        <div>
                          <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1">
                            Drop-off Location
                          </p>
                          <p className="text-[11px] font-bold text-white uppercase tracking-wider mb-2">
                            {booking.dropoffLocation}
                          </p>
                        </div>
                      </div>
                      {!isRejected && (
                        <Button
                          onClick={(e) => handleGetDirections(e, "dropoff")}
                          variant="ghost"
                          size="icon"
                          className="text-[#64c5c3] hover:bg-[#64c5c3]/20 shrink-0"
                        >
                          <Navigation className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Driver Info (If Requested/Assigned) */}
                {booking.isWithDriver && (
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">
                      Chauffeur Details
                    </h4>

                    {booking.driver ? (
                      <div className="bg-[#64c5c3]/5 border border-[#64c5c3]/20 p-4 rounded-2xl flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-[#050B10] border border-[#64c5c3]/30 overflow-hidden flex items-center justify-center shrink-0">
                          {booking.driver.profileUrl ? (
                            <img
                              src={booking.driver.profileUrl}
                              alt="Driver"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCircle2 className="w-6 h-6 text-[#64c5c3]" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest mb-0.5">
                            Assigned Driver
                          </p>
                          <p className="text-sm font-bold text-white uppercase tracking-wider">
                            {booking.driver.name}
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium flex items-center gap-1.5 mt-1">
                            <Phone className="w-3 h-3" />{" "}
                            {booking.driver.phone || "Number protected"}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white/5 border border-white/5 p-4 rounded-2xl flex items-center gap-3 text-gray-400">
                        <Clock className="w-4 h-4 text-amber-400" />
                        <p className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                          Chauffeur service requested. Admin will assign a
                          driver closer to your trip date.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Right Column: Financials */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest border-b border-white/10 pb-2">
                  Financial Breakdown
                </h4>
                <div className="bg-black/40 rounded-2xl p-5 md:p-6 border border-white/5">
                  {/* Map over the charges array if it exists */}
                  <div className="space-y-3 mb-6">
                    {booking.charges && booking.charges.length > 0 ? (
                      booking.charges.map((charge: any) => (
                        <div
                          key={charge.id}
                          className="flex justify-between items-start"
                        >
                          <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                            {charge.description}
                          </span>
                          <span
                            className={cn(
                              "text-[11px] font-bold",
                              charge.amount < 0
                                ? "text-[#64c5c3]"
                                : "text-gray-300",
                            )}
                          >
                            {charge.amount < 0 ? "- " : ""}₱
                            {Math.abs(charge.amount).toLocaleString()}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="text-[10px] text-gray-500 italic">
                        No itemized charges available.
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-white/10 space-y-4">
                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-widest text-white">
                      <span>Total Booking Cost</span>
                      <span>₱{booking.totalAmount?.toLocaleString()}</span>
                    </div>

                    {isPaymentPending ? (
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 p-3 rounded-lg border border-amber-500/20">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> Pending Review
                        </span>
                        <span>₱{booking.pendingAmount.toLocaleString()}</span>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-gray-400">
                        <span>Reservation Paid</span>
                        <span className="text-emerald-400">
                          - ₱{booking.amountPaid?.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="pt-3 border-t border-white/10 border-dashed flex justify-between items-center">
                      <span className="text-[11px] font-black uppercase tracking-widest text-white">
                        Balance Due at Pickup
                      </span>
                      <span className="text-lg font-black tracking-tighter text-[#64c5c3]">
                        {isPaymentPending
                          ? "TBD"
                          : `₱${balance.toLocaleString()}`}
                      </span>
                    </div>
                  </div>
                </div>

                {!isRejected && booking.displayStatus === "Pending" && (
                  <Button
                    onClick={handleCancelBooking}
                    disabled={isCancelling}
                    className="w-full bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-xl h-12 font-bold text-[10px] uppercase tracking-widest mt-4"
                  >
                    {isCancelling ? "Cancelling..." : "Cancel Booking Request"}
                  </Button>
                )}

                <Button
                  onClick={() => setIsDetailsOpen(false)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/10 rounded-xl h-12 font-bold text-[10px] uppercase tracking-widest mt-4"
                >
                  Close Details
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
