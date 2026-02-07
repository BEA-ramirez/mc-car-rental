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
    "relative h-10 rounded-none cursor-pointer border-b-2 border-b-transparent bg-transparent px-4 pb-2 pt-2 font-semibold text-muted-foreground shadow-none transition-none data-[state=active]:border-b-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none";

  return (
    <div>
      <div className="mt-4">
        <Tabs defaultValue="active-partners" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b  bg-transparent p-0">
            <TabsTrigger value="active-partners" className={tabsTriggerClasses}>
              Active Partners
            </TabsTrigger>
            <TabsTrigger value="app-requests" className={tabsTriggerClasses}>
              Application Requests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active-partners" className="mt-4">
            <ActivePartners />
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
