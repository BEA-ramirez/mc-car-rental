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

const getStatusConfig = (status: StatusType) => {
  switch (status) {
    case "Available":
      return {
        color: "bg-emerald-500",
        text: "text-emerald-700",
        border: "border-emerald-200",
        bg: "bg-emerald-50",
      };
    case "Deployed":
      return {
        color: "bg-blue-500",
        text: "text-blue-700",
        border: "border-blue-200",
        bg: "bg-blue-50",
      };
    case "Returning Today":
      return {
        color: "bg-amber-500",
        text: "text-amber-700",
        border: "border-amber-200",
        bg: "bg-amber-50",
      };
    case "Reserved":
      return {
        color: "bg-orange-500",
        text: "text-orange-700",
        border: "border-orange-200",
        bg: "bg-orange-50",
      };
    case "Maintenance":
      return {
        color: "bg-red-500",
        text: "text-red-700",
        border: "border-red-200",
        bg: "bg-red-50",
      };
    default:
      return {
        color: "bg-slate-500",
        text: "text-slate-700",
        border: "border-slate-200",
        bg: "bg-slate-50",
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
          className="h-8 text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-none border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hidden sm:flex cursor-pointer"
        >
          <Search className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
          Car Catalogue
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-[95vw] md:max-w-5xl h-[85vh] p-0 flex flex-col bg-slate-50 border-slate-200 rounded-md overflow-hidden gap-0">
        {/* Hidden title for screen readers */}
        <DialogTitle className="sr-only">Car Catalogue</DialogTitle>

        {/* HEADER & CONTROLS */}
        <div className="px-6 py-5 border-b border-slate-200 bg-white shrink-0 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Fleet Command Board
              </h1>
              <p className="text-[11px] font-medium text-slate-500 leading-none">
                Live status and deployment tracking for all assets.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto pr-6 sm:pr-0">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <Input
                  placeholder="Search model or plate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs font-medium bg-slate-50 border-slate-200 shadow-none focus-visible:ring-1 focus-visible:ring-slate-300 rounded-sm w-full"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-sm border-slate-200 shadow-none shrink-0 text-slate-500"
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
            <TabsList className="h-8 bg-slate-100 p-0.5 rounded-sm border border-slate-200 flex w-fit overflow-x-auto custom-scrollbar">
              <TabsTrigger
                value="All"
                className="h-6 text-[10px] font-bold px-4 rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
              >
                All ({counts.All})
              </TabsTrigger>
              <TabsTrigger
                value="SUV"
                className="h-6 text-[10px] font-bold px-4 rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
              >
                SUVs ({counts.SUV})
              </TabsTrigger>
              <TabsTrigger
                value="Sedan"
                className="h-6 text-[10px] font-bold px-4 rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
              >
                Sedans ({counts.Sedan})
              </TabsTrigger>
              <TabsTrigger
                value="Van"
                className="h-6 text-[10px] font-bold px-4 rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
              >
                Vans ({counts.Van})
              </TabsTrigger>
              <TabsTrigger
                value="Pickup"
                className="h-6 text-[10px] font-bold px-4 rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
              >
                Pickups ({counts.Pickup})
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* ASSET GRID */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50">
          {filteredFleet.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <CarFront className="w-8 h-8 mb-2 opacity-20" />
              <span className="text-xs font-bold uppercase tracking-widest">
                No assets found
              </span>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredFleet.map((car) => {
                const config = getStatusConfig(car.status as StatusType);

                return (
                  <div
                    key={car.id}
                    className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col overflow-hidden hover:border-slate-300 hover:shadow transition-all group cursor-default"
                  >
                    <div className="px-3 py-2.5 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
                      <div className="flex flex-col min-w-0 pr-2">
                        <span className="text-[11px] font-bold text-slate-900 truncate leading-tight">
                          {car.model}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                          {car.category}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 -mr-1 text-slate-400 hover:text-slate-900 shrink-0"
                      >
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="p-3 flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-sm uppercase tracking-wider shadow-sm">
                          {car.plate}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          {car.id}
                        </span>
                      </div>

                      <div className="space-y-1.5">
                        <div
                          className={cn(
                            "inline-flex items-center gap-1.5 px-2 py-1 rounded-sm border",
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
                        <p className="text-[10px] font-medium text-slate-500 leading-snug pl-0.5">
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
