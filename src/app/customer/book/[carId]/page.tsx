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

import { useBookingSettings } from "../../../../../hooks/use-settings";
import { useUnits } from "../../../../../hooks/use-units";
import { useBookings } from "../../../../../hooks/use-bookings";

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
  const [mapOpen, setMapOpen] = useState(false);
  const [activeMapField, setActiveMapField] = useState<
    "pickup" | "dropoff" | null
  >(null);
  const [isSuccess, setIsSuccess] = useState(false);

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

  let totalDays = 1;
  if (startDate && endDate) {
    totalDays = Math.max(1, differenceInDays(endDate, startDate) + 1);
  }
  const rentTotal = car ? totalDays * car.price : 0;
  const driverTotal = withDriver ? totalDays * realFees.driver_rate_per_day : 0;
  const pickupFee = pickupType === "custom" ? realFees.custom_pickup_fee : 0;
  const dropoffFee = dropoffType === "custom" ? realFees.custom_dropoff_fee : 0;
  const grandTotal =
    rentTotal +
    driverTotal +
    pickupFee +
    dropoffFee +
    realFees.security_deposit_default;

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
    if (!startDate || !endDate || !car) return;
    try {
      const bookingPayload = {
        car_id: car.id,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
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
      };
      await submitCustomerBooking(bookingPayload);
      setIsSuccess(true);
    } catch (error: any) {
      console.error("Booking Submission Failed:", error);
    }
  };

  // --- LOADING STATE ---
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

  // --- NOT FOUND STATE ---
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

  // --- SUCCESS STATE ---
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#050B10] flex flex-col items-center justify-center p-6 selection:bg-[#64c5c3] selection:text-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-[#0a1118]/80 backdrop-blur-2xl p-8 md:p-10 rounded-3xl border border-white/5 text-center shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#64c5c3]/10 rounded-full blur-[80px] pointer-events-none -z-10" />

          <div className="w-20 h-20 bg-[#64c5c3]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-[#64c5c3]" />
          </div>

          <h1 className="text-3xl md:text-4xl font-black text-white uppercase tracking-tighter mb-4">
            Request Submitted
          </h1>
          <p className="text-gray-400 text-xs uppercase tracking-widest leading-relaxed mb-8">
            Your booking request has been sent to our team for approval. We will
            notify you to proceed with your preferred payment method.
          </p>

          <div className="bg-black/40 border border-white/5 rounded-2xl p-5 mb-8 text-left">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-[#64c5c3]" />
              <p className="text-[10px] font-bold text-[#64c5c3] uppercase tracking-widest">
                Next Phase
              </p>
            </div>
            <p className="text-[10px] sm:text-xs text-gray-400 leading-relaxed font-medium">
              You can track the status of this request and settle the balance
              via your{" "}
              <strong className="text-white">Customer Dashboard</strong>.
            </p>
          </div>

          <Button
            onClick={() => router.push("/customer/my-bookings")}
            className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] rounded-xl h-14 font-black text-[11px] uppercase tracking-widest transition-all duration-300 shadow-[0_0_15px_rgba(100,197,195,0.2)] group"
          >
            View My Bookings
            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    );
  }

  // --- MAIN BOOKING FORM UI ---
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
            Complete Reservation
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

                <div className="flex items-center justify-between bg-black/40 p-5 border border-white/5 rounded-2xl transition-colors hover:border-[#64c5c3]/30">
                  <div className="flex flex-col gap-1 cursor-pointer">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white">
                      Request a Driver
                    </span>
                    <span className="text-[9px] font-bold text-[#64c5c3] tracking-widest uppercase">
                      + ₱{realFees.driver_rate_per_day.toLocaleString()} / day
                    </span>
                  </div>
                  <Switch
                    checked={withDriver}
                    onCheckedChange={setWithDriver}
                    className="data-[state=checked]:bg-[#64c5c3]"
                  />
                </div>
              </div>
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
                  Investment Breakdown
                </h4>
                <div className="space-y-4 text-[10px] md:text-[11px] font-bold uppercase tracking-widest">
                  <div className="flex justify-between text-gray-400">
                    <span>Vehicle ({totalDays} days)</span>
                    <span className="text-white">
                      ₱{rentTotal.toLocaleString()}
                    </span>
                  </div>
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
                  <div className="flex justify-between text-gray-400 border-t border-white/10 pt-4">
                    <span className="flex items-center gap-2">
                      Security Deposit{" "}
                      <ShieldCheck className="w-3.5 h-3.5 text-gray-500" />
                    </span>
                    <span className="text-white">
                      ₱{realFees.security_deposit_default.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 md:p-8 bg-white/5 border-t border-white/10">
                <div className="flex items-end justify-between mb-2">
                  <p className="text-[9px] md:text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Total Estimate
                  </p>
                  <p className="text-3xl md:text-4xl font-black text-white tracking-tighter leading-none">
                    ₱{grandTotal.toLocaleString()}
                  </p>
                </div>
                <p className="text-[8px] md:text-[9px] font-bold text-gray-500 text-right mb-6 md:mb-8 tracking-widest uppercase">
                  Payable after asset verification
                </p>

                <Button
                  size="lg"
                  onClick={handleSubmitBooking}
                  disabled={isSubmittingCustomerBooking}
                  className="w-full bg-[#64c5c3] text-black hover:bg-[#52a3a1] h-14 md:h-16 rounded-xl font-black text-[10px] md:text-[11px] uppercase tracking-widest shadow-[0_0_20px_rgba(100,197,195,0.2)] transition-all duration-500 group disabled:opacity-40 disabled:bg-[#64c5c3]"
                >
                  {isSubmittingCustomerBooking
                    ? "Authenticating..."
                    : "Submit Reservation Request"}
                </Button>
                <p className="text-center text-[8px] md:text-[9px] font-bold text-gray-500 mt-4 md:mt-6 uppercase tracking-widest leading-relaxed">
                  By submitting, you agree to the <br />{" "}
                  <span className="text-white cursor-pointer hover:underline">
                    MC Ormoc Master Service Agreement
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

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
