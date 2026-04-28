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
    <div className="flex flex-col h-full w-full transition-colors duration-300 relative">
      {/* Time Filter Buttons - Floating Top Right */}
      <div className="absolute -top-11 right-0 flex gap-1.5 z-10">
        <button
          onClick={() => setMonthsBack(6)}
          className={cn(
            "h-7 px-3 border rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center transition-colors shadow-sm",
            monthsBack === 6
              ? "bg-foreground text-background border-foreground"
              : "bg-background border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          6M
        </button>
        <button
          onClick={() => setMonthsBack(12)}
          className={cn(
            "h-7 px-3 border rounded-md text-[9px] font-bold uppercase tracking-widest flex items-center transition-colors shadow-sm",
            monthsBack === 12
              ? "bg-foreground text-background border-foreground"
              : "bg-background border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
          )}
        >
          1Y
        </button>
      </div>

      {/* Chart Area */}
      <div className="flex-1 w-full relative mt-2">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 transition-colors rounded-lg">
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
          <div className="absolute inset-0">
            <RevenueLineChart data={chartData} />
          </div>
        )}
      </div>
    </div>
  );
}
