"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFormContext, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addHours, parse, startOfDay } from "date-fns";
import {
  CalendarIcon,
  MapPin,
  Check,
  Plus,
  Trash2,
  CarFront,
  User,
  Info,
  Clock,
  Edit,
  Receipt,
  Car,
  CalendarDays,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

// Custom Logic
import OrmocMapSelector from "@/components/ormoc-map";
import {
  AdminCreateBookingSchema,
  AdminBookingInput,
} from "@/lib/schemas/booking";
import { useRouter } from "next/navigation";
import {
  useBookings,
  useCarUnavailableDates,
} from "../../../hooks/use-bookings";
import { useBookingSettings } from "../../../hooks/use-settings";
import { useCustomers } from "../../../hooks/use-users";
import { useUnits } from "../../../hooks/use-units";
import { createClient } from "@/utils/supabase/client";

// --- TYPES & CONSTANTS ---
const FIXED_DOWNPAYMENT = 500;

type LocationFieldProps = {
  type: "pickup" | "dropoff";
  hubs: any[];
  fees: any;
  setActiveMapField: (field: "pickup" | "dropoff") => void;
  setMapOpen: (open: boolean) => void;
};

type AdminBookingFormProps = {
  bookingId?: string;
  initialCarId?: string;
  initialStartDate?: Date;
  initialDuration?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
};

// --- EXTRACTED COMPONENTS ---
const LocationField = ({
  type,
  hubs,
  fees,
  setActiveMapField,
  setMapOpen,
}: LocationFieldProps) => {
  const { control, watch, setValue } = useFormContext<AdminBookingInput>();

  const modeField = `${type}_type` as const;
  const locField = `${type}_location` as const;
  const priceField = `${type}_price` as const;
  const coordsField = `${type}_coordinates` as const;

  const isCustom = watch(modeField) === "custom";
  const title = type === "pickup" ? "Pick-up" : "Drop-off";

  return (
    <div className="border border-border rounded-xl bg-card overflow-hidden shadow-sm transition-all hover:border-primary/50 group cursor-default">
      {/* CRITICAL FIX: Hidden inputs ensure React Hook Form tracks and submits the coordinates and type! */}
      <input type="hidden" {...control.register(modeField)} />
      <input type="hidden" {...control.register(coordsField)} />

      <div className="flex items-center justify-between px-3 py-2.5 bg-secondary/30 border-b border-border transition-colors">
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground flex items-center gap-1.5 group-hover:text-primary transition-colors">
          <MapPin className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary" />
          {title}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">
            {isCustom ? "Custom" : "Hub"}
          </span>
          <Switch
            checked={isCustom}
            className="scale-75 origin-right data-[state=checked]:bg-primary"
            onCheckedChange={(checked) => {
              setValue(modeField, checked ? "custom" : "hub", {
                shouldValidate: true,
              });
              if (!checked) {
                const defaultHub = hubs[0];
                setValue(locField, defaultHub?.name || "Main Garage", {
                  shouldValidate: true,
                });
                setValue(priceField, 0, { shouldValidate: true });
                if (defaultHub) {
                  setValue(coordsField, `${defaultHub.lat},${defaultHub.lng}`, {
                    shouldValidate: true,
                  });
                }
              } else {
                setValue(locField, "", { shouldValidate: true });
                setValue(
                  priceField,
                  type === "pickup"
                    ? fees.custom_pickup_fee
                    : fees.custom_dropoff_fee,
                  { shouldValidate: true },
                );
                setValue(coordsField, undefined as any, {
                  shouldValidate: true,
                });
              }
            }}
          />
        </div>
      </div>

      <div className="p-3 space-y-3 bg-card transition-colors">
        {!isCustom ? (
          <FormField
            control={control}
            name={locField}
            render={({ field }) => (
              <FormItem>
                <Select
                  onValueChange={(val) => {
                    field.onChange(val);
                    const hub = hubs.find((h: any) => h.name === val);
                    if (hub)
                      setValue(coordsField, `${hub.lat},${hub.lng}`, {
                        shouldValidate: true,
                      });
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-9 text-[11px] font-medium w-full bg-secondary border-border focus:ring-1 focus:ring-primary shadow-none rounded-lg transition-colors">
                      <SelectValue placeholder="Select hub" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-popover border-border rounded-lg shadow-xl">
                    {hubs.map((hub: any) => (
                      <SelectItem
                        key={hub.id}
                        value={hub.name}
                        className="text-[11px] font-semibold"
                      >
                        {hub.name}{" "}
                        <span className="text-muted-foreground font-medium ml-1">
                          (Free)
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        ) : (
          <div className="space-y-3 animate-in slide-in-from-top-1 duration-200">
            <FormField
              control={control}
              name={locField}
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-1.5">
                    <Input
                      {...field}
                      placeholder="Enter specific address..."
                      className="h-9 text-[11px] font-medium flex-1 bg-secondary border-border focus-visible:ring-primary shadow-none rounded-lg transition-colors"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className={cn(
                        "h-9 w-9 shrink-0 border-border rounded-lg shadow-none transition-colors",
                        watch(coordsField)
                          ? "bg-primary/10 border-primary/30"
                          : "bg-card hover:bg-secondary",
                      )}
                      onClick={() => {
                        setActiveMapField(type);
                        setMapOpen(true);
                      }}
                      title="Pin on map"
                    >
                      <MapPin
                        className={cn(
                          "h-4 w-4",
                          watch(coordsField)
                            ? "text-primary"
                            : "text-muted-foreground",
                        )}
                      />
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            <Separator className="bg-border" />
            <FormField
              control={control}
              name={priceField}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    Delivery Fee
                  </FormLabel>
                  <div className="flex items-center w-32">
                    <span className="mr-2 text-[10px] font-bold text-muted-foreground">
                      ₱
                    </span>
                    <Input
                      type="number"
                      {...field}
                      className="h-8 text-right text-[11px] font-medium font-mono bg-secondary border-border shadow-none rounded-md transition-colors"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// --- MOCK DATA ---
const PREDEFINED_CHARGES = [
  { label: "Damage Fee", amount: 200 },
  { label: "Cleaning Fee", amount: 100 },
  { label: "Late Fee", amount: 450 },
  { label: "Cleaning Kit", amount: 300 },
];

export default function AdminBookingForm({
  bookingId,
  initialCarId,
  initialStartDate,
  initialDuration,
  onSuccess,
  onCancel,
}: AdminBookingFormProps) {
  const router = useRouter();
  const { createBooking, updateBooking, isCreating, isBookingUpdating } =
    useBookings();
  const { data: settings, isLoading: settingsLoading } = useBookingSettings();
  const { data: customers = [] } = useCustomers();
  const { units = [] } = useUnits();

  const [isFetchingEditData, setIsFetchingEditData] = useState(!!bookingId);
  const [startTime, setStartTime] = useState("09:00");
  const [mapOpen, setMapOpen] = useState(false);
  const [activeMapField, setActiveMapField] = useState<
    "pickup" | "dropoff" | null
  >(null);

  const [fallbackUser, setFallbackUser] = useState<{
    user_id: string;
    full_name: string;
    email: string;
  } | null>(null);

  const hubs = useMemo(() => settings?.hubs || [], [settings?.hubs]);

  const fees = useMemo(() => {
    return (
      settings?.fees || {
        driver_rate_per_day: 1500,
        driver_rate_per_12h: 600,
        custom_pickup_fee: 500,
        custom_dropoff_fee: 500,
      }
    );
  }, [settings?.fees]);

  const defaultHubCoords = hubs[0]
    ? `${hubs[0].lat},${hubs[0].lng}`
    : undefined;

  const form = useForm({
    resolver: zodResolver(AdminCreateBookingSchema),
    defaultValues: {
      user_id: "",
      pickup_type: "hub",
      pickup_location: hubs[0]?.name || "Main Garage",
      pickup_coordinates: defaultHubCoords,
      pickup_price: 0,
      dropoff_type: "hub",
      dropoff_location: hubs[0]?.name || "Main Garage",
      dropoff_coordinates: defaultHubCoords,
      dropoff_price: 0,
      with_driver: false,
      driver_fee_per_day: fees.driver_rate_per_12h,
      discount_amount: 0,
      additional_charges: [],
      car_id: initialCarId || "",
      start_date: initialStartDate || undefined,
      booking_hours: initialDuration || 24,
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "additional_charges",
  });

  const { watch, setValue, control, reset } = form;

  const wStart = watch("start_date");
  const wCarId = watch("car_id");
  const wCustomRate = watch("custom_daily_rate");
  const wPickupPrice = watch("pickup_price");
  const wDropoffPrice = watch("dropoff_price");
  const wDiscount = watch("discount_amount");
  const wPayment = watch("initial_payment");
  const wWithDriver = watch("with_driver");
  const wDriverFee12h = watch("driver_fee_per_day");
  const wExtras = watch("additional_charges");
  const wHours = watch("booking_hours");

  const selectedCar = units.find((c) => c.car_id === wCarId);
  const car24hRate = Number(selectedCar?.rental_rate_per_day || 0);
  const raw12hRate = Number(selectedCar?.rental_rate_per_12h || 0);
  const has12hRate = raw12hRate > 0;
  const car12hRate = has12hRate ? raw12hRate : car24hRate;
  const hourStep = has12hRate ? 12 : 24;

  const { data: unavailableRanges, isLoading: isDatesLoading } =
    useCarUnavailableDates(wCarId);

  const [dateError, setDateError] = useState<string | null>(null);
  const [partialDayWarning, setPartialDayWarning] = useState<string | null>(
    null,
  );

  const exactStart = wStart ? parse(startTime, "HH:mm", wStart) : null;
  const exactEnd = exactStart ? addHours(exactStart, wHours || 24) : null;

  useEffect(() => {
    setPartialDayWarning(null);
    setDateError(null);

    if (bookingId) return;

    if (unavailableRanges?.length > 0) {
      if (wStart) {
        const targetStart = startOfDay(wStart);
        const targetEnd = addHours(targetStart, 24);

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

      if (exactStart && exactEnd) {
        const hasOverlap = unavailableRanges.some((range: any) => {
          const bookedStart = new Date(range.unavailable_from);
          const bookedEnd = new Date(range.unavailable_to);
          return exactStart < bookedEnd && exactEnd > bookedStart;
        });

        if (hasOverlap) {
          setDateError("Schedule conflicts with an existing booking.");
        }
      }
    }
  }, [wStart, exactStart, exactEnd, unavailableRanges, bookingId]);

  const isDateDisabled = (targetDate: Date) => {
    if (startOfDay(targetDate) < startOfDay(new Date())) return true;

    const targetStart = startOfDay(targetDate);
    const targetEnd = addHours(targetStart, 24);

    if (unavailableRanges && unavailableRanges.length > 0) {
      let totalOverlapHours = 0;

      unavailableRanges.forEach((range: any) => {
        const bStart = new Date(range.unavailable_from);
        const bEnd = new Date(range.unavailable_to);

        if (bStart < targetEnd && bEnd > targetStart) {
          const overlapStart = bStart > targetStart ? bStart : targetStart;
          const overlapEnd = bEnd < targetEnd ? bEnd : targetEnd;
          const overlapHours =
            (overlapEnd.getTime() - overlapStart.getTime()) / (1000 * 60 * 60);

          totalOverlapHours += overlapHours;
        }
      });

      if (24 - totalOverlapHours < hourStep) {
        return true;
      }
    }
    return false;
  };

  const handleHoursChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = parseInt(e.target.value);
    if (isNaN(val)) val = hourStep;
    const snappedValue = Math.max(
      hourStep,
      Math.round(val / hourStep) * hourStep,
    );
    setValue("booking_hours", snappedValue, { shouldValidate: true });
  };

  const formatDurationText = (hrs: number) => {
    const d = Math.floor(hrs / 24);
    const h = hrs % 24;
    if (d > 0 && h > 0) return `${d} day${d > 1 ? "s" : ""} and ${h} hrs`;
    if (d > 0) return `${d} day${d > 1 ? "s" : ""}`;
    return `${h} hrs`;
  };

  // --- PRICING ENGINE ---
  const fullDays = Math.floor((wHours || 24) / 24);
  const remainingHalfDays = (wHours || 24) % 24 === 12 ? 1 : 0;

  const active24hRate = wCustomRate || car24hRate;
  const active12hRate = wCustomRate ? active24hRate / 2 : car12hRate;

  const baseRentalCost =
    fullDays * active24hRate + remainingHalfDays * active12hRate;

  const driverCost = wWithDriver
    ? (fullDays * 2 + remainingHalfDays) * (wDriverFee12h || 600)
    : 0;

  const extrasTotal =
    wExtras?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;

  const platformTotalValue =
    baseRentalCost +
    (wPickupPrice || 0) +
    (wDropoffPrice || 0) +
    extrasTotal -
    (wDiscount || 0);
  const balanceDue = platformTotalValue - (wPayment?.amount || 0);

  // --- FETCH EDIT DATA ---
  useEffect(() => {
    async function fetchEditData() {
      if (!bookingId) return;
      setIsFetchingEditData(true);
      const supabase = createClient();

      try {
        const { data: booking, error: bError } = await supabase
          .from("bookings")
          .select("*, users!user_id(full_name, email)")
          .eq("booking_id", bookingId)
          .single();

        if (bError) throw bError;

        if (booking.users) {
          setFallbackUser({
            user_id: booking.user_id,
            full_name: booking.users.full_name,
            email: booking.users.email,
          });
        }

        const { data: charges } = await supabase
          .from("booking_charges")
          .select("*")
          .eq("booking_id", bookingId);

        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);

        const diffHours = Math.round(
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60),
        );

        setStartTime(format(startDate, "HH:mm"));

        let driverFee = fees.driver_rate_per_12h;
        let discount = 0;
        const extras: any[] = [];

        charges?.forEach((c) => {
          if (c.category === "DRIVER_FEE") {
            const shifts =
              Math.floor(diffHours / 24) * 2 + (diffHours % 24 === 12 ? 1 : 0);
            driverFee =
              shifts > 0 ? c.amount / shifts : fees.driver_rate_per_12h;
          } else if (c.category === "DISCOUNT") {
            discount = Math.abs(c.amount);
          } else if (
            !c.category.includes("BASE_RATE") &&
            c.category !== "DELIVERY_FEE" &&
            c.category !== "PICKUP_FEE" &&
            c.category !== "SECURITY_DEPOSIT"
          ) {
            extras.push({
              category: c.category,
              amount: c.amount,
              description: c.description || "",
            });
          }
        });

        const car = units.find((c) => c.car_id === booking.car_id);
        const isCustomRate =
          car &&
          Number(booking.rate_snapshot_24h || booking.base_rate_snapshot) !==
            Number(car.rental_rate_per_day);

        reset({
          user_id: booking.user_id,
          car_id: booking.car_id,
          start_date: startDate,
          booking_hours: diffHours,

          pickup_type: booking.pickup_type as "hub" | "custom",
          pickup_location: booking.pickup_location,
          pickup_price: Number(booking.pickup_price),
          pickup_coordinates: booking.pickup_coordinates || undefined,

          dropoff_type: booking.dropoff_type as "hub" | "custom",
          dropoff_location: booking.dropoff_location,
          dropoff_price: Number(booking.dropoff_price),
          dropoff_coordinates: booking.dropoff_coordinates || undefined,

          with_driver: booking.is_with_driver,
          driver_fee_per_day: driverFee,

          discount_amount: discount,
          custom_daily_rate: isCustomRate
            ? Number(booking.rate_snapshot_24h || booking.base_rate_snapshot)
            : undefined,

          additional_charges: extras,
        });

        replace(extras);
      } catch (err) {
        console.error("Failed to load edit data", err);
      } finally {
        setIsFetchingEditData(false);
      }
    }

    fetchEditData();
  }, [bookingId, fees.driver_rate_per_12h, replace, reset, units]);

  useEffect(() => {
    if (initialStartDate && !bookingId) {
      setStartTime(format(initialStartDate, "HH:mm"));
    }
  }, [initialStartDate, bookingId]);

  async function onSubmit(data: AdminBookingInput) {
    try {
      if (exactStart && exactEnd) {
        data.start_date = exactStart;
      }

      const finalData = {
        ...data,
        carDailyRate: active24hRate,
        car12HourRate: active12hRate,
        base_rate_snapshot: platformTotalValue,
        grand_total: platformTotalValue,
        security_deposit: 0,
      };

      if (bookingId) {
        await updateBooking({ id: bookingId, data: finalData });
      } else {
        await createBooking(finalData);
      }

      if (onSuccess) onSuccess();
      else router.push("/admin/bookings");
    } catch (error) {
      console.error(error);
    }
  }

  const isSaving = isCreating || isBookingUpdating;

  if (settingsLoading || isFetchingEditData)
    return (
      <div className="p-6 text-center text-[11px] font-semibold text-muted-foreground flex flex-col items-center justify-center h-full bg-background transition-colors duration-300">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
        {isFetchingEditData
          ? "Loading booking details..."
          : "Syncing configuration..."}
      </div>
    );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit, (errors) => {
          console.error("Validation Errors:", errors);
          toast.error(
            "Please fill in all required fields (Customer, Vehicle, Dates).",
          );
        })}
        className="flex flex-col h-full bg-background font-sans transition-colors duration-300"
      >
        {/* --- FORMAL HEADER --- */}
        <div className="flex items-center justify-between px-5 py-3 md:px-6 md:py-4 bg-card border-b border-border shrink-0 sticky top-0 z-20 shadow-sm pr-14 transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border shadow-sm">
              {bookingId ? (
                <Edit className="w-4 h-4 text-muted-foreground" />
              ) : (
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                {bookingId ? "Edit Reservation" : "New Reservation"}
              </h2>
              <p className="text-[10px] font-medium text-muted-foreground leading-none">
                {bookingId
                  ? "Update existing details."
                  : "Assign vehicle, customer, and logistics"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onCancel}
                className="h-8 text-[10px] font-semibold text-muted-foreground hover:text-foreground rounded-lg transition-colors"
              >
                Discard
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary text-primary-foreground hover:opacity-90 rounded-lg shadow-sm px-4 transition-opacity"
              disabled={isSaving || !!dateError}
            >
              {isSaving && (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              )}
              {isSaving
                ? "Saving..."
                : bookingId
                  ? "Update Booking"
                  : "Confirm Booking"}
            </Button>
          </div>
        </div>

        {/* --- SCROLLABLE BODY --- */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 max-w-6xl mx-auto">
            {/* LEFT COLUMN: DETAILS */}
            <div className="xl:col-span-2 space-y-4">
              {/* SECTION 1: ENTITIES */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <User className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-xs font-bold text-foreground tracking-tight uppercase">
                    Parties Involved
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Customer Profile
                    </label>
                    <FormField
                      control={control}
                      name="user_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between h-9 text-[11px] bg-secondary border-border hover:bg-background focus:ring-1 focus:ring-primary rounded-lg shadow-sm transition-colors",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  <div className="flex items-center truncate">
                                    <span
                                      className={cn(
                                        "truncate font-semibold",
                                        field.value ? "text-foreground" : "",
                                      )}
                                    >
                                      {field.value
                                        ? (
                                            customers.find(
                                              (u) => u.user_id === field.value,
                                            ) ||
                                            (fallbackUser?.user_id ===
                                            field.value
                                              ? fallbackUser
                                              : null)
                                          )?.full_name || "Unknown User"
                                        : "Search customer database..."}
                                    </span>
                                  </div>
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-[300px] p-0 border-border shadow-xl rounded-lg bg-popover"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search name or email..."
                                  className="text-[11px] h-9 font-medium"
                                />
                                <CommandList className="custom-scrollbar">
                                  <CommandEmpty className="text-[10px] py-4 text-center text-muted-foreground font-semibold">
                                    No matching customer found.
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {customers.map((user) => (
                                      <CommandItem
                                        key={user.user_id}
                                        value={`${user.full_name || ""} ${user.email || ""}`}
                                        onSelect={() =>
                                          setValue("user_id", user.user_id, {
                                            shouldValidate: true,
                                          })
                                        }
                                        className="py-2 cursor-pointer transition-colors focus:bg-secondary"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-3.5 w-3.5",
                                            user.user_id === field.value
                                              ? "opacity-100 text-primary"
                                              : "opacity-0",
                                          )}
                                        />
                                        <div className="flex flex-col overflow-hidden">
                                          <span className="text-[11px] font-bold text-foreground truncate">
                                            {user.full_name}
                                          </span>
                                          <span className="text-[9px] font-medium text-muted-foreground truncate">
                                            {user.email}
                                          </span>
                                        </div>
                                      </CommandItem>
                                    ))}
                                  </CommandGroup>
                                </CommandList>
                              </Command>
                            </PopoverContent>
                          </Popover>
                          <FormMessage className="text-[9px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Assigned Vehicle
                    </label>
                    <FormField
                      control={control}
                      name="car_id"
                      render={({ field }) => {
                        const selectedVehicle = units.find(
                          (c) => c.car_id === field.value,
                        );

                        return (
                          <FormItem className="flex flex-col">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className={cn(
                                      "w-full justify-between h-9 text-[11px] bg-secondary border-border hover:bg-background focus:ring-1 focus:ring-primary rounded-lg shadow-sm transition-colors",
                                      !field.value && "text-muted-foreground",
                                    )}
                                  >
                                    <div className="flex items-center truncate">
                                      <CarFront className="mr-2 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                                      <span
                                        className={cn(
                                          "truncate font-semibold",
                                          field.value ? "text-foreground" : "",
                                        )}
                                      >
                                        {field.value && selectedVehicle
                                          ? `${selectedVehicle.brand} ${selectedVehicle.model} - ${selectedVehicle.plate_number}`
                                          : "Select unit from fleet..."}
                                      </span>
                                    </div>
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-[300px] p-0 border-border shadow-xl rounded-lg bg-popover"
                                align="start"
                              >
                                <Command>
                                  <CommandInput
                                    placeholder="Search unit..."
                                    className="text-[11px] h-9 font-medium"
                                  />
                                  <CommandList className="custom-scrollbar">
                                    <CommandEmpty className="text-[10px] py-4 text-center text-muted-foreground font-semibold">
                                      No vehicle found.
                                    </CommandEmpty>
                                    <CommandGroup>
                                      {units.map((car) => (
                                        <CommandItem
                                          key={car.car_id}
                                          value={`${car.brand} ${car.plate_number}`}
                                          onSelect={() =>
                                            setValue(
                                              "car_id",
                                              car.car_id || "",
                                              { shouldValidate: true },
                                            )
                                          }
                                          className="py-2 cursor-pointer transition-colors focus:bg-secondary"
                                        >
                                          <Check
                                            className={cn(
                                              "mr-2 h-3.5 w-3.5",
                                              car.car_id === field.value
                                                ? "opacity-100 text-primary"
                                                : "opacity-0",
                                            )}
                                          />
                                          <div className="flex flex-col overflow-hidden">
                                            <span className="text-[11px] font-bold text-foreground truncate">
                                              {`${car.brand} ${car.model}`}
                                            </span>
                                            <span className="text-[9px] font-bold font-mono text-muted-foreground truncate uppercase tracking-widest mt-0.5">
                                              {car.plate_number}
                                            </span>
                                          </div>
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>
                            <FormMessage className="text-[9px]" />
                          </FormItem>
                        );
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SCHEDULE */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    <h3 className="text-xs font-bold text-foreground tracking-tight uppercase">
                      Rental Period
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold bg-secondary border border-border px-2 py-0.5 rounded uppercase tracking-widest text-muted-foreground">
                    <span>Block Match:</span>
                    <span className="text-foreground">
                      {formatDurationText(wHours || 24)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1.5">
                        <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          Start Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-semibold h-9 bg-secondary border-border hover:bg-background text-[11px] rounded-lg shadow-sm transition-colors",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMM d, yyyy")
                              ) : (
                                <span>Pick date</span>
                              )}
                              <CalendarIcon className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 border-border shadow-xl rounded-xl bg-card"
                            align="start"
                          >
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={(selectedDay) => {
                                if (selectedDay) {
                                  field.onChange(selectedDay);
                                  setValue("start_date", selectedDay, {
                                    shouldValidate: true,
                                  });
                                }
                              }}
                              disabled={isDateDisabled}
                              initialFocus
                              className="bg-card text-foreground"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-[9px]" />
                      </FormItem>
                    )}
                  />

                  <FormItem className="space-y-1.5">
                    <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Start Time
                    </FormLabel>
                    <div className="relative">
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-8 h-9 text-[11px] font-semibold bg-secondary border-border hover:bg-background focus-visible:ring-primary rounded-lg shadow-sm transition-colors"
                      />
                      <Clock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </FormItem>

                  <FormField
                    control={control}
                    name="booking_hours"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5">
                        <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between">
                          Duration
                          <span className="text-primary opacity-70">
                            Steps of {hourStep}h
                          </span>
                        </FormLabel>
                        <div className="relative">
                          <Input
                            type="number"
                            min={hourStep}
                            step={hourStep}
                            {...field}
                            onChange={handleHoursChange}
                            onBlur={handleHoursChange}
                            className="h-9 text-[11px] font-semibold bg-secondary border-border hover:bg-background focus-visible:ring-primary rounded-lg shadow-sm transition-colors pr-10"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] font-bold text-muted-foreground">
                            HRS
                          </span>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* WARNING BLOCKS */}
                {partialDayWarning && (
                  <div className="bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[10px] font-semibold p-2.5 rounded-lg flex items-start gap-2 mt-2">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {partialDayWarning}
                  </div>
                )}

                {dateError && (
                  <div className="bg-destructive/10 border border-destructive/20 text-destructive text-[10px] font-semibold p-2.5 rounded-lg flex items-start gap-2 mt-2">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                    {dateError}
                  </div>
                )}
              </div>

              {/* SECTION 3: LOGISTICS */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-3.5 h-3.5 text-primary" />
                  <h3 className="text-xs font-bold text-foreground tracking-tight uppercase">
                    Location Logistics
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <LocationField
                    type="pickup"
                    hubs={hubs}
                    fees={fees}
                    setActiveMapField={setActiveMapField}
                    setMapOpen={setMapOpen}
                  />
                  <LocationField
                    type="dropoff"
                    hubs={hubs}
                    fees={fees}
                    setActiveMapField={setActiveMapField}
                    setMapOpen={setMapOpen}
                  />
                </div>
              </div>

              {/* SECTION 4: ADD-ONS & EXTRAS */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-3 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Plus className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground tracking-tight uppercase">
                      Add-ons & Extras
                    </h3>
                  </div>
                  <Badge
                    variant="secondary"
                    className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary border-border"
                  >
                    Total: ₱ {extrasTotal.toLocaleString()}
                  </Badge>
                </div>

                <div className="space-y-2">
                  {fields.map((item, index) => (
                    <div
                      key={item.id}
                      className="flex gap-2 items-center bg-secondary/50 p-1.5 rounded-lg border border-border shadow-sm transition-colors"
                    >
                      <Input
                        value={watch(`additional_charges.${index}.category`)}
                        onChange={(e) =>
                          setValue(
                            `additional_charges.${index}.category`,
                            e.target.value,
                          )
                        }
                        className="h-7 text-[11px] font-medium bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary px-2"
                        placeholder="Item name"
                      />
                      <span className="text-[10px] font-bold text-muted-foreground">
                        ₱
                      </span>
                      <Input
                        type="number"
                        value={watch(`additional_charges.${index}.amount`)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value);
                          setValue(
                            `additional_charges.${index}.amount`,
                            isNaN(val) ? 0 : val,
                          );
                        }}
                        className="h-7 text-[11px] text-right w-30 bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary px-2 font-medium text-foreground font-mono"
                      />
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 text-destructive/70 hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-md transition-colors"
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}

                  <div className="flex gap-2 pt-1.5">
                    <Select
                      onValueChange={(val) => {
                        const pre = PREDEFINED_CHARGES.find(
                          (p) => p.label === val,
                        );
                        if (pre)
                          append({
                            category: pre.label,
                            amount: pre.amount,
                            description: "",
                          });
                      }}
                    >
                      <SelectTrigger className="h-8 text-[10px] font-bold uppercase tracking-widest flex-1 bg-secondary border-border shadow-none rounded-lg transition-colors text-muted-foreground">
                        <SelectValue placeholder="Add predefined item..." />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border rounded-lg shadow-xl">
                        {PREDEFINED_CHARGES.map((c) => (
                          <SelectItem
                            key={c.label}
                            value={c.label}
                            className="text-[10px] font-bold uppercase tracking-widest"
                          >
                            {c.label}{" "}
                            <span className="text-muted-foreground font-medium ml-1">
                              (+₱{c.amount})
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => append({ category: "Custom", amount: 0 })}
                      className="h-8 text-[10px] font-bold uppercase tracking-widest border-border bg-secondary hover:bg-background text-foreground shadow-none rounded-lg transition-colors"
                    >
                      <Plus className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />{" "}
                      Custom
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: FINANCIAL INVOICE */}
            <div className="space-y-4 h-full">
              <div className="bg-card border border-border rounded-xl shadow-md sticky top-0 overflow-hidden flex flex-col h-auto transition-colors">
                {/* Header */}
                <div className="bg-secondary/50 border-b border-border px-4 py-3 flex items-center justify-between transition-colors">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground tracking-widest uppercase">
                      Invoice
                    </h3>
                  </div>
                </div>

                {/* Line Items */}
                <div className="p-4 space-y-4 bg-background flex-1 transition-colors">
                  <div className="space-y-2">
                    {/* 24h Blocks */}
                    {fullDays > 0 && (
                      <div className="flex justify-between items-start">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-foreground">
                            Base Rental (24H Blocks)
                          </span>
                          <span className="text-[9px] font-medium text-muted-foreground mt-0.5">
                            {fullDays} days x ₱{active24hRate.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-foreground font-mono">
                          ₱ {(fullDays * active24hRate).toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* 12h Blocks */}
                    {remainingHalfDays > 0 && (
                      <div className="flex justify-between items-start pt-1">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-bold text-foreground">
                            Base Rental (12H Block)
                          </span>
                          <span className="text-[9px] font-medium text-muted-foreground mt-0.5">
                            1 shift x ₱{active12hRate.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-foreground font-mono">
                          ₱ {active12hRate.toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-border mt-2">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={!!wCustomRate}
                          onCheckedChange={(c) =>
                            setValue(
                              "custom_daily_rate",
                              c ? car24hRate || 1000 : undefined,
                            )
                          }
                          className="scale-75 origin-left data-[state=checked]:bg-primary"
                        />
                        <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                          Override daily rate
                        </span>
                      </div>
                      {wCustomRate && (
                        <div className="animate-in slide-in-from-top-1 flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            ₱
                          </span>
                          <Input
                            type="number"
                            className="h-7 w-28 px-2 text-right text-[11px] font-medium font-mono bg-secondary border-border shadow-none rounded-md transition-colors"
                            value={wCustomRate}
                            onChange={(e) =>
                              setValue(
                                "custom_daily_rate",
                                parseFloat(e.target.value),
                              )
                            }
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className="bg-border" />

                  {/* Driver Fee (Visually Isolated) */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={wWithDriver}
                          onCheckedChange={(c) => setValue("with_driver", c)}
                          className="scale-75 origin-left data-[state=checked]:bg-primary"
                        />
                        <span className="text-[11px] font-bold text-foreground">
                          Include Driver Service
                        </span>
                      </div>
                      {wWithDriver && (
                        <span className="text-xs font-semibold text-yellow-600 dark:text-yellow-500 font-mono">
                          ₱ {driverCost.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {wWithDriver && (
                      <div className="flex items-center justify-between pl-9 animate-in slide-in-from-top-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          Fee per 12h Shift
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            ₱
                          </span>
                          <Input
                            type="number"
                            className="w-24 h-7 text-right px-2 text-[11px] font-medium font-mono bg-secondary border-border shadow-none rounded-md transition-colors"
                            value={wDriverFee12h}
                            onChange={(e) =>
                              setValue(
                                "driver_fee_per_day",
                                parseFloat(e.target.value),
                              )
                            }
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="bg-border" />

                  {/* Logistics Fees */}
                  {((wPickupPrice || 0) > 0 || (wDropoffPrice || 0) > 0) && (
                    <div className="space-y-1.5 text-[11px]">
                      {(wPickupPrice || 0) > 0 && (
                        <div className="flex justify-between items-center text-foreground">
                          <span className="font-semibold">Pickup fee</span>
                          <span className="font-semibold font-mono">
                            ₱ {wPickupPrice?.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {(wDropoffPrice || 0) > 0 && (
                        <div className="flex justify-between items-center text-foreground">
                          <span className="font-semibold">Dropoff fee</span>
                          <span className="font-semibold font-mono">
                            ₱ {wDropoffPrice?.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Breakdown of Add-ons */}
                  {wExtras && wExtras.length > 0 && (
                    <div className="space-y-1.5 pt-1.5 animate-in slide-in-from-top-1">
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Add-ons
                      </div>
                      {wExtras.map((extra, idx) => (
                        <div
                          key={idx}
                          className="flex justify-between items-center text-[10px] text-foreground"
                        >
                          <span className="font-medium truncate pr-2">
                            • {extra.category || "Unnamed Item"}
                          </span>
                          <span className="font-mono font-semibold shrink-0">
                            ₱ {extra.amount?.toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Discount */}
                  <div className="flex justify-between items-center pt-1.5">
                    <span className="text-[11px] font-bold text-foreground">
                      Discount
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-destructive">
                        - ₱
                      </span>
                      <Input
                        type="number"
                        className="w-24 h-7 text-right px-2 text-[11px] font-medium font-mono text-destructive bg-destructive/5 border-destructive/20 shadow-none rounded-md focus-visible:ring-destructive"
                        value={wDiscount}
                        onChange={(e) =>
                          setValue(
                            "discount_amount",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest pt-2.5 border-t border-border mt-1">
                    <span
                      className={cn(
                        balanceDue > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      Remaining Balance
                    </span>
                    <span className="text-xs font-mono font-semibold">
                      ₱ {Math.max(0, balanceDue).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* --- FOOTER TOTALS --- */}
                <div className="bg-card border-t border-border p-0 transition-colors">
                  <div className="flex justify-between items-end px-4 py-3 bg-primary text-primary-foreground">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                      Platform Total
                    </span>
                    <span className="text-xl font-bold leading-none font-mono">
                      ₱ {platformTotalValue.toLocaleString()}
                    </span>
                  </div>

                  {/* Upfront Payment Section connected to Total */}
                  <div className="p-3 bg-secondary/30 border-t border-border">
                    <div className="flex items-center space-x-2 mb-2.5">
                      <Checkbox
                        id="pay"
                        checked={!!wPayment}
                        onCheckedChange={(c) =>
                          setValue(
                            "initial_payment",
                            c
                              ? { amount: FIXED_DOWNPAYMENT, method: "Cash" }
                              : undefined,
                          )
                        }
                        className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                      />
                      <label
                        htmlFor="pay"
                        className="text-[10px] font-bold text-foreground uppercase tracking-widest cursor-pointer select-none"
                      >
                        Record Initial Downpayment Now
                      </label>
                    </div>

                    {wPayment && (
                      <div className="grid gap-2 animate-in fade-in slide-in-from-top-2 mb-2">
                        <div className="flex gap-1.5">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">
                              ₱
                            </span>
                            <Input
                              type="number"
                              placeholder="Amount"
                              className="h-9 text-[12px] pl-6 font-semibold font-mono text-foreground bg-secondary border-border shadow-none rounded-md transition-colors"
                              value={wPayment.amount}
                              onChange={(e) =>
                                setValue(
                                  "initial_payment.amount",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                            />
                          </div>
                          <Select
                            value={wPayment.method}
                            onValueChange={(v: any) =>
                              setValue("initial_payment.method", v)
                            }
                          >
                            <SelectTrigger className="h-9 text-[11px] font-bold w-[90px] bg-secondary border-border shadow-none rounded-md transition-colors">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-popover border-border rounded-md shadow-xl">
                              <SelectItem
                                value="Cash"
                                className="text-[10px] font-bold uppercase tracking-widest"
                              >
                                Cash
                              </SelectItem>
                              <SelectItem
                                value="GCash"
                                className="text-[10px] font-bold uppercase tracking-widest"
                              >
                                GCash
                              </SelectItem>
                              <SelectItem
                                value="Card"
                                className="text-[10px] font-bold uppercase tracking-widest"
                              >
                                Card
                              </SelectItem>
                              <SelectItem
                                value="Bank Transfer"
                                className="text-[10px] font-bold uppercase tracking-widest"
                              >
                                Transfer
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-5xl gap-0 w-[95vw] h-[80vh] p-0 overflow-hidden flex flex-col rounded-2xl border-border bg-background shadow-2xl transition-colors duration-300 [&>button.absolute]:hidden">
          <DialogHeader className="p-4 bg-card border-b border-border z-10 shadow-sm shrink-0 flex flex-row items-center justify-between transition-colors">
            <div>
              <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-widest">
                Select {activeMapField === "pickup" ? "Pick-up" : "Drop-off"}{" "}
                Location
              </DialogTitle>
              <p className="text-[10px] font-medium text-muted-foreground mt-1">
                Click a blue pin to use a Hub (Free), or click anywhere else on
                the map to set a Custom Delivery Location.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMapOpen(false)}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md"
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>
          <div className="flex-1 relative h-full bg-muted">
            <OrmocMapSelector
              hubs={hubs}
              onLocationSelect={(lat, lng, name) => {
                const field =
                  activeMapField === "pickup" ? "pickup" : "dropoff";

                const isOfficialHub = hubs.some((h: any) => h.name === name);

                if (isOfficialHub && name) {
                  setValue(`${field}_type`, "hub", { shouldValidate: true });
                  setValue(`${field}_location`, name, { shouldValidate: true });
                  setValue(`${field}_price`, 0, { shouldValidate: true });

                  const matchedHub = hubs.find((h: any) => h.name === name);
                  if (matchedHub) {
                    setValue(
                      `${field}_coordinates`,
                      `${matchedHub.lat},${matchedHub.lng}`,
                      { shouldValidate: true },
                    );
                  }
                } else {
                  setValue(`${field}_type`, "custom", { shouldValidate: true });
                  setValue(
                    `${field}_location`,
                    name || `Custom Pin (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
                    { shouldValidate: true },
                  );
                  setValue(`${field}_coordinates`, `${lat},${lng}`, {
                    shouldValidate: true,
                  });
                }
                setMapOpen(false);
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
