"use client";
import React from "react";
import BookingDataGrid from "@/components/bookings/booking-datagrid";
import { dummyBookings } from "@/constants/datasource";
import OrmocMapSelector from "@/components/ormoc-map";

function Booking() {
  return (
    <div className="p-10">
      <h1 className="text-2xl font-bold mb-4">Map Test</h1>
      <OrmocMapSelector
        onLocationSelect={(lat, lng) => console.log("Form received:", lat, lng)}
      />
    </div>
  );
}

export default Booking;
