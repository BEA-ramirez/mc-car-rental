"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  User,
  CalendarDays,
  Bell,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  CheckCheck,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import LogoutDialog from "@/components/auth/logout-dialog";
import { useNotifications } from "../../../hooks/use-notifications"; // Adjust path if needed

export default function CustomerNavbar() {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // --- FETCH REAL NOTIFICATIONS ---
  const {
    data: notifications = [],
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#050B10]/50 backdrop-blur-lg border-b border-white/5 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/mc-ormoc-logo.png"
              alt="Company Logo"
              width={48}
              height={48}
              priority
              className="object-contain sm:w-[60px] sm:h-[60px]"
            />
            <Link
              href="/"
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-base sm:text-2xl font-black tracking-tighter text-white group-hover:text-[#64c5c3] transition-colors duration-300">
                MC ORMOC
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#64c5c3] rounded-full shadow-[0_0_8px_rgba(100,197,195,0.8)]" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={12}
                // Notice the "!" before the width classes. This forces it to override shadcn's default w-72.
                className="!w-[280px] sm:!w-96 p-0 rounded-2xl border-white/10 bg-[#0a1118]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-[100]"
              >
                {/* Header - Very tight mobile padding (p-2.5) */}
                <div className="bg-white/5 border-b border-white/5 p-2.5 sm:p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <h3 className="text-[13px] font-semibold text-white sm:text-sm sm:font-bold sm:uppercase sm:tracking-wider">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-[9px] sm:text-[10px] font-bold text-black bg-[#64c5c3] px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-[9px] font-medium text-gray-400 hover:text-[#64c5c3] sm:text-[10px] sm:font-bold sm:uppercase sm:tracking-widest transition-colors flex items-center gap-1.5"
                    >
                      <CheckCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      <span>Mark All Read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-[60vh] sm:max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    <div className="flex flex-col">
                      {notifications.map((notif: any) => (
                        <div
                          key={notif.notification_id}
                          onClick={() => {
                            if (!notif.is_read)
                              markAsRead(notif.notification_id);
                          }}
                          className={cn(
                            // Tighter item padding and gap on mobile
                            "p-3 sm:p-5 border-b border-white/5 flex gap-2.5 sm:gap-4 hover:bg-white/5 transition-colors cursor-pointer",
                            !notif.is_read
                              ? "bg-[#64c5c3]/10"
                              : "bg-transparent",
                          )}
                        >
                          <div className="shrink-0 mt-0.5">
                            {notif.type === "booking" ||
                            notif.type === "payment" ? (
                              <CheckCircle2
                                className={cn(
                                  "w-3.5 h-3.5 sm:w-5 sm:h-5", // Extra small icon for mobile
                                  !notif.is_read
                                    ? "text-[#64c5c3]"
                                    : "text-gray-500",
                                )}
                              />
                            ) : (
                              <ShieldCheck
                                className={cn(
                                  "w-3.5 h-3.5 sm:w-5 sm:h-5", // Extra small icon for mobile
                                  !notif.is_read
                                    ? "text-blue-400"
                                    : "text-gray-500",
                                )}
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex justify-between items-start mb-0.5 sm:mb-1">
                              <h4
                                className={cn(
                                  "text-[12px] sm:text-sm sm:tracking-wide",
                                  !notif.is_read
                                    ? "font-semibold sm:font-bold text-white"
                                    : "font-medium text-gray-300",
                                )}
                              >
                                {notif.title}
                              </h4>
                            </div>
                            <p className="text-[10px] sm:text-xs text-gray-400 leading-snug sm:leading-relaxed mb-1.5 sm:mb-2">
                              {notif.message}
                            </p>
                            <span className="text-[8px] font-medium text-[#64c5c3]/60 sm:text-[10px] sm:font-bold sm:uppercase sm:tracking-widest">
                              {formatDistanceToNow(new Date(notif.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 sm:p-8 text-center text-[10px] font-medium text-white/40 sm:text-xs sm:font-bold sm:uppercase sm:tracking-widest flex flex-col items-center">
                      <Bell className="w-5 h-5 sm:w-8 sm:h-8 mb-2 sm:mb-3 opacity-20" />
                      No new notifications
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Link href="/customer/my-bookings">
              <Button
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 px-3 sm:px-4 text-sm sm:text-xs font-medium sm:font-bold sm:uppercase sm:tracking-widest transition-all duration-300"
              >
                <CalendarDays className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Bookings</span>
              </Button>
            </Link>

            <Link href="/customer/profile">
              <Button
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 px-3 sm:px-4 text-sm sm:text-xs font-medium sm:font-bold sm:uppercase sm:tracking-widest transition-all duration-300"
              >
                <User className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>

            <Button
              onClick={() => setIsLogoutModalOpen(true)}
              variant="ghost"
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 px-3 sm:px-4 text-sm sm:text-xs font-medium sm:font-bold sm:uppercase sm:tracking-widest transition-all duration-300"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Place the modal here so it is available on every page */}
      <LogoutDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </>
  );
}
