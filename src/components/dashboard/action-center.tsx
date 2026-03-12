"use client";

import React, { useRef, useEffect } from "react";
import Link from "next/link";
import {
  AlertCircle,
  Clock,
  ShieldAlert,
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "../../../hooks/use-dashboard";
import * as echarts from "echarts";
import { cn } from "@/lib/utils";

// Tailwind color maps for the themes
const themeStyles = {
  red: "bg-red-100 text-red-600",
  orange: "bg-orange-100 text-orange-600", // Added for Late Arrivals!
  amber: "bg-amber-100 text-amber-600",
  blue: "bg-blue-100 text-blue-600",
  slate: "bg-slate-100 text-slate-600",
};

export default function ActionCenter() {
  const donutRef = useRef<HTMLDivElement>(null);
  const { summary, isSummaryLoading } = useDashboard();

  // 3. ECharts initialization
  useEffect(() => {
    if (!donutRef.current || !summary.dailyStatus) return;

    const existingChart = echarts.getInstanceByDom(donutRef.current);
    if (existingChart) {
      existingChart.dispose();
    }

    const chart = echarts.init(donutRef.current);

    chart.setOption({
      tooltip: {
        trigger: "item",
        backgroundColor: "#fff",
        textStyle: { fontSize: 11, fontWeight: "bold", color: "#0f172a" },
        padding: [8, 12],
        borderWidth: 1,
        borderColor: "#e2e8f0",
      },
      title: {
        text: "STATUS",
        left: "35%",
        top: "center",
        textAlign: "center",
        textVerticalAlign: "middle",
        textStyle: {
          fontSize: 9,
          fontWeight: "bold",
          color: "#94a3b8",
          letterSpacing: 1,
        },
      },
      legend: {
        orient: "vertical",
        right: "2%",
        top: "middle",
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 8,
        textStyle: { fontSize: 9, color: "#64748b", fontWeight: "600" },
      },
      color: [
        "#f59e0b", // Pending
        "#34d399", // Confirmed
        "#10b981", // Ongoing
        "#cbd5e1", // Completed
        "#f97316", // Late Arrival
        "#ef4444", // Overdue Return
        "#b91c1c", // Conflict (Hidden via 0 value for now)
        "#64748b", // Maintenance
        "#f1f5f9", // Cancelled
      ],
      series: [
        {
          name: "Daily Status",
          type: "pie",
          radius: ["45%", "85%"],
          center: ["35%", "50%"],
          padAngle: 3,
          itemStyle: {
            borderRadius: 4,
            borderColor: "#ffffff",
            borderWidth: 1,
          },
          avoidLabelOverlap: false,
          label: { show: false },
          labelLine: { show: false },
          data: [
            { value: summary.dailyStatus.pending, name: "Pending" },
            { value: summary.dailyStatus.confirmed, name: "Confirmed" },
            { value: summary.dailyStatus.ongoing, name: "Ongoing" },
            { value: summary.dailyStatus.completed, name: "Completed" },
            { value: summary.dailyStatus.lateArrival, name: "Late Arrival" },
            { value: summary.dailyStatus.overdue, name: "Overdue Return" },
            { value: 0, name: "Conflict" },
            { value: summary.dailyStatus.maintenance, name: "Maintenance" },
            { value: summary.dailyStatus.cancelled, name: "Cancelled" },
          ],
        },
      ],
    });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      chart.dispose();
      window.removeEventListener("resize", handleResize);
    };
  }, [summary]); // Automatically redraws if summary data refreshes in the background

  // 1. BULLETPROOF LOADING CHECK: Catch missing data before ANY rendering happens
  if (isSummaryLoading || !summary || !summary.logistics || !summary.alerts) {
    return (
      <div className="flex flex-col gap-6 h-full">
        <Skeleton className="h-[250px] w-full bg-slate-100 rounded-sm" />
        <Skeleton className="h-[300px] w-full bg-slate-100 rounded-sm" />
      </div>
    );
  }

  // 2. Safely build the alerts array since we know `summary` is fully loaded
  const alerts = [
    {
      id: 1,
      title: `${summary.alerts.overdueReturns} Overdue Returns`,
      desc: "Requires immediate action",
      icon: Clock,
      theme: "red",
      href: "/admin/bookings?status=overdue",
      count: summary.alerts.overdueReturns,
    },
    {
      id: 2,
      title: `${summary.alerts.lateArrivals} Late Arrivals`,
      desc: "Customer has not picked up vehicle",
      icon: AlertCircle,
      theme: "orange",
      href: "/admin/bookings?status=late",
      count: summary.alerts.lateArrivals,
    },
    {
      id: 3,
      title: `${summary.alerts.pendingApprovals} Pending Approvals`,
      desc: "Awaiting confirmation",
      icon: Clock,
      theme: "amber",
      href: "/admin/bookings?status=pending",
      count: summary.alerts.pendingApprovals,
    },
    {
      id: 4,
      title: `${summary.alerts.dispatchGaps} Dispatch Gaps`,
      desc: "Drivers needed for upcoming trips",
      icon: ShieldAlert,
      theme: "blue",
      href: "/admin/drivers?filter=unassigned",
      count: summary.alerts.dispatchGaps,
    },
    {
      id: 5,
      title: `Maintenance Checks`,
      desc: "Vehicles currently in shop",
      icon: Wrench,
      theme: "slate",
      href: "/admin/units?filter=maintenance",
      count: summary.dailyStatus.maintenance,
    },
  ];

  const activeAlerts = alerts.filter((a) => a.count > 0);

  return (
    <div className="flex flex-col gap-6 h-full">
      {/* ALERTS SECTION */}
      <div className="bg-white border border-red-200 rounded-sm shadow-sm flex flex-col flex-1 min-h-0">
        <div className="px-4 py-3 border-b border-red-100 bg-red-50 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-4 h-4 text-red-600" />
          <h3 className="text-xs font-bold text-red-800 uppercase tracking-wider">
            Action Center
          </h3>
        </div>
        <div className="p-2 space-y-1 overflow-y-auto custom-scrollbar flex-1">
          {activeAlerts.length === 0 ? (
            <div className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-4">
              No pending actions. You're all caught up!
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <Link
                key={alert.id}
                href={alert.href}
                className="flex items-center gap-3 p-2 rounded-sm hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all group"
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded flex items-center justify-center shrink-0",
                    themeStyles[alert.theme as keyof typeof themeStyles],
                  )}
                >
                  <alert.icon className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1">
                  <p className="text-[11px] font-bold text-slate-800 leading-none">
                    {alert.title}
                  </p>
                  <p className="text-[9px] text-slate-500 mt-1">{alert.desc}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* LOGISTICS & STATUS */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col shrink-0">
        <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Today's Logistics
          </h3>
        </div>
        <div className="p-4 grid grid-cols-2 gap-4 border-b border-slate-100">
          <div className="flex flex-col bg-emerald-50 border border-emerald-100 p-2 rounded-sm items-center justify-center">
            <div className="flex items-center gap-1.5 text-emerald-700 mb-1">
              <ArrowUpRight className="w-3.5 h-3.5" />{" "}
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Pick-ups
              </span>
            </div>
            <span className="text-xl font-black text-emerald-700">
              {summary.logistics.pickupsToday}
            </span>
          </div>
          <div className="flex flex-col bg-blue-50 border border-blue-100 p-2 rounded-sm items-center justify-center">
            <div className="flex items-center gap-1.5 text-blue-700 mb-1">
              <ArrowDownRight className="w-3.5 h-3.5" />{" "}
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Returns
              </span>
            </div>
            <span className="text-xl font-black text-blue-700">
              {summary.logistics.returnsToday}
            </span>
          </div>
        </div>

        <div className="p-2 h-[220px] w-full relative">
          <div ref={donutRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
