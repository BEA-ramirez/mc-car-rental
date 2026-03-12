"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Calendar as CalendarIcon,
  Zap,
  Search,
  Activity,
  Car,
  CheckCircle2,
  X,
  Loader2,
  CarFront,
} from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard, useQuickInsights } from "../../../hooks/use-dashboard"; // <-- Added useQuickInsights
import { cn } from "@/lib/utils";

export default function QuickInsightsSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [category, setCategory] = useState("any");
  const [searchState, setSearchState] = useState<
    "idle" | "loading" | "results"
  >("idle");
  const [availableCars, setAvailableCars] = useState<any[]>([]);

  // Call the hooks!
  const { checkAvailability } = useDashboard();
  const { data: insights, isLoading: isInsightsLoading } = useQuickInsights();

  const handleSearch = async () => {
    if (!date) return;
    setSearchState("loading");
    try {
      const results = await checkAvailability({ category, date });
      setAvailableCars(results);
      setSearchState("results");
    } catch (error) {
      console.error(error);
      setSearchState("idle");
    }
  };

  const handleClear = () => {
    setSearchState("idle");
    setDate(new Date());
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:w-[400px] p-0 flex flex-col bg-slate-50 border-l-slate-200 font-sans"
      >
        <SheetHeader className="p-5 border-b border-slate-200 bg-white shrink-0 text-left">
          <SheetTitle className="text-sm font-bold flex items-center justify-between text-slate-900 w-full">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" /> Quick Actions &
              Insights
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div className="p-5 space-y-8">
            {/* TOOL 1: QUICK AVAILABILITY CHECK (Always Visible) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" /> Availability Check
                </h3>
                {searchState === "results" && (
                  <Button
                    variant="ghost"
                    onClick={handleClear}
                    className="h-5 px-1.5 text-[9px] font-bold text-slate-400 hover:text-slate-900 uppercase tracking-widest"
                  >
                    Clear Search <X className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>

              <div
                className={cn(
                  "bg-white border p-4 rounded-sm shadow-sm space-y-3 transition-colors duration-300",
                  searchState === "results"
                    ? "border-emerald-500/50 bg-emerald-50/10"
                    : "border-slate-200",
                )}
              >
                <Select defaultValue="any" onValueChange={setCategory}>
                  <SelectTrigger className="h-9 text-xs font-bold shadow-none rounded-sm bg-slate-50">
                    <SelectValue placeholder="Vehicle Category" />
                  </SelectTrigger>
                  <SelectContent className="text-xs">
                    <SelectItem value="any">Any Category</SelectItem>
                    <SelectItem value="SUV">SUV</SelectItem>
                    <SelectItem value="Sedan">Sedan</SelectItem>
                    <SelectItem value="Van">Van / MPV</SelectItem>
                  </SelectContent>
                </Select>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left text-xs font-bold h-9 rounded-sm shadow-none bg-slate-50"
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-400" />
                      {date ? format(date, "MMM dd, yyyy") : "Pick-up Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 rounded-sm"
                    align="start"
                  >
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                    />
                  </PopoverContent>
                </Popover>

                <Button
                  onClick={handleSearch}
                  disabled={searchState === "loading"}
                  className="w-full h-9 text-xs font-bold rounded-sm bg-slate-900 text-white hover:bg-slate-800 shadow-none mt-1"
                >
                  {searchState === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Check Availability"
                  )}
                </Button>
              </div>
            </div>

            {/* STATE: IDLE (Show Real Data from Hook) */}
            {searchState === "idle" && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isInsightsLoading || !insights ? (
                  // Skeleton Loading State
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <Skeleton className="h-3 w-32 bg-slate-200 mt-6" />
                      <Skeleton className="h-[150px] w-full bg-slate-100 rounded-sm" />
                    </div>
                    <div className="space-y-4">
                      <Skeleton className="h-3 w-32 bg-slate-200 mt-6" />
                      <Skeleton className="h-[250px] w-full bg-slate-100 rounded-sm" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* TOOL 2: LIVE INVENTORY */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 border-t border-slate-200 pt-6">
                        <Car className="w-3.5 h-3.5" /> Live Inventory (Today)
                      </h3>
                      <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm space-y-5">
                        {insights.inventory.map((inv: any, i: number) => (
                          <div key={i} className="space-y-2">
                            <div className="flex justify-between text-[10px] font-bold uppercase tracking-wider">
                              <span className="text-slate-700">
                                {inv.label}
                              </span>
                              <span
                                className={cn(
                                  "text-slate-500",
                                  inv.percentage >= 100 && "text-red-600",
                                )}
                              >
                                {inv.percentage}% Booked
                              </span>
                            </div>
                            <Progress
                              value={inv.percentage}
                              className={cn(
                                "h-1.5 bg-slate-100",
                                inv.indicatorClass,
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TOOL 3: SYSTEM ACTIVITY */}
                    <div className="space-y-4">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 border-t border-slate-200 pt-6">
                        <Activity className="w-3.5 h-3.5" /> Recent Activity
                      </h3>
                      <div className="relative border-l border-slate-200 ml-2 pl-4 space-y-5 py-1">
                        {insights.logs.length === 0 ? (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            No recent logs.
                          </span>
                        ) : (
                          insights.logs.map((log: any) => (
                            <div
                              key={log.id}
                              className="relative group cursor-default"
                            >
                              <div
                                className={cn(
                                  "absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-4 ring-slate-50",
                                  log.dotClass,
                                )}
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-xs font-bold text-slate-900 leading-none">
                                    {log.title}
                                  </span>
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mt-0.5">
                                    {log.time}
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium text-slate-600 leading-snug pr-2">
                                  {log.text}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* STATE: LOADING (Search) */}
            {searchState === "loading" && (
              <div className="space-y-4 animate-in fade-in duration-300">
                <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2 border-t border-slate-200 pt-6">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching
                  Fleet...
                </h3>
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white border border-slate-200 p-4 rounded-sm shadow-sm flex gap-4 items-center"
                    >
                      <Skeleton className="h-10 w-10 rounded-sm bg-slate-100 shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4 bg-slate-100" />
                        <Skeleton className="h-3 w-1/2 bg-slate-100" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATE: RESULTS (Show Available Cars) */}
            {searchState === "results" && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-t border-slate-200 pt-6 mb-2">
                  <h3 className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                    {availableCars.length} Vehicles Available
                  </h3>
                </div>

                <div className="space-y-3">
                  {availableCars.map((car) => (
                    <div
                      key={car.car_id}
                      className="bg-white border border-slate-200 p-3 rounded-sm shadow-sm flex items-center gap-3 group hover:border-slate-300 transition-colors"
                    >
                      <div className="w-10 h-10 bg-slate-50 border border-slate-100 rounded-sm flex items-center justify-center shrink-0">
                        <CarFront className="w-5 h-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-slate-900 truncate">
                          {car.brand} {car.model}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider bg-slate-100 px-1 rounded-sm leading-tight">
                            {car.plate_number}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] font-bold uppercase tracking-wider flex items-center gap-1",
                              car.availability_status === "Available"
                                ? "text-emerald-600"
                                : "text-amber-500",
                            )}
                          >
                            • {car.availability_status}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end shrink-0 gap-1.5 border-l border-slate-100 pl-3">
                        <span className="text-[11px] font-black text-slate-900 font-mono">
                          ₱{car.rental_rate_per_day?.toLocaleString() || "0"}{" "}
                          <span className="text-[9px] text-slate-400 font-sans font-medium">
                            /day
                          </span>
                        </span>
                        <Button
                          size="sm"
                          className="h-6 px-3 text-[9px] font-bold uppercase tracking-widest rounded-sm bg-slate-900 text-white hover:bg-slate-800 shadow-none"
                        >
                          Reserve
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
