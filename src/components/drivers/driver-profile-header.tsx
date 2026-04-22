"use client";

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
  onOpenEdit,
}: {
  driver: CompleteDriverType;
  isSelfView?: boolean;
  onOpenEdit?: () => void;
}) {
  return (
    <div
      className={cn(
        "bg-card px-4 py-4 sm:px-6 sm:py-5 flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between shrink-0 transition-colors",
        !isSelfView && "border-b border-border",
      )}
    >
      {/* Identity Block */}
      <div className="flex items-center gap-3 sm:gap-4 min-w-0 w-full lg:w-auto">
        <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border border-border shadow-sm shrink-0 rounded-xl bg-secondary transition-colors">
          <AvatarImage
            src={driver.profiles?.profile_picture_url || undefined}
            className="object-cover"
          />
          <AvatarFallback className="bg-secondary text-foreground text-sm sm:text-base font-bold rounded-xl transition-colors">
            {getInitials(driver.profiles?.full_name || "")}
          </AvatarFallback>
        </Avatar>

        <div className="flex flex-col min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <h2 className="text-sm sm:text-base font-bold text-foreground truncate tracking-tight uppercase">
              {toTitleCase(driver.profiles?.full_name || "")}
            </h2>
            {driver.is_verified && (
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            )}
            <Badge
              variant="outline"
              className={cn(
                "ml-1 text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-widest rounded-md border transition-colors shadow-none",
                driver.driver_status === "Available"
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : driver.driver_status === "On Trip"
                    ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20"
                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
              )}
            >
              {driver.driver_status}
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[9px] sm:text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
            <span className="flex items-center gap-1 text-foreground shrink-0 font-mono">
              <span className="text-muted-foreground font-sans">ID:</span>
              {driver.display_id}
            </span>
            <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
            <span className="flex items-center gap-1.5 shrink-0 font-mono text-foreground">
              <IdCard className="w-3 h-3 text-muted-foreground" />
              {driver.profiles?.license_number || "No License"}
            </span>
            <div className="w-1 h-1 rounded-full bg-border hidden sm:block" />
            <span className="flex items-center gap-1.5 shrink-0 font-mono text-foreground">
              <Phone className="w-3 h-3 text-muted-foreground" />
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
            className="flex-1 lg:flex-none h-8 text-[9px] sm:text-[10px] uppercase tracking-widest font-bold shadow-none rounded-lg border-border text-foreground hover:bg-secondary transition-colors"
          >
            <Send className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />{" "}
            Message
          </Button>
          <div className="h-4 w-px bg-border mx-1 hidden sm:block transition-colors" />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground shrink-0 hidden sm:flex transition-colors"
            onClick={onOpenEdit}
          >
            <Edit2 className="w-3.5 h-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
