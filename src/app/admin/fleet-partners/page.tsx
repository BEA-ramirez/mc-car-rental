import FleetPartnerData from "@/components/fleet-partners/fleet-partner-data";

export default async function FleetPartners() {
  return (
    <div className="flex flex-col w-full h-full p-4 md:p-5 bg-background font-sans overflow-hidden transition-colors duration-300">
      <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col flex-1 min-h-0 overflow-hidden transition-colors">
        <FleetPartnerData />
      </div>
    </div>
  );
}
