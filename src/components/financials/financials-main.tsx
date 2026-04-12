"use client";

import React from "react";
import { useSearchParams } from "next/navigation";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Download,
  Loader2,
  ArrowRightLeft,
  CalendarDays,
} from "lucide-react";
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
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { TableToolbar } from "../table/table-toolbar";
import { SortableHead } from "../table/sortable-header";
import { TablePagination } from "../table-pagination";
import { useUrlParams } from "../../../hooks/use-url-params";
import {
  useMasterLedgerWidgets,
  useMasterLedgerTable,
} from "../../../hooks/use-master-ledger";

export default function FinancialsMain() {
  const searchParams = useSearchParams();
  const { setUrlParams } = useUrlParams();

  // Read state directly from the URL
  const currentPage = Number(searchParams.get("page")) || 1;
  const currentSearch = searchParams.get("search") || "";
  const currentType = searchParams.get("type") || "ALL";
  const currentPeriod = searchParams.get("period") || "ALL";

  const { data: kpis, isLoading: isWidgetsLoading } = useMasterLedgerWidgets();
  const { data: tablePayload, isFetching: isTableFetching } =
    useMasterLedgerTable({
      page: currentPage,
      search: currentSearch,
      type: currentType,
      period: currentPeriod,
    });

  if (isWidgetsLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-background transition-colors">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            Loading Master Ledger...
          </span>
        </div>
      </div>
    );
  }

  const transactions = tablePayload?.transactions || [];
  const totalPages = tablePayload?.totalPages || 1;

  // Safe fallback for KPIs
  const safeKpis = kpis || { totalIncome: 0, totalExpense: 0, netCashFlow: 0 };

  return (
    <div className="flex flex-col h-full bg-background font-sans transition-colors duration-300">
      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-4 md:p-5 space-y-5">
          {/* --- KPI PULSE CARDS --- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 transition-colors">
                <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Total Income (MTD)
                </span>
                <span className="text-xl font-black text-foreground tracking-tight font-mono">
                  ₱ {Number(safeKpis.totalIncome).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex items-center gap-4 transition-colors">
              <div className="w-10 h-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center shrink-0 transition-colors">
                <TrendingDown className="w-4 h-4 text-destructive" />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                  Total Expense (MTD)
                </span>
                <span className="text-xl font-black text-foreground tracking-tight font-mono">
                  ₱ {Number(safeKpis.totalExpense).toLocaleString()}
                </span>
              </div>
            </div>

            <div
              className={cn(
                "bg-card border p-4 rounded-xl shadow-sm flex items-center justify-between transition-colors",
                safeKpis.netCashFlow >= 0
                  ? "border-emerald-500/20"
                  : "border-destructive/20",
              )}
            >
              <div className="flex items-center gap-4">
                <div
                  className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors border",
                    safeKpis.netCashFlow >= 0
                      ? "bg-emerald-500/10 border-emerald-500/20"
                      : "bg-destructive/10 border-destructive/20",
                  )}
                >
                  <Scale
                    className={cn(
                      "w-4 h-4",
                      safeKpis.netCashFlow >= 0
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-destructive",
                    )}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                    Net Cash Flow
                  </span>
                  <span className="text-xl font-black text-foreground tracking-tight font-mono">
                    ₱ {Number(safeKpis.netCashFlow).toLocaleString()}
                  </span>
                </div>
              </div>
              <Button
                size="icon"
                variant="outline"
                className="h-8 w-8 rounded-lg border-border text-muted-foreground hover:text-foreground hover:bg-secondary shadow-none transition-colors"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* --- MAIN LEDGER TABLE --- */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[700px] transition-colors">
            {/* Custom Toolbar with Type and Period Filters */}
            <div className="p-3 border-b border-border flex flex-col md:flex-row gap-3 bg-secondary/30 justify-between items-center transition-colors shrink-0">
              {/* Type Filters */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-none px-4 transition-all",
                    currentType === "ALL"
                      ? "bg-foreground text-background hover:opacity-90 border-foreground"
                      : "bg-background text-muted-foreground border-border hover:bg-secondary",
                  )}
                  onClick={() => setUrlParams({ type: "ALL", page: "1" })}
                >
                  All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-none px-4 transition-all",
                    currentType === "INCOME"
                      ? "bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700"
                      : "bg-background text-muted-foreground border-border hover:bg-secondary",
                  )}
                  onClick={() => setUrlParams({ type: "INCOME", page: "1" })}
                >
                  Incomes
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-none px-4 transition-all",
                    currentType === "EXPENSE"
                      ? "bg-destructive text-white border-destructive hover:opacity-90"
                      : "bg-background text-muted-foreground border-border hover:bg-secondary",
                  )}
                  onClick={() => setUrlParams({ type: "EXPENSE", page: "1" })}
                >
                  Expenses
                </Button>
              </div>

              {/* Time Period & Search */}
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Select
                  value={currentPeriod}
                  onValueChange={(val) =>
                    setUrlParams({ period: val, page: "1" })
                  }
                >
                  <SelectTrigger className="h-8 w-[140px] text-[11px] font-bold text-foreground bg-background border-border shadow-none rounded-lg transition-colors">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                      <SelectValue placeholder="Period" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                    <SelectItem value="ALL" className="text-[11px] font-medium">
                      All Time
                    </SelectItem>
                    <SelectItem
                      value="TODAY"
                      className="text-[11px] font-medium"
                    >
                      Today
                    </SelectItem>
                    <SelectItem
                      value="MONTH"
                      className="text-[11px] font-medium"
                    >
                      This Month
                    </SelectItem>
                    <SelectItem
                      value="3MONTHS"
                      className="text-[11px] font-medium"
                    >
                      Last 3 Months
                    </SelectItem>
                  </SelectContent>
                </Select>

                {/* You can inject your standard TableToolbar here if it accepts no padding, 
                    or just keep this custom search input since it sits nicely next to the select */}
                <TableToolbar searchPlaceholder="Search notes or category..." />
              </div>
            </div>

            {/* Table Header */}
            <div className="grid grid-cols-[1.5fr_1.5fr_1fr_2.5fr_1fr] p-2.5 px-4 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 border-b border-border shrink-0 transition-colors">
              <SortableHead label="Date & Time" sortKey="transaction_date" />
              <div>Reference ID</div>
              <div>Category</div>
              <div>Description</div>
              <div className="text-right">Amount</div>
            </div>

            {/* Table Body (Scrollable) */}
            <div
              className={cn(
                "flex-1 overflow-y-auto custom-scrollbar bg-background transition-opacity duration-300",
                isTableFetching
                  ? "opacity-50 pointer-events-none"
                  : "opacity-100",
              )}
            >
              <div className="divide-y divide-border">
                {transactions.length === 0 ? (
                  <div className="p-12 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex flex-col items-center gap-2">
                    <ArrowRightLeft className="w-8 h-8 opacity-20" />
                    No ledger entries found
                  </div>
                ) : (
                  transactions.map((txn: any, index: number) => (
                    <div
                      key={txn.transaction_id || `txn-${index}`}
                      className="grid grid-cols-[1.5fr_1.5fr_1fr_2.5fr_1fr] p-2.5 px-4 items-center hover:bg-secondary/30 transition-colors"
                    >
                      {/* Col 1: Date */}
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground">
                          {txn.transaction_date
                            ? format(
                                new Date(txn.transaction_date),
                                "MMM dd, yyyy",
                              )
                            : "N/A"}
                        </span>
                        <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                          {txn.transaction_date
                            ? format(new Date(txn.transaction_date), "hh:mm a")
                            : ""}
                        </span>
                      </div>

                      {/* Col 2: Ref */}
                      <div className="flex flex-col overflow-hidden pr-2">
                        <span className="text-[10px] font-bold text-foreground font-mono truncate">
                          {txn.transaction_id
                            ? txn.transaction_id.split("-")[0]
                            : "MANUAL"}
                          ...
                        </span>
                        <div className="mt-0.5">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[8px] font-bold px-1.5 h-4 rounded uppercase tracking-widest border transition-colors",
                              txn.transaction_type === "INCOME"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                : "bg-destructive/10 text-destructive border-destructive/20",
                            )}
                          >
                            {txn.transaction_type || "UNKNOWN"}
                          </Badge>
                        </div>
                      </div>

                      {/* Col 3: Category */}
                      <div>
                        <Badge
                          variant="outline"
                          className="text-[8px] font-bold bg-secondary text-muted-foreground border-border px-1.5 py-0 h-4 rounded uppercase tracking-widest"
                        >
                          {txn.category
                            ? txn.category.replace(/_/g, " ")
                            : "MISC"}
                        </Badge>
                      </div>

                      {/* Col 4: Description */}
                      <div className="flex flex-col pr-4 overflow-hidden">
                        <span className="text-[11px] font-medium text-foreground truncate">
                          {txn.notes || "---"}
                        </span>
                        {(txn.car || txn.booking) && (
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest truncate mt-0.5">
                            {txn.booking &&
                              `BKG: ${txn.booking.users?.full_name}`}
                            {txn.booking && txn.car && " • "}
                            {txn.car && `PLATE: ${txn.car.plate_number}`}
                          </span>
                        )}
                      </div>

                      {/* Col 5: Amount */}
                      <div
                        className={cn(
                          "text-right text-[11px] font-bold font-mono transition-colors",
                          txn.transaction_type === "INCOME"
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-foreground",
                        )}
                      >
                        {txn.transaction_type === "INCOME" ? "+" : "-"} ₱{" "}
                        {Number(txn.amount || 0).toLocaleString()}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Table Footer / Pagination */}
            <div className="shrink-0 border-t border-border bg-card">
              <TablePagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(p) => setUrlParams({ page: p.toString() })}
              />
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
