"use client";

import React, { useState } from "react";
import RevenueLineChart from "../charts/LineChart"; // Your Recharts wrapper
import { ChevronDown, Loader2 } from "lucide-react";
import { usePartnerRevenueChart } from "../../../hooks/use-fleetPartners"; // Adjust path

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
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xs font-bold text-[#0F172A] uppercase tracking-widest leading-none">
            Revenue Trend
          </h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1.5">
            Past {monthsBack} Months Performance
          </p>
        </div>

        {/* Simplified Action Button - Hardcoded for demo, but you could wire this to state */}
        <div className="flex gap-2">
          <button
            onClick={() => setMonthsBack(6)}
            className={`h-7 px-3 border rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center transition-colors shadow-none ${monthsBack === 6 ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            6M
          </button>
          <button
            onClick={() => setMonthsBack(12)}
            className={`h-7 px-3 border rounded-sm text-[10px] font-bold uppercase tracking-widest flex items-center transition-colors shadow-none ${monthsBack === 12 ? "bg-[#0F172A] text-white border-[#0F172A]" : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"}`}
          >
            1Y
          </button>
        </div>
      </div>

      <div className="flex-1 min-h-0 w-full relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Loading Data...
            </span>
          </div>
        ) : !chartData || chartData.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-sm border border-dashed border-slate-200 z-10">
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
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
