"use client";

import React, { useState } from "react";
import RevenueLineChart from "../charts/LineChart"; // Your Recharts wrapper
import { Loader2 } from "lucide-react";
import { usePartnerRevenueChart } from "../../../hooks/use-fleetPartners"; // Adjust path
import { cn } from "@/lib/utils";

// Define a type for the data structure returned by the RPC
export type RevenueChartDataPoint = {
  month_name: string;
  month_date: string;
  revenue: number;
  net_payout: number;
};

interface PartnerRevenueChartProps {
  ownerId: string;
}

export default function PartnerRevenueChart({
  ownerId,
}: PartnerRevenueChartProps) {
  // State for the timeframe filter
  const [monthsBack, setMonthsBack] = useState<number>(6);

  // Use the new hook
  const { data: chartData, isLoading } = usePartnerRevenueChart(
    ownerId,
    monthsBack,
  );

  return (
    <div className="flex flex-col h-full w-full transition-colors duration-300">
      <div className="flex items-center justify-between mb-4 shrink-0 transition-colors">
        <div>
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-none">
            Revenue Trend
          </h3>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5">
            Past {monthsBack} Months Performance
          </p>
        </div>

        {/* Simplified Action Button - Wired to state */}
        <div className="flex gap-1.5">
          <button
            onClick={() => setMonthsBack(6)}
            className={cn(
              "h-7 px-3 border rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center transition-colors shadow-none",
              monthsBack === 6
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            6M
          </button>
          <button
            onClick={() => setMonthsBack(12)}
            className={cn(
              "h-7 px-3 border rounded-lg text-[9px] font-bold uppercase tracking-widest flex items-center transition-colors shadow-none",
              monthsBack === 12
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            1Y
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 transition-colors">
            <Loader2 className="w-5 h-5 animate-spin text-primary mb-2" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Loading Data...
            </span>
          </div>
        ) : !chartData || chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/30 rounded-xl border border-dashed border-border z-10 transition-colors">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              No Revenue Data Available
            </span>
          </div>
        ) : (
          <RevenueLineChart data={chartData} />
        )}
      </div>
    </div>
  );
}
