"use client";

import React, { useState } from "react";
import {
  Wallet,
  ArrowDownRight,
  TrendingDown,
  Wrench,
  Plus,
  Calculator,
  Search,
  Filter,
  Download,
  Building2,
  ChevronRight,
  Receipt,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

// Import your operational modals & hooks
import GeneratePayoutModal from "./payout-modal";
import LogExpenseModal from "./log-expense-modal";
import PayoutBreakdownModal from "./payout-breakdown";
import { useFinancials } from "../../../hooks/use-financials";

export default function ExpensesMain() {
  const [activeTab, setActiveTab] = useState("payouts");

  // Real Data Hook
  const { data, isLoading } = useFinancials();

  // Modal States
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [viewPayout, setViewPayout] = useState<any | null>(null);
  const [prefilledOwner, setPrefilledOwner] = useState<string | undefined>();

  const openGenerateModal = (ownerId?: string) => {
    setPrefilledOwner(ownerId);
    setIsGenerateOpen(true);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Loading Financials...
          </span>
        </div>
      </div>
    );
  }

  // Fallbacks in case data is undefined
  const kpis = data?.kpis || {
    totalOutflow: 0,
    pendingLiabilities: 0,
    maintenanceSpend: 0,
  };
  const readyToSettle = data?.readyToSettle || [];
  const payouts = data?.payouts || [];
  const operational = data?.operational || [];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans">
      {/* --- FORMAL HEADER --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <ArrowDownRight className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              Expenses & Payouts
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Track operational costs, maintenance, and fleet partner
              settlements.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold border-slate-300 text-slate-700 bg-white rounded-sm shadow-sm hover:bg-slate-50"
            onClick={() => setIsLogOpen(true)}
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Log Expense
          </Button>
          <Button
            size="sm"
            className="h-8 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-sm"
            onClick={() => openGenerateModal()}
          >
            <Calculator className="w-3.5 h-3.5 mr-1.5" /> Generate Payout
          </Button>
        </div>
      </div>

      {/* --- SCROLLABLE BODY --- */}
      <ScrollArea className="flex-1">
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
          {/* --- KPI PULSE CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  Total Outflow (MTD)
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ₱ {Number(kpis.totalOutflow).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center shrink-0">
                <Wallet className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  Pending Liabilities
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ₱ {Number(kpis.pendingLiabilities).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                <Wrench className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  Maintenance Spend
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ₱ {Number(kpis.maintenanceSpend).toLocaleString()}
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
                        value="payouts"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-xs font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none"
                      >
                        Owner Payout History
                      </TabsTrigger>
                      <TabsTrigger
                        value="operational"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-xs font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none"
                      >
                        Operational Expenses
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Table View */}
                <div className="flex-1 bg-white">
                  {/* PAYOUTS TAB */}
                  {activeTab === "payouts" && (
                    <div className="divide-y divide-slate-100">
                      <div className="grid grid-cols-5 p-3 px-5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-50">
                        <div>Reference</div>
                        <div>Fleet Owner</div>
                        <div>Billing Period</div>
                        <div>Status</div>
                        <div className="text-right">Net Payout</div>
                      </div>
                      {payouts.length === 0 ? (
                        <div className="p-8 text-center text-xs font-medium text-slate-400">
                          No payout history found.
                        </div>
                      ) : (
                        payouts.map((pay: any) => (
                          <div
                            key={pay.payout_id}
                            className="grid grid-cols-5 p-3 px-5 items-center hover:bg-slate-50 cursor-pointer transition-colors group"
                            onClick={() => setViewPayout(pay)}
                          >
                            <div className="text-xs font-bold text-slate-900 font-mono group-hover:text-blue-600 transition-colors truncate pr-4">
                              {pay.payout_id.split("-")[0]}...
                            </div>
                            <div className="text-xs font-bold text-slate-700 truncate pr-4">
                              {pay.car_owner?.users?.full_name ||
                                "Unknown Owner"}
                            </div>
                            <div className="text-[10px] font-medium text-slate-500">
                              {format(new Date(pay.period_start), "MMM dd")} -{" "}
                              {format(new Date(pay.period_end), "MMM dd")}
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[9px] font-bold h-5 px-2 rounded-sm uppercase tracking-widest",
                                  pay.status === "PAID"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-amber-50 text-amber-700 border-amber-200",
                                )}
                              >
                                {pay.status}
                              </Badge>
                            </div>
                            <div className="text-right text-xs font-bold text-slate-900">
                              ₱ {Number(pay.net_payout).toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* OPERATIONAL EXPENSES TAB */}
                  {activeTab === "operational" && (
                    <div className="divide-y divide-slate-100">
                      <div className="grid grid-cols-[1fr_1fr_2fr_1fr] p-3 px-5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-50">
                        <div>Date</div>
                        <div>Category</div>
                        <div>Description</div>
                        <div className="text-right">Amount</div>
                      </div>

                      {operational.length === 0 ? (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-400 space-y-3">
                          <Receipt className="w-8 h-8 opacity-20" />
                          <span className="text-xs font-medium">
                            No operational expenses logged.
                          </span>
                        </div>
                      ) : (
                        operational.map((txn: any) => (
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
                              <span className="text-[10px] font-bold text-slate-400 font-mono mt-0.5 truncate pr-2">
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
                            <div className="text-right text-xs font-bold text-slate-900">
                              - ₱ {Number(txn.amount).toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTION QUEUE */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  Ready for Settlement
                </h2>
              </div>

              <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col overflow-hidden">
                <div className="bg-slate-900 px-4 py-3 flex justify-between items-center shrink-0">
                  <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                    Unsettled Revenue
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-slate-800 text-slate-300 border-none text-[9px] px-1.5 h-4 rounded-sm"
                  >
                    {readyToSettle.length} Owners
                  </Badge>
                </div>

                <div className="divide-y divide-slate-100">
                  {readyToSettle.map((owner: any) => (
                    <div
                      key={owner.owner_id}
                      className="p-4 flex flex-col gap-3 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold text-slate-900">
                            {owner.owner_name}
                          </span>
                          <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                            {owner.vehicles} Vehicle(s) •{" "}
                            {owner.unsettled_count} Completed Trips
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-semibold text-slate-500 uppercase tracking-widest">
                            Est. Payout
                          </span>
                          <span className="text-sm font-bold text-amber-600">
                            ₱ {Number(owner.est_owed).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 text-[10px] font-bold border-slate-300 bg-white rounded-sm text-slate-700 hover:bg-slate-100 shadow-sm"
                          onClick={() => openGenerateModal(owner.owner_id)}
                        >
                          Draft Payout <ChevronRight className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {readyToSettle.length === 0 && (
                  <div className="p-6 text-center text-xs font-medium text-slate-400">
                    All fleet owners are fully settled.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      {/* --- ALL OPERATIONAL MODALS --- */}
      <GeneratePayoutModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        prefilledOwnerId={prefilledOwner}
      />
      <LogExpenseModal isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />
      <PayoutBreakdownModal
        isOpen={!!viewPayout}
        onClose={() => setViewPayout(null)}
        payout={viewPayout}
      />
    </div>
  );
}
