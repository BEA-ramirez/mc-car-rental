import {
  User,
  EllipsisVertical,
  IdCard,
  Car,
  Handshake,
  LifeBuoy,
  RotateCw,
  Ban,
  ScanSearch,
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

function ClientsOverview() {
  return (
    <div className="px-3 pb-3 pt-2 shadow-sm bg-card rounded-lg w-full">
      <div className="flex items-center justify-between mb-2">
        <h2 className="text-[14px] font-semibold">Clients Overview</h2>
        <div className="flex items-center justify-end gap-2 text-[12px] text-card-foreground/50 font-normal">
          <p>Last Updated: </p>
          <p>Today, 14:32 PM</p>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-transparent! border-none! shadow-none! cursor-pointer"
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
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2 ">
                    <Ban className="size-4" />
                    <p>Banned Users</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <div className="grid grid-cols-5 grid-rows-1 w-full h-20 pb-1">
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-card-foreground/80">
            <User className="w-4 h-4 stroke-2" />
            <h4 className="text-[14px] font-medium">Total Users</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.4rem]">24</h5>
            <p className="text-card-foreground/50 text-[12px] font-medium">
              Active Status
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-card-foreground/80">
            <IdCard className="w-4 h-4 stroke-2" />
            <h4 className="text-[14px] font-medium">Pending Verification</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">34</h5>
            <p className="text-card-foreground/50 text-[12px] font-medium">
              Pending Status
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-card-foreground/80">
            <Car className="w-4 h-4 stroke-2" />
            <h4 className="text-[14px] font-medium">Active Rentals</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">23</h5>
            <p className="text-card-foreground/50 text-[12px] font-medium">
              Ongoing Status
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-card-foreground/80">
            <Handshake className="w-4 h-4 stroke-2" />
            <h4 className="text-[14px] font-medium">Fleet Partners</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">16</h5>
            <p className="text-card-foreground/50 text-[12px] font-medium">
              Verified
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-card-foreground/80">
            <LifeBuoy className="w-4 h-4 stroke-2" />
            <h4 className="text-[14px] font-medium">Drivers</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">12</h5>
            <p className="text-card-foreground/50 text-[12px] font-medium">
              Verified
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientsOverview;
