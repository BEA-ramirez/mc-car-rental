"use client";
import React from "react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";

const dummyCar = [
  { model: "Vios", plate: "ABC-123", availabilityStatus: "Available" },
  { model: "Civic", plate: "DEF-456", availabilityStatus: "Rented" },
  { model: "Corolla", plate: "GHI-789", availabilityStatus: "Maintenance" },
  { model: "Accord", plate: "JKL-012", availabilityStatus: "Available" },
  { model: "Camry", plate: "MNO-345", availabilityStatus: "Available" },
];

function PartnerUnits({
  selectedPartner,
}: {
  selectedPartner: FleetPartnerType | null;
}) {
  return (
    <div className="w-full rounded-md h-84">
      {/* <div>
        <h4 className="font-semibold text-md text-foreground/90">Units</h4>
      </div> */}
      <div className="h-[90%] p-3 flex flex-col overflow-y-auto mt-2">
        {dummyCar.map((car) => (
          <div
            key={car.plate}
            className="flex items-center justify-between p-3 border-t hover:bg-foreground/10 transition-colors"
          >
            <div className="flex items-center gap-2">
              <h6 className="text-foreground/90 font-semibold text-sm">
                {car.model}
              </h6>
              <p className="text-foreground/80 font-medium text-xs px-1 border rounded-md">
                {car.plate}
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground/60">
              <a href="" className="hover:text-foreground/90 hover:font-medium">
                [View]
              </a>
              <a href="" className="hover:text-foreground/90 hover:font-medium">
                [Edit]
              </a>
              <a
                href=""
                className="hover:text-destructive/90 hover:font-medium"
              >
                [Offboard/Pull-out]
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default PartnerUnits;
