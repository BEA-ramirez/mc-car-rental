"use client";

import React, { useState } from "react";
import {
  Bell,
  CheckCheck,
  AlertCircle,
  ShieldAlert,
  CheckCircle2,
  Car,
  ArrowRight,
  Loader2,
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
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "../../../hooks/use-notifications";

// --- TYPES ---
type Severity = "critical" | "warning" | "success" | "info";
type Category = "inbox" | "system";

const getSeverityConfig = (severity: Severity) => {
  switch (severity) {
    case "critical":
      return {
        icon: AlertCircle,
        color: "text-destructive",
        bg: "bg-destructive/10",
        border: "border-destructive/20",
      };
    case "warning":
      return {
        icon: ShieldAlert,
        color: "text-amber-600 dark:text-amber-400",
        bg: "bg-amber-500/10",
        border: "border-amber-500/20",
      };
    case "success":
      return {
        icon: CheckCircle2,
        color: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/20",
      };
    case "info":
      return {
        icon: Car,
        color: "text-blue-600 dark:text-blue-400",
        bg: "bg-blue-500/10",
        border: "border-blue-500/20",
      };
  }
};

export default function NotificationsPopover() {
  const [activeTab, setActiveTab] = useState<string>("inbox");
  const [isOpen, setIsOpen] = useState(false);

  const {
    data: dbNotifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    isMarking,
  } = useNotifications();

  const notifications = (dbNotifications || []).map((n: any) => {
    let severity: Severity = "info";
    let category: Category = "system";

    const t = (n.type || "").toUpperCase();

    if (
      t === "ALERT" ||
      t.includes("CRITICAL") ||
      t.includes("OVERDUE") ||
      t.includes("ERROR")
    ) {
      severity = "critical";
      category = "inbox"; // Action required
    } else if (
      t === "BOOKING_UPDATED" ||
      t.includes("WARN") ||
      t.includes("PENDING") ||
      t.includes("DUE")
    ) {
      severity = "warning";
      category = "inbox"; // Action required
    } else if (
      t === "PAYMENT" ||
      t.includes("SUCCESS") ||
      t.includes("COMPLETED")
    ) {
      severity = "success";
      category = "system"; // Financials go to system log
    } else if (
      t === "BOOKING_CREATED" ||
      t.includes("INBOX") ||
      t.includes("MESSAGE")
    ) {
      severity = "info";
      category = "inbox"; // New bookings pop into inbox
    } else {
      // "SYSTEM" or fallback
      severity = "info";
      category = "system";
    }

    return {
      id: n.notification_id,
      category,
      severity,
      title: n.title,
      message: n.message,
      // Use date-fns to get "5m ago", "2h ago", etc.
      time: formatDistanceToNow(new Date(n.created_at), { addSuffix: true }),
      isUnread: !n.is_read,
      actionUrl: n.action_url,
    };
  });

  const unreadCount = notifications.filter((n) => n.isUnread).length;
  const inboxCount = notifications.filter((n) => n.category === "inbox").length;
  const systemCount = notifications.filter(
    (n) => n.category === "system",
  ).length;

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleNotificationClick = (notifId: string, isUnread: boolean) => {
    // Only fire the mutation if it's actually unread to save DB calls
    if (isUnread) {
      markAsRead(notifId);
    }
  };

  const currentList = notifications.filter((n) => n.category === activeTab);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      {/* TRIGGER */}
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary relative cursor-pointer transition-colors"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-2 w-1.5 h-1.5 bg-destructive rounded-full ring-2 ring-background" />
          )}
        </Button>
      </PopoverTrigger>

      {/* POPOVER CONTENT */}
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[380px] p-0 flex flex-col bg-popover border-border rounded-xl shadow-2xl font-sans overflow-hidden transition-colors"
      >
        {/* HEADER */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-secondary/30 transition-colors">
          <div className="flex items-center gap-2">
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest leading-none">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <span className="bg-destructive/10 text-destructive border border-destructive/20 text-[8px] font-bold px-1.5 py-0.5 rounded-md leading-none tracking-widest">
                {unreadCount} NEW
              </span>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMarkAllRead}
            disabled={isMarking || unreadCount === 0}
            className="h-6 px-2 text-[9px] font-bold text-muted-foreground hover:bg-secondary hover:text-foreground uppercase tracking-widest rounded-lg transition-colors"
          >
            {isMarking ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <CheckCheck className="w-3 h-3 mr-1" />
            )}
            Mark Read
          </Button>
        </div>

        {/* TABS */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full flex flex-col"
        >
          <div className="px-3 pt-3 pb-2 border-b border-border">
            <TabsList className="h-8 bg-secondary/50 p-1 rounded-lg border border-border/50 flex w-full shadow-inner transition-colors">
              <TabsTrigger
                value="inbox"
                className="flex-1 h-6 text-[9px] font-bold rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground uppercase tracking-widest transition-all"
              >
                Inbox ({inboxCount})
              </TabsTrigger>
              <TabsTrigger
                value="system"
                className="flex-1 h-6 text-[9px] font-bold rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground uppercase tracking-widest transition-all"
              >
                System Log ({systemCount})
              </TabsTrigger>
            </TabsList>
          </div>

          {/* LIST AREA */}
          <div className="max-h-[380px] overflow-y-auto custom-scrollbar bg-background transition-colors">
            {isLoading ? (
              <div className="px-4 py-10 flex justify-center">
                <Loader2 className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            ) : currentList.length === 0 ? (
              <div className="px-4 py-10 text-center flex flex-col items-center">
                <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5 text-muted-foreground/50" />
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  You're all caught up!
                </span>
              </div>
            ) : (
              <div className="flex flex-col divide-y divide-border">
                {currentList.map((notif) => {
                  const config = getSeverityConfig(notif.severity);
                  const Icon = config.icon;

                  return (
                    <div
                      key={notif.id}
                      onClick={() =>
                        handleNotificationClick(notif.id, notif.isUnread)
                      }
                      className={cn(
                        "p-3.5 flex gap-3 relative transition-colors hover:bg-secondary/50 cursor-pointer",
                        notif.isUnread ? "bg-primary/5" : "bg-transparent",
                      )}
                    >
                      {/* Unread indicator bar */}
                      {notif.isUnread && (
                        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary" />
                      )}

                      {/* Left: Icon */}
                      <div
                        className={cn(
                          "w-7 h-7 rounded-lg flex items-center justify-center shrink-0 border transition-colors mt-0.5",
                          config.bg,
                          config.border,
                        )}
                      >
                        <Icon className={cn("w-3.5 h-3.5", config.color)} />
                      </div>

                      {/* Right: Content */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-[10px] font-bold text-foreground uppercase tracking-wider leading-tight">
                            {notif.title}
                          </h4>
                          <span className="text-[8px] font-bold font-mono text-muted-foreground uppercase tracking-widest shrink-0 mt-0.5">
                            {notif.time}
                          </span>
                        </div>

                        <p className="text-[11px] font-medium text-foreground/80 leading-snug">
                          {notif.message}
                        </p>

                        {/* INLINE ACTION URL */}
                        {notif.actionUrl && (
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            <Button
                              asChild
                              variant="default"
                              size="sm"
                              className="h-6 px-3 text-[9px] font-bold uppercase tracking-widest rounded-md shadow-none transition-colors bg-primary text-primary-foreground hover:opacity-90"
                            >
                              <Link
                                href={notif.actionUrl}
                                onClick={() => setIsOpen(false)} // Close popover when navigating
                              >
                                View Details
                              </Link>
                            </Button>
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
        <div className="p-2 border-t border-border bg-secondary/30 flex justify-center transition-colors">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full h-7 text-[9px] font-bold text-muted-foreground hover:text-primary hover:bg-secondary uppercase tracking-widest rounded-lg transition-colors"
          >
            <Link
              href="/admin/activity-log"
              className="flex items-center justify-center"
              onClick={() => setIsOpen(false)}
            >
              View All History <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
