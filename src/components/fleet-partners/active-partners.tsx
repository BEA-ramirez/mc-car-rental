"use client";

import { useState, useRef } from "react";
import FleetPartnersDataGrid, {
  FleetPartnersGridRef,
} from "./fleet-partners-datagrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerHeader from "./partner-header";
import PartnerRevenueChart from "./partner-revenue-chart";
import PartnerCarUtil from "./partner-car-util";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import PartnerUnits from "./partner-units";
import {
  Handshake,
  Car,
  DollarSign,
  FileText,
  History,
  LayoutDashboard,
} from "lucide-react";
import PartnerFinancials from "./partner-financials";
import PartnerDocs from "./partner-docs";
import PartnerLogs from "./partner-logs";

export default function ActivePartners() {
  const gridRef = useRef<FleetPartnersGridRef>(null);
  const [selectedPartner, setSelectedPartner] =
    useState<FleetPartnerType | null>(null);

  const handleSelectPartner = (partner: FleetPartnerType | null) => {
    setSelectedPartner(partner);
  };

  const handleEdit = () => {
    if (gridRef.current) {
      gridRef.current.startEdit();
    }
  };

  return (
    <div className="flex flex-1 h-full w-full min-h-0 relative overflow-hidden bg-background text-foreground transition-colors duration-300">
      {/* --- LEFT SIDEBAR --- */}
      <div className="flex flex-col h-full min-h-0 shrink-0 border-r border-border bg-secondary/30 z-10 w-[280px] transition-colors">
        <FleetPartnersDataGrid
          ref={gridRef}
          onSelectPartner={handleSelectPartner}
        />
      </div>

      {/* --- RIGHT CONTENT: UNIFIED CANVAS --- */}
      <div className="flex-1 bg-background flex flex-col min-h-0 h-full relative transition-colors">
        {selectedPartner ? (
          <div className="flex flex-col h-full min-h-0 w-full">
            {/* 1. Integrated Header */}
            <div className="bg-card p-4 sm:p-5 border-b border-border shrink-0 transition-colors">
              <PartnerHeader
                selectedPartner={selectedPartner}
                onEdit={handleEdit}
              />
            </div>

            {/* 2. Content Sections - Separated by dividers */}
            <div className="flex flex-col flex-1 min-h-0 overflow-y-auto custom-scrollbar">
              {/* Section Header */}
              <div className="flex items-center px-4 sm:px-5 py-2.5 bg-secondary/50 border-b border-border gap-2 transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Analytics & Fleet Summary
                </span>
              </div>

              {/* Grid Row */}
              <div className="grid grid-cols-1 xl:grid-cols-5 border-b border-border bg-background min-h-[300px] transition-colors shrink-0">
                <div className="xl:col-span-3 p-4 sm:p-5 border-b xl:border-b-0 xl:border-r border-border flex flex-col transition-colors">
                  <PartnerRevenueChart ownerId={selectedPartner.car_owner_id} />
                </div>
                <div className="xl:col-span-2 p-4 sm:p-5 flex flex-col transition-colors">
                  <PartnerCarUtil ownerId={selectedPartner.car_owner_id} />
                </div>
              </div>

              {/* 3. Integrated Management Tabs */}
              <div className="flex flex-col flex-1 bg-background transition-colors min-h-[400px]">
                <Tabs defaultValue="units" className="flex flex-col h-full">
                  <div className="bg-secondary/30 px-3 py-2 border-b border-border transition-colors sticky top-0 z-10">
                    <TabsList className="h-8 bg-transparent p-0 flex justify-start w-full gap-2">
                      <TabsTrigger
                        value="units"
                        className="uppercase h-8 text-[9px] font-bold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:border-border border border-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all gap-1.5"
                      >
                        <Car className="w-3.5 h-3.5" /> Fleet Units
                      </TabsTrigger>
                      <TabsTrigger
                        value="financials"
                        className="uppercase h-8 text-[9px] font-bold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:border-border border border-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Financials
                      </TabsTrigger>
                      <TabsTrigger
                        value="documents"
                        className="uppercase h-8 text-[9px] font-bold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:border-border border border-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> Documents
                      </TabsTrigger>
                      <TabsTrigger
                        value="logs"
                        className="uppercase h-8 text-[9px] font-bold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:border-border border border-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all gap-1.5"
                      >
                        <History className="w-3.5 h-3.5" /> Activity Logs
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 p-4 sm:p-5">
                    <TabsContent
                      value="units"
                      className="m-0 outline-none h-full data-[state=active]:flex flex-col"
                    >
                      <PartnerUnits selectedPartner={selectedPartner} />
                    </TabsContent>

                    <TabsContent
                      value="financials"
                      className="m-0 outline-none h-full data-[state=active]:flex flex-col"
                    >
                      <PartnerFinancials selectedPartner={selectedPartner} />
                    </TabsContent>

                    <TabsContent
                      value="documents"
                      className="m-0 outline-none h-full data-[state=active]:flex flex-col"
                    >
                      <PartnerDocs selectedPartner={selectedPartner} />
                    </TabsContent>

                    <TabsContent
                      value="logs"
                      className="m-0 outline-none h-full data-[state=active]:flex flex-col"
                    >
                      <PartnerLogs selectedPartner={selectedPartner} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State - Ultra Compact */
          <div className="flex flex-col items-center justify-center h-full w-full bg-background px-6 text-center transition-colors">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150 transition-colors" />
              <div className="relative p-4 rounded-2xl bg-secondary/50 border border-border shadow-sm transition-colors">
                <Handshake className="w-10 h-10 text-muted-foreground/50" />
              </div>
            </div>
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest transition-colors">
              Partner Selection Required
            </h3>
            <p className="text-[10px] font-medium text-muted-foreground mt-1.5 max-w-[280px] leading-relaxed transition-colors">
              Select a fleet partner from the directory to access their
              performance analytics, fleet management, and legal records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
