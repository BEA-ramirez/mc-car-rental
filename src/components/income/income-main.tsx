"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  HandCoins,
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

import { TableToolbar } from "../table/table-toolbar";
import { SortableHead } from "../table/sortable-header";
import { TablePagination } from "../table-pagination";
import { useUrlParams } from "../../../hooks/use-url-params";

import BookingIncomeBreakdownModal from "./booking-income-breakdown";
import LogIncomeModal from "./log-income-modal";
import { useIncomeWidgets, useIncomeTable } from "../../../hooks/use-incomes";

const TrendIndicator = ({
  value,
  invertColors = false,
}: {
  value: number;
  invertColors?: boolean;
}) => {
  if (!value || value === 0) {
    return (
      <span className="text-[10px] text-muted-foreground font-medium mt-1">
        0% from last month
      </span>
    );
  }
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
        from last month
      </span>
    </div>
  );
};

export default function IncomesMain() {
  const searchParams = useSearchParams();
  const { setUrlParams } = useUrlParams();

  const activeTab = searchParams.get("tab") || "booking_income";
  const currentPage = Number(searchParams.get("page")) || 1;

  const { data: widgetData, isLoading: isWidgetsLoading } = useIncomeWidgets();

  const { data: tablePayload, isFetching: isTableFetching } = useIncomeTable({
    tab: activeTab,
    page: currentPage,
    search: searchParams.get("search") || "",
    sort: searchParams.get("sort") || "",
    method: searchParams.get("method") || "",
  });

  const [folioConfig, setFolioConfig] = useState<{
    id: string;
    action: "none" | "payment" | "charge" | "refund";
  } | null>(null);
  const [isLogIncomeOpen, setIsLogIncomeOpen] = useState(false);

  if (isWidgetsLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background transition-colors">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Loading Revenue Data...
          </span>
        </div>
      </div>
    );
  }

  const kpis = widgetData?.kpis || {
    grossRevenue: 0,
    grossRevenueGrowth: 0,
    outstandingReceivables: 0,
    outstandingReceivablesGrowth: 0,
    ancillaryIncome: 0,
    ancillaryIncomeGrowth: 0,
  };
  const awaitingPayment = widgetData?.awaitingPayment || [];

  const tableData = tablePayload?.tableData || [];
  const totalPages = tablePayload?.totalPages || 1;

  const recentPayments = activeTab === "booking_income" ? tableData : [];
  const deposits = activeTab === "security_deposits" ? tableData : [];
  const miscIncome = activeTab === "misc_income" ? tableData : [];

  const handleTabChange = (val: string) => {
    setUrlParams({
      tab: val,
      page: "1",
      search: null,
      sort: null,
      method: null,
    });
  };

  return (
    <div className="flex flex-col h-full bg-background font-sans transition-colors duration-300">
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto pt-0 p-4 md:p-5 space-y-5">
          {/* --- KPI PULSE CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start gap-4 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Gross Revenue (This Month)
                </span>
                <span className="text-2xl font-black text-foreground tracking-tight font-mono leading-none mt-1">
                  ₱ {Number(kpis.grossRevenue).toLocaleString()}
                </span>
                <TrendIndicator value={kpis.grossRevenueGrowth} />
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start gap-4 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              </div>
              <div className="flex flex-col flex-1">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Outstanding Receivables
                </span>
                <span className="text-2xl font-black text-foreground tracking-tight font-mono leading-none mt-1">
                  ₱ {Number(kpis.outstandingReceivables).toLocaleString()}
                </span>
                <TrendIndicator
                  value={kpis.outstandingReceivablesGrowth}
                  invertColors={true}
                />
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-start justify-between transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 transition-colors mt-0.5">
                  <HandCoins className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Ancillary Income (This Month)
                  </span>
                  <span className="text-2xl font-black text-foreground tracking-tight font-mono leading-none mt-1">
                    ₱ {Number(kpis.ancillaryIncome).toLocaleString()}
                  </span>
                  <TrendIndicator value={kpis.ancillaryIncomeGrowth} />
                </div>
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-secondary shadow-none transition-colors"
                onClick={() => setIsLogIncomeOpen(true)}
                title="Log Misc Income"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
            {/* LEFT COLUMN: MAIN REGISTRY */}
            <div className="xl:col-span-2 space-y-4">
              {/* NOTE THE HEIGHT FIX HERE: h-[650px] locks the card size */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[650px] transition-colors">
                {/* 1. TABS HEADER (Shrinks to fit) */}
                <div className="border-b border-border bg-secondary/30 px-3 pt-2 flex items-center justify-between shrink-0 transition-colors">
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="bg-transparent h-9 p-0 flex gap-4 border-b-0 justify-start w-full">
                      <TabsTrigger
                        value="booking_income"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all"
                      >
                        Recent Payments
                      </TabsTrigger>
                      <TabsTrigger
                        value="security_deposits"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all"
                      >
                        Security Deposits
                      </TabsTrigger>
                      <TabsTrigger
                        value="misc_income"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all"
                      >
                        Misc. Income
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* 2. DYNAMIC TOOLBAR (Shrinks to fit) */}
                <div className="px-4 border-b border-border bg-card shrink-0 transition-colors">
                  {activeTab === "booking_income" && (
                    <TableToolbar
                      searchPlaceholder="Search Booking ID or Payment ID..."
                      filterKey="method"
                      filterOptions={[
                        { label: "GCash", value: "GCash" },
                        { label: "Cash", value: "Cash" },
                        { label: "Bank Transfer", value: "Bank Transfer" },
                      ]}
                    />
                  )}
                  {activeTab === "security_deposits" && (
                    <TableToolbar searchPlaceholder="Search Customer or Booking ID..." />
                  )}
                  {activeTab === "misc_income" && (
                    <TableToolbar searchPlaceholder="Search Description..." />
                  )}
                </div>

                {/* 3. TABLE VIEW (Fills remaining space securely) */}
                <div
                  className={cn(
                    "flex-1 bg-background flex flex-col overflow-hidden transition-opacity duration-300",
                    isTableFetching
                      ? "opacity-50 pointer-events-none"
                      : "opacity-100",
                  )}
                >
                  {/* TAB 1: BOOKING INCOME */}
                  {activeTab === "booking_income" && (
                    <>
                      {/* Fixed Header Row */}
                      <div className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] p-2.5 px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 border-b border-border shrink-0 transition-colors">
                        <SortableHead label="Transaction" sortKey="paid_at" />
                        <div>Customer / Ref</div>
                        <SortableHead label="Status" sortKey="status" />
                        <div>Method</div>
                        <SortableHead
                          label="Amount"
                          sortKey="amount"
                          className="text-right justify-end"
                        />
                      </div>

                      {/* Scrollable Data Rows */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-border">
                          {recentPayments.map((inc: any) => (
                            <div
                              key={inc.payment_id}
                              className="grid grid-cols-[1.5fr_2fr_1.5fr_1fr_1fr] p-3 px-4 items-center hover:bg-secondary/30 cursor-pointer transition-colors group"
                              onClick={() =>
                                setFolioConfig({
                                  id: inc.bookings?.booking_id,
                                  action: "none",
                                })
                              }
                            >
                              <div className="flex flex-col pr-2">
                                <span className="text-[10px] font-bold text-foreground font-mono group-hover:text-primary transition-colors truncate">
                                  {inc.payment_id.split("-")[0]}...
                                </span>
                                <span className="text-[9px] font-medium text-muted-foreground mt-0.5 uppercase tracking-widest">
                                  {format(
                                    new Date(inc.paid_at),
                                    "MMM dd, yyyy",
                                  )}
                                </span>
                              </div>
                              <div className="flex flex-col pr-2">
                                <span className="text-[11px] font-bold text-foreground truncate">
                                  {inc.bookings?.users?.full_name}
                                </span>
                                <span className="text-[9px] font-medium text-muted-foreground font-mono mt-0.5 truncate uppercase tracking-widest">
                                  {inc.bookings?.booking_id.split("-")[0]}
                                </span>
                              </div>
                              <div>
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[8px] font-bold px-1.5 py-0 h-4 rounded uppercase tracking-widest",
                                    inc.status === "COMPLETED"
                                      ? "text-emerald-600 bg-emerald-500/10 border-emerald-500/20"
                                      : "text-destructive bg-destructive/10 border-destructive/20",
                                  )}
                                >
                                  {inc.status}
                                </Badge>
                              </div>
                              <div>
                                <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1.5">
                                  {inc.payment_method === "Cash" ? (
                                    <Banknote className="w-3 h-3" />
                                  ) : (
                                    <CreditCard className="w-3 h-3" />
                                  )}
                                  {inc.payment_method}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  "text-right text-[11px] font-bold font-mono",
                                  inc.amount < 0
                                    ? "text-indigo-600"
                                    : "text-emerald-600 dark:text-emerald-400",
                                )}
                              >
                                {inc.amount < 0 ? "- ₱ " : "+ ₱ "}{" "}
                                {Math.abs(Number(inc.amount)).toLocaleString()}
                              </div>
                            </div>
                          ))}

                          {recentPayments.length === 0 && (
                            <div className="p-8 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                              No recent payments found.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pagination Pinned to Bottom */}
                      <div className="shrink-0 border-t border-border">
                        <TablePagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={(page) =>
                            setUrlParams({ page: page.toString() })
                          }
                        />
                      </div>
                    </>
                  )}

                  {/* TAB 2: SECURITY DEPOSITS */}
                  {activeTab === "security_deposits" && (
                    <>
                      {/* Fixed Header Row */}
                      <div className="grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr] p-2.5 px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 border-b border-border shrink-0 transition-colors">
                        <SortableHead label="Start Date" sortKey="start_date" />
                        <div>Customer / Ref</div>
                        <SortableHead
                          label="Booking Status"
                          sortKey="booking_status"
                        />
                        <div>Deposit Status</div>
                        <SortableHead
                          label="Amount"
                          sortKey="security_deposit"
                          className="text-right justify-end"
                        />
                      </div>

                      {/* Scrollable Data Rows */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-border">
                          {deposits.map((dep: any) => {
                            const refundCharges =
                              dep.booking_charges?.filter(
                                (c: any) => c.category === "DEPOSIT_REFUND",
                              ) || [];
                            const totalRefunded = Math.abs(
                              refundCharges.reduce(
                                (sum: number, c: any) => sum + Number(c.amount),
                                0,
                              ),
                            );

                            let depositStatus = "Held";
                            let statusColor =
                              "bg-secondary text-muted-foreground border-border";

                            if (totalRefunded >= Number(dep.security_deposit)) {
                              depositStatus = "Refunded";
                              statusColor =
                                "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
                            } else if (totalRefunded > 0) {
                              depositStatus = "Partially Refunded";
                              statusColor =
                                "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20";
                            } else if (dep.booking_status === "COMPLETED") {
                              depositStatus = "Pending Action";
                              statusColor =
                                "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
                            }

                            return (
                              <div
                                key={dep.booking_id}
                                className="grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr] p-3 px-4 items-center hover:bg-secondary/30 cursor-pointer transition-colors group"
                                onClick={() =>
                                  setFolioConfig({
                                    id: dep.booking_id,
                                    action: "none",
                                  })
                                }
                              >
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold text-foreground group-hover:text-primary transition-colors">
                                    {format(
                                      new Date(dep.start_date),
                                      "MMM dd, yyyy",
                                    )}
                                  </span>
                                </div>
                                <div className="flex flex-col pr-4">
                                  <span className="text-[11px] font-bold text-foreground truncate">
                                    {dep.users?.full_name}
                                  </span>
                                  <span className="text-[9px] font-medium text-muted-foreground mt-0.5 font-mono uppercase tracking-widest truncate">
                                    {dep.booking_id.split("-")[0]}
                                  </span>
                                </div>
                                <div>
                                  <Badge
                                    variant="outline"
                                    className="text-[8px] font-bold h-4 px-1.5 rounded uppercase tracking-widest bg-secondary text-muted-foreground border-border"
                                  >
                                    {dep.booking_status}
                                  </Badge>
                                </div>
                                <div>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[8px] font-bold h-4 px-1.5 rounded uppercase tracking-widest",
                                      statusColor,
                                    )}
                                  >
                                    {depositStatus}
                                  </Badge>
                                </div>
                                <div className="text-right text-[11px] font-bold text-foreground font-mono">
                                  ₱{" "}
                                  {Number(
                                    dep.security_deposit,
                                  ).toLocaleString()}
                                </div>
                              </div>
                            );
                          })}

                          {deposits.length === 0 && (
                            <div className="p-8 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                              No security deposits found.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pagination Pinned to Bottom */}
                      <div className="shrink-0 border-t border-border">
                        <TablePagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={(page) =>
                            setUrlParams({ page: page.toString() })
                          }
                        />
                      </div>
                    </>
                  )}

                  {/* TAB 3: MISC INCOME */}
                  {activeTab === "misc_income" && (
                    <>
                      {/* Fixed Header Row */}
                      <div className="grid grid-cols-[1fr_1fr_2fr_1fr] p-2.5 px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 border-b border-border shrink-0 transition-colors">
                        <SortableHead label="Date" sortKey="transaction_date" />
                        <SortableHead label="Category" sortKey="category" />
                        <div>Description</div>
                        <SortableHead
                          label="Amount"
                          sortKey="amount"
                          className="text-right justify-end"
                        />
                      </div>

                      {/* Scrollable Data Rows */}
                      <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <div className="divide-y divide-border">
                          {miscIncome.map((txn: any) => (
                            <div
                              key={txn.transaction_id}
                              className="grid grid-cols-[1fr_1fr_2fr_1fr] p-3 px-4 items-center hover:bg-secondary/30 transition-colors"
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
                                  {txn.category.replace(/_/g, " ")}
                                </Badge>
                              </div>
                              <div className="text-[10px] font-medium text-muted-foreground truncate pr-4">
                                {txn.notes || "-"}
                              </div>
                              <div className="text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                + ₱ {Number(txn.amount).toLocaleString()}
                              </div>
                            </div>
                          ))}

                          {miscIncome.length === 0 && (
                            <div className="p-10 flex flex-col items-center justify-center text-muted-foreground space-y-2">
                              <Banknote className="w-8 h-8 opacity-20" />
                              <span className="text-[10px] font-medium uppercase tracking-widest">
                                No miscellaneous income records.
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Pagination Pinned to Bottom */}
                      <div className="shrink-0 border-t border-border">
                        <TablePagination
                          currentPage={currentPage}
                          totalPages={totalPages}
                          onPageChange={(page) =>
                            setUrlParams({ page: page.toString() })
                          }
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: ACTION QUEUE (Collections) */}
            {/* 1. Added h-[650px] and flex-col to perfectly match the left column's height */}
            <div className="flex flex-col h-[650px]">
              {/* Optional Header (If you want the cards to align perfectly at the top, you can remove this div, but we will keep it and let flex-1 handle the math) */}
              <div className="flex items-center justify-between shrink-0 mb-3">
                <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Awaiting Payment
                </h2>
              </div>

              {/* 2. Added flex-1 to stretch the card to the bottom of the 650px container */}
              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col flex-1 overflow-hidden transition-colors">
                {/* Card Header (Shrinks to fit) */}
                <div className="bg-secondary/50 border-b border-border px-4 py-2.5 flex justify-between items-center shrink-0 transition-colors">
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Collection Queue
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-primary/10 text-primary border-primary/20 text-[9px] px-1.5 h-4 rounded uppercase tracking-widest font-bold"
                  >
                    {awaitingPayment.length} Action(s)
                  </Badge>
                </div>

                {/* 3. The Scrollable List Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <div className="divide-y divide-border">
                    {awaitingPayment.map((bkg: any) => (
                      <div
                        key={bkg.id}
                        className={cn(
                          "p-3 flex flex-col gap-2 hover:bg-secondary/30 transition-colors",
                          bkg.is_overdue ? "bg-destructive/5" : "",
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                              <span className="text-[11px] font-bold text-foreground">
                                {bkg.customer}
                              </span>
                              {bkg.is_overdue && (
                                <Badge
                                  variant="outline"
                                  className="h-4 px-1 text-[8px] uppercase tracking-widest text-destructive border-destructive/20 bg-destructive/10 font-bold"
                                >
                                  Overdue
                                </Badge>
                              )}
                            </div>
                            <span className="text-[9px] font-medium text-muted-foreground mt-0.5 uppercase tracking-widest">
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
                            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                              Balance Due
                            </span>
                            <span
                              className={cn(
                                "text-[11px] font-bold font-mono",
                                bkg.is_overdue
                                  ? "text-destructive"
                                  : "text-amber-600 dark:text-amber-400",
                              )}
                            >
                              ₱ {Number(bkg.due).toLocaleString()}
                            </span>
                          </div>
                          <div className="flex gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-lg border-border bg-card text-muted-foreground hover:text-foreground hover:bg-secondary shadow-none transition-colors"
                              onClick={() =>
                                setFolioConfig({ id: bkg.id, action: "none" })
                              }
                              title="View Folio"
                            >
                              <Receipt className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 text-[9px] font-bold uppercase tracking-widest border-border bg-card rounded-lg text-foreground hover:bg-secondary shadow-none transition-colors"
                              onClick={() =>
                                setFolioConfig({
                                  id: bkg.id,
                                  action: "payment",
                                })
                              }
                            >
                              Collect{" "}
                              <ChevronRight className="w-3 h-3 ml-1 text-muted-foreground" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {awaitingPayment.length === 0 && (
                      <div className="p-6 text-center text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                        No outstanding balances.
                      </div>
                    )}
                  </div>
                </div>
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
