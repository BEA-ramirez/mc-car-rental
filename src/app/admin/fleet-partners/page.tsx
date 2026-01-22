import React from "react";
import FleetPartnersDataGrid from "@/components/fleet-partners/fleet-partners-datagrid";
import { dummyFleetPartners } from "@/constants/datasource";
import { getCarOwners } from "@/actions/helper/get-car-owners";
import { getUnassignedCarOwners } from "@/actions/manage-partner";

async function FleetPartners() {
  const unassignedCarOwners = await getUnassignedCarOwners();
  const carOwners = await getCarOwners();
  console.log("Car Owners", carOwners);

  return (
    <div className=" grid grid-cols-6 grid-rows-7 h-[50rem] gap-4">
      <div className="border border-black col-span-2">Totaly Partners</div>
      <div className="border border-black col-span-2">Pending Verification</div>
      <div className="border border-black col-span-2">Avg. Revenue Share</div>

      <div className="border border-black col-span-6 row-span-5 p-2">
        <h3>Fleet Partners</h3>
        <FleetPartnersDataGrid
          fleetPartners={carOwners}
          availableUsers={unassignedCarOwners}
        />
      </div>
    </div>
  );
}

export default FleetPartners;
