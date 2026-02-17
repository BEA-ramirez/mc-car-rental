"use client";
import React from "react";
import BookingDataGrid from "@/components/bookings/booking-datagrid";
import { dummyBookings } from "@/constants/datasource";
import OrmocMapSelector from "@/components/ormoc-map";
import AdminBookingForm from "@/components/bookings/admin-booking-form";

function Booking() {
  return (
    <div className="p-10">
      {/* <OrmocMapSelector
        onLocationSelect={(lat, lng) => console.log("Form received:", lat, lng)}
      /> */}
      <AdminBookingForm />
    </div>
  );
}

export default Booking;
