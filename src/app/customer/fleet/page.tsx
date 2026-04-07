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
  ArrowRight,
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

  console.log("Selected car", selectedCar);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "All",
    transmission: "Any",
    minSeating: null,
    maxPrice: null,
  });

  const { units, isUnitsLoading } = useUnits();

  // MAPPING UPDATED: Added 'features' to the returned object
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
      features: unit.features || [], // <-- Added this line to pass features down
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
    <div className="min-h-screen bg-[#050B10] text-white font-sans selection:bg-[#64c5c3] selection:text-black">
      {/* Top Nav (Glassmorphic) */}
      <nav className="fixed top-0 w-full z-50 bg-[#050B10]/50 backdrop-blur-lg border-b border-white/5 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-2xl font-black tracking-tighter text-white group-hover:text-[#64c5c3] transition-colors duration-300">
              MC ORMOC
            </span>
          </Link>

          <div className="flex items-center gap-2 sm:gap-6">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-all duration-300"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-[#64c5c3] rounded-full shadow-[0_0_8px_rgba(100,197,195,0.8)]" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="end"
                sideOffset={12}
                className="w-80 sm:w-96 p-0 rounded-2xl border-white/10 bg-[#0a1118]/95 backdrop-blur-2xl shadow-2xl overflow-hidden"
              >
                <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between">
                  <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold text-black bg-[#64c5c3] px-2 py-0.5 rounded-full uppercase tracking-widest">
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
                            notif.unread ? "bg-[#64c5c3]/10" : "bg-transparent",
                          )}
                        >
                          <div className="shrink-0 mt-1">
                            {notif.type === "booking" && (
                              <CheckCircle2 className="w-5 h-5 text-[#64c5c3]" />
                            )}
                            {notif.type === "system" && (
                              <ShieldCheck className="w-5 h-5 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-bold text-white tracking-wide">
                                {notif.title}
                              </h4>
                            </div>
                            <p className="text-xs text-gray-400 leading-relaxed mb-2">
                              {notif.message}
                            </p>
                            <span className="text-[10px] font-bold text-[#64c5c3]/50 uppercase tracking-widest">
                              {notif.time}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-xs font-bold text-white/40 uppercase tracking-widest">
                      No new notifications
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Link href="/customer/my-bookings">
              <Button
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 px-4 text-xs font-bold uppercase tracking-widest transition-all duration-300"
              >
                <CalendarDays className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Bookings</span>
              </Button>
            </Link>

            <Link href="/customer/profile">
              <Button
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 px-4 text-xs font-bold uppercase tracking-widest transition-all duration-300"
              >
                <User className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Header Section - With "Driving In" Car Animation */}
      <div className="relative pt-32 pb-24 md:pb-32 px-6 overflow-hidden border-b border-white/5 min-h-[60vh] flex items-center">
        {/* Dynamic Background Glows */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#64c5c3]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          {/* Left Side: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full md:pr-8 relative z-20"
          >
            <p className="text-[#64c5c3] font-bold tracking-widest text-sm mb-4 uppercase flex items-center gap-3">
              <span className="w-12 h-[2px] bg-[#64c5c3]"></span> Ready to roll
            </p>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter leading-[0.85] mb-6">
              Find Your <br />{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-600">
                Drive
              </span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base max-w-sm font-medium leading-relaxed">
              Browse our complete fleet of reliable, everyday vehicles.
              Meticulously maintained and ready when you are.
            </p>
          </motion.div>

          {/* Right Side: The "Running" Car Animation */}
          <motion.div
            // Starts off-screen right (100vw) and leaning forward (-10 deg)
            initial={{ x: "100vw", opacity: 0, skewX: -10 }}
            // Straightens out (0 deg) as it hits its resting position
            animate={{ x: 0, opacity: 1, skewX: 0 }}
            transition={{
              type: "spring",
              stiffness: 45,
              damping: 14,
              mass: 1.2,
              delay: 0.2,
            }}
            className="flex-1 w-full relative hidden md:block"
          >
            {/* Wrapper to make the car break out of its container slightly */}
            <div className="relative w-[115%] -right-[5%]">
              {/* Fading speed lines effect behind the car */}
              <motion.div
                initial={{ opacity: 1, scaleX: 1, x: 0 }}
                animate={{ opacity: 0, scaleX: 0, x: -100 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#64c5c3]/50 to-transparent -z-10 origin-left"
              />
              <motion.div
                initial={{ opacity: 1, scaleX: 1, x: 0 }}
                animate={{ opacity: 0, scaleX: 0, x: -100 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="absolute top-[60%] left-10 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent -z-10 origin-left"
              />

              {/* The Car Image - A sleek, non-luxury Mazda 3 Hatchback */}
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black">
                <img
                  src="https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=1000"
                  alt="Mazda 3 Hatchback"
                  className="w-full h-[300px] object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

              {/* Glassmorphic spec tag attached to the car */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1 }}
                className="absolute -bottom-6 left-8 bg-[#0a1118]/90 backdrop-blur-xl border border-white/10 px-6 py-4 rounded-2xl flex gap-6 shadow-2xl"
              >
                <div>
                  <p className="text-[9px] text-[#64c5c3] font-bold uppercase tracking-widest mb-1">
                    Top Pick
                  </p>
                  <p className="text-sm font-black text-white uppercase tracking-wider">
                    Mazda 3 Hatch
                  </p>
                </div>
                <div className="w-[1px] h-8 bg-white/10 self-center" />
                <div className="flex items-center gap-2 self-center">
                  <div className="w-2 h-2 rounded-full bg-[#64c5c3] animate-pulse shadow-[0_0_8px_rgba(100,197,195,0.8)]" />
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                    Available
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Filters Area (Left to handle its own mobile view via sheet/drawer) */}
          <div className="lg:col-span-3">
            <FleetFilters filters={filters} setFilters={setFilters} />
          </div>

          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-8">
              <p className="text-xs font-bold text-white/50 uppercase tracking-widest">
                {isUnitsLoading ? (
                  "Searching Fleet..."
                ) : (
                  <>
                    <span className="text-[#64c5c3]">
                      {filteredCars.length}
                    </span>{" "}
                    Vehicles Found
                  </>
                )}
              </p>
              <div className="text-xs font-bold text-white/50 uppercase tracking-widest flex items-center gap-2">
                Sort By:{" "}
                <span className="text-white cursor-pointer hover:text-[#64c5c3] transition-colors">
                  Recommended
                </span>
              </div>
            </div>

            {/* Grid - Mobile first (2 cols on mobile, 3 on tablet/desktop) */}
            {isUnitsLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {Array.from({ length: 8 }).map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {filteredCars.length > 0 ? (
                  filteredCars.map((car: any) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
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
                  <div className="col-span-full text-center py-24 border border-white/5 rounded-2xl bg-[#0a1118]">
                    <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">
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
