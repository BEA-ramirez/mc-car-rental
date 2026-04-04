import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivePartners from "./active-partners";
import { ClientRow } from "../../../hooks/use-clients";
import { Users, UserPlus } from "lucide-react";
import PartnerRequestsQueue from "./partner-requests-queue";

export default function FleetPartnerData({
  carOwnerApplicants,
}: {
  carOwnerApplicants: ClientRow[];
}) {
  return (
    <div className="flex flex-col h-320 bg-slate-50/50">
      <Tabs
        defaultValue="active-partners"
        className="flex flex-col h-full min-h-0"
      >
        {/* TAB NAVIGATION */}
        <div className=" shrink-0">
          <TabsList className="w-full bg-white p-0.5 rounded-md mb-3 shadow-sm inline-flex">
            <TabsTrigger
              value="active-partners"
              className="uppercase py-2 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-[#0F172A] data-[state=active]:shadow-sm data-[state=active]:text-white text-slate-500 transition-all gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              Active Partners
            </TabsTrigger>
            <TabsTrigger
              value="app-requests"
              className="uppercase py-2 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-[#0F172A] data-[state=active]:shadow-sm data-[state=active]:text-white text-slate-500 transition-all gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Application Requests
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB CONTENTS */}
        <div className="flex-1 flex flex-col min-h-0">
          {/* FIX: Force TabsContent to act as a flex container so ActivePartners can stretch */}
          <TabsContent
            value="active-partners"
            className="m-0 flex-1 data-[state=active]:flex flex-col outline-none min-h-0"
          >
            <ActivePartners />
          </TabsContent>

          <TabsContent
            value="app-requests"
            className="m-0 flex-1 data-[state=active]:flex flex-col outline-none min-h-0"
          >
            <PartnerRequestsQueue />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
