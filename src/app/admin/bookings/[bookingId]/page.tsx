"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Car,
  User,
  MapPin,
  Clock,
  Banknote,
  FileText,
  ShieldCheck,
  Plus,
  AlertCircle,
  CheckCircle2,
  Printer,
  CalendarRange,
  XCircle,
  UserCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// --- EXISTING COMPONENT IMPORTS ---
import CancelBookingDialog from "@/components/bookings/cancel-booking-dialog";
import BookingIncomeBreakdownModal from "@/components/income/booking-income-breakdown";
import ExtendBookingDialog from "@/components/bookings/extend-booking-dialog";
import DispatchDialog from "@/components/bookings/dispatch-dialog";
import ContractPreviewModal from "@/components/documents/contract-preview-modal";
import InspectionExecutionModal from "@/components/documents/inspection-execution-modal";

import {
  useBookingDetails,
  useBookings,
} from "../../../../../hooks/use-bookings";
import { useDocumentMutations } from "../../../../../hooks/use-documents";
import { useBookingWorkflows } from "../../../../../hooks/use-booking-workflow";
import { generateInvoicePDF } from "@/utils/export-pdf";
import { useBookingFolio } from "../../../../../hooks/use-incomes";

export default function AdminBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;

  // --- CORE DATA HOOKS ---
  const { data: booking, isLoading, isError } = useBookingDetails(bookingId);
  const { updateNote, isUpdatingNote } = useBookings();
  const {
    contract,
    inspections,
    inspectionTemplate,
    generateContract,
    isGeneratingContract,
    startTrip,
    isStartingTrip,
  } = useBookingWorkflows(bookingId);
  const { signContract } = useDocumentMutations();
  const { data: folio } = useBookingFolio(bookingId);

  // --- MODAL STATES ---
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [financeModal, setFinanceModal] = useState<{
    isOpen: boolean;
    action: "none" | "payment" | "charge" | "refund";
  }>({ isOpen: false, action: "none" });

  // DOC MODAL STATES
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isInspectionExecOpen, setIsInspectionExecOpen] = useState(false);

  // NOTE STATE
  const [adminNote, setAdminNote] = useState("");

  // Sync note when booking loads
  useEffect(() => {
    if (booking?.notes) setAdminNote(booking.notes);
  }, [booking?.notes]);

  // --- EARLY RETURNS ---
  if (isLoading) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Loading Booking Data...
        </p>
      </div>
    );
  }

  if (isError || !booking) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-background">
        <AlertCircle className="w-12 h-12 text-destructive/50 mb-4" />
        <h2 className="text-lg font-bold">Booking Not Found</h2>
      </div>
    );
  }

  const balance = booking.total_price - booking.amount_paid;

  // For Extend/Shorten Modal
  const mockSchedulerEvent = {
    id: booking.id,
    title: booking.customer.name,
    start: booking.start_date,
    end: booking.end_date,
    resourceId: booking.car.id,
  };

  // --- THE SEQUENTIAL HANDOVER LOGIC ---
  const preTripInspection = inspections?.find(
    (i: any) => i.type === "Pre-trip",
  );

  const draftChecklist =
    inspectionTemplate?.map((cat: any) => ({
      categoryId: cat.id,
      categoryName: cat.name,
      items: cat.items.map((item: any) => ({
        itemId: item.id,
        label: item.label,
        status: "PENDING",
        notes: "",
        photoUrl: null,
      })),
    })) || [];

  const handleContractSigned = async (id: string, signatureDataUrl: string) => {
    try {
      await signContract.mutateAsync({ id, signatureDataUrl });
      setIsContractOpen(false);
      // Contract signed, vehicle released -> Trip is Ongoing!
      await startTrip(bookingId);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartHandoverClick = async () => {
    // 1. Generate contract if it doesn't exist yet
    if (!contract) {
      await generateContract(bookingId);
    }
    // 2. Start sequence by opening the Inspection
    setIsInspectionExecOpen(true);
  };

  const handleInspectionComplete = () => {
    setIsInspectionExecOpen(false);
    // After Inspection closes, automatically ask customer to sign
    setIsContractOpen(true);
  };

  return (
    <div className="h-screen bg-background text-foreground font-sans overflow-hidden flex flex-col transition-colors duration-300">
      {/* --- TOP HEADER --- */}
      <header className="px-4 py-3 sm:px-6 shrink-0 flex justify-between items-center border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-1.5 bg-secondary border border-border rounded text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-0.5">
              <span>Bookings</span> <span className="opacity-50">/</span>{" "}
              <span className="text-primary">Details</span>
            </div>
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-black tracking-tighter uppercase">
                {booking.id.split("-")[0]}
              </h1>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] font-bold uppercase tracking-widest px-2",
                  booking.status === "ongoing"
                    ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                    : "bg-primary/10 text-primary border-primary/20",
                )}
              >
                {booking.status}
              </Badge>
            </div>
          </div>
        </div>

        {/* --- HEADER ACTIONS --- */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExtendOpen(true)}
            className="h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            <CalendarRange className="w-3.5 h-3.5 mr-2" /> Modify Dates
          </Button>

          <Button
            onClick={() => generateInvoicePDF(folio)}
            variant="outline"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase tracking-widest"
          >
            <Printer className="w-3.5 h-3.5 mr-2" /> Print Invoice
          </Button>

          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsCancelOpen(true)}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
          >
            <XCircle className="w-3.5 h-3.5 mr-2" /> Cancel Booking
          </Button>
        </div>
      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:px-6">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-4">
          {/* === LEFT COLUMN: THE ENTITIES === */}
          <div className="xl:col-span-3 flex flex-col gap-4">
            {/* Customer Card */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Customer
              </h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                  <User className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-bold">{booking.customer.name}</p>
                  <p className="text-[10px] font-medium text-muted-foreground">
                    {booking.customer.email}
                  </p>
                </div>
              </div>
              <div className="flex gap-2 mb-4">
                <Button
                  variant="outline"
                  className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-secondary"
                >
                  <Phone className="w-3 h-3 mr-1.5" /> Call
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-secondary"
                >
                  <MessageSquare className="w-3 h-3 mr-1.5" /> SMS
                </Button>
              </div>
            </div>

            {/* Vehicle Card */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Assigned Asset
              </h3>
              <div className="flex gap-3">
                <img
                  src={booking.car.image}
                  alt="Car"
                  className="w-16 h-12 object-cover rounded border border-border"
                />
                <div>
                  <p className="text-xs font-bold uppercase">
                    {booking.car.brand} {booking.car.model}
                  </p>
                  <p className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 mt-1 inline-block">
                    {booking.car.plate}
                  </p>
                </div>
              </div>
            </div>

            {/* Driver Card */}
            {booking.is_with_driver && (
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Chauffeur / Driver
                </h3>
                {booking.driver ? (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                      <UserCircle className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold">{booking.driver.name}</p>
                      <Button
                        variant="link"
                        onClick={() => setIsDispatchOpen(true)}
                        className="h-5 p-0 text-[10px] text-primary"
                      >
                        Change Driver
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-3 border border-dashed border-border rounded-lg bg-secondary/30">
                    <p className="text-[10px] font-medium text-muted-foreground mb-2">
                      No driver assigned yet.
                    </p>
                    <Button
                      onClick={() => setIsDispatchOpen(true)}
                      size="sm"
                      className="h-7 text-[9px] font-bold uppercase tracking-widest w-full"
                    >
                      Assign Driver
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Internal Notes */}
            <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex-1 flex flex-col">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                Internal Notes
              </h3>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                className="w-full flex-1 min-h-[120px] bg-secondary border border-border rounded-md p-2 text-xs text-foreground resize-none focus:ring-1 focus:ring-primary outline-none"
                placeholder="Add private admin notes here..."
              />
              <Button
                onClick={() =>
                  updateNote({ bookingId: booking.id, note: adminNote })
                }
                disabled={isUpdatingNote || adminNote === booking.notes}
                size="sm"
                className="w-full mt-3 h-7 text-[9px] font-bold uppercase tracking-widest"
              >
                {isUpdatingNote ? "Saving..." : "Save Note"}
              </Button>
            </div>
          </div>

          {/* === RIGHT COLUMN: WORKFLOWS & FINANCE === */}
          <div className="xl:col-span-9 flex flex-col gap-4">
            {/* BIG ACTION BANNER */}
            {booking.status === "confirmed" && (
              <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
                <div>
                  <h2 className="text-lg font-black uppercase text-primary tracking-tight flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" /> Awaiting Vehicle
                    Handover
                  </h2>
                  <p className="text-xs text-primary/80 font-medium mt-1">
                    Customer arrives on{" "}
                    {format(booking.start_date, "MMM dd, yyyy")}. Complete
                    inspection to release.
                  </p>
                </div>
                <Button
                  onClick={handleStartHandoverClick}
                  disabled={isStartingTrip}
                  size="lg"
                  className="shrink-0 bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] h-12 px-8 shadow-sm transition-all hover:scale-[1.02]"
                >
                  {isStartingTrip ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Start Handover Sequence"
                  )}
                </Button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Financial Ledger */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-4 pb-3 border-b border-border">
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Banknote className="w-3.5 h-3.5" /> Financial Ledger
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setFinanceModal({ isOpen: true, action: "none" })
                      }
                      className="h-6 text-[9px] font-bold uppercase tracking-widest text-primary hover:bg-primary/10"
                    >
                      View Full Ledger
                    </Button>
                  </div>

                  <div className="space-y-3 text-xs font-medium">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">
                        Gross Rental Total
                      </span>
                      <span className="font-bold">
                        ₱{booking.total_price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-emerald-600 bg-emerald-500/5 px-2 py-1 rounded-sm border border-emerald-500/10">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Reservation Fee
                        Paid
                      </span>
                      <span>- ₱{booking.amount_paid.toLocaleString()}</span>
                    </div>
                    <div className="pt-3 border-t border-dashed border-border flex justify-between items-center">
                      <span className="font-black uppercase tracking-widest text-[10px]">
                        Remaining Balance Due
                      </span>
                      <span className="text-sm font-black text-primary">
                        ₱{Math.max(0, balance).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border flex gap-2">
                  <Button
                    onClick={() =>
                      setFinanceModal({ isOpen: true, action: "payment" })
                    }
                    variant="outline"
                    className="flex-1 h-8 text-[9px] font-bold uppercase tracking-widest border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
                  >
                    Receive Payment
                  </Button>
                  <Button
                    onClick={() =>
                      setFinanceModal({ isOpen: true, action: "charge" })
                    }
                    variant="outline"
                    className="flex-1 h-8 text-[9px] font-bold uppercase tracking-widest border-amber-500/30 text-amber-600 hover:bg-amber-500/10"
                  >
                    <Plus className="w-3 h-3 mr-1" /> Add Charge
                  </Button>
                </div>

                <div className="mt-4 p-3 bg-secondary/50 border border-border rounded-lg flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" /> Security Deposit
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[8px] bg-amber-500/10 text-amber-500 border-amber-500/20"
                      >
                        Held
                      </Badge>
                    </div>
                    <p className="text-sm font-black">
                      ₱{booking.security_deposit.toLocaleString()}
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      setFinanceModal({ isOpen: true, action: "refund" })
                    }
                    size="sm"
                    variant="outline"
                    className="h-7 text-[9px] font-bold uppercase tracking-widest"
                  >
                    Manage
                  </Button>
                </div>
              </div>

              {/* Logistics & Paperwork */}
              <div className="flex flex-col gap-4">
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex-1">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 pb-3 border-b border-border">
                    Logistics & Documents
                  </h3>

                  <div className="space-y-4">
                    {/* Route */}
                    <div className="flex items-start gap-3">
                      <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Route
                        </p>
                        <p className="text-xs font-semibold">
                          {booking.pickup_location} → {booking.dropoff_location}
                        </p>
                      </div>
                    </div>

                    {/* --- DYNAMIC CONTRACT ROW --- */}
                    {!contract ? (
                      // STATE 1: NO CONTRACT EXISTS YET
                      <div className="flex items-center justify-between p-3 border border-dashed border-border rounded-lg bg-secondary/10">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-muted-foreground/50" />
                          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Lease Contract
                          </span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => generateContract(bookingId)}
                          disabled={isGeneratingContract}
                          className="h-7 text-[9px] font-bold uppercase tracking-widest"
                        >
                          {isGeneratingContract ? (
                            <Loader2 className="w-3 h-3 animate-spin mr-1.5" />
                          ) : (
                            <Plus className="w-3 h-3 mr-1.5" />
                          )}
                          Generate Document
                        </Button>
                      </div>
                    ) : (
                      // STATE 2 & 3: CONTRACT EXISTS (SIGNED OR UNSIGNED)
                      <div
                        onClick={() => setIsContractOpen(true)}
                        className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/30 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                      >
                        <div className="flex items-center gap-2">
                          <FileText
                            className={cn(
                              "w-4 h-4",
                              contract.is_signed
                                ? "text-emerald-500"
                                : "text-primary group-hover:text-primary",
                            )}
                          />
                          <span className="text-[10px] font-bold uppercase tracking-widest">
                            Lease Contract
                          </span>
                        </div>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] uppercase",
                            contract.is_signed
                              ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                              : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                          )}
                        >
                          {contract.is_signed ? "Signed" : "Awaiting Signature"}
                        </Badge>
                      </div>
                    )}

                    {/* Inspection Box */}
                    <div
                      onClick={() => setIsInspectionExecOpen(true)}
                      className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/30 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Pre-Trip Inspection
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[8px] uppercase",
                          booking.has_pre_trip
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        )}
                      >
                        {booking.has_pre_trip ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AUDIT TIMELINE */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm mt-auto">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4">
                Audit & Activity Log
              </h3>
              <div className="relative border-l border-border ml-2 space-y-4">
                <div className="relative pl-4">
                  <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-card border border-border flex items-center justify-center">
                    <div className="w-1 h-1 rounded-full bg-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-medium text-muted-foreground">
                    <Clock className="w-2.5 h-2.5" /> <span>System Note</span>
                  </div>
                  <p className="text-[10px] font-medium leading-tight text-foreground">
                    Audit logs will be fetched dynamically in the next
                    iteration.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* --- ALL INJECTED MODALS --- */}
      <CancelBookingDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        bookingId={booking.id}
        amountPaid={booking.amount_paid}
      />

      <ExtendBookingDialog
        isOpen={isExtendOpen}
        onClose={() => setIsExtendOpen(false)}
        onConfirm={(newEnd: any) => {
          console.log("New end date:", newEnd);
          setIsExtendOpen(false);
        }}
        event={mockSchedulerEvent as any}
      />

      <DispatchDialog
        open={isDispatchOpen}
        onOpenChange={setIsDispatchOpen}
        booking={mockSchedulerEvent as any}
      />

      <BookingIncomeBreakdownModal
        isOpen={financeModal.isOpen}
        onClose={() => setFinanceModal({ isOpen: false, action: "none" })}
        bookingId={bookingId}
        defaultAction={financeModal.action}
      />

      <ContractPreviewModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        contract={{
          id: bookingId,
          customerName: booking.customer.name,
          vehicle: `${booking.car.brand} ${booking.car.model}`,
          rentalDates: `${format(booking.start_date, "MMM dd")} - ${format(booking.end_date, "MMM dd")}`,
          status: contract?.is_signed ? "SIGNED" : "UNSIGNED",
          htmlContent: contract?.contract_html,
          signatureUrl: contract?.customer_signature_url,
          signedAt: contract?.signed_at
            ? format(new Date(contract.signed_at), "MMM dd, yyyy HH:mm")
            : undefined,
        }}
        onSign={handleContractSigned}
      />

      <InspectionExecutionModal
        isOpen={isInspectionExecOpen}
        onClose={handleInspectionComplete}
        inspection={
          preTripInspection || {
            inspection_id: `NEW_PRETRIP_${bookingId}`,
            booking_id: bookingId,
            type: "Pre-trip",
            checklist_data: draftChecklist,
          }
        }
      />
    </div>
  );
}
