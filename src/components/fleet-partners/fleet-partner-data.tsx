"use client";

import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivePartners from "./active-partners";
import { Users, UserPlus } from "lucide-react";
import PartnerRequestsQueue from "./partner-requests-queue";

export default function FleetPartnerData() {
  return (
    <div className="flex flex-col flex-1 h-full w-full bg-background transition-colors duration-300 min-h-0">
      <Tabs
        defaultValue="active-partners"
        className="flex flex-col h-full min-h-0 w-full"
      >
        {/* TAB NAVIGATION */}
        <div className="shrink-0 mb-4">
          <TabsList className="bg-secondary/50 border border-border/50 p-1 rounded-lg h-auto shadow-inner transition-colors inline-flex">
            <TabsTrigger
              value="active-partners"
              className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              Active Partners
            </TabsTrigger>
            <TabsTrigger
              value="app-requests"
              className="text-[10px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-md data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all flex items-center gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Application Requests
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* FIX: Force TabsContent to act as a flex container so ActivePartners can stretch */}
          <TabsContent
            value="active-partners"
            className="m-0 flex-1 data-[state=active]:flex flex-col outline-none min-h-0"
          >
            <ActivePartners />
          </TabsContent>

          <TabsContent
            value="app-requests"
            className="m-0 flex-1 data-[state=active]:flex flex-col outline-none min-h-0"
          >
            <PartnerRequestsQueue />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
