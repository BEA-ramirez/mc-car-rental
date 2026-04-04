"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { addDays, differenceInDays, format } from "date-fns";
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

  // Booking Engine State
  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 3),
  });
  const [withDriver, setWithDriver] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setDate({
        from: new Date(),
        to: addDays(new Date(), 3),
      });
      setWithDriver(false);
    }
  }, [isOpen, car]);

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
    if (!date?.from || !date?.to) return;

    const fromStr = date.from.toISOString();
    const toStr = date.to.toISOString();

    router.push(
      `/customer/book/${car.id}?from=${fromStr}&to=${toStr}&driver=${withDriver}`,
    );
    onClose();
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
              <div className="bg-[#64c5c3]/10 border border-[#64c5c3]/20 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3 text-[#64c5c3]">
                  <AlertCircle className="w-5 h-5" />
                  <span className="text-[10px] font-bold uppercase tracking-widest">
                    Policy Notice
                  </span>
                </div>
                <ul className="text-xs font-medium text-gray-300 space-y-2 list-disc list-inside tracking-wide">
                  <li>
                    A standard security deposit of{" "}
                    <span className="text-white font-bold">
                      ₱{securityDeposit.toLocaleString()}
                    </span>{" "}
                    applies.
                  </li>
                  <li>Logistics fees apply for out-of-hub deliveries.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: THE BOOKING ENGINE --- */}
          <div className="lg:col-span-5 p-6 md:p-10 bg-[#0a1118]/80 backdrop-blur-2xl flex flex-col justify-around h-full sticky top-0 lg:h-auto lg:min-h-full">
            <div className="flex items-end justify-between mb-8 pb-6 border-b border-white/10">
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

            <div className="mb-8 space-y-4">
              <Label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
                <CalendarDays className="w-4 h-4 text-[#64c5c3]" /> Select Dates
              </Label>

              {/* CALENDAR - Overhauled for dark/teal theme */}
              <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex justify-center shadow-inner">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="w-full max-w-70 md:max-w-none text-white font-medium"
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
                  }}
                />
              </div>

              {date?.from && date?.to && (
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex justify-between items-center mt-4">
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

            {/* Calculations */}
            <div className="space-y-4 pt-8 border-t border-white/10 mt-auto">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs font-bold text-gray-400 tracking-widest uppercase">
                  <span>
                    ₱{car.price.toLocaleString()} × {totalDays}{" "}
                    {totalDays === 1 ? "day" : "days"}
                  </span>
                  <span className="text-white">
                    ₱{baseRentalCost.toLocaleString()}
                  </span>
                </div>
                {withDriver && (
                  <div className="flex justify-between text-xs font-bold text-gray-400 tracking-widest uppercase">
                    <span>
                      Chauffeur (₱{driverDailyRate.toLocaleString()} ×{" "}
                      {totalDays})
                    </span>
                    <span className="text-[#64c5c3]">
                      ₱{driverCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between border-t border-white/10 pt-6 mb-8">
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  Total Estimate
                </p>
                <p className="text-4xl font-black text-white tracking-tighter">
                  ₱{estimatedTotal.toLocaleString()}
                </p>
              </div>

              <Button
                onClick={handleProceedToBooking}
                disabled={!date?.from || !date?.to}
                className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-xl font-black text-[11px] uppercase tracking-widest h-14 transition-all duration-300 group disabled:opacity-40 disabled:hover:bg-[#64c5c3] disabled:cursor-not-allowed shadow-[0_0_20px_rgba(100,197,195,0.2)]"
              >
                {!date?.from || !date?.to
                  ? "Select Dates"
                  : "Proceed to Checkout"}
                {date?.from && date?.to && (
                  <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                )}
              </Button>

              <div className="flex items-center gap-2 justify-center text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-6">
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
