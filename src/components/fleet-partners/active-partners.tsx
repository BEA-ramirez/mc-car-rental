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
    <div className="flex flex-1 h-full w-full min-h-0 relative border border-slate-200 overflow-hidden bg-white">
      {/* --- LEFT SIDEBAR --- */}
      <div className="flex flex-col h-full min-h-0 shrink-0 border-r border-slate-200 bg-white z-10 w-[280px] ">
        <FleetPartnersDataGrid
          ref={gridRef}
          onSelectPartner={handleSelectPartner}
        />
      </div>

      {/* --- RIGHT CONTENT: UNIFIED WHITE CANVAS --- */}
      <div className="flex-1 bg-white flex flex-col min-h-0 h-full relative">
        {selectedPartner ? (
          <div className="flex flex-col h-full min-h-0 w-full ">
            {/* 1. Integrated Header - No bottom shadow, just a rule */}
            <div className="bg-white p-8 pb-6 border-b border-slate-100 shrink-0">
              <PartnerHeader
                selectedPartner={selectedPartner}
                onEdit={handleEdit}
              />
            </div>

            {/* 2. Content Sections - Separated by dividers rather than card borders */}
            <div className="flex flex-col">
              {/* Section Header */}
              <div className="flex items-center px-8 py-4 bg-slate-50/50 border-b border-slate-100 gap-2">
                <LayoutDashboard className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  Analytics & Fleet Summary
                </span>
              </div>

              {/* Grid Row */}
              <div className="grid grid-cols-1 xl:grid-cols-5 border-b border-slate-200 bg-white min-h-[320px]">
                <div className="xl:col-span-3 p-5 sm:p-6 border-b xl:border-b-0 xl:border-r border-slate-200 flex flex-col">
                  {/* PASS THE PROP HERE */}
                  <PartnerRevenueChart ownerId={selectedPartner.car_owner_id} />
                </div>
                <div className="xl:col-span-2 p-5 sm:p-6 flex flex-col">
                  <PartnerCarUtil ownerId={selectedPartner.car_owner_id} />
                </div>
              </div>

              {/* 3. Integrated Management Tabs */}
              <div className="flex flex-col min-h-[600px] bg-white">
                <Tabs defaultValue="units" className="flex flex-col h-full">
                  <div className="bg-slate-100 px-3 py-1 border-y border-slate-200">
                    <TabsList className="h-9 bg-slate-100 p-1  inline-flex w-full">
                      <TabsTrigger
                        value="units"
                        className="uppercase h-7 text-[11px] font-semibold px-5 rounded-sm data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 transition-all gap-2"
                      >
                        <Car className="w-3.5 h-3.5" /> Fleet Units
                      </TabsTrigger>
                      <TabsTrigger
                        value="financials"
                        className="uppercase h-7 text-[11px] font-semibold px-5 rounded-sm data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 transition-all gap-2"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Financials
                      </TabsTrigger>
                      <TabsTrigger
                        value="documents"
                        className="uppercase h-7 text-[11px] font-semibold px-5 rounded-sm data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 transition-all gap-2"
                      >
                        <FileText className="w-3.5 h-3.5" /> Documents
                      </TabsTrigger>
                      <TabsTrigger
                        value="logs"
                        className="uppercase h-7 text-[11px] font-semibold px-5 rounded-sm data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 transition-all gap-2"
                      >
                        <History className="w-3.5 h-3.5" /> Activity Logs
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 px-6 py-4 pt-4">
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
          /* Empty State - Modern Minimalist */
          <div className="flex flex-col items-center justify-center h-full w-full bg-white px-10 text-center">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-100 blur-2xl opacity-20 rounded-full scale-150" />
              <div className="relative p-6 rounded-2xl bg-white border border-slate-100 shadow-sm">
                <Handshake className="w-12 h-12 text-slate-300" />
              </div>
            </div>
            <h3 className="text-base font-bold text-slate-800">
              Partner Selection Required
            </h3>
            <p className="text-xs text-slate-400 mt-2 max-w-[260px] leading-relaxed">
              Select a fleet partner from the directory to access their
              performance analytics, fleet management, and legal records.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
