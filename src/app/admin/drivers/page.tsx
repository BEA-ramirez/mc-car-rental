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
    <div className="flex flex-col w-full p-4 lg:p-5 bg-background min-h-screen min-w-0 transition-colors duration-300">
      {/* PAGE HEADER & TABS NAVIGATION */}
      <Tabs
        defaultValue="active-fleet"
        className="w-full flex flex-col min-w-0"
      >
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <TabsList className="bg-secondary/50 border border-border/50 p-1 rounded-lg h-auto shrink-0 shadow-inner transition-colors">
            <TabsTrigger
              value="active-fleet"
              className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" /> Active Fleet
            </TabsTrigger>
            <TabsTrigger
              value="applications"
              className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all flex items-center gap-1.5"
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
          <div className="w-full bg-card border border-border shadow-sm rounded-xl p-4 lg:p-5 min-w-0 transition-colors">
            <div className="mb-4 border-b border-border pb-3">
              <h2 className="text-sm font-bold text-foreground tracking-tight uppercase">
                Fleet Dispatch Overview
              </h2>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">
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
          <div className="w-full bg-card border border-border shadow-sm rounded-xl p-4 lg:p-5 min-w-0 transition-colors">
            <div className="mb-4 border-b border-border pb-3">
              <h2 className="text-sm font-bold text-foreground tracking-tight uppercase">
                Driver Application Queue
              </h2>
              <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-widest mt-1">
                Review submitted documents for new driver applicants.
              </p>
            </div>
            <DriverRequestsQueue />
          </div>
        </TabsContent>
      </Tabs>

      {/* THE DRIVER MANAGEMENT COMPONENT (Always visible below tabs) */}
      <div className="w-full min-w-0 mt-5">
        <DriversMain schedules={allSchedules} isSchedulesLoading={isLoading} />
      </div>
    </div>
  );
}
