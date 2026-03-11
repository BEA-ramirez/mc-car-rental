"use client";

import React, { useRef, useEffect, useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useDashboardCharts } from "../../../hooks/use-dashboard"; // Adjust path if needed
import { Skeleton } from "@/components/ui/skeleton";
import * as echarts from "echarts";

type TabType = "earnings" | "cashflow" | "volume" | "utilization" | "fleetmix";
type TimeframeType = "daily" | "weekly" | "monthly" | "yearly";

const tabDescriptions: Record<TabType, string> = {
  earnings:
    "Gross revenue generated across all completed and ongoing bookings.",
  cashflow:
    "Comparison of gross income versus operational expenses (maintenance, payouts).",
  volume: "Total number of unique booking transactions processed.",
  utilization:
    "Percentage of total fleet inventory actively deployed on the road.",
  fleetmix:
    "Revenue contribution breakdown by vehicle category to identify top performers.",
};

export default function DashboardCharts() {
  const chartRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<TabType>("earnings");
  const [timeframe, setTimeframe] = useState<TimeframeType>("weekly");

  // Call our React Query hook!
  const { data: chartData, isLoading } = useDashboardCharts(timeframe);

  useEffect(() => {
    // Wait until we have the DOM node AND the real data from the database
    if (!chartRef.current || !chartData) return;

    const chart = echarts.init(chartRef.current);
    let option: echarts.EChartsOption = {};

    const gridSettings = {
      left: "2%",
      right: "3%",
      bottom: "5%",
      top: "15%",
      containLabel: true,
    };
    const axisLabelSettings = {
      color: "#64748b",
      fontWeight: "bold" as const,
      fontSize: 10,
    };

    if (activeTab === "earnings") {
      option = {
        tooltip: {
          trigger: "axis",
          formatter: (params: any) =>
            `${params[0].name}<br/><span style="font-weight:bold;color:#0f172a">₱ ${params[0].value.toLocaleString()}</span>`,
        },
        grid: gridSettings,
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: chartData.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: axisLabelSettings,
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
          axisLabel: {
            ...axisLabelSettings,
            formatter: (value: number) =>
              `₱${value >= 1000 ? value / 1000 + "k" : value}`,
          },
        },
        series: [
          {
            name: "Revenue",
            type: "line",
            smooth: 0.3,
            data: chartData.earnings,
            itemStyle: { color: "#0f172a" },
            lineStyle: { width: 3 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(15,23,42,0.15)" },
                { offset: 1, color: "rgba(15,23,42,0)" },
              ]),
            },
          },
        ],
      };
    } else if (activeTab === "cashflow") {
      option = {
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (params: any) => {
            const income = params[0].value;
            const expense = params[1].value;
            const net = income - expense;
            return `<div style="font-family: sans-serif; font-size: 12px;"><div style="font-weight: bold; margin-bottom: 4px; color: #64748b;">${params[0].name}</div><div style="display: flex; justify-content: space-between; gap: 16px;"><span>Income:</span> <span style="color: #10b981; font-weight: bold;">₱ ${income.toLocaleString()}</span></div><div style="display: flex; justify-content: space-between; gap: 16px;"><span>Expenses:</span> <span style="color: #f43f5e; font-weight: bold;">₱ ${expense.toLocaleString()}</span></div><div style="border-top: 1px solid #e2e8f0; margin: 4px 0;"></div><div style="display: flex; justify-content: space-between; gap: 16px;"><span>Net Profit:</span> <span style="color: #0f172a; font-weight: bold;">₱ ${net.toLocaleString()}</span></div></div>`;
          },
        },
        legend: {
          data: ["Income", "Expenses"],
          top: 0,
          right: "0%",
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { fontSize: 10, color: "#64748b", fontWeight: "bold" },
        },
        grid: gridSettings,
        xAxis: {
          type: "category",
          data: chartData.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: axisLabelSettings,
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
          axisLabel: {
            ...axisLabelSettings,
            formatter: (value: number) =>
              `₱${value >= 1000 ? value / 1000 + "k" : value}`,
          },
        },
        series: [
          {
            name: "Income",
            type: "bar",
            barWidth: "20%",
            barGap: "10%",
            data: chartData.earnings,
            itemStyle: { color: "#10b981", borderRadius: [2, 2, 0, 0] },
          },
          {
            name: "Expenses",
            type: "bar",
            barWidth: "20%",
            data: chartData.expenses,
            itemStyle: { color: "#f43f5e", borderRadius: [2, 2, 0, 0] },
          },
        ],
      };
    } else if (activeTab === "volume") {
      option = {
        tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
        grid: gridSettings,
        xAxis: {
          type: "category",
          data: chartData.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: axisLabelSettings,
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
          axisLabel: axisLabelSettings,
        },
        series: [
          {
            name: "Bookings",
            type: "bar",
            barWidth: "25%",
            data: chartData.volume,
            itemStyle: { color: "#3b82f6", borderRadius: [3, 3, 0, 0] },
          },
        ],
      };
    } else if (activeTab === "utilization") {
      option = {
        tooltip: {
          trigger: "axis",
          formatter: (params: any) =>
            `${params[0].name}<br/><span style="font-weight:bold;color:#10b981">${params[0].value}% Deployed</span>`,
        },
        grid: gridSettings,
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: chartData.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: axisLabelSettings,
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 100,
          splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
          axisLabel: { ...axisLabelSettings, formatter: "{value}%" },
        },
        series: [
          {
            name: "Utilization",
            type: "line",
            step: "middle",
            data: chartData.utilization,
            itemStyle: { color: "#10b981" },
            lineStyle: { width: 2 },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(16,185,129,0.2)" },
                { offset: 1, color: "rgba(16,185,129,0)" },
              ]),
            },
          },
        ],
      };
    } else if (activeTab === "fleetmix") {
      option = {
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
          formatter: (params: any) => {
            let total = 0;
            let breakdownHtml = "";
            params.forEach((p: any) => {
              total += p.value;
              breakdownHtml += `<div style="display: flex; justify-content: space-between; gap: 16px; align-items: center;"><span style="color: #64748b; font-size: 11px;">${p.marker} ${p.seriesName}</span><span style="font-weight: bold; color: #0f172a; font-size: 11px;">₱ ${p.value.toLocaleString()}</span></div>`;
            });
            return `
              <div style="font-family: sans-serif; font-size: 12px; min-width: 140px;">
                <div style="font-weight: bold; margin-bottom: 8px; color: #0f172a; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px;">${params[0].name} (Total: ₱ ${total.toLocaleString()})</div>
                ${breakdownHtml}
              </div>
            `;
          },
        },
        legend: {
          data: ["SUVs", "Sedans", "Vans / MPVs"],
          top: 0,
          right: "0%",
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
          textStyle: { fontSize: 10, color: "#64748b", fontWeight: "bold" },
        },
        grid: gridSettings,
        xAxis: {
          type: "category",
          data: chartData.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: axisLabelSettings,
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { type: "dashed", color: "#f1f5f9" } },
          axisLabel: {
            ...axisLabelSettings,
            formatter: (value: number) =>
              `₱${value >= 1000 ? value / 1000 + "k" : value}`,
          },
        },
        series: [
          {
            name: "SUVs",
            type: "bar",
            stack: "total",
            barWidth: "35%",
            data: chartData.fleetmix.suv,
            itemStyle: { color: "#f59e0b" },
          },
          {
            name: "Sedans",
            type: "bar",
            stack: "total",
            barWidth: "35%",
            data: chartData.fleetmix.sedan,
            itemStyle: { color: "#10b981" },
          },
          {
            name: "Vans / MPVs",
            type: "bar",
            stack: "total",
            barWidth: "35%",
            data: chartData.fleetmix.van,
            itemStyle: { color: "#ef4444", borderRadius: [2, 2, 0, 0] },
          },
        ],
      };
    }

    chart.setOption(option, { notMerge: true });

    const handleResize = () => chart.resize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      chart.dispose();
    };
  }, [activeTab, timeframe, chartData]); // <-- ADDED chartData HERE

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm h-full flex flex-col overflow-hidden">
      {/* HEADER & FILTERS */}
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0 bg-slate-50/50">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-1">
            Performance Analytics
          </h3>
          <p className="text-[10px] font-medium text-slate-500 max-w-sm">
            {tabDescriptions[activeTab]}
          </p>
        </div>

        <Select
          value={timeframe}
          onValueChange={(val: TimeframeType) => setTimeframe(val)}
        >
          <SelectTrigger className="w-[130px] h-8 text-xs font-bold bg-white shadow-none border-slate-200 focus:ring-0 shrink-0">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent className="text-xs font-medium">
            <SelectItem value="daily">Today (Hourly)</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="yearly">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* CUSTOM TABS SHELL */}
      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as TabType)}
        className="flex flex-col flex-1"
      >
        <div className="px-5 pt-4 overflow-x-auto custom-scrollbar">
          <TabsList className="h-8 bg-slate-100 p-0.5 rounded-sm border border-slate-200 flex w-max">
            <TabsTrigger
              value="earnings"
              className="h-6 text-[10px] font-bold px-4 rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
            >
              Earnings
            </TabsTrigger>
            <TabsTrigger
              value="cashflow"
              className="h-6 text-[10px] font-bold px-4 rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
            >
              Cash Flow
            </TabsTrigger>
            <TabsTrigger
              value="fleetmix"
              className="h-6 text-[10px] font-bold px-4 rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
            >
              Fleet Mix
            </TabsTrigger>
            <TabsTrigger
              value="volume"
              className="h-6 text-[10px] font-bold px-4 rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
            >
              Volume
            </TabsTrigger>
            <TabsTrigger
              value="utilization"
              className="h-6 text-[10px] font-bold px-4 rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
            >
              Utilization
            </TabsTrigger>
          </TabsList>
        </div>

        {/* LOADING STATE & CHART CONTAINER (Consolidated into one!) */}
        <div className="flex-1 p-5 w-full min-h-[260px] relative">
          {isLoading ? (
            <Skeleton className="w-full h-full bg-slate-50 rounded-sm" />
          ) : (
            <div
              ref={chartRef}
              className="w-full h-full animate-in fade-in duration-500"
            />
          )}
        </div>
      </Tabs>
    </div>
  );
}
