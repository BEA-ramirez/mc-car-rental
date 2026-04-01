"use client";
import { User, IdCard, Car, Handshake, LifeBuoy, RotateCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClientOverviewSkeleton } from "../skeletons";
import { useClientsKpi } from "../../../hooks/use-clients";
import { format } from "date-fns";

export default function ClientsOverview() {
  const {
    data: kpiData,
    isLoading,
    isFetching, // True when background refreshing
    refetch, // Function to manually trigger a refresh
    dataUpdatedAt,
  } = useClientsKpi();

  // Fallback 0s while loading or if data is missing
  const stats = kpiData || {
    total_users: 0,
    pending_id: 0,
    active_rentals: 0,
    fleet_partners: 0,
    active_drivers: 0,
  };

  return (
    <div className="bg-white border-b border-slate-200 shrink-0 flex flex-col">
      {/* Slim Utility Bar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-slate-100 bg-slate-50/80">
        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Directory Metrics
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
            Updated:{" "}
            <span className="text-slate-800">
              {dataUpdatedAt
                ? format(dataUpdatedAt, "MMM dd, HH:mm")
                : "Just now"}
            </span>
          </p>
          <div className="h-3 w-px bg-slate-300" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-5 w-5 text-slate-400 hover:text-slate-800 rounded-sm"
          >
            <RotateCw
              className={`h-3 w-3 ${isFetching ? "animate-spin text-slate-800" : ""}`}
            />
          </Button>
        </div>
      </div>

      {isLoading || isFetching ? (
        <ClientOverviewSkeleton />
      ) : (
        <>
          {/* Solid Grid Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Stat 1 */}
            <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-1.5 text-slate-500 mb-3">
                <User className="w-3.5 h-3.5" />
                <h4 className="text-[10px] uppercase font-bold tracking-widest">
                  Total Users
                </h4>
              </div>
              <div className="flex items-baseline gap-2">
                <h5 className="font-bold text-2xl text-slate-900 leading-none font-mono">
                  {stats.total_users.toLocaleString()}
                </h5>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-1.5 text-amber-600 mb-3">
                <IdCard className="w-3.5 h-3.5" />
                <h4 className="text-[10px] uppercase font-bold tracking-widest">
                  Pending ID
                </h4>
              </div>
              <div className="flex items-baseline gap-2">
                <h5 className="font-bold text-2xl text-amber-600 leading-none font-mono">
                  {stats.pending_id.toLocaleString()}
                </h5>
                {stats.pending_id > 0 && (
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                    Requires Action
                  </span>
                )}
              </div>
            </div>

            {/* Stat 3 */}
            <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-1.5 text-blue-600 mb-3">
                <Car className="w-3.5 h-3.5" />
                <h4 className="text-[10px] uppercase font-bold tracking-widest">
                  Active Rentals
                </h4>
              </div>
              <div className="flex items-baseline gap-2">
                <h5 className="font-bold text-2xl text-blue-600 leading-none font-mono">
                  {stats.active_rentals.toLocaleString()}
                </h5>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-1.5 text-purple-600 mb-3">
                <Handshake className="w-3.5 h-3.5" />
                <h4 className="text-[10px] uppercase font-bold tracking-widest">
                  Fleet Partners
                </h4>
              </div>
              <div className="flex items-baseline gap-2">
                <h5 className="font-bold text-2xl text-purple-600 leading-none font-mono">
                  {stats.fleet_partners.toLocaleString()}
                </h5>
              </div>
            </div>

            {/* Stat 5 */}
            <div className="p-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-1.5 text-emerald-600 mb-3">
                <LifeBuoy className="w-3.5 h-3.5" />
                <h4 className="text-[10px] uppercase font-bold tracking-widest">
                  Active Drivers
                </h4>
              </div>
              <div className="flex items-baseline gap-2">
                <h5 className="font-bold text-2xl text-emerald-600 leading-none font-mono">
                  {stats.active_drivers.toLocaleString()}
                </h5>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
