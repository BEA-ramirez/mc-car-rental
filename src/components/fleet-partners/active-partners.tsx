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
  Info,
  LayoutDashboard,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="flex flex-1 h-full w-full min-h-0 relative border-t border-slate-200 overflow-hidden bg-white">
      {/* --- LEFT SIDEBAR --- */}
      <div className="flex flex-col h-full min-h-0 shrink-0 border-r border-slate-200 bg-white z-10 w-[320px] lg:w-[350px]">
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

              {/* Grid Row - Visual separation through a single vertical border-r */}
              <div className="grid grid-cols-1 xl:grid-cols-5 h-80 border-b border-slate-100 bg-white">
                <div className="xl:col-span-3 p-8 border-r border-slate-100">
                  <PartnerRevenueChart />
                </div>
                <div className="xl:col-span-2 p-8">
                  <PartnerCarUtil />
                </div>
              </div>

              {/* 3. Integrated Management Tabs */}
              <div className="flex flex-col min-h-[600px] bg-white">
                <Tabs defaultValue="units" className="flex flex-col h-full">
                  {/* Internal Tabs Navigation - Floating look over white background */}
                  <div className="px-8 pt-6 pb-2">
                    <TabsList className="h-9 bg-slate-100 p-1 rounded-lg border border-slate-200 inline-flex w-fit">
                      <TabsTrigger
                        value="units"
                        className="h-7 text-[11px] font-semibold px-5 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 transition-all gap-2"
                      >
                        <Car className="w-3.5 h-3.5" /> Fleet Units
                      </TabsTrigger>
                      <TabsTrigger
                        value="financials"
                        className="h-7 text-[11px] font-semibold px-5 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 transition-all gap-2"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Financials
                      </TabsTrigger>
                      <TabsTrigger
                        value="documents"
                        className="h-7 text-[11px] font-semibold px-5 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 transition-all gap-2"
                      >
                        <FileText className="w-3.5 h-3.5" /> Documents
                      </TabsTrigger>
                      <TabsTrigger
                        value="logs"
                        className="h-7 text-[11px] font-semibold px-5 rounded-md data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm text-slate-500 transition-all gap-2"
                      >
                        <History className="w-3.5 h-3.5" /> Activity Logs
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="flex-1 p-8 pt-4">
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
                      <div className="flex flex-col items-center justify-center text-center py-24 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
                        <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100 mb-4">
                          <DollarSign className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                          Financial Records
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                          Historical payouts and detailed revenue reports will
                          be listed here.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="documents"
                      className="m-0 outline-none h-full data-[state=active]:flex flex-col"
                    >
                      <div className="flex flex-col items-center justify-center text-center py-24 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
                        <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100 mb-4">
                          <FileText className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                          Legal Documents
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                          Access partner contracts, ID scans, and compliance
                          certificates.
                        </p>
                      </div>
                    </TabsContent>

                    <TabsContent
                      value="logs"
                      className="m-0 outline-none h-full data-[state=active]:flex flex-col"
                    >
                      <div className="flex flex-col items-center justify-center text-center py-24 bg-slate-50/40 rounded-2xl border border-dashed border-slate-200">
                        <div className="p-4 bg-white rounded-full shadow-sm border border-slate-100 mb-4">
                          <History className="w-6 h-6 text-slate-300" />
                        </div>
                        <p className="text-sm font-bold text-slate-700">
                          Audit Logs
                        </p>
                        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                          A full timeline of changes made to this partner
                          profile.
                        </p>
                      </div>
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
