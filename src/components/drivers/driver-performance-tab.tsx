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
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-card border border-border rounded-xl transition-colors">
        <Loader2 className="w-6 h-6 animate-spin text-primary mb-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Loading Performance Data...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center p-6 text-center bg-destructive/5 border border-destructive/20 rounded-xl transition-colors min-h-[200px]">
        <span className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-1">
          Error Loading Data
        </span>
        <span className="text-[11px] font-medium text-destructive/80">
          Failed to load performance data. Please try again.
        </span>
      </div>
    );
  }

  const { kpis, ledger } = data;

  return (
    <div className="space-y-4">
      {/* TOP KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Rating Card */}
        <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm flex flex-col justify-between transition-colors hover:border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 shrink-0">
              <Star className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Driver Rating
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground font-mono leading-none">
              {Number(kpis.driver_rating).toFixed(1)}
            </span>
            <span className="text-[10px] font-bold text-muted-foreground">
              / 5.0
            </span>
          </div>
        </div>

        {/* Total Trips Card */}
        <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm flex flex-col justify-between transition-colors hover:border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-blue-500/10 p-1.5 rounded-lg border border-blue-500/20 shrink-0">
              <Car className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Total Trips
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-foreground font-mono leading-none">
              {kpis.total_trips.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Completion Rate Card */}
        <div className="bg-card border border-border p-3.5 rounded-xl shadow-sm flex flex-col justify-between transition-colors hover:border-primary/30">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20 shrink-0">
              <Activity className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Completion Rate
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400 font-mono leading-none">
              {kpis.completion_rate}%
            </span>
          </div>
        </div>

        {/* Wallet Balance Card (Theme Primary) */}
        <div className="bg-primary border border-primary p-3.5 rounded-xl shadow-md flex flex-col justify-between text-primary-foreground transition-all hover:opacity-95">
          <div className="flex items-center gap-2 mb-3">
            <div className="bg-background/20 p-1.5 rounded-lg shrink-0">
              <Wallet className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-[9px] font-bold text-primary-foreground/80 uppercase tracking-widest leading-none">
              Wallet Balance
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-primary-foreground font-mono leading-none tracking-tight">
              <span className="text-primary-foreground/70 mr-1 text-lg">₱</span>
              {Number(kpis.wallet_balance).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* RECENT WALLET LEDGER */}
      <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-[320px] transition-colors">
        <div className="p-3 border-b border-border bg-secondary/30 shrink-0 transition-colors flex items-center justify-between">
          <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            Recent Wallet Ledger
          </h3>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-secondary px-2 py-0.5 rounded border border-border">
            {ledger.length} TXNS
          </span>
        </div>

        <ScrollArea className="flex-1 custom-scrollbar">
          {ledger.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[200px] text-center px-4">
              <Wallet className="w-8 h-8 text-muted-foreground/30 mb-2" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                No transactions recorded.
              </span>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-border">
              {ledger.map((txn: any) => {
                const isPositive = Number(txn.amount) > 0;
                return (
                  <div
                    key={txn.transaction_id}
                    className="p-3 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border",
                          isPositive
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-destructive/10 text-destructive border-destructive/20",
                        )}
                      >
                        {isPositive ? (
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        ) : (
                          <ArrowDownRight className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <div className="flex flex-col">
                        <p className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-none mb-1">
                          {txn.category.replace(/_/g, " ")}
                        </p>
                        <p className="text-[9px] text-muted-foreground font-mono leading-none">
                          {txn.transaction_id.substring(0, 8)}{" "}
                          <span className="mx-1">•</span>{" "}
                          {format(
                            new Date(txn.transaction_date),
                            "MMM dd, yyyy",
                          )}
                        </p>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "text-[11px] font-black font-mono tracking-wider",
                        isPositive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-destructive",
                      )}
                    >
                      {isPositive ? "+" : "-"}₱{" "}
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
