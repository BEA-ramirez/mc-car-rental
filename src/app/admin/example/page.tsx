"use client";

import React, { useState } from "react";
import {
  Phone,
  MessageSquare,
  Clock,
  Car,
  Settings,
  Fuel,
  Users,
  Briefcase,
  Search,
  Filter,
  Eye,
  MapPin,
} from "lucide-react";

// --- DUMMY DATA ---
const carDetails = {
  id: "CAR-8021",
  plate_number: "ABC-1234",
  brand: "Toyota",
  model: "Fortuner",
  year: 2023,
  color: "Attitude Black",
  status: "Available",
  current_mileage: 24500,
  rental_rate_per_day: 3500,
  images: [
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?q=80&w=1000",
    "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=1000",
    "https://images.unsplash.com/photo-1550355291-bbee04a92027?q=80&w=1000",
  ],
  specifications: {
    engine: "2.8L Diesel",
    transmission: "6-Speed AT",
    fuel_type: "Diesel",
    body_type: "SUV",
    passenger_capacity: 7,
    luggage_capacity: 4,
  },
  features: [
    "Bluetooth",
    "Backup Camera",
    "GPS Navigation",
    "Leather Seats",
    "Apple CarPlay",
    "Sunroof",
    "Dashcam",
  ],
  owner: {
    name: "Marcus Lee",
    business_name: "Lee Premium Rentals",
    revenue_share: 70,
    avatar: "https://i.pravatar.cc/150?u=marcus",
  },
  utilization: {
    percentage: 48,
    weight_current: 6.5,
    weight_max: 13.5,
  },
};

const activityLogs = [
  {
    id: 1,
    time: "09:30 PM",
    desc: "Inspection completed (Pre-trip).",
    actor: "Admin Staff",
  },
  {
    id: 2,
    time: "08:15 AM",
    desc: "Booking BK-9281 concluded.",
    actor: "System",
  },
  {
    id: 3,
    time: "04:00 PM",
    desc: "Routine maintenance logged.",
    actor: "Marcus Lee",
  },
  {
    id: 4,
    time: "10:00 AM",
    desc: "Vehicle washed at Hub A.",
    actor: "Cleaning Staff",
  },
];

const bookings = [
  {
    id: "SHP-9821",
    route: "Ormoc → Tacloban",
    type: "Self-Drive",
    qty: "3 Days",
    weight: "10,500 ₱",
    status: "Standard",
    method: "Pickup",
  },
  {
    id: "SHP-9822",
    route: "Ormoc → Airport",
    type: "Chauffeur",
    qty: "1 Day",
    weight: "4,500 ₱",
    status: "Express",
    method: "Delivery",
  },
  {
    id: "SHP-9823",
    route: "Ormoc → Baybay",
    type: "Self-Drive",
    qty: "2 Days",
    weight: "7,000 ₱",
    status: "Same day",
    method: "Pickup",
  },
];

export default function AdminCarDetailsPage() {
  // Try toggling this to false to see the light mode automatically apply!
  const [isDarkMode] = useState(false);
  const [activeImage, setActiveImage] = useState(carDetails.images[0]);

  return (
    <div className={isDarkMode ? "dark" : ""}>
      {/* Container restricted to h-screen to prevent scrolling */}
      <div className="h-screen bg-background text-foreground font-sans overflow-hidden flex flex-col transition-colors duration-300">
        {/* --- COMPACT TOP HEADER --- */}
        <header className="px-4 py-3 sm:px-6 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent">
          <div className="flex items-start gap-3">
            <button className="mt-1 p-1 bg-card border border-border rounded shadow-sm text-muted-foreground hover:text-primary transition-colors">
              <Search className="w-3.5 h-3.5" />
            </button>
            <div className="flex flex-col">
              <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-0.5">
                <span>Fleet Operations</span>
                <span className="opacity-50">/</span>
                <span className="text-primary">Car details</span>
              </div>
              <div className="flex items-center gap-3">
                <h1 className="text-sm font-bold">{carDetails.id}</h1>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-[9px] font-medium flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                  {carDetails.status}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="p-1.5 bg-card border border-border rounded shadow-sm text-muted-foreground hover:text-primary transition-colors">
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
            <button className="px-3 py-1.5 bg-card border border-border rounded shadow-sm text-[11px] font-medium text-foreground flex items-center gap-1.5 hover:border-primary/50 hover:text-primary transition-colors">
              <Eye className="w-3.5 h-3.5" /> View log
            </button>
            <button className="px-4 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded shadow-sm text-[11px] font-semibold flex items-center gap-1.5 transition-opacity">
              <Car className="w-3.5 h-3.5" /> Update status
            </button>
          </div>
        </header>

        {/* --- MAIN CONTENT GRID --- */}
        <main className="flex-1 overflow-y-auto sm:overflow-hidden p-4 sm:px-6 pt-0">
          <div className="max-w-[1600px] mx-auto h-full grid grid-cols-1 xl:grid-cols-12 gap-4">
            {/* LEFT COLUMN */}
            <div className="xl:col-span-3 flex flex-col gap-4 h-full">
              {/* Partner Info Card */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm shrink-0">
                <h3 className="text-[10px] font-semibold text-muted-foreground mb-3">
                  Partnership information
                </h3>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={carDetails.owner.avatar}
                      alt="Owner"
                      className="w-8 h-8 rounded-full border-2 border-border/50"
                    />
                    <div>
                      <p className="text-[9px] font-semibold text-primary">
                        Asset Owner
                      </p>
                      <p className="text-xs font-bold">
                        {carDetails.owner.name}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="p-1.5 border border-border rounded bg-secondary hover:border-primary/50 text-muted-foreground transition-colors">
                      <Phone className="w-3 h-3" />
                    </button>
                    <button className="p-1.5 border border-border rounded bg-secondary hover:border-primary/50 text-muted-foreground transition-colors">
                      <MessageSquare className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-muted-foreground font-medium">
                    Rev Share:{" "}
                    <strong className="text-foreground">
                      {carDetails.owner.revenue_share}%
                    </strong>
                  </span>
                  <span className="text-muted-foreground font-medium">
                    Daily:{" "}
                    <strong className="text-primary">
                      ₱{carDetails.rental_rate_per_day}
                    </strong>
                  </span>
                </div>
                <div className="mt-3 pt-3 border-t border-border flex gap-2">
                  <button className="flex-1 py-1.5 border border-border rounded text-[10px] font-medium text-foreground hover:border-primary/50 transition-colors">
                    Change owner
                  </button>
                  <button className="flex-1 py-1.5 border border-border rounded text-[10px] font-medium text-foreground hover:border-primary/50 transition-colors">
                    Edit terms
                  </button>
                </div>
              </div>

              {/* Utilization Donut Card */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm shrink-0">
                <h3 className="text-[10px] font-semibold text-muted-foreground mb-3">
                  Utilization & mileage
                </h3>
                <div className="flex items-center gap-6">
                  <div className="relative w-16 h-16 shrink-0">
                    <svg
                      viewBox="0 0 36 36"
                      className="w-full h-full transform -rotate-90"
                    >
                      <path
                        className="stroke-muted"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="4"
                      />
                      <path
                        className="stroke-primary"
                        strokeDasharray={`${carDetails.utilization.percentage}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        fill="none"
                        strokeWidth="4"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xs font-bold">
                        {carDetails.utilization.percentage}%
                      </span>
                      <span className="text-[7px] font-medium text-muted-foreground">
                        Booked
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div>
                      <p className="text-[9px] font-medium text-muted-foreground">
                        Current odometer
                      </p>
                      <p className="text-xs font-bold">
                        {carDetails.current_mileage.toLocaleString()} km
                      </p>
                    </div>
                    <div>
                      <p className="text-[9px] font-medium text-muted-foreground">
                        Service due
                      </p>
                      <p className="text-xs font-bold">25,000 km</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Log Card */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex-1 overflow-hidden flex flex-col">
                <h3 className="text-[10px] font-semibold text-muted-foreground mb-4 shrink-0">
                  Activity log
                </h3>
                <div className="relative border-l border-border ml-2 space-y-4 flex-1 overflow-y-auto pr-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {activityLogs.map((log, index) => (
                    <div key={log.id} className="relative pl-4">
                      <div className="absolute -left-[5px] top-1 w-2 h-2 rounded-full bg-card border border-border flex items-center justify-center">
                        <div
                          className={`w-1 h-1 rounded-full ${index === 0 ? "bg-primary" : "bg-muted-foreground/50"}`}
                        />
                      </div>
                      <div className="flex items-center gap-1.5 mb-0.5 text-[9px] font-medium text-muted-foreground">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{log.time}</span>
                      </div>
                      <p className="text-[10px] font-medium leading-tight">
                        {log.desc}
                      </p>
                      <p className="text-[9px] font-medium text-primary mt-0.5">
                        {log.actor}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="xl:col-span-9 flex flex-col gap-4 h-full">
              {/* Top Right: Image, Specs & Features */}
              <div className="bg-card border border-border rounded-xl p-3 sm:p-4 shadow-sm flex flex-col lg:flex-row gap-4 shrink-0">
                {/* Main Interactive Image Container - FIXED HEIGHT */}
                <div className="w-full lg:w-1/2 h-56 lg:h-64 rounded-lg bg-muted overflow-hidden relative border border-border shrink-0">
                  <img
                    src={activeImage}
                    alt="Car"
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />

                  {/* Floating Tag for Body Type */}
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded text-[9px] font-semibold text-white border border-white/10">
                    Premium {carDetails.specifications.body_type}
                  </div>

                  {/* Gradient for text readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Title & Info over Image */}
                  <div className="absolute bottom-4 left-4">
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-md">
                      {carDetails.brand} {carDetails.model}
                    </h2>
                    <p className="text-[10px] font-medium text-white/80 mt-0.5 drop-shadow-md">
                      {carDetails.plate_number} • {carDetails.year} Model
                    </p>
                  </div>

                  {/* Multi-Image Thumbnails */}
                  <div className="absolute bottom-4 right-4 flex gap-1.5">
                    {carDetails.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={cn(
                          "w-8 h-8 rounded overflow-hidden border-2 transition-all",
                          activeImage === img
                            ? "border-primary shadow-sm"
                            : "border-white/20 opacity-60 hover:opacity-100",
                        )}
                      >
                        <img
                          src={img}
                          alt={`Thumb ${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Specs & Features Grid */}
                <div className="w-full lg:w-1/2 flex flex-col">
                  <div className="grid grid-cols-2 gap-2 flex-1">
                    {[
                      {
                        id: "A1",
                        label: "Engine",
                        val: carDetails.specifications.engine,
                      },
                      {
                        id: "A2",
                        label: "Transmission",
                        val: carDetails.specifications.transmission,
                      },
                      {
                        id: "B1",
                        label: "Fuel type",
                        val: carDetails.specifications.fuel_type,
                      },
                      {
                        id: "B2",
                        label: "Class",
                        val: carDetails.specifications.body_type,
                      },
                      {
                        id: "C1",
                        label: "Capacity",
                        val: `${carDetails.specifications.passenger_capacity} Pax`,
                      },
                      {
                        id: "C2",
                        label: "Plate",
                        val: carDetails.plate_number,
                      },
                    ].map((spec) => (
                      <div
                        key={spec.id}
                        className="border border-border rounded p-2 flex flex-col justify-between bg-secondary/50 hover:border-primary/50 transition-colors group cursor-default relative"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[9px] font-bold text-muted-foreground">
                            {spec.id}
                          </span>
                          <div className="w-1 h-1 rounded-full bg-muted-foreground/50 group-hover:bg-primary transition-colors" />
                        </div>
                        <div>
                          <p className="text-[9px] font-medium text-muted-foreground mb-0.5">
                            {spec.label}
                          </p>
                          <p className="text-[11px] font-bold truncate group-hover:text-primary transition-colors">
                            {spec.val}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Compact Features List */}
                  <div className="mt-3 pt-3 border-t border-border shrink-0">
                    <p className="text-[9px] font-semibold text-muted-foreground mb-2">
                      Installed features
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {carDetails.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-1.5 py-0.5 bg-secondary border border-border rounded text-[10px] font-medium text-foreground"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom Right: Bookings Grid */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4 shrink-0">
                  <h3 className="text-[11px] font-semibold">
                    Active & upcoming bookings
                  </h3>
                  <div className="flex gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search booking ID..."
                        className="pl-6 h-7 w-40 text-[10px] font-medium bg-secondary border border-border rounded focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <button className="h-7 px-2 border border-border bg-secondary rounded text-[10px] font-medium flex items-center gap-1 hover:border-primary/50 transition-colors">
                      <Filter className="w-3 h-3" /> Sort by
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="border border-border rounded-lg p-3 flex flex-col justify-between bg-card hover:border-primary/50 transition-colors group"
                    >
                      <div className="flex justify-between items-start mb-3 border-b border-border pb-2">
                        <div className="flex items-center gap-1.5">
                          <Car className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                          <span className="text-[11px] font-bold">{b.id}</span>
                        </div>

                        {/* Properly themed status pills */}
                        <span
                          className={cn(
                            "px-1.5 py-0.5 rounded text-[9px] font-medium border",
                            b.status === "Standard"
                              ? "bg-secondary text-foreground border-border"
                              : b.status === "Express"
                                ? "bg-primary/10 text-primary border-primary/20"
                                : "bg-blue-500/10 text-blue-500 border-blue-500/20",
                          )}
                        >
                          {b.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div>
                          <p className="text-[8px] font-medium text-muted-foreground mb-0.5">
                            Route
                          </p>
                          <p className="text-[10px] font-semibold truncate">
                            {b.route.split("→")[0]}
                          </p>
                          <p className="text-[10px] font-semibold truncate">
                            → {b.route.split("→")[1]}
                          </p>
                        </div>
                        <div>
                          <p className="text-[8px] font-medium text-muted-foreground mb-0.5">
                            Type
                          </p>
                          <p className="text-[10px] font-semibold">{b.type}</p>
                        </div>
                        <div>
                          <p className="text-[8px] font-medium text-muted-foreground mb-0.5">
                            Duration
                          </p>
                          <p className="text-[10px] font-semibold">{b.qty}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-4">
                        <div>
                          <p className="text-[8px] font-medium text-muted-foreground mb-0.5">
                            Revenue
                          </p>
                          <p className="text-[10px] font-semibold text-primary">
                            {b.weight}
                          </p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[8px] font-medium text-muted-foreground mb-0.5">
                            Fulfillment
                          </p>
                          <p className="text-[10px] font-semibold">
                            {b.method}
                          </p>
                        </div>
                      </div>

                      <button className="w-full py-1.5 border border-border rounded text-[10px] font-medium flex items-center justify-center gap-1 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                        Manage trip
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
