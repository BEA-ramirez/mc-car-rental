"use client";

import { useState } from "react";
import { Car, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

import BookingCard from "@/components/customer/booking-card";
import { useCustomerBookings } from "../../../../hooks/use-bookings";

const TABS = ["All Trips", "Action Needed", "Upcoming", "Past History"];

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState("All Trips");

  const { data: dbBookings, isLoading } = useCustomerBookings();

  const formattedBookings = (dbBookings || []).map((b: any) => {
    // Calculate if they still owe money
    const balance = b.totalAmount - b.amountPaid;

    // Map the raw DB status to the exact UI Badges we want
    let displayStatus = "Pending Approval";
    if (b.status === "confirmed" && balance > 0)
      displayStatus = "Awaiting Payment";
    if (b.status === "confirmed" && balance <= 0) displayStatus = "Confirmed";
    if (b.status === "ongoing") displayStatus = "Ongoing";
    if (b.status === "completed") displayStatus = "Completed";

    return {
      ...b, // Keep all the nicely formatted data from the server action (id, totalAmount, pendingAmount, etc.)
      startDate: new Date(b.startDate), // Re-hydrate dates from JSON strings back into Date objects
      endDate: new Date(b.endDate),
      status: displayStatus, // Override the raw DB status with our specific UI badge string
    };
  });

  // Apply Tabs Filter
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
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      {/* Premium Header */}
      <div className="bg-slate-900 text-white pt-16 pb-20 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mb-2 flex items-center gap-3">
            <Car className="w-8 h-8 text-blue-500" /> My Trips
          </h1>
          <p className="text-slate-400 text-sm md:text-base">
            Track your reservations, manage payments, and view your rental
            history.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8">
        {/* Filters & Search Bar */}
        <div className="bg-white rounded-2xl p-2 shadow-sm border border-slate-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex w-full md:w-auto overflow-x-auto custom-scrollbar p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-2.5 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                  activeTab === tab
                    ? "bg-slate-900 text-white shadow-md"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-64 shrink-0 px-2 md:px-0 md:pr-2 pb-2 md:pb-0">
            <Search className="absolute left-5 md:left-3 top-2.5 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search booking ID..."
              className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-xs focus-visible:ring-blue-500 w-full"
            />
          </div>
        </div>

        {/* The Booking List */}
        <div className="space-y-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredBookings.length > 0 ? (
            filteredBookings.map((booking: any) => (
              <BookingCard key={booking.original_id} booking={booking} />
            ))
          ) : (
            <div className="bg-white rounded-3xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Car className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No trips found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm">
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
