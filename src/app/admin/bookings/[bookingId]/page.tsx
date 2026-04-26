"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { format } from "date-fns";
import {
  ArrowLeft,
  Car,
  User,
  MapPin,
  Clock,
  Banknote,
  FileText,
  Plus,
  AlertCircle,
  CheckCircle2,
  Printer,
  CalendarRange,
  XCircle,
  UserCircle,
  Loader2,
  Image as ImageIcon,
  CheckSquare,
  Mail,
  Calendar as CalendarIcon,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import Image from "next/image";

// --- EXISTING COMPONENT IMPORTS ---
import CancelBookingDialog from "@/components/bookings/cancel-booking-dialog";
import BookingIncomeBreakdownModal from "@/components/income/booking-income-breakdown";
import ExtendBookingDialog from "@/components/bookings/extend-booking-dialog";
import DispatchDialog from "@/components/bookings/dispatch-dialog";
import ContractPreviewModal from "@/components/documents/contract-preview-modal";
import InspectionExecutionModal from "@/components/documents/inspection-execution-modal";
import MessageModal from "@/components/clients/message-modal";

import {
  useBookingDetails,
  useBookings,
} from "../../../../../hooks/use-bookings";
import { useDocumentMutations } from "../../../../../hooks/use-documents";
import { useBookingWorkflows } from "../../../../../hooks/use-booking-workflow";
import { generateInvoicePDF } from "@/utils/export-pdf";
import { useBookingFolio } from "../../../../../hooks/use-incomes";
import { useScheduler } from "../../../../../hooks/use-scheduler";

export default function AdminBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.bookingId as string;
  const date = new Date();

  // --- CORE DATA HOOKS ---
  const { data: booking, isLoading, isError } = useBookingDetails(bookingId);
  // NOTE: Destructuring `updateBookingStatus` here. Make sure your hook exports this mutation!
  const { updateNote, isUpdatingNote, updateStatus } = useBookings();
  const {
    contract,
    inspections,
    inspectionTemplate,
    generateContract,
    isGeneratingContract,
    startTrip,
    isStartingTrip,
    updateContractFields,
    isUpdatingContract,
  } = useBookingWorkflows(bookingId);
  const { signContract } = useDocumentMutations();
  const { data: folio } = useBookingFolio(bookingId);
  const { updateDates } = useScheduler(date);

  // --- MODAL STATES ---
  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isExtendOpen, setIsExtendOpen] = useState(false);
  const [isDispatchOpen, setIsDispatchOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [financeModal, setFinanceModal] = useState<{
    isOpen: boolean;
    action: "none" | "payment" | "charge" | "refund";
  }>({ isOpen: false, action: "none" });

  // DOC MODAL STATES
  const [isContractOpen, setIsContractOpen] = useState(false);
  const [isInspectionExecOpen, setIsInspectionExecOpen] = useState(false);
  const [isPostTripExecOpen, setIsPostTripExecOpen] = useState(false);

  // NOTE STATE
  const [adminNote, setAdminNote] = useState("");

  // Sync note when booking loads
  useEffect(() => {
    if (booking?.notes) setAdminNote(booking.notes);
  }, [booking?.notes]);

  // --- QUICK STATUS UPDATE HANDLER ---
  const handleStatusChange = async (newStatus: string) => {
    if (!updateStatus) {
      toast.error("Status update mutation not wired up in hook.");
      return;
    }
    try {
      await updateStatus({
        id: booking?.id,
        status: newStatus.toUpperCase(),
      });
      toast.success(`Booking status updated to ${newStatus}`);
    } catch (error: any) {
      toast.error(error.message || "Failed to update status");
    }
  };

  // --- DISPATCH GAP DETECTION ---
  // Find the latest shift end date among all assignments
  const latestShiftEnd = booking?.assignments?.reduce(
    (latest: Date, assignment: any) => {
      const shiftEnd = new Date(assignment.shift_end);
      return shiftEnd > latest ? shiftEnd : latest;
    },
    new Date(0),
  );

  // If the booking is supposed to have a driver, but the latest shift ends BEFORE the booking ends, we have a gap!
  const hasDispatchGap =
    booking?.is_with_driver &&
    latestShiftEnd &&
    latestShiftEnd < new Date(booking.end_date);

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
    assignments: booking?.assignments,
  };

  // --- INSPECTION LOGIC & PARSING ---
  const preTripInspection = inspections?.find(
    (i: any) => i.type === "Pre-trip",
  );
  const postTripInspection = inspections?.find(
    (i: any) => i.type === "Post-trip",
  );

  const templateCategories = Array.isArray(inspectionTemplate)
    ? inspectionTemplate
    : inspectionTemplate?.categories || [];

  const templateBlueprintUrl = !Array.isArray(inspectionTemplate)
    ? inspectionTemplate?.blueprint_url
    : undefined;

  const draftChecklist = templateCategories.map((cat: any) => ({
    categoryId: cat.id,
    categoryName: cat.name,
    items: cat.items.map((item: any) => ({
      itemId: item.id,
      label: item.label,
      status: "PENDING",
      notes: "",
      photoUrl: null,
    })),
  }));

  const handleContractSigned = async (id: string, signatureDataUrl: string) => {
    try {
      await signContract({ id, signatureDataUrl });
      setIsContractOpen(false);
    } catch (error) {
      console.error(error);
    }
  };

  const handleStartHandoverClick = async () => {
    if (!contract) await generateContract(bookingId);
    setIsInspectionExecOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col transition-colors duration-300">
      {/* --- TOP HEADER (Responsive) --- */}
      <header className="px-4 py-3 sm:px-6 shrink-0 flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-1.5 bg-secondary border border-border rounded text-muted-foreground hover:text-primary transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex flex-col">
            <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-0.5">
              <span>Bookings</span> <span className="opacity-50">/</span>{" "}
              <span className="text-primary">Details</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase">
                {booking.id.split("-")[0]}
              </h1>

              {/* INTERACTIVE STATUS DROPDOWN */}
              <Select
                value={booking.status.toUpperCase()}
                onValueChange={handleStatusChange}
                disabled={booking.status.toLowerCase() === "cancelled"}
              >
                <SelectTrigger
                  className={cn(
                    "h-7 text-[10px] font-bold uppercase tracking-widest px-3 border border-border shadow-none transition-colors",
                    booking.status.toLowerCase() === "ongoing"
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : booking.status.toLowerCase() === "confirmed"
                        ? "bg-amber-500/10 text-amber-600 border-amber-500/20"
                        : booking.status.toLowerCase() === "completed"
                          ? "bg-secondary text-muted-foreground"
                          : booking.status.toLowerCase() === "cancelled"
                            ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 disabled:opacity-80"
                            : "bg-primary/10 text-primary border-primary/20",
                  )}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING" className="text-xs font-bold">
                    PENDING
                  </SelectItem>
                  <SelectItem
                    value="CONFIRMED"
                    className="text-xs font-bold text-amber-600"
                  >
                    CONFIRMED
                  </SelectItem>
                  <SelectItem
                    value="ONGOING"
                    className="text-xs font-bold text-emerald-600"
                  >
                    ONGOING
                  </SelectItem>
                  <SelectItem
                    value="COMPLETED"
                    className="text-xs font-bold text-muted-foreground"
                  >
                    COMPLETED
                  </SelectItem>
                  <SelectItem
                    value="CANCELLED"
                    className="text-xs font-bold text-red-600 dark:text-red-400"
                  >
                    CANCELLED
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExtendOpen(true)}
            className="h-8 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground flex-1 md:flex-none"
          >
            <CalendarRange className="w-3.5 h-3.5 mr-2" /> Modify Dates
          </Button>
          <Button
            onClick={() => generateInvoicePDF(folio)}
            variant="outline"
            size="sm"
            className="h-8 text-[10px] font-bold uppercase tracking-widest flex-1 md:flex-none"
          >
            <Printer className="w-3.5 h-3.5 mr-2" /> Print
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setIsCancelOpen(true)}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 flex-1 md:flex-none"
          >
            <XCircle className="w-3.5 h-3.5 mr-2" /> Cancel
          </Button>
        </div>
      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <main className="flex-1 overflow-y-auto p-4 sm:px-6 custom-scrollbar">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-4">
          {/* TOP SECTION: COLUMNS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* === LEFT COLUMN: THE ENTITIES === */}
            <div className="lg:col-span-4 xl:col-span-3 flex flex-col gap-4">
              {/* Customer Card (Updated with Phone/Email) */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm shrink-0">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Customer
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-secondary border border-border flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">
                      {booking.customer.name}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground truncate">
                      {booking.customer.email}
                    </p>
                    <p className="text-[10px] font-medium text-muted-foreground truncate">
                      {booking.customer.phone || "No phone provided"}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    className="w-full h-8 text-[10px] font-bold uppercase tracking-widest bg-secondary hover:bg-secondary/80"
                    onClick={() => setIsMessageModalOpen(true)}
                  >
                    <Mail className="w-3 h-3 mr-1.5" /> Send Email
                  </Button>
                </div>
              </div>

              {/* Vehicle Card (Updated with Dates) */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Assigned Asset
                  </h3>
                </div>

                <div className="flex gap-3 items-center">
                  <Image
                    src={booking.car.image}
                    alt="Car"
                    width={64}
                    height={48}
                    className="w-16 h-12 object-cover rounded border border-border shrink-0"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold uppercase truncate">
                      {booking.car.brand} {booking.car.model}
                    </p>
                    <p className="text-[10px] font-mono text-primary bg-primary/10 px-1.5 py-0.5 rounded border border-primary/20 mt-1 inline-block">
                      {booking.car.plate}
                    </p>
                  </div>
                </div>
                {/* Booking Dates Banner */}
                <div className=" bg-secondary/40 border border-border rounded-md p-2 mt-3 flex items-center justify-center gap-2 text-center">
                  <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                  <span className="text-[9px] font-bold text-foreground uppercase tracking-widest leading-tight">
                    {format(new Date(booking.start_date), "MMM dd")} -{" "}
                    {format(new Date(booking.end_date), "MMM dd, yyyy")}
                  </span>
                </div>
              </div>

              {/* Driver Card */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm shrink-0">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3">
                  Chauffeur / Driver
                </h3>

                {booking.assignments && booking.assignments.length > 0 ? (
                  <div className="flex flex-col gap-3">
                    {/* NEW: Dynamic Shift List */}
                    <div className="space-y-2 max-h-[160px] overflow-y-auto custom-scrollbar pr-1">
                      {booking.assignments.map(
                        (assignment: any, index: number) => (
                          <div
                            key={assignment.id || index}
                            className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg border border-border"
                          >
                            <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                              <UserCircle className="w-4 h-4 text-primary" />
                            </div>
                            <div className="flex-1 overflow-hidden">
                              <p className="text-[11px] font-bold truncate text-foreground">
                                {assignment.driver_name}
                              </p>
                              <p className="text-[9px] text-muted-foreground font-mono mt-0.5">
                                {format(
                                  new Date(assignment.shift_start),
                                  "MMM dd, ha",
                                )}{" "}
                                -{" "}
                                {format(
                                  new Date(assignment.shift_end),
                                  "MMM dd, ha",
                                )}
                              </p>
                            </div>
                          </div>
                        ),
                      )}
                    </div>

                    {/* GAP DETECTED WARNING */}
                    {hasDispatchGap && (
                      <div className="p-2 border border-dashed border-amber-500/40 rounded-lg bg-amber-500/10 mt-1 animate-in fade-in">
                        <p className="text-[9px] font-bold text-amber-600 dark:text-amber-500 mb-1.5 flex items-center gap-1.5">
                          <AlertTriangle className="w-3.5 h-3.5" /> Shift Gap
                          Detected!
                        </p>
                        <p className="text-[9px] text-amber-600/80 font-medium leading-tight mb-2">
                          The booking was extended, but the driver&apos;s
                          schedule ends early. You need to assign relief
                          coverage.
                        </p>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      onClick={() => setIsDispatchOpen(true)}
                      className={cn(
                        "h-7 p-0 text-[10px] w-full shadow-none",
                        hasDispatchGap
                          ? "bg-amber-500 hover:bg-amber-600 text-white border-transparent"
                          : "bg-card hover:bg-secondary text-foreground",
                      )}
                    >
                      {hasDispatchGap
                        ? "Fix Dispatch Gap"
                        : "Manage Dispatch Shifts"}
                    </Button>
                  </div>
                ) : booking.is_with_driver ? (
                  /* STATE 2: Customer requested a driver, but none is assigned at all */
                  <div className="text-center p-3 border border-dashed border-destructive/30 rounded-lg bg-destructive/5">
                    <p className="text-[10px] font-bold text-destructive mb-2 flex items-center justify-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Dispatch Needed!
                    </p>
                    <Button
                      onClick={() => setIsDispatchOpen(true)}
                      size="sm"
                      className="h-7 text-[9px] font-bold uppercase tracking-widest w-full bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-none"
                    >
                      Assign Driver Now
                    </Button>
                  </div>
                ) : (
                  /* STATE 3: Self-Drive booking (Default) */
                  <div className="text-center p-3 border border-dashed border-border rounded-lg bg-secondary/30">
                    <p className="text-[10px] font-medium text-muted-foreground mb-2">
                      Currently a self-drive booking.
                    </p>
                    <Button
                      onClick={() => setIsDispatchOpen(true)}
                      size="sm"
                      variant="outline"
                      className="h-7 text-[9px] font-bold uppercase tracking-widest w-full bg-card hover:bg-secondary"
                    >
                      Upgrade to Chauffeur
                    </Button>
                  </div>
                )}
              </div>

              {/* Internal Notes */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col flex-1 max-h-[250px] shrink-0">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-3 shrink-0">
                  Internal Notes
                </h3>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  className="w-full flex-1 bg-secondary/30 border border-border rounded-md p-3 text-xs text-foreground resize-none focus:ring-1 focus:ring-primary outline-none custom-scrollbar"
                  placeholder="Add private admin notes here..."
                />
                <Button
                  onClick={() =>
                    updateNote({ bookingId: booking.id, note: adminNote })
                  }
                  disabled={isUpdatingNote || adminNote === booking.notes}
                  size="sm"
                  className="w-full mt-3 h-8 shrink-0 text-[9px] font-bold uppercase tracking-widest"
                >
                  {isUpdatingNote ? "Saving..." : "Save Note"}
                </Button>
              </div>
            </div>

            {/* === RIGHT COLUMN: WORKFLOWS & FINANCE === */}
            <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-4">
              {/* BIG ACTION BANNER */}
              {booking.status === "confirmed" && (
                <div className="bg-primary/10 border border-primary/30 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm shrink-0">
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
                    className="shrink-0 w-full sm:w-auto bg-primary text-primary-foreground font-black uppercase tracking-widest text-[11px] h-12 px-8 shadow-sm transition-all hover:scale-[1.02]"
                  >
                    {isStartingTrip ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Start Handover Sequence"
                    )}
                  </Button>
                </div>
              )}

              {/* STRETCHED GRID: FINANCE & LOGISTICS */}
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 items-stretch">
                {/* Financial Ledger */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
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

                    <div className="space-y-3 text-xs font-medium mb-4">
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
                          <CheckCircle2 className="w-3 h-3" /> Total Amount Paid
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

                  <div className="pt-4 border-t border-border flex gap-2">
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
                </div>

                {/* Logistics & Paperwork */}
                <div className="bg-card border border-border rounded-xl p-5 shadow-sm h-full flex flex-col justify-between">
                  <div>
                    <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 pb-3 border-b border-border flex items-center justify-between">
                      <span>Logistics & Documents</span>
                    </h3>

                    <div className="space-y-4 mb-4">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                            Route
                          </p>
                          <p className="text-xs font-semibold">
                            {booking.pickup_location} →{" "}
                            {booking.dropoff_location}
                          </p>
                        </div>
                      </div>

                      {!contract ? (
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
                            )}{" "}
                            Generate
                          </Button>
                        </div>
                      ) : (
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
                            {contract.is_signed
                              ? "Signed"
                              : "Awaiting Signature"}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div
                      onClick={() => setIsInspectionExecOpen(true)}
                      className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/30 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <Car className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Pre-Trip Check
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[8px] uppercase",
                          preTripInspection
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        )}
                      >
                        {preTripInspection ? "Completed" : "Pending"}
                      </Badge>
                    </div>

                    <div
                      onClick={() => setIsPostTripExecOpen(true)}
                      className="flex items-center justify-between p-3 border border-border rounded-lg bg-secondary/30 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                    >
                      <div className="flex items-center gap-2">
                        <CheckSquare className="w-4 h-4 text-muted-foreground" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          Post-Trip Check
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[8px] uppercase",
                          postTripInspection
                            ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                            : "bg-amber-500/10 text-amber-500 border-amber-500/20",
                        )}
                      >
                        {postTripInspection ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- AUDIT TIMELINE --- */}
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm flex flex-col flex-1 max-h-[320px]">
                <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 shrink-0 flex items-center justify-between pb-3 border-b border-border">
                  <span>Audit & Activity Log</span>
                  <Badge variant="secondary" className="text-[9px] font-mono">
                    {booking.logs?.length || 0} Events
                  </Badge>
                </h3>

                <ScrollArea className="flex-1 custom-scrollbar pr-4 overflow-hidden">
                  <div className="relative border-l border-border ml-2 space-y-6 pb-4 mt-1">
                    {booking.logs?.map((log: any) => (
                      <div key={log.log_id} className="relative pl-5">
                        <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-card border-2 border-primary" />
                        <div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex-wrap">
                          <Clock className="w-2.5 h-2.5" />
                          <span>
                            {format(
                              new Date(log.created_at + "Z"),
                              "MMM dd • hh:mm a",
                            )}
                          </span>
                          <span className="text-primary ml-1">
                            {log.action_type.replace(/_/g, " ")}
                          </span>
                        </div>
                        <p className="text-[11px] font-medium leading-relaxed text-foreground mt-1.5 bg-secondary/30 p-2 rounded-md border border-border/50">
                          {log.message}
                        </p>
                      </div>
                    ))}

                    {(!booking.logs || booking.logs.length === 0) && (
                      <p className="text-[10px] text-muted-foreground pl-4 font-medium">
                        No activity recorded yet.
                      </p>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* === BOTTOM FULL-WIDTH SECTION: PAYMENT RECEIPTS === */}
          {folio?.payments && folio.payments.length > 0 && (
            <div className="col-span-full bg-card border border-border rounded-xl p-5 shadow-sm w-full mb-8">
              <h3 className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2 pb-3 border-b border-border">
                <ImageIcon className="w-3.5 h-3.5" /> Payment Receipts &
                Documents
              </h3>

              <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x">
                {folio.payments.map((payment: any, index: number) => (
                  <div
                    key={payment.id || index}
                    className="relative group rounded-xl overflow-hidden border border-border bg-secondary/50 flex-shrink-0 w-[240px] h-[160px] flex flex-col items-center justify-center snap-start shadow-sm"
                  >
                    {payment.receipt_url ? (
                      <>
                        <Image
                          src={payment.receipt_url}
                          alt="Receipt"
                          className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-all cursor-pointer group-hover:scale-105 duration-300"
                          onClick={() =>
                            window.open(payment.receipt_url, "_blank")
                          }
                          width={240}
                          height={160}
                        />
                        <div className="absolute bottom-0 inset-x-0 bg-background/90 backdrop-blur-md p-2.5 flex justify-between items-center border-t border-border">
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                            {payment.method}
                          </p>
                          <p className="text-xs font-black text-primary">
                            ₱{payment.amount.toLocaleString()}
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center p-4">
                        <FileText className="w-8 h-8 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          No Receipt Attached
                        </p>
                        <Badge
                          variant="secondary"
                          className="text-[10px] font-mono font-bold bg-background shadow-none"
                        >
                          ₱{payment.amount.toLocaleString()}
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
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
        onConfirm={async (endDate) => {
          await updateDates({ id: booking.id, newEndDate: endDate });
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

      <MessageModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        userId={booking.customer.id}
        recipientName={booking.customer.name}
        recipientEmail={booking.customer.email}
      />

      <ContractPreviewModal
        isOpen={isContractOpen}
        onClose={() => setIsContractOpen(false)}
        contract={{
          id: bookingId,
          customerName: booking.customer.name,
          vehicle: `${booking.car.brand} ${booking.car.model}`,
          rentalDates: `${format(new Date(booking.start_date), "MMM dd")} - ${format(new Date(booking.end_date), "MMM dd")}`,
          status: contract?.is_signed ? "SIGNED" : "UNSIGNED",
          htmlContent: contract?.contract_html,
          signatureUrl: contract?.customer_signature_url,
          signedAt: contract?.signed_at
            ? format(new Date(contract.signed_at), "MMM dd, yyyy HH:mm")
            : undefined,
        }}
        onSign={handleContractSigned}
        isUpdatingContract={isUpdatingContract}
        onUpdateFields={async (id, dest, fuel) => {
          await updateContractFields({
            bookingId: id,
            destination: dest,
            fuelLevel: fuel,
          });
        }}
      />

      {/* Pre-Trip Modal */}
      <InspectionExecutionModal
        isOpen={isInspectionExecOpen}
        onClose={() => setIsInspectionExecOpen(false)}
        inspection={
          preTripInspection || {
            inspection_id: `NEW_PRETRIP_${bookingId}`,
            booking_id: bookingId,
            type: "Pre-trip",
            checklist_data: draftChecklist,
          }
        }
        blueprintUrl={
          preTripInspection?.images?.blueprint_bg || templateBlueprintUrl
        }
        bookingDetails={booking}
      />

      {/* Post-Trip Modal */}
      <InspectionExecutionModal
        isOpen={isPostTripExecOpen}
        onClose={() => setIsPostTripExecOpen(false)}
        inspection={
          postTripInspection || {
            inspection_id: `NEW_POSTTRIP_${bookingId}`,
            booking_id: bookingId,
            type: "Post-trip",
            checklist_data: draftChecklist,
          }
        }
        blueprintUrl={
          postTripInspection?.images?.blueprint_bg || templateBlueprintUrl
        }
        bookingDetails={booking}
      />
    </div>
  );
}
