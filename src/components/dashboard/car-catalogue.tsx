"use client";

import React, { useState, useMemo } from "react";
import { Search, Filter, MoreHorizontal, CarFront } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

// --- MOCK DATA ---
type StatusType =
  | "Available"
  | "Deployed"
  | "Returning Today"
  | "Reserved"
  | "Maintenance";

const mockFleet = [
  {
    id: "V-01",
    model: "Toyota Fortuner",
    plate: "ABC-1234",
    category: "SUV",
    status: "Available",
    context: "Next: Tomorrow, 8:00 AM",
  },
  {
    id: "V-02",
    model: "Ford Territory",
    plate: "DEF-5678",
    category: "SUV",
    status: "Deployed",
    context: "Due: Mar 15, 2:00 PM",
  },
  {
    id: "V-03",
    model: "Mitsubishi Montero",
    plate: "GHI-9012",
    category: "SUV",
    status: "Returning Today",
    context: "Due: Today, 5:00 PM",
  },
  {
    id: "V-04",
    model: "Nissan Terra",
    plate: "JKL-3456",
    category: "SUV",
    status: "Maintenance",
    context: "Est. Done: Mar 12",
  },
  {
    id: "V-05",
    model: "Honda CR-V",
    plate: "MNO-7890",
    category: "SUV",
    status: "Reserved",
    context: "Pickup: Today, 1:00 PM",
  },
  {
    id: "V-06",
    model: "Toyota Vios",
    plate: "PQR-1122",
    category: "Sedan",
    status: "Available",
    context: "Next: Mar 18, 9:00 AM",
  },
  {
    id: "V-07",
    model: "Honda City",
    plate: "STU-3344",
    category: "Sedan",
    status: "Deployed",
    context: "Due: Mar 14, 10:00 AM",
  },
  {
    id: "V-08",
    model: "Nissan Almera",
    plate: "VWX-5566",
    category: "Sedan",
    status: "Available",
    context: "Next: Mar 11, 7:00 AM",
  },
  {
    id: "V-09",
    model: "Toyota Hiace",
    plate: "YZA-7788",
    category: "Van",
    status: "Deployed",
    context: "Due: Mar 20, 12:00 PM",
  },
  {
    id: "V-10",
    model: "Nissan Urvan",
    plate: "BCD-9900",
    category: "Van",
    status: "Returning Today",
    context: "Due: Today, 8:00 PM",
  },
  {
    id: "V-11",
    model: "Ford Ranger",
    plate: "EFG-1234",
    category: "Pickup",
    status: "Maintenance",
    context: "Routine PMS",
  },
  {
    id: "V-12",
    model: "Toyota Hilux",
    plate: "HIJ-5678",
    category: "Pickup",
    status: "Available",
    context: "Ready in lot",
  },
];

// Theme-aware status configuration
const getStatusConfig = (status: StatusType) => {
  switch (status) {
    case "Available":
      return {
        color: "bg-emerald-500",
        text: "text-emerald-600 dark:text-emerald-400",
        border: "border-emerald-500/20",
        bg: "bg-emerald-500/10",
      };
    case "Deployed":
      return {
        color: "bg-blue-500",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-500/20",
        bg: "bg-blue-500/10",
      };
    case "Returning Today":
      return {
        color: "bg-amber-500",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-500/20",
        bg: "bg-amber-500/10",
      };
    case "Reserved":
      return {
        color: "bg-orange-500",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-500/20",
        bg: "bg-orange-500/10",
      };
    case "Maintenance":
      return {
        color: "bg-red-500",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-500/20",
        bg: "bg-red-500/10",
      };
    default:
      return {
        color: "bg-secondary-foreground",
        text: "text-muted-foreground",
        border: "border-border",
        bg: "bg-secondary",
      };
  }
};

export default function CarCatalogueModal() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFleet = useMemo(() => {
    return mockFleet.filter((car) => {
      const matchesTab = activeTab === "All" || car.category === activeTab;
      const matchesSearch =
        car.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
        car.plate.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTab && matchesSearch;
    });
  }, [activeTab, searchQuery]);

  const counts = useMemo(() => {
    const c = { All: mockFleet.length, SUV: 0, Sedan: 0, Van: 0, Pickup: 0 };
    mockFleet.forEach((car) => {
      if (c[car.category as keyof typeof c] !== undefined)
        c[car.category as keyof typeof c]++;
    });
    return c;
  }, []);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[10px] font-semibold uppercase tracking-widest rounded-md shadow-none border-border bg-card hover:bg-secondary text-foreground hidden sm:flex cursor-pointer transition-colors"
        >
          <Search className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
          Car Catalog
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] md:max-w-5xl h-[85vh] p-0 flex flex-col bg-background border-border rounded-xl overflow-hidden gap-0 shadow-2xl transition-colors duration-300">
        {/* Hidden title for screen readers */}
        <DialogTitle className="sr-only">Car Catalogue</DialogTitle>

        {/* HEADER & CONTROLS */}
        <div className="px-5 py-4 border-b border-border bg-card shrink-0 space-y-4 transition-colors duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1">
                Fleet Command Board
              </h1>
              <p className="text-[11px] font-medium text-muted-foreground leading-none">
                Live status and deployment tracking for all assets.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto pr-6 sm:pr-0">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search model or plate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-[11px] font-medium bg-secondary border-border text-foreground shadow-none focus-visible:ring-1 focus-visible:ring-primary rounded-md w-full transition-colors"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-md border-border bg-card shadow-none shrink-0 text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Filter className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          {/* CATEGORY TABS */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="h-8 bg-secondary p-0.5 rounded-lg border border-border flex w-fit overflow-x-auto custom-scrollbar">
              {Object.entries(counts).map(([key, count]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="h-6 text-[10px] font-semibold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all"
                >
                  {key === "All" ? "All" : `${key}s`} ({count})
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* ASSET GRID */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-5 bg-background transition-colors duration-300">
          {filteredFleet.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <CarFront className="w-8 h-8 mb-2 opacity-20" />
              <span className="text-[10px] font-semibold uppercase tracking-widest">
                No assets found
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
              {filteredFleet.map((car) => {
                const config = getStatusConfig(car.status as StatusType);

                return (
                  <div
                    key={car.id}
                    className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden hover:border-primary/50 transition-all group cursor-default"
                  >
                    <div className="px-3 py-2.5 border-b border-border flex items-start justify-between bg-secondary/30">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[11px] font-bold text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                          {car.model}
                        </span>
                        <span className="text-[9px] font-semibold text-muted-foreground uppercase tracking-widest mt-0.5">
                          {car.category}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 -mr-1 text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="p-3 flex flex-col gap-3 bg-card">
                      <div className="flex items-center justify-between">
                        <span className="bg-secondary border border-border text-muted-foreground text-[10px] font-semibold font-mono px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          {car.plate}
                        </span>
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          {car.id}
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-md border",
                            config.bg,
                            config.border,
                          )}
                        >
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shadow-sm",
                              config.color,
                            )}
                          />
                          <span
                            className={cn(
                              "text-[9px] font-bold uppercase tracking-widest leading-none",
                              config.text,
                            )}
                          >
                            {car.status}
                          </span>
                        </div>
                        <p className="text-[10px] font-medium text-muted-foreground leading-snug pl-0.5">
                          {car.context}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
