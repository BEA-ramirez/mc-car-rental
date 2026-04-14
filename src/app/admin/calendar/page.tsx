"use client";

import React, { useMemo } from "react";
import OperationsCalendar, {
  OpsEvent,
} from "@/components/scheduler/operations-calendar";
// Adjust this import path depending on where this page file is located in your structure:
import { useBookings } from "../../../../hooks/use-bookings";
import { Loader2, AlertCircle } from "lucide-react";

export default function CalendarPage() {
  const { bookings: rawBookings, isLoading, isError } = useBookings(); // Note: Changed bookings to data if using raw React Query

  const transformedBookings: OpsEvent[] = useMemo(() => {
    if (!rawBookings) return [];

    return (
      rawBookings
        // 1. FILTER OUT UNWANTED STATUSES EARLY
        .filter((booking: any) => {
          const rawStatus = booking.booking_status || booking.status || "";
          const normalized = rawStatus.toUpperCase();
          return ["CONFIRMED", "ONGOING", "COMPLETED"].includes(normalized);
        })
        // 2. MAP TO OPS EVENT SHAPE
        .map((booking: any) => {
          const car = booking.car || booking.cars || {};
          const customer = booking.customer || booking.users || {};
          const normalizedStatus = (
            booking.booking_status || booking.status
          ).toUpperCase();

          return {
            id: booking.booking_id || booking.id,
            carBrand: car.brand || "Unknown",
            carModel: car.model || "Vehicle",
            plate: car.plate_number || car.plate || "N/A",
            customerName: customer.full_name || customer.name || "Guest User",
            startDate: new Date(booking.start_date),
            endDate: new Date(booking.end_date),
            status: normalizedStatus as OpsEvent["status"],
          };
        })
    );
  }, [rawBookings]);

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className="h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
        <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Loading Operations Dispatch...
        </p>
      </div>
    );
  }

  // --- ERROR STATE ---
  if (isError) {
    return (
      <div className="h-[calc(100vh-100px)] w-full flex flex-col items-center justify-center bg-slate-50/50 dark:bg-background">
        <AlertCircle className="w-12 h-12 text-destructive/50 mb-4" />
        <h2 className="text-lg font-bold text-foreground">
          Failed to load calendar data
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          Please check your database connection.
        </p>
      </div>
    );
  }

  // --- MAIN RENDER ---
  return (
    <div className="h-[calc(100vh-100px)] p-4 sm:p-6 bg-slate-50/50 dark:bg-background">
      <OperationsCalendar bookings={transformedBookings} />
    </div>
  );
}
