"use client";

import React from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  Calendar,
  Clock,
  Car,
  Scissors,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
// If you don't have this, just ensure your SchedulerEvent type includes `group_id?: string;`
import { SchedulerEvent } from "@/components/scheduler/timeline-scheduler";
import { cn } from "@/lib/utils";

type PendingRequestsSidebarProps = {
  requests: SchedulerEvent[];
  selectedId: string | null;
  onSelect: (request: SchedulerEvent) => void;
  onApprove: (request: SchedulerEvent) => void;
  onReject: (request: SchedulerEvent) => void;
};

export default function PendingRequestsSidebar({
  requests,
  selectedId,
  onSelect,
  onApprove,
  onReject,
}: PendingRequestsSidebarProps) {
  return (
    <div className="flex flex-col h-full bg-slate-50/50 border-l border-slate-200 w-full">
      {/* --- COMPACT FORMAL HEADER --- */}
      <div className="h-9 px-4 border-b bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
        <h2 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
          Pending Queue
        </h2>
        <Badge
          variant="secondary"
          className="bg-amber-100 text-amber-800 border border-amber-200 h-5 px-1.5 text-[10px] font-bold"
        >
          {requests.length} New
        </Badge>
      </div>

      {/* --- SCROLLABLE LIST --- */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-8 h-8 text-slate-300 mb-3" />
              <div className="text-xs font-semibold text-slate-500">
                Inbox Zero
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                No pending requests at this time.
              </div>
            </div>
          ) : (
            requests.map((req) => {
              const isSelected = selectedId === req.id;

              // NEW LOGIC: Determine if this is a split booking
              // A booking is a split child if it has a group_id that is DIFFERENT from its own id.
              // Note: Make sure 'group_id' exists on your SchedulerEvent type in timeline-scheduler.tsx!
              const isSplit = req.group_id && req.group_id !== req.id;

              return (
                <div
                  key={req.id}
                  onClick={() => onSelect(req)}
                  className={cn(
                    "group relative border rounded-md p-3 text-sm cursor-pointer transition-all overflow-hidden",
                    isSelected
                      ? "bg-blue-50/50 border-blue-200 shadow-sm"
                      : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm",
                  )}
                >
                  {/* Left Accent Bar for Selection */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 transition-all",
                      isSelected
                        ? "bg-blue-500"
                        : "bg-transparent group-hover:bg-slate-200",
                      isSplit && isSelected && "bg-indigo-500", // Purple accent for splits
                    )}
                  />

                  {/* Header: Title & Price/Badge */}
                  <div className="flex justify-between items-start mb-2.5 pl-1.5">
                    <div className="font-bold text-slate-800 text-sm leading-tight pr-2">
                      {req.title}
                    </div>
                    {isSplit ? (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold text-indigo-700 bg-indigo-50 border-indigo-200 h-5 px-1.5 rounded-sm shrink-0 uppercase tracking-widest flex items-center gap-1"
                      >
                        <Scissors className="w-3 h-3 -rotate-90" /> Split
                      </Badge>
                    ) : (
                      <div className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded-sm border border-slate-200 shrink-0">
                        {req.amount ? `₱${req.amount.toLocaleString()}` : "N/A"}
                      </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 gap-1.5 pl-1.5 text-[11px] text-slate-600">
                    <div className="flex items-center gap-2">
                      <Car className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span
                        className={cn(
                          "font-medium truncate",
                          !req.subtitle && "text-slate-400 italic",
                        )}
                      >
                        {req.subtitle || "No unit assigned"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {format(new Date(req.start), "MMM d")} -{" "}
                        {format(new Date(req.end), "MMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>
                        {format(new Date(req.start), "h:mm a")} -{" "}
                        {format(new Date(req.end), "h:mm a")}
                      </span>
                    </div>
                  </div>

                  {/* NEW: Contextual Info for Splits */}
                  {isSplit && (
                    <div className="mt-2.5 pl-1.5">
                      <div className="bg-indigo-50/50 border border-indigo-100 rounded text-[9px] p-1.5 text-indigo-800 font-medium">
                        This is the second half of a split booking. Drag to a
                        new vehicle to reschedule.
                      </div>
                    </div>
                  )}

                  {/* Action Buttons (Visible when selected) */}
                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-200 flex gap-2 pl-1.5 animate-in fade-in slide-in-from-top-1">
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-sm shadow-sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprove(req);
                        }}
                      >
                        <CheckCircle className="w-3 h-3 mr-1.5" /> Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 text-[10px] font-bold border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 rounded-sm shadow-sm bg-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          onReject(req);
                        }}
                      >
                        <XCircle className="w-3 h-3 mr-1.5" /> Reject
                      </Button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
