"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, Search, Plus, Loader2 } from "lucide-react";
import DriverForm from "./driver-form";
import { CompleteDriverType } from "@/lib/schemas/driver";
import DriverCard from "./driver-card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDrivers } from "../../../hooks/use-drivers";

export default function DriverList({
  selectedDriver,
  onClick,
}: {
  selectedDriver: CompleteDriverType | null;
  onClick: (driver: CompleteDriverType | null) => void;
}) {
  const [openForm, setOpenForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<CompleteDriverType | null>(
    null,
  );
  const [searchQuery, setSearchQuery] = useState("");

  const { data: drivers, isLoading } = useDrivers();

  // Client-side filtering
  const filteredDrivers =
    drivers?.filter(
      (d) =>
        d.profiles?.full_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        d.display_id?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  useEffect(() => {
    if (selectedDriver && drivers) {
      const exists = drivers.some(
        (d) => d.driver_id === selectedDriver.driver_id,
      );
      if (!exists) {
        onClick(null);
      }
    }
  }, [drivers, selectedDriver, onClick]);

  const handleAddDriver = () => {
    setEditingDriver(null);
    setOpenForm(true);
  };

  const handleEditDriver = (driver: CompleteDriverType) => {
    setEditingDriver(driver);
    setOpenForm(true);
  };

  return (
    <div className="w-[320px] lg:w-[350px] bg-white border-r border-slate-200 flex flex-col shrink-0 h-full z-10 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.05)]">
      {/* --- SEARCH & ACTIONS HEADER --- */}
      <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Driver Roster
          </span>
          <Button
            size="sm"
            className="h-7 text-[10px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-2.5 rounded-md"
            onClick={handleAddDriver}
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add Driver
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search name or ID..."
              className="pl-8 h-8 text-xs bg-white border-slate-200 focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white border-slate-200 text-slate-700 shrink-0"
          >
            <Filter className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* --- SCROLLABLE LIST --- */}
      <ScrollArea className="flex-1 min-h-0 p-3">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
            <span className="text-xs font-medium">Loading drivers...</span>
          </div>
        ) : filteredDrivers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 rounded-md mt-2">
            <p className="text-xs text-slate-500 font-semibold">
              No drivers found.
            </p>
            {searchQuery && (
              <p className="text-[10px] text-slate-400 mt-1">
                Adjust your search query.
              </p>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filteredDrivers.map((driver) => (
              <DriverCard
                key={driver.driver_id}
                driver={driver}
                onClick={() => onClick(driver)}
                onEdit={() => handleEditDriver(driver)}
                isActive={selectedDriver?.driver_id === driver.driver_id}
              />
            ))}
          </div>
        )}
      </ScrollArea>

      {/* --- MODAL --- */}
      <DriverForm
        open={openForm}
        onOpenChange={setOpenForm}
        initialData={editingDriver}
      />
    </div>
  );
}
