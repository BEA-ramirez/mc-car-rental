"use client";

import { useState } from "react";
import { Car, Search, MapPin, Inbox } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

import BookingCard from "@/components/customer/booking-card";
import { useCustomerBookings } from "../../../../hooks/use-bookings";

const TABS = ["All Trips", "Action Needed", "Upcoming", "Past History"];

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState("All Trips");
  const { data: dbBookings, isLoading } = useCustomerBookings();

  const formattedBookings = (dbBookings || []).map((b: any) => {
    const balance = b.totalAmount - b.amountPaid;

    let displayStatus = "Pending Approval";
    if (b.status === "confirmed" && balance > 0)
      displayStatus = "Awaiting Payment";
    if (b.status === "confirmed" && balance <= 0) displayStatus = "Confirmed";
    if (b.status === "ongoing") displayStatus = "Ongoing";
    if (b.status === "completed") displayStatus = "Completed";

    return {
      ...b,
      startDate: new Date(b.startDate),
      endDate: new Date(b.endDate),
      status: displayStatus,
    };
  });

  const filteredBookings = formattedBookings.filter((booking: any) => {
    if (activeTab === "All Trips") return true;
    if (activeTab === "Action Needed")
      return booking.status === "Awaiting Payment";
    if (activeTab === "Upcoming")
      return (
        booking.status === "Confirmed" || booking.status === "Pending Approval"
      );
    if (activeTab === "Past History") return booking.status === "Completed";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#050B10] text-white font-sans selection:bg-[#64c5c3] selection:text-black pb-24">
      {/* --- Hero Header Section --- */}
      <div className="relative pt-32 pb-16 md:pb-20 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#64c5c3]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="max-w-6xl mx-auto w-full relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#64c5c3] font-bold tracking-widest text-xs md:text-sm mb-2 md:mb-3 uppercase flex items-center gap-2">
              <span className="w-6 md:w-8 h-[2px] bg-[#64c5c3]"></span>{" "}
              Dashboard
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9] mb-4 md:mb-6">
              Your <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">
                Bookings
              </span>
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm md:text-base max-w-sm font-medium leading-relaxed">
              Track your reservations, manage your payments, and review your
              rental history all in one place.
            </p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-8 relative z-10">
        {/* --- Filters & Search Bar (Ultra Compact for Mobile) --- */}
        <div className="bg-[#0a1118]/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-3 md:p-4 border border-white/5 flex flex-col lg:flex-row items-center justify-between gap-3 md:gap-4 mb-6 md:mb-10 shadow-2xl">
          {/* Scrollable Tabs for Mobile */}
          <div className="flex w-full lg:w-auto overflow-x-auto custom-scrollbar pb-1 lg:pb-0 gap-1.5 md:gap-2 snap-x">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "shrink-0 px-4 md:px-6 py-2 md:py-3 rounded-full text-[9px] md:text-xs font-bold uppercase tracking-widest transition-all duration-300 snap-start",
                  activeTab === tab
                    ? "bg-[#64c5c3] text-black shadow-[0_0_15px_rgba(100,197,195,0.3)]"
                    : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 border border-white/5",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-3.5 md:w-4 h-3.5 md:h-4 text-gray-500" />
            <Input
              placeholder="Search ID..."
              className="pl-10 md:pl-12 h-10 md:h-12 rounded-xl bg-black/50 border-white/10 text-[10px] md:text-xs font-bold uppercase tracking-widest text-white placeholder:text-gray-500 focus-visible:ring-[#64c5c3] focus-visible:border-transparent w-full transition-all"
            />
          </div>
        </div>

        {/* --- The Booking List --- */}
        <div className="space-y-4 md:space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 md:py-24 gap-4 md:gap-6">
              <div className="w-10 h-10 md:w-12 md:h-12 border-4 border-white/10 border-t-[#64c5c3] rounded-full animate-spin" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500">
                Loading Fleet Data...
              </span>
            </div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking: any) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                key={booking.original_id}
              >
                <BookingCard booking={booking} />
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0a1118] rounded-2xl md:rounded-3xl border border-white/5 p-10 md:p-16 flex flex-col items-center justify-center text-center shadow-lg"
            >
              <div className="w-16 h-16 md:w-20 md:h-20 bg-white/5 rounded-full flex items-center justify-center mb-4 md:mb-6">
                <Inbox className="w-6 h-6 md:w-8 md:h-8 text-gray-500" />
              </div>
              <h3 className="text-xl md:text-2xl font-black uppercase text-white mb-2">
                No Trips Found
              </h3>
              <p className="text-xs md:text-sm text-gray-400 font-medium max-w-sm">
                You don't have any reservations under the "{activeTab}"
                category. Time to find your next drive.
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
