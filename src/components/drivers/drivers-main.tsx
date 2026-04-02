"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Loader2, Briefcase, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";
import { useDrivers } from "../../../hooks/use-drivers";
import { CompleteDriverType } from "@/lib/schemas/driver";

// Import components
import DriverProfileHeader from "./driver-profile-header";
import DispatchCalendar, {
  ScheduleBooking,
} from "@/components/drivers/dispatch-calendar";
import DriverPerformanceTab from "./driver-performance-tab";
import DriverDocsTab from "./driver-docs-tab";
import DriverForm from "./driver-form";

interface DriversMainProps {
  schedules?: ScheduleBooking[];
  isSchedulesLoading?: boolean;
  // --- NEW PROPS FOR DRIVER PORTAL ---
  isDriverMode?: boolean;
  currentDriverData?: CompleteDriverType | null;
}

export default function DriversMain({
  schedules = [],
  isSchedulesLoading = false,
  isDriverMode = false,
  currentDriverData = null,
}: DriversMainProps) {
  // If in driver mode, the selected driver is permanently locked to themselves.
  const [selectedDriver, setSelectedDriver] =
    useState<CompleteDriverType | null>(currentDriverData);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);

  const { data: drivers, isLoading: isDriversLoading } = useDrivers();

  // Keep state synced if currentDriverData loads asynchronously
  useEffect(() => {
    if (isDriverMode && currentDriverData) {
      setSelectedDriver(currentDriverData);
    }
  }, [isDriverMode, currentDriverData]);

  const filteredDrivers =
    drivers?.filter(
      (d) =>
        d.profiles?.full_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        d.display_id?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const driverSpecificSchedules = schedules.filter(
    (s) => s.driver_id === selectedDriver?.driver_id,
  );

  // ==========================================
  // VIEW 1: DRIVER MOBILE DASHBOARD
  // ==========================================
  if (isDriverMode) {
    if (!selectedDriver) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-slate-50">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400 mb-4" />
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Loading Your Profile...
          </p>
        </div>
      );
    }

    return (
      // Mobile-native layout: No fixed heights, natural body scrolling, no borders
      <div className="flex flex-col w-full min-h-screen bg-slate-50 pb-20">
        <div className="bg-white shadow-sm border-b border-slate-200">
          <DriverProfileHeader driver={selectedDriver} isSelfView={true} />
        </div>

        <div className="px-4 pt-6">
          <Tabs defaultValue="sched" className="flex flex-col w-full">
            <TabsList className="bg-white shadow-sm border border-slate-200 h-11 p-1 flex justify-start w-full rounded-md mb-6 overflow-x-auto custom-scrollbar">
              <TabsTrigger
                value="sched"
                className="flex-1 rounded-sm px-4 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none uppercase tracking-widest whitespace-nowrap"
              >
                Schedule
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="flex-1 rounded-sm px-4 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none uppercase tracking-widest whitespace-nowrap"
              >
                Wallet
              </TabsTrigger>
              <TabsTrigger
                value="docs"
                className="flex-1 rounded-sm px-4 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 data-[state=active]:bg-slate-100 data-[state=active]:shadow-none uppercase tracking-widest whitespace-nowrap"
              >
                Docs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sched" className="m-0 outline-none">
              <DispatchCalendar
                bookings={driverSpecificSchedules}
                isLoading={isSchedulesLoading}
                mode="specific"
              />
            </TabsContent>

            <TabsContent value="performance" className="m-0 outline-none">
              <DriverPerformanceTab driverId={selectedDriver.driver_id || ""} />
            </TabsContent>

            <TabsContent value="docs" className="m-0 outline-none">
              <DriverDocsTab driverId={selectedDriver.driver_id || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ADMIN MASTER MANAGEMENT
  // ==========================================
  return (
    <div className="flex flex-col md:flex-row w-full min-h-[600px] md:h-[800px] bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
      {/* LEFT SIDEBAR: ROSTER */}
      <div className="w-full md:w-[280px] flex flex-col border-b md:border-b-0 md:border-r border-slate-200 bg-slate-50/50 shrink-0 z-10 h-[350px] md:h-full">
        {/* Sidebar Header & Search */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
              Driver Roster
            </h2>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-sm hover:bg-slate-100 text-slate-600"
              onClick={() => setOpenDialog(true)}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search name or ID..."
              className="pl-8 h-9 text-xs bg-slate-50 border-slate-200 focus-visible:ring-1 rounded-sm shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable Driver List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2.5 space-y-1">
            {isDriversLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500 font-bold">
                No drivers found.
              </div>
            ) : (
              filteredDrivers.map((driver) => {
                const isActive = selectedDriver?.driver_id === driver.driver_id;
                return (
                  <div
                    key={driver.driver_id}
                    onClick={() => setSelectedDriver(driver)}
                    className={cn(
                      "group flex items-center justify-between gap-3 p-3 rounded-sm cursor-pointer transition-all border shrink-0",
                      isActive
                        ? "bg-slate-900 border-slate-900 shadow-sm"
                        : "bg-transparent border-transparent hover:bg-white hover:border-slate-200 hover:shadow-sm",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <Avatar
                          className={cn(
                            "h-10 w-10 border",
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
                        <div
                          className={cn(
                            "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white",
                            driver.driver_status === "Available"
                              ? "bg-emerald-500"
                              : driver.driver_status === "On Trip"
                                ? "bg-blue-500"
                                : "bg-amber-500",
                            isActive && "border-slate-900",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span
                          className={cn(
                            "text-xs font-bold truncate mb-0.5",
                            isActive ? "text-white" : "text-slate-900",
                          )}
                        >
                          {toTitleCase(driver.profiles?.full_name || "Unknown")}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[10px] font-mono truncate",
                              isActive ? "text-slate-400" : "text-slate-500",
                            )}
                          >
                            {driver.display_id}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={cn(
                        "h-7 w-7 rounded-sm shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity",
                        isActive
                          ? "text-slate-400 hover:text-white hover:bg-slate-800"
                          : "text-slate-400 hover:text-slate-900 hover:bg-slate-100",
                      )}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: DETAILS */}
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-hidden min-h-[500px]">
        {!selectedDriver ? (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 p-6 text-center">
            <Briefcase className="w-16 h-16 mb-4 opacity-20" />
            <h3 className="text-sm font-bold text-slate-600 uppercase tracking-widest">
              No Driver Selected
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-xs">
              Select a driver from the roster to view their dispatch schedule.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full">
            <DriverProfileHeader driver={selectedDriver} isSelfView={false} />

            <Tabs
              defaultValue="sched"
              className="flex flex-col flex-1 min-h-0 w-full px-4 sm:px-8 pt-4 sm:pt-6"
            >
              <TabsList className="bg-transparent border-b border-slate-200 h-10 p-0 flex justify-start w-full rounded-none mb-4 sm:mb-6 shrink-0 overflow-x-auto custom-scrollbar">
                <TabsTrigger
                  value="sched"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 uppercase tracking-widest whitespace-nowrap"
                >
                  Schedule & Dispatch
                </TabsTrigger>
                <TabsTrigger
                  value="performance"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 uppercase tracking-widest whitespace-nowrap"
                >
                  Performance & Wallet
                </TabsTrigger>
                <TabsTrigger
                  value="docs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 py-2 text-[11px] font-bold text-slate-500 data-[state=active]:text-slate-900 uppercase tracking-widest whitespace-nowrap"
                >
                  Compliance Docs
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="sched"
                className="flex-1 min-h-0 overflow-hidden outline-none m-0 pb-4 sm:pb-6 flex flex-col"
              >
                <DispatchCalendar
                  bookings={driverSpecificSchedules}
                  isLoading={isSchedulesLoading}
                  mode="specific"
                />
              </TabsContent>

              <TabsContent
                value="performance"
                className="flex-1 min-h-0 overflow-y-auto custom-scrollbar outline-none m-0 pb-4 sm:pb-6 flex flex-col"
              >
                <DriverPerformanceTab
                  driverId={selectedDriver.driver_id || ""}
                />
              </TabsContent>

              <TabsContent
                value="docs"
                className="flex-1 min-h-0 overflow-y-auto custom-scrollbar outline-none m-0 pb-4 sm:pb-6 flex flex-col"
              >
                <DriverDocsTab driverId={selectedDriver.driver_id || ""} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <DriverForm
        open={openDialog}
        onOpenChange={setOpenDialog}
        initialData={selectedDriver || null}
      />
    </div>
  );
}
