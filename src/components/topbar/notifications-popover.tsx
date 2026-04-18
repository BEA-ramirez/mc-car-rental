"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Car,
  Phone,
  Check,
  FileCheck2,
  ArrowRight,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// --- MOCK DATA ---
type Severity = "critical" | "warning" | "success" | "info";
type Category = "inbox" | "system";

interface Notification {
  id: string;
  category: Category;
  severity: Severity;
  title: string;
  message: string;
  details?: string;
  time: string;
  isUnread: boolean;
  actions?: { label: string; icon?: React.ElementType; primary?: boolean }[];
}

const mockNotifications: Notification[] = [
  {
    id: "n1",
    category: "inbox",
    severity: "critical",
    title: "Overdue Return",
    message: "Toyota Fortuner [ABC-1234] is 2 hours late.",
    details: "Customer: Ricardo D. (0917-123-4567)",
    time: "10m ago",
    isUnread: true,
    actions: [
      { label: "Call Customer", icon: Phone, primary: true },
      { label: "Alert Garage" },
    ],
  },
  {
    id: "n2",
    category: "inbox",
    severity: "warning",
    title: "Pending Approval",
    message: "Booking BKG-102 uploaded License/ID.",
    time: "15m ago",
    isUnread: true,
    actions: [
      { label: "Review ID", icon: FileCheck2 },
      { label: "Quick Approve", icon: Check, primary: true },
    ],
  },
  {
    id: "n3",
    category: "system",
    severity: "success",
    title: "Payment Cleared",
    message: "₱12,000 received via GCash for BKG-098.",
    time: "2h ago",
    isUnread: true,
  },
  {
    id: "n4",
    category: "system",
    severity: "info",
    title: "Dispatch Assigned",
    message: "Driver Juan L. assigned to BKG-105.",
    time: "3h ago",
    isUnread: false,
  },
  {
    id: "n5",
    category: "inbox",
    severity: "warning",
    title: "Maintenance Due",
    message: "Nissan Urvan [XYZ-987] hit 10,000km limit.",
    time: "5h ago",
    isUnread: false,
    actions: [{ label: "Schedule PMS", primary: true }],
  },
];

const getSeverityConfig = (severity: Severity) => {
  switch (severity) {
    case "critical":
      return {
        icon: AlertCircle,
        color: "text-red-600",
        bg: "bg-red-100",
        border: "border-red-200",
      };
    case "warning":
      return {
        icon: ShieldAlert,
        color: "text-amber-600",
        bg: "bg-amber-100",
        border: "border-amber-200",
      };
    case "success":
      return {
        icon: CheckCircle2,
        color: "text-emerald-600",
        bg: "bg-emerald-100",
        border: "border-emerald-200",
      };
    case "info":
      return {
        icon: Car,
        color: "text-blue-600",
        bg: "bg-blue-100",
        border: "border-blue-200",
      };
  }
};

export default function NotificationsPopover() {
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => n.isUnread).length;
  const inboxCount = notifications.filter((n) => n.category === "inbox").length;
  const systemCount = notifications.filter(
    (n) => n.category === "system",
  ).length;

  const handleMarkAllRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isUnread: false })));
  };

  const currentList = notifications.filter((n) => n.category === activeTab);

  return (
    <Popover>
      {/* TRIGGER: This replaces the raw Button in your Layout */}
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-sm text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 relative cursor-pointer"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 bg-red-500 rounded-full ring-2 ring-slate-50" />
          )}
        </Button>
      </PopoverTrigger>

      {/* POPOVER CONTENT */}
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 flex flex-col bg-white border-slate-200 rounded-sm shadow-lg font-sans overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-700 text-[9px] font-bold px-1.5 py-0.5 rounded-sm leading-none">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            className="h-6 px-2 text-[9px] font-bold text-slate-500 hover:text-slate-900 uppercase tracking-widest rounded-sm"
          >
            <CheckCheck className="w-3 h-3 mr-1" /> Mark Read
          </Button>
        </div>

        {/* TABS */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex flex-col"
        >
          <div className="px-4 pt-3 pb-1 border-b border-slate-100">
            <TabsList className="h-8 bg-slate-100 p-0.5 rounded-sm border border-slate-200 flex w-full">
              <TabsTrigger
                value="inbox"
                className="flex-1 h-6 text-[10px] font-bold rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
              >
                Inbox ({inboxCount})
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="flex-1 h-6 text-[10px] font-bold rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 uppercase tracking-widest transition-all"
              >
                System Log ({systemCount})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* LIST AREA */}
          <div className="max-h-[360px] overflow-y-auto custom-scrollbar bg-slate-50/30">
            {currentList.length === 0 ? (
              <div className="px-4 py-8 text-center flex flex-col items-center">
                <CheckCircle2 className="w-8 h-8 text-slate-300 mb-2" />
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  You&apos;re all caught up!
                </span>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-slate-100">
                {currentList.map((notif) => {
                  const config = getSeverityConfig(notif.severity);
                  const Icon = config.icon;

                  return (
                    <div
                      key={notif.id}
                      className={cn(
                        "p-4 flex gap-3 relative transition-colors hover:bg-slate-50",
                        notif.isUnread ? "bg-blue-50/20" : "bg-white",
                      )}
                    >
                      {/* Unread indicator bar */}
                      {notif.isUnread && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-blue-500" />
                      )}

                      {/* Left: Icon */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-sm flex items-center justify-center shrink-0 border mt-0.5",
                          config.bg,
                          config.border,
                        )}
                      >
                        <Icon className={cn("w-3.5 h-3.5", config.color)} />
                      </div>

                      {/* Right: Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider leading-tight">
                            {notif.title}
                          </h4>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest shrink-0">
                            {notif.time}
                          </span>
                        </div>

                        <p className="text-[11px] font-medium text-slate-600 leading-snug">
                          {notif.message}
                        </p>

                        {notif.details && (
                          <p className="text-[10px] text-slate-500 mt-1 pb-1">
                            {notif.details}
                          </p>
                        )}

                        {/* INLINE ACTIONS */}
                        {notif.actions && notif.actions.length > 0 && (
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            {notif.actions.map((action, idx) => (
                              <Button
                                key={idx}
                                variant={action.primary ? "default" : "outline"}
                                size="sm"
                                className={cn(
                                  "h-6 px-2.5 text-[9px] font-bold uppercase tracking-widest rounded-sm shadow-none transition-colors",
                                  action.primary
                                    ? "bg-slate-900 text-white hover:bg-slate-800"
                                    : "bg-white border-slate-200 text-slate-600 hover:text-slate-900",
                                )}
                              >
                                {action.icon && (
                                  <action.icon className="w-3 h-3 mr-1.5" />
                                )}
                                {action.label}
                              </Button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Tabs>

        {/* FOOTER */}
        <div className="p-2 border-t border-slate-100 bg-slate-50/50 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-7 text-[9px] font-bold text-slate-500 hover:text-blue-600 uppercase tracking-widest rounded-sm"
          >
            <Link href="/admin/activity-log">
              View All History <ArrowRight className="w-3 h-3 ml-1" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
