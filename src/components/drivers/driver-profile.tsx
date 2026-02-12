import React from "react";
import { CompleteDriverType } from "@/lib/schemas/driver";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "../ui/avatar";
import { Button } from "../ui/button";
import { Menu, Phone, Send, SquarePen, MapPin } from "lucide-react";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";
import { Badge } from "../ui/badge";
import MediumCalendar from "./big-calendar";

function DriverProfile({ driver }: { driver: CompleteDriverType | null }) {
  return (
    <div className="h-full w-[70%]">
      <div className="flex items-center justify-between">
        <h2 className="font-medium text-lg">Driver Profile & Dashboard</h2>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="default">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent className="w-75! sm:w-100!">
            <SheetHeader>
              <SheetTitle>Quick Actions</SheetTitle>
              <SheetDescription>
                This sheet doesn&apos;t have a close button in the top-right
                corner. Click outside to close.
              </SheetDescription>
            </SheetHeader>
          </SheetContent>
        </Sheet>
      </div>
      <Card className="mt-3 rounded-none shadow-sm border-none p-3">
        <CardHeader className="p-0">
          <div className="flex items-center justify-between pr-6">
            <div className="flex items-center justify-start gap-6 border-r pr-8">
              <Avatar className="size-36 rounded-none!">
                <AvatarImage
                  src={driver?.profiles?.profile_picture_url || undefined}
                  alt="@shadcn"
                  className="rounded-none!"
                />
                <AvatarFallback>
                  {getInitials(driver?.profiles?.full_name || "")}
                </AvatarFallback>
              </Avatar>

              <div className="flex flex-col items-between justify-center text-xs gap-2 px-4">
                <div>
                  <label className="uppercase ">Name</label>
                  <p className="text-primary/70 font-medium">
                    {toTitleCase(driver?.profiles?.full_name)}
                  </p>
                </div>
                <div>
                  <label className="uppercase">Phone No.</label>
                  <p className="text-primary/70 font-medium">
                    {driver?.profiles?.phone_number}
                  </p>
                </div>
                <div>
                  <label className="uppercase">Email</label>
                  <p className="text-primary/70 font-medium">
                    {driver?.profiles?.email}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start justify-start text-xs gap-2 px-4">
                <div>
                  <label className="uppercase ">License No.</label>
                  <p className="text-primary/70 font-medium">
                    {driver?.profiles?.license_number}
                  </p>
                </div>
                <div>
                  <label className="uppercase">License Expiry</label>
                  <p className="text-primary/70 font-medium">
                    {driver?.profiles?.license_expiry_date}
                  </p>
                </div>
                <div>
                  <label className="uppercase">Account Verified</label>
                  <p className="text-primary/70 font-medium">
                    {driver?.is_verified ? "Verified" : "Not Verified"}
                  </p>
                </div>
              </div>
            </div>
            <div className="border p-1 px-4 flex flex-col items-start justify-start gap-1 text-xs rounded-sm font-medium text-primary/70">
              <p>ID: {driver?.display_id}</p>
              <p>Total Trips: 48</p>
              <p className="mt-2">Current Unit:</p>
              <div className="border p-1 w-full rounded-sm text-card bg-primary/60 text-center">
                <p>Toyota Vios</p>
                <p>ABC-1224</p>
              </div>
            </div>
          </div>
          <div className="flex items-end justify-between p-2 border-t gap-6">
            <div className="flex flex-col items-start gap-2">
              <Badge className="bg-primary/80">{driver?.driver_status}</Badge>
              <div className="text-xs text-primary/70 font-medium flex gap-1 ">
                <MapPin className="w-4 h-4 shrink-0" />
                <p className="line-clamp-3">
                  {driver?.profiles?.address ||
                    "Cecilia Chapman 711-2880 Nulla St. Mankato Mississippi 96522 "}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button>
                <Phone />
                Call
              </Button>
              <Button>
                <Send />
                Message
              </Button>
              <Button>
                <SquarePen />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
      <Card className="mt-3 rounded-none shadow-sm border-none p-3 w-full h-[20rem]">
        <MediumCalendar />
      </Card>
    </div>
  );
}

export default DriverProfile;
