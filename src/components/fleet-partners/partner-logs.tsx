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

// Helper to pick the right icon/color based on the action type
function getLogStyling(actionType: string) {
  const type = actionType?.toUpperCase() || "";

  if (type.includes("CREATE") || type.includes("ADD")) {
    return {
      icon: PlusCircle,
      colorClass: "text-emerald-600 bg-emerald-50 border-emerald-100",
    };
  }
  if (type.includes("UPDATE") || type.includes("EDIT")) {
    return {
      icon: Edit3,
      colorClass: "text-blue-600 bg-blue-50 border-blue-100",
    };
  }
  if (type.includes("DELETE") || type.includes("REMOVE")) {
    return {
      icon: Trash2,
      colorClass: "text-red-600 bg-red-50 border-red-100",
    };
  }
  if (type.includes("AUTH") || type.includes("VERIFY")) {
    return {
      icon: ShieldAlert,
      colorClass: "text-amber-600 bg-amber-50 border-amber-100",
    };
  }

  // Default generic action
  return {
    icon: Activity,
    colorClass: "text-slate-600 bg-slate-100 border-slate-200",
  };
}

export default function PartnerLogs({ selectedPartner }: PartnerLogsProps) {
  const { data: logs, isLoading } = usePartnerAuditLogs(
    selectedPartner?.car_owner_id,
  );

  if (!selectedPartner) return null;

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 px-1 shrink-0">
        <div>
          <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
            System Audit Trail
          </h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Latest 100 Account Activities
          </p>
        </div>
      </div>

      {/* Scrollable Timeline Area */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar px-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Fetching Security Logs...
            </span>
          </div>
        ) : !logs || logs.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-sm border border-dashed border-slate-200 z-10">
            <History className="w-6 h-6 text-slate-300 mb-3 opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              No Activity Recorded
            </span>
          </div>
        ) : (
          <div className="flex flex-col relative pb-6 pl-4">
            {/* The vertical timeline line */}
            <div className="absolute left-[27px] top-4 bottom-6 w-px bg-slate-200" />

            {logs.map((log: any, index: number) => {
              const { icon: Icon, colorClass } = getLogStyling(log.action_type);
              const isLast = index === logs.length - 1;

              return (
                <div
                  key={log.log_id}
                  className={cn(
                    "relative flex items-start gap-5",
                    !isLast && "mb-6",
                  )}
                >
                  {/* Timeline Dot/Icon */}
                  <div
                    className={cn(
                      "w-7 h-7 rounded-full flex items-center justify-center border z-10 shrink-0",
                      colorClass,
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>

                  {/* Log Content Card */}
                  <div className="flex-1 bg-white border border-slate-200 rounded-sm p-3 shadow-sm hover:border-slate-300 hover:shadow-md transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-[#0F172A] uppercase tracking-widest px-1.5 py-0.5 bg-slate-100 rounded-sm">
                          {log.action_type.replace(/_/g, " ")}
                        </span>
                        {log.entity_type && (
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                            Target: {log.entity_type.replace(/_/g, " ")}
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-slate-400 font-mono tracking-wide whitespace-nowrap">
                        {format(
                          new Date(log.created_at),
                          "MMM dd, yyyy • HH:mm",
                        )}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      {log.description}
                    </p>

                    <div className="mt-2 pt-2 border-t border-slate-50 flex justify-end">
                      <span className="text-[8px] text-slate-300 font-mono uppercase tracking-widest">
                        Log ID: {log.log_id.split("-")[0]}
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
