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
    <div className="flex flex-col h-full bg-background font-sans relative transition-colors duration-300">
      {/* --- UNINTERRUPTIBLE LOADING OVERLAY --- */}
      {exportState !== "idle" && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card p-6 rounded-2xl shadow-2xl flex flex-col items-center max-w-sm w-full border border-border animate-in zoom-in-95 duration-300">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-4 border border-border shadow-sm">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
            <h3 className="text-sm font-bold text-foreground mb-1.5 uppercase tracking-wider">
              {exportState === "pdf"
                ? "Drawing PDF Report"
                : "Compiling Excel Data"}
            </h3>
            <p className="text-[10px] font-medium text-muted-foreground text-center leading-relaxed">
              {exportState === "pdf"
                ? "Aggregating financial data and rendering document structures. Please do not close this window."
                : "Extracting ledgers, mapping multi-sheet unit economics, and formatting columns. Please hold on."}
            </p>
          </div>
        </div>
      )}

      {/* --- FORMAL HEADER & EXPORT ENGINE --- */}
      <div className="flex items-center justify-between px-5 pt-4 shrink-0 ">
        <div className="flex items-center gap-3"></div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportPDF}
            disabled={exportState !== "idle" || isLoading || !reportData}
            className="h-8 text-[10px] font-bold uppercase tracking-widest border-destructive/30 text-destructive bg-card rounded-lg shadow-none hover:bg-destructive/10 disabled:opacity-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" /> PDF
          </Button>
          <Button
            size="sm"
            onClick={handleExportExcel}
            disabled={exportState !== "idle" || isLoading || !reportData}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm disabled:opacity-50 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" /> Excel (.xlsx)
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-4 md:p-5 space-y-5">
          {/* --- THE COMMAND BAR --- */}
          <div className="bg-card border border-border rounded-xl p-2 flex flex-col md:flex-row md:items-center justify-between shadow-sm transition-colors gap-2 md:gap-0">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="date"
                    variant={"outline"}
                    className={cn(
                      "w-[240px] justify-start text-left font-semibold text-[11px] h-8 rounded-lg border-border bg-secondary shadow-none hover:bg-background focus:ring-1 focus:ring-primary transition-colors",
                      !date && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                    {date?.from ? (
                      date.to ? (
                        <>
                          {format(date.from, "MMM dd, y")} -{" "}
                          {format(date.to, "MMM dd, y")}
                        </>
                      ) : (
                        format(date.from, "MMM dd, y")
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto p-0 rounded-xl border-border bg-popover shadow-xl"
                  align="start"
                >
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={date?.from}
                    selected={date}
                    onSelect={setDate}
                    numberOfMonths={2}
                    className="rounded-xl"
                  />
                </PopoverContent>
              </Popover>

              <div className="hidden md:block w-px h-5 bg-border mx-1" />

              <Select value={partnerFilter} onValueChange={setPartnerFilter}>
                <SelectTrigger className="w-[180px] h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus:ring-primary transition-colors">
                  <SelectValue placeholder="All Fleet Partners" />
                </SelectTrigger>
                <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                  <SelectItem
                    value="all"
                    className="text-[11px] font-medium transition-colors focus:bg-secondary"
                  >
                    All Fleet Partners
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-[240px]">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search records..."
                  className="h-8 pl-8 pr-3 text-[11px] rounded-lg border-border bg-secondary shadow-none focus-visible:ring-1 focus-visible:ring-primary font-medium transition-colors"
                />
              </div>

              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    className="h-8 px-3 text-[11px] font-semibold border-border text-foreground bg-card rounded-lg shadow-none hover:bg-secondary transition-colors shrink-0"
                  >
                    <Filter className="w-3.5 h-3.5 mr-1.5" /> Filters
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[400px] sm:w-[500px] bg-background p-0 flex flex-col border-l-border z-[100] transition-colors">
                  <SheetHeader className="p-5 bg-card border-b border-border transition-colors">
                    <SheetTitle className="text-sm font-bold flex items-center gap-2 uppercase tracking-wider">
                      <Settings2 className="w-4 h-4 text-muted-foreground" />{" "}
                      Advanced Filters
                    </SheetTitle>
                  </SheetHeader>
                  <div className="flex-1 p-5 space-y-6 overflow-y-auto custom-scrollbar">
                    <div className="space-y-3">
                      <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Transaction Status
                      </span>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 p-2.5 border border-border bg-card rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded border-muted-foreground text-primary focus:ring-primary"
                          />{" "}
                          <span className="text-[11px] font-bold text-foreground">
                            Completed
                          </span>
                        </label>
                        <label className="flex items-center gap-2 p-2.5 border border-border bg-card rounded-xl cursor-pointer hover:border-primary transition-colors">
                          <input
                            type="checkbox"
                            defaultChecked
                            className="rounded border-muted-foreground text-primary focus:ring-primary"
                          />{" "}
                          <span className="text-[11px] font-bold text-foreground">
                            Pending
                          </span>
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 bg-card border-t border-border flex justify-end gap-2 transition-colors">
                    <Button
                      variant="ghost"
                      className="text-[10px] font-bold h-8 uppercase tracking-widest rounded-lg hover:bg-secondary"
                    >
                      Reset
                    </Button>
                    <Button className="text-[10px] font-bold h-8 uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm">
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
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Aggregating Financial Data...
              </p>
            </div>
          )}

          {/* --- MAIN DASHBOARD CONTENT --- */}
          {!isLoading && reportData && (
            <>
              {/* --- EXECUTIVE SUMMARY (KPIs) --- */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <Activity className="w-16 h-16 text-foreground" />
                  </div>
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 z-10">
                    Gross Fleet Revenue
                  </span>
                  <span className="text-xl font-black text-foreground tracking-tight font-mono z-10">
                    ₱ {(reportData.kpis?.gross_revenue || 0).toLocaleString()}
                  </span>
                  <div className="mt-2 flex items-center gap-1.5 z-10">
                    <span className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest">
                      {reportData.kpis?.total_trips || 0} Completed Trips
                    </span>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <TrendingUp className="w-16 h-16 text-emerald-500" />
                  </div>
                  <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1 z-10">
                    Net Platform Profit
                  </span>
                  <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 tracking-tight font-mono z-10">
                    ₱ {(reportData.kpis?.platform_profit || 0).toLocaleString()}
                  </span>
                  <div className="mt-2 flex items-center gap-1.5 z-10">
                    <span className="text-[9px] font-medium text-emerald-600/80 dark:text-emerald-400/80 uppercase tracking-widest">
                      Based on configured shares
                    </span>
                  </div>
                </div>

                <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <AlertTriangle className="w-16 h-16 text-destructive" />
                  </div>
                  <span className="text-[9px] font-bold text-destructive uppercase tracking-widest mb-1 z-10">
                    Maintenance Costs
                  </span>
                  <span className="text-xl font-black text-destructive tracking-tight font-mono z-10">
                    - ₱{" "}
                    {(reportData.kpis?.maintenance_costs || 0).toLocaleString()}
                  </span>
                  <div className="mt-2 flex items-center gap-1.5 z-10">
                    <span className="text-[9px] font-medium text-destructive/80 uppercase tracking-widest">
                      Total operational repairs
                    </span>
                  </div>
                </div>

                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-xl shadow-sm flex flex-col justify-between relative overflow-hidden transition-colors">
                  <div className="absolute top-0 right-0 p-4 opacity-5">
                    <User className="w-16 h-16 text-blue-500" />
                  </div>
                  <span className="text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1 z-10">
                    Total Owner Payouts
                  </span>
                  <span className="text-xl font-black text-blue-600 dark:text-blue-400 tracking-tight font-mono z-10">
                    ₱ {(reportData.kpis?.owner_payouts || 0).toLocaleString()}
                  </span>
                  <div className="mt-2 flex items-center gap-1.5 z-10">
                    <span className="text-[9px] font-medium text-blue-600/80 dark:text-blue-400/80 uppercase tracking-widest">
                      Pending settlement
                    </span>
                  </div>
                </div>
              </div>

              {/* --- THE DATA GRIDS (TABS) --- */}
              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden min-h-[500px] transition-colors">
                <div className="border-b border-border bg-secondary/30 px-3 pt-2 flex items-center justify-between transition-colors">
                  <Tabs
                    value={activeTab}
                    onValueChange={handleTabChange}
                    className="w-full"
                  >
                    <TabsList className="bg-transparent h-9 p-0 flex gap-5 border-b-0 justify-start w-full overflow-x-auto custom-scrollbar">
                      <TabsTrigger
                        value="unit_economics"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground transition-all uppercase tracking-widest whitespace-nowrap"
                      >
                        Unit Economics
                      </TabsTrigger>
                      <TabsTrigger
                        value="partners"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground transition-all uppercase tracking-widest whitespace-nowrap"
                      >
                        Partner Settlements
                      </TabsTrigger>
                      <TabsTrigger
                        value="master_ledger"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground transition-all uppercase tracking-widest whitespace-nowrap"
                      >
                        Master Ledger
                      </TabsTrigger>
                      <TabsTrigger
                        value="bookings"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground transition-all uppercase tracking-widest whitespace-nowrap"
                      >
                        Booking Volume
                      </TabsTrigger>
                      <TabsTrigger
                        value="customers"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground transition-all uppercase tracking-widest whitespace-nowrap"
                      >
                        Customer Insights
                      </TabsTrigger>
                      <TabsTrigger
                        value="drivers"
                        className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 py-1.5 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground transition-all uppercase tracking-widest whitespace-nowrap"
                      >
                        Driver Performance
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                {/* TAB 1: UNIT ECONOMICS */}
                {activeTab === "unit_economics" && (
                  <div className="flex-1 bg-background transition-colors">
                    <div className="grid grid-cols-[2fr_1.5fr_0.5fr_1fr_1fr_1fr_0.3fr] p-2.5 px-4 border-b border-border bg-secondary/50 text-[9px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                      <div>Asset / Plate No.</div>
                      <div>Fleet Partner</div>
                      <div className="text-center">Trips</div>
                      <div className="text-right">Gross Rev</div>
                      <div className="text-right">Maint. Deduct</div>
                      <div className="text-right">Net Yield</div>
                      <div></div>
                    </div>
                    <div className="divide-y divide-border">
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
                                  "grid grid-cols-[2fr_1.5fr_0.5fr_1fr_1fr_1fr_0.3fr] p-2.5 px-4 items-center cursor-pointer transition-colors hover:bg-secondary/30",
                                  expandedRow === car.car_id &&
                                    "bg-secondary/30",
                                )}
                              >
                                <div className="flex flex-col pr-4">
                                  <span className="text-[11px] font-bold text-foreground truncate">
                                    {car.vehicle}
                                  </span>
                                  <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">
                                    {car.plate}
                                  </span>
                                </div>
                                <div className="flex flex-col pr-4">
                                  <span className="text-[11px] font-bold text-foreground truncate">
                                    {car.owner}
                                  </span>
                                  <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">
                                    {car.share}% Share
                                  </span>
                                </div>
                                <div className="text-center text-[11px] font-bold text-foreground">
                                  {car.trips}
                                </div>
                                <div className="text-right text-[11px] font-bold text-foreground font-mono">
                                  ₱ {car.gross.toLocaleString()}
                                </div>
                                <div className="text-right text-[11px] font-bold text-destructive font-mono">
                                  {car.maint < 0
                                    ? `- ₱ ${Math.abs(car.maint).toLocaleString()}`
                                    : "₱ 0"}
                                </div>
                                <div className="text-right flex flex-col items-end justify-center">
                                  <span
                                    className={cn(
                                      "text-[11px] font-bold font-mono",
                                      car.net < 0
                                        ? "text-destructive"
                                        : "text-foreground",
                                    )}
                                  >
                                    ₱ {car.net.toLocaleString()}
                                  </span>
                                  {car.status === "Loss" && (
                                    <Badge
                                      variant="outline"
                                      className="text-[8px] h-4 px-1 mt-1 bg-destructive/10 text-destructive border-destructive/20 uppercase tracking-widest"
                                    >
                                      LOSS
                                    </Badge>
                                  )}
                                </div>
                                <div className="flex justify-end pr-2 text-muted-foreground">
                                  {expandedRow === car.car_id ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="bg-secondary/30 border-t border-border transition-colors">
                              <div className="p-3 px-8">
                                <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 border-b border-border pb-1 w-max">
                                  Income Breakdown (Trips)
                                </h5>
                                {car.breakdown && car.breakdown.length > 0 ? (
                                  <div className="grid grid-cols-[1fr_2fr_1fr] gap-2 max-w-lg text-[10px]">
                                    {car.breakdown.map((trip: any) => (
                                      <React.Fragment key={trip.id}>
                                        <span className="font-mono font-bold text-foreground">
                                          {trip.id}
                                        </span>
                                        <span className="text-muted-foreground font-medium uppercase tracking-widest">
                                          {trip.dates}
                                        </span>
                                        <span className="text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                          + ₱ {trip.amount.toLocaleString()}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic">
                                    Detailed breakdown unavailable.
                                  </span>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-muted-foreground">
                          <FolderOpen className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            No active vehicles found in this date range.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 2: PARTNER SETTLEMENTS */}
                {activeTab === "partners" && (
                  <div className="flex-1 bg-background transition-colors">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_0.3fr] p-2.5 px-4 border-b border-border bg-secondary/50 text-[9px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                      <div>Fleet Partner Info</div>
                      <div>Active Fleet / Trips</div>
                      <div className="text-right">Gross Fleet Rev</div>
                      <div className="text-right">Platform Cut</div>
                      <div className="text-right">Maint. Deduct</div>
                      <div className="text-right">Net Payout</div>
                      <div></div>
                    </div>
                    <div className="divide-y divide-border">
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
                                  "grid grid-cols-[1.5fr_1fr_1fr_1fr_1fr_1fr_0.3fr] p-2.5 px-4 items-center cursor-pointer transition-colors hover:bg-secondary/30",
                                  expandedRow === prt.id && "bg-secondary/30",
                                )}
                              >
                                <div className="flex flex-col pr-4">
                                  <span className="text-[11px] font-bold text-foreground truncate flex items-center gap-1.5">
                                    <Briefcase className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                                    {prt.business}
                                  </span>
                                  <span className="text-[9px] font-medium text-muted-foreground mt-0.5 uppercase tracking-widest">
                                    {prt.name}
                                  </span>
                                </div>
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-foreground">
                                    {prt.active_cars} Cars
                                  </span>
                                  <span className="text-[9px] font-medium text-muted-foreground mt-0.5 uppercase tracking-widest">
                                    {prt.total_trips} Bookings
                                  </span>
                                </div>
                                <div className="text-right text-[11px] font-bold text-foreground font-mono">
                                  ₱ {prt.gross.toLocaleString()}
                                </div>
                                <div className="text-right text-[11px] font-bold text-destructive font-mono">
                                  - ₱{" "}
                                  {Math.abs(prt.platform_cut).toLocaleString()}
                                </div>
                                <div className="text-right text-[11px] font-bold text-destructive font-mono">
                                  {prt.maint < 0
                                    ? `- ₱ ${Math.abs(prt.maint).toLocaleString()}`
                                    : "₱ 0"}
                                </div>
                                <div className="text-right flex flex-col items-end justify-center">
                                  <span
                                    className={cn(
                                      "text-[11px] font-bold font-mono",
                                      prt.net_payout < 0
                                        ? "text-destructive"
                                        : "text-blue-600 dark:text-blue-400",
                                    )}
                                  >
                                    ₱ {prt.net_payout.toLocaleString()}
                                  </span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[8px] h-4 px-1.5 mt-1 uppercase tracking-widest border",
                                      prt.status === "Settled"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                                    )}
                                  >
                                    {prt.status}
                                  </Badge>
                                </div>
                                <div className="flex justify-end pr-2 text-muted-foreground">
                                  {expandedRow === prt.id ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="bg-secondary/30 border-t border-border transition-colors">
                              <div className="p-3 px-8">
                                <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 border-b border-border pb-1 w-max">
                                  Partner Itemized Ledger
                                </h5>
                                {prt.breakdown && prt.breakdown.length > 0 ? (
                                  <div className="grid grid-cols-[0.8fr_1.5fr_1.2fr_1fr_1fr_1fr_1fr] gap-x-4 gap-y-2 max-w-5xl text-[10px]">
                                    <div className="font-bold text-muted-foreground uppercase text-[9px] tracking-widest">
                                      Ref
                                    </div>
                                    <div className="font-bold text-muted-foreground uppercase text-[9px] tracking-widest">
                                      Vehicle
                                    </div>
                                    <div className="font-bold text-muted-foreground uppercase text-[9px] tracking-widest">
                                      Dates / Note
                                    </div>
                                    <div className="font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right">
                                      Gross
                                    </div>
                                    <div className="font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right">
                                      Comm.
                                    </div>
                                    <div className="font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right">
                                      Maint.
                                    </div>
                                    <div className="font-bold text-muted-foreground uppercase text-[9px] tracking-widest text-right">
                                      Net
                                    </div>

                                    {prt.breakdown.map((tx: any, i: number) => (
                                      <React.Fragment key={i}>
                                        <span className="font-mono font-bold text-foreground">
                                          {tx.id}
                                        </span>
                                        <span className="text-foreground font-medium truncate">
                                          {tx.vehicle}
                                        </span>
                                        <span className="text-muted-foreground uppercase tracking-widest text-[9px]">
                                          {tx.dates}
                                        </span>
                                        <span className="text-right font-mono text-foreground">
                                          {tx.gross > 0
                                            ? `₱ ${tx.gross.toLocaleString()}`
                                            : "-"}
                                        </span>
                                        <span className="text-right font-mono text-destructive">
                                          {tx.comm < 0
                                            ? `-₱ ${Math.abs(tx.comm).toLocaleString()}`
                                            : "-"}
                                        </span>
                                        <span className="text-right font-mono text-destructive">
                                          {tx.maint < 0
                                            ? `-₱ ${Math.abs(tx.maint).toLocaleString()}`
                                            : "-"}
                                        </span>
                                        <span
                                          className={cn(
                                            "text-right font-mono font-bold",
                                            tx.net < 0
                                              ? "text-destructive"
                                              : "text-foreground",
                                          )}
                                        >
                                          {tx.net < 0 ? "-" : ""}₱{" "}
                                          {Math.abs(tx.net).toLocaleString()}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic">
                                    No transactions found for this period.
                                  </span>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-muted-foreground">
                          <FolderOpen className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            No partner activity found in this date range.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 3: MASTER LEDGER */}
                {activeTab === "master_ledger" && (
                  <div className="flex-1 bg-background transition-colors">
                    <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] p-2.5 px-4 border-b border-border bg-secondary/50 text-[9px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                      <div>Date & Time</div>
                      <div>Reference</div>
                      <div>Category</div>
                      <div>Method</div>
                      <div className="text-right">Amount</div>
                    </div>
                    <div className="divide-y divide-border">
                      {reportData.master_ledger?.length > 0 ? (
                        reportData.master_ledger.map((txn: any) => (
                          <div
                            key={txn.id}
                            className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] p-2.5 px-4 items-center hover:bg-secondary/30 transition-colors"
                          >
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-foreground">
                                {format(new Date(txn.date), "MMM dd, yyyy")}
                              </span>
                              <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                                {format(new Date(txn.date), "hh:mm a")}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-foreground font-mono">
                                {txn.id}
                              </span>
                              <span className="text-[10px] font-medium text-muted-foreground truncate uppercase tracking-widest mt-0.5">
                                {txn.ref}
                              </span>
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className="text-[8px] font-bold uppercase tracking-widest bg-secondary text-muted-foreground border-border px-1.5 py-0 h-4 rounded"
                              >
                                {txn.category.replace(/_/g, " ")}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-1.5 text-[10px] font-medium text-muted-foreground uppercase tracking-widest">
                              <CreditCard className="w-3 h-3" />
                              {txn.method}
                            </div>
                            <div
                              className={cn(
                                "text-right text-[11px] font-bold font-mono",
                                txn.amount < 0
                                  ? "text-destructive"
                                  : "text-emerald-600 dark:text-emerald-400",
                              )}
                            >
                              {txn.amount > 0 ? "+" : ""} ₱{" "}
                              {Math.abs(txn.amount).toLocaleString()}
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-muted-foreground">
                          <FolderOpen className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            No financial transactions recorded in this period.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 4: BOOKING VOLUME */}
                {activeTab === "bookings" && (
                  <div className="flex-1 bg-background transition-colors">
                    <div className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_1fr] p-2.5 px-4 border-b border-border bg-secondary/50 text-[9px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                      <div>Booking Ref</div>
                      <div>Customer</div>
                      <div>Asset & Dates</div>
                      <div>Status</div>
                      <div className="text-right">Total Billed</div>
                      <div className="text-right">Balance Due</div>
                    </div>
                    <div className="divide-y divide-border">
                      {reportData.bookings?.length > 0 ? (
                        reportData.bookings.map((bkg: any) => (
                          <div
                            key={bkg.id}
                            className="grid grid-cols-[1fr_1.5fr_1.5fr_1fr_1fr_1fr] p-2.5 px-4 items-center hover:bg-secondary/30 transition-colors"
                          >
                            <span className="text-[11px] font-bold text-foreground font-mono">
                              {bkg.id}
                            </span>
                            <span className="text-[11px] font-bold text-foreground">
                              {bkg.customer}
                            </span>
                            <div className="flex flex-col">
                              <span className="text-[11px] font-bold text-foreground truncate">
                                {bkg.vehicle}
                              </span>
                              <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground mt-0.5">
                                {bkg.dates}
                              </span>
                            </div>
                            <div>
                              <Badge
                                variant="outline"
                                className="text-[8px] font-bold h-4 px-1.5 uppercase tracking-widest bg-secondary text-muted-foreground border-border rounded"
                              >
                                {bkg.status}
                              </Badge>
                            </div>
                            <span className="text-right text-[11px] font-bold text-foreground font-mono">
                              ₱ {bkg.total.toLocaleString()}
                            </span>
                            <span
                              className={cn(
                                "text-right text-[11px] font-bold font-mono",
                                bkg.due > 0
                                  ? "text-amber-600 dark:text-amber-400"
                                  : "text-emerald-600 dark:text-emerald-400",
                              )}
                            >
                              ₱ {bkg.due.toLocaleString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-muted-foreground">
                          <FolderOpen className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            No bookings created in this date range.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: CUSTOMER INSIGHTS */}
                {activeTab === "customers" && (
                  <div className="flex-1 bg-background transition-colors">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1.5fr_0.3fr] p-2.5 px-4 border-b border-border bg-secondary/50 text-[9px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                      <div>Customer Name</div>
                      <div className="text-center">Total Bookings</div>
                      <div className="text-right">Lifetime Value</div>
                      <div className="pl-6">Avg Duration</div>
                      <div>Account Flags</div>
                      <div></div>
                    </div>
                    <div className="divide-y divide-border">
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
                                  "grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1.5fr_0.3fr] p-2.5 px-4 items-center cursor-pointer transition-colors hover:bg-secondary/30",
                                  expandedRow === cus.id && "bg-secondary/30",
                                )}
                              >
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-foreground">
                                    {cus.name}
                                  </span>
                                  <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
                                    {split_part_mock(cus.id)}
                                  </span>
                                </div>
                                <div className="text-center text-[11px] font-bold text-foreground">
                                  {cus.bookings}
                                </div>
                                <div className="text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                  ₱ {cus.ltv.toLocaleString()}
                                </div>
                                <div className="text-[11px] font-medium text-foreground pl-6">
                                  {cus.avg_dur}
                                </div>
                                <div className="flex gap-1 flex-wrap">
                                  {cus.flags && cus.flags.length > 0 ? (
                                    cus.flags.map((f: string) => (
                                      <Badge
                                        key={f}
                                        variant="outline"
                                        className="text-[8px] h-4 px-1.5 uppercase tracking-widest bg-destructive/10 text-destructive border-destructive/20 rounded"
                                      >
                                        {f}
                                      </Badge>
                                    ))
                                  ) : (
                                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                      Clean Record
                                    </span>
                                  )}
                                </div>
                                <div className="flex justify-end pr-2 text-muted-foreground">
                                  {expandedRow === cus.id ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="bg-secondary/30 border-t border-border transition-colors">
                              <div className="p-3 px-8">
                                <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 border-b border-border pb-1 w-max">
                                  Transaction Ledger (Selected Period)
                                </h5>
                                {cus.breakdown && cus.breakdown.length > 0 ? (
                                  <div className="grid grid-cols-[0.8fr_1.5fr_1.5fr_1fr_1fr_0.5fr] gap-x-4 gap-y-2 max-w-4xl text-[10px]">
                                    {cus.breakdown.map((tx: any) => (
                                      <React.Fragment key={tx.id}>
                                        <span className="font-mono font-bold text-foreground">
                                          {tx.id}
                                        </span>
                                        <span className="text-muted-foreground font-medium uppercase tracking-widest text-[9px]">
                                          {tx.dates}
                                        </span>
                                        <span className="text-foreground font-bold">
                                          {tx.vehicle}
                                        </span>
                                        <span className="text-muted-foreground font-medium uppercase tracking-widest text-[9px]">
                                          {tx.type}
                                        </span>
                                        <span className="text-right font-mono font-bold text-foreground">
                                          ₱ {tx.amount.toLocaleString()}
                                        </span>
                                        <span
                                          className={cn(
                                            "text-right font-bold uppercase tracking-widest text-[8px]",
                                            tx.status === "Paid"
                                              ? "text-emerald-600 dark:text-emerald-400"
                                              : tx.status === "Unpaid"
                                                ? "text-destructive"
                                                : "text-amber-600 dark:text-amber-400",
                                          )}
                                        >
                                          {tx.status}
                                        </span>
                                      </React.Fragment>
                                    ))}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic">
                                    No transactions found for this period.
                                  </span>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-muted-foreground">
                          <FolderOpen className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
                            No customer activity found in this date range.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 6: DRIVER PERFORMANCE */}
                {activeTab === "drivers" && (
                  <div className="flex-1 bg-background transition-colors">
                    <div className="grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_0.3fr] p-2.5 px-4 border-b border-border bg-secondary/50 text-[9px] font-bold text-muted-foreground uppercase tracking-widest transition-colors">
                      <div>Driver Identity</div>
                      <div className="text-center">Deployed Shifts</div>
                      <div>Current Status</div>
                      <div>Primary Vehicle</div>
                      <div className="text-right">Est. Income / Fee</div>
                      <div></div>
                    </div>
                    <div className="divide-y divide-border">
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
                                  "grid grid-cols-[1.5fr_1fr_1fr_1.5fr_1fr_0.3fr] p-2.5 px-4 items-center cursor-pointer transition-colors hover:bg-secondary/30",
                                  expandedRow === drv.id && "bg-secondary/30",
                                )}
                              >
                                <div className="flex flex-col">
                                  <span className="text-[11px] font-bold text-foreground">
                                    {drv.name}
                                  </span>
                                  <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
                                    {split_part_mock(drv.id)}
                                  </span>
                                </div>
                                <div className="text-center text-[11px] font-bold text-foreground">
                                  {drv.shifts}
                                </div>
                                <div>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "text-[8px] font-bold h-4 px-1.5 uppercase tracking-widest rounded border",
                                      drv.status === "Available"
                                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                                        : "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
                                    )}
                                  >
                                    {drv.status}
                                  </Badge>
                                </div>
                                <div className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                                  <Car className="w-3 h-3 text-muted-foreground" />{" "}
                                  {drv.vehicle}
                                </div>
                                <div className="text-right text-[11px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                                  ₱ {drv.income.toLocaleString()}
                                </div>
                                <div className="flex justify-end pr-2 text-muted-foreground">
                                  {expandedRow === drv.id ? (
                                    <ChevronDown className="w-4 h-4" />
                                  ) : (
                                    <ChevronRight className="w-4 h-4" />
                                  )}
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            <CollapsibleContent className="bg-secondary/30 border-t border-border transition-colors">
                              <div className="p-3 px-8">
                                <h5 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 border-b border-border pb-1 w-max">
                                  Shift Ledger & Assignments
                                </h5>
                                {drv.breakdown && drv.breakdown.length > 0 ? (
                                  <div className="grid grid-cols-[1fr_2fr_1fr_1.5fr_1fr] gap-x-4 gap-y-2 max-w-4xl text-[10px]">
                                    {drv.breakdown.map(
                                      (shift: any, i: number) => (
                                        <React.Fragment key={i}>
                                          <span className="font-bold text-foreground">
                                            {shift.shift}
                                          </span>
                                          <span className="text-muted-foreground uppercase tracking-widest text-[9px] font-medium">
                                            {shift.date}
                                          </span>
                                          <span className="font-mono text-muted-foreground uppercase tracking-widest text-[9px]">
                                            {shift.ref}
                                          </span>
                                          <span className="text-foreground font-bold">
                                            {shift.vehicle}
                                          </span>
                                          <span className="text-right font-mono font-bold text-foreground">
                                            + ₱ {shift.fee.toLocaleString()}
                                          </span>
                                        </React.Fragment>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <span className="text-[10px] text-muted-foreground italic">
                                    No assigned shifts for this period.
                                  </span>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        ))
                      ) : (
                        <div className="p-10 flex flex-col items-center justify-center text-muted-foreground">
                          <FolderOpen className="w-8 h-8 mb-2 opacity-20" />
                          <p className="text-[10px] font-bold uppercase tracking-widest">
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
