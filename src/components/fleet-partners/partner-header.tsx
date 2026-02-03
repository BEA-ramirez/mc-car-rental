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
import { DatePickerComponent } from "@syncfusion/ej2-react-calendars";

function PartnerHeader({
  selectedPartner,
}: {
  selectedPartner: FleetPartnerType | null;
}) {
  return (
    <div className="rounded-lg bg-card shadow-md p-3 px-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center justify-start gap-3">
          <div className="flex flex-col items-start justify-center gap-1 border-r pr-6">
            <h3 className="text-2xl font-bold">
              {toTitleCase(selectedPartner?.business_name || "New Partner")}
            </h3>
            <p className="text-xs text-foreground/60">
              {selectedPartner?.car_owner_id}
            </p>
          </div>
          <div className="flex flex-col items-start justify-center gap-1">
            <h5 className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
              <UserRound className="w-4 h-4 stroke-2" />
              {toTitleCase(
                selectedPartner?.full_name ||
                  selectedPartner?.first_name +
                    " " +
                    selectedPartner?.last_name,
              )}
            </h5>
            <h5 className="flex items-center gap-1 ">
              <Star className="text-amber-400 fill-amber-400 w-4 h-4" />
              <span className="text-xs font-semibold text-foreground/80">
                {selectedPartner?.trust_score}
              </span>
            </h5>
            <h5 className="text-xs font-semibold text-foreground/80 flex items-center gap-1">
              <BadgePercent className="w-4 h-4" />
              <span>{selectedPartner?.revenue_share_percentage}/30</span>
            </h5>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <p className="border px-2 py-1 rounded-md text-sm uppercase font-medium bg-foreground/80 text-background ">
            {selectedPartner?.verification_status}
          </p>
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
                <DropdownMenuItem className="text-xs!">
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

      <div className="mt-3 border-t grid grid-rows-1 grid-cols-3 gap-3 p-3 py-6">
        <DatePickerComponent
          id="datepicker"
          start="Decade"
          placeholder="Enter date"
        />
        <div className="border p-3 rounded-md flex items-center justify-between bg-foreground/30">
          <div className="text-foreground/90">
            <h6 className="text-sm">Earnings</h6>
            <p className="text-lg font-semibold">P45,000</p>
          </div>
          <div className="border rounded-full p-3">
            <Banknote className="w-6 h-6" />
          </div>
        </div>
        <div className="border p-3 rounded-md flex items-center justify-between bg-foreground/30">
          <div className="text-foreground/90">
            <h6 className="text-sm">Compliance</h6>
            <div className="flex items-center gap-3 font-semibold">
              <div className="w-3 h-3 bg-emerald-400 rounded-full" />
              <p>All Good</p>
            </div>
          </div>
          <div className="border rounded-full p-3">
            <BookAlert className="w-6 h-6" />
          </div>
        </div>
        <div className="border p-3 rounded-md flex items-center justify-between bg-foreground/30">
          <div className="text-foreground/90">
            <h6 className="text-sm">Fleet Health</h6>
            <p className="text-lg font-semibold">6 Maintenance</p>
          </div>
          <div className="border rounded-full p-3">
            <Activity className="w-6 h-6" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default PartnerHeader;
