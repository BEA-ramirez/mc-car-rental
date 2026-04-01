"use client";

import { useState } from "react";
import { Car, Search, MapPin } from "lucide-react";
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
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 font-sans selection:bg-blue-900 pb-24">
      {/* --- Premium Header --- */}
      <div className="relative pt-20 pb-24 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0A0C10] to-[#0A0C10] -z-10" />
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-12 bg-blue-500/50" />
            <span className="text-blue-400 text-[9px] font-medium uppercase tracking-[0.4em]">
              Member Dashboard
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-light text-white tracking-tighter leading-none mb-6">
            My <span className="italic font-normal text-white/50">Trips.</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-lg font-light leading-relaxed">
            Track your reservations, manage payments, and view your rental
            history with MC Ormoc.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 -mt-10 relative z-10">
        {/* --- Filters & Search Bar --- */}
        <div className="bg-white/[0.03] backdrop-blur-2xl rounded-sm p-3 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 mb-12 shadow-2xl">
          <div className="flex w-full md:w-auto overflow-x-auto custom-scrollbar p-1 gap-2">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-6 py-2 rounded-sm text-[10px] font-medium uppercase tracking-[0.2em] transition-all duration-300",
                  activeTab === tab
                    ? "bg-white text-[#0A0C10] shadow-xl"
                    : "text-white/40 hover:text-white hover:bg-white/5",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
            <Input
              placeholder="SEARCH BOOKING ID..."
              className="pl-11 h-11 rounded-none bg-white/5 border-white/10 text-[10px] uppercase tracking-widest text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500 w-full"
            />
          </div>
        </div>

        {/* --- The Booking List --- */}
        <div className="space-y-8">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-12 h-12 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
              <span className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                Authenticating Reservations...
              </span>
            </div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking: any) => (
              <BookingCard key={booking.original_id} booking={booking} />
            ))
          ) : (
            <div className="bg-white/[0.02] rounded-sm border border-white/5 p-20 flex flex-col items-center justify-center text-center">
              <PremiumLogo />
              <h3 className="text-xl font-light text-white mb-2 mt-6">
                No trips found
              </h3>
              <p className="text-xs text-white/30 uppercase tracking-widest max-w-sm">
                You don't have any reservations under the "{activeTab}"
                category.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- Helper Logo for Empty State ---
const PremiumLogo = () => (
  <div className="relative w-10 h-10 flex items-center justify-center opacity-20">
    <div className="absolute w-full h-full border border-white rounded-sm transform rotate-45" />
    <div className="absolute w-full h-full border border-blue-500 rounded-sm transform -rotate-45" />
  </div>
);
