import React from "react";
import { TrendingUp, Banknote, Car, Activity } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "../../../hooks/use-dashboard";
import { cn } from "@/lib/utils";

export default function KpiCards() {
  const { summary, isSummaryLoading } = useDashboard();

  if (isSummaryLoading || !summary) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm h-[104px] flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <Skeleton className="h-3 w-24 bg-slate-100" />
              <Skeleton className="h-4 w-4 bg-slate-100" />
            </div>
            <Skeleton className="h-8 w-32 bg-slate-100 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "MTD Revenue",
      value: `₱ ${Number(summary.kpis.mtdRevenue).toLocaleString()}`,
      trend: "Current Month",
      icon: Banknote,
      color: "text-slate-900",
      trendUp: true,
    },
    {
      title: "New Bookings",
      value: summary.kpis.newBookings.toString(),
      trend: "Today",
      icon: Activity,
      color: "text-blue-600",
      trendUp: true,
    },
    {
      title: "Fleet Utilization",
      value: `${Math.round(((summary.kpis.totalCars - summary.kpis.availableCars) / summary.kpis.totalCars) * 100)}%`,
      trend: `${summary.kpis.totalCars - summary.kpis.availableCars} of ${summary.kpis.totalCars} Active`,
      icon: TrendingUp,
      color: "text-emerald-600",
      trendUp: true,
    },
    {
      title: "Available Cars",
      value: summary.kpis.availableCars.toString(),
      trend: "Ready for dispatch",
      icon: Car,
      color: "text-amber-600",
      trendUp: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex flex-col justify-between relative overflow-hidden group hover:border-slate-300 transition-colors"
        >
          <div className="flex justify-between items-start mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest z-10">
              {kpi.title}
            </span>
            <kpi.icon className={cn("w-4 h-4 opacity-50", kpi.color)} />
          </div>
          <span
            className={cn(
              "text-2xl font-black tracking-tight font-mono z-10",
              kpi.color,
            )}
          >
            {kpi.value}
          </span>
          <div className="mt-2 flex items-center gap-1.5 z-10">
            <span
              className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded-sm",
                kpi.trendUp
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600",
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
