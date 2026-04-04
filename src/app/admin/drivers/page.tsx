"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, FileText } from "lucide-react";

import DriversMain from "@/components/drivers/drivers-main";
import DispatchCalendar from "@/components/drivers/dispatch-calendar";
import DriverRequestsQueue from "@/components/drivers/driver-requests-queue";
import { useDriverSchedules } from "../../../../hooks/use-drivers";

export default function DriversPage() {
  const { data: allSchedules = [], isLoading } = useDriverSchedules();

  return (
    <div className="flex flex-col w-full p-4 lg:p-6 bg-[#F8FAFC] min-h-screen min-w-0">
      {/* PAGE HEADER & TABS NAVIGATION */}
      <Tabs
        defaultValue="active-fleet"
        className="w-full flex flex-col min-w-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
          <TabsList className="bg-white border border-slate-200 p-1 rounded-sm h-auto shrink-0 shadow-sm">
            <TabsTrigger
              value="active-fleet"
              className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all flex items-center gap-2"
            >
              <Users className="w-3.5 h-3.5" /> Active Fleet
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-sm data-[state=active]:bg-[#0F172A] data-[state=active]:text-white transition-all flex items-center gap-2"
            >
              <FileText className="w-3.5 h-3.5" /> Applications
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: ACTIVE FLEET (Calendar) */}
        <TabsContent
          value="active-fleet"
          className="flex flex-col min-w-0 outline-none m-0"
        >
          <div className="w-full bg-white border border-slate-200 shadow-sm rounded-sm p-4 lg:p-6 min-w-0">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Fleet Dispatch Overview
              </h2>
              <p className="text-xs text-slate-500 font-medium ">
                Master schedule of all verified drivers and active assignments.
              </p>
            </div>

            <DispatchCalendar
              bookings={allSchedules}
              isLoading={isLoading}
              mode="global"
            />
          </div>
        </TabsContent>

        {/* TAB 2: APPLICATIONS QUEUE */}
        <TabsContent value="applications" className="min-w-0 outline-none m-0">
          <div className="w-full bg-white border border-slate-200 shadow-sm rounded-sm p-4 lg:p-6 min-w-0">
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#0F172A] tracking-tight">
                Driver Application Queue
              </h2>
              <p className="text-xs text-slate-500 font-medium ">
                Review submitted documents for new driver applicants.
              </p>
            </div>
            <DriverRequestsQueue />
          </div>
        </TabsContent>
      </Tabs>

      {/* THE DRIVER MANAGEMENT COMPONENT (Always visible below tabs) */}
      <div className="w-full min-w-0 mt-6">
        <DriversMain schedules={allSchedules} isSchedulesLoading={isLoading} />
      </div>
    </div>
  );
}
