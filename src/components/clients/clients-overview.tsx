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
    <div className="px-3 py-3 shadow-sm bg-white rounded-md w-full">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[0.9rem] font-[500]">Clients Overview</h2>
        <div className="flex items-center justify-end gap-2 text-[0.7rem] text-gray-500 font-medium">
          <p>Last Updated: </p>
          <p>Today, 14:32 PM</p>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="!bg-transparent !border-none !shadow-none "
                size={"icon-sm"}
              >
                <EllipsisVertical className="text-black" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[5rem]">
              <DropdownMenuGroup>
                <DropdownMenuItem className="!text-xs">
                  <div className="flex items-center gap-2">
                    <RotateCw className="size-4" />
                    <p>Refresh</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="!text-xs">
                  <div className="flex items-center gap-2 ">
                    <ScanSearch className="size-4" />
                    <p>Review</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="!text-xs">
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
      <div className="grid grid-cols-5 grid-rows-1 w-full h-20">
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-gray-500">
            <User className="w-4 h-4 stroke-2" />
            <h4 className="text-[0.8rem] font-semibold">Total Users</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">24</h5>
            <p className="text-gray-400 text-[0.7rem] font-medium">
              Active Status
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-gray-500">
            <IdCard className="w-4 h-4 stroke-2" />
            <h4 className="text-[0.8rem] font-semibold">
              Pending Verification
            </h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">34</h5>
            <p className="text-gray-400 text-[0.7rem] font-medium">
              Pending Status
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-gray-500">
            <Car className="w-4 h-4 stroke-2" />
            <h4 className="text-[0.8rem] font-semibold">Active Rentals</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">23</h5>
            <p className="text-gray-400 text-[0.7rem] font-medium">
              Ongoing Status
            </p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-gray-500">
            <Handshake className="w-4 h-4 stroke-2" />
            <h4 className="text-[0.8rem] font-semibold">Fleet Partners</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">16</h5>
            <p className="text-gray-400 text-[0.7rem] font-medium">Verified</p>
          </div>
        </div>
        <div className=" border-l-2 border-gray-300 pl-3 flex flex-col justify-between items-start">
          <div className="flex items-center gap-1 text-gray-500">
            <LifeBuoy className="w-4 h-4 stroke-2" />
            <h4 className="text-[0.8rem] font-semibold">Drivers</h4>
          </div>
          <div>
            <h5 className="font-bold text-[1.3rem]">12</h5>
            <p className="text-gray-400 text-[0.7rem] font-medium">Verified</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClientsOverview;
