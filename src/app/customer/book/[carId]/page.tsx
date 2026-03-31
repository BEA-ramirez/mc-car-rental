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

  // Settings data (hubs and fees)
  const { data: settings, isLoading: isSettingsLoading } = useBookingSettings();
  const { unit, isLoadingUnit } = useUnits(carId);

  // Extract real hubs and fees, with safe fallbacks
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

  // Format the car data to UI
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
          : "https://placehold.co/600x400?text=No+Image",
    };
  }, [unit]);

  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [time, setTime] = useState("09:00"); // verify this with client (TAKE NOTE)
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

  // Initialize data from URL params (if they exist)
  useEffect(() => {
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");
    const driverParam = searchParams.get("driver") === "true";

    if (fromParam) setStartDate(new Date(fromParam));
    if (toParam) setEndDate(new Date(toParam));
    setWithDriver(driverParam);
  }, [searchParams]);

  // Set default hub locations once realHubs load
  useEffect(() => {
    if (realHubs.length > 0) {
      if (!pickupLocation) setPickupLocation(realHubs[0].name);
      if (!dropoffLocation) setDropoffLocation(realHubs[0].name);
    }
  }, [realHubs]);

  // Calculate pricing breakdown
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

  // Handlers
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
        pickup_location:
          pickupType === "custom" ? pickupLocation : pickupLocation,
        dropoff_location:
          dropoffType === "custom" ? dropoffLocation : dropoffLocation,
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
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
        <p className="text-sm font-bold">Loading setup details...</p>
      </div>
    );
  }

  // Fallback
  if (!car && !isLoadingUnit) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-slate-500">
        <Car className="w-12 h-12 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">
          Vehicle Not Found
        </h2>
        <Button onClick={() => router.back()} variant="outline">
          Go Back
        </Button>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center pt-32 px-4">
        <div className="max-w-xl w-full bg-white p-10 rounded-3xl shadow-xl text-center border border-slate-100">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Clock className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">
            Request Submitted!
          </h1>
          <p className="text-slate-500 leading-relaxed mb-8">
            Your booking request has been sent to our team for approval. Once
            reviewed, we will notify you to proceed with your preferred{" "}
          </p>
          <Button
            onClick={() => router.push("/customer/my-bookings")}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 px-8 font-bold text-base shadow-md"
          >
            View My Bookings
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-slate-100"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Button>
          <h1 className="text-lg font-bold text-slate-900">
            Complete Your Reservation
          </h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            {/* Schedule & Driver */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <span className="font-black">1</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Schedule & Driver
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Pick-up Date
                  </p>
                  <p className="text-base font-bold text-slate-900">
                    {startDate
                      ? format(startDate, "EEEE, MMM dd, yyyy")
                      : "Not selected"}
                  </p>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Drop-off Date
                  </p>
                  <p className="text-base font-bold text-slate-900">
                    {endDate
                      ? format(endDate, "EEEE, MMM dd, yyyy")
                      : "Not selected"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center border-t border-slate-100 pt-8">
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-2 px-4 flex items-center justify-between">
                  <Label className="text-sm font-bold text-slate-900">
                    Pick-up Time
                  </Label>
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="bg-transparent font-medium text-slate-900 outline-none border-none ring-0 focus:ring-0"
                  />
                </div>
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-100">
                  <div className="flex flex-col gap-0.5 cursor-pointer">
                    <span className="text-sm font-bold text-slate-900">
                      Request a Driver
                    </span>
                    <span className="text-xs text-slate-500">
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

            {/* Location Logistics */}
            <section className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                  <span className="font-black">2</span>
                </div>
                <h2 className="text-xl font-bold text-slate-900">
                  Meeting Locations
                </h2>
              </div>

              <div className="space-y-6">
                {/* Pick-up Location */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                    Pick-up Location
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Hub Selector */}
                    <div className="flex-1 relative h-12">
                      {pickupType === "custom" && (
                        <div className="absolute inset-0 bg-blue-50 border border-blue-200 rounded-xl z-10 flex items-center px-4">
                          <MapPin className="text-blue-600 w-4 h-4 shrink-0 mr-2" />
                          <span className="text-sm font-bold text-blue-900 truncate">
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
                        <SelectTrigger className="h-full! rounded-xl text-sm font-bold border-slate-200 bg-white shadow-sm w-full">
                          <SelectValue placeholder="Select an Official Hub" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {realHubs.map((hub) => (
                            <SelectItem
                              key={hub.id}
                              value={hub.name}
                              className="font-medium"
                            >
                              {hub.name}{" "}
                              <span className="text-slate-400 ml-1">
                                (Free)
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* The Map Button */}
                    <Button
                      variant={pickupType === "custom" ? "default" : "outline"}
                      onClick={() => openMapFor("pickup")}
                      className={cn(
                        "h-12 px-5 py-0 rounded-xl text-sm font-bold shrink-0 shadow-sm transition-all",
                        pickupType === "custom"
                          ? "bg-blue-600 text-white hover:bg-blue-700 border-transparent"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <MapPin
                        className={cn(
                          "w-4 h-4 mr-2",
                          pickupType === "custom"
                            ? "text-white"
                            : "text-blue-600",
                        )}
                      />
                      {pickupType === "custom" ? "Change Pin" : "Pin on Map"}
                    </Button>
                  </div>

                  {pickupType === "custom" && (
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-2 ml-1">
                      + ₱{realFees.custom_pickup_fee} Custom Delivery Fee
                      Applied
                    </p>
                  )}
                </div>

                {/* Drop-off Location */}
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 block">
                    Drop-off Location
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-3">
                    {/* Hub Selector */}
                    <div className="flex-1 relative h-12">
                      {dropoffType === "custom" && (
                        <div className="absolute inset-0 bg-blue-50 border border-blue-200 rounded-xl z-10 flex items-center px-4">
                          <MapPin className="text-blue-600 w-4 h-4 shrink-0 mr-2" />
                          <span className="text-sm font-bold text-blue-900 truncate">
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
                        <SelectTrigger className="h-full! rounded-xl text-sm font-bold border-slate-200 bg-white shadow-sm w-full">
                          <SelectValue placeholder="Select an Official Hub" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          {realHubs.map((hub) => (
                            <SelectItem
                              key={hub.id}
                              value={hub.name}
                              className="font-medium"
                            >
                              {hub.name}{" "}
                              <span className="text-slate-400 ml-1">
                                (Free)
                              </span>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* The Map Button */}
                    <Button
                      variant={dropoffType === "custom" ? "default" : "outline"}
                      onClick={() => openMapFor("dropoff")}
                      className={cn(
                        "h-12 px-5 rounded-xl text-sm font-bold shrink-0 shadow-sm transition-all",
                        dropoffType === "custom"
                          ? "bg-blue-600 text-white hover:bg-blue-700 border-transparent"
                          : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50",
                      )}
                    >
                      <MapPin
                        className={cn(
                          "w-4 h-4 mr-2",
                          dropoffType === "custom"
                            ? "text-white"
                            : "text-blue-600",
                        )}
                      />
                      {dropoffType === "custom" ? "Change Pin" : "Pin on Map"}
                    </Button>
                  </div>

                  {dropoffType === "custom" && (
                    <p className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mt-2 ml-1">
                      + ₱{realFees.custom_dropoff_fee} Custom Pickup Fee Applied
                    </p>
                  )}
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: The Sticky Receipt */}
          <div className="lg:col-span-5 xl:col-span-4 relative">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden sticky top-24">
              <div className="p-6 border-b border-slate-100 flex gap-4 items-center bg-slate-900 text-white">
                <div className="relative w-24 h-16 rounded-xl bg-white/20 overflow-hidden shrink-0 border border-slate-700">
                  <Image
                    src={car?.image}
                    alt="Car"
                    fill
                    sizes="96px"
                    className="object-contain p-1"
                  />
                </div>

                <div>
                  <p className="text-xs text-slate-400 font-bold mb-0.5 uppercase tracking-widest">
                    {car?.brand}
                  </p>
                  <h3 className="text-xl font-black leading-tight">
                    {car?.model}
                  </h3>
                </div>
              </div>

              <div className="p-6 space-y-5 bg-slate-50">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Price Breakdown
                </h4>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-700">
                    <span>Vehicle ({totalDays} days)</span>
                    <span className="font-semibold text-slate-900">
                      ₱{rentTotal.toLocaleString()}
                    </span>
                  </div>

                  {withDriver && (
                    <div className="flex justify-between text-slate-700 animate-in slide-in-from-top-1">
                      <span>Driver Fee ({totalDays} days)</span>
                      <span className="font-semibold text-slate-900">
                        ₱{driverTotal.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {pickupFee > 0 && (
                    <div className="flex justify-between text-slate-700 animate-in slide-in-from-top-1">
                      <span>Custom Pick-up</span>
                      <span className="font-semibold text-slate-900">
                        ₱{pickupFee.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {dropoffFee > 0 && (
                    <div className="flex justify-between text-slate-700 animate-in slide-in-from-top-1">
                      <span>Custom Drop-off</span>
                      <span className="font-semibold text-slate-900">
                        ₱{dropoffFee.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-slate-700 border-t border-slate-200 pt-3">
                    <span className="flex items-center gap-1.5">
                      Security Deposit{" "}
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                    </span>
                    <span className="font-semibold text-slate-900">
                      ₱{realFees.security_deposit_default.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-white border-t border-slate-200">
                <div className="flex items-end justify-between mb-2">
                  <p className="text-sm font-bold text-slate-700">
                    Total Payable
                  </p>
                  <p className="text-3xl font-black font-mono text-blue-600">
                    ₱{grandTotal.toLocaleString()}
                  </p>
                </div>
                <p className="text-xs font-medium text-slate-500 text-right mb-6">
                  (Due upon admin approval)
                </p>

                <Button
                  size="lg"
                  onClick={handleSubmitBooking}
                  disabled={isSubmittingCustomerBooking}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white h-14 rounded-2xl font-bold text-base shadow-md disabled:opacity-50"
                >
                  {isSubmittingCustomerBooking
                    ? "Processing..."
                    : "Submit Booking Request"}
                </Button>
                <p className="text-center text-[10px] text-slate-400 mt-3 font-medium">
                  By proceeding, you agree to our Rental Terms & Conditions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- MAP DIALOG PASSING REAL HUBS --- */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 overflow-hidden flex flex-col rounded-3xl border-slate-200 shadow-2xl gap-0">
          {/* 1. Added 'gap-0' to DialogContent 
            2. Kept shrink-0 so it doesn't crush the header 
            3. Ensured no bottom padding or margin bleeds out 
          */}
          <DialogHeader className="p-5 bg-white border-b border-slate-100 z-10 shadow-sm shrink-0 space-y-1 pb-4">
            <DialogTitle className="text-xl font-bold text-slate-900 m-0">
              Select {activeMapField === "pickup" ? "Pick-up" : "Drop-off"}{" "}
              Location
            </DialogTitle>
            <DialogDescription className="text-xs font-medium text-slate-500 m-0">
              Click a blue pin to use a Hub (Free), or click anywhere else
              inside the green zone to set a Custom Delivery Location (+₱
              {realFees.custom_pickup_fee}).
            </DialogDescription>
          </DialogHeader>

          {/* Map Container */}
          <div className="flex-1 w-full bg-slate-100 relative">
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
