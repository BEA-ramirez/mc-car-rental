"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { format, startOfDay, addHours, parse } from "date-fns";
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
  Info,
  Palette,
  Clock,
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
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { useBookingSettings } from "../../../hooks/use-settings";
import { useCarUnavailableDates } from "../../../hooks/use-bookings";
import { checkCustomerProfileStatus } from "@/actions/verify-profile";

function SpecPill({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-medium text-gray-300">
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

  const { data: settings } = useBookingSettings();

  // Settings & Fixed Rates
  const driver12hRate = settings?.fees?.driver_rate_per_12h || 600;
  const fixedDownpayment = 500;

  // Car Rates
  const car24hRate = Number(car?.rental_rate_per_day || car?.price || 0);
  const raw12hRate = Number(
    car?.rental_rate_per_12h || car?.rental_rate_per_12hr || 0,
  );
  const has12hRate = raw12hRate > 0;
  const car12hRate = has12hRate ? raw12hRate : car24hRate; // Fallback

  const { data: unavailableRanges, isLoading: isDatesLoading } =
    useCarUnavailableDates(car?.id);

  // --- STRICT TIME-BASED STATE ---
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("09:00");

  const hourStep = has12hRate ? 12 : 24;
  const [bookingHours, setBookingHours] = useState<number>(24);

  const [withDriver, setWithDriver] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);
  const [partialDayWarning, setPartialDayWarning] = useState<string | null>(
    null,
  );

  // Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setWithDriver(false);
      setDateError(null);
      setPartialDayWarning(null);
      setStartDate(undefined);
      setStartTime("09:00");
      setBookingHours(24);
      setShowVerificationWarning(false);
    }
  }, [isOpen, car]);

  // Calculate Exact Start and End Timestamps
  const exactStart = startDate ? parse(startTime, "HH:mm", startDate) : null;
  const exactEnd = exactStart ? addHours(exactStart, bookingHours) : null;

  // --- EXACT TIME OVERLAP & WARNING CHECKER ---
  useEffect(() => {
    setPartialDayWarning(null);
    setDateError(null);

    if (unavailableRanges?.length > 0) {
      // 1. Partial Day Warning (Analyzes specific hours available on the selected day)
      if (startDate) {
        const targetStart = startOfDay(startDate);
        const targetEnd = addHours(targetStart, 24);

        // Find bookings that intersect with this specific day
        const dayBookings = unavailableRanges.filter((range: any) => {
          const bStart = new Date(range.unavailable_from);
          const bEnd = new Date(range.unavailable_to);
          return bStart < targetEnd && bEnd > targetStart;
        });

        if (dayBookings.length > 0) {
          const messages = dayBookings
            .map((b: any) => {
              const bStart = new Date(b.unavailable_from);
              const bEnd = new Date(b.unavailable_to);

              // If it covers the whole day, the grey-out logic handles it
              if (bStart <= targetStart && bEnd >= targetEnd) return null;

              if (
                bEnd > targetStart &&
                bEnd <= targetEnd &&
                bStart <= targetStart
              ) {
                return `available starting at ${format(bEnd, "h:mm a")}`;
              }
              if (
                bStart >= targetStart &&
                bStart < targetEnd &&
                bEnd >= targetEnd
              ) {
                return `available only until ${format(bStart, "h:mm a")}`;
              }
              if (bStart >= targetStart && bEnd <= targetEnd) {
                return `unavailable from ${format(bStart, "h:mm a")} to ${format(bEnd, "h:mm a")}`;
              }
              return null;
            })
            .filter(Boolean);

          if (messages.length > 0) {
            setPartialDayWarning(
              `Note: On this date, the unit is ${messages.join(" and ")}.`,
            );
          }
        }
      }

      // 2. Strict Overlap Validation (Prevents Checkout)
      if (exactStart && exactEnd) {
        const hasOverlap = unavailableRanges.some((range: any) => {
          const bookedStart = new Date(range.unavailable_from);
          const bookedEnd = new Date(range.unavailable_to);
          return exactStart < bookedEnd && exactEnd > bookedStart;
        });

        if (hasOverlap) {
          setDateError(
            "Your selected schedule conflicts with an existing booking. Please adjust your hours or start time.",
          );
        }
      }
    }
  }, [startDate, exactStart, exactEnd, unavailableRanges]);

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = hourStep;

    const snappedValue = Math.max(
      hourStep,
      Math.round(val / hourStep) * hourStep,
    );
    setBookingHours(snappedValue);
  };

  const formatDurationText = (hrs: number) => {
    const d = Math.floor(hrs / 24);
    const h = hrs % 24;
    if (d > 0 && h > 0) return `${d} day${d > 1 ? "s" : ""} and ${h} hrs`;
    if (d > 0) return `${d} day${d > 1 ? "s" : ""}`;
    return `${h} hrs`;
  };

  // --- PRICING ENGINE ---
  const fullDays = Math.floor(bookingHours / 24);
  const remainingHalfDays = bookingHours % 24 === 12 ? 1 : 0;

  const baseRentalCost = fullDays * car24hRate + remainingHalfDays * car12hRate;

  const driverCost = withDriver
    ? (fullDays * 2 + remainingHalfDays) * driver12hRate
    : 0;

  const platformTotalValue = baseRentalCost;

  const handleProceedToBooking = async () => {
    if (!car || !exactStart || !exactEnd || dateError) return;

    setIsVerifying(true);

    try {
      const status = await checkCustomerProfileStatus();

      if (!status.isComplete) {
        setMissingFields(status.missingFields);
        setShowVerificationWarning(true);
        setIsVerifying(false);
        return;
      }

      const fromStr = exactStart.toISOString();
      const toStr = exactEnd.toISOString();
      router.push(
        `/customer/book/${car.id}?from=${fromStr}&to=${toStr}&driver=${withDriver}&hours=${bookingHours}`,
      );
      onClose();
    } catch (error) {
      console.error("Verification error:", error);
      setIsVerifying(false);
    }
  };

  // Grey out days ONLY if the entire 24h block is covered by bookings
  const isDateDisabled = (targetDate: Date) => {
    if (startOfDay(targetDate) < startOfDay(new Date())) return true;

    const targetStart = startOfDay(targetDate);
    const targetEnd = addHours(targetStart, 24);

    if (unavailableRanges && unavailableRanges.length > 0) {
      return unavailableRanges.some((range: any) => {
        const bookedStart = new Date(range.unavailable_from);
        const bookedEnd = new Date(range.unavailable_to);
        // If a booking starts before/at 00:00 and ends after/at 23:59, the whole day is dead.
        return bookedStart <= targetStart && bookedEnd >= targetEnd;
      });
    }
    return false;
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        className="w-full sm:max-w-[85vw] lg:max-w-[1100px] p-0 border-l border-white/10 bg-[#050B10] shadow-2xl [&>button]:hidden text-white flex flex-col h-[100dvh]"
        side="right"
      >
        <SheetTitle className="sr-only">
          {car?.brand || "Car"} Details
        </SheetTitle>

        {!car ? (
          <div className="flex flex-col items-center justify-center h-full w-full">
            <Loader2 className="w-10 h-10 animate-spin text-[#64c5c3] mb-4" />
            <p className="text-gray-400 font-medium tracking-widest uppercase text-xs">
              Loading Vehicle Data...
            </p>
          </div>
        ) : (
          <>
            {showVerificationWarning && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-in fade-in">
                <div className="w-full max-w-md bg-[#0a1118]/95 backdrop-blur-xl border border-red-500/20 shadow-[0_0_40px_rgba(239,68,68,0.15)] rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center">
                  <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mb-5 border border-red-500/20">
                    <ShieldCheck className="w-7 h-7 text-red-400" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Verification Required
                  </h3>
                  <p className="text-sm text-gray-400 font-medium mb-6 leading-relaxed">
                    To ensure the safety of our fleet, you must complete your
                    profile and upload your IDs before booking. You are missing:
                  </p>
                  <div className="w-full bg-red-500/5 rounded-xl p-4 mb-8 text-left border border-red-500/10">
                    <ul className="space-y-3">
                      {missingFields.map((field, idx) => (
                        <li
                          key={idx}
                          className="flex items-center gap-3 text-sm text-red-200 font-medium"
                        >
                          <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />{" "}
                          {field}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex gap-3 w-full">
                    <Button
                      variant="ghost"
                      onClick={() => setShowVerificationWarning(false)}
                      className="flex-1 bg-transparent text-gray-300 hover:bg-white/5 hover:text-white"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        onClose();
                        router.push("/customer/profile");
                      }}
                      className="flex-1 bg-[#64c5c3] text-black hover:bg-[#52a3a1] font-bold shadow-[0_0_15px_rgba(100,197,195,0.2)]"
                    >
                      Update Profile
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-full gap-0 relative">
                {/* --- LEFT COL: CAR VISUALS --- */}
                <div className="lg:col-span-7 p-6 md:p-10 flex flex-col h-full border-r border-white/5 relative">
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

                  <div className="space-y-4 mb-10 relative z-10">
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

                  <div className="mb-8 relative z-10">
                    <p className="text-[11px] font-bold text-[#64c5c3] uppercase tracking-widest mb-2">
                      {car.brand}
                    </p>
                    <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter uppercase mb-4 leading-none">
                      {car.model}
                    </h1>
                    <p className="text-sm text-gray-400 font-medium leading-relaxed max-w-2xl">
                      Experience superior comfort and reliable capability.
                      Meticulously maintained for your safety and enjoyment.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3 mb-10 relative z-10">
                    <SpecPill
                      icon={Palette}
                      label={`${car.color || "Standard"}`}
                    />
                    <SpecPill icon={Users} label={`${car.seats} Seats`} />
                    <SpecPill icon={Settings2} label={`${car.transmission}`} />
                    <SpecPill icon={Fuel} label={`${car.fuel}`} />
                    <SpecPill icon={MapPin} label="Ormoc Hub" />
                  </div>

                  <div className="flex items-center justify-between bg-white/5 border border-white/10  p-5 rounded-2xl mb-8 transition-colors hover:border-[#64c5c3]/30 relative z-10">
                    <Label
                      htmlFor="with-driver"
                      className="flex flex-col gap-1.5 items-start cursor-pointer"
                    >
                      <span className="text-sm font-semibold text-white ">
                        Request a Driver Service
                      </span>
                      <span className="text-xs font-medium text-gray-400">
                        ₱{driver12hRate.toLocaleString()} / 12h Shift • Paid
                        directly to driver
                      </span>
                    </Label>
                    <Switch
                      id="with-driver"
                      checked={withDriver}
                      onCheckedChange={setWithDriver}
                      className="data-[state=checked]:bg-[#64c5c3]"
                    />
                  </div>

                  <div className="mt-auto pt-6 relative z-10">
                    <div className="bg-[#64c5c3]/5 border border-[#64c5c3]/20 rounded-2xl p-6">
                      <div className="flex items-center gap-2 mb-5 text-[#64c5c3]">
                        <AlertCircle className="w-5 h-5" />
                        <span className="text-sm font-semibold">
                          Important Booking Policies
                        </span>
                      </div>

                      <div className="space-y-5">
                        <div className="flex gap-3 items-start">
                          <div className="bg-[#050B10] p-1.5 rounded-lg border border-white/10 shrink-0 mt-0.5">
                            <CheckCircle2 className="w-4 h-4 text-[#64c5c3]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white mb-1">
                              Fixed Reservation Downpayment
                            </p>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                              A flat rate of{" "}
                              <span className="text-[#64c5c3]">
                                ₱{fixedDownpayment}
                              </span>{" "}
                              is required at checkout. This downpayment is{" "}
                              <span className="text-white">
                                strictly non-refundable
                              </span>{" "}
                              as it instantly locks the unit and covers the
                              opportunity cost of turning away other customers.
                              It will be{" "}
                              <span className="text-white">fully deducted</span>{" "}
                              from your final balance.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <div className="bg-[#050B10] p-1.5 rounded-lg border border-white/10 shrink-0 mt-0.5">
                            <Clock className="w-4 h-4 text-[#64c5c3]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white mb-1">
                              Flexible Extensions
                            </p>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                              Need more time? Extensions over 4 hours
                              automatically upgrade to a{" "}
                              <span className="text-white">
                                discounted 12-hour block rate
                              </span>
                              .
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- RIGHT COL: SCHEDULER & PRICING --- */}
                <div className="lg:col-span-5 p-6 md:p-10 bg-[#0a1118]/80 backdrop-blur-2xl flex flex-col justify-start h-full">
                  <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/10 shrink-0">
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                      Rental Rates
                    </h3>
                    <div className="text-right">
                      <p className="text-3xl font-black text-white tracking-tighter">
                        ₱{car24hRate.toLocaleString()}{" "}
                        <span className="text-sm font-medium text-gray-400 uppercase tracking-widest">
                          / 24h
                        </span>
                      </p>
                      {has12hRate && (
                        <p className="text-[10px] text-[#64c5c3] mt-1 font-bold tracking-widest uppercase">
                          12h Rate: ₱{car12hRate.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SCHEDULER */}
                  <div className="mb-6 space-y-4 shrink-0">
                    <Label className="text-sm font-semibold text-white flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#64c5c3]" />{" "}
                        Schedule
                      </div>
                    </Label>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center shadow-inner relative">
                      <Calendar
                        mode="range"
                        defaultMonth={new Date()}
                        selected={{
                          from: exactStart || startDate,
                          to: exactEnd || startDate,
                        }}
                        onSelect={(range, selectedDay) =>
                          setStartDate(selectedDay)
                        }
                        disabled={isDateDisabled}
                        className={cn(
                          "w-full text-white font-medium transition-opacity",
                          isDatesLoading
                            ? "opacity-50 pointer-events-none"
                            : "opacity-100",
                        )}
                        classNames={{
                          table: "w-full border-collapse space-y-1",
                          head_row: "flex w-full justify-between mt-2",
                          head_cell:
                            "text-[10px] font-bold text-gray-500 uppercase tracking-widest w-9 text-center",
                          row: "flex w-full justify-between mt-2",
                          cell: "h-9 w-9 text-center relative p-0 focus-within:relative focus-within:z-20",
                          day: "h-9 w-9 p-0 font-normal hover:bg-white/10 rounded-lg cursor-pointer flex items-center justify-center transition-colors",
                          day_selected:
                            "bg-[#64c5c3] text-black hover:bg-[#52a3a1] font-bold rounded-lg",
                          day_today:
                            "bg-white/5 text-[#64c5c3] border border-[#64c5c3]/30 rounded-lg",
                          day_range_middle:
                            "bg-[#64c5c3]/20 text-white rounded-none hover:bg-[#64c5c3]/30",
                          day_disabled:
                            "text-gray-700 opacity-50 cursor-not-allowed bg-black/50 line-through decoration-gray-600/50",
                        }}
                      />

                      <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5 w-full justify-center">
                        <Info className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                        <span className="text-[10px] font-medium text-gray-500 uppercase tracking-widest text-center">
                          Select a start date. Fully booked dates are greyed
                          out.
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-4">
                      <div className="space-y-2">
                        <Label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                          Start Time
                        </Label>
                        <Input
                          type="time"
                          value={startTime}
                          onChange={(e) => setStartTime(e.target.value)}
                          className="bg-white/5 border-white/10 text-white shadow-none focus-visible:ring-[#64c5c3]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                          Duration
                        </Label>
                        <div className="relative">
                          <Input
                            type="number"
                            min={hourStep}
                            step={hourStep}
                            value={bookingHours}
                            onChange={handleHoursChange}
                            onBlur={handleHoursChange}
                            className="bg-white/5 border-white/10 text-white shadow-none focus-visible:ring-[#64c5c3] pr-12"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-500 pointer-events-none">
                            HRS
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest mt-1">
                          = {formatDurationText(bookingHours)}
                        </p>
                      </div>
                    </div>

                    {/* THE FIX: Removed the !dateError check so the Info message always shows! */}
                    {partialDayWarning && (
                      <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-semibold p-3 rounded-lg flex items-start gap-2 mt-2">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {partialDayWarning}
                      </div>
                    )}

                    {dateError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[10px] font-semibold p-3 rounded-lg flex items-start gap-2 mt-2">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {dateError}
                      </div>
                    )}

                    {exactStart && exactEnd && !dateError && (
                      <div className="bg-white/5 border border-[#64c5c3]/30 rounded-xl p-4 flex flex-col gap-2 mt-4">
                        <p className="text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest">
                          Schedule Confirmation
                        </p>
                        <div className="flex justify-between text-xs text-white font-medium">
                          <span className="text-gray-400">Pickup:</span>
                          <span>
                            {format(exactStart, "MMM dd, yyyy - hh:mm a")}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-white font-medium">
                          <span className="text-gray-400">Return:</span>
                          <span>
                            {format(exactEnd, "MMM dd, yyyy - hh:mm a")}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-5 border-t border-white/10 mt-auto shrink-0">
                    {/* --- THE RECEIPT BREAKDOWN --- */}
                    <div className="space-y-2 mb-4 bg-white/5 rounded-xl p-4 border border-white/10">
                      <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                        Cost Breakdown
                      </p>

                      {fullDays > 0 && (
                        <div className="flex justify-between text-sm font-medium text-gray-400">
                          <span>
                            {fullDays} {fullDays === 1 ? "day" : "days"} × ₱
                            {car24hRate.toLocaleString()}
                          </span>
                          <span className="text-white font-semibold">
                            ₱{(fullDays * car24hRate).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {remainingHalfDays > 0 && (
                        <div className="flex justify-between text-sm font-medium text-gray-400">
                          <span>12 hrs × ₱{car12hRate.toLocaleString()}</span>
                          <span className="text-white font-semibold">
                            ₱{car12hRate.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between text-sm font-bold text-[#64c5c3] pt-2 border-t border-white/10 mt-2">
                        <span>Total Rental Fee</span>
                        <span>₱{baseRentalCost.toLocaleString()}</span>
                      </div>

                      {withDriver && (
                        <div className="flex justify-between text-sm font-medium text-yellow-500/80 pt-2">
                          <span>Driver Fee (Paid separately)</span>
                          <span className="font-semibold">
                            ₱{driverCost.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#050B10]/50 border border-white/10 rounded-xl p-5 mb-6">
                      <div className="flex items-end justify-between mb-4 border-b border-white/5 pb-4">
                        <p className="text-sm font-medium text-gray-400">
                          Platform Total
                        </p>
                        <p className="text-2xl font-bold text-white tracking-tight">
                          ₱{platformTotalValue.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#64c5c3]">
                          Required to Book Now
                        </p>
                        <p className="text-xl font-bold text-[#64c5c3] tracking-tight">
                          ₱{fixedDownpayment.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-2 text-right">
                        Balance due at pickup: ₱
                        {(
                          platformTotalValue - fixedDownpayment
                        ).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      onClick={handleProceedToBooking}
                      disabled={
                        !exactStart ||
                        !exactEnd ||
                        bookingHours < hourStep ||
                        isDatesLoading ||
                        !!dateError ||
                        isVerifying
                      }
                      className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-xl font-bold text-sm h-14 transition-all duration-300 group disabled:opacity-40 disabled:hover:bg-[#64c5c3] disabled:cursor-not-allowed shadow-[0_0_20px_rgba(100,197,195,0.2)] shrink-0"
                    >
                      {isVerifying ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />{" "}
                          Verifying Profile...
                        </>
                      ) : !exactStart ? (
                        "Select Start Date"
                      ) : bookingHours < hourStep ? (
                        `Minimum ${hourStep} Hours Required`
                      ) : dateError ? (
                        "Time Slot Unavailable"
                      ) : (
                        <>
                          Proceed to Checkout{" "}
                          <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
