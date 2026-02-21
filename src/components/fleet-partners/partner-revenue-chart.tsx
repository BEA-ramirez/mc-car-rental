"use client";

import React from "react";
import RevenueLineChart from "../charts/LineChart";
import { ChevronDown } from "lucide-react";

export default function PartnerRevenueChart() {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-800 leading-none">
            Revenue Trend
          </h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider mt-1.5">
            Past 6 Months
          </p>
        </div>

        {/* Action Button for period filtering */}
        <button className="h-7 px-3 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-2 hover:bg-slate-100 transition-colors">
          Year 2026
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      <div className="flex-1 min-h-0 w-full">
        <RevenueLineChart />
      </div>
    </div>
  );
}
