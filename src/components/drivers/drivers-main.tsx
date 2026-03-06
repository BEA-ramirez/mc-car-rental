"use client";

import React, { useState } from "react";
import { Search, Plus, Loader2, UserCircle, Briefcase } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";
import { useDrivers } from "../../../hooks/use-drivers";
import { CompleteDriverType } from "@/lib/schemas/driver";

// Import our new separated components
import DriverProfileHeader from "./driver-profile-header";
import DriverScheduleTab from "./driver-schedule-tab";
import DriverPerformanceTab from "./driver-performance-tab";
import DriverDocsTab from "./driver-docs-tab";

export default function DriversMain() {
  const [selectedDriver, setSelectedDriver] =
    useState<CompleteDriverType | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: drivers, isLoading } = useDrivers();

  const filteredDrivers =
    drivers?.filter(
      (d) =>
        d.profiles?.full_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        d.display_id?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  return (
    // Strictly lock the viewport height and prevent outer scrolling
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-hidden">
      {/* GLOBAL PAGE HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <UserCircle className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              Driver Management
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Manage dispatch rosters, compliance, and performance logs.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" /> Register Driver
        </Button>
      </div>

      {/* TWO-COLUMN WORKSPACE */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* LEFT SIDEBAR: ROSTER */}
        <div className="w-[320px] bg-white border-r border-slate-200 flex flex-col shrink-0 z-10">
          <div className="p-3 border-b border-slate-100 bg-slate-50/80 shrink-0">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search name or ID..."
                className="pl-8 h-8 text-xs bg-white border-slate-200 focus-visible:ring-1 rounded-sm shadow-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-2 space-y-1">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                </div>
              ) : filteredDrivers.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-500 font-bold">
                  No drivers found.
                </div>
              ) : (
                filteredDrivers.map((driver) => {
                  const isActive =
                    selectedDriver?.driver_id === driver.driver_id;
                  return (
                    <div
                      key={driver.driver_id}
                      onClick={() => setSelectedDriver(driver)}
                      className={cn(
                        "flex items-center gap-3 p-2.5 rounded-sm cursor-pointer transition-all border",
                        isActive
                          ? "bg-slate-900 border-slate-900 shadow-sm"
                          : "bg-white border-transparent hover:bg-slate-50 hover:border-slate-200",
                      )}
                    >
                      <Avatar
                        className={cn(
                          "h-9 w-9 border shrink-0",
                          isActive ? "border-slate-700" : "border-slate-200",
                        )}
                      >
                        <AvatarImage
                          src={
                            driver.profiles?.profile_picture_url || undefined
                          }
                        />
                        <AvatarFallback
                          className={cn(
                            "text-[10px] font-bold",
                            isActive
                              ? "bg-slate-800 text-slate-200"
                              : "bg-slate-100 text-slate-600",
                          )}
                        >
                          {getInitials(driver.profiles?.full_name || "D")}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <div className="flex items-center justify-between mb-0.5">
                          <span
                            className={cn(
                              "text-xs font-bold truncate pr-2",
                              isActive ? "text-white" : "text-slate-900",
                            )}
                          >
                            {toTitleCase(
                              driver.profiles?.full_name || "Unknown",
                            )}
                          </span>
                          <div
                            className={cn(
                              "w-1.5 h-1.5 rounded-full shrink-0",
                              driver.driver_status === "Available"
                                ? "bg-emerald-500"
                                : driver.driver_status === "On Trip"
                                  ? "bg-blue-500"
                                  : "bg-amber-500",
                            )}
                          />
                        </div>
                        <div className="flex items-center justify-between">
                          <span
                            className={cn(
                              "text-[10px] font-mono",
                              isActive ? "text-slate-400" : "text-slate-500",
                            )}
                          >
                            {driver.display_id}
                          </span>
                          <span
                            className={cn(
                              "text-[10px] font-medium",
                              isActive ? "text-slate-400" : "text-slate-400",
                            )}
                          >
                            {driver.is_verified ? "Verified" : "Pending"}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT PANEL: DETAILS (Scrollable independently, min-w-0 prevents horizontal blowout) */}
        <div className="flex-1 min-w-0 flex flex-col bg-slate-50 overflow-hidden">
          {!selectedDriver ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
              <Briefcase className="w-16 h-16 mb-4 opacity-20" />
              <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">
                No Driver Selected
              </h3>
            </div>
          ) : (
            <ScrollArea className="flex-1 w-full h-full">
              <div className="max-w-[1200px] w-full mx-auto p-6 space-y-6">
                {/* 1. COMPACT DRIVER INFO HEADER */}
                <DriverProfileHeader driver={selectedDriver} />

                {/* 2. TABS NAVIGATION */}
                <Tabs
                  defaultValue="sched"
                  className="w-full flex flex-col min-w-0"
                >
                  <TabsList className="bg-transparent border-b border-slate-200 h-10 p-0 flex justify-start w-full rounded-none mb-6">
                    <TabsTrigger
                      value="sched"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 uppercase tracking-widest"
                    >
                      Schedule & Dispatch
                    </TabsTrigger>
                    <TabsTrigger
                      value="performance"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 uppercase tracking-widest"
                    >
                      Performance & Wallet
                    </TabsTrigger>
                    <TabsTrigger
                      value="docs"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 uppercase tracking-widest"
                    >
                      Compliance Docs
                    </TabsTrigger>
                  </TabsList>

                  {/* TAB CONTENTS */}
                  <TabsContent
                    value="sched"
                    className="m-0 outline-none min-w-0"
                  >
                    <DriverScheduleTab />
                  </TabsContent>

                  <TabsContent
                    value="performance"
                    className="m-0 outline-none min-w-0"
                  >
                    <DriverPerformanceTab />
                  </TabsContent>

                  <TabsContent
                    value="docs"
                    className="m-0 outline-none min-w-0"
                  >
                    <DriverDocsTab />
                  </TabsContent>
                </Tabs>
              </div>
            </ScrollArea>
          )}
        </div>
      </div>
    </div>
  );
}
