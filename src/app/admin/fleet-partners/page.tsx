import React from "react";
import FleetPartnersDataGrid from "@/components/fleet-partners/fleet-partners-datagrid";
import { dummyFleetPartners } from "@/constants/datasource";
import { getEligibleUsers } from "@/actions/user";

async function FleetPartners() {
  const availableUsers = await getEligibleUsers();
  return (
    <div className=" grid grid-cols-6 grid-rows-7 h-[50rem] gap-4">
      <div className="border border-black col-span-2">Total Partners</div>
      <div className="border border-black col-span-2">Pending Verification</div>
      <div className="border border-black col-span-2">Avg. Revenue Share</div>

      <div className="border border-black col-span-6 row-span-5 p-2">
        <h3>Fleet Partners</h3>
        <FleetPartnersDataGrid
          fleetPartners={dummyFleetPartners}
          availableUsers={availableUsers}
        />
      </div>
    </div>
  );
}

export default FleetPartners;
