"use client";

import React from "react";
import { LayoutGrid, Inbox } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ClientsOverview from "@/components/clients/clients-overview";
import ClientsDataGrid from "@/components/clients/clients-datagrid";
import RequestsQueue from "@/components/clients/requests-queue";

import { useClientsKpi } from "../../../../hooks/use-clients";

export default function ClientsPage() {
  const { data: kpiData } = useClientsKpi();

  const pendingCount = kpiData?.pending_id || 0;

  return (
    <div className="flex flex-col h-full bg-background font-sans overflow-hidden transition-colors duration-300">
      <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-4 md:p-5 space-y-5 flex flex-col min-h-full">
          {/* TOP ROW: KPIs */}
          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col shrink-0 transition-colors">
            <ClientsOverview />
          </div>

          {/* MAIN TABBED AREA */}
          <Tabs
            defaultValue="directory"
            className="flex flex-col flex-1 min-h-[150px]"
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-secondary/50 p-1 h-9 rounded-lg shadow-inner border border-border/50 transition-colors">
                <TabsTrigger
                  value="directory"
                  className="h-7 px-4 text-[10px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all flex items-center gap-1.5"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Directory
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="h-7 px-4 text-[10px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all flex items-center gap-1.5 relative pr-9"
                >
                  <Inbox className="w-3.5 h-3.5" /> Verification Queue
                  {pendingCount > 0 && (
                    <span className="absolute right-1.5 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded bg-destructive px-1 text-[8px] font-bold text-destructive-foreground shadow-sm">
                      {pendingCount > 99 ? "99+" : pendingCount}
                    </span>
                  )}
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent
              value="directory"
              className="flex-1 m-0 h-full outline-none"
            >
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full transition-colors">
                <ClientsDataGrid />
              </div>
            </TabsContent>

            <TabsContent
              value="requests"
              className="flex-1 m-0 h-full outline-none"
            >
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full transition-colors">
                <RequestsQueue />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
