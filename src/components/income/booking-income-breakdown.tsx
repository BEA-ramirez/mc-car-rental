"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import {
  X,
  Download,
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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

import { useIncomes, useBookingFolio } from "../../../hooks/use-incomes";

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
  const getInitialTab = () => {
    if (
      defaultAction === "payment" ||
      defaultAction === "charge" ||
      defaultAction === "refund"
    ) {
      return defaultAction;
    }
    return "ledger";
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  const { data: folio, isLoading } = useBookingFolio(bookingId);
  const {
    recordPayment,
    isRecordingPayment,
    addCharge,
    isAddingCharge,
    refundDeposit,
    isRefunding,
  } = useIncomes();

  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("GCash");
  const [payRef, setPayRef] = useState("");
  const [payTitle, setPayTitle] = useState("");

  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeCat, setChargeCat] = useState("");
  const [customChargeCat, setCustomChargeCat] = useState(""); // <-- NEW STATE FOR CUSTOM CATEGORY
  const [chargeDesc, setChargeDesc] = useState("");

  const [refundAmount, setRefundAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState("GCash");
  const [refundRef, setRefundRef] = useState("");

  const basePrice = Number(folio?.booking?.total_price || 0);
  const securityDeposit = Number(folio?.booking?.security_deposit || 0);
  const totalPaid =
    folio?.payments?.reduce(
      (sum: number, p: any) => sum + Number(p.amount),
      0,
    ) || 0;
  const balanceDue = basePrice - totalPaid;

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
      setCustomChargeCat(""); // <-- RESET IT
      setRefundAmount("");
      setRefundRef("");

      if (initial === "payment")
        setPayAmount(Math.max(0, balanceDue).toString());
      if (initial === "refund") setRefundAmount(securityDeposit.toString());
    }
  }, [isOpen, defaultAction, balanceDue, securityDeposit]);

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
    if (val === "refund") setRefundAmount(securityDeposit.toString());
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
    // 1. Determine which category to use (the dropdown value OR the custom typed value)
    const finalCategory = chargeCat === "CUSTOM" ? customChargeCat : chargeCat;

    if (!bookingId || !chargeAmount || !finalCategory) return;

    await addCharge({
      bookingId,
      // 2. Format the custom string to be DB friendly (e.g., "Towing Fee" -> "TOWING_FEE")
      category: finalCategory.toUpperCase().replace(/\s+/g, "_"),
      amount: parseFloat(chargeAmount),
      description: chargeDesc || "Added manually",
    });
    setActiveTab("ledger");
  };

  const handleRefundDeposit = async () => {
    if (!bookingId || !refundAmount) return;
    await refundDeposit({
      bookingId,
      amount: parseFloat(refundAmount),
      method: refundMethod,
      reference: refundRef || "N/A",
    });
    setActiveTab("ledger");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl xl:max-w-[1000px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[85vh] max-h-[800px] transition-colors duration-300 [&>button.absolute]:hidden">
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
                <div className="p-4 space-y-6">
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
                            <CalendarDays className="w-3 h-3" /> Contract Dates
                          </span>
                          <span className="text-[10px] font-medium text-foreground">
                            {folio?.booking?.start_date &&
                              format(
                                new Date(folio.booking.start_date),
                                "MMM dd, yyyy",
                              )}{" "}
                            -{" "}
                            {folio?.booking?.end_date &&
                              format(
                                new Date(folio.booking.end_date),
                                "MMM dd, yyyy",
                              )}
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
                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                          <div className="bg-secondary/50 border-b border-border px-3 py-2.5">
                            <h4 className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                              Itemized Charges
                            </h4>
                          </div>
                          <div>
                            <div className="grid grid-cols-[1.5fr_2fr_1fr] p-2 px-3 border-b border-border bg-secondary text-[9px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                              <div>Category</div>
                              <div>Description</div>
                              <div className="text-right">Amount</div>
                            </div>
                            <div className="divide-y divide-border">
                              {folio?.charges?.map((charge: any) => (
                                <div
                                  key={charge.charge_id}
                                  className="grid grid-cols-[1.5fr_2fr_1fr] p-2.5 px-3 items-center hover:bg-secondary/50 transition-colors"
                                >
                                  <span
                                    className={cn(
                                      "text-[10px] font-bold",
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
                                  <span
                                    className={cn(
                                      "text-[11px] font-bold font-mono text-right",
                                      charge.amount < 0
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-foreground",
                                    )}
                                  >
                                    {charge.amount < 0 ? "" : "₱ "}
                                    {Number(charge.amount).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                              {folio?.charges?.length === 0 && (
                                <div className="p-4 text-[10px] text-muted-foreground text-center font-medium">
                                  No charges recorded.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                          <div className="bg-secondary/50 border-b border-border px-3 py-2.5">
                            <h4 className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                              Payment History
                            </h4>
                          </div>
                          <div>
                            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] p-2 px-3 border-b border-border bg-secondary text-[9px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                              <div>Date & Time</div>
                              <div>Title & Method</div>
                              <div>Reference</div>
                              <div className="text-right">Amount</div>
                            </div>
                            <div className="divide-y divide-border">
                              {folio?.payments?.map((payment: any) => (
                                <div
                                  key={payment.payment_id}
                                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr] p-2.5 px-3 items-center hover:bg-secondary/50 transition-colors"
                                >
                                  <span className="text-[9px] font-medium text-muted-foreground">
                                    {format(
                                      new Date(
                                        payment.paid_at || payment.created_at,
                                      ),
                                      "MMM dd, yyyy • hh:mm a",
                                    )}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-foreground truncate">
                                      {payment.title || "Payment"}
                                    </span>
                                    <span className="text-[9px] text-muted-foreground">
                                      {payment.payment_method}
                                    </span>
                                  </div>
                                  <span className="text-[10px] font-mono text-muted-foreground truncate pr-2">
                                    {payment.transaction_reference || "N/A"}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-[11px] font-bold font-mono text-right",
                                      payment.amount < 0
                                        ? "text-indigo-600 dark:text-indigo-400"
                                        : "text-emerald-600 dark:text-emerald-400",
                                    )}
                                  >
                                    {payment.amount > 0 ? "+" : ""}₱{" "}
                                    {Number(payment.amount).toLocaleString()}
                                  </span>
                                </div>
                              ))}
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
                            placeholder="e.g., 10% Downpayment, Final Handover Balance"
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
                              <SelectTrigger className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus:ring-emerald-500 shadow-none transition-colors">
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
                              onChange={(e) => setChargeAmount(e.target.value)}
                              placeholder="0.00"
                              className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus-visible:ring-amber-500 shadow-none transition-colors"
                            />
                          </div>

                          {/* --- MODIFIED CATEGORY SELECT WITH CUSTOM INPUT --- */}
                          <div className="space-y-1.5 col-span-1 flex flex-col justify-start">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              Category
                            </label>
                            <Select
                              value={chargeCat}
                              onValueChange={(val) => {
                                setChargeCat(val);
                                if (val !== "CUSTOM") setCustomChargeCat(""); // reset if they pick a standard one
                              }}
                            >
                              <SelectTrigger className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus:ring-amber-500 shadow-none transition-colors">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
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

                            {/* Conditionally Render Custom Input */}
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

                          <div className="space-y-1.5 col-span-2">
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
                          Process Security Refund
                        </h3>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              Amount (₱)
                            </label>
                            <Input
                              type="number"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(e.target.value)}
                              className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus-visible:ring-indigo-500 shadow-none transition-colors"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              Method
                            </label>
                            <Select
                              value={refundMethod}
                              onValueChange={setRefundMethod}
                            >
                              <SelectTrigger className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg focus:ring-indigo-500 shadow-none transition-colors">
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
                            onClick={handleRefundDeposit}
                            disabled={isRefunding || !refundAmount}
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
          <Button className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-sm transition-opacity">
            <Download className="w-3.5 h-3.5 mr-2" /> Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
