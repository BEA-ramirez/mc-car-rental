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
    <div className="flex items-center gap-2 bg-slate-600 border border-slate-100 px-3 py-2 rounded-xl text-xs font-medium text-slate-50">
      <Icon className="w-4 h-4 text-slate-400 shrink-0" /> {label}
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
    // If they pick the SAME day for from/to, differenceInDays is 0.
    // +1 makes it 1 day.
    // If they pick 1st to 3rd, differenceInDays is 2. +1 makes it 3 days.
    totalDays = Math.abs(differenceInDays(date.to, date.from)) + 1;
  } else if (date?.from) {
    // If they only selected a start date and haven't clicked an end date yet
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
        className="w-full sm:max-w-[70vw] md:max-w-[65vw] lg:max-w-[1000px] p-0 overflow-y-auto custom-scrollbar border-none rounded-l-3xl shadow-2xl [&>button]:hidden"
        side="right"
      >
        <SheetTitle className="sr-only">
          {car.brand} {car.model} Details
        </SheetTitle>

        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full gap-0 relative">
          {/* --- LEFT SIDE: THE VEHICLE SHOWCASE --- */}
          <div className="lg:col-span-7 p-6 md:p-8 bg-white flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <SheetClose asChild>
                <button className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors">
                  <X className="w-4 h-4" /> Close
                </button>
              </SheetClose>
              <span className="text-xs font-mono text-slate-400">
                ID: {car.id}
              </span>
            </div>

            {/* THE IMAGE GALLERY */}
            <div className="space-y-3 mb-8">
              {/* Main Image */}
              <div className="relative aspect-[16/10] w-full rounded-3xl overflow-hidden border border-slate-100 shadow-sm transition-all bg-slate-50 flex items-center justify-center">
                <Image
                  src={
                    car.images?.[activeImageIndex] ||
                    "https://placehold.co/600x400?text=No+Image"
                  }
                  alt={`${car.brand} ${car.model}`}
                  fill
                  sizes="(max-width: 1000px) 100vw, 60vw"
                  className="object-contain transition-opacity duration-300 p-2"
                />
                <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full text-sm font-bold text-slate-800 shadow-md z-10">
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
                        "relative w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition-all bg-slate-50",
                        activeImageIndex === idx
                          ? "border-blue-600 opacity-100"
                          : "border-transparent opacity-60 hover:opacity-100",
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
            <div className="mb-6">
              <p className="text-sm font-medium text-slate-500 mb-1.5">
                {car.brand}
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tighter mb-4">
                {car.model}
              </h1>
              <p className="text-sm text-slate-600 leading-relaxed max-w-2xl">
                Experience superior comfort and rugged capability. Perfect for
                navigating Ormoc City or exploring the scenic routes of Leyte.
                Meticulously maintained for your safety and enjoyment.
              </p>
            </div>

            {/* Spec Pills */}
            <div className="flex flex-wrap gap-2.5 mb-8">
              <SpecPill icon={Users} label={`${car.seats} Adult Seats`} />
              <SpecPill icon={Settings2} label={`${car.transmission}`} />
              <SpecPill icon={Fuel} label={`${car.fuel}`} />
              <SpecPill icon={MapPin} label=" Ormoc Hub pickup" />
            </div>

            {/* Self-Drive / Driver Toggle */}
            <div className="flex items-center justify-between bg-white border border-slate-100 p-4 rounded-xl shadow-sm mb-6">
              <Label
                htmlFor="with-driver"
                className="flex flex-col gap-0.5 cursor-pointer"
              >
                <span className="text-sm font-bold text-slate-900">
                  Request a Driver
                </span>
                <span className="text-xs text-slate-500">
                  + ₱{driverDailyRate.toLocaleString()} / day fee
                </span>
              </Label>
              <Switch
                id="with-driver"
                checked={withDriver}
                onCheckedChange={setWithDriver}
              />
            </div>

            {/* MOVED HERE TO BALANCE HEIGHT: Important Info Box */}
            <div className="mt-auto pt-6">
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3 text-amber-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-xs font-bold uppercase tracking-widest">
                    Important Info
                  </span>
                </div>
                <ul className="text-xs text-amber-700 space-y-2 list-disc list-inside">
                  <li>
                    A standard security deposit of{" "}
                    <strong>₱{securityDeposit.toLocaleString()}</strong>{" "}
                    applies.
                  </li>
                  <li>
                    Delivery & Pickup fees apply for locations outside the main
                    hub.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: THE BOOKING ENGINE --- */}
          <div className="lg:col-span-5 p-6 md:p-8 bg-slate-50 border-l border-slate-100 flex flex-col justify-around h-full sticky top-0 lg:h-auto lg:min-h-full">
            <div className="flex items-end justify-between mb-8 pb-4 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                Rate
              </h3>
              <p className="text-4xl font-black font-mono text-slate-800 tracking-tight">
                ₱{car.price.toLocaleString()}
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1.5">
                  / day
                </span>
              </p>
            </div>

            <div className="mb-6 space-y-3">
              <Label className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <CalendarDays className="w-3.5 h-3.5" /> Select Rental Dates
              </Label>

              {/* CALENDAR */}
              <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex justify-center">
                <Calendar
                  mode="range"
                  defaultMonth={date?.from}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                  disabled={(date) =>
                    date < new Date(new Date().setHours(0, 0, 0, 0))
                  }
                  className="w-full max-w-70 md:max-w-none"
                  classNames={{
                    day_selected:
                      "bg-blue-600 text-white hover:bg-blue-600 hover:text-white focus:bg-blue-600 focus:text-white",

                    day_today: "bg-slate-100 text-slate-900",

                    day_range_middle: "bg-blue-50 text-blue-900 rounded-none",
                  }}
                />
              </div>

              {date?.from && date?.to && (
                <p className="text-xs font-medium text-slate-500 text-center mt-2">
                  {totalDays} {totalDays === 1 ? "day" : "days"} selected:{" "}
                  {format(date.from, "MMM dd")} to {format(date.to, "MMM dd")}
                </p>
              )}
            </div>

            <div className="space-y-5 pt-6 border-t border-slate-200 mt-2">
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm text-slate-600">
                  <span>
                    ₱{car.price.toLocaleString()} x {totalDays}{" "}
                    {totalDays === 1 ? "day" : "days"}
                  </span>
                  <span className="font-medium">
                    ₱{baseRentalCost.toLocaleString()}
                  </span>
                </div>
                {withDriver && (
                  <div className="flex justify-between text-sm text-slate-600">
                    <span>
                      Driver Fee (₱{driverDailyRate.toLocaleString()} x{" "}
                      {totalDays})
                    </span>
                    <span className="font-medium">
                      ₱{driverCost.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-end justify-between border-t border-slate-100 pt-4">
                <p className="text-sm font-bold text-slate-700">
                  Estimated Total
                </p>
                <p className="text-3xl font-black font-mono text-slate-900">
                  ₱{estimatedTotal.toLocaleString()}
                </p>
              </div>

              <Button
                onClick={handleProceedToBooking}
                disabled={!date?.from || !date?.to}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold h-12 shadow-md group disabled:opacity-50"
              >
                Setup Booking Details
                <span className="ml-2 group-hover:translate-x-1 transition-transform">
                  →
                </span>
              </Button>

              <div className="flex items-center gap-2 justify-center text-xs text-emerald-700 font-medium">
                <ShieldCheck className="w-4 h-4" /> 100% Secure Transaction
              </div>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
