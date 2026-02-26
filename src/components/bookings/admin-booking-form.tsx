"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useFormContext } from "react-hook-form";
import { useForm, useFieldArray } from "react-hook-form";
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

// --- TYPES ---
type LocationFieldProps = {
  type: "pickup" | "dropoff";
  hubs: any[];
  fees: any;
  setActiveMapField: (field: "pickup" | "dropoff") => void;
  setMapOpen: (open: boolean) => void;
};

type AdminBookingFormProps = {
  bookingId?: string; // NEW!
  initialCarId?: string;
  initialStartDate?: Date;
  initialDuration?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
};

// --- EXTRACTED COMPONENT ---
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
    <div className="border border-slate-200 rounded-md bg-white overflow-hidden shadow-sm transition-all hover:border-slate-300">
      <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border-b border-slate-100">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          {title}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-[9px] text-slate-500 uppercase font-bold tracking-wide">
            {isCustom ? "Custom Address" : "Hub Location"}
          </span>
          <Switch
            checked={isCustom}
            className="scale-75 origin-right data-[state=checked]:bg-blue-600"
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

      <div className="p-3 space-y-3">
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
                    <SelectTrigger className="h-9 text-xs w-full bg-white border-slate-200 focus:ring-1 focus:ring-slate-300">
                      <SelectValue placeholder="Select Hub" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {hubs.map((hub: any) => (
                      <SelectItem
                        key={hub.id}
                        value={hub.name}
                        className="text-xs"
                      >
                        {hub.name}{" "}
                        <span className="text-slate-400 font-medium ml-1">
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
                      className="h-9 text-xs flex-1 bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-slate-300"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className={cn(
                        "h-9 w-9 shrink-0 border-slate-200",
                        watch(coordsField) && "bg-blue-50 border-blue-200",
                      )}
                      onClick={() => {
                        setActiveMapField(type);
                        setMapOpen(true);
                      }}
                      title="Pin on Map"
                    >
                      <MapPin
                        className={cn(
                          "h-4 w-4",
                          watch(coordsField)
                            ? "text-blue-600"
                            : "text-slate-400",
                        )}
                      />
                    </Button>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex items-center gap-2">
              <Separator className="flex-1" />
            </div>
            <FormField
              control={control}
              name={priceField}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Delivery Fee
                  </FormLabel>
                  <div className="flex items-center w-28">
                    <span className="mr-1.5 text-xs font-semibold text-slate-400">
                      ₱
                    </span>
                    <Input
                      type="number"
                      {...field}
                      className="h-8 text-right text-xs bg-white border-slate-200 font-medium"
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
  { label: "Child Seat", amount: 150 },
  { label: "Cooler Box", amount: 100 },
  { label: "Portable WiFi", amount: 200 },
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

  // --- NEW: FALLBACK USER STATE ---
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

  // Calculations
  const selectedCar = units.find((c) => c.car_id === wCarId);
  const days = duration > 0 ? duration : 1;
  const dailyRate = wCustomRate || selectedCar?.rental_rate_per_day || 0;
  const rentTotal = days * dailyRate;
  const driverTotal = wWithDriver ? days * (wDriverFee || 0) : 0;
  const extrasTotal =
    wExtras?.reduce((acc, curr) => acc + (curr.amount || 0), 0) || 0;
  const subTotal =
    rentTotal +
    (wPickupPrice || 0) +
    (wDropoffPrice || 0) +
    driverTotal +
    extrasTotal;
  const totalPayable = subTotal - (wDiscount || 0) + (wSecurityDeposit || 0);
  const balanceDue = totalPayable - (wPayment?.amount || 0);

  // --- FETCH EDIT DATA ---
  useEffect(() => {
    async function fetchEditData() {
      if (!bookingId) return;
      setIsFetchingEditData(true);
      const supabase = createClient();

      try {
        // 1. Fetch Booking AND the associated user
        const { data: booking, error: bError } = await supabase
          .from("bookings")
          .select("*, users!user_id(full_name, email)")
          .eq("booking_id", bookingId)
          .single();

        if (bError) throw bError;

        // --- NEW: SET FALLBACK USER ---
        if (booking.users) {
          setFallbackUser({
            user_id: booking.user_id,
            full_name: booking.users.full_name,
            email: booking.users.email,
          });
        }

        // 2. Fetch Charges
        const { data: charges } = await supabase
          .from("booking_charges")
          .select("*")
          .eq("booking_id", bookingId);

        // 3. Reconstruct the form state
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        const diffDays = Math.max(
          1,
          Math.ceil(
            (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
          ),
        );

        setStartTime(format(startDate, "HH:mm"));
        setDuration(diffDays);

        // Extract special charges to map back to specific fields
        let driverFee = fees.driver_rate_per_day;
        let discount = 0;
        const extras: any[] = [];

        charges?.forEach((c) => {
          if (c.category === "Driver Fee") {
            driverFee = c.amount / diffDays;
          } else if (c.category === "Discount") {
            discount = Math.abs(c.amount);
          } else if (
            c.category !== "Base Rate" &&
            c.category !== "Delivery Fee"
          ) {
            extras.push({
              category: c.category,
              amount: c.amount,
              description: c.description || "",
            });
          }
        });

        // Determine if custom rate was used (by comparing to car default)
        const car = units.find((c) => c.car_id === booking.car_id);
        const isCustomRate =
          car &&
          Number(booking.base_rate_snapshot) !==
            Number(car.rental_rate_per_day);

        // 4. Reset the form with the fetched data
        reset({
          user_id: booking.user_id,
          car_id: booking.car_id,
          start_date: startDate,
          end_date: endDate,

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

  // --- EFFECTS ---
  useEffect(() => {
    if (!fees || bookingId) return; // Skip default overrides if editing
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
      <div className="p-6 text-center text-xs text-muted-foreground flex flex-col items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 mb-4"></div>
        {isFetchingEditData
          ? "Loading booking details..."
          : "Syncing configuration..."}
      </div>
    );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full bg-slate-50 font-sans"
      >
        {/* --- FORMAL HEADER --- */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20 shadow-sm pr-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center border border-slate-200">
              {bookingId ? (
                <Edit className="w-4 h-4 text-slate-700" />
              ) : (
                <CalendarDays className="w-4 h-4 text-slate-700" />
              )}
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
                {bookingId ? "Edit Reservation" : "New Reservation"}
              </h2>
              <p className="text-[11px] font-medium text-slate-500 leading-none">
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
                className="h-8 text-xs font-semibold text-slate-600 hover:text-slate-900"
              >
                Discard
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-sm px-4"
              disabled={isSaving}
            >
              {isSaving
                ? "Saving..."
                : bookingId
                  ? "Update Booking"
                  : "Confirm Booking"}
            </Button>
          </div>
        </div>

        {/* --- SCROLLABLE BODY --- */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* LEFT COLUMN: DETAILS */}
            <div className="xl:col-span-2 space-y-6">
              {/* SECTION 1: ENTITIES */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    Parties Involved
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                                    "w-full justify-between h-9 text-xs bg-slate-50/50 border-slate-200 hover:bg-white focus:ring-1 focus:ring-slate-300",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  <div className="flex items-center truncate">
                                    <span
                                      className={cn(
                                        "truncate font-medium",
                                        field.value ? "text-slate-900" : "",
                                      )}
                                    >
                                      {/* --- NEW: FALLBACK DISPLAY LOGIC --- */}
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
                              className="w-[300px] p-0 border-slate-200 shadow-xl"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search name or email..."
                                  className="text-xs h-9"
                                />
                                <CommandList>
                                  <CommandEmpty className="text-xs py-4 text-center text-slate-500">
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
                                        className="py-2 cursor-pointer"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            user.user_id === field.value
                                              ? "opacity-100 text-blue-600"
                                              : "opacity-0",
                                          )}
                                        />
                                        <div className="flex flex-col overflow-hidden">
                                          <span className="text-xs font-bold text-slate-800 truncate">
                                            {user.full_name}
                                          </span>
                                          <span className="text-[10px] font-medium text-slate-500 truncate">
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
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
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
                                    "w-full justify-between h-9 text-xs bg-slate-50/50 border-slate-200 hover:bg-white focus:ring-1 focus:ring-slate-300",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  <div className="flex items-center truncate">
                                    <CarFront className="mr-2 h-3.5 w-3.5 text-slate-400 shrink-0" />
                                    <span
                                      className={cn(
                                        "truncate font-medium",
                                        field.value ? "text-slate-900" : "",
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
                              className="w-[300px] p-0 border-slate-200 shadow-xl"
                              align="start"
                            >
                              <Command>
                                <CommandInput
                                  placeholder="Search unit..."
                                  className="text-xs h-9"
                                />
                                <CommandList>
                                  <CommandEmpty className="text-xs py-4 text-center text-slate-500">
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
                                        className="py-2 cursor-pointer"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-4 w-4",
                                            car.car_id === field.value
                                              ? "opacity-100 text-blue-600"
                                              : "opacity-0",
                                          )}
                                        />
                                        <div className="flex flex-col overflow-hidden">
                                          <span className="text-xs font-bold text-slate-800 truncate">
                                            {car.brand}
                                          </span>
                                          <span className="text-[10px] font-medium text-slate-500 truncate font-mono mt-0.5">
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
                          <FormMessage className="text-[10px]" />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: SCHEDULE */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                      Rental Period
                    </h3>
                  </div>
                  {/* Auto-Return Summary Badge */}
                  <div className="flex items-center gap-2 text-[11px] font-medium bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-sm">
                    <span className="text-slate-500">Duration:</span>
                    <span className="font-bold text-slate-800">
                      {duration * 24} hrs
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Start Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-medium h-9 bg-slate-50/50 border-slate-200 hover:bg-white text-xs",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMM d, yyyy")
                              ) : (
                                <span>Pick date</span>
                              )}
                              <CalendarIcon className="ml-auto h-3.5 w-3.5 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-auto p-0 border-slate-200 shadow-xl rounded-xl"
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
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Start Time
                    </FormLabel>
                    <div className="relative">
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-9 h-9 text-xs font-medium bg-slate-50/50 border-slate-200 hover:bg-white focus-visible:ring-1 focus-visible:ring-slate-300 transition-colors"
                      />
                      <Clock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    </div>
                  </FormItem>

                  <FormItem>
                    <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      Duration (Days)
                    </FormLabel>
                    <Input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) =>
                        setDuration(parseInt(e.target.value) || 1)
                      }
                      className="h-9 text-xs font-medium bg-slate-50/50 border-slate-200 hover:bg-white focus-visible:ring-1 focus-visible:ring-slate-300 transition-colors"
                    />
                  </FormItem>
                </div>
              </div>

              {/* SECTION 3: LOGISTICS */}
              <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Car className="w-4 h-4 text-slate-400" />
                  <h3 className="text-sm font-bold text-slate-800 tracking-tight">
                    Location Logistics
                  </h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
            </div>

            {/* RIGHT COLUMN: FINANCIAL INVOICE */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-lg shadow-md sticky top-6 overflow-hidden flex flex-col">
                {/* Header */}
                <div className="bg-slate-900 border-b border-slate-800 px-5 py-4 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2">
                    <Receipt className="w-4 h-4 text-slate-300" />
                    <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                      Invoice
                    </h3>
                  </div>
                </div>

                {/* Line Items */}
                <div className="p-5 space-y-5 bg-slate-50 flex-1">
                  {/* Base Rate */}
                  <div className="space-y-2.5">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-800">
                          Vehicle Rental
                        </span>
                        <span className="text-[10px] font-medium text-slate-500 mt-0.5">
                          {days} Days x ₱{dailyRate.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-900">
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
                        className="scale-75 origin-left data-[state=checked]:bg-blue-600"
                      />
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                        Override daily rate
                      </span>
                    </div>

                    {wCustomRate && (
                      <div className="animate-in slide-in-from-top-1">
                        <Input
                          type="number"
                          className="h-8 text-right text-xs max-w-[140px] bg-white border-slate-200 font-medium shadow-sm"
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

                  <Separator className="border-slate-200" />

                  {/* Driver */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={wWithDriver}
                          onCheckedChange={(c) => setValue("with_driver", c)}
                          className="scale-75 origin-left data-[state=checked]:bg-blue-600"
                        />
                        <span className="text-xs font-bold text-slate-800">
                          Include Driver
                        </span>
                      </div>
                      {wWithDriver && (
                        <span className="text-sm font-bold text-slate-900">
                          ₱ {driverTotal.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {wWithDriver && (
                      <div className="flex items-center justify-between pl-10 animate-in slide-in-from-top-1">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          Fee per day
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-400">
                            ₱
                          </span>
                          <Input
                            type="number"
                            className="w-20 h-8 text-right px-2 text-xs bg-white border-slate-200 font-medium shadow-sm"
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

                  {/* Extras Accordion */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem
                      value="charges"
                      className="border-y border-slate-200"
                    >
                      <AccordionTrigger className="py-3 hover:no-underline flex justify-between w-full pr-0">
                        <span className="text-xs font-bold text-slate-800">
                          Add-ons & Fees
                        </span>
                        <span className="text-sm font-bold text-slate-900 pr-2">
                          ₱ {extrasTotal.toLocaleString()}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-2 pb-3">
                        <div className="space-y-2">
                          {fields.map((item, index) => (
                            <div
                              key={item.id}
                              className="flex gap-2 items-center bg-white p-1.5 rounded-md border border-slate-200 shadow-sm"
                            >
                              <Input
                                value={watch(
                                  `additional_charges.${index}.category`,
                                )}
                                onChange={(e) =>
                                  setValue(
                                    `additional_charges.${index}.category`,
                                    e.target.value,
                                  )
                                }
                                className="h-7 text-xs bg-transparent border-none shadow-none focus-visible:ring-0 px-2 font-medium"
                                placeholder="Item name"
                              />
                              <span className="text-[10px] font-bold text-slate-400">
                                ₱
                              </span>
                              <Input
                                type="number"
                                value={watch(
                                  `additional_charges.${index}.amount`,
                                )}
                                onChange={(e) => {
                                  const val = parseFloat(e.target.value);
                                  setValue(
                                    `additional_charges.${index}.amount`,
                                    isNaN(val) ? 0 : val,
                                  );
                                }}
                                className="h-7 text-xs text-right w-16 bg-transparent border-none shadow-none focus-visible:ring-0 px-1 font-bold text-slate-700"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-7 w-7 text-red-400 hover:text-red-600 hover:bg-red-50 shrink-0 rounded-sm"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-2">
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
                              <SelectTrigger className="h-8 text-[11px] font-medium flex-1 bg-white border-slate-200 shadow-sm">
                                <SelectValue placeholder="Add an item..." />
                              </SelectTrigger>
                              <SelectContent>
                                {PREDEFINED_CHARGES.map((c) => (
                                  <SelectItem
                                    key={c.label}
                                    value={c.label}
                                    className="text-[11px] font-medium"
                                  >
                                    {c.label}{" "}
                                    <span className="text-slate-400 font-bold ml-1">
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
                              onClick={() =>
                                append({ category: "Custom", amount: 0 })
                              }
                              className="h-8 w-8 shrink-0 p-0 border-slate-200 shadow-sm bg-white"
                            >
                              <Plus className="h-4 w-4 text-slate-600" />
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Logistics Fees */}
                  {((wPickupPrice || 0) > 0 || (wDropoffPrice || 0) > 0) && (
                    <div className="space-y-2 text-xs">
                      {(wPickupPrice || 0) > 0 && (
                        <div className="flex justify-between items-center text-slate-700">
                          <span className="font-semibold">Pickup Fee</span>
                          <span className="font-bold text-slate-900">
                            ₱ {wPickupPrice?.toLocaleString()}
                          </span>
                        </div>
                      )}
                      {(wDropoffPrice || 0) > 0 && (
                        <div className="flex justify-between items-center text-slate-700">
                          <span className="font-semibold">Dropoff Fee</span>
                          <span className="font-bold text-slate-900">
                            ₱ {wDropoffPrice?.toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Discount */}
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs font-bold text-slate-800">
                      Discount
                    </span>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-400">
                        - ₱
                      </span>
                      <Input
                        type="number"
                        className="w-20 h-8 text-right text-red-600 font-bold border-red-200 text-xs focus-visible:ring-red-500 bg-white shadow-sm"
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
                  <div className="bg-amber-100/50 p-3 rounded-md border border-amber-200 flex justify-between items-center mt-4">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-bold text-amber-900">
                        Security Deposit
                      </span>
                      <Popover>
                        <PopoverTrigger>
                          <Info className="h-3.5 w-3.5 text-amber-500 hover:text-amber-600 transition-colors" />
                        </PopoverTrigger>
                        <PopoverContent className="text-[10px] w-48 p-2.5 font-medium border-amber-200 shadow-md">
                          Refundable holding amount required before vehicle
                          release.
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-amber-700">
                        ₱
                      </span>
                      <Input
                        type="number"
                        className="w-20 h-8 text-right text-xs font-bold bg-white border-amber-200 text-amber-900 shadow-sm"
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
                </div>

                {/* --- FOOTER TOTALS --- */}
                <div className="bg-white border-t border-slate-200 p-0">
                  <div className="flex justify-between items-end p-5 bg-slate-900 text-white">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      Grand Total
                    </span>
                    <span className="text-3xl font-black leading-none tracking-tight">
                      ₱ {totalPayable.toLocaleString()}
                    </span>
                  </div>

                  {/* Upfront Payment Section connected to Total */}
                  <div className="p-4 bg-slate-50 border-t border-slate-200">
                    <div className="flex items-center space-x-2 mb-3">
                      <Checkbox
                        id="pay"
                        checked={!!wPayment}
                        onCheckedChange={(c) =>
                          setValue(
                            "initial_payment",
                            c ? { amount: 1000, method: "Cash" } : undefined,
                          )
                        }
                        className="border-slate-300 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 rounded-sm"
                      />
                      <label
                        htmlFor="pay"
                        className="text-xs font-bold text-slate-700 cursor-pointer select-none"
                      >
                        Record initial payment now
                      </label>
                    </div>

                    {wPayment && (
                      <div className="grid gap-2.5 animate-in fade-in slide-in-from-top-2 mb-3">
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                              ₱
                            </span>
                            <Input
                              type="number"
                              placeholder="Amount"
                              className="h-9 text-xs pl-7 font-bold text-slate-900 bg-white border-slate-200 shadow-sm"
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
                            <SelectTrigger className="h-9 text-xs font-bold w-[110px] bg-white border-slate-200 shadow-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem
                                value="Cash"
                                className="text-xs font-medium"
                              >
                                Cash
                              </SelectItem>
                              <SelectItem
                                value="GCash"
                                className="text-xs font-medium"
                              >
                                GCash
                              </SelectItem>
                              <SelectItem
                                value="Card"
                                className="text-xs font-medium"
                              >
                                Card
                              </SelectItem>
                              <SelectItem
                                value="Bank Transfer"
                                className="text-xs font-medium"
                              >
                                Bank Transfer
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          className="h-9 text-xs font-medium bg-white border-slate-200 shadow-sm"
                          placeholder="Reference Number (Optional)"
                          value={wPayment.reference || ""}
                          onChange={(e) =>
                            setValue(
                              "initial_payment.reference",
                              e.target.value,
                            )
                          }
                        />
                      </div>
                    )}

                    <div className="flex justify-between items-center text-[11px] font-black uppercase tracking-wider pt-3 border-t border-slate-200">
                      <span
                        className={cn(
                          balanceDue > 0
                            ? "text-amber-600"
                            : "text-emerald-600",
                        )}
                      >
                        Remaining Balance
                      </span>
                      <span className="text-sm">
                        ₱ {balanceDue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden flex flex-col rounded-xl border-slate-200 shadow-2xl">
          <DialogHeader className="p-4 bg-white border-b border-slate-100 z-10 shadow-sm shrink-0">
            <DialogTitle className="text-base font-bold text-slate-900">
              Select {activeMapField === "pickup" ? "Pick-up" : "Drop-off"}{" "}
              Location
            </DialogTitle>
            <p className="text-[11px] font-medium text-slate-500">
              Click a blue pin to use a Hub (Free), or click anywhere else on
              the map to set a Custom Delivery Location.
            </p>
          </DialogHeader>
          <div className="flex-1 relative h-full bg-slate-100">
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
