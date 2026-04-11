"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
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
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import GeneratePayoutModal from "./payout-modal";
import LogExpenseModal from "./log-expense-modal";
import PayoutBreakdownModal from "./payout-breakdown";
import { TableToolbar } from "../table/table-toolbar";
import { SortableHead } from "../table/sortable-header";
import { TablePagination } from "../table-pagination";
import { useUrlParams } from "../../../hooks/use-url-params";
import {
  useExpenseWidgets,
  useExpenseTable,
} from "../../../hooks/use-financials";

// Reuse the TrendIndicator from Income page
const TrendIndicator = ({
  value,
  invertColors = false,
}: {
  value: number;
  invertColors?: boolean;
}) => {
  if (!value || value === 0)
    return (
      <span className="text-[10px] text-muted-foreground font-medium mt-1">
        0% from last month
      </span>
    );
  const isPositive = value > 0;
  let colorClass = isPositive ? "text-emerald-500" : "text-destructive";
  if (invertColors)
    colorClass = isPositive ? "text-destructive" : "text-emerald-500";

  return (
    <div
      className={cn(
        "flex items-center gap-1 mt-1 text-[10px] font-bold",
        colorClass,
      )}
    >
      {isPositive ? (
        <ArrowUpRight className="w-3 h-3" />
      ) : (
        <ArrowDownRight className="w-3 h-3" />
      )}
      <span>{Math.abs(value)}%</span>
      <span className="text-muted-foreground font-medium ml-0.5">
        vs last month
      </span>
    </div>
  );
};

export default function ExpensesMain() {
  const searchParams = useSearchParams();
  const { setUrlParams } = useUrlParams();

  const activeTab = searchParams.get("tab") || "payouts";
  const currentPage = Number(searchParams.get("page")) || 1;

  const { data: widgetData, isLoading: isWidgetsLoading } = useExpenseWidgets();
  const { data: tablePayload, isFetching: isTableFetching } = useExpenseTable({
    tab: activeTab,
    page: currentPage,
    search: searchParams.get("search") || "",
  });

  const [isGenerateOpen, setIsGenerateOpen] = useState(false);
  const [isLogOpen, setIsLogOpen] = useState(false);
  const [viewPayout, setViewPayout] = useState<any | null>(null);
  const [prefilledOwner, setPrefilledOwner] = useState<string | undefined>();

  if (isWidgetsLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const kpis = widgetData?.kpis;
  const readyToSettle = widgetData?.readyToSettle || [];
  const tableData = tablePayload?.tableData || [];
  const totalPages = tablePayload?.totalPages || 1;

  return (
    <div className="flex flex-col h-full bg-background font-sans transition-colors duration-300">
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-4 md:p-5 space-y-5">
          {/* --- KPI PULSE CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0 mt-0.5">
                  <TrendingDown className="w-4 h-4 text-destructive" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Total Outflow (MTD)
                  </span>
                  <span className="text-2xl font-black text-foreground tracking-tight font-mono leading-none mt-1">
                    ₱ {Number(kpis.totalOutflow).toLocaleString()}
                  </span>
                  <TrendIndicator
                    value={kpis.totalOutflowGrowth}
                    invertColors={true}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setIsLogOpen(true)}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <Wallet className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Pending Liabilities
                  </span>
                  <span className="text-2xl font-black text-foreground tracking-tight font-mono leading-none mt-1">
                    ₱ {Number(kpis.pendingLiabilities).toLocaleString()}
                  </span>
                  <TrendIndicator
                    value={kpis.pendingLiabilitiesGrowth}
                    invertColors={true}
                  />
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg"
                onClick={() => setIsGenerateOpen(true)}
              >
                <Calculator className="w-4 h-4" />
              </Button>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Wrench className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Maintenance Spend
                </span>
                <span className="text-2xl font-black text-foreground tracking-tight font-mono leading-none mt-1">
                  ₱ {Number(kpis.maintenanceSpend).toLocaleString()}
                </span>
                <TrendIndicator
                  value={kpis.maintenanceSpendGrowth}
                  invertColors={true}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* LEFT COLUMN: MAIN REGISTRY */}
            <div className="xl:col-span-2 space-y-4">
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[650px]">
                <div className="border-b border-border bg-secondary/30 px-3 pt-2 shrink-0">
                  <Tabs
                    value={activeTab}
                    onValueChange={(v) =>
                      setUrlParams({ tab: v, page: "1", search: null })
                    }
                    className="w-full"
                  >
                    <TabsList className="bg-transparent h-9 p-0 flex gap-4 border-b-0 justify-start w-full">
                      <TabsTrigger
                        value="payouts"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest"
                      >
                        Payout History
                      </TabsTrigger>
                      <TabsTrigger
                        value="operational"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent text-[10px] font-bold uppercase tracking-widest"
                      >
                        Operational Expenses
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <div className="px-4 border-b border-border bg-card shrink-0">
                  <TableToolbar
                    searchPlaceholder={
                      activeTab === "payouts"
                        ? "Search Owner..."
                        : "Search Description..."
                    }
                  />
                </div>

                <div
                  className={cn(
                    "flex-1 bg-background flex flex-col overflow-hidden transition-opacity duration-300",
                    isTableFetching
                      ? "opacity-50 pointer-events-none"
                      : "opacity-100",
                  )}
                >
                  {activeTab === "payouts" ? (
                    <>
                      <div className="grid grid-cols-5 p-2.5 px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 border-b border-border shrink-0">
                        <div>Reference</div>
                        <div>Fleet Owner</div>
                        <div>Billing Period</div>
                        <div>Status</div>
                        <div className="text-right">Net Payout</div>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border">
                        {tableData.map((pay: any) => (
                          <div
                            key={pay.payout_id}
                            className="grid grid-cols-5 p-3 px-4 items-center hover:bg-secondary/30 cursor-pointer transition-colors"
                            onClick={() => setViewPayout(pay)}
                          >
                            <div className="text-[10px] font-bold font-mono truncate">
                              {pay.payout_id.split("-")[0]}...
                            </div>
                            <div className="text-[11px] font-bold truncate">
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
                                  "text-[8px] font-bold h-4 uppercase tracking-widest",
                                  pay.status === "PAID"
                                    ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 border-amber-500/20",
                                )}
                              >
                                {pay.status}
                              </Badge>
                            </div>
                            <div className="text-right text-[11px] font-bold font-mono">
                              ₱ {Number(pay.net_payout).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="grid grid-cols-[1fr_1.5fr_2fr_1fr] p-2.5 px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 border-b border-border shrink-0">
                        <SortableHead label="Date" sortKey="transaction_date" />
                        <div>Category</div>
                        <div>Description</div>
                        <div className="text-right">Amount</div>
                      </div>
                      <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border">
                        {tableData.map((txn: any) => (
                          <div
                            key={txn.transaction_id}
                            className="grid grid-cols-[1fr_1.5fr_2fr_1fr] p-3 px-4 items-center hover:bg-secondary/30 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="text-[10px] font-bold">
                                {format(
                                  new Date(txn.transaction_date),
                                  "MMM dd, yyyy",
                                )}
                              </span>
                              <span className="text-[9px] font-mono text-muted-foreground">
                                {txn.transaction_id.split("-")[0]}
                              </span>
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className="text-[8px] font-bold bg-secondary uppercase tracking-widest"
                              >
                                {txn.category.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <div className="text-[10px] font-medium truncate pr-4 text-muted-foreground">
                              {txn.notes}
                            </div>
                            <div className="text-right text-[11px] font-bold text-destructive font-mono">
                              - ₱ {Number(txn.amount).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                  <div className="shrink-0 border-t border-border">
                    <TablePagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={(p) => setUrlParams({ page: p.toString() })}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTION QUEUE */}
            <div className="flex flex-col h-[650px]">
              <div className="flex items-center justify-between shrink-0 mb-3">
                <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Ready for Settlement
                </h2>
              </div>
              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden transition-colors">
                <div className="bg-secondary/50 border-b border-border px-4 py-2.5 flex justify-between items-center shrink-0">
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
                <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border">
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
                          <span className="text-[11px] font-bold text-amber-600 font-mono">
                            ₱ {Number(owner.est_owed).toLocaleString()}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-[9px] font-bold uppercase tracking-widest"
                          onClick={() => setIsGenerateOpen(owner.owner_id)}
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
