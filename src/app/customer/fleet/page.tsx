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
import { motion } from "framer-motion";

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

// --- CUSTOM HIGH-END LOGO ---
const PremiumLogo = () => (
  <div className="relative w-6 h-6 flex items-center justify-center group cursor-pointer">
    <div className="absolute w-full h-full border-[1.5px] border-white/80 rounded-sm transform rotate-45 transition-transform duration-700 group-hover:rotate-90" />
    <div className="absolute w-full h-full border-[1.5px] border-blue-500/80 rounded-sm transform -rotate-45 transition-transform duration-700 group-hover:-rotate-90" />
    <span className="relative z-10 text-[8px] font-black text-white tracking-tighter">
      M
    </span>
  </div>
);

// Mock notifs
const MOCK_NOTIFICATIONS = [
  {
    id: 1,
    title: "Booking Approved",
    message: "Your request has been verified and approved.",
    time: "10 mins ago",
    unread: true,
    type: "booking",
  },
  {
    id: 2,
    title: "Identity Verified",
    message: "Your credentials have been securely authenticated.",
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

  const { units, isUnitsLoading } = useUnits();

  const formattedCars = units.map((unit: any) => {
    const sortedImages = [...(unit.images || [])].sort((a: any, b: any) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return 0;
    });

    const imageUrls =
      sortedImages.length > 0
        ? sortedImages.map((img: any) => img.image_url)
        : ["https://placehold.co/1200x800?text=No+Image"];

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
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const matchesBrand = car.brand.toLowerCase().includes(searchTerm);
      const matchesModel = car.model.toLowerCase().includes(searchTerm);
      if (!matchesBrand && !matchesModel) return false;
    }
    if (filters.type !== "All" && car.type !== filters.type) return false;
    if (filters.transmission !== "Any") {
      const carTrans = car.transmission.toLowerCase();
      const filterTrans = filters.transmission.toLowerCase();
      if (!carTrans.includes(filterTrans)) return false;
    }
    if (filters.minSeating !== null && car.seats < filters.minSeating)
      return false;
    if (filters.maxPrice !== null && car.price > filters.maxPrice) return false;
    return true;
  });

  const handleViewDetails = (car: any) => {
    setSelectedCar(car);
    setIsSheetOpen(true);
  };

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  return (
    <div className="min-h-screen bg-[#0A0C10] text-slate-300 font-sans selection:bg-blue-900 selection:text-white">
      {/* Top Nav (Premium Frosted Glass) */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-4 cursor-pointer group"
          >
            <PremiumLogo />
            <span className="text-[10px] font-medium text-white tracking-[0.3em] uppercase hidden sm:block mt-0.5 group-hover:text-blue-400 transition-colors duration-500">
              MC Ormoc
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-white/50 hover:text-white hover:bg-white/5 rounded-full transition-all duration-300"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-500 rounded-full" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={12}
                className="w-80 sm:w-96 p-0 rounded-2xl border-white/10 bg-[#111623]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
              >
                <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between">
                  <h3 className="font-light text-white text-sm tracking-wide">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[9px] font-medium text-blue-400 bg-blue-500/10 border border-blue-500/20 px-2 py-0.5 rounded-sm uppercase tracking-widest">
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
                            "p-5 border-b border-white/5 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer",
                            notif.unread ? "bg-blue-900/10" : "bg-transparent",
                          )}
                        >
                          <div className="shrink-0 mt-1">
                            {notif.type === "booking" && (
                              <CheckCircle2 className="w-4 h-4 text-blue-400" />
                            )}
                            {notif.type === "system" && (
                              <ShieldCheck className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-medium text-white tracking-wide">
                                {notif.title}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-400 font-light leading-relaxed mb-2">
                              {notif.message}
                            </p>
                            <span className="text-[9px] font-medium text-white/30 uppercase tracking-[0.2em]">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs font-light text-white/40 uppercase tracking-widest">
                      No new notifications
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Link href="/customer/my-bookings">
              <Button
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/5 rounded-none h-10 px-4 text-[9px] font-medium uppercase tracking-[0.2em] transition-all duration-300"
              >
                <CalendarDays className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Itinerary</span>
              </Button>
            </Link>

            <Link href="/customer/profile">
              <Button
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/5 rounded-none h-10 px-4 text-[9px] font-medium uppercase tracking-[0.2em] transition-all duration-300"
              >
                <User className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header Section */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0A0C10] to-[#0A0C10] -z-10" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-white/5 pb-12">
          <div>
            <div className="flex items-center gap-4 mb-4">
              <div className="h-[1px] w-12 bg-blue-500/50" />
              <span className="text-blue-400 text-[9px] font-medium uppercase tracking-[0.4em]">
                The Portfolio
              </span>
            </div>
            <h1 className="text-4xl md:text-6xl font-light text-white tracking-tighter leading-none">
              Curated{" "}
              <span className="italic font-normal text-white/50">
                collection.
              </span>
            </h1>
          </div>
          <p className="text-slate-400 text-sm max-w-sm font-light leading-relaxed md:text-right">
            Select from our meticulously maintained fleet. Engineered for
            comfort, prepared for your journey.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          <div className="lg:col-span-3">
            <FleetFilters filters={filters} setFilters={setFilters} />
          </div>

          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/5">
              <p className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em]">
                {isUnitsLoading ? (
                  "Curating..."
                ) : (
                  <>
                    <span className="text-white">{filteredCars.length}</span>{" "}
                    Vehicles Available
                  </>
                )}
              </p>
              <div className="text-[10px] font-medium text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                Sort:{" "}
                <span className="text-white cursor-pointer hover:text-blue-400 transition-colors">
                  Recommended
                </span>
              </div>
            </div>

            {/* RENDER REAL DATA - Updated to xl:grid-cols-3 and gap-6 for compactness */}
            {isUnitsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCars.length > 0 ? (
                  filteredCars.map((car: any) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={car.id}
                      className="h-full"
                    >
                      <CarCard
                        car={car}
                        onViewDetails={() => handleViewDetails(car)}
                      />
                    </motion.div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-24 border border-white/5 rounded-xl bg-[#111623]/30">
                    <p className="text-white/40 font-light text-sm uppercase tracking-widest">
                      No vehicles match your refined criteria.
                    </p>
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
