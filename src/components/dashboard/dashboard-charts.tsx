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
import { useDashboardCharts } from "../../../hooks/use-dashboard";
import { Skeleton } from "@/components/ui/skeleton";
import * as echarts from "echarts";
import { useTheme } from "next-themes";

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
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const { data: chartData, isLoading } = useDashboardCharts(timeframe);

  useEffect(() => {
    if (!chartRef.current || !chartData) return;

    const chart = echarts.init(chartRef.current);
    let option: echarts.EChartsOption = {};

    // ECharts Global Theme Variables
    const axisColor = isDark ? "rgba(255, 255, 255, 0.4)" : "#64748b";
    const splitLineColor = isDark ? "rgba(255, 255, 255, 0.05)" : "#f1f5f9";
    const tooltipBg = isDark
      ? "rgba(10, 17, 24, 0.8)"
      : "rgba(255, 255, 255, 0.9)";
    const tooltipBorder = isDark ? "rgba(255, 255, 255, 0.1)" : "#e2e8f0";
    const tooltipText = isDark ? "#ffffff" : "#0f172a";
    const primaryColor = "#64c5c3";

    // Adjusted grid for the new compact 200px height
    const gridSettings = {
      left: "0%",
      right: "0%",
      bottom: "0%",
      top: "15%",
      containLabel: true,
    };

    const axisLabelSettings = {
      color: axisColor,
      fontWeight: 500,
      fontSize: 10,
      fontFamily: "var(--font-sans)",
    };

    const tooltipSettings = {
      backgroundColor: tooltipBg,
      borderColor: tooltipBorder,
      borderWidth: 1,
      textStyle: {
        color: tooltipText,
        fontSize: 12,
        fontFamily: "var(--font-sans)",
      },
      padding: [12, 16],
      extraCssText:
        "backdrop-filter: blur(12px); border-radius: 8px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);",
    };

    if (activeTab === "earnings") {
      option = {
        tooltip: {
          trigger: "axis",
          ...tooltipSettings,
          formatter: (params: any) =>
            `<div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${axisColor}; margin-bottom: 4px;">${params[0].name}</div>
             <span style="font-weight: 800; color: ${tooltipText}; font-size: 14px;">₱ ${params[0].value.toLocaleString()}</span>`,
        },
        grid: gridSettings,
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: chartData.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { ...axisLabelSettings, margin: 12 },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: splitLineColor } },
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
            smooth: 0.4,
            data: chartData.earnings,
            itemStyle: { color: primaryColor },
            lineStyle: {
              width: 3,
              shadowColor: "rgba(100, 197, 195, 0.3)",
              shadowBlur: 10,
            },
            symbol: "none",
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(100, 197, 195, 0.25)" },
                { offset: 1, color: "rgba(100, 197, 195, 0)" },
              ]),
            },
          },
        ],
      };
    } else if (activeTab === "cashflow") {
      option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
            shadowStyle: {
              color: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            },
          },
          ...tooltipSettings,
          formatter: (params: any) => {
            const income = params[0].value;
            const expense = params[1].value;
            const net = income - expense;
            return `
              <div style="font-family: var(--font-sans); min-width: 160px;">
                <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${axisColor}; margin-bottom: 8px;">${params[0].name}</div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                  <span style="font-size: 11px; color: ${axisColor};">Income:</span> 
                  <span style="color: #10b981; font-weight: 700; font-size: 12px;">₱ ${income.toLocaleString()}</span>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 11px; color: ${axisColor};">Expenses:</span> 
                  <span style="color: #f43f5e; font-weight: 700; font-size: 12px;">₱ ${expense.toLocaleString()}</span>
                </div>
                <div style="border-top: 1px solid ${tooltipBorder}; margin: 8px 0;"></div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; font-weight: 600; color: ${tooltipText};">Net Profit:</span> 
                  <span style="color: ${tooltipText}; font-weight: 800; font-size: 13px;">₱ ${net.toLocaleString()}</span>
                </div>
              </div>`;
          },
        },
        legend: {
          data: ["Income", "Expenses"],
          top: 0,
          right: "0%",
          icon: "circle",
          itemWidth: 8,
          itemHeight: 8,
          textStyle: {
            fontSize: 10,
            color: axisColor,
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
          },
        },
        grid: gridSettings,
        xAxis: {
          type: "category",
          data: chartData.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { ...axisLabelSettings, margin: 12 },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: splitLineColor } },
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
            barWidth: "15%",
            barGap: "15%",
            data: chartData.earnings,
            itemStyle: { color: "#10b981", borderRadius: [4, 4, 0, 0] },
          },
          {
            name: "Expenses",
            type: "bar",
            barWidth: "15%",
            data: chartData.expenses,
            itemStyle: { color: "#f43f5e", borderRadius: [4, 4, 0, 0] },
          },
        ],
      };
    } else if (activeTab === "volume") {
      option = {
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow",
            shadowStyle: {
              color: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            },
          },
          ...tooltipSettings,
        },
        grid: gridSettings,
        xAxis: {
          type: "category",
          data: chartData.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { ...axisLabelSettings, margin: 12 },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: splitLineColor } },
          axisLabel: axisLabelSettings,
        },
        series: [
          {
            name: "Bookings",
            type: "bar",
            barWidth: "20%",
            data: chartData.volume,
            itemStyle: { color: "#3b82f6", borderRadius: [4, 4, 0, 0] },
          },
        ],
      };
    } else if (activeTab === "utilization") {
      option = {
        tooltip: {
          trigger: "axis",
          ...tooltipSettings,
          formatter: (params: any) =>
            `<div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${axisColor}; margin-bottom: 4px;">${params[0].name}</div>
             <span style="font-weight: 800; color: #10b981; font-size: 14px;">${params[0].value}% Deployed</span>`,
        },
        grid: gridSettings,
        xAxis: {
          type: "category",
          boundaryGap: false,
          data: chartData.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { ...axisLabelSettings, margin: 12 },
        },
        yAxis: {
          type: "value",
          min: 0,
          max: 100,
          splitLine: { lineStyle: { color: splitLineColor } },
          axisLabel: { ...axisLabelSettings, formatter: "{value}%" },
        },
        series: [
          {
            name: "Utilization",
            type: "line",
            step: "middle",
            data: chartData.utilization,
            itemStyle: { color: "#10b981" },
            lineStyle: { width: 3 },
            symbol: "circle",
            symbolSize: 6,
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
          axisPointer: {
            type: "shadow",
            shadowStyle: {
              color: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
            },
          },
          ...tooltipSettings,
          formatter: (params: any) => {
            let total = 0;
            let breakdownHtml = "";
            params.forEach((p: any) => {
              total += p.value;
              breakdownHtml += `
                <div style="display: flex; justify-content: space-between; gap: 16px; align-items: center; margin-bottom: 4px;">
                  <span style="color: ${axisColor}; font-size: 11px;">${p.marker} ${p.seriesName}</span>
                  <span style="font-weight: 700; color: ${tooltipText}; font-size: 12px;">₱ ${p.value.toLocaleString()}</span>
                </div>`;
            });
            return `
              <div style="font-family: var(--font-sans); font-size: 12px; min-width: 180px;">
                <div style="font-size: 10px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${axisColor}; margin-bottom: 8px;">${params[0].name}</div>
                ${breakdownHtml}
                <div style="border-top: 1px solid ${tooltipBorder}; margin: 8px 0;"></div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; font-weight: 600; color: ${tooltipText};">Total:</span> 
                  <span style="color: ${tooltipText}; font-weight: 800; font-size: 13px;">₱ ${total.toLocaleString()}</span>
                </div>
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
          textStyle: {
            fontSize: 10,
            color: axisColor,
            fontWeight: 600,
            fontFamily: "var(--font-sans)",
          },
        },
        grid: gridSettings,
        xAxis: {
          type: "category",
          data: chartData.labels,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { ...axisLabelSettings, margin: 12 },
        },
        yAxis: {
          type: "value",
          splitLine: { lineStyle: { color: splitLineColor } },
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
            barWidth: "25%",
            data: chartData.fleetmix.suv,
            itemStyle: { color: "#f59e0b" },
          },
          {
            name: "Sedans",
            type: "bar",
            stack: "total",
            barWidth: "25%",
            data: chartData.fleetmix.sedan,
            itemStyle: { color: "#10b981" },
          },
          {
            name: "Vans / MPVs",
            type: "bar",
            stack: "total",
            barWidth: "25%",
            data: chartData.fleetmix.van,
            itemStyle: { color: "#ef4444", borderRadius: [4, 4, 0, 0] },
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
  }, [activeTab, timeframe, chartData, isDark]);

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm h-full flex flex-col overflow-hidden transition-colors duration-300">
      <div className="px-4 py-3 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 bg-secondary/30">
        <div>
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-0.5">
            Performance Analytics
          </h3>
          <p className="text-[9px] font-medium text-muted-foreground max-w-sm leading-relaxed">
            {tabDescriptions[activeTab]}
          </p>
        </div>

        <Select
          value={timeframe}
          onValueChange={(val: TimeframeType) => setTimeframe(val)}
        >
          <SelectTrigger className="w-[120px] h-7 text-[10px] font-semibold bg-card text-foreground shadow-none border-border focus:ring-primary shrink-0 transition-colors">
            <SelectValue placeholder="Select timeframe" />
          </SelectTrigger>
          <SelectContent className="text-[10px] font-medium bg-popover border-border">
            <SelectItem value="daily">Today (Hourly)</SelectItem>
            <SelectItem value="weekly">This Week</SelectItem>
            <SelectItem value="monthly">This Month</SelectItem>
            <SelectItem value="yearly">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(val) => setActiveTab(val as TabType)}
        className="flex flex-col flex-1"
      >
        <div className="px-4 pt-3 overflow-x-auto custom-scrollbar">
          <TabsList className="h-7 bg-secondary p-0.5 rounded-lg border border-border flex w-max">
            <TabsTrigger
              value="earnings"
              className="h-5 text-[9px] font-semibold px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
            >
              Earnings
            </TabsTrigger>
            <TabsTrigger
              value="cashflow"
              className="h-5 text-[9px] font-semibold px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
            >
              Cash flow
            </TabsTrigger>
            <TabsTrigger
              value="fleetmix"
              className="h-5 text-[9px] font-semibold px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
            >
              Fleet mix
            </TabsTrigger>
            <TabsTrigger
              value="volume"
              className="h-5 text-[9px] font-semibold px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
            >
              Volume
            </TabsTrigger>
            <TabsTrigger
              value="utilization"
              className="h-5 text-[9px] font-semibold px-3 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
            >
              Utilization
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 p-3 w-full min-h-[200px] relative">
          {isLoading ? (
            <Skeleton className="w-full h-full bg-muted rounded-lg" />
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
