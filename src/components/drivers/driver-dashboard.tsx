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
    <div className="w-full h-[100vh] flex items-center justify-center gap-3">
      <DriverList selectedDriver={selectedDriver} onClick={setSelectedDriver} />
      <DriverProfile driver={selectedDriver} />
    </div>
  );
}

export default DriverDashboard;
