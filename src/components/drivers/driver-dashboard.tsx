"use client";
import DriverList from "./driver-list";
import DriverProfile from "./driver-profile";
import { useState } from "react";
import { CompleteDriverType } from "@/lib/schemas/driver";

function DriverDashboard() {
  const [selectedDriver, setSelectedDriver] =
    useState<CompleteDriverType | null>(null);

  console.log("Selected driver", selectedDriver);

  return (
    <div className="w-full h-[calc(100vh+140px)] flex items-stretch justify-center gap-3 mb-8">
      <DriverList selectedDriver={selectedDriver} onClick={setSelectedDriver} />
      <DriverProfile driver={selectedDriver} />
    </div>
  );
}

export default DriverDashboard;
