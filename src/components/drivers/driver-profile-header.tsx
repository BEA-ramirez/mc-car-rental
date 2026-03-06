import React from "react";
import { CompleteDriverType } from "@/lib/schemas/driver";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, Send, Edit2, ShieldCheck, Mail, IdCard } from "lucide-react";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";
import { cn } from "@/lib/utils";

export default function DriverProfileHeader({
  driver,
}: {
  driver: CompleteDriverType;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-5 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
      {/* Identity Block */}
      <div className="flex items-center gap-4 min-w-0">
        <Avatar className="h-16 w-16 border-2 border-white shadow-sm ring-1 ring-slate-200 shrink-0">
          <AvatarImage
            src={driver.profiles?.profile_picture_url || undefined}
          />
          <AvatarFallback className="bg-slate-100 text-slate-600 text-xl font-black">
            {getInitials(driver.profiles?.full_name || "")}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-black text-slate-900 truncate">
              {toTitleCase(driver.profiles?.full_name || "")}
            </h2>
            {driver.is_verified && (
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
            <span className="font-mono text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
              {driver.display_id}
            </span>
            <span className="flex items-center gap-1.5">
              <IdCard className="w-3.5 h-3.5" />{" "}
              {driver.profiles?.license_number || "No License"}
            </span>
            <span className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5" />{" "}
              {driver.profiles?.phone_number || "No Phone"}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Actions & Status */}
      <div className="flex flex-col items-end gap-3 shrink-0 w-full md:w-auto">
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] font-bold px-2.5 py-0.5 uppercase tracking-widest rounded-sm border",
            driver.driver_status === "Available"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : driver.driver_status === "On Trip"
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-amber-50 text-amber-700 border-amber-200",
          )}
        >
          {driver.driver_status}
        </Badge>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold shadow-none rounded-sm bg-white"
          >
            <Phone className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Call
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold shadow-none rounded-sm bg-white"
          >
            <Send className="w-3.5 h-3.5 mr-1.5 text-slate-500" /> Message
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-sm hover:bg-slate-100 text-slate-500"
          >
            <Edit2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
