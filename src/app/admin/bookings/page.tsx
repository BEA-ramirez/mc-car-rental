import React from "react";
import BookingDataGrid from "@/components/bookings/booking-datagrid";
import { dummyBookings } from "@/constants/datasource";

function Booking() {
  return (
    <div className=" grid grid-cols-5 grid-rows-7 h-[50rem] gap-4">
      <div className="border border-black ">Confirmed Bookings</div>
      <div className="border border-black">Pending Bookings</div>
      <div className="border border-black col-span-3 row-span-2">
        Bookings Overview
      </div>
      <div className="border border-black">Canceled Bookings</div>
      <div className="border border-black">Completed Bookings</div>
      <div className="border border-black col-span-5 row-span-6 p-2">
        <h3 className="mb-1">Car Bookings</h3>
        <BookingDataGrid bookings={dummyBookings} />
      </div>
    </div>
  );
}

export default Booking;
