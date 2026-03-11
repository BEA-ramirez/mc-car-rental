"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { MoreVertical, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";

// Import our sub-components
import KpiCards from "./kpi-cards";
import DashboardCharts from "./dashboard-charts";
import ActionCenter from "./action-center";
import QuickInsightsSheet from "./quick-insights-sheet";
import LiveBookingsTable from "./live-bookings-table";

export default function DashboardMain() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-hidden">
      {/* GLOBAL PAGE HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <LayoutDashboard className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              Executive Dashboard
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Live operational metrics and system alerts.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block mr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Today
            </p>
            <p className="text-xs font-bold text-slate-800">
              {format(new Date(), "MMM dd, yyyy")}
            </p>
          </div>
          <div className="w-px h-6 bg-slate-200 hidden sm:block" />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSheetOpen(true)}
            className="h-8 w-8 rounded-sm border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
          {/* TOP ROW: KPIs */}
          <KpiCards />

          {/* MIDDLE ROW: CHARTS & ACTION CENTER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col min-w-0">
              <DashboardCharts />
            </div>
            <div className="flex flex-col min-w-0">
              <ActionCenter />
            </div>
          </div>

          {/* BOTTOM ROW: LIVE BOOKINGS TABLE (Placeholder for now) */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
            <div className="px-5 py-4 flex items-center justify-between bg-slate-50/50">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Live Bookings (Recent)
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[10px] font-bold rounded-sm shadow-none bg-white"
              >
                View All Directory
              </Button>
            </div>

            {/* INJECT THE NEW TABLE HERE */}
            <div className="border-t border-slate-100">
              <LiveBookingsTable />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SLIDE-OUT SHEET */}
      <QuickInsightsSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
