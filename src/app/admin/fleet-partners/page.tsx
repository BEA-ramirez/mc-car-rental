import React from "react";
import FleetPartnersDataGrid from "@/components/fleet-partners/fleet-partners-datagrid";
import { getCarOwners } from "@/actions/helper/get-car-owners";
import { getUnassignedCarOwners } from "@/actions/manage-partner";
import FleetPartnersOverview from "@/components/fleet-partners/fleet-partner-overview";
import FleetPartnerData from "@/components/fleet-partners/fleet-partner-data";

async function FleetPartners() {
  const unassignedCarOwners = await getUnassignedCarOwners();
  const carOwners = await getCarOwners();
  console.log("car owneres", carOwners);
  return (
    <div className="flex flex-col gap-3">
      <FleetPartnersOverview />
      <FleetPartnerData
        fleetPartners={carOwners}
        carOwnerApplicants={unassignedCarOwners}
      />
    </div>
  );
}

export default FleetPartners;
