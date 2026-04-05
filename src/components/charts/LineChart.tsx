"use client";

import React, { useMemo } from "react";
import ReactECharts from "echarts-for-react";
import * as echarts from "echarts/core";
import { RevenueChartDataPoint } from "../fleet-partners/partner-revenue-chart"; // Adjust import path if needed

interface RevenueLineChartProps {
  data: RevenueChartDataPoint[];
}

export default function RevenueLineChart({ data }: RevenueLineChartProps) {
  // 1. Transform the incoming RPC data for ECharts
  // ECharts expects separate arrays for the X-axis (labels) and Y-axis (values)
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return { months: [], revenue: [], net: [] };

    return {
      months: data.map((d) => d.month_name),
      // We divide by 1000 so the chart shows "k" values cleanly (e.g., 50k instead of 50000)
      revenue: data.map((d) => Number(d.revenue) / 1000),
      net: data.map((d) => Number(d.net_payout) / 1000),
    };
  }, [data]);

  // Stealth Wealth Admin Palette
  const primaryColor = "#0F172A"; // Slate 900 - Gross Revenue
  const secondaryColor = "#10B981"; // Emerald 500 - Net Payout

  // 2. The Chart Configuration Object
  const option = {
    textStyle: {
      fontFamily: "var(--font-general), ui-sans-serif, system-ui, sans-serif", // Matches your requested font
    },
    tooltip: {
      trigger: "axis",
      backgroundColor: "#ffffff",
      borderColor: "#e2e8f0", // slate-200
      padding: [12, 16],
      textStyle: {
        color: "#0f172a", // slate-900
        fontSize: 12,
        fontWeight: 500,
      },
      formatter: (params: any) => {
        const revData = params[0];
        const netData = params[1];

        return `
          <div style="font-weight: 700; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; margin-bottom: 8px;">
            ${revData.axisValue}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 24px; margin-bottom: 4px;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background-color: ${revData.color}"></div>
              <span style="color: #64748b; font-size: 11px;">Gross Revenue</span>
            </div>
            <span style="font-weight: 700; font-size: 12px;">₱${(revData.value * 1000).toLocaleString()}</span>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 24px;">
             <div style="display: flex; align-items: center; gap: 6px;">
              <div style="width: 6px; height: 6px; border-radius: 50%; background-color: ${netData.color}"></div>
              <span style="color: #64748b; font-size: 11px;">Net Payout</span>
            </div>
            <span style="font-weight: 700; font-size: 12px; color: #059669;">₱${(netData.value * 1000).toLocaleString()}</span>
          </div>
        `;
      },
    },
    // Add a legend since we are tracking two lines now
    legend: {
      data: ["Gross Revenue", "Net Payout"],
      top: 0,
      right: 0,
      icon: "circle",
      itemWidth: 8,
      itemHeight: 8,
      textStyle: {
        color: "#64748b", // slate-500
        fontSize: 10,
        fontWeight: 700,
        fontFamily: "var(--font-general)",
      },
    },
    grid: {
      top: "15%",
      left: "0%",
      right: "2%",
      bottom: "0%",
      containLabel: true, // Ensures Y-axis labels aren't cut off
    },
    xAxis: {
      type: "category",
      boundaryGap: false,
      data: chartData.months,
      axisTick: { show: false },
      axisLine: {
        lineStyle: { color: "#e2e8f0" }, // slate-200
      },
      axisLabel: {
        color: "#64748b", // slate-500
        fontSize: 10,
        fontWeight: 600,
        margin: 16,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "₱{value}k",
        color: "#94a3b8", // slate-400
        fontSize: 10,
        fontWeight: 600,
      },
      splitLine: {
        lineStyle: {
          color: "#f1f5f9", // slate-100
          type: "dashed",
        },
      },
    },
    series: [
      {
        name: "Gross Revenue",
        type: "line",
        data: chartData.revenue,
        smooth: 0.3, // Slightly less curvy for a more formal look
        showSymbol: false,
        symbolSize: 6,
        itemStyle: {
          color: primaryColor,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        lineStyle: {
          width: 2.5,
          color: primaryColor,
        },
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(15, 23, 42, 0.08)" }, // slate-900 transparent
            { offset: 1, color: "rgba(15, 23, 42, 0.01)" },
          ]),
        },
      },
      {
        name: "Net Payout",
        type: "line",
        data: chartData.net,
        smooth: 0.3,
        showSymbol: false,
        symbolSize: 6,
        itemStyle: {
          color: secondaryColor,
          borderColor: "#ffffff",
          borderWidth: 2,
        },
        lineStyle: {
          width: 2.5,
          color: secondaryColor,
          type: "dashed", // Make the net line distinct
        },
      },
    ],
  };

  return (
    <div className="w-full h-full min-h-[250px]">
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "svg" }}
        notMerge={true} // Ensures the chart fully updates when switching partners
      />
    </div>
  );
}
