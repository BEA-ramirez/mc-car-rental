"use client";

import { useState, useEffect, useMemo, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { format, differenceInDays } from "date-fns";
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

// --- CUSTOM HIGH-END LOGO ---
const PremiumLogo = () => (
  <div className="relative w-8 h-8 flex items-center justify-center mx-auto mb-6">
    <div className="absolute w-full h-full border-[1.5px] border-white/80 rounded-sm transform rotate-45" />
    <div className="absolute w-full h-full border-[1.5px] border-blue-500/80 rounded-sm transform -rotate-45" />
    <span className="relative z-10 text-[10px] font-black text-white tracking-tighter">
      M
    </span>
  </div>
);

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

  if (isSettingsLoading || isLoadingUnit) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center text-slate-500">
        <div className="w-8 h-8 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mb-4" />
        <p className="text-[10px] uppercase tracking-[0.3em] font-medium">
          Authenticating Setup Details...
        </p>
      </div>
    );
  }

  if (!car && !isLoadingUnit) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center text-slate-500">
        <Car className="w-12 h-12 mb-4 opacity-20" />
        <h2 className="text-xl font-light text-white mb-6 uppercase tracking-widest">
          Asset Not Found
        </h2>
        <Button
          onClick={() => router.back()}
          variant="outline"
          className="rounded-none border-white/20 text-white uppercase tracking-widest text-[10px]"
        >
          Return to Fleet
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex flex-col items-center justify-center px-6 selection:bg-blue-900">
        <div className="max-w-xl w-full bg-white/[0.02] backdrop-blur-2xl p-12 rounded-sm border border-white/5 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          <PremiumLogo />
          <h1 className="text-3xl font-light text-white tracking-tighter mb-4">
            Request{" "}
            <span className="italic font-normal text-white/50">Submitted.</span>
          </h1>
          <p className="text-slate-400 text-sm font-light leading-relaxed mb-10">
            Your booking request has been sent to our team for approval. Once
            reviewed, we will notify you to proceed with your preferred payment
            method.
          </p>
          <Button
            onClick={() => router.push("/customer/my-bookings")}
            className="w-full bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white rounded-none h-14 font-bold text-[10px] uppercase tracking-[0.3em] transition-all duration-500 group"
          >
            View My Bookings{" "}
            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0C10] font-sans selection:bg-blue-900 text-slate-300 pb-24">
      {/* Header */}
      <div className="bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/5 sticky top-0 z-50 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center gap-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full text-white/40 hover:text-white hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-[10px] font-medium text-white uppercase tracking-[0.3em] mt-0.5">
            Complete Reservation
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 xl:col-span-8 space-y-12">
            {/* 1. Schedule & Driver */}
            <section className="bg-white/[0.02] backdrop-blur-xl rounded-sm p-8 md:p-10 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                <div className="w-10 h-10 rounded-sm bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                  <span className="text-xs font-bold tracking-tighter">01</span>
                </div>
                <h2 className="text-lg font-light text-white tracking-wide">
                  Schedule & Chauffeur
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                <div className="bg-[#050608] p-6 border border-white/5 rounded-sm">
                  <p className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.3em] mb-2">
                    Pick-up Date
                  </p>
                  <p className="text-base font-light text-white">
                    {startDate
                      ? format(startDate, "EEEE, MMM dd, yyyy")
                      : "Not selected"}
                  </p>
                </div>
                <div className="bg-[#050608] p-6 border border-white/5 rounded-sm">
                  <p className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.3em] mb-2">
                    Drop-off Date
                  </p>
                  <p className="text-base font-light text-white">
                    {endDate
                      ? format(endDate, "EEEE, MMM dd, yyyy")
                      : "Not selected"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-white/5 pt-10">
                <div className="bg-[#050608] border border-white/5 rounded-sm p-4 flex items-center justify-between">
                  <Label className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400">
                    Pick-up Time
                  </Label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent font-medium text-white outline-none border-none ring-0 focus:ring-0 text-sm tracking-widest"
                  />
                </div>
                <div className="flex items-center justify-between bg-[#050608] p-5 border border-white/5 rounded-sm transition-colors hover:border-white/10">
                  <div className="flex flex-col gap-1 cursor-pointer">
                    <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-white">
                      Request a Driver
                    </span>
                    <span className="text-[9px] text-slate-500 tracking-wider">
                      + ₱{realFees.driver_rate_per_day.toLocaleString()} / day
                    </span>
                  </div>
                  <Switch
                    checked={withDriver}
                    onCheckedChange={setWithDriver}
                  />
                </div>
              </div>
            </section>

            {/* 2. Location Logistics */}
            <section className="bg-white/[0.02] backdrop-blur-xl rounded-sm p-8 md:p-10 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent" />
              <div className="flex items-center gap-4 mb-10 pb-6 border-b border-white/5">
                <div className="w-10 h-10 rounded-sm bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <span className="text-xs font-bold tracking-tighter">02</span>
                </div>
                <h2 className="text-lg font-light text-white tracking-wide">
                  Meeting Locations
                </h2>
              </div>

              <div className="space-y-8">
                {/* Pick-up Location */}
                <div className="p-6 bg-[#050608] border border-white/5 rounded-sm">
                  <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.3em] mb-4 block">
                    Pick-up Logistics
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative h-12">
                      {pickupType === "custom" && (
                        <div className="absolute inset-0 bg-blue-500/5 border border-blue-500/20 rounded-none z-10 flex items-center px-4">
                          <MapPin className="text-blue-400 w-3 h-3 shrink-0 mr-3" />
                          <span className="text-[10px] font-bold text-white truncate uppercase tracking-widest">
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
                        <SelectTrigger className="h-full! rounded-none text-[10px] font-bold uppercase tracking-widest border-white/10 bg-white/5 text-white w-full">
                          <SelectValue placeholder="SELECT AN OFFICIAL HUB" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111623] border-white/10 text-white rounded-none">
                          {realHubs.map((hub) => (
                            <SelectItem
                              key={hub.id}
                              value={hub.name}
                              className="text-[10px] uppercase tracking-widest focus:bg-white/10"
                            >
                              {hub.name}{" "}
                              <span className="text-slate-500 ml-1">
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
                        "h-12 px-6 rounded-none text-[9px] font-bold uppercase tracking-[0.2em] transition-all",
                        pickupType === "custom"
                          ? "bg-white text-black"
                          : "bg-transparent border border-white/20 text-white hover:bg-white/5",
                      )}
                    >
                      <MapPin className="w-3 h-3 mr-2" />{" "}
                      {pickupType === "custom" ? "Adjust Pin" : "Map Selector"}
                    </Button>
                  </div>
                  {pickupType === "custom" && (
                    <p className="text-[8px] font-medium text-blue-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> + ₱
                      {realFees.custom_pickup_fee} Service Fee Applied
                    </p>
                  )}
                </div>

                {/* Drop-off Location */}
                <div className="p-6 bg-[#050608] border border-white/5 rounded-sm">
                  <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.3em] mb-4 block">
                    Drop-off Logistics
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative h-12">
                      {dropoffType === "custom" && (
                        <div className="absolute inset-0 bg-blue-500/5 border border-blue-500/20 rounded-none z-10 flex items-center px-4">
                          <MapPin className="text-blue-400 w-3 h-3 shrink-0 mr-3" />
                          <span className="text-[10px] font-bold text-white truncate uppercase tracking-widest">
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
                        <SelectTrigger className="h-full! rounded-none text-[10px] font-bold uppercase tracking-widest border-white/10 bg-white/5 text-white w-full">
                          <SelectValue placeholder="SELECT AN OFFICIAL HUB" />
                        </SelectTrigger>
                        <SelectContent className="bg-[#111623] border-white/10 text-white rounded-none">
                          {realHubs.map((hub) => (
                            <SelectItem
                              key={hub.id}
                              value={hub.name}
                              className="text-[10px] uppercase tracking-widest focus:bg-white/10"
                            >
                              {hub.name}{" "}
                              <span className="text-slate-500 ml-1">
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
                        "h-12 px-6 rounded-none text-[9px] font-bold uppercase tracking-[0.2em] transition-all",
                        dropoffType === "custom"
                          ? "bg-white text-black"
                          : "bg-transparent border border-white/20 text-white hover:bg-white/5",
                      )}
                    >
                      <MapPin className="w-3 h-3 mr-2" />{" "}
                      {dropoffType === "custom" ? "Adjust Pin" : "Map Selector"}
                    </Button>
                  </div>
                  {dropoffType === "custom" && (
                    <p className="text-[8px] font-medium text-blue-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                      <ShieldCheck className="w-3 h-3" /> + ₱
                      {realFees.custom_dropoff_fee} Service Fee Applied
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: The Sticky Summary */}
          <div className="lg:col-span-5 xl:col-span-4 relative">
            <div className="bg-white/[0.02] backdrop-blur-2xl rounded-sm border border-white/5 shadow-2xl overflow-hidden sticky top-28">
              <div className="p-8 border-b border-white/5 flex gap-5 items-center bg-white/5">
                <div className="relative w-28 h-20 rounded-sm bg-[#050608] overflow-hidden shrink-0 border border-white/10">
                  <Image
                    src={car?.image}
                    alt="Vehicle"
                    fill
                    sizes="112px"
                    className="object-cover opacity-80"
                  />
                </div>
                <div>
                  <p className="text-[9px] text-blue-500 font-medium mb-1 uppercase tracking-[0.4em]">
                    {car?.brand}
                  </p>
                  <h3 className="text-xl font-light text-white tracking-tight">
                    {car?.model}
                  </h3>
                </div>
              </div>

              <div className="p-8 space-y-6 bg-transparent">
                <h4 className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.3em] mb-4">
                  Investment Breakdown
                </h4>
                <div className="space-y-4 text-[11px] uppercase tracking-widest">
                  <div className="flex justify-between text-slate-400">
                    <span>Vehicle ({totalDays} days)</span>
                    <span className="font-medium text-white">
                      ₱{rentTotal.toLocaleString()}
                    </span>
                  </div>
                  {withDriver && (
                    <div className="flex justify-between text-slate-400">
                      <span>Chauffeur Service</span>
                      <span className="font-medium text-white">
                        ₱{driverTotal.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {pickupFee > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Logistics Pick-up</span>
                      <span className="font-medium text-white">
                        ₱{pickupFee.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {dropoffFee > 0 && (
                    <div className="flex justify-between text-slate-400">
                      <span>Logistics Drop-off</span>
                      <span className="font-medium text-white">
                        ₱{dropoffFee.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-400 border-t border-white/5 pt-4">
                    <span className="flex items-center gap-2">
                      Security Deposit{" "}
                      <ShieldCheck className="w-3 h-3 text-emerald-500" />
                    </span>
                    <span className="font-medium text-white">
                      ₱{realFees.security_deposit_default.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-white/5 border-t border-white/5">
                <div className="flex items-end justify-between mb-2">
                  <p className="text-[10px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                    Total Estimate
                  </p>
                  <p className="text-3xl font-light text-white tracking-tighter leading-none">
                    ₱{grandTotal.toLocaleString()}
                  </p>
                </div>
                <p className="text-[8px] font-medium text-slate-600 text-right mb-8 tracking-widest uppercase">
                  Payable after asset verification
                </p>

                <Button
                  size="lg"
                  onClick={handleSubmitBooking}
                  disabled={isSubmittingCustomerBooking}
                  className="w-full bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white h-16 rounded-none font-bold text-[10px] uppercase tracking-[0.3em] shadow-2xl transition-all duration-500 group disabled:opacity-30"
                >
                  {isSubmittingCustomerBooking
                    ? "Authenticating..."
                    : "Submit Reservation Request"}
                </Button>
                <p className="text-center text-[8px] text-slate-500 mt-6 uppercase tracking-widest leading-relaxed">
                  By submitting, you agree to the <br />{" "}
                  <span className="text-white cursor-pointer hover:underline">
                    MC Ormoc Master Service Agreement
                  </span>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-5xl bg-[#0A0C10] border-white/10 p-0 overflow-hidden flex flex-col h-[85vh] rounded-none shadow-2xl gap-0">
          <DialogHeader className="p-8 bg-white/[0.02] border-b border-white/5 shrink-0">
            <DialogTitle className="text-2xl font-light text-white tracking-tight uppercase">
              Select {activeMapField === "pickup" ? "Pick-up" : "Drop-off"} Node
            </DialogTitle>
            <DialogDescription className="text-[9px] uppercase tracking-[0.2em] text-slate-500 mt-2">
              Select an official hub (Free) or pin a custom coordinate (+₱
              {realFees.custom_pickup_fee} Logistics Fee).
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 w-full bg-[#050608] relative">
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
