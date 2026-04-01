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
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-sm text-[10px] font-medium tracking-wide text-slate-300">
      <Icon className="w-3 h-3 text-slate-500 shrink-0" /> {label}
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
        className="w-full sm:max-w-[70vw] md:max-w-[65vw] lg:max-w-[1000px] p-0 overflow-y-auto custom-scrollbar border-l border-white/10 bg-[#0A0C10] shadow-2xl [&>button]:hidden"
        side="right"
      >
        <SheetTitle className="sr-only">
          {car.brand} {car.model} Details
        </SheetTitle>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full gap-0 relative">
          {/* --- LEFT SIDE: THE VEHICLE SHOWCASE --- */}
          <div className="lg:col-span-7 p-6 md:p-10 flex flex-col h-full border-r border-white/5">
            <div className="flex items-center justify-between mb-10">
              <SheetClose asChild>
                <button className="flex items-center gap-2 text-[9px] font-medium uppercase tracking-[0.2em] text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" /> Close Inspection
                </button>
              </SheetClose>
              <span className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-600">
                Asset ID: {car.id}
              </span>
            </div>

            {/* THE IMAGE GALLERY */}
            <div className="space-y-4 mb-10">
              {/* Main Image - Cinematic Styling */}
              <div className="relative aspect-[16/10] w-full rounded-sm overflow-hidden border border-white/5 bg-[#050608] flex items-center justify-center group">
                <Image
                  src={
                    car.images?.[activeImageIndex] ||
                    "https://placehold.co/1200x800?text=No+Image"
                  }
                  alt={`${car.brand} ${car.model}`}
                  fill
                  sizes="(max-width: 1000px) 100vw, 60vw"
                  className="object-cover opacity-80 mix-blend-luminosity group-hover:mix-blend-normal group-hover:scale-105 transition-all duration-1000 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0C10]/80 via-transparent to-transparent opacity-60" />
                <div className="absolute top-4 left-4 bg-white/10 backdrop-blur-md border border-white/10 px-3 py-1 rounded-sm text-[9px] font-medium tracking-[0.2em] uppercase text-white shadow-md z-10">
                  {car.year} Model
                </div>
              </div>

              {/* Thumbnails */}
              {(car.images?.length || 0) > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
                  {car.images.map((img: string, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={cn(
                        "relative w-20 h-14 rounded-sm overflow-hidden shrink-0 border transition-all bg-[#050608]",
                        activeImageIndex === idx
                          ? "border-blue-500 opacity-100 mix-blend-normal"
                          : "border-white/10 opacity-50 mix-blend-luminosity hover:opacity-100 hover:mix-blend-normal hover:border-white/30",
                      )}
                    >
                      <Image
                        src={img}
                        fill
                        sizes="80px"
                        className="object-cover"
                        alt={`Thumbnail ${idx + 1}`}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Title & Description */}
            <div className="mb-8">
              <p className="text-[10px] font-medium text-blue-500 uppercase tracking-[0.4em] mb-2">
                {car.brand}
              </p>
              <h1 className="text-4xl md:text-5xl font-light text-white tracking-tighter mb-6 leading-tight">
                {car.model}
              </h1>
              <p className="text-sm text-slate-400 font-light leading-relaxed max-w-2xl">
                Experience superior comfort and rugged capability. Perfect for
                navigating Ormoc City or exploring the scenic routes of Leyte.
                Meticulously maintained for your safety and enjoyment.
              </p>
            </div>

            {/* Spec Pills */}
            <div className="flex flex-wrap gap-2.5 mb-10">
              <SpecPill icon={Users} label={`${car.seats} Adult Seats`} />
              <SpecPill icon={Settings2} label={`${car.transmission}`} />
              <SpecPill icon={Fuel} label={`${car.fuel}`} />
              <SpecPill icon={MapPin} label="Ormoc Hub pickup" />
            </div>

            {/* Self-Drive / Driver Toggle */}
            <div className="flex items-center justify-between bg-white/[0.02] border border-white/5 p-5 rounded-sm mb-6 transition-colors hover:bg-white/5">
              <Label
                htmlFor="with-driver"
                className="flex flex-col gap-1 cursor-pointer"
              >
                <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white">
                  Chauffeur Service
                </span>
                <span className="text-[10px] text-slate-500 tracking-wider">
                  + ₱{driverDailyRate.toLocaleString()} / day
                </span>
              </Label>
              <Switch
                id="with-driver"
                checked={withDriver}
                onCheckedChange={setWithDriver}
              />
            </div>

            {/* Important Info Box */}
            <div className="mt-auto pt-6">
              <div className="bg-blue-900/10 border border-blue-500/20 rounded-sm p-5">
                <div className="flex items-center gap-2 mb-3 text-blue-400">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-[9px] font-medium uppercase tracking-[0.3em]">
                    Policy Notice
                  </span>
                </div>
                <ul className="text-xs font-light text-slate-400 space-y-2 list-disc list-inside tracking-wide">
                  <li>
                    A standard security deposit of{" "}
                    <span className="text-white font-medium">
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
          <div className="lg:col-span-5 p-6 md:p-10 bg-[#111623]/40 backdrop-blur-2xl flex flex-col justify-around h-full sticky top-0 lg:h-auto lg:min-h-full">
            <div className="flex items-end justify-between mb-10 pb-6 border-b border-white/5">
              <h3 className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.3em]">
                Standard Rate
              </h3>
              <p className="text-3xl font-light text-white tracking-tight">
                ₱{car.price.toLocaleString()}
                <span className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em] ml-2">
                  / day
                </span>
              </p>
            </div>

            <div className="mb-8 space-y-4">
              <Label className="text-[9px] font-medium text-slate-400 uppercase tracking-[0.3em] flex items-center gap-2 mb-4">
                <CalendarDays className="w-3.5 h-3.5 text-blue-500" /> Select
                Itinerary
              </Label>

              {/* CALENDAR */}
              <div className="bg-[#050608] border border-white/10 rounded-sm p-3 flex justify-center shadow-inner">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="w-full max-w-70 md:max-w-none text-slate-300 font-light"
                  classNames={{
                    // OVERRIDE: Stealth Wealth custom styling applied ONLY here
                    day_selected:
                      "bg-white text-[#050608] hover:bg-slate-200 hover:text-[#050608] focus:bg-white focus:text-[#050608] rounded-sm font-medium transition-colors",
                    day_today:
                      "bg-white/5 text-white border border-white/20 rounded-sm",
                    day_range_middle:
                      "bg-white/10 text-white rounded-none hover:bg-white/20 hover:text-white",
                    range_middle: "bg-white/10 text-white rounded-none",
                    head_cell:
                      "text-[10px] font-medium text-slate-500 uppercase tracking-widest",
                    nav_button_previous:
                      "hover:bg-white/10 rounded-sm text-slate-400 transition-colors",
                    nav_button_next:
                      "hover:bg-white/10 rounded-sm text-slate-400 transition-colors",
                    day: "h-9 w-9 text-center text-sm p-0 hover:bg-white/10 hover:text-white rounded-sm transition-colors cursor-pointer",
                    caption_label:
                      "text-sm font-medium text-white tracking-wide",
                  }}
                />
              </div>

              {date?.from && date?.to && (
                <p className="text-[10px] font-medium text-blue-400 text-center mt-4 tracking-widest uppercase">
                  {totalDays} {totalDays === 1 ? "day" : "days"} selected:{" "}
                  <span className="text-white ml-1">
                    {format(date.from, "MMM dd")} - {format(date.to, "MMM dd")}
                  </span>
                </p>
              )}
            </div>

            {/* Calculations */}
            <div className="space-y-4 pt-8 border-t border-white/5 mt-auto">
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-xs font-light text-slate-400 tracking-wide">
                  <span>
                    ₱{car.price.toLocaleString()} × {totalDays}{" "}
                    {totalDays === 1 ? "day" : "days"}
                  </span>
                  <span className="text-white font-medium">
                    ₱{baseRentalCost.toLocaleString()}
                  </span>
                </div>
                {withDriver && (
                  <div className="flex justify-between text-xs font-light text-slate-400 tracking-wide">
                    <span>
                      Chauffeur (₱{driverDailyRate.toLocaleString()} ×{" "}
                      {totalDays})
                    </span>
                    <span className="text-white font-medium">
                      ₱{driverCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between border-t border-white/5 pt-6 mb-8">
                <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                  Total Estimate
                </p>
                <p className="text-3xl font-light text-white tracking-tight">
                  ₱{estimatedTotal.toLocaleString()}
                </p>
              </div>

              <Button
                onClick={handleProceedToBooking}
                disabled={!date?.from || !date?.to}
                className="w-full bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-none font-bold text-[10px] uppercase tracking-[0.3em] h-14 transition-all duration-500 group disabled:opacity-30 disabled:hover:bg-white disabled:hover:text-[#0A0C10]"
              >
                {!date?.from || !date?.to
                  ? "Select Dates"
                  : "Proceed to Checkout"}
                {date?.from && date?.to && (
                  <ArrowRight className="w-4 h-4 ml-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                )}
              </Button>

              <div className="flex items-center gap-2 justify-center text-[9px] text-slate-500 font-medium uppercase tracking-widest mt-6">
                <ShieldCheck className="w-3 h-3 text-slate-400" /> Secure
                Protocol
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
