"use client";
import FleetPartnersDataGrid from "./fleet-partners-datagrid";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CarOwnerType } from "@/lib/schemas/car-owner";
import PartnerHeader from "./partner-header";
import PartnerRevenueChart from "./partner-revenue-chart";
import PartnerCarUtil from "./partner-car-util";
import { useState } from "react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { UserType } from "@/lib/schemas/user";
import PartnerUnits from "./partner-units";

function ActivePartners({
  carOwnerApplicants,
}: {
  carOwnerApplicants: UserType[];
}) {
  const [selectedPartner, setSelectedPartner] =
    useState<FleetPartnerType | null>(null);
  const tabsTriggerClasses =
    "relative h-10 rounded-none cursor-pointer border-b-2 border-b-transparent bg-transparent px-4 pb-2 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none";

  const handleSelectPartner = (partner: FleetPartnerType | null) => {
    setSelectedPartner(partner);
  };

  return (
    <div className="h-240 flex items-center gap-3 rounded-md mb-6">
      <div className="w-[30%] border h-full bg-card rounded-md">
        <FleetPartnersDataGrid
          carOwnerApplicants={carOwnerApplicants}
          onSelectPartner={handleSelectPartner}
        />
      </div>
      <div className="w-[70%] h-full flex flex-col gap-3">
        {selectedPartner ? (
          <>
            <PartnerHeader selectedPartner={selectedPartner} />
            <div className="flex items-center gap-3">
              <PartnerRevenueChart />
              <PartnerCarUtil />
            </div>
            <div>
              <Tabs
                defaultValue="units"
                className="w-full rounded-md bg-card shadow-md p-3"
              >
                <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                  <TabsTrigger value="units" className={tabsTriggerClasses}>
                    Units
                  </TabsTrigger>
                  <TabsTrigger
                    value="financials"
                    className={tabsTriggerClasses}
                  >
                    Financials
                  </TabsTrigger>
                  <TabsTrigger value="documents" className={tabsTriggerClasses}>
                    Documents
                  </TabsTrigger>
                  <TabsTrigger value="logs" className={tabsTriggerClasses}>
                    Logs
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="units">
                  <PartnerUnits selectedPartner={selectedPartner} />
                </TabsContent>
                <TabsContent value="financials">
                  <div className="border h-80 bg-card">Financials</div>
                </TabsContent>
                <TabsContent value="documents">
                  <div className="border h-80 bg-card">Documents</div>
                </TabsContent>
                <TabsContent value="logs">
                  <div className="border h-80 bg-card">Logs</div>
                </TabsContent>
              </Tabs>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Select a fleet partner to view details
          </div>
        )}
      </div>
    </div>
  );
}

export default ActivePartners;
