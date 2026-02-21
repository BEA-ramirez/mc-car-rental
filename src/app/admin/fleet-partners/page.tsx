import React from "react";
import { getUnassignedCarOwners } from "@/actions/manage-partner";
import FleetPartnersOverview from "@/components/fleet-partners/fleet-partner-overview";
import FleetPartnerData from "@/components/fleet-partners/fleet-partner-data";

export default async function FleetPartners() {
  const unassignedCarOwners = await getUnassignedCarOwners();

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50/50 min-h-0">
      {/* --- PAGE HEADER --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-10">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">
            Fleet Partners
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage car owners, fleet utilization, payouts, and compliance.
          </p>
        </div>
      </div>

      {/* Overview Metrics */}
      <FleetPartnersOverview />

      {/* The grid takes the remaining height. 
        NOTE: Just like the clients page, you MUST ensure that your 
        <FleetPartnerData /> component has `h-full` on its outermost div! 
      */}
      <div className="flex-1 min-h-0">
        <FleetPartnerData carOwnerApplicants={unassignedCarOwners} />
      </div>
    </div>
  );
}
