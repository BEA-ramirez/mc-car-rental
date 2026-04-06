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
import { useDashboard, useQuickInsights } from "../../../hooks/use-dashboard";
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

  // Call the hooks
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
        className="w-full sm:w-[400px] p-0 flex flex-col bg-background border-l border-border font-sans transition-colors duration-300"
      >
        <SheetHeader className="p-4 border-b border-border bg-card shrink-0 text-left transition-colors duration-300">
          <SheetTitle className="text-[13px] font-bold flex items-center justify-between text-foreground w-full uppercase tracking-wider">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" /> Quick actions & insights
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar min-h-0">
          <div className="p-4 space-y-6">
            {/* TOOL 1: QUICK AVAILABILITY CHECK (Always Visible) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" /> Availability Check
                </h3>
                {searchState === "results" && (
                  <Button
                    variant="ghost"
                    onClick={handleClear}
                    className="h-5 px-1.5 text-[9px] font-bold text-muted-foreground hover:text-foreground uppercase tracking-widest"
                  >
                    Clear search <X className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>

              <div
                className={cn(
                  "bg-card border p-4 rounded-xl shadow-sm space-y-3 transition-colors duration-300",
                  searchState === "results"
                    ? "border-primary/50 bg-primary/5"
                    : "border-border",
                )}
              >
                <Select defaultValue="any" onValueChange={setCategory}>
                  <SelectTrigger className="h-9 text-[11px] font-semibold shadow-none rounded-lg bg-secondary border-border focus:ring-primary text-foreground">
                    <SelectValue placeholder="Vehicle category" />
                  </SelectTrigger>
                  <SelectContent className="text-[11px] font-medium bg-popover border-border">
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
                      className="w-full justify-start text-left text-[11px] font-semibold h-9 rounded-lg shadow-none bg-secondary border-border text-foreground hover:bg-secondary/80 hover:text-foreground"
                    >
                      <CalendarIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                      {date ? format(date, "MMM dd, yyyy") : "Pick-up Date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent
                    className="w-auto p-0 rounded-lg border-border bg-popover"
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
                  className="w-full h-9 text-[11px] font-bold uppercase tracking-wider rounded-lg bg-primary text-primary-foreground hover:opacity-90 shadow-sm mt-1 transition-opacity"
                >
                  {searchState === "loading" ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "Check availability"
                  )}
                </Button>
              </div>
            </div>

            {/* STATE: IDLE (Show Real Data from Hook) */}
            {searchState === "idle" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {isInsightsLoading || !insights ? (
                  // Skeleton Loading State
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Skeleton className="h-3 w-32 bg-muted mt-4" />
                      <Skeleton className="h-[120px] w-full bg-muted rounded-xl" />
                    </div>
                    <div className="space-y-3">
                      <Skeleton className="h-3 w-32 bg-muted mt-4" />
                      <Skeleton className="h-[200px] w-full bg-muted rounded-xl" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* TOOL 2: LIVE INVENTORY */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2 border-t border-border pt-5">
                        <Car className="w-3.5 h-3.5" /> Live inventory (Today)
                      </h3>
                      <div className="bg-card border border-border p-4 rounded-xl shadow-sm space-y-4">
                        {insights.inventory.map((inv: any, i: number) => (
                          <div key={i} className="space-y-1.5">
                            <div className="flex justify-between text-[10px] font-semibold">
                              <span className="text-foreground">
                                {inv.label}
                              </span>
                              <span
                                className={cn(
                                  "text-muted-foreground",
                                  inv.percentage >= 100 &&
                                    "text-destructive font-bold",
                                )}
                              >
                                {inv.percentage}% Booked
                              </span>
                            </div>
                            <Progress
                              value={inv.percentage}
                              className={cn(
                                "h-1.5 bg-secondary",
                                inv.indicatorClass,
                              )}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* TOOL 3: SYSTEM ACTIVITY */}
                    <div className="space-y-3">
                      <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2 border-t border-border pt-5">
                        <Activity className="w-3.5 h-3.5" /> Recent activity
                      </h3>
                      <div className="relative border-l border-border ml-2 pl-4 space-y-4 py-1">
                        {insights.logs.length === 0 ? (
                          <span className="text-[10px] font-medium text-muted-foreground">
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
                                  "absolute -left-[21px] top-1 w-2 h-2 rounded-full ring-4 ring-background",
                                  log.dotClass || "bg-muted-foreground",
                                )}
                              />
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <span className="text-[11px] font-semibold text-foreground leading-none">
                                    {log.title}
                                  </span>
                                  <span className="text-[9px] font-medium text-muted-foreground leading-none mt-0.5">
                                    {log.time}
                                  </span>
                                </div>
                                <p className="text-[10px] font-medium text-muted-foreground leading-snug pr-2">
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
              <div className="space-y-3 animate-in fade-in duration-300">
                <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-2 border-t border-border pt-5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Searching
                  fleet...
                </h3>
                <div className="space-y-2.5">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-card border border-border p-3 rounded-xl shadow-sm flex gap-3 items-center"
                    >
                      <Skeleton className="h-10 w-10 rounded-lg bg-muted shrink-0" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-3 w-3/4 bg-muted" />
                        <Skeleton className="h-2 w-1/2 bg-muted" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STATE: RESULTS (Show Available Cars) */}
            {searchState === "results" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="flex items-center justify-between border-t border-border pt-5 mb-2">
                  <h3 className="text-[10px] font-bold text-primary uppercase tracking-widest flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />{" "}
                    {availableCars.length} Vehicles Available
                  </h3>
                </div>

                <div className="space-y-2.5">
                  {availableCars.map((car) => (
                    <div
                      key={car.car_id}
                      className="bg-card border border-border p-3 rounded-xl shadow-sm flex items-center gap-3 group hover:border-primary/50 transition-colors"
                    >
                      <div className="w-10 h-10 bg-secondary border border-border rounded-lg flex items-center justify-center shrink-0">
                        <CarFront className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="text-[11px] font-bold text-foreground truncate">
                          {car.brand} {car.model}
                        </h4>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9px] font-mono text-muted-foreground uppercase bg-secondary px-1.5 py-0.5 rounded leading-tight">
                            {car.plate_number}
                          </span>
                          <span
                            className={cn(
                              "text-[9px] font-semibold flex items-center gap-1",
                              car.availability_status === "Available"
                                ? "text-emerald-500"
                                : "text-amber-500",
                            )}
                          >
                            • {car.availability_status}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col items-end shrink-0 gap-1.5 border-l border-border pl-3">
                        <span className="text-[11px] font-black text-foreground font-mono">
                          ₱{car.rental_rate_per_day?.toLocaleString() || "0"}{" "}
                          <span className="text-[9px] text-muted-foreground font-sans font-medium">
                            /day
                          </span>
                        </span>
                        <Button
                          size="sm"
                          className="h-6 px-3 text-[9px] font-bold uppercase tracking-widest rounded-md bg-primary text-primary-foreground hover:opacity-90 shadow-none transition-opacity"
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
