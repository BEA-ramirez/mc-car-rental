"use client";

import React from "react";
import { format } from "date-fns";
import { Users, MoreVertical, LayoutGrid, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import ClientsOverview from "@/components/clients/clients-overview";
import ClientsDataGrid from "@/components/clients/clients-datagrid";
import RequestsQueue from "@/components/clients/requests-queue";

// --- UPDATED: Import the KPI hook instead of the main list hook ---
import { useClientsKpi } from "../../../../hooks/use-clients";

export default function ClientsPage() {
  // --- UPDATED: Fetch the exact KPI data directly from the server ---
  const { data: kpiData } = useClientsKpi();

  // Safely extract the pending count. It will default to 0 while loading.
  const pendingCount = kpiData?.pending_id || 0;

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-hidden">
      {/* GLOBAL PAGE HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <Users className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              Client Directory
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Manage customers, drivers, and fleet partners.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block mr-2">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Today
            </p>
            <p className="text-xs font-bold text-slate-800">
              {format(new Date(), "MMM dd, yyyy")}
            </p>
          </div>
          <div className="w-px h-6 bg-slate-200 hidden sm:block" />
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 rounded-sm border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 shadow-none"
          >
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* SCROLLABLE AREA WITH PADDING */}
      <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
        <div className="max-w-[1600px] mx-auto p-6 space-y-6 flex flex-col min-h-full">
          {/* TOP ROW: KPIs */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col shrink-0">
            <ClientsOverview />
          </div>

          {/* MAIN TABBED AREA */}
          <Tabs
            defaultValue="directory"
            className="flex flex-col flex-1 min-h-[600px]"
          >
            <div className="flex items-center justify-between mb-4">
              <TabsList className="bg-slate-200/60 p-1 h-9 rounded-sm shadow-inner">
                <TabsTrigger
                  value="directory"
                  className="h-7 px-4 text-[10px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all flex items-center gap-1.5"
                >
                  <LayoutGrid className="w-3.5 h-3.5" /> Directory
                </TabsTrigger>
                <TabsTrigger
                  value="requests"
                  className="h-7 px-4 text-[10px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all flex items-center gap-1.5 relative pr-8"
                >
                  <Inbox className="w-3.5 h-3.5" /> Verification Queue
                  {/* --- UPDATED: The badge now uses the live server count --- */}
                  {pendingCount > 0 && (
                    <span className="absolute right-2 top-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-sm bg-red-600 px-1 text-[9px] font-bold text-white shadow-sm">
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
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-full">
                <ClientsDataGrid />
              </div>
            </TabsContent>

            <TabsContent
              value="requests"
              className="flex-1 m-0 h-full outline-none"
            >
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-full">
                <RequestsQueue />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
