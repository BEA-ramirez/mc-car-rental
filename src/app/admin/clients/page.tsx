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

          <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col h-full transition-colors">
            <ClientsDataGrid />
          </div>
        </div>
      </div>
    </div>
  );
}
