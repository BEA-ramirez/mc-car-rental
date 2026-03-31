"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Car,
  User,
  CalendarDays,
  Bell,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

import FleetFilters, { FilterState } from "@/components/customer/fleet-filters";
import CarCard from "@/components/customer/car-card";
import CarDetailsSheet from "@/components/customer/car-details-sheet";
import { CarCardSkeleton } from "@/components/skeletons";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { useUnits } from "../../../../hooks/use-units";

// Mock notifs
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Booking Approved!",
    message: "Your request is approved.",
    time: "10 mins ago",
    unread: true,
    type: "booking",
  },
  {
    id: 2,
    title: "Identity Verified",
    message: "Your License was verified.",
    time: "2 hours ago",
    unread: false,
    type: "system",
  },
];

export default function CustomerFleetPage() {
  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "All",
    transmission: "Any",
    minSeating: null,
    maxPrice: null,
  });

  // Fetch the units
  const { units, isUnitsLoading } = useUnits();

  // Format data to UI shape
  const formattedCars = units.map((unit: any) => {
    // Sort images so the primary image is ALWAYS first ---
    const sortedImages = [...(unit.images || [])].sort((a: any, b: any) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return 0;
    });

    // Extract just the URLs into an array, fallback if empty
    const imageUrls =
      sortedImages.length > 0
        ? sortedImages.map((img: any) => img.image_url)
        : ["https://placehold.co/600x400?text=No+Image"];

    return {
      id: unit.car_id,
      brand: unit.brand,
      model: unit.model,
      year: unit.year,
      type: unit.specifications?.body_type || "Vehicle",
      transmission: unit.specifications?.transmission || "Auto/Manual",
      seats: unit.specifications?.passenger_capacity || 5,
      fuel: unit.specifications?.fuel_type || "Fuel",
      price: Number(unit.rental_rate_per_day) || 0,
      images: imageUrls,
    };
  });

  const filteredCars = formattedCars.filter((car) => {
    // Search Filter (Brand or Model)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesBrand = car.brand.toLowerCase().includes(searchTerm);
      const matchesModel = car.model.toLowerCase().includes(searchTerm);
      if (!matchesBrand && !matchesModel) return false;
    }

    // Vehicle Type Filter
    if (filters.type !== "All" && car.type !== filters.type) {
      return false;
    }

    // Transmission Filter
    if (filters.transmission !== "Any") {
      // Using includes allows "Auto" to match "Automatic"
      const carTrans = car.transmission.toLowerCase();
      const filterTrans = filters.transmission.toLowerCase();
      if (!carTrans.includes(filterTrans)) return false;
    }

    // Seating Capacity Filter
    if (filters.minSeating !== null && car.seats < filters.minSeating) {
      return false;
    }

    // Max Price Filter
    if (filters.maxPrice !== null && car.price > filters.maxPrice) {
      return false;
    }

    // If it passes all checks, keep it in the array
    return true;
  });

  const handleViewDetails = (car: any) => {
    setSelectedCar(car);
    setIsSheetOpen(true);
  };

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans">
      {/* Hero Header Section */}
      <div className="bg-slate-900 text-white pb-32">
        <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 transition-opacity hover:opacity-80"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <Car className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-black text-white tracking-tight">
              MC Ormoc
            </span>
          </Link>

          <div className="flex items-center gap-1 sm:gap-3">
            {/* Notifications Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-slate-300 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-slate-900" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={8}
                className="w-80 sm:w-96 p-0 rounded-3xl border-slate-100 shadow-2xl overflow-hidden"
              >
                <div className="bg-slate-50 border-b border-slate-100 p-4 flex items-center justify-between">
                  <h3 className="font-bold text-slate-900">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">
                      {unreadCount} New
                    </span>
                  )}
                </div>
                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {MOCK_NOTIFICATIONS.length > 0 ? (
                    <div className="flex flex-col">
                      {MOCK_NOTIFICATIONS.map((notif) => (
                        <div
                          key={notif.id}
                          className={cn(
                            "p-4 border-b border-slate-50 flex gap-4 hover:bg-slate-50 transition-colors cursor-pointer",
                            notif.unread ? "bg-blue-50/30" : "bg-white",
                          )}
                        >
                          <div className="shrink-0 mt-1">
                            {notif.type === "booking" && (
                              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            )}
                            {notif.type === "system" && (
                              <ShieldCheck className="w-5 h-5 text-blue-500" />
                            )}
                          </div>
                          <div>
                            <div className="flex justify-between items-start mb-0.5">
                              <h4
                                className={cn(
                                  "text-sm font-bold text-slate-900 leading-tight",
                                  notif.unread && "text-blue-900",
                                )}
                              >
                                {notif.title}
                              </h4>
                              {notif.unread && (
                                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-1.5 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-1.5">
                              {notif.message}
                            </p>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm text-slate-500">
                      You're all caught up!
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Link href="/customer/my-bookings">
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-bold transition-all px-3"
              >
                <CalendarDays className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">My Trips</span>
              </Button>
            </Link>

            <Link href="/customer/profile">
              <Button
                variant="ghost"
                className="text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl text-sm font-bold transition-all px-3"
              >
                <User className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
          </div>
        </nav>

        {/* Hero Text */}
        <div className="max-w-7xl mx-auto px-6 pt-10">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Find your perfect drive.
          </h1>
          <p className="text-slate-400 text-lg max-w-xl leading-relaxed">
            From compact sedans for city cruising to tough SUVs for Eastern
            Visayas adventures. Book instantly.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 -mt-16 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="hidden lg:block lg:col-span-3">
            <FleetFilters filters={filters} setFilters={setFilters} />
          </div>

          <div className="lg:col-span-9">
            <div className="bg-white rounded-2xl p-4 mb-6 shadow-sm border border-slate-100 flex items-center justify-between">
              <p className="text-sm font-bold text-slate-500">
                {isUnitsLoading ? (
                  "Loading..."
                ) : (
                  <>
                    Showing{" "}
                    <span className="text-slate-900">
                      {/* Changed to filteredCars.length */}
                      {filteredCars.length}
                    </span>{" "}
                    vehicles
                  </>
                )}
              </p>
              <div className="text-sm font-medium text-slate-500">
                Sort by:{" "}
                <span className="text-slate-900 font-bold cursor-pointer">
                  Recommended
                </span>
              </div>
            </div>

            {/* RENDER REAL DATA */}
            {isUnitsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {/* Check filteredCars instead of formattedCars */}
                {filteredCars.length > 0 ? (
                  filteredCars.map((car: any) => (
                    <CarCard
                      key={car.id}
                      car={car}
                      onViewDetails={() => handleViewDetails(car)}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12 text-slate-500">
                    No vehicles match your current filters. Try adjusting your
                    search!
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <CarDetailsSheet
        car={selectedCar}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
      />
    </div>
  );
}
