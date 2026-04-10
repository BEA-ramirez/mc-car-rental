"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFormContext, useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  format,
  differenceInDays,
  addDays,
  setHours,
  setMinutes,
} from "date-fns";
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
  CreditCard,
  Mail,
  Phone,
  Edit,
  Copy,
  Receipt,
  Car,
  CalendarDays,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { cn } from "@/lib/utils";

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
import { useBookings } from "../../../hooks/use-bookings";
import { useBookingSettings } from "../../../hooks/use-settings";
import { useCustomers } from "../../../hooks/use-users";
import { useUnits } from "../../../hooks/use-units";
import { createClient } from "@/utils/supabase/client";

// --- TYPES & EXTRACTED COMPONENTS (Unchanged) ---
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
              setValue(modeField, checked ? "custom" : "hub");
              if (!checked) {
                const defaultHub = hubs[0];
                setValue(locField, defaultHub?.name || "Main Garage");
                setValue(priceField, 0);
                if (defaultHub)
                  setValue(coordsField, `${defaultHub.lat},${defaultHub.lng}`);
              } else {
                setValue(locField, "");
                setValue(
                  priceField,
                  type === "pickup"
                    ? fees.custom_pickup_fee
                    : fees.custom_dropoff_fee,
                );
                setValue(coordsField, null);
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
                    if (hub) setValue(coordsField, `${hub.lat},${hub.lng}`);
                  }}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-8 text-[11px] font-medium w-full bg-secondary border-border focus:ring-1 focus:ring-primary shadow-none rounded-lg transition-colors">
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
                      className="h-8 text-[11px] font-medium flex-1 bg-secondary border-border focus-visible:ring-primary shadow-none rounded-lg transition-colors"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className={cn(
                        "h-8 w-8 shrink-0 border-border rounded-lg shadow-none transition-colors",
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
                          "h-3.5 w-3.5",
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
                  <div className="flex items-center w-24">
                    <span className="mr-1.5 text-[10px] font-bold text-muted-foreground">
                      ₱
                    </span>
                    <Input
                      type="number"
                      {...field}
                      className="h-7 text-right text-[11px] font-bold bg-secondary border-border shadow-none rounded-md transition-colors"
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
  const { data: customers = [], isLoading: usersLoading } = useCustomers();
  const { units = [], isUnitsLoading } = useUnits();

  const [isFetchingEditData, setIsFetchingEditData] = useState(!!bookingId);
  const [startTime, setStartTime] = useState("08:00");
  const [duration, setDuration] = useState(initialDuration || 1);
  const [mapOpen, setMapOpen] = useState(false);
  const [activeMapField, setActiveMapField] = useState<
    "pickup" | "dropoff" | null
  >(null);

  const [fallbackUser, setFallbackUser] = useState<{
    user_id: string;
    full_name: string;
    email: string;
  } | null>(null);

  const hubs = settings?.hubs || [];
  const fees = settings?.fees || {
    driver_rate_per_day: 500,
    custom_pickup_fee: 500,
    custom_dropoff_fee: 500,
    security_deposit_default: 3000,
  };

  const form = useForm({
    resolver: zodResolver(AdminCreateBookingSchema),
    defaultValues: {
      pickup_type: "hub",
      pickup_location: hubs[0]?.name || "Main Garage",
      pickup_price: 0,
      dropoff_type: "hub",
      dropoff_location: hubs[0]?.name || "Main Garage",
      dropoff_price: 0,
      with_driver: false,
      driver_fee_per_day: fees.driver_rate_per_day,
      discount_amount: 0,
      security_deposit: fees.security_deposit_default,
      additional_charges: [],
      car_id: initialCarId || "",
      start_date: initialStartDate || undefined,
      is_12_hour_promo: false, // <-- NEW DEFAULT
    },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "additional_charges",
  });

  const { watch, setValue, control, reset } = form;

  // Watchers
  const wStart = watch("start_date");
  const wCarId = watch("car_id");
  const wCustomRate = watch("custom_daily_rate");
  const wPickupPrice = watch("pickup_price");
  const wDropoffPrice = watch("dropoff_price");
  const wDiscount = watch("discount_amount");
  const wPayment = watch("initial_payment");
  const wWithDriver = watch("with_driver");
  const wDriverFee = watch("driver_fee_per_day");
  const wExtras = watch("additional_charges");
  const wSecurityDeposit = watch("security_deposit");
  const w12HourPromo = watch("is_12_hour_promo"); // <-- NEW WATCHER

  // Calculations
  const selectedCar = units.find((c) => c.car_id === wCarId);
  const price12h = Number(selectedCar?.rental_rate_per_12h || 0);
  const dailyRate = wCustomRate || selectedCar?.rental_rate_per_day || 0;

  const days = duration > 0 ? duration : 1;
  const isPromoEligible = price12h > 0 && days === 1 && !wCustomRate;

  // Auto-disable promo if they change to > 1 day or use a custom rate
  useEffect(() => {
    if (!isPromoEligible && w12HourPromo) {
      setValue("is_12_hour_promo", false);
    }
  }, [isPromoEligible, w12HourPromo, setValue]);

  const rentTotal = days * dailyRate;

  // Apply the 12h promo logically as a discount
  const promoDiscount =
    w12HourPromo && isPromoEligible ? dailyRate - price12h : 0;

  const driverTotal = wWithDriver ? days * (wDriverFee || 0) : 0;
  // Calculate extras, specifically excluding any accidental deposit duplicates
  const extrasTotal =
    wExtras?.reduce((acc, curr) => {
      if (curr.category === "SECURITY_DEPOSIT") return acc;
      return acc + (curr.amount || 0);
    }, 0) || 0;

  const subTotal =
    rentTotal +
    (wPickupPrice || 0) +
    (wDropoffPrice || 0) +
    driverTotal +
    extrasTotal;

  // Ensure the promo discount is subtracted from totalPayable
  const totalPayable =
    subTotal - promoDiscount - (wDiscount || 0) + (wSecurityDeposit || 0);
  const balanceDue = totalPayable - (wPayment?.amount || 0);

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

        // --- DETECT IF IT WAS A 12 HOUR PROMO ---
        const diffHours =
          (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
        const is12HourPromo = diffHours === 12;
        const diffDays = Math.max(1, Math.ceil(diffHours / 24)); // 12h becomes 1 day

        setStartTime(format(startDate, "HH:mm"));
        setDuration(diffDays);

        let driverFee = fees.driver_rate_per_day;
        let discount = 0;
        const extras: any[] = [];

        charges?.forEach((c) => {
          if (c.category === "DRIVER_FEE") {
            driverFee = c.amount / diffDays;
          } else if (c.category === "DISCOUNT") {
            discount = Math.abs(c.amount);
          } else if (
            c.category !== "BASE_RATE" &&
            c.category !== "DELIVERY_FEE" &&
            c.category !== "PICKUP_FEE" &&
            c.category !== "PROMO_DISCOUNT" &&
            c.category !== "SECURITY_DEPOSIT" // Ignore promo discount, handled by state
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
          Number(booking.base_rate_snapshot) !==
            Number(car.rental_rate_per_day);

        reset({
          user_id: booking.user_id,
          car_id: booking.car_id,
          start_date: startDate,
          end_date: endDate,
          is_12_hour_promo: is12HourPromo, // <-- INJECTED HERE

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

          security_deposit: Number(booking.security_deposit),
          discount_amount: discount,
          custom_daily_rate: isCustomRate
            ? Number(booking.base_rate_snapshot)
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
  }, [bookingId, fees.driver_rate_per_day, replace, reset, units]);

  // --- EFFECTS (Unchanged) ---
  useEffect(() => {
    if (!fees || bookingId) return;
    const { dirtyFields } = form.formState;
    const currentDriverFee = form.getValues("driver_fee_per_day");
    const currentDeposit = form.getValues("security_deposit");

    if (
      !dirtyFields.driver_fee_per_day &&
      currentDriverFee !== fees.driver_rate_per_day
    ) {
      setValue("driver_fee_per_day", fees.driver_rate_per_day);
    }
    if (
      !dirtyFields.security_deposit &&
      currentDeposit !== fees.security_deposit_default
    ) {
      setValue("security_deposit", fees.security_deposit_default);
    }
  }, [
    fees?.driver_rate_per_day,
    fees?.security_deposit_default,
    setValue,
    bookingId,
  ]);

  useEffect(() => {
    if (wStart && duration > 0) {
      const [hours, mins] = startTime.split(":").map(Number);
      const currentStart = new Date(wStart);
      const expectedStart = setMinutes(
        setHours(new Date(currentStart), hours),
        mins,
      );
      const expectedEnd = addDays(expectedStart, duration);

      if (currentStart.getTime() !== expectedStart.getTime()) {
        setValue("start_date", expectedStart);
      }
      const currentEndVal = form.getValues("end_date");
      if (
        !currentEndVal ||
        new Date(currentEndVal).getTime() !== expectedEnd.getTime()
      ) {
        setValue("end_date", expectedEnd);
      }
    }
  }, [wStart, startTime, duration, setValue]);

  useEffect(() => {
    if (initialStartDate && !bookingId) {
      setStartTime(format(initialStartDate, "HH:mm"));
    }
  }, [initialStartDate, bookingId]);

  async function onSubmit(data: AdminBookingInput) {
    try {
      if (bookingId) {
        await updateBooking({ id: bookingId, data });
      } else {
        await createBooking(data);
      }
      if (onSuccess) onSuccess();
      else router.push("/admin/bookings");
    } catch (error) {
      console.error(error);
    }
  }

  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
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
        onSubmit={form.handleSubmit(onSubmit)}
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
              disabled={isSaving}
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
                  <User className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-bold text-foreground tracking-tight uppercase">
                    Parties Involved
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
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
                                    "w-full justify-between h-8 text-[11px] bg-secondary border-border hover:bg-background focus:ring-1 focus:ring-primary rounded-lg shadow-none transition-colors",
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
                                        value={user.full_name || ""}
                                        onSelect={() =>
                                          setValue("user_id", user.user_id)
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

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Assigned Vehicle
                    </label>
                    <FormField
                      control={control}
                      name="car_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between h-8 text-[11px] bg-secondary border-border hover:bg-background focus:ring-1 focus:ring-primary rounded-lg shadow-none transition-colors",
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
                                      {field.value
                                        ? units.find(
                                            (c) => c.car_id === field.value,
                                          )?.brand
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
                                        value={car.brand}
                                        onSelect={() =>
                                          setValue("car_id", car.car_id || "")
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
                                            {car.brand}
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
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SCHEDULE */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-bold text-foreground tracking-tight uppercase">
                      Rental Period
                    </h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-[9px] font-bold bg-secondary border border-border px-2 py-0.5 rounded uppercase tracking-widest text-muted-foreground">
                    <span>Duration:</span>
                    <span className="text-foreground">{duration * 24} hrs</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col space-y-1">
                        <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          Start Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-semibold h-8 bg-secondary border-border hover:bg-background text-[11px] rounded-lg shadow-none transition-colors",
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
                              mode="range"
                              selected={{
                                from: field.value,
                                to: addDays(field.value, duration - 1),
                              }}
                              onSelect={(_, selectedDay) => {
                                if (selectedDay) field.onChange(selectedDay);
                              }}
                              disabled={(date) => date < today}
                              initialFocus
                              className="bg-card text-foreground"
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-[9px]" />
                      </FormItem>
                    )}
                  />

                  <FormItem className="space-y-1">
                    <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Start Time
                    </FormLabel>
                    <div className="relative">
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-8 h-8 text-[11px] font-semibold bg-secondary border-border hover:bg-background focus-visible:ring-primary rounded-lg shadow-none transition-colors"
                      />
                      <Clock className="absolute left-2.5 top-2 h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                  </FormItem>

                  <FormItem className="space-y-1">
                    <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Duration (Days)
                    </FormLabel>
                    <Input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) =>
                        setDuration(parseInt(e.target.value) || 1)
                      }
                      className="h-8 text-[11px] font-semibold bg-secondary border-border hover:bg-background focus-visible:ring-primary rounded-lg shadow-none transition-colors"
                    />
                  </FormItem>
                </div>

                {/* --- PROMO CHECKBOX SECTION --- */}
                {isPromoEligible && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <div
                      onClick={() =>
                        setValue("is_12_hour_promo", !w12HourPromo)
                      }
                      className={cn(
                        "flex items-start gap-3 p-4 border rounded-xl cursor-pointer transition-all duration-300",
                        w12HourPromo
                          ? "bg-primary/10 border-primary/40 shadow-sm"
                          : "bg-secondary/50 border-border hover:border-primary/30",
                      )}
                    >
                      <div className="relative flex items-center justify-center mt-0.5 shrink-0">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-4 h-4 border-2 border-primary/50 rounded text-primary checked:bg-primary checked:border-primary transition-all outline-none cursor-pointer"
                          checked={w12HourPromo}
                          readOnly
                        />
                        <CheckCircle2
                          className="w-3 h-3 text-primary-foreground absolute opacity-0 peer-checked:opacity-100 pointer-events-none"
                          strokeWidth={4}
                        />
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-bold text-primary uppercase tracking-wider cursor-pointer">
                          Apply 12-Hour Rental Promo
                        </label>
                        <span className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">
                          Locks the system calendar to exactly 12 hours from
                          pick-up and applies the discounted rate of ₱
                          {price12h.toLocaleString()}.
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 3: LOGISTICS */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm space-y-4 transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <Car className="w-4 h-4 text-primary" />
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

              {/* SECTION 4: ADD-ONS & EXTRAS (Moved to Left Side) */}
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
                        className="h-7 text-[11px] font-semibold bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary px-2"
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
                        className="h-7 text-[11px] text-right w-20 bg-background border-border shadow-none focus-visible:ring-1 focus-visible:ring-primary px-2 font-bold text-foreground font-mono"
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
                  {/* Base Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-foreground">
                          Vehicle rental
                        </span>
                        <span className="text-[9px] font-medium text-muted-foreground mt-0.5">
                          {days} days x ₱{dailyRate.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-xs font-black text-foreground font-mono">
                        ₱ {rentTotal.toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <Switch
                        checked={!!wCustomRate}
                        onCheckedChange={(c) =>
                          setValue(
                            "custom_daily_rate",
                            c
                              ? selectedCar?.rental_rate_per_day || 1000
                              : undefined,
                          )
                        }
                        className="scale-75 origin-left data-[state=checked]:bg-primary"
                      />
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">
                        Override daily rate
                      </span>
                    </div>

                    {wCustomRate && (
                      <div className="animate-in slide-in-from-top-1">
                        <Input
                          type="number"
                          className="h-7 text-right text-[11px] font-bold max-w-[120px] bg-secondary border-border shadow-none rounded-md transition-colors"
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

                  <Separator className="bg-border" />

                  {/* --- PROMO DISPLAY --- */}
                  {w12HourPromo && isPromoEligible && (
                    <>
                      <div className="flex justify-between items-center text-primary bg-primary/10 p-2 rounded-lg border border-primary/20">
                        <span className="text-[10px] font-bold uppercase tracking-widest">
                          12H Promo Applied
                        </span>
                        <span className="text-xs font-black font-mono">
                          - ₱ {promoDiscount.toLocaleString()}
                        </span>
                      </div>
                      <Separator className="bg-border" />
                    </>
                  )}

                  {/* Driver */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={wWithDriver}
                          onCheckedChange={(c) => setValue("with_driver", c)}
                          className="scale-75 origin-left data-[state=checked]:bg-primary"
                        />
                        <span className="text-[11px] font-bold text-foreground">
                          Include driver
                        </span>
                      </div>
                      {wWithDriver && (
                        <span className="text-xs font-black text-foreground font-mono">
                          ₱ {driverTotal.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {wWithDriver && (
                      <div className="flex items-center justify-between pl-9 animate-in slide-in-from-top-1">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          Fee per day
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-muted-foreground">
                            ₱
                          </span>
                          <Input
                            type="number"
                            className="w-16 h-7 text-right px-2 text-[11px] font-bold bg-secondary border-border shadow-none rounded-md transition-colors"
                            value={wDriverFee}
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
                          <span className="font-black font-mono">
                            ₱ {wPickupPrice?.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {(wDropoffPrice || 0) > 0 && (
                        <div className="flex justify-between items-center text-foreground">
                          <span className="font-semibold">Dropoff fee</span>
                          <span className="font-black font-mono">
                            ₱ {wDropoffPrice?.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Breakdown of Add-ons */}
                  {wExtras &&
                    wExtras.filter((e) => e.category !== "SECURITY_DEPOSIT")
                      .length > 0 && (
                      <div className="space-y-1.5 pt-1.5 animate-in slide-in-from-top-1">
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                          Add-ons
                        </div>
                        {wExtras
                          .filter((e) => e.category !== "SECURITY_DEPOSIT")
                          .map((extra, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between items-center text-[10px] text-foreground"
                            >
                              <span className="font-medium truncate pr-2">
                                • {extra.category || "Unnamed Item"}
                              </span>
                              <span className="font-mono font-bold shrink-0">
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
                      <span className="text-[10px] font-bold text-muted-foreground">
                        - ₱
                      </span>
                      <Input
                        type="number"
                        className="w-16 h-7 text-right text-destructive font-black font-mono border-destructive/30 focus-visible:ring-destructive bg-destructive/5 shadow-none rounded-md"
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

                  {/* Deposit */}
                  <div className="bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20 flex justify-between items-center mt-3 transition-colors">
                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-amber-600 dark:text-amber-400">
                        Security deposit
                      </span>
                      <Popover>
                        <PopoverTrigger>
                          <Info className="h-3 w-3 text-amber-500 hover:text-amber-600 transition-colors" />
                        </PopoverTrigger>
                        <PopoverContent className="text-[9px] uppercase tracking-widest w-48 p-2 font-bold border-amber-500/20 shadow-xl bg-card">
                          Refundable holding amount required before vehicle
                          release.
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold text-amber-600/70">
                        ₱
                      </span>
                      <Input
                        type="number"
                        className="w-16 h-7 text-right text-[11px] font-black font-mono bg-background border-amber-500/30 text-amber-700 dark:text-amber-300 shadow-none rounded-md"
                        value={wSecurityDeposit}
                        onChange={(e) =>
                          setValue(
                            "security_deposit",
                            parseFloat(e.target.value) || 0,
                          )
                        }
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest pt-2.5 border-t border-border mt-1">
                    <span
                      className={cn(
                        balanceDue > 0
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400",
                      )}
                    >
                      Remaining Balance
                    </span>
                    <span className="text-xs font-mono">
                      ₱ {Math.max(0, balanceDue).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* --- FOOTER TOTALS --- */}
                <div className="bg-card border-t border-border p-0 transition-colors">
                  <div className="flex justify-between items-end px-4 py-3 bg-primary text-primary-foreground">
                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-90">
                      Grand Total
                    </span>
                    <span className="text-2xl font-black leading-none font-mono">
                      ₱ {totalPayable.toLocaleString()}
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
                            c ? { amount: 1000, method: "Cash" } : undefined,
                          )
                        }
                        className="border-muted-foreground data-[state=checked]:bg-primary data-[state=checked]:border-primary rounded"
                      />
                      <label
                        htmlFor="pay"
                        className="text-[10px] font-bold text-foreground uppercase tracking-widest cursor-pointer select-none"
                      >
                        Record initial payment now
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
                              className="h-8 text-[11px] pl-6 font-black font-mono text-foreground bg-secondary border-border shadow-none rounded-md transition-colors"
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
                            <SelectTrigger className="h-8 text-[11px] font-bold w-[90px] bg-secondary border-border shadow-none rounded-md transition-colors">
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
        <DialogContent className="max-w-4xl w-[95vw] h-[80vh] p-0 overflow-hidden flex flex-col rounded-2xl border-border bg-background shadow-2xl transition-colors duration-300">
          <DialogHeader className="p-4 bg-card border-b border-border z-10 shadow-sm shrink-0 transition-colors">
            <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-widest">
              Select {activeMapField === "pickup" ? "Pick-up" : "Drop-off"}{" "}
              Location
            </DialogTitle>
            <p className="text-[10px] font-medium text-muted-foreground mt-1">
              Click a blue pin to use a Hub (Free), or click anywhere else on
              the map to set a Custom Delivery Location.
            </p>
          </DialogHeader>
          <div className="flex-1 relative h-full bg-muted">
            <OrmocMapSelector
              hubs={hubs}
              onLocationSelect={(lat, lng, name) => {
                const field =
                  activeMapField === "pickup" ? "pickup" : "dropoff";
                if (name) {
                  setValue(`${field}_type`, "hub");
                  setValue(`${field}_location`, name);
                  setValue(`${field}_price`, 0);
                } else {
                  setValue(`${field}_type`, "custom");
                  setValue(`${field}_coordinates`, `${lat},${lng}`);
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
