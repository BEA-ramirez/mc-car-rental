"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  CalendarDays,
  Bell,
  CheckCircle2,
  ShieldCheck,
  LogOut,
  CheckCheck,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

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
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import LogoutDialog from "@/components/auth/logout-dialog";
import Image from "next/image";

import { useInView } from "react-intersection-observer";
import { useCustomerFleet } from "../../../../hooks/use-customer-fleet";
import { useNotifications } from "../../../../hooks/use-notifications";
import { useDebounce } from "../../../../hooks/use-debounce";

export default function CustomerFleetPage() {
  const { ref, inView } = useInView();

  const [selectedCar, setSelectedCar] = useState<any | null>(null);
  const [isDetailsSheetOpen, setIsDetailsSheetOpen] = useState(false);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    search: "",
    type: "All",
    transmission: "Any",
    minSeating: null,
    maxPrice: null,
  });

  const debouncedFilters = useDebounce(filters, 500);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useCustomerFleet(debouncedFilters);

  // --- FETCH REAL NOTIFICATIONS ---
  const {
    data: notifications = [],
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const unreadCount = notifications.filter((n: any) => !n.is_read).length;

  // Calculate active filters count for the mobile button badge
  const activeFiltersCount = Object.entries(filters).filter(([key, value]) => {
    if (key === "search" && value !== "") return true;
    if (key === "type" && value !== "All") return true;
    if (key === "transmission" && value !== "Any") return true;
    if (key === "minSeating" && value !== null) return true;
    if (key === "maxPrice" && value !== null) return true;
    return false;
  }).length;

  const allCars = data?.pages.flatMap((page) => page.data) || [];

  const formattedCars = allCars.map((unit: any) => {
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
      features: unit.features || [],
      rental_rate_per_12h: unit.rental_rate_per_12h || 0,
      rental_rate_per_day: unit.rental_rate_per_day || 0,
    };
  });

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleViewDetails = (car: any) => {
    setSelectedCar(car);
    setIsDetailsSheetOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#050B10] text-white font-sans selection:bg-[#64c5c3] selection:text-black pb-24 lg:pb-0 relative">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 bg-[#050B10]/50 backdrop-blur-lg border-b border-white/5 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image
              src="/mc-ormoc-logo.png"
              alt="Company Logo"
              width={48}
              height={48}
              priority
              className="object-contain sm:w-[60px] sm:h-[60px]"
            />
            <Link
              href="/"
              className="flex items-center gap-2 cursor-pointer group"
            >
              <span className="text-base sm:text-2xl font-black tracking-tighter text-white group-hover:text-[#64c5c3] transition-colors duration-300">
                MC ORMOC
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-6">
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
                className="w-[calc(100vw-2rem)] sm:w-96 p-0 rounded-2xl border-white/10 bg-[#0a1118]/95 backdrop-blur-2xl shadow-2xl overflow-hidden z-[100] mx-4 sm:mx-0"
              >
                <div className="bg-white/5 border-b border-white/5 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-white text-base sm:font-bold sm:text-sm sm:uppercase sm:tracking-wider">
                      Notifications
                    </h3>
                    {unreadCount > 0 && (
                      <span className="text-[10px] font-bold text-black bg-[#64c5c3] px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {unreadCount} New
                      </span>
                    )}
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllAsRead()}
                      className="text-xs sm:text-[10px] text-gray-400 hover:text-[#64c5c3] sm:uppercase tracking-widest font-medium sm:font-bold transition-colors flex items-center gap-1"
                    >
                      <CheckCheck className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden sm:inline">Mark All Read</span>
                    </button>
                  )}
                </div>

                <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                  {notifications.length > 0 ? (
                    <div className="flex flex-col">
                      {notifications.map((notif: any) => (
                        <div
                          key={notif.notification_id}
                          onClick={() => {
                            if (!notif.is_read)
                              markAsRead(notif.notification_id);
                          }}
                          className={cn(
                            "p-4 sm:p-5 border-b border-white/5 flex gap-4 hover:bg-white/5 transition-colors cursor-pointer",
                            !notif.is_read
                              ? "bg-[#64c5c3]/10"
                              : "bg-transparent",
                          )}
                        >
                          <div className="shrink-0 mt-1">
                            {notif.type === "booking" ||
                            notif.type === "payment" ? (
                              <CheckCircle2
                                className={cn(
                                  "w-5 h-5",
                                  !notif.is_read
                                    ? "text-[#64c5c3]"
                                    : "text-gray-500",
                                )}
                              />
                            ) : (
                              <ShieldCheck
                                className={cn(
                                  "w-5 h-5",
                                  !notif.is_read
                                    ? "text-blue-400"
                                    : "text-gray-500",
                                )}
                              />
                            )}
                          </div>
                          <div>
                            <div className="flex justify-between items-start mb-1">
                              <h4
                                className={cn(
                                  "text-sm tracking-wide",
                                  !notif.is_read
                                    ? "font-bold text-white"
                                    : "font-medium text-gray-300",
                                )}
                              >
                                {notif.title}
                              </h4>
                            </div>
                            <p className="text-sm sm:text-xs text-gray-400 leading-relaxed mb-2">
                              {notif.message}
                            </p>
                            <span className="text-xs sm:text-[10px] font-medium sm:font-bold text-[#64c5c3]/50 sm:uppercase sm:tracking-widest">
                              {formatDistanceToNow(new Date(notif.created_at), {
                                addSuffix: true,
                              })}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-sm sm:text-xs font-medium sm:font-bold text-white/40 sm:uppercase sm:tracking-widest flex flex-col items-center">
                      <Bell className="w-8 h-8 mb-3 opacity-20" />
                      No new notifications
                    </div>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            <Link href="/customer/my-bookings">
              <Button
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 px-3 sm:px-4 text-sm sm:text-xs font-medium sm:font-bold sm:uppercase sm:tracking-widest transition-all duration-300"
              >
                <CalendarDays className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Bookings</span>
              </Button>
            </Link>

            <Link href="/customer/profile">
              <Button
                variant="ghost"
                className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 px-3 sm:px-4 text-sm sm:text-xs font-medium sm:font-bold sm:uppercase sm:tracking-widest transition-all duration-300"
              >
                <User className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Profile</span>
              </Button>
            </Link>

            <Button
              onClick={() => setIsLogoutModalOpen(true)}
              variant="ghost"
              className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-10 px-3 sm:px-4 text-sm sm:text-xs font-medium sm:font-bold sm:uppercase sm:tracking-widest transition-all duration-300"
            >
              <LogOut className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Header Section */}
      <div className="relative pt-24 sm:pt-32 pb-16 md:pb-32 px-6 overflow-hidden border-b border-white/5 min-h-[40vh] md:min-h-[60vh] flex items-center">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#64c5c3]/10 rounded-full blur-[120px] pointer-events-none -z-10" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-900/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="flex-1 w-full md:pr-8 relative z-20"
          >
            <p className="text-[#64c5c3] font-medium sm:font-bold tracking-wide sm:tracking-widest text-sm sm:text-sm mb-4 sm:uppercase flex items-center gap-3">
              <span className="w-8 sm:w-12 h-[2px] bg-[#64c5c3]"></span> Ready
              to roll
            </p>
            <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-black uppercase tracking-tight sm:tracking-tighter leading-[0.95] sm:leading-[0.85] mb-4 sm:mb-6">
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

          <motion.div
            initial={{ x: "100vw", opacity: 0, skewX: -10 }}
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
            <div className="relative w-[115%] -right-[5%]">
              <div className="relative rounded-3xl overflow-hidden border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] bg-black">
                <Image
                  src="https://images.unsplash.com/photo-1609521263047-f8f205293f24?q=80&w=1000"
                  alt="Mazda 3 Hatchback"
                  className="w-full h-[300px] object-cover opacity-90"
                  width={1200}
                  height={800}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              </div>

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Filters Area - Hidden on Mobile, Shows on Desktop */}
          <div className="hidden lg:block lg:col-span-3">
            <FleetFilters filters={filters} setFilters={setFilters} />
          </div>

          {/* Mobile Filter Button (Floating at bottom) */}
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 lg:hidden">
            <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
              <SheetTrigger asChild>
                <Button className="bg-[#161d24]/90 backdrop-blur-xl border border-[#64c5c3]/50 text-white hover:bg-[#161d24] rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.6)] px-6 h-12 text-sm font-medium tracking-wide flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-[#64c5c3]" />
                  Filters{" "}
                  {activeFiltersCount > 0 && (
                    <span className="text-[#64c5c3] font-bold">
                      ({activeFiltersCount})
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[85vh] bg-[#0a1118] border-t border-white/10 p-0 rounded-t-3xl text-white outline-none flex flex-col"
              >
                <SheetTitle className="sr-only">Filter Vehicles</SheetTitle>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                  {/* Reuse the exact same filter component */}
                  <FleetFilters filters={filters} setFilters={setFilters} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="lg:col-span-9">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <p className="text-sm font-medium text-white/80 sm:text-xs sm:font-bold sm:text-white/50 sm:uppercase sm:tracking-widest">
                {isLoading ? (
                  "Searching Fleet..."
                ) : (
                  <>
                    <span className="text-[#64c5c3] font-bold">
                      {formattedCars.length}
                    </span>{" "}
                    Vehicles Found
                  </>
                )}
              </p>
              <div className="text-sm font-medium text-white/80 sm:text-xs sm:font-bold sm:text-white/50 sm:uppercase sm:tracking-widest flex items-center gap-2">
                Sort By:{" "}
                <span className="text-white font-semibold sm:font-bold cursor-pointer hover:text-[#64c5c3] transition-colors">
                  Recommended
                </span>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                {Array.from({ length: 9 }).map((_, i) => (
                  <CarCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
                  {formattedCars.length > 0 ? (
                    formattedCars.map((car: any) => (
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
                    <div className="col-span-full text-center py-16 sm:py-24 border border-white/5 rounded-2xl bg-[#0a1118]">
                      <p className="text-gray-400 font-medium text-base sm:text-sm sm:font-bold sm:uppercase sm:tracking-widest">
                        No vehicles match your refined criteria.
                      </p>
                    </div>
                  )}
                </div>
                {/* THE INVISIBLE TRIGGER ELEMENT */}
                <div
                  ref={ref}
                  className="w-full h-24 mt-8 flex items-center justify-center"
                >
                  {isFetchingNextPage && (
                    <Loader2 className="w-8 h-8 animate-spin text-[#64c5c3]" />
                  )}
                  {!hasNextPage && allCars.length > 0 && (
                    <p className="text-sm font-medium text-white/40 sm:text-[10px] sm:font-bold sm:text-white/30 sm:uppercase sm:tracking-widest">
                      End of Inventory
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <CarDetailsSheet
        car={selectedCar}
        isOpen={isDetailsSheetOpen}
        onClose={() => setIsDetailsSheetOpen(false)}
      />

      <LogoutDialog
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
      />
    </div>
  );
}
