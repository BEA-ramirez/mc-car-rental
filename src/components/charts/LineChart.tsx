"use client";

import React from "react";
import ReactECharts from "echarts-for-react";
// We need the main echarts object to create custom graphics like gradients
import * as echarts from "echarts/core";

export default function RevenueLineChart() {
  // 1. Dummy Data
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  // Revenue in thousands (k)
  const revenueData = [45, 52, 48, 65, 78, 92, 85, 110, 105, 125, 140, 155];

  const primaryColor = "#00ddd2"; // Your brand color

  // 2. The Chart Configuration Object
  const option = {
    // Ensure fonts match your app's font
    textStyle: {
      fontFamily: "var(--font-inter), ui-sans-serif, system-ui, sans-serif",
    },
    // The tooltips that appear on hover
    tooltip: {
      trigger: "axis",
      backgroundColor: "var(--card)", // Match theme background
      borderColor: "var(--border)", // Match theme border
      textStyle: {
        color: "var(--foreground)",
      },
      // Custom formatting to show currency
      formatter: (params: any) => {
        const data = params[0];
        return `
          <div class="font-medium">${data.axisValue}</div>
          <div class="flex items-center gap-2 mt-1">
            <div class="w-2 h-2 rounded-full" style="background-color: ${data.color}"></div>
            <span class="text-muted-foreground">Revenue: </span>
            <span class="font-bold">₱${data.value}k</span>
          </div>
        `;
      },
    },
    // Padding around the grid area
    grid: {
      top: "5%",
      left: "10%",
      right: "2%",
      bottom: "14%",
    },
    xAxis: {
      type: "category",
      boundaryGap: false, // Starts the line at the very edge
      data: months,
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: {
        color: "var(--muted-foreground)",
        margin: 15,
      },
    },
    yAxis: {
      type: "value",
      axisLabel: {
        formatter: "₱{value}k",
        color: "var(--muted-foreground)",
      },
      // The horizontal grid lines
      splitLine: {
        lineStyle: {
          color: "var(--border)",
          type: "dashed",
          opacity: 0.6,
        },
      },
    },
    series: [
      {
        name: "Revenue",
        type: "line",
        data: revenueData,
        smooth: true, // Makes the line curvy
        showSymbol: false, // Hides the dots until you hover
        symbolSize: 8,
        itemStyle: {
          color: primaryColor,
          borderColor: "var(--background)", // White border in light mode, dark in dark mode
          borderWidth: 2,
        },
        lineStyle: {
          width: 3,
          color: primaryColor,
        },
        // The gradient fill underneath the line
        areaStyle: {
          opacity: 0.8,
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgba(0, 221, 210, 0.3)", // Primary color with opacity at top
            },
            {
              offset: 1,
              color: "rgba(0, 221, 210, 0.01)", // Fades to transparent at bottom
            },
          ]),
        },
      },
    ],
  };

  return (
    // Wrapped in a standard card container so you can drop it anywhere
    <div className="w-full pb-3 h-60">
      <ReactECharts
        option={option}
        style={{ width: "100%", height: "100%" }}
        opts={{ renderer: "svg" }} // SVG renders sharper curves
      />
    </div>
  );
}
