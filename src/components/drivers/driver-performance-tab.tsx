"use client";

import React from "react";
import {
  Star,
  Wallet,
  Activity,
  Car,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useDriverPerformance } from "../../../hooks/use-drivers";

interface DriverPerformanceTabProps {
  driverId: string;
}

export default function DriverPerformanceTab({
  driverId,
}: DriverPerformanceTabProps) {
  const { data, isLoading, error } = useDriverPerformance(driverId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-50 border border-slate-200 rounded-sm">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-4" />
        <span className="text-sm font-medium text-slate-500">
          Loading Performance Data...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 text-center text-sm font-medium text-red-500 border border-red-100 bg-red-50 rounded-sm">
        Failed to load performance data. Please try again.
      </div>
    );
  }

  const { kpis, ledger } = data;

  return (
    <div className="space-y-4">
      {/* TOP KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rating Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" /> Driver Rating
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-900 leading-none">
              {Number(kpis.driver_rating).toFixed(1)}
            </span>
            <span className="text-[10px] text-slate-400 mb-1">/ 5.0</span>
          </div>
        </div>

        {/* Total Trips Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Car className="w-3.5 h-3.5" /> Total Trips
          </span>
          <span className="text-3xl font-black text-slate-900 leading-none">
            {kpis.total_trips.toLocaleString()}
          </span>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Completion Rate
          </span>
          <span className="text-3xl font-black text-emerald-600 leading-none">
            {kpis.completion_rate}%
          </span>
        </div>

        {/* Wallet Balance Card (Original Dark Style) */}
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-sm shadow-sm flex flex-col justify-between text-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" /> Wallet Balance
          </span>
          <span className="text-3xl font-black text-white font-mono leading-none">
            ₱ {Number(kpis.wallet_balance).toLocaleString()}
          </span>
        </div>
      </div>

      {/* RECENT WALLET LEDGER */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-[350px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Recent Wallet Ledger
          </h3>
        </div>
        <ScrollArea className="flex-1">
          {ledger.length === 0 ? (
            <div className="flex items-center justify-center h-full text-sm font-medium text-slate-400 p-8">
              No transactions recorded.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {ledger.map((txn: any) => {
                const isPositive = Number(txn.amount) > 0;
                return (
                  <div
                    key={txn.transaction_id}
                    className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center",
                          isPositive
                            ? "bg-emerald-50 text-emerald-600"
                            : "bg-red-50 text-red-600",
                        )}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                          {txn.category.replace(/_/g, " ")}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          {txn.transaction_id.substring(0, 8)} •{" "}
                          {format(
                            new Date(txn.transaction_date),
                            "MMM dd, yyyy",
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-sm font-bold font-mono",
                        isPositive ? "text-emerald-600" : "text-red-600",
                      )}
                    >
                      {isPositive ? "+" : ""}₱{" "}
                      {Math.abs(txn.amount).toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
