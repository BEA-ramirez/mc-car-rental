"use client";

import React, { useState, useCallback, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  User,
  Receipt,
  Car,
  CreditCard,
  Plus,
  Loader2,
  Undo2,
  CalendarDays,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Ban,
  MapPin,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, differenceInHours } from "date-fns";

import { useIncomes, useBookingFolio } from "../../../hooks/use-incomes";

// --- CONSTANTS ---
// Exact coordinates for MC CAR RENTAL - ORMOC (Main Company)
const MAIN_COMPANY_COORDS = "11.0286546,124.6040217";
const MAIN_COMPANY_PLACE_ID = "ChIJiXQCjCzxBzMRYXf8Lsr03L4";

type BookingIncomeBreakdownModalProps = {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | null;
  defaultAction?: "none" | "payment" | "charge" | "refund";
};

export default function BookingIncomeBreakdownModal({
  isOpen,
  onClose,
  bookingId,
  defaultAction = "none",
}: BookingIncomeBreakdownModalProps) {
  const getInitialTab = useCallback(() => {
    if (
      defaultAction === "payment" ||
      defaultAction === "charge" ||
      defaultAction === "refund"
    ) {
      return defaultAction;
    }
    return "ledger";
  }, [defaultAction]);

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  const { data: folio, isLoading } = useBookingFolio(bookingId);

  // THE FIX: Safely parse the date, falling back to "now" if it's still loading
  const bookingDate = folio?.booking?.start_date
    ? format(new Date(folio.booking.start_date), "yyyy-MM")
    : format(new Date(), "yyyy-MM");

  const {
    recordPayment,
    isRecordingPayment,
    addCharge,
    isAddingCharge,
    refundBooking,
    isRefunding,
    removeCharge,
    voidPayment,
    isProcessing,
  } = useIncomes(bookingDate);

  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("GCash");
  const [payRef, setPayRef] = useState("");
  const [payTitle, setPayTitle] = useState("");

  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeCat, setChargeCat] = useState("");
  const [customChargeCat, setCustomChargeCat] = useState("");
  const [chargeDesc, setChargeDesc] = useState("");

  const [refundAmount, setRefundAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState("GCash");
  const [refundRef, setRefundRef] = useState("");
  const [refundCat, setRefundCat] = useState("");
  const [customRefundCat, setCustomRefundCat] = useState("GCash");
  const [refundDesc, setRefundDesc] = useState("");
  const [isDeductFromInvoice, setIsDeductFromInvoice] = useState(true);

  // --- DIALOG STATES ---
  const [removeChargeDialog, setRemoveChargeDialog] = useState<{
    isOpen: boolean;
    chargeId: string | null;
  }>({ isOpen: false, chargeId: null });

  const [voidPaymentDialog, setVoidPaymentDialog] = useState<{
    isOpen: boolean;
    paymentId: string | null;
    reason: string;
  }>({ isOpen: false, paymentId: null, reason: "" });

  const basePrice = Number(folio?.booking?.total_price || 0);

  const totalPaid =
    folio?.payments?.reduce(
      (sum: number, p: any) =>
        p.status === "COMPLETED" ? sum + Number(p.amount) : sum,
      0,
    ) || 0;
  const balanceDue = basePrice - totalPaid;

  // FORMAT DURATION (Block Math Logic)
  const getDurationString = () => {
    if (!folio?.booking?.start_date || !folio?.booking?.end_date) return "";
    const start = new Date(folio.booking.start_date);
    const end = new Date(folio.booking.end_date);
    const hours = differenceInHours(end, start);

    const days = Math.floor(hours / 24);
    const remHours = hours % 24;

    if (days > 0 && remHours > 0)
      return `${days} Day${days > 1 ? "s" : ""} & ${remHours} Hr${remHours > 1 ? "s" : ""}`;
    if (days > 0) return `${days} Day${days > 1 ? "s" : ""}`;
    return `${hours} Hr${hours > 1 ? "s" : ""}`;
  };
  const durationText = getDurationString();

  // LOGISTICS CHECKER
  const isCustomLogistics =
    folio?.booking?.pickup_type === "custom" ||
    folio?.booking?.dropoff_type === "custom";
  const hasDeliveryCharge = folio?.charges?.some(
    (c: any) => c.category === "DELIVERY_FEE",
  );
  const showLogisticsWarning = isCustomLogistics && !hasDeliveryCharge;

  const customTypes = [];
  if (folio?.booking?.pickup_type === "custom") customTypes.push("Pickup");
  if (folio?.booking?.dropoff_type === "custom") customTypes.push("Drop-off");
  const customTypesText = customTypes.join(" and ");

  useEffect(() => {
    if (isOpen) {
      const initial = getInitialTab();
      setActiveTab(initial);
      setPayAmount("");
      setPayRef("");
      setPayTitle("");
      setChargeAmount("");
      setChargeDesc("");
      setChargeCat("");
      setCustomChargeCat("");
      setRefundAmount("");
      setRefundRef("");
      setIsDeductFromInvoice(true);

      if (initial === "payment")
        setPayAmount(Math.max(0, balanceDue).toString());
    }
  }, [isOpen, defaultAction, balanceDue, getInitialTab]);

  const userData = folio?.booking?.users as any;
  const customerName = Array.isArray(userData)
    ? userData[0]?.full_name
    : userData?.full_name;
  const carData = folio?.booking?.cars as any;
  const carBrand = Array.isArray(carData) ? carData[0]?.brand : carData?.brand;
  const carPlate = Array.isArray(carData)
    ? carData[0]?.plate_number
    : carData?.plate_number;

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (val === "payment") setPayAmount(Math.max(0, balanceDue).toString());
  };

  const handleRecordPayment = async () => {
    if (!bookingId || !payAmount) return;
    await recordPayment({
      bookingId,
      amount: parseFloat(payAmount),
      method: payMethod,
      reference: payRef || "N/A",
      title: payTitle || "Payment",
    });
    setActiveTab("ledger");
  };

  const handleAddCharge = async () => {
    const finalCategory = chargeCat === "CUSTOM" ? customChargeCat : chargeCat;
    if (!bookingId || !chargeAmount || !finalCategory) return;

    await addCharge({
      bookingId,
      category: finalCategory.toUpperCase().replace(/\s+/g, "_"),
      amount: parseFloat(chargeAmount),
      description: chargeDesc || "Added manually",
    });
    setActiveTab("ledger");
    setChargeAmount("");
    setChargeDesc("");
  };

  const handleIssueRefund = async () => {
    const finalCategory = refundCat === "CUSTOM" ? customRefundCat : refundCat;
    if (!bookingId || !refundAmount || !finalCategory) return;

    await refundBooking({
      bookingId,
      amount: parseFloat(refundAmount),
      category: finalCategory.toUpperCase().replace(/\s+/g, "_"),
      description: refundDesc || "Refund",
      method: refundMethod,
      reference: refundRef || "N/A",
      deductFromInvoice: isDeductFromInvoice,
    });

    setActiveTab("ledger");
  };

  const handleConfirmRemoveCharge = async () => {
    if (!removeChargeDialog.chargeId) return;
    await removeCharge({ chargeId: removeChargeDialog.chargeId });
    setRemoveChargeDialog({ isOpen: false, chargeId: null });
  };

  const handleConfirmVoidPayment = async () => {
    if (!voidPaymentDialog.paymentId || !voidPaymentDialog.reason) return;
    await voidPayment({
      paymentId: voidPaymentDialog.paymentId,
      reason: voidPaymentDialog.reason,
    });
    setVoidPaymentDialog({ isOpen: false, paymentId: null, reason: "" });
  };

  const totalChargesAmount =
    folio?.charges?.reduce(
      (sum: number, c: any) => sum + Number(c.amount),
      0,
    ) || 0;

  // --- MAPS ROUTING LOGIC ---
  const openGoogleMapsRoute = (type: "pickup" | "dropoff") => {
    const isCustom =
      type === "pickup"
        ? folio?.booking?.pickup_type === "custom"
        : folio?.booking?.dropoff_type === "custom";

    const destination =
      type === "pickup"
        ? folio?.booking?.pickup_coordinates || folio?.booking?.pickup_location
        : folio?.booking?.dropoff_coordinates ||
          folio?.booking?.dropoff_location;

    if (!destination) return;

    if (isCustom) {
      // Draws route from Main Company to Customer
      const originName = encodeURIComponent("MC CAR RENTAL - ORMOC");
      window.open(
        `https://www.google.com/maps/dir/?api=1&origin=${originName}&origin_place_id=${MAIN_COMPANY_PLACE_ID}&destination=${encodeURIComponent(destination)}`,
        "_blank",
      );
    } else {
      // Drops pin at the location
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(destination)}`,
        "_blank",
      );
    }
  };

  const handleWarningCheckDistance = () => {
    if (folio?.booking?.pickup_type === "custom") openGoogleMapsRoute("pickup");
    else if (folio?.booking?.dropoff_type === "custom")
      openGoogleMapsRoute("dropoff");
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl xl:max-w-[1000px] gap-0! p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[95vh] max-h-[800px] transition-colors duration-300 [&>button.absolute]:hidden">
          {/* --- COMPACT HEADER --- */}
          <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shadow-sm">
                <Receipt className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col text-left">
                <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                  Financial Folio
                </DialogTitle>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest leading-none font-mono">
                    REF: {bookingId?.split("-")[0]}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {!isLoading && (
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] font-bold uppercase tracking-widest rounded h-6 px-2 border shadow-sm",
                    balanceDue <= 0
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                  )}
                >
                  {balanceDue <= 0 ? "Fully Paid" : "Balance Due"}
                </Badge>
              )}
              <div className="w-px h-5 bg-border mx-1" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
                onClick={onClose}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* --- SPLIT BODY --- */}
          <div className="flex flex-1 overflow-hidden min-h-0">
            {/* LEFT COLUMN: CONTEXT & SUMMARY */}
            <div className="w-[320px] bg-background border-r border-border flex flex-col shrink-0 z-10 transition-colors">
              <div className="flex-1 min-h-0 overflow-hidden">
                <ScrollArea className="h-full w-full custom-scrollbar">
                  <div className="p-4 space-y-4">
                    {isLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                      </div>
                    ) : (
                      <>
                        {/* Entity Details */}
                        <div className="bg-card border border-border p-3 rounded-xl shadow-sm space-y-3 transition-colors">
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                              <User className="w-3 h-3" /> Customer Profile
                            </span>
                            <span className="text-[11px] font-bold text-foreground">
                              {customerName}
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                              <Car className="w-3 h-3" /> Assigned Asset
                            </span>
                            <span className="text-[11px] font-bold text-foreground truncate">
                              {carBrand}{" "}
                              <span className="text-muted-foreground font-mono">
                                ({carPlate})
                              </span>
                            </span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                              <CalendarDays className="w-3 h-3" /> Contract
                              Duration
                            </span>
                            <span className="text-[11px] font-bold text-foreground mb-1">
                              {durationText}
                            </span>
                            <span className="text-[10px] font-medium text-muted-foreground">
                              {folio?.booking?.start_date &&
                                format(
                                  new Date(folio.booking.start_date),
                                  "MMM dd, yyyy • hh:mm a",
                                )}
                              <br />
                              {folio?.booking?.end_date &&
                                format(
                                  new Date(folio.booking.end_date),
                                  "MMM dd, yyyy • hh:mm a",
                                )}
                            </span>
                          </div>
                        </div>

                        {/* Logistics Details Card */}
                        <div className="bg-card border border-border p-3 rounded-xl shadow-sm transition-colors">
                          <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-1.5 flex items-center gap-1.5">
                            <MapPin className="w-3 h-3" /> Logistics Routing
                          </h4>

                          {/* Pickup Block */}
                          <div className="flex flex-col mb-4">
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openGoogleMapsRoute("pickup")}
                                  className="bg-primary/10 hover:bg-primary/20 text-primary p-1 rounded transition-colors"
                                  title="View Map"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Pickup
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[8px] px-1 py-0 uppercase border bg-transparent",
                                  folio?.booking?.pickup_type === "custom"
                                    ? "text-amber-600 border-amber-600/30"
                                    : "text-emerald-600 border-emerald-600/30",
                                )}
                              >
                                {folio?.booking?.pickup_type || "HUB"}
                              </Badge>
                            </div>
                            <span className="text-[10px] font-semibold text-foreground leading-tight">
                              {folio?.booking?.pickup_location}
                            </span>
                          </div>

                          {/* Dropoff Block */}
                          <div className="flex flex-col">
                            <div className="flex justify-between items-center mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => openGoogleMapsRoute("dropoff")}
                                  className="bg-primary/10 hover:bg-primary/20 text-primary p-1 rounded transition-colors"
                                  title="View Map"
                                >
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                  Drop-off
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[8px] px-1 py-0 uppercase border bg-transparent",
                                  folio?.booking?.dropoff_type === "custom"
                                    ? "text-amber-600 border-amber-600/30"
                                    : "text-emerald-600 border-emerald-600/30",
                                )}
                              >
                                {folio?.booking?.dropoff_type || "HUB"}
                              </Badge>
                            </div>
                            <span className="text-[10px] font-semibold text-foreground leading-tight">
                              {folio?.booking?.dropoff_location}
                            </span>
                          </div>
                        </div>

                        {/* Financial Snapshot */}
                        <div className="bg-card border border-border rounded-xl shadow-sm p-4 transition-colors">
                          <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 border-b border-border pb-1.5">
                            Financial Snapshot
                          </h4>
                          <div className="space-y-2 mb-4">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Total Billed
                              </span>
                              <span className="text-[11px] font-bold text-foreground font-mono">
                                ₱ {basePrice.toLocaleString()}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                                Total Paid
                              </span>
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                - ₱ {totalPaid.toLocaleString()}
                              </span>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "p-3 rounded-lg shadow-sm flex flex-col justify-center items-center text-center border transition-colors",
                              balanceDue > 0
                                ? "bg-amber-500/10 border-amber-500/20"
                                : "bg-primary border-primary text-primary-foreground",
                            )}
                          >
                            <span
                              className={cn(
                                "text-[9px] font-bold uppercase tracking-widest mb-1",
                                balanceDue > 0
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-primary-foreground/80",
                              )}
                            >
                              {balanceDue > 0 ? "Balance Due" : "Net Settled"}
                            </span>
                            <span
                              className={cn(
                                "text-xl font-black tracking-tight font-mono",
                                balanceDue > 0
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-primary-foreground",
                              )}
                            >
                              ₱ {Math.max(0, balanceDue).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>
            </div>

            {/* RIGHT COLUMN: TABS (Ledger & Forms) */}
            <div className="flex-1 flex flex-col bg-background overflow-hidden min-h-0 transition-colors">
              <Tabs
                value={activeTab}
                onValueChange={handleTabChange}
                className="flex flex-col h-full overflow-hidden"
              >
                {/* Tab Navigation */}
                <div className="px-4 pt-3 border-b border-border bg-secondary/30 shrink-0 transition-colors">
                  <TabsList className="bg-transparent p-0 flex gap-4 border-b-0 justify-start w-full h-9">
                    <TabsTrigger
                      value="ledger"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-foreground data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground transition-all uppercase tracking-widest"
                    >
                      Ledger
                    </TabsTrigger>
                    <TabsTrigger
                      value="payment"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-[10px] font-bold text-muted-foreground data-[state=active]:text-emerald-600 dark:data-[state=active]:text-emerald-400 transition-all uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" /> Receive
                    </TabsTrigger>
                    <TabsTrigger
                      value="charge"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-[10px] font-bold text-muted-foreground data-[state=active]:text-amber-600 dark:data-[state=active]:text-amber-400 transition-all uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <Plus className="w-3.5 h-3.5" /> Charge
                    </TabsTrigger>
                    <TabsTrigger
                      value="refund"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-indigo-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-[10px] font-bold text-muted-foreground data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all uppercase tracking-widest flex items-center gap-1.5"
                    >
                      <Undo2 className="w-3.5 h-3.5" /> Refund
                    </TabsTrigger>
                  </TabsList>
                </div>

                {/* Tab Contents */}
                <div className="flex-1 min-h-0 overflow-hidden bg-background">
                  <ScrollArea className="h-full w-full custom-scrollbar">
                    {/* 1. LEDGER TAB */}
                    <TabsContent
                      value="ledger"
                      className="m-0 p-4 space-y-6 border-none outline-none"
                    >
                      {isLoading ? (
                        <div className="flex justify-center py-10">
                          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                        </div>
                      ) : (
                        <>
                          {/* SMART LOGISTICS WARNING BANNER */}
                          {showLogisticsWarning && (
                            <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 flex items-start gap-3">
                              <MapPin className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                              <div className="w-full">
                                <h4 className="text-[11px] font-bold text-amber-600 uppercase tracking-widest mb-1">
                                  Action Required: Custom Logistics Fee
                                </h4>
                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed mb-3">
                                  This booking requested a custom{" "}
                                  <strong>{customTypesText}</strong> location.
                                  Please calculate the distance and add a
                                  Delivery Fee.
                                </p>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    onClick={handleWarningCheckDistance}
                                    size="sm"
                                    className="h-8 text-[9px] font-bold uppercase tracking-widest border-amber-500/30 text-amber-600 hover:bg-amber-500/10 shadow-none flex-1"
                                  >
                                    <ExternalLink className="w-3 h-3 mr-1.5" />{" "}
                                    Check Distance
                                  </Button>
                                  <Button
                                    onClick={() => handleTabChange("charge")}
                                    size="sm"
                                    className="h-8 text-[9px] font-bold uppercase tracking-widest bg-amber-600 text-white hover:bg-amber-700 shadow-none flex-1"
                                  >
                                    <Plus className="w-3 h-3 mr-1.5" /> Add
                                    Delivery Fee
                                  </Button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* ITEM CHARGES SECTION */}
                          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                            <div className="bg-secondary/50 border-b border-border px-3 py-2.5">
                              <h4 className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                Itemized Charges (Invoice)
                              </h4>
                            </div>
                            <div>
                              <div className="grid grid-cols-[1.5fr_2fr_1fr_32px] p-2 px-3 border-b border-border bg-secondary text-[9px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                                <div>Category</div>
                                <div>Description</div>
                                <div className="text-right text-foreground">
                                  Subtotal
                                </div>
                                <div></div>
                              </div>

                              <div className="divide-y divide-border">
                                {folio?.charges?.map((charge: any) => (
                                  <div
                                    key={charge.charge_id}
                                    className="grid grid-cols-[1.5fr_2fr_1fr_32px] p-2.5 px-3 items-center hover:bg-secondary/50 transition-colors"
                                  >
                                    <span
                                      className={cn(
                                        "text-[10px] font-bold flex items-center flex-wrap gap-1.5",
                                        charge.category.includes("FEE")
                                          ? "text-destructive"
                                          : charge.category === "DEPOSIT_REFUND"
                                            ? "text-indigo-600 dark:text-indigo-400"
                                            : "text-foreground",
                                      )}
                                    >
                                      {charge.category.replace(/_/g, " ")}
                                    </span>

                                    <span className="text-[10px] font-medium text-muted-foreground truncate pr-4">
                                      {charge.description}
                                    </span>

                                    <div className="text-[11px] font-bold font-mono text-right text-foreground border-l border-border pl-3 ml-3 flex items-center justify-end h-full">
                                      {charge.amount < 0 ? "- ₱ " : "₱ "}
                                      {Math.abs(
                                        Number(charge.amount),
                                      ).toLocaleString()}
                                    </div>

                                    {/* Delete Charge Action (Protected) */}
                                    <div className="flex justify-end pl-2">
                                      {![
                                        "BASE_RATE",
                                        "BASE_RATE_24H",
                                        "BASE_RATE_12H",
                                      ].includes(charge.category) && (
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          onClick={() =>
                                            setRemoveChargeDialog({
                                              isOpen: true,
                                              chargeId: charge.charge_id,
                                            })
                                          }
                                          className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-md"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {(folio?.charges?.length ?? 0) > 0 && (
                                  <div className="grid grid-cols-[1.5fr_2fr_1fr_32px] p-3 items-center bg-secondary/20 transition-colors border-t-2 border-border">
                                    <div className="col-span-2 text-right pr-4 text-[10px] font-bold text-foreground uppercase tracking-widest">
                                      Total Charges
                                    </div>
                                    <div className="text-[12px] font-black font-mono text-right text-foreground border-l border-border pl-3 ml-3 flex items-center justify-end">
                                      ₱ {totalChargesAmount.toLocaleString()}
                                    </div>
                                    <div></div>
                                  </div>
                                )}

                                {folio?.charges?.length === 0 && (
                                  <div className="p-4 text-[10px] text-muted-foreground text-center font-medium">
                                    No charges recorded.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* PAYMENT HISTORY SECTION */}
                          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                            <div className="bg-secondary/50 border-b border-border px-3 py-2.5">
                              <h4 className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                                Payment History
                              </h4>
                            </div>
                            <div>
                              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_32px] p-2 px-3 border-b border-border bg-secondary text-[9px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                                <div>Date & Time</div>
                                <div>Title & Method</div>
                                <div>Reference</div>
                                <div className="text-right">Amount</div>
                                <div></div>
                              </div>
                              <div className="divide-y divide-border">
                                {folio?.payments?.map((payment: any) => {
                                  const isVoided = payment.status === "VOIDED";

                                  return (
                                    <div
                                      key={payment.payment_id}
                                      className={cn(
                                        "grid grid-cols-[1.5fr_1fr_1fr_1fr_32px] p-2.5 px-3 items-center hover:bg-secondary/50 transition-colors",
                                        isVoided && "opacity-60",
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "text-[9px] font-medium text-muted-foreground",
                                          isVoided && "line-through",
                                        )}
                                      >
                                        {format(
                                          new Date(
                                            payment.paid_at ||
                                              payment.created_at,
                                          ),
                                          "MMM dd, yyyy • hh:mm a",
                                        )}
                                      </span>
                                      <div className="flex flex-col">
                                        <span
                                          className={cn(
                                            "text-[10px] font-bold text-foreground truncate",
                                            isVoided && "line-through",
                                          )}
                                        >
                                          {payment.title || "Payment"}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground">
                                          {payment.payment_method}
                                        </span>
                                      </div>
                                      <span
                                        className={cn(
                                          "text-[10px] font-mono text-muted-foreground truncate pr-2",
                                          isVoided && "line-through",
                                        )}
                                      >
                                        {payment.transaction_reference || "N/A"}
                                      </span>
                                      <span
                                        className={cn(
                                          "text-[11px] font-bold font-mono text-right",
                                          isVoided
                                            ? "text-muted-foreground line-through"
                                            : payment.amount < 0
                                              ? "text-indigo-600 dark:text-indigo-400"
                                              : "text-emerald-600 dark:text-emerald-400",
                                        )}
                                      >
                                        {payment.amount > 0 ? "+ ₱ " : "- ₱ "}
                                        {Math.abs(
                                          Number(payment.amount),
                                        ).toLocaleString()}
                                      </span>

                                      {/* Void Payment Action */}
                                      <div className="flex justify-end pl-2">
                                        {payment.status === "COMPLETED" && (
                                          <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() =>
                                              setVoidPaymentDialog({
                                                isOpen: true,
                                                paymentId: payment.payment_id,
                                                reason: "",
                                              })
                                            }
                                            className="h-6 w-6 text-amber-600 hover:text-amber-700 hover:bg-amber-600/10 rounded-md"
                                            title="Void Payment"
                                          >
                                            <Ban className="w-3.5 h-3.5" />
                                          </Button>
                                        )}
                                        {isVoided && (
                                          <Badge
                                            variant="outline"
                                            className="text-[8px] text-destructive border-destructive px-1 bg-destructive/10"
                                          >
                                            VOID
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                                {folio?.payments?.length === 0 && (
                                  <div className="p-4 text-[10px] text-muted-foreground text-center font-medium">
                                    No payments recorded.
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </>
                      )}
                    </TabsContent>

                    {/* 2. RECEIVE PAYMENT TAB */}
                    <TabsContent
                      value="payment"
                      className="m-0 p-4 border-none outline-none"
                    >
                      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                        <div className="bg-emerald-500/10 border-b border-border px-4 py-3 flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                            Record New Payment
                          </h3>
                        </div>
                        <div className="p-4">
                          <div className="space-y-1.5 mb-4">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              Payment Purpose / Title
                            </label>
                            <Input
                              type="text"
                              value={payTitle}
                              onChange={(e) => setPayTitle(e.target.value)}
                              placeholder="e.g., Downpayment, Final Handover Balance"
                              className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus-visible:ring-emerald-500 shadow-none transition-colors"
                            />
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Amount (₱)
                              </label>
                              <Input
                                type="number"
                                value={payAmount}
                                onChange={(e) => setPayAmount(e.target.value)}
                                className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus-visible:ring-emerald-500 shadow-none transition-colors"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Method
                              </label>
                              <Select
                                value={payMethod}
                                onValueChange={setPayMethod}
                              >
                                <SelectTrigger className="h-8 w-full! text-[11px] font-semibold bg-secondary border-border rounded-lg focus:ring-emerald-500 shadow-none transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                                  <SelectItem
                                    value="GCash"
                                    className="text-[11px] font-medium"
                                  >
                                    GCash
                                  </SelectItem>
                                  <SelectItem
                                    value="Cash"
                                    className="text-[11px] font-medium"
                                  >
                                    Cash
                                  </SelectItem>
                                  <SelectItem
                                    value="Bank Transfer"
                                    className="text-[11px] font-medium"
                                  >
                                    Bank Transfer
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Ref No. (Optional)
                              </label>
                              <Input
                                type="text"
                                value={payRef}
                                onChange={(e) => setPayRef(e.target.value)}
                                placeholder="e.g. 1029384"
                                className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus-visible:ring-emerald-500 shadow-none transition-colors"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-4 border-t border-border">
                            <Button
                              onClick={handleRecordPayment}
                              disabled={isRecordingPayment || !payAmount}
                              className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
                            >
                              {isRecordingPayment ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                              )}
                              Confirm Payment
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* 3. ADD CHARGE TAB */}
                    <TabsContent
                      value="charge"
                      className="m-0 p-4 border-none outline-none"
                    >
                      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                        <div className="bg-amber-500/10 border-b border-border px-4 py-3 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                            Add Invoice Charge
                          </h3>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                            <div className="space-y-1.5 col-span-1">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Amount (₱)
                              </label>
                              <Input
                                type="number"
                                value={chargeAmount}
                                onChange={(e) =>
                                  setChargeAmount(e.target.value)
                                }
                                placeholder="0.00"
                                className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus-visible:ring-amber-500 shadow-none transition-colors"
                              />
                            </div>

                            <div className="space-y-1.5 col-span-1 flex flex-col justify-start">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Category
                              </label>
                              <Select
                                value={chargeCat}
                                onValueChange={(val) => {
                                  setChargeCat(val);
                                  if (val !== "CUSTOM") setCustomChargeCat("");

                                  if (val === "DELIVERY_FEE") {
                                    setChargeDesc(
                                      `Delivery to ${folio?.booking?.pickup_type === "custom" ? folio.booking.pickup_location : folio?.booking?.dropoff_location}`,
                                    );
                                  }
                                }}
                              >
                                <SelectTrigger className="h-8 w-full! text-[11px] font-semibold bg-secondary border-border rounded-lg focus:ring-amber-500 shadow-none transition-colors">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                                  <SelectItem
                                    value="DELIVERY_FEE"
                                    className="text-[11px] font-medium"
                                  >
                                    Delivery Fee
                                  </SelectItem>
                                  <SelectItem
                                    value="DAMAGE_FEE"
                                    className="text-[11px] font-medium"
                                  >
                                    Damage
                                  </SelectItem>
                                  <SelectItem
                                    value="LATE_FEE"
                                    className="text-[11px] font-medium"
                                  >
                                    Late Fee
                                  </SelectItem>
                                  <SelectItem
                                    value="CLEANING_FEE"
                                    className="text-[11px] font-medium"
                                  >
                                    Cleaning
                                  </SelectItem>
                                  <SelectItem
                                    value="CUSTOM"
                                    className="text-[11px] font-bold text-amber-600"
                                  >
                                    Other (Custom)
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              {chargeCat === "CUSTOM" && (
                                <Input
                                  type="text"
                                  value={customChargeCat}
                                  onChange={(e) =>
                                    setCustomChargeCat(e.target.value)
                                  }
                                  placeholder="Type category..."
                                  className="h-8 text-[11px] font-semibold bg-secondary border-amber-500/50 rounded-lg focus-visible:ring-amber-500 shadow-none transition-colors mt-2"
                                />
                              )}
                            </div>

                            <div className="space-y-1.5 col-span-2 h-8">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Reason / Description
                              </label>
                              <Input
                                type="text"
                                value={chargeDesc}
                                onChange={(e) => setChargeDesc(e.target.value)}
                                placeholder="e.g. Scratched bumper"
                                className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus-visible:ring-amber-500 shadow-none transition-colors"
                              />
                            </div>
                          </div>
                          <div className="flex justify-end pt-4 border-t border-border">
                            <Button
                              onClick={handleAddCharge}
                              disabled={
                                isAddingCharge ||
                                !chargeAmount ||
                                !chargeCat ||
                                (chargeCat === "CUSTOM" && !customChargeCat)
                              }
                              className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-amber-600 hover:bg-amber-700 text-white rounded-lg shadow-sm transition-colors"
                            >
                              {isAddingCharge ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                              ) : (
                                <Plus className="w-3.5 h-3.5 mr-2" />
                              )}
                              Apply Charge
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>

                    {/* 4. REFUND DEPOSIT TAB */}
                    <TabsContent
                      value="refund"
                      className="m-0 p-4 border-none outline-none"
                    >
                      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                        <div className="bg-indigo-500/10 border-b border-border px-4 py-3 flex items-center gap-2">
                          <Undo2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                            Issue Refund / Discount
                          </h3>
                        </div>
                        <div className="p-4">
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
                            {/* Amount */}
                            <div className="space-y-1.5 col-span-1">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Amount (₱)
                              </label>
                              <Input
                                type="number"
                                value={refundAmount}
                                onChange={(e) =>
                                  setRefundAmount(e.target.value)
                                }
                                placeholder="0.00"
                                className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus-visible:ring-indigo-500 shadow-none transition-colors"
                              />
                            </div>

                            {/* Category */}
                            <div className="space-y-1.5 col-span-1 flex flex-col justify-start">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Category
                              </label>
                              <Select
                                value={refundCat}
                                onValueChange={(val) => {
                                  setRefundCat(val);
                                  if (val !== "CUSTOM") setCustomRefundCat("");
                                }}
                              >
                                <SelectTrigger className="h-8 w-full! text-[11px] font-semibold bg-secondary border-border rounded-lg focus:ring-indigo-500 shadow-none transition-colors">
                                  <SelectValue placeholder="Select" />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                                  <SelectItem
                                    value="OVERPAYMENT"
                                    className="text-[11px] font-medium"
                                  >
                                    Overpayment
                                  </SelectItem>
                                  <SelectItem
                                    value="SERVICE_ISSUE"
                                    className="text-[11px] font-medium"
                                  >
                                    Service/Vehicle Issue
                                  </SelectItem>
                                  <SelectItem
                                    value="EARLY_RETURN"
                                    className="text-[11px] font-medium"
                                  >
                                    Early Return
                                  </SelectItem>
                                  <SelectItem
                                    value="CUSTOM"
                                    className="text-[11px] font-bold text-indigo-600"
                                  >
                                    Other (Custom)
                                  </SelectItem>
                                </SelectContent>
                              </Select>

                              {refundCat === "CUSTOM" && (
                                <Input
                                  type="text"
                                  value={customRefundCat}
                                  onChange={(e) =>
                                    setCustomRefundCat(e.target.value)
                                  }
                                  placeholder="Type category..."
                                  className="h-8 text-[11px] font-semibold bg-secondary border-indigo-500/50 rounded-lg focus-visible:ring-indigo-500 shadow-none transition-colors mt-2"
                                />
                              )}
                            </div>

                            {/* Description */}
                            <div className="space-y-1.5 col-span-2">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Reason / Description
                              </label>
                              <Input
                                type="text"
                                value={refundDesc}
                                onChange={(e) => setRefundDesc(e.target.value)}
                                placeholder="e.g. AC was not cooling properly"
                                className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus-visible:ring-indigo-500 shadow-none transition-colors"
                              />
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 mb-5">
                            <Checkbox
                              id="deduct"
                              checked={isDeductFromInvoice}
                              onCheckedChange={(checked) =>
                                setIsDeductFromInvoice(checked as boolean)
                              }
                            />
                            <div className="grid leading-none">
                              <label
                                htmlFor="deduct"
                                className="text-xs font-semibold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Deduct from Invoice
                              </label>
                              <p className="text-[10px] text-muted-foreground mt-1">
                                Check this if the refund lowers the customer's
                                total bill (e.g. Discounts, Early Returns).
                              </p>
                            </div>
                          </div>

                          {/* Logistics Row (Method & Ref) */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5 pt-4 border-t border-border/50">
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Refund Method
                              </label>
                              <Select
                                value={refundMethod}
                                onValueChange={setRefundMethod}
                              >
                                <SelectTrigger className="h-8 w-full! text-[11px] font-semibold bg-secondary border-border rounded-lg focus:ring-indigo-500 shadow-none transition-colors">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                                  <SelectItem
                                    value="GCash"
                                    className="text-[11px] font-medium"
                                  >
                                    GCash
                                  </SelectItem>
                                  <SelectItem
                                    value="Cash"
                                    className="text-[11px] font-medium"
                                  >
                                    Cash
                                  </SelectItem>
                                  <SelectItem
                                    value="Bank Transfer"
                                    className="text-[11px] font-medium"
                                  >
                                    Bank Transfer
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                                Ref No. (Optional)
                              </label>
                              <Input
                                type="text"
                                value={refundRef}
                                onChange={(e) => setRefundRef(e.target.value)}
                                placeholder="e.g. GCash Ref"
                                className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus-visible:ring-indigo-500 shadow-none transition-colors"
                              />
                            </div>
                          </div>

                          <div className="flex justify-end pt-4 border-t border-border">
                            <Button
                              onClick={handleIssueRefund}
                              disabled={
                                isRefunding ||
                                !refundAmount ||
                                !refundCat ||
                                (refundCat === "CUSTOM" && !customRefundCat)
                              }
                              className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors"
                            >
                              {isRefunding ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                              ) : (
                                <Undo2 className="w-3.5 h-3.5 mr-2" />
                              )}
                              Finalize Refund
                            </Button>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </ScrollArea>
                </div>
              </Tabs>
            </div>
          </div>

          {/* --- FOOTER --- */}
          <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end gap-2 z-20 transition-colors">
            <Button
              variant="outline"
              className="h-8 px-4 text-[10px] font-semibold text-foreground hover:bg-secondary border-border rounded-lg shadow-none transition-colors"
              onClick={onClose}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- INJECTED DIALOGS --- */}

      {/* REMOVE CHARGE CONFIRMATION */}
      <Dialog
        open={removeChargeDialog.isOpen}
        onOpenChange={(open) =>
          !isProcessing &&
          setRemoveChargeDialog({ isOpen: open, chargeId: null })
        }
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" /> Remove Charge
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove this charge from the invoice? This
              action will adjust the customer's balance immediately.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={() =>
                setRemoveChargeDialog({ isOpen: false, chargeId: null })
              }
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmRemoveCharge}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              Remove Charge
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* VOID PAYMENT CONFIRMATION */}
      <Dialog
        open={voidPaymentDialog.isOpen}
        onOpenChange={(open) =>
          !isProcessing &&
          setVoidPaymentDialog((prev) => ({ ...prev, isOpen: open }))
        }
      >
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-amber-600">
              <Ban className="w-5 h-5" /> Void Payment
            </DialogTitle>
            <DialogDescription>
              Voiding a payment will reverse the cash collection in the master
              ledger and increase the customer's balance due.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2 block">
              Reason for Voiding <span className="text-destructive">*</span>
            </label>
            <Input
              placeholder="e.g., Accidental duplicate entry"
              value={voidPaymentDialog.reason}
              onChange={(e) =>
                setVoidPaymentDialog((prev) => ({
                  ...prev,
                  reason: e.target.value,
                }))
              }
              className="text-xs"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() =>
                setVoidPaymentDialog({
                  isOpen: false,
                  paymentId: null,
                  reason: "",
                })
              }
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              className="bg-amber-600 hover:bg-amber-700 text-white"
              onClick={handleConfirmVoidPayment}
              disabled={isProcessing || !voidPaymentDialog.reason.trim()}
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Ban className="w-4 h-4 mr-2" />
              )}
              Confirm Void
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
