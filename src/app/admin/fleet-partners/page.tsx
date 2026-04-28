import FleetPartnerData from "@/components/fleet-partners/fleet-partner-data";

export default async function FleetPartners() {
  return (
    <div className="flex flex-col w-full min-h-0 bg-background font-sans transition-colors duration-300">
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
        <FleetPartnerData />
      </div>
    </div>
  );
}
