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
    <div className="bg-white border-b border-slate-200 shrink-0">
      {/* Slim Utility Bar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-slate-100 bg-slate-50/50">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          Live Metrics
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-medium uppercase tracking-wider">
          <p>
            Updated:{" "}
            <span className="text-slate-800 font-bold">Today, 14:32 PM</span>
          </p>
          <div className="h-3 w-[1px] bg-slate-300" /> {/* Separator */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 text-slate-400 hover:text-slate-800 hover:bg-slate-200 rounded"
              >
                <EllipsisVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-lg shadow-md border-slate-200"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-xs cursor-pointer text-slate-600">
                  <RotateCw className="w-3.5 h-3.5 mr-2" /> Refresh Data
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs cursor-pointer text-slate-600">
                  <ScanSearch className="w-3.5 h-3.5 mr-2" /> Review Logs
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Grid Row */}
      <div className="grid grid-cols-2 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-slate-100 p-2">
        {/* Stat 1 */}
        <div className="flex flex-col justify-between p-4">
          <div className="flex items-center gap-1.5 text-slate-500 mb-2">
            <Handshake className="w-3.5 h-3.5" />
            <h4 className="text-[10px] uppercase font-bold tracking-wider">
              Total Partners
            </h4>
          </div>
          <div>
            <h5 className="font-bold text-2xl text-slate-800 leading-none mb-1">
              24
            </h5>
            <p className="text-[10px] font-medium text-slate-400">
              Active Providers
            </p>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="flex flex-col justify-between p-4">
          <div className="flex items-center gap-1.5 text-blue-600 mb-2">
            <Car className="w-3.5 h-3.5" />
            <h4 className="text-[10px] uppercase font-bold tracking-wider">
              Total Fleet
            </h4>
          </div>
          <div>
            <h5 className="font-bold text-2xl text-slate-800 leading-none mb-1">
              34
            </h5>
            <p className="text-[10px] font-medium text-slate-400">
              Available: 30
            </p>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="flex flex-col justify-between p-4">
          <div className="flex items-center gap-1.5 text-emerald-600 mb-2">
            <Key className="w-3.5 h-3.5" />
            <h4 className="text-[10px] uppercase font-bold tracking-wider">
              Active Rentals
            </h4>
          </div>
          <div>
            <h5 className="font-bold text-2xl text-slate-800 leading-none mb-1">
              23
            </h5>
            <p className="text-[10px] font-medium text-slate-400">
              Utilization: 26%
            </p>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="flex flex-col justify-between p-4">
          <div className="flex items-center gap-1.5 text-amber-600 mb-2">
            <TriangleAlert className="w-3.5 h-3.5" />
            <h4 className="text-[10px] uppercase font-bold tracking-wider">
              Expiring Docs
            </h4>
          </div>
          <div>
            <h5 className="font-bold text-2xl text-slate-800 leading-none mb-1">
              16
            </h5>
            <p className="text-[10px] font-medium text-slate-400">
              Urgent Action
            </p>
          </div>
        </div>

        {/* Stat 5 */}
        <div className="flex flex-col justify-between p-4">
          <div className="flex items-center gap-1.5 text-purple-600 mb-2">
            <Wallet className="w-3.5 h-3.5" />
            <h4 className="text-[10px] uppercase font-bold tracking-wider">
              Payouts Due
            </h4>
          </div>
          <div>
            <h5 className="font-bold text-2xl text-slate-800 leading-none mb-1">
              12
            </h5>
            <p className="text-[10px] font-medium text-slate-400">For Oct 30</p>
          </div>
        </div>
      </div>
    </div>
  );
}
