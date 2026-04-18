"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

import KpiCards from "./kpi-cards";
import DashboardCharts from "./dashboard-charts";
import ActionCenter from "./action-center";
import QuickInsightsSheet from "./quick-insights-sheet";
import LiveBookingsTable from "./live-bookings-table";

export default function DashboardMain() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      {/* COMPACT GLOBAL PAGE HEADER */}
      <div className="flex items-center justify-between px-4 py-2.5  shrink-0 transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-sm font-bold tracking-tight leading-none mb-0.5 text-foreground">
              Welcome Back!
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground leading-none">
              Live operational metrics and system alerts.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block mr-2">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Today
            </p>
            <p className="text-[11px] font-bold text-foreground">
              {format(new Date(), "MMM dd, yyyy")}
            </p>
          </div>
          <div className="w-px h-5 bg-border hidden sm:block" />
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSheetOpen(true)}
            className="h-7 w-7 rounded-md border-border text-muted-foreground hover:bg-secondary hover:text-foreground shadow-none"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
        {/* REDUCED PADDINGS & GAPS */}
        <div className="max-w-[1600px] mx-auto p-3 md:p-4 space-y-3 md:space-y-4">
          {/* TOP ROW: KPIs */}
          <KpiCards />

          {/* MIDDLE ROW: CHARTS & ACTION CENTER */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 md:gap-4">
            <div className="lg:col-span-2 flex flex-col min-w-0">
              <DashboardCharts />
            </div>
            <div className="flex flex-col min-w-0">
              <ActionCenter />
            </div>
          </div>

          {/* BOTTOM ROW: LIVE BOOKINGS TABLE */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors duration-300">
            <div className="px-4 py-2.5 flex items-center justify-between border-b border-border bg-secondary/30">
              <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                Live Bookings (Recent)
              </h3>
              <Button
                variant="outline"
                size="sm"
                className="h-6 text-[9px] font-semibold rounded-md shadow-none bg-card hover:bg-secondary hover:text-foreground border-border"
              >
                View All Directory
              </Button>
            </div>
            <div className="bg-card">
              <LiveBookingsTable />
            </div>
          </div>
        </div>
      </div>

      <QuickInsightsSheet open={isSheetOpen} onOpenChange={setIsSheetOpen} />
    </div>
  );
}
