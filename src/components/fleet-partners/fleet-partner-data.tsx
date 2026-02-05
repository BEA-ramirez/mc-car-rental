import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ActivePartners from "./active-partners";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { UserType } from "@/lib/schemas/user";

function FleetPartnerData({
  carOwnerApplicants,
}: {
  carOwnerApplicants: UserType[];
}) {
  const tabsTriggerClasses =
    "relative rounded-md p-3 py-4 font-semibold text-card shadow-none transition-none  data-[state=active]:bg-primary-foreground/30 data-[state=active]:text-card data-[state=active]:shadow-none";

  return (
    <div>
      <div className="mt-4">
        <Tabs defaultValue="active-partners" className="w-full">
          <TabsList className="w-full justify-start border-b bg-primary/90 rounded-md py-6 px-2">
            <TabsTrigger value="active-partners" className={tabsTriggerClasses}>
              Active Partners
            </TabsTrigger>
            <TabsTrigger value="app-requests" className={tabsTriggerClasses}>
              Application Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active-partners" className="mt-4">
            <ActivePartners carOwnerApplicants={carOwnerApplicants} />
          </TabsContent>
          <TabsContent value="app-requests" className="mt-6">
            <div>hello</div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default FleetPartnerData;
