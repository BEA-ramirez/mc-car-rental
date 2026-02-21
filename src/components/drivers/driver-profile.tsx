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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Phone,
  Send,
  Edit2,
  MapPin,
  Mail,
  CalendarDays,
  IdCard,
  Car,
  FileText,
} from "lucide-react";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";
import { Badge } from "@/components/ui/badge";
import DriverSchedule from "./big-calendar";
import { cn } from "@/lib/utils";

export default function DriverProfile({
  driver,
}: {
  driver: CompleteDriverType | null;
}) {
  if (!driver) return null;

  return (
    // FIX 1: Removed h-full and min-h-0. The container will now expand naturally.
    <div className="flex flex-col bg-slate-50/50 pb-8">
      {/* --- TOP PROFILE HEADER --- */}
      <div className="bg-white border-b border-slate-200 shadow-sm">
        {/* Top Control Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-slate-200">
              <AvatarImage
                src={driver.profiles?.profile_picture_url || undefined}
              />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-medium">
                {getInitials(driver.profiles?.full_name || "")}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-sm font-bold text-slate-800 leading-tight">
                {toTitleCase(driver.profiles?.full_name)}
              </h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                  {driver.display_id}
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[9px] uppercase tracking-wider px-1.5 h-4 border",
                    driver.driver_status === "Available"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : driver.driver_status === "On Trip"
                        ? "bg-blue-50 text-blue-700 border-blue-200"
                        : "bg-slate-50 text-slate-600 border-slate-200",
                  )}
                >
                  {driver.driver_status}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white text-slate-700 shadow-sm"
            >
              <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white text-slate-700 shadow-sm"
            >
              <Send className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Message
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm ml-2"
            >
              <Edit2 className="w-3.5 h-3.5 mr-1.5" /> Edit Profile
            </Button>

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 ml-1 text-slate-500 hover:bg-slate-100"
                >
                  <Menu className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-base">Driver Actions</SheetTitle>
                  <SheetDescription className="text-xs">
                    Quick administrative actions for this driver.
                  </SheetDescription>
                </SheetHeader>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6">
          {/* Col 1: Contact */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Phone className="w-3 h-3" /> Phone
              </label>
              <p className="text-xs font-medium text-slate-800">
                {driver.profiles?.phone_number || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <Mail className="w-3 h-3" /> Email
              </label>
              <p className="text-xs font-medium text-slate-800 truncate">
                {driver.profiles?.email || "N/A"}
              </p>
            </div>
          </div>

          {/* Col 2: Licensing */}
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <IdCard className="w-3 h-3" /> License No.
              </label>
              <p className="text-xs font-medium text-slate-800 font-mono">
                {driver.profiles?.license_number || "N/A"}
              </p>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <CalendarDays className="w-3 h-3" /> Expiry Date
              </label>
              <p className="text-xs font-medium text-slate-800">
                {driver.profiles?.license_expiry_date || "N/A"}
              </p>
            </div>
          </div>

          {/* Col 3: Location */}
          <div className="md:col-span-2 space-y-3 border-l border-slate-100 pl-6">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                <MapPin className="w-3 h-3" /> Address
              </label>
              <p className="text-xs font-medium text-slate-800 line-clamp-2">
                {driver.profiles?.address || "No address on file."}
              </p>
            </div>
            <div className="flex gap-4">
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Account Status
                </label>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] h-5 border px-2",
                    driver.is_verified
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : "bg-amber-50 text-amber-700 border-amber-200",
                  )}
                >
                  {driver.is_verified ? "Verified" : "Pending Verification"}
                </Badge>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                  Total Trips
                </label>
                <span className="text-xs font-bold text-slate-800 px-2 py-0.5 bg-slate-100 rounded border border-slate-200">
                  48
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- TABS SECTION --- */}
      <Tabs defaultValue="sched" className="flex flex-col mt-6 px-6">
        <TabsList className="h-8 bg-slate-100 p-0.5 rounded-md border border-slate-200 inline-flex w-fit mb-4">
          <TabsTrigger
            value="sched"
            className="h-6 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
          >
            <CalendarDays className="w-3.5 h-3.5" /> Schedule & Trips
          </TabsTrigger>
          <TabsTrigger
            value="docs"
            className="h-6 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Documents
          </TabsTrigger>
        </TabsList>

        {/* FIX 2: Removed internal scrolling restrictions, allowed content to push parent height */}
        <TabsContent
          value="sched"
          className="m-0 data-[state=active]:flex flex-col gap-4 outline-none"
        >
          {/* Current Assignment Box */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center">
                <Car className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-0.5">
                  Current Assignment
                </h3>
                <p className="text-sm font-medium text-slate-900">
                  Toyota Vios{" "}
                  <span className="text-slate-500 font-mono text-xs ml-1 bg-slate-100 px-1.5 rounded border border-slate-200">
                    ABC-1234
                  </span>
                </p>
              </div>
            </div>
            <div className="text-right border-l border-slate-100 pl-6">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-0.5">
                Next Pickup
              </p>
              <p className="text-xs font-medium text-slate-800">
                Airport Terminal 3{" "}
                <span className="text-slate-400 ml-1">• 2:00 PM</span>
              </p>
            </div>
          </div>

          {/* FIX 3: Explicit h-[700px] ensures the calendar is nice and large, triggering a page-level scroll */}
          <div className="flex flex-col xl:flex-row gap-4 h-[700px]">
            {/* Calendar */}
            <div className="xl:w-2/3 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Driver Calendar
                </h3>
              </div>
              <div className="flex-1 p-2 min-h-0">
                <DriverSchedule />
              </div>
            </div>

            {/* Trip List Sidebar */}
            <div className="xl:w-1/3 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col h-full">
              <div className="p-3 border-b border-slate-100 bg-slate-50 shrink-0">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Trip History
                </h3>
              </div>
              <div className="flex-1 p-4 flex items-center justify-center text-slate-400 bg-slate-50/50">
                <p className="text-xs font-medium">
                  List of Trips Component Here
                </p>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="docs"
          className="m-0 bg-white border border-slate-200 rounded-lg shadow-sm p-6 outline-none"
        >
          <div className="flex flex-col items-center justify-center h-full text-slate-400 border-2 border-dashed border-slate-200 rounded-lg min-h-[400px]">
            <FileText className="h-8 w-8 mb-2 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">
              No documents uploaded.
            </p>
            <p className="text-[10px] mt-1">
              Upload driver's license, NBI clearance, etc.
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
