import React from "react";
import { getUnassignedCarOwners } from "@/actions/manage-partner";
import FleetPartnersOverview from "@/components/fleet-partners/fleet-partner-overview";
import FleetPartnerData from "@/components/fleet-partners/fleet-partner-data";

async function FleetPartners() {
  const unassignedCarOwners = await getUnassignedCarOwners();

  return (
    <div className="flex flex-col gap-3">
      <FleetPartnersOverview />
      <FleetPartnerData carOwnerApplicants={unassignedCarOwners} />
    </div>
  );
}

export default FleetPartners;
