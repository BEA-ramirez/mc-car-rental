"use client";

import React, { useState } from "react";
import { format, subDays } from "date-fns";
import {
  Calendar as CalendarIcon,
  Download,
  FileSpreadsheet,
  Search,
  Filter,
  TrendingUp,
  AlertTriangle,
  Car,
  User,
  ChevronDown,
  ChevronRight,
  PieChart,
  Activity,
  CreditCard,
  Settings2,
  Loader2,
  Briefcase,
  FolderOpen,
} from "lucide-react";
import { DateRange } from "react-day-picker";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import { useReportsDashboard } from "../../../hooks/use-reports";
import { generateExcelReport } from "@/utils/export-excel";
import * as echarts from "echarts";
import { useEffect, useRef } from "react";

export default function ReportsMain() {
  // --- STATE ---
  const [date, setDate] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [activeTab, setActiveTab] = useState("unit_economics");
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [partnerFilter, setPartnerFilter] = useState("all");
  const [exportState, setExportState] = useState<"idle" | "pdf" | "excel">(
    "idle",
  );

  // --- DATA FETCHING ---
  const { data: reportData, isLoading } = useReportsDashboard(
    date?.from || new Date(),
    date?.to || new Date(),
    partnerFilter,
  );

  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<any>(null);

  // --- ECHARTS LOGIC ---
  useEffect(() => {
    if (chartRef.current && reportData) {
      // 1. Initialize Chart
      const myChart = echarts.init(chartRef.current);
      chartInstanceRef.current = myChart;

      // 2. Data for Donut Chart (Revenue Split)
      const pieData = [
        {
          value: reportData.kpis?.platform_profit || 0,
          name: "Platform Profit",
        },
        { value: reportData.kpis?.owner_payouts || 0, name: "Owner Payouts" },
        { value: reportData.kpis?.maintenance_costs || 0, name: "Maintenance" },
      ].filter((d) => d.value > 0);

      // Default if no data
      if (pieData.length === 0) pieData.push({ value: 1, name: "No Revenue" });

      // 3. Data for Bar Chart (Top 5 Assets by Yield)
      // Safely map and sort the unit_economics array
      const sortedCars = [...(reportData.unit_economics || [])]
        .sort((a, b) => (b.gross || 0) - (a.gross || 0))
        .slice(0, 5)
        .reverse(); // Reverse so the highest is at the top of the horizontal bar chart

      const carNames = sortedCars.map(
        (c) => `${c.vehicle.split(" ")[0]} [${c.plate}]`,
      ); // e.g., "Toyota [ABC-123]"
      const carGross = sortedCars.map((c) => c.gross || 0);

      // 4. Define ECharts Option (Dual-Canvas Layout)
      const option = {
        backgroundColor: "#ffffff",
        title: [
          {
            text: "Revenue Allocation",
            left: "20%", // Center over the pie chart
            top: "5%",
            textAlign: "center",
            textStyle: {
              fontSize: 16,
              color: "#0f172a",
              fontFamily: "sans-serif",
            },
          },
          {
            text: "Top 5 Assets by Gross Yield",
            left: "70%", // Center over the bar chart
            top: "5%",
            textAlign: "center",
            textStyle: {
              fontSize: 16,
              color: "#0f172a",
              fontFamily: "sans-serif",
            },
          },
        ],
        tooltip: {
          trigger: "item",
          formatter: (params: any) => {
            // Add currency formatting to tooltips
            return `${params.name}: ₱${params.value.toLocaleString()}`;
          },
        },
        // Grid only applies to Cartesian coordinate systems (the Bar Chart)
        grid: {
          left: "55%", // Push the bar chart to the right half
          right: "5%",
          bottom: "15%",
          top: "20%",
          containLabel: true,
        },
        xAxis: {
          type: "value",
          axisLine: { show: false },
          axisTick: { show: false },
          splitLine: { show: false },
          axisLabel: { show: false }, // Hide the numbers on the bottom
        },
        yAxis: {
          type: "category",
          data: carNames.length > 0 ? carNames : ["No Data"],
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: "#64748b", fontWeight: "bold" },
        },
        // IMPORTANT: Must define colors array here for pie chart to map to
        color: ["#059669", "#3b82f6", "#dc2626", "#e2e8f0"],
        series: [
          // The Pie/Donut Chart (Left Side)
          {
            name: "Revenue Split",
            type: "pie",
            radius: ["45%", "75%"], // Makes it a donut
            center: ["20%", "55%"], // Centers it on the left half
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 5,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: true,
              position: "outside",
              formatter: "{b}\n{d}%", // Shows Name and Percentage
              color: "#475569",
              fontWeight: "bold",
            },
            labelLine: { show: true },
            data: pieData,
          },
          // The Bar Chart (Right Side)
          {
            name: "Gross Yield",
            type: "bar",
            data: carGross.length > 0 ? carGross : [0],
            itemStyle: {
              color: "#0f172a", // Slate 900
              borderRadius: [0, 4, 4, 0],
            },
            label: {
              show: true,
              position: "right",
              formatter: (p: any) => `₱${p.value.toLocaleString()}`,
              color: "#0f172a",
              fontWeight: "bold",
            },
            barWidth: "60%", // Make bars a bit thicker
          },
        ],
      };

      // Set the options to render the chart
      myChart.setOption(option);

      // Cleanup function
      return () => {
        myChart.dispose();
        chartInstanceRef.current = null;
      };
    }
  }, [reportData]);

  // --- HANDLERS ---
  const handleTabChange = (val: string) => {
    setActiveTab(val);
    setExpandedRow(null); // Reset expansions on tab switch
  };

  const handleExportPDF = async () => {
    if (!reportData || !date?.from || !date?.to) return;
    setExportState("pdf");

    try {
      let chartImageURI = undefined;

      // Extract the high-res image from ECharts BEFORE dynamic import
      if (chartInstanceRef.current) {
        chartImageURI = chartInstanceRef.current.getDataURL({
          type: "png",
          pixelRatio: 3, // Very high resolution for PDF
          backgroundColor: "#ffffff",
        });
      }

      const { generatePDFReport } = await import("@/utils/export-pdf");
      await generatePDFReport(reportData, date.from, date.to, chartImageURI);
    } catch (error) {
      console.error("Failed to generate PDF:", error);
    } finally {
      setExportState("idle");
    }
  };

  const handleExportExcel = async () => {
    if (!reportData || !date?.from || !date?.to) return;

    setExportState("excel");
    try {
      await generateExcelReport(reportData, date.from, date.to);
    } catch (error) {
      console.error("Failed to generate Excel:", error);
    } finally {
      setExportState("idle");
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans relative">
      {/* --- UNINTERRUPTIBLE LOADING OVERLAY --- */}
      {exportState !== "idle" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white p-8 rounded-md shadow-2xl flex flex-col items-center max-w-sm w-full border border-slate-200 animate-in zoom-in-95 duration-300">
            <div className="w-14 h-14 rounded-full bg-slate-50 flex items-center justify-center mb-5 border border-slate-100 shadow-inner">
              <Loader2 className="w-7 h-7 animate-spin text-slate-900" />
            </div>
            <h3 className="text-base font-black text-slate-900 mb-2 tracking-tight uppercase">
              {exportState === "pdf"
                ? "Drawing PDF Report"
                : "Compiling Excel Data"}
            </h3>
            <p className="text-[11px] font-medium text-slate-500 text-center leading-relaxed">
              {exportState === "pdf"
                ? "Aggregating financial data and rendering document structures. Please do not close this window."
                : "Extracting ledgers, mapping multi-sheet unit economics, and formatting columns. Please hold on."}
            </p>
          </div>
        </div>
      )}

      {/* --- FORMAL HEADER & EXPORT ENGINE --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <PieChart className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              Intelligence & Reporting
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Financial aggregates, unit economics, and operational analytics.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={exportState !== "idle" || isLoading || !reportData}
            className="h-8 text-xs font-bold border-slate-300 text-slate-700 bg-white rounded-sm shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 mr-1.5 text-red-600" /> Export PDF
          </Button>
          <Button
            size="sm"
            onClick={handleExportExcel}
            disabled={exportState !== "idle" || isLoading || !reportData}
            className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-sm disabled:opacity-50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Export Excel
            (.xlsx)
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
          {/* --- THE COMMAND BAR --- */}
          <div className="bg-white border border-slate-200 rounded-sm p-2 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[260px] justify-start text-left font-bold text-xs h-8 rounded-sm border-slate-200 shadow-none",
                      !date && "text-slate-500",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "LLL dd, y")} -{" "}
                          {format(date.to, "LLL dd, y")}
                        </>
                      ) : (
                        format(date.from, "LLL dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 rounded-sm" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    className="rounded-sm"
                  />
                </PopoverContent>
              </Popover>

              <div className="w-px h-5 bg-slate-200 mx-1" />

              <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                <SelectTrigger className="w-[180px] h-8 text-xs font-bold border-slate-200 rounded-sm shadow-none">
                  <SelectValue placeholder="All Fleet Partners" />
                </SelectTrigger>
                <SelectContent className="rounded-sm">
                  <SelectItem value="all" className="text-xs font-medium">
                    All Fleet Partners
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative w-[280px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search records..."
                  className="h-8 pl-8 text-xs rounded-sm border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-slate-300 font-medium"
                />
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-xs font-bold border-slate-200 text-slate-700 rounded-sm shadow-none hover:bg-slate-50"
                  >
                    <Filter className="w-3.5 h-3.5 mr-1.5" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[540px] bg-slate-50 p-0 flex flex-col border-l-slate-200 z-[100]">
                  <SheetHeader className="p-6 bg-white border-b border-slate-200">
                    <SheetTitle className="text-sm font-bold flex items-center gap-2">
                      <Settings2 className="w-4 h-4 text-slate-500" /> Advanced
                      Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 p-6 space-y-6 overflow-y-auto">
                    <div className="space-y-3">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Transaction Status
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 p-2.5 border border-slate-200 bg-white rounded-sm cursor-pointer hover:border-slate-300">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded border-slate-300 text-slate-900"
                          />{" "}
                          <span className="text-xs font-bold text-slate-700">
                            Completed
                          </span>
                        </label>
                        <label className="flex items-center gap-2 p-2.5 border border-slate-200 bg-white rounded-sm cursor-pointer hover:border-slate-300">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded border-slate-300 text-slate-900"
                          />{" "}
                          <span className="text-xs font-bold text-slate-700">
                            Pending
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-white border-t border-slate-200 flex justify-end gap-2">
                    <Button variant="ghost" className="text-xs font-bold h-9">
                      Reset
                    </Button>
                    <Button className="text-xs font-bold h-9 bg-slate-900 text-white hover:bg-slate-800 rounded-sm">
                      Apply Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* --- LOADING SKELETON --- */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-slate-300" />
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Aggregating Financial Data...
              </p>
            </div>
          )}

          {/* --- MAIN DASHBOARD CONTENT --- */}
          {!isLoading && reportData && (
            <>
              {/* --- EXECUTIVE SUMMARY (KPIs) --- */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Activity className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1 z-10">
                    Gross Fleet Revenue
                  </span>
                  <span className="text-2xl font-black text-slate-900 tracking-tight font-mono z-10">
                    ₱ {(reportData.kpis?.gross_revenue || 0).toLocaleString()}
                  </span>
                  <div className="mt-3 flex items-center gap-1.5 z-10">
                    <span className="text-[10px] font-medium text-slate-500">
                      {reportData.kpis?.total_trips || 0} Completed Trips
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <TrendingUp className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mb-1 z-10">
                    Net Platform Profit
                  </span>
                  <span className="text-2xl font-black text-emerald-700 tracking-tight font-mono z-10">
                    ₱ {(reportData.kpis?.platform_profit || 0).toLocaleString()}
                  </span>
                  <div className="mt-3 flex items-center gap-1.5 z-10">
                    <span className="text-[10px] font-medium text-slate-500">
                      Based on configured shares
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <AlertTriangle className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-1 z-10">
                    Maintenance Costs
                  </span>
                  <span className="text-2xl font-black text-red-700 tracking-tight font-mono z-10">
                    - ₱{" "}
                    {(reportData.kpis?.maintenance_costs || 0).toLocaleString()}
                  </span>
                  <div className="mt-3 flex items-center gap-1.5 z-10">
                    <span className="text-[10px] font-medium text-slate-500">
                      Total operational repairs
                    </span>
                  </div>
                </div>
                <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                    <User className="w-16 h-16" />
                  </div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-1 z-10">
                    Total Owner Payouts
                  </span>
                  <span className="text-2xl font-black text-blue-700 tracking-tight font-mono z-10">
                    ₱ {(reportData.kpis?.owner_payouts || 0).toLocaleString()}
                  </span>
                  <div className="mt-3 flex items-center gap-1.5 z-10">
                    <span className="text-[10px] font-medium text-slate-500">
                      Pending settlement
                    </span>
                  </div>
                </div>
              </div>

              {/* --- THE DATA GRIDS (TABS) --- */}
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col overflow-hidden min-h-[500px]">
                <div className="border-b border-slate-200 bg-slate-50/50 px-3 pt-3 flex items-center justify-between">
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="bg-transparent h-9 p-0 flex gap-5 border-b-0 justify-start w-full overflow-x-auto hide-scrollbar">
                      <TabsTrigger
                        value="unit_economics"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none uppercase tracking-wider whitespace-nowrap"
                      >
                        Unit Economics
                      </TabsTrigger>
                      <TabsTrigger
                        value="partners"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none uppercase tracking-wider whitespace-nowrap"
                      >
                        Partner Settlements
                      </TabsTrigger>
                      <TabsTrigger
                        value="master_ledger"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none uppercase tracking-wider whitespace-nowrap"
                      >
                        Master Ledger
                      </TabsTrigger>
                      <TabsTrigger
                        value="bookings"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none uppercase tracking-wider whitespace-nowrap"
                      >
                        Booking Volume
                      </TabsTrigger>
                      <TabsTrigger
                        value="customers"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none uppercase tracking-wider whitespace-nowrap"
                      >
                        Customer Insights
                      </TabsTrigger>
                      <TabsTrigger
                        value="drivers"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none uppercase tracking-wider whitespace-nowrap"
                      >
                        Driver Performance
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* TAB 1: UNIT ECONOMICS */}
                {activeTab === "unit_economics" && (
                  <div className="flex-1 bg-white">
                    <div className="grid grid-cols-[2fr_1.5fr_0.5fr_1fr_1fr_1fr_0.3fr] p-3 px-5 border-b border-slate-100 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <div>Asset / Plate No.</div>
                      <div>Fleet Partner</div>
                      <div className="text-center">Trips</div>
                      <div className="text-right">Gross Rev</div>
                      <div className="text-right">Maint. Deduct</div>
                      <div className="text-right">Net Yield</div>
                      <div></div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {reportData.unit_economics?.length > 0 ? (
                        reportData.unit_economics.map((car: any) => (
                          <Collapsible
                            key={car.car_id}
                            open={expandedRow === car.car_id}
                            onOpenChange={(isOpen) =>
                              setExpandedRow(isOpen ? car.car_id : null)
                            }
                            className="group"
                          >
                            <CollapsibleTrigger asChild>
                              <div
                                className={cn(
                                  "grid grid-cols-[2fr_1.5fr_0.5fr_1fr_1fr_1fr_0.3fr] p-3 px-5 items-center cursor-pointer transition-colors hover:bg-slate-50",
                                  expandedRow === car.car_id && "bg-slate-50",
                                )}
                              >
                                <div className="flex flex-col pr-4">
                                  <span className="text-xs font-bold text-slate-800 truncate">
                                    {car.vehicle}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500 mt-0.5">
                                    {car.plate}
                                  </span>
                                </div>
                                <div className="flex flex-col pr-4">
                                  <span className="text-xs font-bold text-slate-800 truncate">
                                    {car.owner}
                                  </span>
                                  <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                                    {car.share}% Share
                                  </span>
                                </div>
                                <div className="text-center text-xs font-bold text-slate-700">
                                  {car.trips}
                                </div>
                                <div className="text-right text-xs font-bold text-slate-800 font-mono">
                                  ₱ {car.gross.toLocaleString()}
                                </div>
                                <div className="text-right text-xs font-bold text-red-600 font-mono">
                                  {car.maint < 0
                                    ? `- ₱ ${Math.abs(car.maint).toLocaleString()}`
                                    : "₱ 0"}
                                </div>
                                <div className="text-right flex flex-col items-end justify-center">
                                  <span
                                    className={cn(
                                      "text-xs font-bold font-mono",
                                      car.net < 0
                                        ? "text-red-600"
                                        : "text-slate-900",
                                    )}
                                  >
                                    ₱ {car.net.toLocaleString()}
                                  </span>
                                  {car.status === "Loss" && (
                                    <Badge
                                      variant="outline"
                                      className="text-[8px] h-4 px-1 mt-1 bg-red-50 text-red-700 border-red-200"
                                    >
                                      LOSS
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex justify-end pr-2 text-slate-400">
                                  {expandedRow === car.car_id ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="bg-slate-50/80 border-t border-slate-100">
                              <div className="p-4 px-10">
                                <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1 w-max">
                                  Income Breakdown (Trips)
                                </h5>
                                {car.breakdown && car.breakdown.length > 0 ? (
                                  <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 max-w-lg text-[11px]">
                                    {car.breakdown.map((trip: any) => (
                                      <React.Fragment key={trip.id}>
                                        <span className="font-mono font-bold text-slate-700">
                                          {trip.id}
                                        </span>
                                        <span className="text-slate-600">
                                          {trip.dates}
                                        </span>
                                        <span className="text-right font-mono font-bold text-emerald-700">
                                          + ₱ {trip.amount.toLocaleString()}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">
                                    Detailed breakdown unavailable.
                                  </span>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                          <FolderOpen className="w-10 h-10 mb-2 opacity-20" />
                          <p className="text-xs font-bold">
                            No active vehicles found in this date range.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: PARTNER SETTLEMENTS */}
                {activeTab === "partners" && (
                  <div className="flex-1 bg-white">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_0.3fr] p-3 px-5 border-b border-slate-100 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <div>Fleet Partner Info</div>
                      <div>Active Fleet / Trips</div>
                      <div className="text-right">Gross Fleet Rev</div>
                      <div className="text-right">Platform Cut</div>
                      <div className="text-right">Maint. Deduct</div>
                      <div className="text-right">Net Payout</div>
                      <div></div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {reportData.partners?.length > 0 ? (
                        reportData.partners.map((prt: any) => (
                          <Collapsible
                            key={prt.id}
                            open={expandedRow === prt.id}
                            onOpenChange={(isOpen) =>
                              setExpandedRow(isOpen ? prt.id : null)
                            }
                            className="group"
                          >
                            <CollapsibleTrigger asChild>
                              <div
                                className={cn(
                                  "grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_0.3fr] p-3 px-5 items-center cursor-pointer transition-colors hover:bg-slate-50",
                                  expandedRow === prt.id && "bg-slate-50",
                                )}
                              >
                                <div className="flex flex-col pr-4">
                                  <span className="text-xs font-bold text-slate-800 truncate flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />{" "}
                                    {prt.business}
                                  </span>
                                  <span className="text-[10px] text-slate-500 mt-0.5">
                                    {prt.name}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-800">
                                    {prt.active_cars} Cars
                                  </span>
                                  <span className="text-[10px] text-slate-500 mt-0.5">
                                    {prt.total_trips} Bookings
                                  </span>
                                </div>
                                <div className="text-right text-xs font-bold text-slate-800 font-mono">
                                  ₱ {prt.gross.toLocaleString()}
                                </div>
                                <div className="text-right text-xs font-bold text-red-600 font-mono">
                                  - ₱{" "}
                                  {Math.abs(prt.platform_cut).toLocaleString()}
                                </div>
                                <div className="text-right text-xs font-bold text-red-600 font-mono">
                                  {prt.maint < 0
                                    ? `- ₱ ${Math.abs(prt.maint).toLocaleString()}`
                                    : "₱ 0"}
                                </div>
                                <div className="text-right flex flex-col items-end justify-center">
                                  <span
                                    className={cn(
                                      "text-xs font-bold font-mono",
                                      prt.net_payout < 0
                                        ? "text-red-600"
                                        : "text-blue-700",
                                    )}
                                  >
                                    ₱ {prt.net_payout.toLocaleString()}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[8px] h-4 px-1 mt-1",
                                      prt.status === "Settled"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200",
                                    )}
                                  >
                                    {prt.status}
                                  </Badge>
                                </div>
                                <div className="flex justify-end pr-2 text-slate-400">
                                  {expandedRow === prt.id ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="bg-slate-50/80 border-t border-slate-100">
                              <div className="p-4 px-10">
                                <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1 w-max">
                                  Partner Itemized Ledger
                                </h5>
                                {prt.breakdown && prt.breakdown.length > 0 ? (
                                  <div className="grid grid-cols-[0.8fr_1.5fr_1.2fr_1fr_1fr_1fr_1fr] gap-x-4 gap-y-2 max-w-5xl text-[11px]">
                                    <div className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">
                                      Ref
                                    </div>
                                    <div className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">
                                      Vehicle
                                    </div>
                                    <div className="font-bold text-slate-400 uppercase text-[9px] tracking-widest">
                                      Dates / Note
                                    </div>
                                    <div className="font-bold text-slate-400 uppercase text-[9px] tracking-widest text-right">
                                      Gross
                                    </div>
                                    <div className="font-bold text-slate-400 uppercase text-[9px] tracking-widest text-right">
                                      Comm.
                                    </div>
                                    <div className="font-bold text-slate-400 uppercase text-[9px] tracking-widest text-right">
                                      Maint.
                                    </div>
                                    <div className="font-bold text-slate-400 uppercase text-[9px] tracking-widest text-right">
                                      Net
                                    </div>
                                    {prt.breakdown.map((tx: any, i: number) => (
                                      <React.Fragment key={i}>
                                        <span className="font-mono font-bold text-slate-700">
                                          {tx.id}
                                        </span>
                                        <span className="text-slate-800 font-medium truncate">
                                          {tx.vehicle}
                                        </span>
                                        <span className="text-slate-500">
                                          {tx.dates}
                                        </span>
                                        <span className="text-right font-mono text-slate-700">
                                          {tx.gross > 0
                                            ? `₱ ${tx.gross.toLocaleString()}`
                                            : "-"}
                                        </span>
                                        <span className="text-right font-mono text-red-600">
                                          {tx.comm < 0
                                            ? `-₱ ${Math.abs(tx.comm).toLocaleString()}`
                                            : "-"}
                                        </span>
                                        <span className="text-right font-mono text-red-600">
                                          {tx.maint < 0
                                            ? `-₱ ${Math.abs(tx.maint).toLocaleString()}`
                                            : "-"}
                                        </span>
                                        <span
                                          className={cn(
                                            "text-right font-mono font-bold",
                                            tx.net < 0
                                              ? "text-red-700"
                                              : "text-slate-900",
                                          )}
                                        >
                                          {tx.net < 0 ? "-" : ""}₱{" "}
                                          {Math.abs(tx.net).toLocaleString()}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">
                                    No ledger details available.
                                  </span>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                          <FolderOpen className="w-10 h-10 mb-2 opacity-20" />
                          <p className="text-xs font-bold">
                            No partner activity found in this date range.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: MASTER LEDGER */}
                {activeTab === "master_ledger" && (
                  <div className="flex-1 bg-white">
                    <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] p-3 px-5 border-b border-slate-100 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <div>Date & Time</div>
                      <div>Reference</div>
                      <div>Category</div>
                      <div>Method</div>
                      <div className="text-right">Amount</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {reportData.master_ledger?.length > 0 ? (
                        reportData.master_ledger.map((txn: any) => (
                          <div
                            key={txn.id}
                            className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] p-3 px-5 items-center hover:bg-slate-50 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-800">
                                {format(new Date(txn.date), "MMM dd, yyyy")}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {format(new Date(txn.date), "hh:mm a")}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-800 font-mono">
                                {txn.id}
                              </span>
                              <span className="text-[10px] text-slate-500 truncate">
                                {txn.ref}
                              </span>
                            </div>
                            <div className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                              {txn.category.replace(/_/g, " ")}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-slate-600">
                              <CreditCard className="w-3.5 h-3.5" />
                              {txn.method}
                            </div>
                            <div
                              className={cn(
                                "text-right text-xs font-bold font-mono",
                                txn.amount < 0
                                  ? "text-red-600"
                                  : "text-emerald-700",
                              )}
                            >
                              {txn.amount > 0 ? "+" : ""} ₱{" "}
                              {Math.abs(txn.amount).toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                          <FolderOpen className="w-10 h-10 mb-2 opacity-20" />
                          <p className="text-xs font-bold">
                            No financial transactions recorded in this period.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: BOOKING VOLUME */}
                {activeTab === "bookings" && (
                  <div className="flex-1 bg-white">
                    <div className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_1fr] p-3 px-5 border-b border-slate-100 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <div>Booking Ref</div>
                      <div>Customer</div>
                      <div>Asset & Dates</div>
                      <div>Status</div>
                      <div className="text-right">Total Billed</div>
                      <div className="text-right">Balance Due</div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {reportData.bookings?.length > 0 ? (
                        reportData.bookings.map((bkg: any) => (
                          <div
                            key={bkg.id}
                            className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_1fr] p-3 px-5 items-center hover:bg-slate-50 transition-colors"
                          >
                            <span className="text-[11px] font-bold text-slate-800 font-mono">
                              {bkg.id}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {bkg.customer}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-slate-800 truncate">
                                {bkg.vehicle}
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {bkg.dates}
                              </span>
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className="text-[9px] font-bold h-5 px-2 uppercase tracking-widest bg-slate-100 text-slate-600 border-slate-200"
                              >
                                {bkg.status}
                              </Badge>
                            </div>
                            <span className="text-right text-xs font-bold text-slate-900 font-mono">
                              ₱ {bkg.total.toLocaleString()}
                            </span>
                            <span
                              className={cn(
                                "text-right text-xs font-bold font-mono",
                                bkg.due > 0
                                  ? "text-amber-600"
                                  : "text-emerald-600",
                              )}
                            >
                              ₱ {bkg.due.toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                          <FolderOpen className="w-10 h-10 mb-2 opacity-20" />
                          <p className="text-xs font-bold">
                            No bookings created in this date range.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: CUSTOMER INSIGHTS */}
                {activeTab === "customers" && (
                  <div className="flex-1 bg-white">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1.5fr_0.3fr] p-3 px-5 border-b border-slate-100 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <div>Customer Name</div>
                      <div className="text-center">Total Bookings</div>
                      <div className="text-right">Lifetime Value</div>
                      <div className="pl-6">Avg Duration</div>
                      <div>Account Flags</div>
                      <div></div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {reportData.customers?.length > 0 ? (
                        reportData.customers.map((cus: any) => (
                          <Collapsible
                            key={cus.id}
                            open={expandedRow === cus.id}
                            onOpenChange={(isOpen) =>
                              setExpandedRow(isOpen ? cus.id : null)
                            }
                            className="group"
                          >
                            <CollapsibleTrigger asChild>
                              <div
                                className={cn(
                                  "grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1.5fr_0.3fr] p-3 px-5 items-center cursor-pointer transition-colors hover:bg-slate-50",
                                  expandedRow === cus.id && "bg-slate-50",
                                )}
                              >
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-800">
                                    {cus.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {split_part_mock(cus.id)}
                                  </span>
                                </div>
                                <div className="text-center text-xs font-bold text-slate-700">
                                  {cus.bookings}
                                </div>
                                <div className="text-right text-xs font-bold text-emerald-700 font-mono">
                                  ₱ {cus.ltv.toLocaleString()}
                                </div>
                                <div className="text-xs text-slate-600 font-medium pl-6">
                                  {cus.avg_dur}
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                  {cus.flags && cus.flags.length > 0 ? (
                                    cus.flags.map((f: string) => (
                                      <Badge
                                        key={f}
                                        variant="outline"
                                        className="text-[9px] h-5 bg-red-50 text-red-700 border-red-200"
                                      >
                                        {f}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-[10px] text-slate-400 italic">
                                      Clean Record
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-end pr-2 text-slate-400">
                                  {expandedRow === cus.id ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="bg-slate-50/80 border-t border-slate-100">
                              <div className="p-4 px-10">
                                <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1 w-max">
                                  Transaction Ledger (Selected Period)
                                </h5>
                                {cus.breakdown && cus.breakdown.length > 0 ? (
                                  <div className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_0.5fr] gap-x-4 gap-y-2 max-w-4xl text-[11px]">
                                    {cus.breakdown.map((tx: any) => (
                                      <React.Fragment key={tx.id}>
                                        <span className="font-mono font-bold text-slate-700">
                                          {tx.id}
                                        </span>
                                        <span className="text-slate-600">
                                          {tx.dates}
                                        </span>
                                        <span className="text-slate-800 font-medium">
                                          {tx.vehicle}
                                        </span>
                                        <span className="text-slate-500">
                                          {tx.type}
                                        </span>
                                        <span className="text-right font-mono font-bold text-slate-900">
                                          ₱ {tx.amount.toLocaleString()}
                                        </span>
                                        <span
                                          className={cn(
                                            "text-right font-bold uppercase text-[9px]",
                                            tx.status === "Paid"
                                              ? "text-emerald-600"
                                              : tx.status === "Unpaid"
                                                ? "text-red-600"
                                                : "text-amber-600",
                                          )}
                                        >
                                          {tx.status}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">
                                    No transactions found for this period.
                                  </span>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                          <FolderOpen className="w-10 h-10 mb-2 opacity-20" />
                          <p className="text-xs font-bold">
                            No customer activity found in this date range.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 6: DRIVER PERFORMANCE */}
                {activeTab === "drivers" && (
                  <div className="flex-1 bg-white">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_0.3fr] p-3 px-5 border-b border-slate-100 bg-slate-50 text-[9px] font-bold text-slate-500 uppercase tracking-widest">
                      <div>Driver Identity</div>
                      <div className="text-center">Deployed Shifts</div>
                      <div>Current Status</div>
                      <div>Primary Vehicle</div>
                      <div className="text-right">Est. Income / Fee</div>
                      <div></div>
                    </div>
                    <div className="divide-y divide-slate-100">
                      {reportData.drivers?.length > 0 ? (
                        reportData.drivers.map((drv: any) => (
                          <Collapsible
                            key={drv.id}
                            open={expandedRow === drv.id}
                            onOpenChange={(isOpen) =>
                              setExpandedRow(isOpen ? drv.id : null)
                            }
                            className="group"
                          >
                            <CollapsibleTrigger asChild>
                              <div
                                className={cn(
                                  "grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_0.3fr] p-3 px-5 items-center cursor-pointer transition-colors hover:bg-slate-50",
                                  expandedRow === drv.id && "bg-slate-50",
                                )}
                              >
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-800">
                                    {drv.name}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">
                                    {split_part_mock(drv.id)}
                                  </span>
                                </div>
                                <div className="text-center text-xs font-bold text-slate-700">
                                  {drv.shifts}
                                </div>
                                <div>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[9px] font-bold h-5 px-2 uppercase tracking-widest",
                                      drv.status === "Available"
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : "bg-blue-50 text-blue-700 border-blue-200",
                                    )}
                                  >
                                    {drv.status}
                                  </Badge>
                                </div>
                                <div className="text-[11px] font-medium text-slate-700 flex items-center gap-2">
                                  <Car className="w-3.5 h-3.5 text-slate-400" />{" "}
                                  {drv.vehicle}
                                </div>
                                <div className="text-right text-xs font-bold text-emerald-700 font-mono">
                                  ₱ {drv.income.toLocaleString()}
                                </div>
                                <div className="flex justify-end pr-2 text-slate-400">
                                  {expandedRow === drv.id ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="bg-slate-50/80 border-t border-slate-100">
                              <div className="p-4 px-10">
                                <h5 className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-3 border-b border-slate-200 pb-1 w-max">
                                  Shift Ledger & Assignments
                                </h5>
                                {drv.breakdown && drv.breakdown.length > 0 ? (
                                  <div className="grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr] gap-x-4 gap-y-2 max-w-4xl text-[11px]">
                                    {drv.breakdown.map(
                                      (shift: any, i: number) => (
                                        <React.Fragment key={i}>
                                          <span className="font-bold text-slate-700">
                                            {shift.shift}
                                          </span>
                                          <span className="text-slate-600">
                                            {shift.date}
                                          </span>
                                          <span className="font-mono text-slate-500">
                                            {shift.ref}
                                          </span>
                                          <span className="text-slate-800 font-medium">
                                            {shift.vehicle}
                                          </span>
                                          <span className="text-right font-mono font-bold text-slate-900">
                                            + ₱ {shift.fee.toLocaleString()}
                                          </span>
                                        </React.Fragment>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">
                                    No assigned shifts for this period.
                                  </span>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-slate-400">
                          <FolderOpen className="w-10 h-10 mb-2 opacity-20" />
                          <p className="text-xs font-bold">
                            No driver shifts recorded in this date range.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </ScrollArea>
      {/* --- HIDDEN ECHART FOR PDF EXPORT CAPTURE --- */}
      {/* Width 1000px gives enough room for two charts side-by-side */}
      {reportData && (
        <div
          className="absolute -left-[9999px] top-0 p-4 bg-white"
          id="pdf-chart-capture-zone"
        >
          <div ref={chartRef} style={{ width: "1000px", height: "350px" }} />
        </div>
      )}
    </div>
  );
}

// Small helper function since the RPC returns full UUIDs sometimes
function split_part_mock(id: string) {
  if (!id) return "N/A";
  return id.split("-")[0].toUpperCase();
}
