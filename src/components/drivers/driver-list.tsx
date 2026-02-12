"use client";
import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Funnel, Search } from "lucide-react";
import DriverForm from "./driver-form";
import { CompleteDriverType } from "@/lib/schemas/driver";
import DriverCard from "./driver-card";
import { ScrollArea } from "../ui/scroll-area";
import { useDrivers } from "../../../hooks/use-drivers";

function DriverList({
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
  const { data: drivers } = useDrivers();

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
    setEditingDriver(null); // clear any data for a fresh form
    setOpenForm(true);
  };

  const handleEditDriver = (driver: CompleteDriverType) => {
    setEditingDriver(driver);
    setOpenForm(true);
  };

  return (
    <div className="h-full w-[30%] bg-card p-3 shadow-sm">
      <div className="flex flex-row-reverse w-full mb-2">
        <Button className="text-sm! p-2! rounded-sm!" onClick={handleAddDriver}>
          Add Driver
        </Button>
      </div>
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="relative w-[90%] flex items-center gap-2">
          <Search className="absolute left-2 top-2.4 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search user..."
            className="pl-8 border-gray-300 rounded-sm text-xs! h-8"
            //   onChange={handleSearch}
          />
        </div>
        <Button
          variant="outline"
          className="bg-transparent! rounded-sm!"
          size={"icon-sm"}
        >
          <Funnel className="text-foreground" />
        </Button>
      </div>
      <ScrollArea className="h-[85%] p-1">
        {drivers?.map((driver) => (
          <DriverCard
            driver={driver}
            key={driver.driver_id}
            onClick={() => onClick(driver)}
            onEdit={() => handleEditDriver(driver)}
            isActive={selectedDriver?.driver_id === driver.driver_id}
          />
        ))}
      </ScrollArea>
      <DriverForm
        open={openForm}
        onOpenChange={setOpenForm}
        initialData={editingDriver}
      />
    </div>
  );
}

export default DriverList;
