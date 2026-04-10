"use client";

import React, { useState } from "react";
import {
  Wallet,
  TrendingDown,
  Wrench,
  Plus,
  Calculator,
  Search,
  Filter,
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
      <div className="flex h-full w-full items-center justify-center bg-background transition-colors">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Loading Financials...
          </span>
        </div>
      </div>
    );
  }

  // Fallbacks
  const kpis = data?.kpis || {
    totalOutflow: 0,
    pendingLiabilities: 0,
    maintenanceSpend: 0,
  };
  const readyToSettle = data?.readyToSettle || [];
  const payouts = data?.payouts || [];
  const operational = data?.operational || [];

  return (
    <div className="flex flex-col h-full bg-background font-sans transition-colors duration-300">
      {/* --- SCROLLABLE BODY --- */}
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-4 md:p-5 space-y-5">
          {/* --- KPI PULSE CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0 transition-colors">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Total Outflow (MTD)
                  </span>
                  <span className="text-xl font-black text-foreground tracking-tight font-mono">
                    ₱ {Number(kpis.totalOutflow).toLocaleString()}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-secondary shadow-none transition-colors"
                onClick={() => setIsLogOpen(true)}
                title="Log Expense"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center justify-between transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 transition-colors">
                  <Wallet className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Pending Liabilities
                  </span>
                  <span className="text-xl font-black text-foreground tracking-tight font-mono">
                    ₱ {Number(kpis.pendingLiabilities).toLocaleString()}
                  </span>
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-secondary shadow-none transition-colors"
                onClick={() => openGenerateModal()}
                title="Generate Payout"
              >
                <Calculator className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 transition-colors">
                <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Maintenance Spend
                </span>
                <span className="text-xl font-black text-foreground tracking-tight font-mono">
                  ₱ {Number(kpis.maintenanceSpend).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* LEFT COLUMN: MAIN REGISTRY */}
            <div className="xl:col-span-2 space-y-4">
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px] transition-colors">
                {/* Tabs Header */}
                <div className="border-b border-border bg-secondary/30 px-3 pt-2 flex items-center justify-between transition-colors">
                  <Tabs
                    value={activeTab}
                    onValueChange={setActiveTab}
                    className="w-full"
                  >
                    <TabsList className="bg-transparent h-9 p-0 flex gap-4 border-b-0 justify-start w-full">
                      <TabsTrigger
                        value="payouts"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all"
                      >
                        Payout History
                      </TabsTrigger>
                      <TabsTrigger
                        value="operational"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all"
                      >
                        Operational Expenses
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* Toolbar */}
                <div className="p-3 border-b border-border flex gap-2 bg-card transition-colors justify-between items-center">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search records..."
                      className="w-full h-8 pl-8 pr-3 text-[11px] font-medium bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-colors shadow-none"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-[11px] font-semibold rounded-lg border-border text-foreground bg-card hover:bg-secondary transition-colors"
                  >
                    <Filter className="w-3.5 h-3.5 mr-1.5" /> Filter
                  </Button>
                </div>

                {/* Table View */}
                <div className="flex-1 bg-background transition-colors">
                  {activeTab === "payouts" && (
                    <div className="divide-y divide-border">
                      <div className="grid grid-cols-5 p-2.5 px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 transition-colors">
                        <div>Reference</div>
                        <div>Fleet Owner</div>
                        <div>Billing Period</div>
                        <div>Status</div>
                        <div className="text-right">Net Payout</div>
                      </div>
                      {payouts.length === 0 ? (
                        <div className="p-8 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                          No payout history found.
                        </div>
                      ) : (
                        payouts.map((pay: any) => (
                          <div
                            key={pay.payout_id}
                            className="grid grid-cols-5 p-2.5 px-4 items-center hover:bg-secondary/30 cursor-pointer transition-colors group"
                            onClick={() => setViewPayout(pay)}
                          >
                            <div className="text-[10px] font-bold text-foreground font-mono group-hover:text-primary transition-colors truncate pr-4">
                              {pay.payout_id.split("-")[0]}...
                            </div>
                            <div className="text-[11px] font-bold text-foreground truncate pr-4">
                              {pay.car_owner?.users?.full_name || "Unknown"}
                            </div>
                            <div className="text-[10px] font-medium text-muted-foreground">
                              {format(new Date(pay.period_start), "MMM dd")} -{" "}
                              {format(new Date(pay.period_end), "MMM dd")}
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[8px] font-bold h-4 px-1.5 rounded uppercase tracking-widest",
                                  pay.status === "PAID"
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                )}
                              >
                                {pay.status}
                              </Badge>
                            </div>
                            <div className="text-right text-[11px] font-bold text-foreground font-mono">
                              ₱ {Number(pay.net_payout).toLocaleString()}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {activeTab === "operational" && (
                    <div className="divide-y divide-border">
                      <div className="grid grid-cols-[1fr_1fr_2fr_1fr] p-2.5 px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 transition-colors">
                        <div>Date</div>
                        <div>Category</div>
                        <div>Description</div>
                        <div className="text-right">Amount</div>
                      </div>
                      {operational.length === 0 ? (
                        <div className="p-10 flex flex-col items-center justify-center text-muted-foreground space-y-2">
                          <Receipt className="w-8 h-8 opacity-20" />
                          <span className="text-[10px] font-medium uppercase tracking-widest">
                            No expenses logged.
                          </span>
                        </div>
                      ) : (
                        operational.map((txn: any) => (
                          <div
                            key={txn.transaction_id}
                            className="grid grid-cols-[1fr_1fr_2fr_1fr] p-2.5 px-4 items-center hover:bg-secondary/30 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold text-foreground">
                                {format(
                                  new Date(txn.transaction_date),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                              <span className="text-[9px] font-medium text-muted-foreground font-mono mt-0.5 uppercase tracking-widest">
                                {txn.transaction_id.split("-")[0]}
                              </span>
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className="text-[8px] font-bold bg-secondary text-muted-foreground border-border px-1.5 py-0 h-4 rounded uppercase tracking-widest"
                              >
                                {txn.category.replace("_", " ")}
                              </Badge>
                            </div>
                            <div className="text-[10px] font-medium text-muted-foreground truncate pr-4">
                              {txn.notes}
                            </div>
                            <div className="text-right text-[11px] font-bold text-destructive font-mono">
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
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Ready for Settlement
                </h2>
              </div>

              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors">
                <div className="bg-secondary/50 border-b border-border px-4 py-2.5 flex justify-between items-center shrink-0 transition-colors">
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Unsettled Revenue
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 h-4 rounded uppercase tracking-widest font-bold"
                  >
                    {readyToSettle.length} Owners
                  </Badge>
                </div>

                <div className="divide-y divide-border">
                  {readyToSettle.map((owner: any) => (
                    <div
                      key={owner.owner_id}
                      className="p-3 flex flex-col gap-2 hover:bg-secondary/30 transition-colors"
                    >
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground truncate">
                          {owner.owner_name}
                        </span>
                        <span className="text-[9px] font-medium text-muted-foreground mt-0.5 uppercase tracking-widest">
                          {owner.vehicles} Asset(s) • {owner.unsettled_count}{" "}
                          Trips
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex flex-col">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                            Est. Payout
                          </span>
                          <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 font-mono">
                            ₱ {Number(owner.est_owed).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[9px] font-bold uppercase tracking-widest border-border bg-card rounded-lg text-foreground hover:bg-secondary shadow-none transition-colors"
                          onClick={() => openGenerateModal(owner.owner_id)}
                        >
                          Draft{" "}
                          <ChevronRight className="w-3 h-3 ml-0.5 text-muted-foreground" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  {readyToSettle.length === 0 && (
                    <div className="p-6 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                      All owners settled.
                    </div>
                  )}
                </div>
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
