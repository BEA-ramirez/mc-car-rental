"use client";
import React from "react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
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
import { toTitleCase, toTitleCaseLine } from "@/actions/helper/format-text";
import {
  EllipsisVertical,
  Trash2,
  SquarePen,
  FileSearchCorner,
  History,
  Star,
  UserRound,
  BadgePercent,
  Banknote,
  BookAlert,
  Activity,
} from "lucide-react";
import { Button } from "../ui/button";
import {
  DatePickerComponent,
  CalendarView,
} from "@syncfusion/ej2-react-calendars";
import { useFleetPartners } from "../../../hooks/use-fleetPartners";

function PartnerHeader({
  selectedPartner,
  onEdit,
}: {
  selectedPartner: FleetPartnerType | null;
  onEdit: () => void;
}) {
  const start: CalendarView = "Year";
  const depth: CalendarView = "Year";
  const format: string = "MMMM y";
  const dateValue: Date = new Date();

  const { deletePartner } = useFleetPartners();

  const handleDeletePartner = async () => {
    if (!selectedPartner) return;
    const confirm = window.confirm(
      `Are you sure you want to archive ${selectedPartner.business_name}?`,
    );

    if (confirm) {
      deletePartner({
        carOwnerId: selectedPartner.car_owner_id,
        userId: selectedPartner.users.user_id,
      });
    }
  };

  return (
    <div className="rounded-lg bg-card shadow-md p-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          <div className="flex flex-col items-start justify-center gap-1 border-r pr-6">
            <div className="flex items-center gap-3">
              <h3 className="text-2xl font-bold">
                {toTitleCase(selectedPartner?.business_name || "New Partner")}
              </h3>
              <p className="border px-2 rounded-md text-sm uppercase font-medium bg-foreground/60 text-background ">
                {selectedPartner?.verification_status}
              </p>
            </div>
            <p className="text-xs text-foreground/80 bg-foreground/10 px-2 rounded-lg">
              {selectedPartner?.car_owner_id}
            </p>
          </div>
          <h5 className="text-xs w-12 h-12 rounded-full bg-foreground/20 font-semibold text-foreground/80 flex flex-col items-center gap-1 border-r pr-3"></h5>
          <div className="flex flex-col items-start justify-center gap-1 6">
            <h5 className="flex items-center gap-1 ">
              <Star className="text-amber-400 fill-amber-400 w-4 h-4" />
              <span className="text-md font-semibold text-foreground/80">
                {selectedPartner?.trust_score}
              </span>
            </h5>
            <div className="flex flex-col items-start justify-center gap-1">
              <h5 className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
                <BadgePercent className="w-4 h-4" />
                <span>{selectedPartner?.revenue_share_percentage}/30</span>
              </h5>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-transparent! border-none! shadow-none! cursor-pointer"
                size={"icon-sm"}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisVertical className="text-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40"
              onCloseAutoFocus={(e) => e.preventDefault()}
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2">
                    <FileSearchCorner className="size-4" />
                    <p>View Details</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2 ">
                    <History className="size-4" />
                    <p>Item History</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2 ">
                    <SquarePen className="size-4" />
                    <p>Edit Fleet</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-xs!"
                  onClick={handleDeletePartner}
                >
                  <div className="flex items-center gap-2 ">
                    <Trash2 className="size-4" />
                    <p>Delete User</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex flex-col justify-center items-end mt-3 border-t p-3 pb-3 gap-2">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 border-r-2 pr-2">
              <div className="w-3 h-3 bg-green-400 rounded-full" />
              <h6 className="font-semibold text-sm text-foreground">
                On Rent:
              </h6>
              <p className="text-sm font-semibold text-foreground/80">5</p>
            </div>
            <div className="flex items-center gap-2 border-r-2 pr-2">
              <div className="w-3 h-3 bg-orange-400 rounded-full" />
              <h6 className="font-semibold text-sm text-foreground">
                Idle/Garage:
              </h6>
              <p className="text-sm font-semibold text-foreground/80">2</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-400 rounded-full" />
              <h6 className="font-semibold text-sm text-foreground">
                Maintenance:
              </h6>
              <p className="text-sm font-semibold text-foreground/80">1</p>
            </div>
          </div>
          <div className="w-[20%]">
            <DatePickerComponent
              value={dateValue}
              start={start}
              depth={depth}
              format={format}
            ></DatePickerComponent>
          </div>
        </div>
        <div className="grid grid-rows-1 grid-cols-3 gap-3 w-full">
          <div className="border p-3 rounded-md flex items-center justify-between ">
            <div className="text-foreground/90">
              <h6 className="text-sm">Earnings</h6>
              <p className="text-md font-semibold">P45,000</p>
            </div>
            <div className="border rounded-full p-3 bg-background">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
          <div className="border p-3 rounded-md flex items-center justify-between ">
            <div className="text-foreground/90">
              <h6 className="text-sm">Compliance</h6>
              <div className="flex items-center gap-3 font-semibold text-md">
                <p>All Good</p>
              </div>
            </div>
            <div className="border rounded-full p-3 bg-background">
              <BookAlert className="w-6 h-6" />
            </div>
          </div>
          <div className="border p-3 rounded-md flex items-center justify-between ">
            <div className="text-foreground/90">
              <h6 className="text-sm">Fleet Health</h6>
              <p className="text-md font-semibold">6 Maintenance</p>
            </div>
            <div className="border rounded-full p-3 bg-background">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartnerHeader;
