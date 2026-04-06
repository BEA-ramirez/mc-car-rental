"use client";

import React from "react";
import { TrendingUp, Banknote, Car, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "../../../hooks/use-dashboard";
import { cn } from "@/lib/utils";

export default function KpiCards() {
  const { summary, isSummaryLoading } = useDashboard();

  if (isSummaryLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-card border border-border p-3 rounded-xl shadow-sm h-[88px] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-2.5 w-20 bg-muted" />
              <Skeleton className="h-5 w-5 rounded-md bg-muted" />
            </div>
            <Skeleton className="h-6 w-24 bg-muted mt-2" />
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "MTD Revenue",
      value: `₱ ${Number(summary.kpis.mtdRevenue).toLocaleString()}`,
      trend: "Current month",
      icon: Banknote,
      badgeClass: "bg-primary/10 text-primary border-primary/20",
    },
    {
      title: "New Bookings",
      value: summary.kpis.newBookings.toString(),
      trend: "Today",
      icon: Activity,
      badgeClass:
        "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    },
    {
      title: "Fleet Utilization",
      value: `${Math.round(((summary.kpis.totalCars - summary.kpis.availableCars) / summary.kpis.totalCars) * 100)}%`,
      trend: `${summary.kpis.totalCars - summary.kpis.availableCars} of ${summary.kpis.totalCars} active`,
      icon: TrendingUp,
      badgeClass:
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    },
    {
      title: "Available Cars",
      value: summary.kpis.availableCars.toString(),
      trend: "Ready for dispatch",
      icon: Car,
      badgeClass: "bg-secondary text-muted-foreground border-border",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
      {kpis.map((kpi, i) => (
        <div
          key={i}
          className="bg-card border border-border p-3 rounded-xl shadow-sm flex flex-col justify-between relative group hover:border-primary/50 transition-colors cursor-default min-h-[88px]"
        >
          <div className="flex justify-between items-start mb-1">
            <span className="text-[10px] font-semibold text-muted-foreground">
              {kpi.title}
            </span>
            <div className="p-1 rounded-md bg-secondary/50 group-hover:bg-primary/10 transition-colors">
              <kpi.icon className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Reduced text size here */}
          <span className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
            {kpi.value}
          </span>

          <div className="mt-1 flex items-center gap-1.5">
            <span
              className={cn(
                "text-[9px] font-semibold px-1.5 py-0.5 rounded border transition-colors",
                kpi.badgeClass,
              )}
            >
              {kpi.trend}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
