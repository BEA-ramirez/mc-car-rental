"use client";

import React, { useState } from "react";
import {
  ArrowUpRight,
  TrendingUp,
  HandCoins,
  Search,
  Filter,
  Download,
  Plus,
  ChevronRight,
  CreditCard,
  Banknote,
  AlertCircle,
  Receipt,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import BookingIncomeBreakdownModal from "./booking-income-breakdown";
import LogIncomeModal from "./log-income-modal";
import { useIncomes } from "../../../hooks/use-incomes";

export default function IncomesMain() {
  const [activeTab, setActiveTab] = useState("booking_income");

  // Real Data Hook
  const { data, isLoading } = useIncomes();

  // Modal States
  const [folioConfig, setFolioConfig] = useState<{
    id: string;
    action: "none" | "payment" | "charge" | "refund";
  } | null>(null);

  const [isLogIncomeOpen, setIsLogIncomeOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Loading Revenue Data...
          </span>
        </div>
      </div>
    );
  }

  // Fallbacks
  const kpis = data?.kpis || {
    grossRevenue: 0,
    outstandingReceivables: 0,
    ancillaryIncome: 0,
  };
  const awaitingPayment = data?.awaitingPayment || [];
  const recentPayments = data?.recentPayments || [];
  const deposits = data?.deposits || [];
  const miscIncome = data?.miscIncome || [];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans">
      {/* --- FORMAL HEADER --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              Revenue & Collections
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Track booking payments, ancillary fees, and outstanding
              receivables.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold border-slate-300 text-slate-700 bg-white rounded-sm shadow-sm hover:bg-slate-50"
            onClick={() => setIsLogIncomeOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Log Misc Income
          </Button>
        </div>
      </div>

      {/* --- SCROLLABLE BODY --- */}
      <ScrollArea className="flex-1">
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
          {/* --- KPI PULSE CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  Gross Revenue (MTD)
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ₱ {Number(kpis.grossRevenue).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  Outstanding Receivables
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ₱ {Number(kpis.outstandingReceivables).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <HandCoins className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  Ancillary Income
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ₱ {Number(kpis.ancillaryIncome).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* LEFT COLUMN: MAIN REGISTRY */}
            <div className="xl:col-span-2 space-y-4">
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                {/* Tabs */}
                <div className="border-b border-slate-200 bg-slate-50/50 px-2 pt-2 flex items-center justify-between">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="bg-transparent h-9 p-0 flex gap-4 border-b-0 justify-start w-full">
                      <TabsTrigger
                        value="booking_income"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-xs font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none"
                      >
                        Recent Payments
                      </TabsTrigger>
                      <TabsTrigger
                        value="security_deposits"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-xs font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none"
                      >
                        Security Deposits
                      </TabsTrigger>
                      <TabsTrigger
                        value="misc_income"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-xs font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none"
                      >
                        Misc. Income
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Toolbar */}
                <div className="p-3 border-b border-slate-100 flex gap-2 bg-white justify-between items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search..."
                      className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all font-medium"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs font-semibold rounded-sm border-slate-200 text-slate-600 bg-white shadow-sm"
                    >
                      <Filter className="w-3 h-3 mr-1.5" /> Filter
                    </Button>
                  </div>
                </div>

                {/* Table View */}
                <div className="flex-1 bg-white">
                  {/* TAB 1: BOOKING INCOME */}
                  {activeTab === "booking_income" && (
                    <div className="divide-y divide-slate-100">
                      <div className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] p-3 px-5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-50">
                        <div>Transaction</div>
                        <div>Customer / Ref</div>
                        <div>Status</div>
                        <div>Method</div>
                        <div className="text-right">Amount</div>
                      </div>
                      {recentPayments.map((inc: any) => (
                        <div
                          key={inc.payment_id}
                          className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] p-3 px-5 items-center hover:bg-slate-50 cursor-pointer transition-colors group"
                          onClick={() =>
                            setFolioConfig({
                              id: inc.bookings?.booking_id,
                              action: "none",
                            })
                          }
                        >
                          <div className="flex flex-col pr-2">
                            <span className="text-xs font-bold text-slate-900 font-mono group-hover:text-emerald-600 transition-colors truncate">
                              {inc.payment_id.split("-")[0]}...
                            </span>
                            <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                              {format(new Date(inc.paid_at), "MMM dd, yyyy")}
                            </span>
                          </div>
                          <div className="flex flex-col pr-2">
                            <span className="text-xs font-bold text-slate-800 truncate">
                              {inc.bookings?.users?.full_name}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono mt-0.5 truncate">
                              {inc.bookings?.booking_id.split("-")[0]}
                            </span>
                          </div>
                          <div>
                            <Badge
                              variant="outline"
                              className="text-[9px] font-bold text-emerald-700 bg-emerald-50 border-emerald-200 px-2 py-0.5 rounded-sm uppercase tracking-wider"
                            >
                              {inc.status}
                            </Badge>
                          </div>
                          <div>
                            <span className="text-xs font-medium text-slate-600 flex items-center gap-1.5">
                              {inc.payment_method === "Cash" ? (
                                <Banknote className="w-3 h-3 text-slate-400" />
                              ) : (
                                <CreditCard className="w-3 h-3 text-slate-400" />
                              )}
                              {inc.payment_method}
                            </span>
                          </div>
                          <div className="text-right text-xs font-bold text-emerald-700">
                            + ₱ {Number(inc.amount).toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {recentPayments.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-400">
                          No recent payments.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: SECURITY DEPOSITS */}
                  {activeTab === "security_deposits" && (
                    <div className="divide-y divide-slate-100">
                      {/* Added an extra 1fr column for Deposit Status */}
                      <div className="grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr] p-3 px-5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-50">
                        <div>Start Date</div>
                        <div>Customer / Ref</div>
                        <div>Booking Status</div>
                        <div>Deposit Status</div>
                        <div className="text-right">Deposit Amount</div>
                      </div>

                      {deposits.map((dep: any) => {
                        // --- THE LOGIC ENGINE FOR DEPOSIT STATUS ---
                        const refundCharges =
                          dep.booking_charges?.filter(
                            (c: any) => c.category === "DEPOSIT_REFUND",
                          ) || [];
                        // Use Math.abs because refunds are logged as negative numbers
                        const totalRefunded = Math.abs(
                          refundCharges.reduce(
                            (sum: number, c: any) => sum + Number(c.amount),
                            0,
                          ),
                        );

                        let depositStatus = "Held";
                        let statusColor =
                          "bg-slate-100 text-slate-600 border-slate-300";

                        if (totalRefunded >= Number(dep.security_deposit)) {
                          depositStatus = "Refunded";
                          statusColor =
                            "bg-blue-50 text-blue-700 border-blue-200";
                        } else if (totalRefunded > 0) {
                          depositStatus = "Partially Refunded";
                          statusColor =
                            "bg-indigo-50 text-indigo-700 border-indigo-200";
                        } else if (
                          dep.booking_status.toLowerCase() === "completed"
                        ) {
                          depositStatus = "Pending Action"; // Booking is done, but money is still held
                          statusColor =
                            "bg-amber-50 text-amber-700 border-amber-200";
                        }

                        return (
                          <div
                            key={dep.booking_id}
                            className="grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr] p-3 px-5 items-center hover:bg-slate-50 cursor-pointer transition-colors group"
                            onClick={() =>
                              setFolioConfig({
                                id: dep.booking_id,
                                action: "none",
                              })
                            }
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800">
                                {format(
                                  new Date(dep.start_date),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                            </div>
                            <div className="flex flex-col pr-4">
                              <span className="text-xs font-bold text-slate-800 truncate">
                                {dep.users?.full_name}
                              </span>
                              <span className="text-[10px] font-medium text-slate-500 mt-0.5 font-mono">
                                {dep.booking_id.split("-")[0]}
                              </span>
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className="text-[9px] font-bold h-5 px-2 rounded-sm uppercase tracking-widest bg-slate-100 text-slate-600 border-slate-300"
                              >
                                {dep.booking_status}
                              </Badge>
                            </div>
                            {/* NEW: Dynamic Deposit Status Badge */}
                            <div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] font-bold h-5 px-2 rounded-sm uppercase tracking-widest",
                                  statusColor,
                                )}
                              >
                                {depositStatus}
                              </Badge>
                            </div>
                            <div className="text-right text-xs font-bold text-slate-900">
                              ₱ {Number(dep.security_deposit).toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                      {deposits.length === 0 && (
                        <div className="p-8 text-center text-xs text-slate-400">
                          No active deposits.
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: MISC INCOME */}
                  {activeTab === "misc_income" && (
                    <div className="divide-y divide-slate-100">
                      <div className="grid grid-cols-[1fr_1fr_2fr_1fr] p-3 px-5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-50">
                        <div>Date</div>
                        <div>Category</div>
                        <div>Description</div>
                        <div className="text-right">Amount</div>
                      </div>
                      {miscIncome.map((txn: any) => (
                        <div
                          key={txn.transaction_id}
                          className="grid grid-cols-[1fr_1fr_2fr_1fr] p-3 px-5 items-center hover:bg-slate-50 transition-colors"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">
                              {format(
                                new Date(txn.transaction_date),
                                "MMM dd, yyyy",
                              )}
                            </span>
                            <span className="text-[10px] font-bold text-slate-400 font-mono mt-0.5">
                              {txn.transaction_id.split("-")[0]}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-sm uppercase tracking-wider">
                              {txn.category.replace("_", " ")}
                            </span>
                          </div>
                          <div className="text-xs font-medium text-slate-600 truncate pr-4">
                            {txn.notes}
                          </div>
                          <div className="text-right text-xs font-bold text-emerald-700">
                            + ₱ {Number(txn.amount).toLocaleString()}
                          </div>
                        </div>
                      ))}
                      {miscIncome.length === 0 && (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-400 space-y-3">
                          <Banknote className="w-8 h-8 opacity-20" />
                          <span className="text-xs font-medium">
                            No miscellaneous income records.
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTION QUEUE (Collections) */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Awaiting Payment
                </h2>
              </div>

              <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col overflow-hidden">
                <div className="bg-slate-900 px-4 py-3 flex justify-between items-center shrink-0">
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                    Collection Queue
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-amber-500/20 text-amber-300 border-none text-[9px] px-1.5 h-4 rounded-sm"
                  >
                    {awaitingPayment.length} Action(s)
                  </Badge>
                </div>

                <div className="divide-y divide-slate-100">
                  {awaitingPayment.map((bkg: any) => (
                    <div
                      key={bkg.id}
                      className={cn(
                        "p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors",
                        bkg.is_overdue ? "bg-red-50/30" : "",
                      )}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-slate-900">
                              {bkg.customer}
                            </span>
                            {bkg.is_overdue && (
                              <Badge
                                variant="outline"
                                className="h-4 px-1 text-[8px] uppercase tracking-widest text-red-600 border-red-200 bg-red-50 font-bold"
                              >
                                Overdue
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                            Ref:{" "}
                            <span className="font-mono">
                              {bkg.id.split("-")[0]}
                            </span>{" "}
                            • {bkg.car}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                            Balance Due
                          </span>
                          <span
                            className={cn(
                              "text-sm font-bold",
                              bkg.is_overdue
                                ? "text-red-700"
                                : "text-amber-600",
                            )}
                          >
                            ₱ {Number(bkg.due).toLocaleString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 border-slate-300 bg-white rounded-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 shadow-sm"
                            onClick={() =>
                              setFolioConfig({ id: bkg.id, action: "none" })
                            }
                          >
                            <Receipt className="w-3.5 h-3.5" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-[10px] font-bold border-slate-300 bg-white rounded-sm text-slate-700 hover:bg-slate-100 shadow-sm"
                            onClick={() =>
                              setFolioConfig({ id: bkg.id, action: "payment" })
                            }
                          >
                            Collect <ChevronRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {awaitingPayment.length === 0 && (
                  <div className="p-6 text-center text-xs font-medium text-slate-400">
                    No outstanding balances. All bookings are fully paid.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* --- ALL OPERATIONAL MODALS --- */}
      <BookingIncomeBreakdownModal
        isOpen={!!folioConfig}
        onClose={() => setFolioConfig(null)}
        bookingId={folioConfig?.id || null}
        defaultAction={folioConfig?.action || "none"}
      />
      <LogIncomeModal
        isOpen={isLogIncomeOpen}
        onClose={() => setIsLogIncomeOpen(false)}
      />
    </div>
  );
}
