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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function FleetPartnersOverview() {
  return (
    <div className="px-3 py-3 shadow-sm bg-card rounded-md w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[0.9rem] font-[500]">Fleet Partners Overview</h2>
        <div className="flex items-center justify-end gap-2 text-[0.7rem] text-card-foreground/40 font-medium">
          <p>Last Updated: </p>
          <p>Today, 14:32 PM</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-transparent! border-none! shadow-none! "
                size={"icon-sm"}
              >
                <EllipsisVertical className="text-card-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-20">
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2">
                    <RotateCw className="size-4" />
                    <p>Refresh</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2 ">
                    <ScanSearch className="size-4" />
                    <p>Review</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-5 grid-rows-1 w-full h-20">
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-card-foreground/70">
            <Handshake className="w-4 h-4 stroke-2" />
            <h4 className="text-[0.8rem] font-semibold">Total Partners</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">24</h5>
            <p className="text-card-foreground/50 text-[0.7rem] font-medium">
              Active
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-card-foreground/70">
            <Car className="w-4 h-4 stroke-2" />
            <h4 className="text-[0.8rem] font-semibold">Total Fleet</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">34</h5>
            <p className="text-card-foreground/50 text-[0.7rem] font-medium">
              Available: 30
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-card-foreground/70">
            <Key className="w-4 h-4 stroke-2" />
            <h4 className="text-[0.8rem] font-semibold">Active Rentals</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">23</h5>
            <p className="text-card-foreground/50 text-[0.7rem] font-medium">
              Utilization: 26%
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-card-foreground/70">
            <TriangleAlert className="w-4 h-4 stroke-2" />
            <h4 className="text-[0.8rem] font-semibold">Expiring Documents</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">16</h5>
            <p className="text-card-foreground/50 text-[0.7rem] font-medium">
              Urgent Action
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-card-foreground/70">
            <Wallet className="w-4 h-4 stroke-2" />
            <h4 className="text-[0.8rem] font-semibold">Payouts Due</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">12</h5>
            <p className="text-card-foreground/50 text-[0.7rem] font-medium">
              For Oct 30
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FleetPartnersOverview;
