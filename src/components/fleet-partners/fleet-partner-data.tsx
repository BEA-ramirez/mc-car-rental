import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivePartners from "./active-partners";
import { UserType } from "@/lib/schemas/user";
import { Users, UserPlus } from "lucide-react";

export default function FleetPartnerData({
  carOwnerApplicants,
}: {
  carOwnerApplicants: UserType[];
}) {
  return (
    <div className="flex flex-col h-[80rem] bg-slate-50/50">
      <Tabs
        defaultValue="active-partners"
        className="flex flex-col h-full min-h-0"
      >
        {/* TAB NAVIGATION */}
        <div className="px-6 pt-4 pb-2 shrink-0">
          <TabsList className="h-8 bg-slate-200/60 p-0.5 rounded-md border border-slate-200 inline-flex">
            <TabsTrigger
              value="active-partners"
              className="h-6 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              Active Partners
            </TabsTrigger>
            <TabsTrigger
              value="app-requests"
              className="h-6 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Application Requests
              {carOwnerApplicants.length > 0 && (
                <span className="ml-1 bg-blue-100 text-blue-700 text-[9px] px-1.5 py-0 rounded-full font-bold">
                  {carOwnerApplicants.length}
                </span>
              )}
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
            className="m-0 flex-1 data-[state=active]:flex flex-col outline-none p-6 min-h-0"
          >
            <div className="bg-white border border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center text-center shadow-sm h-full">
              <UserPlus className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-sm font-bold text-slate-700">
                No pending applications
              </p>
              <p className="text-xs text-slate-500 mt-1">
                New fleet partner requests will appear here.
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
