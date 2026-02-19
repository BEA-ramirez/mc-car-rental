"use client";

import React, { useState, useEffect, useMemo } from "react";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
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

// --- TYPES ---
type LocationFieldProps = {
  type: "pickup" | "dropoff";
  hubs: any[];
  fees: any;
  setActiveMapField: (field: "pickup" | "dropoff") => void;
  setMapOpen: (open: boolean) => void;
};

type AdminBookingFormProps = {
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
  const colorClass = type === "pickup" ? "text-blue-600" : "text-red-600";
  const title = type === "pickup" ? "Pick-up" : "Drop-off";

  return (
    <div className="border rounded-md bg-white overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 border-b">
        <span
          className={cn(
            "text-xs font-bold uppercase tracking-wider",
            colorClass,
          )}
        >
          {title}
        </span>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-muted-foreground uppercase font-medium">
            {isCustom ? "Custom Address" : "Hub Location"}
          </span>
          <Switch
            checked={isCustom}
            className="scale-75 origin-right"
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
                    {/* ADDED w-full so it doesn't look weird when empty */}
                    <SelectTrigger className="h-9 text-xs w-full bg-white">
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
                        <span className="text-muted-foreground">(Free)</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        ) : (
          <div className="space-y-2 animate-in slide-in-from-top-1 duration-200">
            <FormField
              control={control}
              name={locField}
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-1.5">
                    <Input
                      {...field}
                      placeholder="Enter specific address..."
                      className="h-9 text-xs flex-1 bg-white"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className={cn(
                        "h-9 w-9 shrink-0",
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
            <FormField
              control={control}
              name={priceField}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0 pt-1">
                  <FormLabel className="text-[10px] font-semibold text-muted-foreground uppercase">
                    Delivery Fee
                  </FormLabel>
                  <div className="flex items-center w-24">
                    <span className="mr-1 text-xs text-slate-500">₱</span>
                    <Input
                      type="number"
                      {...field}
                      className="h-8 text-right text-xs bg-white"
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
  initialCarId,
  initialStartDate,
  initialDuration,
  onSuccess,
  onCancel,
}: AdminBookingFormProps) {
  const router = useRouter();
  const { createBooking, isCreating } = useBookings();
  const { data: settings, isLoading: settingsLoading } = useBookingSettings();
  const { data: customers = [], isLoading: usersLoading } = useCustomers();
  const { units = [], isUnitsLoading } = useUnits();

  const [startTime, setStartTime] = useState("08:00");
  const [duration, setDuration] = useState(initialDuration || 1);
  const [mapOpen, setMapOpen] = useState(false);
  const [activeMapField, setActiveMapField] = useState<
    "pickup" | "dropoff" | null
  >(null);

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

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additional_charges",
  });

  const { watch, setValue, control } = form;

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

  // --- EFFECTS ---
  useEffect(() => {
    if (!fees) return;
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
  }, [fees?.driver_rate_per_day, fees?.security_deposit_default, setValue]);

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
    if (initialStartDate) {
      setStartTime(format(initialStartDate, "HH:mm"));
    }
  }, [initialStartDate]);

  async function onSubmit(data: AdminBookingInput) {
    try {
      await createBooking(data);
      if (onSuccess) onSuccess();
      else router.push("/admin/bookings");
    } catch (error) {
      console.error(error);
    }
  }

  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

  if (settingsLoading)
    return (
      <div className="p-6 text-center text-xs text-muted-foreground">
        Loading configuration...
      </div>
    );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col h-full bg-slate-50/50"
      >
        {/* HEADER */}
        {/* Added pr-14 to avoid overlapping with the Sheet Close 'X' button */}
        <div className="flex items-center justify-between px-6 py-4 bg-white border-b shrink-0 sticky top-0 z-10 pr-14">
          <div>
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Create Booking
            </h2>
            <p className="text-xs text-muted-foreground">
              Fill in the details to reserve a unit.
            </p>
          </div>
          <div className="flex gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onCancel}
                className="h-8 text-xs"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              className="h-8 text-xs bg-blue-600 hover:bg-blue-700"
              disabled={isCreating}
            >
              {isCreating ? "Saving..." : "Confirm Booking"}
            </Button>
          </div>
        </div>

        {/* SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* LEFT COLUMN: DETAILS */}
            <div className="lg:col-span-2 space-y-6">
              {/* 1. ENTITIES */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Customer */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Customer
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
                                  "w-full justify-between h-9 text-xs bg-white",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <div className="flex items-center truncate">
                                  <User className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                                  <span className="truncate">
                                    {field.value
                                      ? customers.find(
                                          (u) => u.user_id === field.value,
                                        )?.full_name
                                      : "Search customer..."}
                                  </span>
                                </div>
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[300px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Search name..."
                                className="text-xs"
                              />
                              <CommandList>
                                <CommandEmpty className="text-xs py-3 text-center text-muted-foreground">
                                  No user found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {customers.map((user) => (
                                    <CommandItem
                                      key={user.user_id}
                                      value={user.full_name || ""}
                                      onSelect={() =>
                                        setValue("user_id", user.user_id)
                                      }
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
                                        <span className="text-xs font-medium truncate">
                                          {user.full_name}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground truncate">
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

                {/* Vehicle */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                    Vehicle
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
                                  "w-full justify-between h-9 text-xs bg-white",
                                  !field.value && "text-muted-foreground",
                                )}
                              >
                                <div className="flex items-center truncate">
                                  <CarFront className="mr-2 h-4 w-4 text-slate-400 shrink-0" />
                                  <span className="truncate">
                                    {field.value
                                      ? units.find(
                                          (c) => c.car_id === field.value,
                                        )?.brand
                                      : "Select unit..."}
                                  </span>
                                </div>
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent
                            className="w-[300px] p-0"
                            align="start"
                          >
                            <Command>
                              <CommandInput
                                placeholder="Search car..."
                                className="text-xs"
                              />
                              <CommandList>
                                <CommandEmpty className="text-xs py-3 text-center text-muted-foreground">
                                  No car found.
                                </CommandEmpty>
                                <CommandGroup>
                                  {units.map((car) => (
                                    <CommandItem
                                      key={car.car_id}
                                      value={car.brand}
                                      onSelect={() =>
                                        setValue("car_id", car.car_id || "")
                                      }
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
                                        <span className="text-xs font-medium truncate">
                                          {car.brand}
                                        </span>
                                        <span className="text-[10px] text-muted-foreground truncate">
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

              <Separator />

              {/* 2. SCHEDULE */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">
                  Rental Period
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <FormField
                    control={control}
                    name="start_date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase">
                          Start Date
                        </FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal h-9 bg-white text-xs",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMM d, yyyy")
                              ) : (
                                <span>Pick date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
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
                    <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase">
                      Start Time
                    </FormLabel>
                    <div className="relative">
                      <Input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="pl-9 h-9 text-xs bg-white"
                      />
                      <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    </div>
                  </FormItem>

                  <FormItem>
                    <FormLabel className="text-[10px] font-semibold text-slate-500 uppercase">
                      Duration (Days)
                    </FormLabel>
                    <Input
                      type="number"
                      min={1}
                      value={duration}
                      onChange={(e) =>
                        setDuration(parseInt(e.target.value) || 1)
                      }
                      className="h-9 text-xs bg-white"
                    />
                  </FormItem>
                </div>

                {/* Auto-Return Summary Badge */}
                <div className="bg-blue-50/50 border border-blue-100 rounded-md p-3 flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-white p-1.5 rounded-md border shadow-sm">
                      <Clock className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-semibold text-blue-800 uppercase tracking-wide">
                        Expected Return
                      </span>
                      <span className="text-sm font-bold text-slate-700">
                        {wStart
                          ? format(addDays(wStart, duration), "MMM d, yyyy")
                          : "---"}{" "}
                        at {startTime}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                      Total Time
                    </span>
                    <div className="text-sm font-bold text-slate-700">
                      {duration * 24} hrs
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* 3. LOCATIONS */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Logistics</h3>
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
            </div>

            {/* RIGHT COLUMN: FINANCIALS */}
            <div className="space-y-4">
              <div className="bg-white border rounded-lg shadow-sm sticky top-6 overflow-hidden">
                <div className="bg-slate-100 border-b px-4 py-3 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-slate-500" />
                  <h3 className="text-sm font-bold text-slate-800">
                    Payment Summary
                  </h3>
                </div>

                <div className="p-4 space-y-4">
                  {/* Base Rate */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold text-slate-700">
                          Vehicle Rate
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {days} Days x ₱{dailyRate.toLocaleString()}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-slate-800">
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
                        className="scale-75 origin-left"
                      />
                      <span className="text-[10px] text-muted-foreground font-medium">
                        Override daily rate
                      </span>
                    </div>

                    {wCustomRate && (
                      <Input
                        type="number"
                        className="h-8 text-right text-xs max-w-[120px]"
                        value={wCustomRate}
                        onChange={(e) =>
                          setValue(
                            "custom_daily_rate",
                            parseFloat(e.target.value),
                          )
                        }
                      />
                    )}
                  </div>

                  <Separator className="border-dashed" />

                  {/* Driver */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={wWithDriver}
                          onCheckedChange={(c) => setValue("with_driver", c)}
                          className="scale-75 origin-left"
                        />
                        <span className="text-xs font-semibold text-slate-700">
                          Include Driver
                        </span>
                      </div>
                      {wWithDriver && (
                        <span className="text-sm font-bold text-slate-800">
                          ₱ {driverTotal.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {wWithDriver && (
                      <div className="flex items-center justify-between pl-10">
                        <span className="text-[10px] text-muted-foreground">
                          Fee per day
                        </span>
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-slate-500">₱</span>
                          {/* Increased width to w-20 */}
                          <Input
                            type="number"
                            className="w-20 h-8 text-right px-2 text-xs"
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

                  <Separator className="border-dashed" />

                  {/* Extras */}
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="charges" className="border-none">
                      <AccordionTrigger className="py-0 hover:no-underline flex justify-between w-full pr-0">
                        <span className="text-xs font-semibold text-slate-700">
                          Add-ons & Fees
                        </span>
                        <span className="text-xs font-bold text-slate-800 pr-2">
                          ₱ {extrasTotal.toLocaleString()}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pt-3 pb-0">
                        <div className="space-y-2">
                          {fields.map((item, index) => (
                            <div
                              key={item.id}
                              className="flex gap-2 items-center bg-slate-50 p-1.5 rounded border"
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
                                className="h-8 text-xs bg-white border-none shadow-none focus-visible:ring-0 px-2"
                                placeholder="Item name"
                              />
                              <span className="text-xs text-slate-400">₱</span>
                              {/* Increased width to w-20 */}
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
                                className="h-8 text-xs text-right w-20 bg-white border-none shadow-none focus-visible:ring-0 px-2"
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-red-400 hover:text-red-600 shrink-0"
                                onClick={() => remove(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          <div className="flex gap-2 pt-1">
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
                              <SelectTrigger className="h-8 text-xs flex-1 bg-white">
                                <SelectValue placeholder="Add item..." />
                              </SelectTrigger>
                              <SelectContent>
                                {PREDEFINED_CHARGES.map((c) => (
                                  <SelectItem
                                    key={c.label}
                                    value={c.label}
                                    className="text-xs"
                                  >
                                    {c.label} (+₱{c.amount})
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
                              className="h-8 w-8 shrink-0 p-0"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>

                  {/* Logistics Fees */}
                  {((wPickupPrice || 0) > 0 || (wDropoffPrice || 0) > 0) && (
                    <>
                      <Separator className="border-dashed" />
                      <div className="space-y-1.5 text-xs">
                        {(wPickupPrice || 0) > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>Pickup Fee</span>
                            <span className="font-medium text-slate-800">
                              ₱ {wPickupPrice?.toLocaleString()}
                            </span>
                          </div>
                        )}
                        {(wDropoffPrice || 0) > 0 && (
                          <div className="flex justify-between text-slate-600">
                            <span>Dropoff Fee</span>
                            <span className="font-medium text-slate-800">
                              ₱ {wDropoffPrice?.toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  <Separator className="border-dashed" />

                  {/* Discount */}
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">
                      Discount
                    </span>
                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">- ₱</span>
                      {/* Increased width to w-20 */}
                      <Input
                        type="number"
                        className="w-20 h-8 text-right text-red-600 border-red-200 text-xs focus-visible:ring-red-500"
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
                  <div className="bg-amber-50/50 p-2.5 rounded border border-amber-100 flex justify-between items-center">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span className="font-semibold text-amber-800">
                        Security Deposit
                      </span>
                      <Popover>
                        <PopoverTrigger>
                          <Info className="h-3 w-3 text-amber-500" />
                        </PopoverTrigger>
                        <PopoverContent className="text-[10px] w-40 p-2">
                          Refundable holding amount.
                        </PopoverContent>
                      </Popover>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-amber-600">₱</span>
                      {/* Increased width to w-24 */}
                      <Input
                        type="number"
                        className="w-24 h-8 text-right text-xs bg-white border-amber-200"
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

                  {/* TOTAL */}
                  <div className="pt-2">
                    <div className="flex justify-between items-end bg-slate-800 text-white p-4 rounded-t-lg">
                      <span className="text-xs font-medium text-slate-300 uppercase tracking-wider">
                        Grand Total
                      </span>
                      <span className="text-2xl font-bold leading-none">
                        ₱ {totalPayable.toLocaleString()}
                      </span>
                    </div>

                    {/* Upfront Payment Section connected to Total */}
                    <div className="bg-slate-100 border border-t-0 rounded-b-lg p-3 space-y-3">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="pay"
                          checked={!!wPayment}
                          onCheckedChange={(c) =>
                            setValue(
                              "initial_payment",
                              c ? { amount: 1000, method: "Cash" } : undefined,
                            )
                          }
                          className="border-slate-400 data-[state=checked]:bg-blue-600"
                        />
                        <label
                          htmlFor="pay"
                          className="text-xs font-semibold text-slate-700 cursor-pointer"
                        >
                          Record initial payment now
                        </label>
                      </div>

                      {wPayment && (
                        <div className="grid gap-2 animate-in fade-in slide-in-from-top-2">
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Amount"
                              className="h-9 text-xs flex-1"
                              value={wPayment.amount}
                              onChange={(e) =>
                                setValue(
                                  "initial_payment.amount",
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                            />
                            <Select
                              value={wPayment.method}
                              onValueChange={(v: any) =>
                                setValue("initial_payment.method", v)
                              }
                            >
                              <SelectTrigger className="h-9 text-xs w-[110px] bg-white">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Cash" className="text-xs">
                                  Cash
                                </SelectItem>
                                <SelectItem value="GCash" className="text-xs">
                                  GCash
                                </SelectItem>
                                <SelectItem value="Card" className="text-xs">
                                  Card
                                </SelectItem>
                                <SelectItem
                                  value="Bank Transfer"
                                  className="text-xs"
                                >
                                  Bank
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <Input
                            className="h-9 text-xs"
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

                      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider pt-2 border-t border-slate-200">
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
        </div>
      </form>

      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0 overflow-hidden flex flex-col rounded-xl">
          <DialogHeader className="p-4 bg-white border-b z-10 shadow-sm shrink-0">
            <DialogTitle className="text-base font-bold">
              Select {activeMapField === "pickup" ? "Pick-up" : "Drop-off"}{" "}
              Location
            </DialogTitle>
            <p className="text-xs text-muted-foreground">
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
