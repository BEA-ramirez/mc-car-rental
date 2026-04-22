"use client";

import React from "react";
import { format } from "date-fns";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import {
  Loader2,
  History,
  Activity,
  Edit3,
  Trash2,
  PlusCircle,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePartnerAuditLogs } from "../../../hooks/use-fleetPartners";

interface PartnerLogsProps {
  selectedPartner: FleetPartnerType | null;
}

function getLogStyling(actionType: string) {
  const type = actionType?.toUpperCase() || "";

  if (type.includes("CREATE") || type.includes("ADD")) {
    return {
      icon: PlusCircle,
      colorClass:
        "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    };
  }
  if (type.includes("UPDATE") || type.includes("EDIT")) {
    return {
      icon: Edit3,
      colorClass:
        "text-blue-600 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
    };
  }
  if (type.includes("DELETE") || type.includes("REMOVE")) {
    return {
      icon: Trash2,
      colorClass: "text-destructive bg-destructive/10 border-destructive/20",
    };
  }
  if (type.includes("AUTH") || type.includes("VERIFY")) {
    return {
      icon: ShieldAlert,
      colorClass:
        "text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
    };
  }

  return {
    icon: Activity,
    colorClass: "text-muted-foreground bg-secondary border-border",
  };
}

export default function PartnerLogs({ selectedPartner }: PartnerLogsProps) {
  const { data: logs, isLoading } = usePartnerAuditLogs(
    selectedPartner?.car_owner_id,
  );

  if (!selectedPartner) return null;

  return (
    <div className="flex flex-col h-full w-full bg-transparent transition-colors duration-300">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 shrink-0 border-b border-border pb-2.5 transition-colors">
        <div>
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-none">
            System Audit Trail
          </h3>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5">
            Latest 100 Account Activities
          </p>
        </div>
      </div>

      {/* Scrollable Timeline Area */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 transition-colors">
            <Loader2 className="w-5 h-5 animate-spin text-primary mb-2" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Fetching Security Logs...
            </span>
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/30 rounded-xl border border-dashed border-border z-10 transition-colors">
            <History className="w-6 h-6 text-muted-foreground/30 mb-2 opacity-80" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              No Activity Recorded
            </span>
          </div>
        ) : (
          <div className="flex flex-col relative pb-4 pl-3.5">
            {/* The vertical timeline line */}
            <div className="absolute left-[25.5px] top-4 bottom-4 w-px bg-border transition-colors" />

            {logs.map((log: any, index: number) => {
              const { icon: Icon, colorClass } = getLogStyling(log.action_type);
              const isLast = index === logs.length - 1;

              return (
                <div
                  key={log.log_id}
                  className={cn(
                    "relative flex items-start gap-4",
                    !isLast && "mb-5",
                  )}
                >
                  {/* Timeline Dot/Icon */}
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center border z-10 shrink-0 shadow-sm transition-colors",
                      colorClass,
                    )}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  {/* Log Content Card */}
                  <div className="flex-1 bg-card border border-border rounded-xl p-2.5 shadow-sm hover:border-primary/30 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black text-foreground uppercase tracking-wider px-1.5 py-0.5 bg-secondary rounded border border-border">
                          {log.action_type.replace(/_/g, " ")}
                        </span>
                        {log.entity_type && (
                          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest font-mono">
                            [{log.entity_type.replace(/_/g, " ")}]
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-muted-foreground font-mono font-bold tracking-tight uppercase">
                        {format(new Date(log.created_at), "MMM dd • HH:mm")}
                      </span>
                    </div>

                    <p className="text-[11px] text-foreground/80 leading-relaxed font-medium">
                      {log.description}
                    </p>

                    <div className="mt-1.5 pt-1.5 border-t border-border/50 flex justify-end">
                      <span className="text-[8px] text-muted-foreground/50 font-mono uppercase tracking-widest">
                        LOG_{log.log_id.split("-")[0].toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
