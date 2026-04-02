import React from "react";
import { CompleteDriverType } from "@/lib/schemas/driver";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Send, Edit2, ShieldCheck, IdCard } from "lucide-react";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";
import { cn } from "@/lib/utils";

export default function DriverProfileHeader({
  driver,
  isSelfView = false, // Hides Call/Message features if true
}: {
  driver: CompleteDriverType;
  isSelfView?: boolean;
}) {
  return (
    <div
      className={cn(
        "bg-white px-4 py-5 sm:px-8 sm:py-6 flex flex-col lg:flex-row gap-5 items-start lg:items-center justify-between shrink-0",
        !isSelfView && "border-b border-slate-200",
      )}
    >
      {/* Identity Block */}
      <div className="flex items-center gap-4 sm:gap-5 min-w-0 w-full lg:w-auto">
        <Avatar className="h-14 w-14 sm:h-16 sm:w-16 border border-slate-200 shadow-sm shrink-0">
          <AvatarImage
            src={driver.profiles?.profile_picture_url || undefined}
          />
          <AvatarFallback className="bg-slate-100 text-slate-600 text-lg sm:text-xl font-black">
            {getInitials(driver.profiles?.full_name || "")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 truncate tracking-tight">
              {toTitleCase(driver.profiles?.full_name || "")}
            </h2>
            {driver.is_verified && (
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-500 shrink-0" />
            )}
            <Badge
              variant="outline"
              className={cn(
                "ml-1 text-[9px] font-bold px-2 py-0.5 uppercase tracking-widest rounded-sm border shadow-none",
                driver.driver_status === "Available"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : driver.driver_status === "On Trip"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-amber-50 text-amber-700 border-amber-200",
              )}
            >
              {driver.driver_status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[10px] sm:text-[11px] text-slate-500 font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1.5 text-slate-700 font-bold shrink-0">
              <span className="text-slate-400 font-medium">ID:</span>
              {driver.display_id}
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <IdCard className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
              {driver.profiles?.license_number || "No License"}
            </span>
            <span className="flex items-center gap-1.5 shrink-0">
              <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-400" />
              {driver.profiles?.phone_number || "No Phone"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions - Hides contact tools if the driver is viewing their own profile */}
      {!isSelfView && (
        <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 shrink-0 w-full lg:w-auto mt-2 lg:mt-0">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 lg:flex-none h-8 text-[10px] sm:text-[11px] uppercase tracking-wider font-bold shadow-none rounded-sm border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Phone className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" /> Call
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 lg:flex-none h-8 text-[10px] sm:text-[11px] uppercase tracking-wider font-bold shadow-none rounded-sm border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            <Send className="w-3 h-3 sm:w-3.5 sm:h-3.5 mr-1.5" /> Message
          </Button>
          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm hover:bg-slate-100 text-slate-400 hover:text-slate-900 shrink-0 hidden sm:flex"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
