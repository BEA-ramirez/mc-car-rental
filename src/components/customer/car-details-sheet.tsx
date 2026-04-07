"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  addDays,
  differenceInDays,
  format,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import { DateRange } from "react-day-picker";
import {
  X,
  Users,
  Settings2,
  Fuel,
  MapPin,
  CalendarDays,
  ShieldCheck,
  AlertCircle,
  ArrowRight,
  Loader2,
  CheckCircle2,
  Sparkles,
  Info,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

// Import your settings hook to get real fees
import { useBookingSettings } from "../../../hooks/use-settings";
import { useCarUnavailableDates } from "../../../hooks/use-bookings"; // Adjust path

function SpecPill({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wider text-gray-300">
      <Icon className="w-4 h-4 text-[#64c5c3] shrink-0" /> {label}
    </div>
  );
}

interface CarDetailsSheetProps {
  car: any | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CarDetailsSheet({
  car,
  isOpen,
  onClose,
}: CarDetailsSheetProps) {
  const router = useRouter();
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Fetch real global settings for accurate calculations
  const { data: settings } = useBookingSettings();
  const driverDailyRate = settings?.fees?.driver_rate_per_day || 1500;
  const securityDeposit = settings?.fees?.security_deposit_default || 5000;

  // Fetch Unavailable Dates
  const { data: unavailableRanges, isLoading: isDatesLoading } =
    useCarUnavailableDates(car?.id);

  // Booking Engine State
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [withDriver, setWithDriver] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setWithDriver(false);
      setDateError(null);
      // We don't auto-set dates anymore to force the user to pick available ones
      setDate(undefined);
    }
  }, [isOpen, car]);

  // Validate the selected range against booked dates
  useEffect(() => {
    if (
      date?.from &&
      date?.to &&
      unavailableRanges &&
      unavailableRanges.length > 0
    ) {
      // Check if any unavailable date falls between the selected from and to dates
      const hasOverlap = unavailableRanges.some((range: any) => {
        const bookedStart = startOfDay(new Date(range.unavailable_from));
        const bookedEnd = startOfDay(new Date(range.unavailable_to));

        // If the selected start is before the booked end AND the selected end is after the booked start, they overlap
        return date.from! <= bookedEnd && date.to! >= bookedStart;
      });

      if (hasOverlap) {
        setDateError(
          "Your selected range overlaps with an existing booking. Please select different dates.",
        );
      } else {
        setDateError(null);
      }
    } else {
      setDateError(null);
    }
  }, [date, unavailableRanges]);

  if (!car) return null;

  // Live Calculator Logic
  let totalDays = 0;
  if (date?.from && date?.to) {
    totalDays = Math.abs(differenceInDays(date.to, date.from)) + 1;
  } else if (date?.from) {
    totalDays = 1;
  }

  const baseRentalCost = totalDays * car.price;
  const driverCost = withDriver ? totalDays * driverDailyRate : 0;
  const estimatedTotal = baseRentalCost + driverCost;

  const handleProceedToBooking = () => {
    if (!date?.from || !date?.to || dateError) return;

    const fromStr = date.from.toISOString();
    const toStr = date.to.toISOString();

    router.push(
      `/customer/book/${car.id}?from=${fromStr}&to=${toStr}&driver=${withDriver}`,
    );
    onClose();
  };

  // Helper to check if a specific day should be disabled
  const isDateDisabled = (targetDate: Date) => {
    // 1. Block past dates
    if (startOfDay(targetDate) < startOfDay(new Date())) return true;

    // 2. Block dates that are already booked (including the buffer)
    if (unavailableRanges && unavailableRanges.length > 0) {
      return unavailableRanges.some((range: any) => {
        const bookedStart = startOfDay(new Date(range.unavailable_from));
        const bookedEnd = startOfDay(new Date(range.unavailable_to));
        const current = startOfDay(targetDate);
        return current >= bookedStart && current <= bookedEnd;
      });
    }

    return false;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="w-full sm:max-w-[85vw] lg:max-w-[1100px] p-0 overflow-y-auto custom-scrollbar border-l border-white/10 bg-[#050B10] shadow-2xl [&>button]:hidden text-white"
        side="right"
      >
        <SheetTitle className="sr-only">
          {car.brand} {car.model} Details
        </SheetTitle>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full gap-0 relative">
          {/* --- LEFT SIDE: THE VEHICLE SHOWCASE --- */}
          <div className="lg:col-span-7 p-6 md:p-10 flex flex-col h-full border-r border-white/5 relative">
            {/* Subtle Background Glow */}
            <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-[#64c5c3]/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <div className="flex items-center justify-between mb-8 relative z-10">
              <SheetClose asChild>
                <button className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-[#64c5c3] transition-colors bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/5">
                  <X className="w-4 h-4" /> Close
                </button>
              </SheetClose>
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500 bg-black/40 px-3 py-1.5 rounded-full border border-white/5">
                ID: {car.id}
              </span>
            </div>

            {/* THE IMAGE GALLERY */}
            <div className="space-y-4 mb-10 relative z-10">
              {/* Main Image */}
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden border border-white/10 bg-[#0a1118] flex items-center justify-center group shadow-2xl">
                <Image
                  src={
                    car.images?.[activeImageIndex] ||
                    "https://placehold.co/1200x800?text=No+Image"
                  }
                  alt={`${car.brand} ${car.model}`}
                  fill
                  sizes="(max-width: 1000px) 100vw, 60vw"
                  className="object-cover opacity-90 group-hover:scale-105 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#050B10] via-transparent to-transparent opacity-80" />
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase text-white shadow-md z-10">
                  {car.year} Model
                </div>
              </div>

              {/* Thumbnails */}
              {(car.images?.length || 0) > 1 && (
                <div className="flex gap-3 overflow-x-auto pb-2 custom-scrollbar">
                  {car.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={cn(
                        "relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all bg-[#0a1118]",
                        activeImageIndex === idx
                          ? "border-[#64c5c3] opacity-100 shadow-[0_0_15px_rgba(100,197,195,0.3)]"
                          : "border-white/5 opacity-50 hover:opacity-100 hover:border-white/30",
                      )}
                    >
                      <Image
                        src={img}
                        fill
                        sizes="96px"
                        className="object-cover"
                        alt={`Thumbnail ${idx + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Title & Description */}
            <div className="mb-8 relative z-10">
              <p className="text-[11px] font-bold text-[#64c5c3] uppercase tracking-widest mb-2">
                {car.brand}
              </p>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4 leading-none">
                {car.model}
              </h1>
              <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-2xl">
                Experience superior comfort and reliable capability. Perfect for
                navigating the city or exploring scenic routes. Meticulously
                maintained for your safety and enjoyment.
              </p>
            </div>

            {/* Spec Pills */}
            <div className="flex flex-wrap gap-3 mb-10 relative z-10">
              <SpecPill icon={Users} label={`${car.seats} Seats`} />
              <SpecPill icon={Settings2} label={`${car.transmission}`} />
              <SpecPill icon={Fuel} label={`${car.fuel}`} />
              <SpecPill icon={MapPin} label="Ormoc Hub" />
            </div>

            {/* Self-Drive / Driver Toggle */}
            <div className="flex items-center justify-between bg-white/5 border border-white/10 p-5 rounded-2xl mb-6 transition-colors hover:border-[#64c5c3]/30 relative z-10">
              <Label
                htmlFor="with-driver"
                className="flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-sm font-bold uppercase tracking-wider text-white">
                  Chauffeur Service
                </span>
                <span className="text-[10px] font-bold text-[#64c5c3] tracking-widest uppercase">
                  + ₱{driverDailyRate.toLocaleString()} / day
                </span>
              </Label>
              <Switch
                id="with-driver"
                checked={withDriver}
                onCheckedChange={setWithDriver}
                className="data-[state=checked]:bg-[#64c5c3]"
              />
            </div>

            {/* Important Info Box */}
            <div className="mt-auto pt-6 relative z-10">
              <div className="bg-[#64c5c3]/10 border border-[#64c5c3]/30 rounded-2xl p-5 shadow-[0_0_15px_rgba(100,197,195,0.15)]">
                <div className="flex items-center gap-2 mb-5 text-[#64c5c3]">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">
                    Important Booking Policies
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Reservation Fee Policy */}
                  <div className="flex gap-3 items-start">
                    <div className="bg-[#050B10] p-1.5 rounded-lg border border-white/10 shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#64c5c3]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">
                        10% Reservation Fee
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        A{" "}
                        <span className="text-[#64c5c3] font-bold">
                          10% down payment
                        </span>{" "}
                        is required at checkout to instantly lock your dates.
                        This is{" "}
                        <span className="text-white font-bold">
                          fully deducted
                        </span>{" "}
                        from your final balance. It is strictly{" "}
                        <span className="text-white font-bold">
                          non-refundable
                        </span>{" "}
                        if cancelled, as it covers the opportunity cost of
                        turning away other customers for your reserved dates.
                      </p>
                    </div>
                  </div>

                  {/* Security Deposit Policy */}
                  <div className="flex gap-3 items-start">
                    <div className="bg-[#050B10] p-1.5 rounded-lg border border-white/10 shrink-0 mt-0.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#64c5c3]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">
                        Refundable Security Deposit
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        A standard deposit of{" "}
                        <span className="text-white font-bold">
                          ₱{securityDeposit.toLocaleString()}
                        </span>{" "}
                        is collected upon vehicle turnover. It is{" "}
                        <span className="text-[#64c5c3] font-bold">
                          100% refundable
                        </span>{" "}
                        upon the safe, timely, and damage-free return of the
                        vehicle.
                      </p>
                    </div>
                  </div>

                  {/* Logistics Policy */}
                  <div className="flex gap-3 items-start">
                    <div className="bg-[#050B10] p-1.5 rounded-lg border border-white/10 shrink-0 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#64c5c3]" />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-white uppercase tracking-wider mb-1">
                        Logistics & Delivery
                      </p>
                      <p className="text-xs text-gray-400 leading-relaxed font-medium">
                        Pickups at our main Ormoc hub are completely free.
                        Additional logistics fees will apply for out-of-hub
                        deliveries or airport handovers.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: THE BOOKING ENGINE --- */}
          <div className="lg:col-span-5 p-6 md:p-10 bg-[#0a1118]/80 backdrop-blur-2xl flex flex-col justify-start overflow-y-auto custom-scrollbar h-full sticky top-0 lg:h-auto lg:min-h-full">
            <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/10 shrink-0">
              <h3 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                Daily Rate
              </h3>
              <p className="text-4xl font-black text-white tracking-tighter">
                ₱{car.price.toLocaleString()}
                <span className="text-[12px] font-bold text-gray-500 uppercase tracking-widest ml-2">
                  / day
                </span>
              </p>
            </div>

            {/* --- NEW: INSTALLED FEATURES --- */}
            {/* --- NEW: INSTALLED FEATURES (GLOWING BOX) --- */}
            <div className="mb-8 shrink-0 ">
              <div className="h-[250px] bg-[#64c5c3]/10 border border-[#64c5c3]/30 rounded-2xl p-5 shadow-[0_0_15px_rgba(100,197,195,0.15)]">
                <div className="flex items-center gap-2 mb-4 text-[#64c5c3]">
                  <Sparkles className="w-4 h-4" />
                  <h3 className="text-[11px] font-black uppercase tracking-widest">
                    Key Features
                  </h3>
                </div>

                <div className="flex flex-wrap gap-2.5 overflow-hidden custom-scrollbar max-h-full">
                  {car.features && car.features.length > 0 ? (
                    car.features.map((feat: any, idx: number) => (
                      <span
                        key={idx}
                        className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg text-[10px] font-medium tracking-wide text-white shadow-sm"
                      >
                        {feat.name}
                      </span>
                    ))
                  ) : (
                    <span className="text-[10px] font-medium text-[#64c5c3]/70 italic">
                      No special features documented.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* --- CALENDAR SECTION --- */}
            <div className="mb-6 mt-2 space-y-4 shrink-0">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-[#64c5c3]" /> Select
                  Dates
                </div>
                {isDatesLoading && (
                  <span className="flex items-center gap-1.5 text-gray-500 normal-case">
                    <Loader2 className="w-3 h-3 animate-spin" /> Checking
                    availability
                  </span>
                )}
              </Label>

              {/* CALENDAR */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4  flex flex-col items-center shadow-inner relative">
                {/* Visual feedback if they select an overlapping range */}
                {dateError && (
                  <div className="absolute -top-12 left-0 right-0 bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-bold uppercase tracking-widest p-2 rounded-lg flex items-center justify-center gap-2 text-center z-20">
                    <AlertCircle className="w-3.5 h-3.5" />
                    Overlapping dates selected
                  </div>
                )}

                <Calendar
                  mode="range"
                  defaultMonth={new Date()}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                  disabled={isDateDisabled} // Use our new disabled logic
                  className={cn(
                    "w-full max-w-70 md:max-w-none text-white font-medium transition-opacity",
                    isDatesLoading
                      ? "opacity-50 pointer-events-none"
                      : "opacity-100",
                  )}
                  classNames={{
                    day_selected:
                      "bg-[#64c5c3] text-black hover:bg-[#52a3a1] hover:text-black focus:bg-[#64c5c3] focus:text-black rounded-lg font-bold transition-colors",
                    day_today:
                      "bg-white/5 text-[#64c5c3] border border-[#64c5c3]/30 rounded-lg",
                    day_range_middle:
                      "bg-[#64c5c3]/20 text-white rounded-none hover:bg-[#64c5c3]/30",
                    range_middle: "bg-[#64c5c3]/20 text-white rounded-none",
                    head_cell:
                      "text-[10px] font-bold text-gray-500 uppercase tracking-widest",
                    nav_button_previous:
                      "hover:bg-white/10 rounded-lg text-gray-400 transition-colors",
                    nav_button_next:
                      "hover:bg-white/10 rounded-lg text-gray-400 transition-colors",
                    day: "h-10 w-10 text-center text-sm p-0 hover:bg-white/10 hover:text-white rounded-lg transition-colors cursor-pointer",
                    caption_label:
                      "text-sm font-bold text-white tracking-wider uppercase",
                    day_disabled:
                      "text-gray-700 opacity-50 cursor-not-allowed bg-black/50 line-through decoration-gray-600/50",
                  }}
                />

                {/* --- NEW: INFO TEXT --- */}
                <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5 w-full justify-center">
                  <Info className="w-3 h-3 text-[#64c5c3]/70" />
                  <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    Greyed-out dates are unavailable
                  </span>
                </div>
              </div>

              {date?.from && date?.to && !dateError && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center mt-3">
                  <p className="text-[10px] font-bold text-gray-400 tracking-widest uppercase">
                    Duration
                  </p>
                  <p className="text-[11px] font-bold text-[#64c5c3] tracking-widest uppercase">
                    {totalDays} {totalDays === 1 ? "day" : "days"} (
                    {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")})
                  </p>
                </div>
              )}
            </div>

            {/* Calculations - Pushed to bottom using mt-auto */}
            <div className="space-y-4 pt-4 border-t border-white/10 mt-auto shrink-0">
              <div className="space-y-3 mb-4">
                <div className="flex justify-between text-xs font-bold text-gray-400 tracking-widest uppercase">
                  <span>
                    Base Rate (₱{car.price.toLocaleString()} × {totalDays || 0})
                  </span>
                  <span className="text-white">
                    ₱{baseRentalCost.toLocaleString()}
                  </span>
                </div>
                {withDriver && (
                  <div className="flex justify-between text-xs font-bold text-gray-400 tracking-widest uppercase">
                    <span>
                      Chauffeur (₱{driverDailyRate.toLocaleString()} ×{" "}
                      {totalDays || 0})
                    </span>
                    <span className="text-[#64c5c3]">
                      ₱{driverCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Enhanced Financial Breakdown to highlight Reservation Fee */}
              <div className="bg-[#050B10] border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-end justify-between mb-3 border-b border-white/10 pb-3">
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Total Booking Value
                  </p>
                  <p className="text-lg font-black text-white tracking-tighter">
                    ₱{estimatedTotal.toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest">
                    10% Required Now
                  </p>
                  <p className="text-lg font-black text-[#64c5c3] tracking-tighter">
                    ₱{(estimatedTotal * 0.1).toLocaleString()}
                  </p>
                </div>
                <p className="text-[9px] text-gray-500 font-medium tracking-wide mt-1.5 text-right">
                  Balance due at pickup: ₱
                  {(estimatedTotal * 0.9).toLocaleString()}
                </p>
              </div>

              <Button
                onClick={handleProceedToBooking}
                disabled={
                  !date?.from || !date?.to || isDatesLoading || !!dateError
                }
                className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-xl font-black text-[11px] uppercase tracking-widest h-14 transition-all duration-300 group disabled:opacity-40 disabled:hover:bg-[#64c5c3] disabled:cursor-not-allowed shadow-[0_0_20px_rgba(100,197,195,0.2)] shrink-0"
              >
                {!date?.from || !date?.to
                  ? "Select Dates"
                  : dateError
                    ? "Invalid Dates"
                    : "Proceed to Checkout"}
                {date?.from && date?.to && !dateError && (
                  <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                )}
              </Button>

              <div className="flex items-center gap-2 justify-center text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-4">
                <ShieldCheck className="w-4 h-4 text-[#64c5c3]" /> Secure
                Booking Protocol
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
