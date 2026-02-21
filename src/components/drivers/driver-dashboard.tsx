"use client";

import DriverList from "./driver-list";
import DriverProfile from "./driver-profile";
import { useState } from "react";
import { CompleteDriverType } from "@/lib/schemas/driver";
import { Users } from "lucide-react";

export default function DriverDashboard() {
  const [selectedDriver, setSelectedDriver] =
    useState<CompleteDriverType | null>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50/50 min-h-0">
      {/* --- DASHBOARD HEADER --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">
            Fleet Drivers
          </h1>
          <p className="text-xs text-muted-foreground">
            Manage driver profiles, assignments, and documents.
          </p>
        </div>
      </div>

      {/* --- MAIN SPLIT LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Driver List */}
        <DriverList
          selectedDriver={selectedDriver}
          onClick={setSelectedDriver}
        />

        {/* Right Area: Driver Profile */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 relative">
          {selectedDriver ? (
            <DriverProfile driver={selectedDriver} />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50">
              <Users className="w-12 h-12 mb-3 opacity-20 text-slate-500" />
              <p className="text-sm font-semibold text-slate-600">
                No driver selected
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Select a driver from the roster to view their profile.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
