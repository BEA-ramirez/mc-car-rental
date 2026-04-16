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
    <div className="bg-card shrink-0 flex flex-col transition-colors">
      {/* Slim Utility Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30 transition-colors">
        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Directory Metrics
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5">
            Updated:{" "}
            <span className="text-foreground font-mono">
              {dataUpdatedAt
                ? format(dataUpdatedAt, "MMM dd, HH:mm")
                : "Just now"}
            </span>
          </p>
          <div className="h-3 w-px bg-border" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md shadow-none transition-colors"
          >
            <RotateCw
              className={`h-3 w-3 ${isFetching ? "animate-spin text-foreground" : ""}`}
            />
          </Button>
        </div>
      </div>

      {isLoading || isFetching ? (
        <ClientOverviewSkeleton />
      ) : (
        <>
          {/* Solid Grid Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border bg-background transition-colors">
            {/* Stat 1 */}
            <div className="p-3 md:p-4 hover:bg-secondary/30 transition-colors flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-md bg-foreground/5">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
                <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-0.5">
                  Total Users
                </h4>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h5 className="font-black text-xl text-foreground leading-none font-mono">
                  {stats.total_users.toLocaleString()}
                </h5>
              </div>
            </div>

            {/* Stat 2 */}
            <div className="p-3 md:p-4 hover:bg-secondary/30 transition-colors flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-md bg-amber-500/10">
                  <IdCard className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <h4 className="text-[9px] text-amber-600 dark:text-amber-400 uppercase font-bold tracking-widest leading-none mt-0.5">
                  Pending ID
                </h4>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h5 className="font-black text-xl text-amber-600 dark:text-amber-400 leading-none font-mono">
                  {stats.pending_id.toLocaleString()}
                </h5>
                {stats.pending_id > 0 && (
                  <span className="text-[8px] font-bold text-destructive uppercase tracking-widest">
                    Requires Action
                  </span>
                )}
              </div>
            </div>

            {/* Stat 3 */}
            <div className="p-3 md:p-4 hover:bg-secondary/30 transition-colors flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-md bg-blue-500/10">
                  <Car className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                </div>
                <h4 className="text-[9px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-widest leading-none mt-0.5">
                  Active Rentals
                </h4>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h5 className="font-black text-xl text-blue-600 dark:text-blue-400 leading-none font-mono">
                  {stats.active_rentals.toLocaleString()}
                </h5>
              </div>
            </div>

            {/* Stat 4 */}
            <div className="p-3 md:p-4 hover:bg-secondary/30 transition-colors flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-md bg-purple-500/10">
                  <Handshake className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                </div>
                <h4 className="text-[9px] text-purple-600 dark:text-purple-400 uppercase font-bold tracking-widest leading-none mt-0.5">
                  Fleet Partners
                </h4>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h5 className="font-black text-xl text-purple-600 dark:text-purple-400 leading-none font-mono">
                  {stats.fleet_partners.toLocaleString()}
                </h5>
              </div>
            </div>

            {/* Stat 5 */}
            <div className="p-3 md:p-4 hover:bg-secondary/30 transition-colors flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1 rounded-md bg-emerald-500/10">
                  <LifeBuoy className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <h4 className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-widest leading-none mt-0.5">
                  Active Drivers
                </h4>
              </div>
              <div className="flex items-baseline gap-2 mt-0.5">
                <h5 className="font-black text-xl text-emerald-600 dark:text-emerald-400 leading-none font-mono">
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
