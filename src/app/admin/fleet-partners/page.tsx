import React from "react";
import { format } from "date-fns";
import { Handshake, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

import { getUnassignedCarOwners } from "@/actions/manage-partner";
import FleetPartnersOverview from "@/components/fleet-partners/fleet-partner-overview";
import FleetPartnerData from "@/components/fleet-partners/fleet-partner-data";

export default async function FleetPartners() {
  // Fetch data on the server
  const unassignedCarOwners = await getUnassignedCarOwners();

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-hidden">
      {/* GLOBAL PAGE HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <Handshake className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              Fleet Partners
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Manage car owners, fleet utilization, payouts, and compliance.
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

      {/* SCROLLABLE AREA WITH PADDING (Matches Dashboard & Clients) */}
      <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-6 space-y-6">
          {/* TOP ROW: KPIs (Wrapped in a Card) */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
            <FleetPartnersOverview />
          </div>

          {/* MAIN DATA GRID (Wrapped in a Card with internal scrolling) */}
          <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-[calc(100vh-320px)] min-h-[600px]">
            <FleetPartnerData carOwnerApplicants={unassignedCarOwners} />
          </div>
        </div>
      </div>
    </div>
  );
}
