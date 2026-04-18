import React from "react";
import FleetPartnerData from "@/components/fleet-partners/fleet-partner-data";

export default async function FleetPartners() {
  // Fetch data on the server
  //const unassignedCarOwners = await getUnassignedCarOwners();

  return (
    <div className="flex flex-col w-full p-8  bg-slate-50 font-sans overflow-hidden custom-scrollbar">
      <div className="bg-white rounded-sm  flex flex-col ">
        <FleetPartnerData />
      </div>
    </div>
  );
}
