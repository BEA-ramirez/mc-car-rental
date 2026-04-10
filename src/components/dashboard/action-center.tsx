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
import { useDashboard } from "../../../hooks/use-dashboard"; // Adjust path as needed
import * as echarts from "echarts";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

// Theme-aware styles for alerts using opacity backgrounds for dark mode compatibility
const themeStyles = {
  red: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20",
  orange:
    "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  amber:
    "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20",
  slate:
    "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20",
};

export default function ActionCenter() {
  const donutRef = useRef<HTMLDivElement>(null);
  const { summary, isSummaryLoading } = useDashboard();
  const { theme } = useTheme();

  const isDark = theme === "dark";

  useEffect(() => {
    if (!donutRef.current || !summary?.dailyStatus) return;

    const existingChart = echarts.getInstanceByDom(donutRef.current);
    if (existingChart) {
      existingChart.dispose();
    }

    const chart = echarts.init(donutRef.current);

    const tooltipBg = isDark
      ? "rgba(10, 17, 24, 0.8)"
      : "rgba(255, 255, 255, 0.9)";
    const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0";
    const tooltipText = isDark ? "#ffffff" : "#0f172a";
    const axisColor = isDark ? "rgba(255, 255, 255, 0.4)" : "#64748b";
    const chartBg = isDark ? "#0a1118" : "#ffffff";

    chart.setOption({
      tooltip: {
        trigger: "item",
        backgroundColor: tooltipBg,
        borderColor: tooltipBorder,
        borderWidth: 1,
        textStyle: {
          fontSize: 11,
          fontWeight: "bold",
          color: tooltipText,
          fontFamily: "var(--font-sans)",
        },
        padding: [8, 12],
        extraCssText:
          "backdrop-filter: blur(12px); border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);",
      },
      title: {
        text: "Status",
        left: "25%", // Shifted left to prevent overlap
        top: "center",
        textAlign: "center",
        textVerticalAlign: "middle",
        textStyle: {
          fontSize: 10,
          fontWeight: 600,
          color: axisColor,
          fontFamily: "var(--font-sans)",
        },
      },
      legend: {
        type: "scroll", // Added scroll so it doesn't overflow in tight spaces
        orient: "vertical",
        right: "0%", // Pushed to the right edge
        top: "middle",
        icon: "circle",
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 8,
        textStyle: {
          fontSize: 9,
          color: axisColor,
          fontWeight: 500,
          fontFamily: "var(--font-sans)",
        },
        pageIconColor: "#64c5c3", // Theme color for pagination arrows if they appear
        pageTextStyle: { color: axisColor },
      },
      color: [
        "#f59e0b", // Pending (Amber)
        "#34d399", // Confirmed (Emerald)
        "#64c5c3", // Ongoing (MC Ormoc Primary Teal)
        "#cbd5e1", // Completed (Slate)
        "#f97316", // Late Arrival (Orange)
        "#ef4444", // Overdue Return (Red)
        "#b91c1c", // Conflict
        "#64748b", // Maintenance (Slate dark)
        "#f1f5f9", // Cancelled
      ],
      series: [
        {
          name: "Daily Status",
          type: "pie",
          radius: ["50%", "75%"], // Thinner ring
          center: ["25%", "50%"], // Shifted left to match title
          padAngle: 3,
          itemStyle: {
            borderRadius: 4,
            borderColor: chartBg,
            borderWidth: 2,
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
  }, [summary, isDark]);

  if (isSummaryLoading || !summary || !summary.logistics || !summary.alerts) {
    return (
      <div className="flex flex-col gap-4 h-full">
        <Skeleton className="h-[250px] w-full bg-muted rounded-xl" />
        <Skeleton className="h-[300px] w-full bg-muted rounded-xl" />
      </div>
    );
  }

  const alerts = [
    {
      id: 1,
      title: `${summary.alerts.overdueReturns} Overdue returns`,
      desc: "Requires immediate action",
      icon: Clock,
      theme: "red",
      href: "/admin/bookings?status=OVERDUE",
      count: summary.alerts.overdueReturns,
    },
    {
      id: 2,
      title: `${summary.alerts.lateArrivals} Late arrivals`,
      desc: "Customer has not picked up vehicle",
      icon: AlertCircle,
      theme: "orange",
      href: "/admin/bookings?status=LATE",
      count: summary.alerts.lateArrivals,
    },
    {
      id: 3,
      title: `${summary.alerts.pendingApprovals} Pending approvals`,
      desc: "Awaiting confirmation",
      icon: Clock,
      theme: "amber",
      href: "/admin/bookings?status=PENDING",
      count: summary.alerts.pendingApprovals,
    },
    {
      id: 4,
      title: `${summary.alerts.dispatchGaps} Dispatch gaps`,
      desc: "Drivers needed for upcoming trips",
      icon: ShieldAlert,
      theme: "blue",
      href: "/admin/drivers?filter=unassigned",
      count: summary.alerts.dispatchGaps,
    },
    {
      id: 5,
      title: `Maintenance checks`,
      desc: "Vehicles currently in shop",
      icon: Wrench,
      theme: "slate",
      href: "/admin/units?filter=maintenance",
      count: summary.dailyStatus.maintenance,
    },
  ];

  const activeAlerts = alerts.filter((a) => a.count > 0);

  return (
    <div className="flex flex-col gap-3 md:gap-4 h-full">
      {/* ALERTS SECTION */}
      <div className="bg-card border border-red-500/20 rounded-xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden transition-colors duration-300">
        <div className="px-3 py-2.5 border-b border-red-500/10 bg-red-500/5 flex items-center gap-2 shrink-0">
          <AlertCircle className="w-3.5 h-3.5 text-red-500" />
          <h3 className="text-[10px] font-bold text-red-600 dark:text-red-400 uppercase tracking-widest">
            Action center
          </h3>
        </div>
        <div className="p-1.5 space-y-0.5 overflow-y-auto custom-scrollbar flex-1">
          {activeAlerts.length === 0 ? (
            <div className="p-4 text-center text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-2">
              No pending actions.
            </div>
          ) : (
            activeAlerts.map((alert) => (
              <Link
                key={alert.id}
                href={alert.href}
                className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-secondary border border-transparent hover:border-border transition-all group"
              >
                <div
                  className={cn(
                    "w-6 h-6 rounded-md flex items-center justify-center shrink-0",
                    themeStyles[alert.theme as keyof typeof themeStyles],
                  )}
                >
                  <alert.icon className="w-3 h-3" />
                </div>
                <div className="flex-1">
                  <p className="text-[10px] font-bold text-foreground leading-none">
                    {alert.title}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1 leading-none">
                    {alert.desc}
                  </p>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </Link>
            ))
          )}
        </div>
      </div>

      {/* COMPACT LOGISTICS & STATUS */}
      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col shrink-0 transition-colors duration-300 overflow-hidden">
        <div className="px-3 py-2 border-b border-border bg-secondary/30">
          <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            Today's logistics
          </h3>
        </div>
        <div className="p-3 grid grid-cols-2 gap-3 border-b border-border">
          <div className="flex flex-col bg-emerald-500/5 border border-emerald-500/20 p-2 rounded-lg items-center justify-center">
            <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 mb-0.5">
              <ArrowUpRight className="w-3 h-3" />{" "}
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Pick-ups
              </span>
            </div>
            <span className="text-lg font-black text-emerald-600 dark:text-emerald-400 leading-none">
              {summary.logistics.pickupsToday}
            </span>
          </div>
          <div className="flex flex-col bg-blue-500/5 border border-blue-500/20 p-2 rounded-lg items-center justify-center">
            <div className="flex items-center gap-1 text-blue-600 dark:text-blue-400 mb-0.5">
              <ArrowDownRight className="w-3 h-3" />{" "}
              <span className="text-[9px] font-bold uppercase tracking-wider">
                Returns
              </span>
            </div>
            <span className="text-lg font-black text-blue-600 dark:text-blue-400 leading-none">
              {summary.logistics.returnsToday}
            </span>
          </div>
        </div>

        {/* REDUCED DONUT CHART HEIGHT */}
        <div className="p-2 h-[170px] w-full relative bg-card">
          <div ref={donutRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
}
