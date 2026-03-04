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

  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeCat, setChargeCat] = useState("");
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
      setChargeAmount("");
      setChargeDesc("");
      setChargeCat("");
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
    });
    setActiveTab("ledger");
  };

  const handleAddCharge = async () => {
    if (!bookingId || !chargeAmount || !chargeCat) return;
    await addCharge({
      bookingId,
      category: chargeCat,
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
      <DialogContent className="max-w-6xl xl:max-w-[1000px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col h-[85vh] max-h-[800px] [&>button.absolute]:hidden bg-white">
        {/* --- COMPACT HEADER --- */}
        <DialogHeader className="px-5 py-3 border-b border-slate-200 bg-slate-50 shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm bg-slate-200 border border-slate-300 flex items-center justify-center shadow-sm">
              <Receipt className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Financial Folio
              </DialogTitle>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest leading-none font-mono">
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
                  "text-[9px] font-bold uppercase tracking-widest rounded-sm h-6 px-2.5 border shadow-sm",
                  balanceDue <= 0
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200",
                )}
              >
                {balanceDue <= 0 ? "Fully Paid" : "Balance Due"}
              </Badge>
            )}
            <div className="w-px h-5 bg-slate-300 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-slate-900 hover:bg-slate-200 rounded-sm transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* --- SPLIT BODY --- */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* LEFT COLUMN: CONTEXT & SUMMARY */}
          <div className="w-[320px] bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 z-10">
            <div className="flex-1 min-h-0 overflow-hidden">
              <ScrollArea className="h-full w-full">
                <div className="p-6 space-y-8">
                  {isLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                    </div>
                  ) : (
                    <>
                      {/* Entity Details */}
                      <div className="space-y-5">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <User className="w-3 h-3" /> Customer Profile
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {customerName}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <Car className="w-3 h-3" /> Assigned Asset
                          </span>
                          <span className="text-xs font-bold text-slate-900">
                            {carBrand}{" "}
                            <span className="text-slate-500 font-mono">
                              ({carPlate})
                            </span>
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                            <CalendarDays className="w-3 h-3" /> Contract Dates
                          </span>
                          <span className="text-xs font-medium text-slate-700">
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

                      <hr className="border-slate-200" />

                      {/* Financial Snapshot */}
                      <div>
                        <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-4">
                          Financial Snapshot
                        </h4>
                        <div className="space-y-3 mb-5">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">
                              Total Billed
                            </span>
                            <span className="text-xs font-bold text-slate-900 font-mono">
                              ₱ {basePrice.toLocaleString()}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-500">
                              Total Paid
                            </span>
                            <span className="text-xs font-bold text-emerald-600 font-mono">
                              - ₱ {totalPaid.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div
                          className={cn(
                            "p-4 rounded-sm shadow-sm flex flex-col justify-center items-center text-center border",
                            balanceDue > 0
                              ? "bg-amber-50 border-amber-200"
                              : "bg-slate-900 border-slate-900 text-white",
                          )}
                        >
                          <span
                            className={cn(
                              "text-[9px] font-bold uppercase tracking-widest mb-1",
                              balanceDue > 0
                                ? "text-amber-700"
                                : "text-slate-400",
                            )}
                          >
                            {balanceDue > 0 ? "Balance Due" : "Net Settled"}
                          </span>
                          <span
                            className={cn(
                              "text-2xl font-black tracking-tight font-mono",
                              balanceDue > 0 ? "text-amber-700" : "text-white",
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
          <div className="flex-1 flex flex-col bg-white overflow-hidden min-h-0">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Tab Navigation */}
              <div className="px-6 pt-4 border-b border-slate-200 bg-slate-50/50 shrink-0">
                <TabsList className="bg-transparent p-0 flex gap-6 border-b-0 justify-start w-full">
                  <TabsTrigger
                    value="ledger"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none uppercase tracking-wider"
                  >
                    Ledger View
                  </TabsTrigger>
                  <TabsTrigger
                    value="payment"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-emerald-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-[11px] font-bold text-slate-500 data-[state=active]:text-emerald-700 transition-none uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <CreditCard className="w-3.5 h-3.5" /> Receive
                  </TabsTrigger>
                  <TabsTrigger
                    value="charge"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-[11px] font-bold text-slate-500 data-[state=active]:text-amber-700 transition-none uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" /> Charge
                  </TabsTrigger>
                  <TabsTrigger
                    value="refund"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-2 text-[11px] font-bold text-slate-500 data-[state=active]:text-blue-700 transition-none uppercase tracking-wider flex items-center gap-1.5"
                  >
                    <Undo2 className="w-3.5 h-3.5" /> Refund
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Tab Contents */}
              <div className="flex-1 min-h-0 overflow-hidden bg-white">
                <ScrollArea className="h-full w-full">
                  {/* 1. LEDGER TAB */}
                  <TabsContent
                    value="ledger"
                    className="m-0 p-6 space-y-8 border-none outline-none"
                  >
                    {isLoading ? (
                      <div className="flex justify-center py-10">
                        <Loader2 className="w-5 h-5 animate-spin text-slate-300" />
                      </div>
                    ) : (
                      <>
                        <div>
                          <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                            Itemized Charges
                          </h4>
                          <div className="border border-slate-200 rounded-sm overflow-hidden">
                            <div className="grid grid-cols-[1.5fr_2fr_1fr] p-2.5 px-4 border-b border-slate-100 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              <div>Category</div>
                              <div>Description</div>
                              <div className="text-right">Amount</div>
                            </div>
                            <div className="divide-y divide-slate-100">
                              {folio?.charges?.map((charge: any) => (
                                <div
                                  key={charge.charge_id}
                                  className="grid grid-cols-[1.5fr_2fr_1fr] p-3 px-4 items-center hover:bg-slate-50 transition-colors"
                                >
                                  <span
                                    className={cn(
                                      "text-xs font-bold",
                                      charge.category.includes("FEE")
                                        ? "text-red-700"
                                        : charge.category === "DEPOSIT_REFUND"
                                          ? "text-blue-700"
                                          : "text-slate-800",
                                    )}
                                  >
                                    {charge.category.replace("_", " ")}
                                  </span>
                                  <span className="text-[10px] font-medium text-slate-500 truncate pr-4">
                                    {charge.description}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-xs font-bold font-mono text-right",
                                      charge.amount < 0
                                        ? "text-blue-700"
                                        : "text-slate-900",
                                    )}
                                  >
                                    {charge.amount < 0 ? "" : "₱ "}
                                    {Number(charge.amount).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                              {folio?.charges?.length === 0 && (
                                <div className="p-5 text-xs text-slate-400 text-center font-medium">
                                  No charges recorded.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest mb-3 flex items-center gap-2">
                            Payment History
                          </h4>
                          <div className="border border-slate-200 rounded-sm overflow-hidden">
                            <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr] p-2.5 px-4 border-b border-slate-100 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                              <div>Date & Time</div>
                              <div>Method</div>
                              <div>Reference</div>
                              <div className="text-right">Amount</div>
                            </div>
                            <div className="divide-y divide-slate-100">
                              {folio?.payments?.map((payment: any) => (
                                <div
                                  key={payment.payment_id}
                                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr] p-3 px-4 items-center hover:bg-slate-50 transition-colors"
                                >
                                  <span className="text-[10px] font-medium text-slate-500">
                                    {format(
                                      new Date(payment.paid_at),
                                      "MMM dd, yyyy • hh:mm a",
                                    )}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-800">
                                    {payment.payment_method}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 truncate pr-2">
                                    {payment.transaction_reference}
                                  </span>
                                  <span
                                    className={cn(
                                      "text-xs font-bold font-mono text-right",
                                      payment.amount < 0
                                        ? "text-blue-700"
                                        : "text-emerald-700",
                                    )}
                                  >
                                    {payment.amount > 0 ? "+" : ""}₱{" "}
                                    {Number(payment.amount).toLocaleString()}
                                  </span>
                                </div>
                              ))}
                              {folio?.payments?.length === 0 && (
                                <div className="p-5 text-xs text-slate-400 text-center font-medium">
                                  No payments recorded.
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </TabsContent>

                  {/* 2. RECEIVE PAYMENT TAB (Horizontal Layout) */}
                  <TabsContent
                    value="payment"
                    className="m-0 p-6 border-none outline-none"
                  >
                    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                      <div className="bg-emerald-50/50 border-b border-slate-200 px-5 py-3.5 flex items-center gap-2.5">
                        <CreditCard className="w-4 h-4 text-emerald-600" />
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                          Record New Payment
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Amount (₱)
                            </label>
                            <Input
                              type="number"
                              value={payAmount}
                              onChange={(e) => setPayAmount(e.target.value)}
                              className="h-9 text-xs font-bold border-slate-200 rounded-sm focus-visible:ring-emerald-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Method
                            </label>
                            <Select
                              value={payMethod}
                              onValueChange={setPayMethod}
                            >
                              <SelectTrigger className="h-9 text-xs font-bold border-slate-200 rounded-sm focus:ring-emerald-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-sm">
                                <SelectItem
                                  value="GCash"
                                  className="text-xs font-medium"
                                >
                                  GCash
                                </SelectItem>
                                <SelectItem
                                  value="Cash"
                                  className="text-xs font-medium"
                                >
                                  Cash
                                </SelectItem>
                                <SelectItem
                                  value="Bank Transfer"
                                  className="text-xs font-medium"
                                >
                                  Bank Transfer
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Ref No. (Optional)
                            </label>
                            <Input
                              type="text"
                              value={payRef}
                              onChange={(e) => setPayRef(e.target.value)}
                              placeholder="e.g. 1029384"
                              className="h-9 text-xs font-medium border-slate-200 rounded-sm focus-visible:ring-emerald-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-5 border-t border-slate-100">
                          <Button
                            onClick={handleRecordPayment}
                            disabled={isRecordingPayment || !payAmount}
                            className="h-9 px-6 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-sm transition-colors"
                          >
                            {isRecordingPayment ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                            ) : (
                              <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
                            )}
                            Confirm & Save Payment
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 3. ADD CHARGE TAB (Horizontal Layout) */}
                  <TabsContent
                    value="charge"
                    className="m-0 p-6 border-none outline-none"
                  >
                    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                      <div className="bg-amber-50/50 border-b border-slate-200 px-5 py-3.5 flex items-center gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                          Add Invoice Charge
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-6">
                          <div className="space-y-1.5 col-span-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Amount (₱)
                            </label>
                            <Input
                              type="number"
                              value={chargeAmount}
                              onChange={(e) => setChargeAmount(e.target.value)}
                              placeholder="0.00"
                              className="h-9 text-xs font-bold border-slate-200 rounded-sm focus-visible:ring-amber-500"
                            />
                          </div>
                          <div className="space-y-1.5 col-span-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Category
                            </label>
                            <Select
                              value={chargeCat}
                              onValueChange={setChargeCat}
                            >
                              <SelectTrigger className="h-9 text-xs font-bold border-slate-200 rounded-sm focus:ring-amber-500">
                                <SelectValue placeholder="Select" />
                              </SelectTrigger>
                              <SelectContent className="rounded-sm">
                                <SelectItem
                                  value="DAMAGE_FEE"
                                  className="text-xs font-medium"
                                >
                                  Damage
                                </SelectItem>
                                <SelectItem
                                  value="LATE_FEE"
                                  className="text-xs font-medium"
                                >
                                  Late Fee
                                </SelectItem>
                                <SelectItem
                                  value="CLEANING_FEE"
                                  className="text-xs font-medium"
                                >
                                  Cleaning
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5 col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Reason / Description
                            </label>
                            <Input
                              type="text"
                              value={chargeDesc}
                              onChange={(e) => setChargeDesc(e.target.value)}
                              placeholder="e.g. Scratched bumper"
                              className="h-9 text-xs font-medium border-slate-200 rounded-sm focus-visible:ring-amber-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-5 border-t border-slate-100">
                          <Button
                            onClick={handleAddCharge}
                            disabled={
                              isAddingCharge || !chargeAmount || !chargeCat
                            }
                            className="h-9 px-6 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-sm shadow-sm transition-colors"
                          >
                            {isAddingCharge ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                            ) : (
                              <Plus className="w-3.5 h-3.5 mr-2" />
                            )}
                            Apply Charge to Invoice
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* 4. REFUND DEPOSIT TAB (Horizontal Layout) */}
                  <TabsContent
                    value="refund"
                    className="m-0 p-6 border-none outline-none"
                  >
                    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                      <div className="bg-blue-50/50 border-b border-slate-200 px-5 py-3.5 flex items-center gap-2.5">
                        <Undo2 className="w-4 h-4 text-blue-600" />
                        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                          Process Security Refund
                        </h3>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Amount (₱)
                            </label>
                            <Input
                              type="number"
                              value={refundAmount}
                              onChange={(e) => setRefundAmount(e.target.value)}
                              className="h-9 text-xs font-bold border-slate-200 rounded-sm focus-visible:ring-blue-500"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Method
                            </label>
                            <Select
                              value={refundMethod}
                              onValueChange={setRefundMethod}
                            >
                              <SelectTrigger className="h-9 text-xs font-bold border-slate-200 rounded-sm focus:ring-blue-500">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="rounded-sm">
                                <SelectItem
                                  value="GCash"
                                  className="text-xs font-medium"
                                >
                                  GCash
                                </SelectItem>
                                <SelectItem
                                  value="Cash"
                                  className="text-xs font-medium"
                                >
                                  Cash
                                </SelectItem>
                                <SelectItem
                                  value="Bank Transfer"
                                  className="text-xs font-medium"
                                >
                                  Bank Transfer
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                              Ref No. (Optional)
                            </label>
                            <Input
                              type="text"
                              value={refundRef}
                              onChange={(e) => setRefundRef(e.target.value)}
                              placeholder="e.g. GCash Ref"
                              className="h-9 text-xs font-medium border-slate-200 rounded-sm focus-visible:ring-blue-500"
                            />
                          </div>
                        </div>
                        <div className="flex justify-end pt-5 border-t border-slate-100">
                          <Button
                            onClick={handleRefundDeposit}
                            disabled={isRefunding || !refundAmount}
                            className="h-9 px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-sm shadow-sm transition-colors"
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
        <div className="bg-slate-50 border-t border-slate-200 p-3 px-5 shrink-0 flex justify-end gap-2 z-20">
          <Button
            variant="outline"
            className="h-8 px-5 text-xs font-bold text-slate-600 border-slate-300 rounded-sm hover:bg-slate-100"
            onClick={onClose}
          >
            Close
          </Button>
          <Button className="h-8 px-5 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-sm shadow-sm transition-all">
            <Download className="w-3.5 h-3.5 mr-2" /> Download Folio PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
