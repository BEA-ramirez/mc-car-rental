"use client";

import {
  EllipsisVertical,
  Car,
  Handshake,
  RotateCw,
  Key,
  ScanSearch,
  TriangleAlert,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function FleetPartnersOverview() {
  return (
    <div className="bg-card border-b border-border shrink-0 flex flex-col transition-colors">
      {/* Slim Utility Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary/30 transition-colors">
        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live Metrics
        </div>
        <div className="flex items-center gap-3">
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest flex items-center gap-1.5">
            Updated:{" "}
            <span className="text-foreground font-mono">Today, 14:32 PM</span>
          </p>
          <div className="h-3 w-px bg-border transition-colors" />
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md shadow-none transition-colors"
              >
                <EllipsisVertical className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-xl shadow-xl border-border bg-popover p-1"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-muted-foreground focus:bg-secondary focus:text-foreground rounded-lg transition-colors py-1.5">
                  <RotateCw className="w-3.5 h-3.5 mr-2" /> Refresh Data
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-muted-foreground focus:bg-secondary focus:text-foreground rounded-lg transition-colors py-1.5">
                  <ScanSearch className="w-3.5 h-3.5 mr-2" /> Review Logs
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-border bg-background transition-colors">
        {/* Stat 1 */}
        <div className="p-3 md:p-4 hover:bg-secondary/30 transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-md bg-foreground/5">
              <Handshake className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <h4 className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest leading-none mt-0.5">
              Total Partners
            </h4>
          </div>
          <div className="flex flex-col gap-1 mt-0.5">
            <h5 className="font-black text-xl text-foreground leading-none font-mono">
              24
            </h5>
            <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
              Active Providers
            </p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-3 md:p-4 hover:bg-secondary/30 transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-md bg-blue-500/10">
              <Car className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            </div>
            <h4 className="text-[9px] text-blue-600 dark:text-blue-400 uppercase font-bold tracking-widest leading-none mt-0.5">
              Total Fleet
            </h4>
          </div>
          <div className="flex flex-col gap-1 mt-0.5">
            <h5 className="font-black text-xl text-blue-600 dark:text-blue-400 leading-none font-mono">
              34
            </h5>
            <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
              Available: 30
            </p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-3 md:p-4 hover:bg-secondary/30 transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-md bg-emerald-500/10">
              <Key className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h4 className="text-[9px] text-emerald-600 dark:text-emerald-400 uppercase font-bold tracking-widest leading-none mt-0.5">
              Active Rentals
            </h4>
          </div>
          <div className="flex flex-col gap-1 mt-0.5">
            <h5 className="font-black text-xl text-emerald-600 dark:text-emerald-400 leading-none font-mono">
              23
            </h5>
            <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
              Utilization: 26%
            </p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-3 md:p-4 hover:bg-secondary/30 transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-md bg-amber-500/10">
              <TriangleAlert className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="text-[9px] text-amber-600 dark:text-amber-400 uppercase font-bold tracking-widest leading-none mt-0.5">
              Expiring Docs
            </h4>
          </div>
          <div className="flex flex-col gap-1 mt-0.5">
            <h5 className="font-black text-xl text-amber-600 dark:text-amber-400 leading-none font-mono">
              16
            </h5>
            <p className="text-[8px] font-bold uppercase tracking-widest text-destructive">
              Urgent Action
            </p>
          </div>
        </div>

        {/* Stat 5 */}
        <div className="p-3 md:p-4 hover:bg-secondary/30 transition-colors flex flex-col justify-center">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1 rounded-md bg-purple-500/10">
              <Wallet className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            </div>
            <h4 className="text-[9px] text-purple-600 dark:text-purple-400 uppercase font-bold tracking-widest leading-none mt-0.5">
              Payouts Due
            </h4>
          </div>
          <div className="flex flex-col gap-1 mt-0.5">
            <h5 className="font-black text-xl text-purple-600 dark:text-purple-400 leading-none font-mono">
              12
            </h5>
            <p className="text-[8px] font-bold uppercase tracking-widest text-muted-foreground">
              For Oct 30
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
