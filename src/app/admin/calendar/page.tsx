"use client";

import React from "react";
import TimelineScheduler, {
  SchedulerEvent,
  SchedulerResource,
} from "@/components/scheduler/timeline-scheduler"; // Ensure this path matches where you saved the latest component

// 1. Define your Units (The Sidebar Rows)
const MOCK_RESOURCES: SchedulerResource[] = [
  {
    id: "c1",
    title: "Toyota Vios 2024",
    subtitle: "ABC-123",
    tags: ["Sedan", "Auto"],
    image: "/cars/vios.jpg", // Optional
  },
  {
    id: "c2",
    title: "Mitsubishi Mirage",
    subtitle: "XYZ-789",
    tags: ["Hatchback", "Manual"],
  },
  {
    id: "c3",
    title: "Ford Everest",
    subtitle: "SUV-999",
    tags: ["SUV", "Diesel", "4x4"],
  },
  {
    id: "c4",
    title: "Nissan Urvan",
    subtitle: "VAN-111",
    tags: ["Van", "Manual", "15-Seater"],
  },
];

// 2. Define your Bookings (Linked to Units via resourceId)
const MOCK_EVENTS: SchedulerEvent[] = [
  {
    id: "1",
    resourceId: "c1",
    start: new Date(2026, 1, 18, 9, 30),
    end: new Date(2026, 1, 20, 14, 0),
    title: "John Doe",
    subtitle: "Confirmed",
    status: "confirmed",
    // --- NEW FIELDS ---
    amount: 4500,
    paymentStatus: "Paid",
    customerPhone: "0917-123-4567",
    customerEmail: "john@gmail.com",
    pickupLocation: "Ormoc City Center",
    dropoffLocation: "Tacloban Airport",
  },
  {
    id: "2",
    resourceId: "c2", // Linked to Mirage
    start: new Date(2026, 1, 19, 10, 0),
    end: new Date(2026, 1, 19, 18, 0),
    title: "Maria Clara",
    subtitle: "Pending Payment",
    status: "pending", // Triggers amber color
    // --- NEW FIELDS ---
    amount: 3000,
    paymentStatus: "Unpaid",
    customerPhone: "0928-765-4321",
    customerEmail: "maria.clara@gmail.com",
    pickupLocation: "Tacloban Downtown",
    dropoffLocation: "San Juanico Bridge",
  },
  {
    id: "3",
    resourceId: "c3", // Linked to Everest
    start: new Date(2026, 1, 17, 8, 0),
    end: new Date(2026, 1, 22, 20, 0),
    title: "Tech Corp Inc.",
    subtitle: "Long Term Rental",
    status: "confirmed",
    // --- NEW FIELDS ---
    amount: 25000,
    paymentStatus: "Partial",
    customerPhone: "0917-555-1234",
    customerEmail: "tech.corp@gmail.com",
    pickupLocation: "Ormoc Port",
    dropoffLocation: "Tacloban City Hall",
  },
];

function CalendarPage() {
  return (
    // Adjust height calculation based on your layout header/sidebar
    <div className="h-[calc(100vh-100px)] p-6 bg-slate-50/50">
      <TimelineScheduler
        resources={MOCK_RESOURCES}
        events={MOCK_EVENTS}
        // 1. Triggered when you click "Edit Booking" inside the side panel
        onEditClick={(event) => {
          console.log("Open Edit Modal for:", event);
          // router.push(`/admin/bookings/${event.id}/edit`);
        }}
        // 2. Triggered when you click an empty space on the grid
        onEmptyClick={(resourceId, date) => {
          console.log(
            `Create new booking for Car ${resourceId} starting at ${date}`,
          );
          // router.push(`/admin/bookings/new?carId=${resourceId}&date=${date.toISOString()}`);
        }}
      />
    </div>
  );
}

export default CalendarPage;
