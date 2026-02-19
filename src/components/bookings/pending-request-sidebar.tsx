"use client";

import React from "react";
import { format } from "date-fns";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  User,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <div className="flex flex-col h-full bg-white">
      <CardHeader className="pb-3 border-b bg-slate-50">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          <span>Pending Requests</span>
          <Badge variant="secondary" className="bg-amber-100 text-amber-700">
            {requests.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <ScrollArea className="flex-1 bg-slate-50/50 p-3">
        <div className="space-y-3">
          {requests.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs">
              No pending requests.
            </div>
          ) : (
            requests.map((req) => (
              <div
                key={req.id}
                onClick={() => onSelect(req)}
                className={cn(
                  "bg-white border rounded-lg p-3 text-sm shadow-sm cursor-pointer transition-all hover:shadow-md relative overflow-hidden",
                  selectedId === req.id
                    ? "ring-2 ring-blue-500 border-blue-500 bg-blue-50/30"
                    : "hover:border-blue-300",
                )}
              >
                {selectedId === req.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />
                )}

                {/* Header */}
                <div className="flex justify-between items-start mb-2 pl-2">
                  <div className="font-bold text-slate-800">{req.title}</div>
                  <Badge
                    variant="outline"
                    className="text-[10px] h-5 px-1 bg-slate-50"
                  >
                    {req.amount ? `₱${req.amount.toLocaleString()}` : "N/A"}
                  </Badge>
                </div>

                {/* Details */}
                <div className="space-y-1.5 pl-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <User className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{req.subtitle}</span>{" "}
                    {/* Car Name */}
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {format(req.start, "MMM d")} - {format(req.end, "MMM d")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>
                      {format(req.start, "h:mm a")} -{" "}
                      {format(req.end, "h:mm a")}
                    </span>
                  </div>
                </div>

                {/* Actions (Only visible when selected) */}
                {selectedId === req.id && (
                  <div className="mt-3 pt-3 border-t flex gap-2 animate-in fade-in slide-in-from-top-1 pl-2">
                    <Button
                      size="sm"
                      className="flex-1 h-7 text-xs bg-emerald-600 hover:bg-emerald-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        onApprove(req);
                      }}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 h-7 text-xs border-red-200 text-red-600 hover:bg-red-50"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReject(req);
                      }}
                    >
                      <XCircle className="w-3 h-3 mr-1" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
