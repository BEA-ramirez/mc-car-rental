"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { format, differenceInDays } from "date-fns";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  CalendarDays,
  Clock,
  ShieldCheck,
  Smartphone,
  Landmark,
  Banknote,
  Car,
  ArrowRight,
  CheckCircle2,
  FileText,
  AlertCircle,
  UserCheck,
  CreditCard,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

import OrmocMapSelector, { MapHub } from "@/components/ormoc-map";
import ReceiptScanner from "@/components/bookings/receipt-scanner";

import { useBookingSettings } from "../../../../../hooks/use-settings";
import { useUnits } from "../../../../../hooks/use-units";
import { useBookings } from "../../../../../hooks/use-bookings";
import { useAvailableDrivers } from "../../../../../hooks/use-bookings";
import { createClient } from "@/utils/supabase/client";
import { uploadFile } from "@/actions/helper/upload-file";

export default function CustomerBookingPage({
  params,
}: {
  params: Promise<{ carId: string }>;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { carId } = use(params);

  const { submitCustomerBooking, isSubmittingCustomerBooking } = useBookings();
  const { data: settings, isLoading: isSettingsLoading } = useBookingSettings();
  const { unit, isLoadingUnit } = useUnits(carId);

  const realHubs: MapHub[] = useMemo(() => settings?.hubs || [], [settings]);
  const realFees = useMemo(
    () =>
      settings?.fees || {
        driver_rate_per_day: 1500,
        custom_pickup_fee: 500,
        custom_dropoff_fee: 500,
        security_deposit_default: 5000,
      },
    [settings],
  );

  const car = useMemo(() => {
    if (!unit) return null;
    const sortedImages = [...(unit.images || [])].sort((a: any, b: any) => {
      if (a.is_primary && !b.is_primary) return -1;
      if (!a.is_primary && b.is_primary) return 1;
      return 0;
    });
    return {
      id: unit.car_id,
      brand: unit.brand,
      model: unit.model,
      price: Number(unit.rental_rate_per_day) || 0,
      price12h: Number(unit.rental_rate_per_12h) || 0, // <-- NEW 12H RATE
      image:
        sortedImages.length > 0
          ? sortedImages[0].image_url
          : "https://placehold.co/1200x800?text=No+Image",
    };
  }, [unit]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [time, setTime] = useState("09:00");
  const [withDriver, setWithDriver] = useState(false);
  const [pickupType, setPickupType] = useState<"hub" | "custom">("hub");
  const [pickupLocation, setPickupLocation] = useState("");
  const [pickupCoords, setPickupCoords] = useState<string | null>(null);
  const [dropoffType, setDropoffType] = useState<"hub" | "custom">("hub");
  const [dropoffLocation, setDropoffLocation] = useState("");
  const [dropoffCoords, setDropoffCoords] = useState<string | null>(null);

  // --- PROMO STATE ---
  const [is12HourPromo, setIs12HourPromo] = useState(false);

  const [mapOpen, setMapOpen] = useState(false);
  const [activeMapField, setActiveMapField] = useState<
    "pickup" | "dropoff" | null
  >(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const [isSuccess, setIsSuccess] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const { data: hasAvailableDrivers = false, isLoading: isCheckingDrivers } =
    useAvailableDrivers(startDate, endDate);

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptRef, setReceiptRef] = useState("");
  const [receiptAmount, setReceiptAmount] = useState("");

  const handleReceiptScan = (file: File, ref: string, amount: string) => {
    setReceiptFile(file);
    setReceiptRef(ref);
    setReceiptAmount(amount);
  };

  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const driverParam = searchParams.get("driver") === "true";
    if (fromParam) setStartDate(new Date(fromParam));
    if (toParam) setEndDate(new Date(toParam));
    setWithDriver(driverParam);
  }, [searchParams]);

  useEffect(() => {
    if (realHubs.length > 0) {
      if (!pickupLocation) setPickupLocation(realHubs[0].name);
      if (!dropoffLocation) setDropoffLocation(realHubs[0].name);
    }
  }, [realHubs]);

  useEffect(() => {
    if (!hasAvailableDrivers && withDriver) {
      setWithDriver(false);
    }
  }, [hasAvailableDrivers, withDriver]);

  // --- DYNAMIC PRICING MATH ---
  let totalDays = 1;
  if (startDate && endDate) {
    totalDays = Math.max(1, differenceInDays(endDate, startDate) + 1);
  }

  // Safety Check: Promo is only valid if duration is exactly 1 day and car supports it
  const isPromoEligible = !!car && car.price12h > 0 && totalDays === 1;

  // Auto-reset promo if they change dates to > 1 day
  useEffect(() => {
    if (!isPromoEligible && is12HourPromo) {
      setIs12HourPromo(false);
    }
  }, [isPromoEligible, is12HourPromo]);

  const baseRentTotal = car ? totalDays * car.price : 0;
  const promoDiscount =
    is12HourPromo && isPromoEligible ? car!.price - car!.price12h : 0;
  const rentTotal = baseRentTotal - promoDiscount;

  const driverTotal = withDriver ? totalDays * realFees.driver_rate_per_day : 0;
  const pickupFee = pickupType === "custom" ? realFees.custom_pickup_fee : 0;
  const dropoffFee = dropoffType === "custom" ? realFees.custom_dropoff_fee : 0;

  const subTotal = rentTotal + driverTotal + pickupFee + dropoffFee;
  const grandTotal = subTotal + realFees.security_deposit_default;

  const reservationFee = Math.round(subTotal * 0.1);
  const balanceDue = grandTotal - reservationFee;

  const openMapFor = (field: "pickup" | "dropoff") => {
    setActiveMapField(field);
    setMapOpen(true);
  };

  const handleLocationSelect = (lat: number, lng: number, name?: string) => {
    const isPickup = activeMapField === "pickup";
    const setType = isPickup ? setPickupType : setDropoffType;
    const setLoc = isPickup ? setPickupLocation : setDropoffLocation;
    const setCoords = isPickup ? setPickupCoords : setDropoffCoords;
    if (name) {
      setType("hub");
      setLoc(name);
      setCoords(`${lat},${lng}`);
    } else {
      setType("custom");
      setLoc(`Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
      setCoords(`${lat},${lng}`);
    }
    setMapOpen(false);
  };

  const handleSubmitBooking = async () => {
    if (!startDate || !endDate || !car || !agreedToTerms) return;

    if (!receiptFile) {
      alert("Please upload your payment receipt to secure the booking.");
      return;
    }

    setIsUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("You must be logged in to upload a receipt.");
      }

      // --- EXACT 24-HOUR CLOCK MATH ---
      const [hours, minutes] = time.split(":").map(Number);

      const exactStartDate = new Date(startDate);
      exactStartDate.setHours(hours, minutes, 0, 0);

      const exactEndDate = new Date(exactStartDate);
      exactEndDate.setDate(exactStartDate.getDate() + totalDays);

      // --- UPLOAD FILE VIA SERVER ACTION ---
      const uploadResult = await uploadFile(
        receiptFile,
        "documents",
        "receipts",
        user.id,
      );

      if (!uploadResult || !uploadResult.url) {
        throw new Error("Failed to upload the receipt to the server.");
      }

      const bookingPayload = {
        car_id: car.id,
        start_date: exactStartDate.toISOString(),
        end_date: exactEndDate.toISOString(),
        pickup_location: pickupLocation,
        dropoff_location: dropoffLocation,
        pickup_type: pickupType,
        dropoff_type: dropoffType,
        pickup_price: pickupFee,
        dropoff_price: dropoffFee,
        is_with_driver: withDriver,
        daily_rate: car.price,
        grand_total: grandTotal,
        security_deposit: realFees.security_deposit_default,
        pickup_coords: pickupCoords,
        dropoff_coords: dropoffCoords,
        booking_status: "confirmed",
        payment_status: "Unpaid",

        // --- NEW PROMO FIELDS FOR BACKEND TO INTERCEPT ---
        is12HourPromo: is12HourPromo,
        car12HourRate: car.price12h,
        carDailyRate: car.price,

        payment_details: {
          amount: Number(receiptAmount) || reservationFee,
          transaction_reference: receiptRef,
          status: "Pending",
          receipt_url: uploadResult.url,
        },
      };

      await submitCustomerBooking(bookingPayload);
      setIsPaymentModalOpen(false);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Booking Submission Failed:", error);
      alert(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isSettingsLoading || isLoadingUnit) {
    return (
      <div className="min-h-screen bg-[#050B10] flex flex-col items-center justify-center text-gray-500">
        <div className="w-10 h-10 border-4 border-white/10 border-t-[#64c5c3] rounded-full animate-spin mb-4" />
        <p className="text-xs uppercase tracking-widest font-bold">
          Authenticating Details...
        </p>
      </div>
    );
  }

  if (!car && !isLoadingUnit) {
    return (
      <div className="min-h-screen bg-[#050B10] flex flex-col items-center justify-center text-gray-500">
        <Car className="w-16 h-16 mb-6 opacity-20" />
        <h2 className="text-2xl font-black text-white mb-6 uppercase tracking-tighter">
          Asset Not Found
        </h2>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="rounded-xl border-white/20 text-white hover:bg-white hover:text-black uppercase tracking-widest text-[10px] font-bold px-8 h-12"
        >
          Return to Fleet
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050B10] flex flex-col items-center justify-center p-6 selection:bg-[#64c5c3] selection:text-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0a1118]/80 backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-[#64c5c3]/30 text-center shadow-[0_0_50px_rgba(100,197,195,0.15)] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#64c5c3]/10 rounded-full blur-[80px] pointer-events-none -z-10" />

          <div className="w-20 h-20 bg-[#64c5c3]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#64c5c3]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Vehicle Secured!
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest leading-relaxed mb-8">
            Your booking is confirmed. We are now manually verifying your{" "}
            <strong className="text-white">
              ₱{reservationFee.toLocaleString()}
            </strong>{" "}
            receipt.
          </p>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 mb-8 text-left">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#64c5c3]" />
              <p className="text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest">
                Next Steps
              </p>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed font-medium mb-3">
              Your remaining balance of{" "}
              <strong className="text-white">
                ₱{balanceDue.toLocaleString()}
              </strong>{" "}
              (including deposit) will be collected during vehicle handover.
            </p>
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed font-medium">
              You can track your itinerary and payment status via your{" "}
              <strong className="text-white">Customer Dashboard</strong>.
            </p>
          </div>

          <Button
            onClick={() => router.push("/customer/my-bookings")}
            className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-xl h-14 font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(100,197,195,0.2)] group"
          >
            View My Itinerary
            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050B10] font-sans selection:bg-[#64c5c3] selection:text-black text-white pb-24">
      {/* Sticky Header */}
      <div className="bg-[#050B10]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all duration-500">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center gap-4 md:gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full text-gray-400 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-[10px] md:text-xs font-bold text-white uppercase tracking-[0.3em] mt-0.5">
            Secure Checkout
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Forms */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8 md:space-y-12">
            {/* 1. Schedule & Driver */}
            <section className="bg-[#0a1118]/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#64c5c3]/5 rounded-full blur-[80px] pointer-events-none -z-10" />

              <div className="flex items-center gap-4 mb-8 md:mb-10 pb-6 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#64c5c3]/10 flex items-center justify-center text-[#64c5c3]">
                  <span className="text-sm font-black">01</span>
                </div>
                <h2 className="text-lg md:text-xl font-black text-white tracking-wider uppercase">
                  Schedule & Chauffeur
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8 md:mb-10">
                <div className="bg-black/40 p-5 md:p-6 border border-white/5 rounded-2xl">
                  <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Pick-up Date
                  </p>
                  <p className="text-sm md:text-base font-bold text-white uppercase tracking-wider">
                    {startDate
                      ? format(startDate, "EEEE, MMM dd, yyyy")
                      : "Not selected"}
                  </p>
                </div>
                <div className="bg-black/40 p-5 md:p-6 border border-white/5 rounded-2xl">
                  <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">
                    Drop-off Date
                  </p>
                  <p className="text-sm md:text-base font-bold text-white uppercase tracking-wider">
                    {endDate
                      ? format(endDate, "EEEE, MMM dd, yyyy")
                      : "Not selected"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 items-center border-t border-white/10 pt-8 md:pt-10">
                <div className="bg-black/40 border border-white/5 rounded-2xl p-5 flex items-center justify-between transition-colors hover:border-[#64c5c3]/30">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                    Pick-up Time
                  </Label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent font-black text-white outline-none border-none ring-0 focus:ring-0 text-sm md:text-base tracking-widest"
                  />
                </div>

                <div
                  className={cn(
                    "flex flex-col justify-center bg-black/40 p-4 border border-white/5 rounded-2xl transition-colors relative",
                    !hasAvailableDrivers
                      ? "opacity-60 bg-red-900/10 border-red-500/20"
                      : "hover:border-[#64c5c3]/30",
                  )}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex flex-col gap-1 cursor-pointer">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white flex items-center gap-2">
                        Request a Driver
                        {isCheckingDrivers && (
                          <span className="animate-pulse text-[#64c5c3]">
                            ...
                          </span>
                        )}
                      </span>
                      <span className="text-[9px] font-bold text-[#64c5c3] tracking-widest uppercase">
                        + ₱{realFees.driver_rate_per_day.toLocaleString()} / day
                      </span>
                    </div>
                    <Switch
                      checked={withDriver}
                      onCheckedChange={setWithDriver}
                      disabled={!hasAvailableDrivers || isCheckingDrivers}
                      className="data-[state=checked]:bg-[#64c5c3]"
                    />
                  </div>
                  {!hasAvailableDrivers && !isCheckingDrivers && (
                    <div className="mt-3 pt-3 border-t border-red-500/20 flex items-start gap-2">
                      <UserCheck className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      <p className="text-[9px] font-bold text-red-400 uppercase tracking-widest leading-snug">
                        No chauffeurs available for these dates. Self-drive
                        only.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* --- NEW 12-HOUR PROMO CHECKBOX --- */}
              {isPromoEligible && (
                <div className="mt-6 border-t border-white/10 pt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div
                    onClick={() => setIs12HourPromo(!is12HourPromo)}
                    className={cn(
                      "flex items-start gap-4 p-5 border rounded-2xl cursor-pointer transition-all duration-300",
                      is12HourPromo
                        ? "bg-[#64c5c3]/10 border-[#64c5c3]/40 shadow-[0_0_20px_rgba(100,197,195,0.1)]"
                        : "bg-[#64c5c3]/5 border-[#64c5c3]/20 hover:border-[#64c5c3]/30",
                    )}
                  >
                    <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 border-2 border-[#64c5c3]/50 rounded text-[#64c5c3] checked:bg-[#64c5c3] checked:border-[#64c5c3] transition-all outline-none cursor-pointer"
                        checked={is12HourPromo}
                        onChange={(e) => setIs12HourPromo(e.target.checked)}
                      />
                      <CheckCircle2
                        className="w-3.5 h-3.5 text-black absolute opacity-0 peer-checked:opacity-100 pointer-events-none"
                        strokeWidth={4}
                      />
                    </div>
                    <div className="flex flex-col">
                      <label className="text-sm font-bold text-[#64c5c3] uppercase tracking-wider cursor-pointer">
                        Avail 12-Hour Rental Promo
                      </label>
                      <span className="text-[10px] sm:text-xs text-gray-400 mt-1 leading-relaxed">
                        Commit to returning the vehicle exactly within 12 hours
                        of pick-up to secure the special discounted rate of{" "}
                        <strong className="text-white">
                          ₱{car.price12h.toLocaleString()}
                        </strong>
                        .
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* 2. Location Logistics */}
            <section className="bg-[#0a1118]/80 backdrop-blur-xl rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#64c5c3]/5 rounded-full blur-[80px] pointer-events-none -z-10" />

              <div className="flex items-center gap-4 mb-8 md:mb-10 pb-6 border-b border-white/10">
                <div className="w-10 h-10 rounded-xl bg-[#64c5c3]/10 flex items-center justify-center text-[#64c5c3]">
                  <span className="text-sm font-black">02</span>
                </div>
                <h2 className="text-lg md:text-xl font-black text-white tracking-wider uppercase">
                  Meeting Locations
                </h2>
              </div>

              <div className="space-y-6 md:space-y-8">
                {/* Pick-up Location */}
                <div className="p-5 md:p-6 bg-black/40 border border-white/5 rounded-2xl">
                  <Label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                    Pick-up Logistics
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <div className="flex-1 relative h-12 md:h-14">
                      {pickupType === "custom" && (
                        <div className="absolute inset-0 bg-[#64c5c3]/10 border border-[#64c5c3]/30 rounded-xl z-10 flex items-center px-4">
                          <MapPin className="text-[#64c5c3] w-4 h-4 shrink-0 mr-3" />
                          <span className="text-[10px] md:text-xs font-bold text-white truncate uppercase tracking-widest">
                            {pickupLocation}
                          </span>
                        </div>
                      )}
                      <Select
                        value={pickupType === "hub" ? pickupLocation : ""}
                        onValueChange={(val) => {
                          setPickupType("hub");
                          setPickupLocation(val);
                        }}
                      >
                        <SelectTrigger className="h-full! rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-white/10 bg-white/5 text-white w-full">
                          <SelectValue placeholder="SELECT AN OFFICIAL HUB" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a1118] border-white/10 text-white rounded-xl">
                          {realHubs.map((hub) => (
                            <SelectItem
                              key={hub.id}
                              value={hub.name}
                              className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 focus:text-white"
                            >
                              {hub.name}{" "}
                              <span className="text-[#64c5c3] ml-1">
                                (FREE)
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => openMapFor("pickup")}
                      className={cn(
                        "h-12 md:h-14 px-6 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all w-full sm:w-auto",
                        pickupType === "custom"
                          ? "bg-[#64c5c3] text-black hover:bg-[#52a3a1]"
                          : "bg-transparent border border-white/20 text-white hover:bg-white/10",
                      )}
                    >
                      <MapPin className="w-4 h-4 mr-2" />{" "}
                      {pickupType === "custom" ? "Adjust Pin" : "Map Selector"}
                    </Button>
                  </div>
                  {pickupType === "custom" && (
                    <p className="text-[8px] md:text-[9px] font-bold text-[#64c5c3] uppercase tracking-widest mt-4 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> + ₱
                      {realFees.custom_pickup_fee} Service Fee Applied
                    </p>
                  )}
                </div>

                {/* Drop-off Location */}
                <div className="p-5 md:p-6 bg-black/40 border border-white/5 rounded-2xl">
                  <Label className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4 block">
                    Drop-off Logistics
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                    <div className="flex-1 relative h-12 md:h-14">
                      {dropoffType === "custom" && (
                        <div className="absolute inset-0 bg-[#64c5c3]/10 border border-[#64c5c3]/30 rounded-xl z-10 flex items-center px-4">
                          <MapPin className="text-[#64c5c3] w-4 h-4 shrink-0 mr-3" />
                          <span className="text-[10px] md:text-xs font-bold text-white truncate uppercase tracking-widest">
                            {dropoffLocation}
                          </span>
                        </div>
                      )}
                      <Select
                        value={dropoffType === "hub" ? dropoffLocation : ""}
                        onValueChange={(val) => {
                          setDropoffType("hub");
                          setDropoffLocation(val);
                        }}
                      >
                        <SelectTrigger className="h-full! rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest border-white/10 bg-white/5 text-white w-full">
                          <SelectValue placeholder="SELECT AN OFFICIAL HUB" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#0a1118] border-white/10 text-white rounded-xl">
                          {realHubs.map((hub) => (
                            <SelectItem
                              key={hub.id}
                              value={hub.name}
                              className="text-[9px] md:text-[10px] uppercase tracking-widest font-bold focus:bg-white/10 focus:text-white"
                            >
                              {hub.name}{" "}
                              <span className="text-[#64c5c3] ml-1">
                                (FREE)
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      onClick={() => openMapFor("dropoff")}
                      className={cn(
                        "h-12 md:h-14 px-6 rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all w-full sm:w-auto",
                        dropoffType === "custom"
                          ? "bg-[#64c5c3] text-black hover:bg-[#52a3a1]"
                          : "bg-transparent border border-white/20 text-white hover:bg-white/10",
                      )}
                    >
                      <MapPin className="w-4 h-4 mr-2" />{" "}
                      {dropoffType === "custom" ? "Adjust Pin" : "Map Selector"}
                    </Button>
                  </div>
                  {dropoffType === "custom" && (
                    <p className="text-[8px] md:text-[9px] font-bold text-[#64c5c3] uppercase tracking-widest mt-4 flex items-center gap-2">
                      <ShieldCheck className="w-3.5 h-3.5" /> + ₱
                      {realFees.custom_dropoff_fee} Service Fee Applied
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: The Sticky Summary */}
          <div className="lg:col-span-5 xl:col-span-4 relative mt-4 lg:mt-0">
            <div className="bg-[#0a1118]/80 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl overflow-hidden sticky top-28">
              <div className="p-6 md:p-8 border-b border-white/10 flex gap-4 md:gap-5 items-center bg-black/40">
                <div className="relative w-24 h-16 md:w-28 md:h-20 rounded-xl bg-black overflow-hidden shrink-0 border border-white/5">
                  <Image
                    src={car?.image}
                    alt="Vehicle"
                    fill
                    sizes="112px"
                    className="object-cover opacity-80"
                  />
                </div>
                <div>
                  <p className="text-[9px] md:text-[10px] text-[#64c5c3] font-bold mb-1 uppercase tracking-widest">
                    {car?.brand}
                  </p>
                  <h3 className="text-xl md:text-2xl font-black text-white tracking-tighter uppercase">
                    {car?.model}
                  </h3>
                </div>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                <h4 className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-4">
                  Pricing Breakdown
                </h4>
                <div className="space-y-4 text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
                  {/* --- DYNAMIC RENT BREAKDOWN --- */}
                  <div className="flex justify-between text-gray-400">
                    <span>Vehicle ({totalDays} days)</span>
                    <span className="text-white">
                      ₱{baseRentTotal.toLocaleString()}
                    </span>
                  </div>

                  {is12HourPromo && isPromoEligible && (
                    <div className="flex justify-between text-[#64c5c3] bg-[#64c5c3]/10 p-2 rounded-lg border border-[#64c5c3]/20 animate-in fade-in zoom-in duration-300">
                      <span>12-Hour Promo Applied</span>
                      <span>- ₱{promoDiscount.toLocaleString()}</span>
                    </div>
                  )}

                  {withDriver && (
                    <div className="flex justify-between text-gray-400">
                      <span>Chauffeur Service</span>
                      <span className="text-[#64c5c3]">
                        ₱{driverTotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {pickupFee > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Logistics Pick-up</span>
                      <span className="text-[#64c5c3]">
                        ₱{pickupFee.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {dropoffFee > 0 && (
                    <div className="flex justify-between text-gray-400">
                      <span>Logistics Drop-off</span>
                      <span className="text-[#64c5c3]">
                        ₱{dropoffFee.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-gray-400 border-t border-white/10 pt-4 border-dashed">
                    <span>Rental Subtotal</span>
                    <span className="text-white">
                      ₱{subTotal.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between text-gray-500">
                    <span className="flex items-center gap-2">
                      Refundable Deposit{" "}
                      <ShieldCheck className="w-3 h-3 text-gray-600" />
                    </span>
                    <span className="text-gray-400">
                      ₱{realFees.security_deposit_default.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-black/60 border-t border-[#64c5c3]/20 shadow-[0_-15px_30px_rgba(100,197,195,0.05)]">
                <div className="flex items-end justify-between mb-4 pb-4 border-b border-white/10">
                  <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Total Booking Value
                  </p>
                  <p className="text-xl font-black text-gray-300 tracking-tighter leading-none">
                    ₱{grandTotal.toLocaleString()}
                  </p>
                </div>

                <div className="flex items-end justify-between mb-6">
                  <p className="text-[10px] md:text-[11px] font-black text-[#64c5c3] uppercase tracking-widest flex items-center gap-2">
                    Due Now{" "}
                    <span className="text-[8px] bg-[#64c5c3]/20 px-1.5 py-0.5 rounded text-[#64c5c3]">
                      (10% Fee)
                    </span>
                  </p>
                  <p className="text-3xl md:text-4xl font-black text-[#64c5c3] tracking-tighter leading-none">
                    ₱{reservationFee.toLocaleString()}
                  </p>
                </div>

                {/* --- Button to open Payment Modal --- */}
                <Button
                  size="lg"
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] h-14 md:h-16 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(100,197,195,0.2)] transition-all duration-500 group"
                >
                  Proceed to Payment
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>

                <div className="flex items-center gap-2 justify-center text-[8px] font-bold text-gray-600 mt-4 uppercase tracking-widest">
                  <ShieldCheck className="w-3 h-3" /> Secure Payment Gateway
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- THE PAYMENT MODAL (Wider & Scrollable) --- */}
      <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
        <DialogContent className="w-[95vw] sm:max-w-lg md:max-w-xl max-h-[85vh] overflow-y-auto custom-scrollbar bg-[#0a1118]/95 backdrop-blur-2xl border border-[#64c5c3]/30 p-6 md:p-8 rounded-3xl shadow-[0_0_50px_rgba(100,197,195,0.15)] text-white">
          <DialogHeader className="text-center shrink-0">
            <DialogTitle className="text-2xl font-black uppercase tracking-tighter text-white">
              Secure Vehicle
            </DialogTitle>
            <DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-[#64c5c3] mt-2">
              Amount Due: ₱{reservationFee.toLocaleString()}
            </DialogDescription>
          </DialogHeader>

          {/* Wrapper to handle spacing inside the scrollable area */}
          <div className="flex flex-col gap-6 mt-4">
            {/* Payment Instructions / QR Code */}
            <div className="p-5 bg-black/40 border border-[#64c5c3]/20 rounded-2xl text-center flex flex-col items-center shrink-0">
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-3">
                Scan to Pay via GCash / Maya
              </p>
              <div className="w-32 h-32 bg-white rounded-xl p-2 mb-3 relative flex items-center justify-center">
                {/* Using standard img tag temporarily to avoid Next.config errors */}
                <img
                  src="https://placehold.co/400x400?text=QR+Code"
                  alt="GCash/Maya QR Code"
                  className="w-full h-full object-contain p-2"
                />
              </div>
              <p className="text-[10px] text-white font-bold uppercase tracking-widest mb-1">
                MC Ormoc Car Rental
              </p>
              <p className="text-[10px] text-[#64c5c3] font-bold tracking-widest">
                0976 180 4397
              </p>
            </div>

            {/* The OCR Scanner Component */}
            <div className="shrink-0">
              <ReceiptScanner
                onScanComplete={handleReceiptScan}
                expectedAmount={reservationFee}
              />
            </div>

            {/* Consent Checkbox */}
            <label className="flex items-start gap-3 cursor-pointer group shrink-0">
              <div className="relative flex items-center justify-center mt-0.5">
                <input
                  type="checkbox"
                  className="peer appearance-none w-4 h-4 border-2 border-white/20 rounded-md checked:bg-[#64c5c3] checked:border-[#64c5c3] transition-all outline-none cursor-pointer"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                />
                <CheckCircle2
                  className="w-3 h-3 text-black absolute opacity-0 peer-checked:opacity-100 pointer-events-none"
                  strokeWidth={4}
                />
              </div>
              <p className="text-[9px] text-gray-400 font-medium leading-relaxed">
                I agree to pay the{" "}
                <strong className="text-white">
                  non-refundable 10% Reservation Fee
                </strong>{" "}
                to secure this vehicle. I understand this will be deducted from
                my final balance.
              </p>
            </label>

            {/* Final Submit */}
            <Button
              size="lg"
              onClick={handleSubmitBooking}
              disabled={
                isSubmittingCustomerBooking ||
                isUploading ||
                !agreedToTerms ||
                !receiptFile
              }
              className="w-full shrink-0 bg-[#64c5c3] text-black hover:bg-[#52a3a1] h-14 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-[0_0_20px_rgba(100,197,195,0.2)] transition-all duration-500 disabled:opacity-40 disabled:bg-[#64c5c3] disabled:cursor-not-allowed"
            >
              {isUploading
                ? "Uploading Receipt..."
                : isSubmittingCustomerBooking
                  ? "Processing..."
                  : "Confirm & Lock Booking"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-5xl bg-[#0a1118] border-white/10 p-0 overflow-hidden flex flex-col h-[85vh] rounded-3xl shadow-2xl gap-0 w-[95vw] md:w-full">
          <DialogHeader className="p-6 md:p-8 bg-black/40 border-b border-white/5 shrink-0">
            <DialogTitle className="text-2xl md:text-3xl font-black text-white tracking-tighter uppercase">
              Select {activeMapField === "pickup" ? "Pick-up" : "Drop-off"} Node
            </DialogTitle>
            <DialogDescription className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 mt-2">
              Select an official hub (Free) or pin a custom coordinate (+₱
              {realFees.custom_pickup_fee} Logistics Fee).
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 w-full bg-black relative">
            <OrmocMapSelector
              hubs={realHubs}
              onLocationSelect={handleLocationSelect}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
