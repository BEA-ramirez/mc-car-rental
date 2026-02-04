import React from "react";
import { Field, FieldLabel } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";

const dummyCarUtilization = [
  { model: "Vios", plate: "ABC-123", utilization: 66 },
  { model: "Civic", plate: "DEF-456", utilization: 75 },
  { model: "Corolla", plate: "GHI-789", utilization: 50 },
  { model: "Accord", plate: "JKL-012", utilization: 80 },
  { model: "Camry", plate: "MNO-345", utilization: 40 },
];

function PartnerCarUtil() {
  return (
    <div className="w-[40%] shadow-md rounded-md h-72 bg-card p-3">
      <h3 className="text-foreground/90 text-md font-semibold">
        Car Utilization
      </h3>
      <div className="px-3 pt-2 overflow-y-auto flex-1 h-[88%]">
        {dummyCarUtilization.map((car, index) => (
          <Field className="w-full max-w-sm mb-5 gap-1" key={index}>
            <FieldLabel>
              <span className="border-r pr-3">{car.model}</span>
              <span className="text-xs px-2 bg-foreground/10 rounded-md">
                {car.plate}
              </span>
              <span className="ml-auto text-xs">{car.utilization}%</span>
            </FieldLabel>
            <Progress value={car.utilization} className="h-4 rounded-sm " />
          </Field>
        ))}
      </div>
    </div>
  );
}

export default PartnerCarUtil;
