"use client";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Funnel, Search } from "lucide-react";
import DriverForm from "./driver-form";
import { useState } from "react";
import { CompleteDriverType } from "@/lib/schemas/driver";
import DriverCard from "./driver-card";
import { ScrollArea } from "../ui/scroll-area";
import { useDrivers } from "../../../hooks/use-drivers";

function DriverList({
  selectedDriver,
  onClick,
}: {
  selectedDriver: CompleteDriverType | null;
  onClick: (driver: CompleteDriverType) => void;
}) {
  const [openForm, setOpenForm] = useState(false);
  const { data: drivers } = useDrivers();

  return (
    <div className="h-full w-[30%] bg-card p-3 shadow-sm">
      <div className="flex flex-row-reverse w-full mb-2">
        <Button
          className="text-sm! p-2! rounded-sm!"
          onClick={() => setOpenForm(true)}
        >
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
            isActive={selectedDriver?.driver_id === driver.driver_id}
          />
        ))}
      </ScrollArea>
      <DriverForm
        open={openForm}
        onOpenChange={setOpenForm}
        initialData={selectedDriver}
      />
    </div>
  );
}

export default DriverList;
