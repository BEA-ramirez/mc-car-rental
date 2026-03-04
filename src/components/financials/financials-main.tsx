"use client";

import React, { useState } from "react";
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  Scale,
  Search,
  Filter,
  Download,
  Loader2,
  ArrowRightLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { useMasterLedger } from "../../../hooks/use-master-ledger";

export default function FinancialsMain() {
  const { data, isLoading } = useMasterLedger();
  const [filter, setFilter] = useState<"ALL" | "INCOME" | "EXPENSE">("ALL");

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-80px)] w-full items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-2 text-slate-400">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-xs font-medium uppercase tracking-widest">
            Loading Master Ledger...
          </span>
        </div>
      </div>
    );
  }

  const kpis = data?.kpis || {
    totalIncome: 0,
    totalExpense: 0,
    netCashFlow: 0,
  };

  // Filter the transactions locally
  const transactions =
    data?.transactions?.filter((t: any) =>
      filter === "ALL" ? true : t.transaction_type === filter,
    ) || [];

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans">
      {/* --- FORMAL HEADER --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <Landmark className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              Master General Ledger
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Complete chronological record of all incoming and outgoing funds.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-bold border-slate-300 text-slate-700 bg-white rounded-sm shadow-sm hover:bg-slate-50"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> Export Ledger (CSV)
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
                  Total Income (MTD)
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ₱ {Number(kpis.totalIncome).toLocaleString()}
                </span>
              </div>
            </div>
            <div className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-rose-50 flex items-center justify-center shrink-0">
                <TrendingDown className="w-4 h-4 text-rose-600" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  Total Expense (MTD)
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ₱ {Number(kpis.totalExpense).toLocaleString()}
                </span>
              </div>
            </div>
            <div
              className={cn(
                "bg-white border p-4 rounded-sm shadow-sm flex items-center gap-4",
                kpis.netCashFlow >= 0
                  ? "border-emerald-200"
                  : "border-rose-200",
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  kpis.netCashFlow >= 0 ? "bg-emerald-100" : "bg-rose-100",
                )}
              >
                <Scale
                  className={cn(
                    "w-4 h-4",
                    kpis.netCashFlow >= 0
                      ? "text-emerald-700"
                      : "text-rose-700",
                  )}
                />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-0.5">
                  Net Cash Flow (MTD)
                </span>
                <span className="text-xl font-bold text-slate-900 tracking-tight">
                  ₱ {Number(kpis.netCashFlow).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* --- MAIN LEDGER TABLE --- */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
            {/* Toolbar */}
            <div className="p-3 border-b border-slate-100 flex gap-2 bg-slate-50/50 justify-between items-center">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 text-xs font-bold rounded-sm shadow-sm",
                    filter === "ALL"
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-white text-slate-600",
                  )}
                  onClick={() => setFilter("ALL")}
                >
                  All Transactions
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 text-xs font-bold rounded-sm shadow-sm",
                    filter === "INCOME"
                      ? "bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-600"
                      : "bg-white text-slate-600",
                  )}
                  onClick={() => setFilter("INCOME")}
                >
                  Income Only
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "h-8 text-xs font-bold rounded-sm shadow-sm",
                    filter === "EXPENSE"
                      ? "bg-rose-600 text-white hover:bg-rose-700 border-rose-600"
                      : "bg-white text-slate-600",
                  )}
                  onClick={() => setFilter("EXPENSE")}
                >
                  Expenses Only
                </Button>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search notes or reference..."
                  className="w-full h-8 pl-8 pr-3 text-xs bg-white border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all font-medium shadow-sm"
                />
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-[1.5fr_1.5fr_1fr_2.5fr_1fr] p-3 px-5 text-[10px] font-semibold text-slate-500 uppercase tracking-widest bg-slate-50">
                <div>Date & Time</div>
                <div>Transaction ID</div>
                <div>Category</div>
                <div>Description / Linked Entity</div>
                <div className="text-right">Amount</div>
              </div>

              {transactions.length === 0 ? (
                <div className="p-12 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                  <ArrowRightLeft className="w-8 h-8 opacity-20" />
                  No transactions match this filter.
                </div>
              ) : (
                transactions.map((txn: any) => (
                  <div
                    key={txn.transaction_id}
                    className="grid grid-cols-[1.5fr_1.5fr_1fr_2.5fr_1fr] p-3 px-5 items-center hover:bg-slate-50 transition-colors"
                  >
                    {/* Col 1: Date */}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-800">
                        {format(new Date(txn.transaction_date), "MMM dd, yyyy")}
                      </span>
                      <span className="text-[10px] font-medium text-slate-500">
                        {format(new Date(txn.transaction_date), "hh:mm a")}
                      </span>
                    </div>

                    {/* Col 2: Ref */}
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 font-mono truncate pr-2">
                        {txn.transaction_id.split("-")[0]}
                      </span>
                      <div className="mt-0.5">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-bold px-1.5 h-4 rounded-sm uppercase tracking-widest",
                            txn.transaction_type === "INCOME"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : "bg-rose-50 text-rose-700 border-rose-200",
                          )}
                        >
                          {txn.transaction_type}
                        </Badge>
                      </div>
                    </div>

                    {/* Col 3: Category */}
                    <div>
                      <span className="text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-1 rounded-sm uppercase tracking-wider">
                        {txn.category.replace("_", " ")}
                      </span>
                    </div>

                    {/* Col 4: Description */}
                    <div className="flex flex-col pr-4">
                      <span className="text-xs font-medium text-slate-700 truncate">
                        {txn.notes || "No description"}
                      </span>
                      {/* Render linked entities if they exist */}
                      {(txn.car || txn.booking) && (
                        <span className="text-[10px] text-slate-400 mt-0.5 truncate">
                          {txn.booking &&
                            `BKG: ${txn.booking.users?.full_name}`}
                          {txn.booking && txn.car && " • "}
                          {txn.car && `CAR: ${txn.car.plate_number}`}
                        </span>
                      )}
                    </div>

                    {/* Col 5: Amount */}
                    <div
                      className={cn(
                        "text-right text-xs font-bold",
                        txn.transaction_type === "INCOME"
                          ? "text-emerald-700"
                          : "text-slate-900",
                      )}
                    >
                      {txn.transaction_type === "INCOME" ? "+" : "-"} ₱{" "}
                      {Number(txn.amount).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
