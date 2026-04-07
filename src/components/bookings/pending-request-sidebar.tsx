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
    <div className="flex flex-col h-full bg-secondary/10 border-l border-border w-full transition-colors duration-300">
      {/* --- COMPACT FORMAL HEADER --- */}
      <div className="h-10 px-3 border-b border-border bg-card flex items-center justify-between shrink-0 shadow-sm z-10 transition-colors">
        <h2 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
          Pending Queue
        </h2>
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 h-5 px-1.5 text-[9px] font-bold"
        >
          {requests.length} New
        </Badge>
      </div>

      {/* --- SCROLLABLE LIST --- */}
      <ScrollArea className="flex-1 p-2 custom-scrollbar">
        <div className="space-y-2">
          {requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="w-8 h-8 text-muted-foreground/30 mb-3" />
              <div className="text-[11px] font-bold text-foreground">
                Inbox Zero
              </div>
              <div className="text-[10px] font-medium text-muted-foreground mt-1">
                No pending requests at this time.
              </div>
            </div>
          ) : (
            requests.map((req) => {
              const isSelected = selectedId === req.id;

              // Determine if this is a split booking
              const isSplit = req.group_id && req.group_id !== req.id;

              return (
                <div
                  key={req.id}
                  onClick={() => onSelect(req)}
                  className={cn(
                    "group relative border rounded-xl p-2.5 cursor-pointer transition-all overflow-hidden",
                    isSelected
                      ? "bg-primary/5 border-primary/30 shadow-sm"
                      : "bg-card border-border hover:border-primary/50 hover:shadow-sm",
                  )}
                >
                  {/* Left Accent Bar for Selection */}
                  <div
                    className={cn(
                      "absolute left-0 top-0 bottom-0 w-1 transition-all",
                      isSelected
                        ? isSplit
                          ? "bg-indigo-500"
                          : "bg-primary"
                        : "bg-transparent group-hover:bg-primary/20",
                    )}
                  />

                  {/* Header: Title & Price/Badge */}
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div className="font-bold text-foreground text-[11px] leading-tight pr-2 group-hover:text-primary transition-colors">
                      {req.title}
                    </div>
                    {isSplit ? (
                      <Badge
                        variant="outline"
                        className="text-[8px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-500/10 border-indigo-500/20 h-4 px-1.5 rounded shrink-0 uppercase tracking-widest flex items-center gap-1"
                      >
                        <Scissors className="w-2.5 h-2.5 -rotate-90" /> Split
                      </Badge>
                    ) : (
                      <div className="font-mono text-[9px] font-bold text-foreground bg-secondary px-1.5 py-0.5 rounded border border-border shrink-0">
                        {req.amount ? `₱${req.amount.toLocaleString()}` : "N/A"}
                      </div>
                    )}
                  </div>

                  {/* Details Grid */}
                  <div className="flex flex-col gap-1 pl-2 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Car className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                      <span
                        className={cn(
                          "font-medium truncate",
                          !req.subtitle && "italic opacity-70",
                        )}
                      >
                        {req.subtitle || "No unit assigned"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                      <span className="font-medium">
                        {format(new Date(req.start), "MMM d")} -{" "}
                        {format(new Date(req.end), "MMM d")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground/70 shrink-0" />
                      <span className="font-medium">
                        {format(new Date(req.start), "h:mm a")} -{" "}
                        {format(new Date(req.end), "h:mm a")}
                      </span>
                    </div>
                  </div>

                  {/* Contextual Info for Splits */}
                  {isSplit && (
                    <div className="mt-2 pl-2">
                      <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-md text-[9px] p-1.5 text-indigo-600 dark:text-indigo-400 font-medium leading-tight">
                        This is the second half of a split booking. Drag to a
                        new vehicle to reschedule.
                      </div>
                    </div>
                  )}

                  {/* Action Buttons (Visible when selected) */}
                  {isSelected && (
                    <div className="mt-2.5 pt-2.5 border-t border-border flex gap-2 pl-2 animate-in fade-in slide-in-from-top-1">
                      <Button
                        size="sm"
                        className="flex-1 h-7 text-[9px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-none transition-opacity"
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
                        className="flex-1 h-7 text-[9px] font-bold uppercase tracking-widest text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive/50 rounded-lg shadow-none bg-card transition-colors"
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
