"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { differenceInDays, format, startOfDay } from "date-fns";
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
  Palette,
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

// Make sure these paths match your folder structure exactly!
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

  // 👇 UPDATED: Changed key to driver_rate_per_12h and fallback to 600
  const driver12hRate = settings?.fees?.driver_rate_per_12h || 600;
  const securityDeposit = settings?.fees?.security_deposit_default || 5000;

  const { data: unavailableRanges, isLoading: isDatesLoading } =
    useCarUnavailableDates(car?.id);

  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [withDriver, setWithDriver] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  // Verification States
  const [isVerifying, setIsVerifying] = useState(false);
  const [missingFields, setMissingFields] = useState<string[]>([]);
  const [showVerificationWarning, setShowVerificationWarning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setActiveImageIndex(0);
      setWithDriver(false);
      setDateError(null);
      setDate(undefined);
      setShowVerificationWarning(false);
    }
  }, [isOpen, car]);

  useEffect(() => {
    if (date?.from && date?.to && unavailableRanges?.length > 0) {
      const hasOverlap = unavailableRanges.some((range: any) => {
        const bookedStart = startOfDay(new Date(range.unavailable_from));
        const bookedEnd = startOfDay(new Date(range.unavailable_to));
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

  let totalDays = 0;
  if (date?.from && date?.to) {
    totalDays = Math.abs(differenceInDays(date.to, date.from)) + 1;
  } else if (date?.from) {
    totalDays = 1;
  }

  const baseRentalCost = totalDays * (car?.price || 0);

  // 👇 UPDATED: Variable name swapped to match new 12h logic
  const driver24hRate = driver12hRate * 2;
  const estimatedDriverFee = withDriver ? totalDays * driver24hRate : 0;
  const platformTotalValue = baseRentalCost;
  const requiredDownpayment = platformTotalValue * 0.1;

  const handleProceedToBooking = async () => {
    if (!car || !date?.from || !date?.to || dateError) return;

    setIsVerifying(true);

    try {
      const status = await checkCustomerProfileStatus();

      if (!status.isComplete) {
        setMissingFields(status.missingFields);
        setShowVerificationWarning(true);
        setIsVerifying(false);
        return;
      }

      const fromStr = date.from.toISOString();
      const toStr = date.to.toISOString();
      router.push(
        `/customer/book/${car.id}?from=${fromStr}&to=${toStr}&driver=${withDriver}`,
      );
      onClose();
    } catch (error) {
      console.error("Verification error:", error);
      setIsVerifying(false);
    }
  };

  const isDateDisabled = (targetDate: Date) => {
    if (startOfDay(targetDate) < startOfDay(new Date())) return true;
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
                      Perfect for navigating the city or exploring scenic
                      routes. Meticulously maintained for your safety and
                      enjoyment.
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
                      {/* 👇 UPDATED: Explicitly state "12h Shift" so the user knows what they are paying for */}
                      <span className="text-sm font-semibold text-white ">
                        Request a Driver Service (12h Shift)
                      </span>
                      {/* 👇 UPDATED: Show the dynamic 12h price */}
                      <span className="text-xs font-medium text-gray-400">
                        ₱{driver12hRate.toLocaleString()} / 12 hrs • Paid
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
                              10% Reservation Fee
                            </p>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                              A{" "}
                              <span className="text-[#64c5c3]">
                                10% down payment
                              </span>{" "}
                              is required at checkout to instantly lock your
                              dates. This is{" "}
                              <span className="text-white">fully deducted</span>{" "}
                              from your final balance. It is strictly
                              non-refundable if cancelled.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-3 items-start">
                          <div className="bg-[#050B10] p-1.5 rounded-lg border border-white/10 shrink-0 mt-0.5">
                            <ShieldCheck className="w-4 h-4 text-[#64c5c3]" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white mb-1">
                              Refundable Security Deposit
                            </p>
                            <p className="text-sm text-gray-400 leading-relaxed font-medium">
                              A standard deposit of{" "}
                              <span className="text-white">
                                ₱{securityDeposit.toLocaleString()}
                              </span>{" "}
                              is collected upon vehicle turnover. It is{" "}
                              <span className="text-[#64c5c3]">
                                100% refundable
                              </span>{" "}
                              upon safe return.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5 p-6 md:p-10 bg-[#0a1118]/80 backdrop-blur-2xl flex flex-col justify-start h-full">
                  <div className="flex items-end justify-between mb-6 pb-6 border-b border-white/10 shrink-0">
                    <h3 className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                      Daily Rate
                    </h3>
                    <p className="text-4xl font-black text-white tracking-tighter">
                      ₱{(car.price || 0).toLocaleString()}
                      <span className="text-xs font-medium text-gray-400 uppercase tracking-widest ml-2">
                        / day
                      </span>
                    </p>
                  </div>

                  <div className="mb-8 shrink-0">
                    <div className="bg-[#64c5c3]/5 border border-[#64c5c3]/20 rounded-2xl p-5">
                      <div className="flex items-center gap-2 mb-4 text-[#64c5c3]">
                        <Sparkles className="w-4 h-4" />
                        <h3 className="text-sm font-semibold">Key Features</h3>
                      </div>

                      <div className="flex flex-wrap gap-2.5">
                        {car.features && car.features.length > 0 ? (
                          car.features.map((feat: any, idx: number) => (
                            <span
                              key={idx}
                              className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs font-medium text-gray-300"
                            >
                              {feat.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm font-medium text-gray-500 italic">
                            No special features documented.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mb-6 mt-2 space-y-4 shrink-0">
                    <Label className="text-sm font-semibold text-white flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#64c5c3]" />{" "}
                        Select Dates
                      </div>
                    </Label>

                    <div className="bg-black/40 border border-white/10 rounded-2xl p-4 flex flex-col items-center shadow-inner relative">
                      {dateError && (
                        <div className="absolute -top-12 left-0 right-0 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold p-2.5 rounded-lg flex items-center justify-center gap-2 text-center z-20">
                          <AlertCircle className="w-4 h-4" /> Overlapping dates
                          selected
                        </div>
                      )}

                      <Calendar
                        mode="range"
                        defaultMonth={new Date()}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={1}
                        disabled={isDateDisabled}
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
                          range_middle:
                            "bg-[#64c5c3]/20 text-white rounded-none",
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

                      <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-white/5 w-full justify-center">
                        <Info className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">
                          Greyed-out dates are unavailable
                        </span>
                      </div>
                    </div>

                    {date?.from && date?.to && !dateError && (
                      <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 flex justify-between items-center mt-3">
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">
                          Duration
                        </p>
                        <p className="text-sm font-semibold text-[#64c5c3]">
                          {totalDays} {totalDays === 1 ? "day" : "days"} (
                          {format(date.from, "MMM dd")} -{" "}
                          {format(date.to, "MMM dd")})
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 pt-5 border-t border-white/10 mt-auto shrink-0">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm font-medium text-gray-400">
                        <span>
                          Base Rate (₱{(car.price || 0).toLocaleString()} ×{" "}
                          {totalDays || 0} days)
                        </span>
                        <span className="text-white font-semibold">
                          ₱{baseRentalCost.toLocaleString()}
                        </span>
                      </div>

                      {withDriver && (
                        <div className="flex justify-between text-sm font-medium text-yellow-500/80">
                          <span>
                            {/* 👇 UPDATED: Changed label to reflect 12h shifts explicitly */}
                            Est. Driver Fee{" "}
                            <span className="text-xs opacity-70">
                              (12h shift/day)
                            </span>
                          </span>
                          <span className="font-semibold">
                            ₱{estimatedDriverFee.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#050B10]/50 border border-white/10 rounded-xl p-5 mb-6">
                      <div className="flex items-end justify-between mb-4 border-b border-white/5 pb-4">
                        <p className="text-sm font-medium text-gray-400">
                          Platform Rental Value
                        </p>
                        <p className="text-2xl font-bold text-white tracking-tight">
                          ₱{platformTotalValue.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-[#64c5c3]">
                          10% Required Now
                        </p>
                        <p className="text-xl font-bold text-[#64c5c3] tracking-tight">
                          ₱{requiredDownpayment.toLocaleString()}
                        </p>
                      </div>
                      <p className="text-xs text-gray-500 font-medium mt-2 text-right">
                        Balance due at pickup: ₱
                        {(platformTotalValue * 0.9).toLocaleString()}
                      </p>
                    </div>

                    <Button
                      onClick={handleProceedToBooking}
                      disabled={
                        !date?.from ||
                        !date?.to ||
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
                      ) : !date?.from || !date?.to ? (
                        "Select Dates"
                      ) : dateError ? (
                        "Invalid Dates"
                      ) : (
                        <>
                          Proceed to Checkout{" "}
                          <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform duration-300" />
                        </>
                      )}
                    </Button>

                    <div className="flex items-center gap-2 justify-center text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-4">
                      <ShieldCheck className="w-4 h-4 text-[#64c5c3]" /> Secure
                      Booking Protocol
                    </div>
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
