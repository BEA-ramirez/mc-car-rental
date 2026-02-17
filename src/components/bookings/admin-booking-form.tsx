"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  useForm,
  useFieldArray,
  Control,
  UseFormSetValue,
  UseFormWatch,
} from "react-hook-form";
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
} from "lucide-react";
import { cn } from "@/lib/utils";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
// We define props for the extracted component to keep things strict
type LocationFieldProps = {
  type: "pickup" | "dropoff";
  hubs: any[];
  fees: any;
  setActiveMapField: (field: "pickup" | "dropoff") => void;
  setMapOpen: (open: boolean) => void;
};

// --- EXTRACTED COMPONENT (Fixes the Re-render/Loop Issue) ---
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
  const title = type === "pickup" ? "PICKUP" : "DROPOFF";

  return (
    <Card>
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0 p-4">
        <CardTitle className={`text-sm font-bold ${colorClass}`}>
          {title}
        </CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-[10px] text-muted-foreground uppercase">
            {isCustom ? "Custom" : "Hub"}
          </span>
          <Switch
            checked={isCustom}
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
      </CardHeader>
      <Separator />
      <CardContent className="space-y-3 p-4">
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
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Select Hub" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {hubs.map((hub: any) => (
                      <SelectItem key={hub.id} value={hub.name}>
                        {hub.name} (Free)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
        ) : (
          <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
            <FormField
              control={control}
              name={locField}
              render={({ field }) => (
                <FormItem>
                  <div className="flex gap-2">
                    <Input
                      {...field}
                      placeholder="Enter address..."
                      className="h-9 text-xs"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-9 w-9 shrink-0"
                      onClick={() => {
                        setActiveMapField(type);
                        setMapOpen(true);
                      }}
                    >
                      <MapPin className={`h-4 w-4 ${colorClass}`} />
                    </Button>
                  </div>
                  <FormDescription className="text-[10px] m-0">
                    {watch(coordsField) ? "📍 Pin Set" : "⚠️ No Pin"}
                  </FormDescription>
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={priceField}
              render={({ field }) => (
                <FormItem className="flex items-center justify-between space-y-0">
                  <FormLabel className="text-xs text-muted-foreground">
                    Fee
                  </FormLabel>
                  <div className="flex items-center w-24">
                    <span className="mr-1 text-xs">₱</span>
                    <Input
                      type="number"
                      {...field}
                      className="h-7 text-right text-xs"
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
                      }
                    />
                  </div>
                </FormItem>
              )}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// --- MOCK DATA ---
const mockUsers = [
  { id: "u1", name: "Juan Dela Cruz", email: "juan@gmail.com", verified: true },
  { id: "u2", name: "Maria Clara", email: "maria@yahoo.com", verified: false },
];
const mockCars = [
  {
    id: "c1",
    name: "Toyota Vios 2024",
    plate: "ABC-123",
    rate: 1500,
    image: "/vios.jpg",
  },
  {
    id: "c2",
    name: "Mitsubishi Mirage",
    plate: "XYZ-789",
    rate: 1200,
    image: "/mirage.jpg",
  },
  {
    id: "c3",
    name: "Ford Everest",
    plate: "SUV-999",
    rate: 3500,
    image: "/everest.jpg",
  },
];
const PREDEFINED_CHARGES = [
  { label: "Child Seat", amount: 150 },
  { label: "Cooler Box", amount: 100 },
  { label: "Portable WiFi", amount: 200 },
  { label: "Cleaning Kit", amount: 300 },
];

export default function AdminBookingForm() {
  const router = useRouter();
  const { createBooking, isCreating } = useBookings();
  const { data: settings, isLoading: settingsLoading } = useBookingSettings();
  const { data: customers = [], isLoading: usersLoading } = useCustomers();
  const { units = [], isUnitsLoading } = useUnits();

  const [startTime, setStartTime] = useState("08:00");
  const [duration, setDuration] = useState(1);
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
    },
  });

  console.log("Form State:", form.watch());

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "additional_charges",
  });
  const { watch, setValue, control } = form;

  // Watchers
  const wStart = watch("start_date");
  const wEnd = watch("end_date");
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
  const selectedCar = mockCars.find((c) => c.id === wCarId);
  const days = duration > 0 ? duration : 1;
  const dailyRate = wCustomRate || selectedCar?.rate || 0;
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

  // --- EFFECT 1: Update Fees from Settings (Loop Proof) ---
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
  }, [fees?.driver_rate_per_day, fees?.security_deposit_default, setValue]); // Dependencies MUST be primitives

  // --- EFFECT 2: Auto-Calculate Dates (Loop Proof) ---
  useEffect(() => {
    if (wStart && duration > 0) {
      const [hours, mins] = startTime.split(":").map(Number);

      const currentStart = new Date(wStart);
      // Construct expected start date
      const expectedStart = setMinutes(
        setHours(new Date(currentStart), hours),
        mins,
      );
      // Construct expected end date
      const expectedEnd = addDays(expectedStart, duration);

      // Only update if time is actually different (Breaks loop)
      if (currentStart.getTime() !== expectedStart.getTime()) {
        setValue("start_date", expectedStart);
      }

      // Check end date
      const currentEndVal = form.getValues("end_date");
      if (
        !currentEndVal ||
        new Date(currentEndVal).getTime() !== expectedEnd.getTime()
      ) {
        setValue("end_date", expectedEnd);
      }
    }
  }, [wStart, startTime, duration, setValue]);

  async function onSubmit(data: AdminBookingInput) {
    try {
      await createBooking(data);
      router.push("/admin/bookings");
    } catch (error) {
      console.error(error);
    }
  }

  // Memoize the today date object so it doesn't change on every render
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);

  if (settingsLoading)
    return <div className="p-10 text-center">Loading...</div>;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20"
      >
        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">
          {/* CUSTOMER & CAR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Customer Search */}
            <Card>
              <CardHeader className="pb-3 p-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
                  Customer
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
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
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {/* 2. Map real data here */}
                              {field.value
                                ? customers.find(
                                    (u) => u.user_id === field.value,
                                  )?.full_name
                                : "Search..."}
                              <User className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search name..." />
                            <CommandList>
                              <CommandEmpty>No user found.</CommandEmpty>
                              <CommandGroup>
                                {/* 3. Loop through real customers */}
                                {customers.map((user) => (
                                  <CommandItem
                                    value={user.full_name || ""}
                                    key={user.user_id}
                                    onSelect={() =>
                                      setValue("user_id", user.user_id)
                                    }
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        user.user_id === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span>{user.full_name}</span>
                                      <span className="text-[10px] text-muted-foreground">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Vehicle Search */}
            <Card>
              <CardHeader className="pb-3 p-4">
                <CardTitle className="text-xs font-bold text-muted-foreground uppercase">
                  Vehicle
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 pt-0">
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
                                "w-full justify-between",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? units.find((c) => c.car_id === field.value)
                                    ?.brand
                                : "Search..."}
                              <CarFront className="ml-2 h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-[300px] p-0">
                          <Command>
                            <CommandInput placeholder="Search car..." />
                            <CommandList>
                              <CommandEmpty>No car found.</CommandEmpty>
                              <CommandGroup>
                                {units.map((car) => (
                                  <CommandItem
                                    value={car.brand}
                                    key={car.car_id}
                                    onSelect={() =>
                                      setValue("car_id", car.car_id || "")
                                    }
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        car.car_id === field.value
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-medium">
                                        {car.brand}
                                      </span>
                                      <span className="text-[10px] text-muted-foreground">
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
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>

          {/* DATES */}
          <Card>
            <CardHeader>
              <CardTitle>Rental Schedule</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* A. START DATE */}
                <FormField
                  control={control}
                  name="start_date"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Start Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="range"
                            // 1. Force the visual selection based on current field + duration
                            selected={{
                              from: field.value,
                              to: addDays(field.value, duration - 1),
                            }}
                            // 2. Override internal range picking
                            onSelect={(range, selectedDay) => {
                              // We IGNORE the range object provided by the calendar
                              // and strictly use the day the user just clicked as the new Start Date
                              if (selectedDay) {
                                field.onChange(selectedDay);
                              }
                            }}
                            // 3. Prevent the calendar from disabling dates outside the current range
                            disabled={(date) => date < today}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* B. START TIME */}
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <div className="relative">
                    <Input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="pl-9"
                    />
                    <Clock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  </div>
                </FormItem>

                {/* C. DURATION */}
                <FormItem>
                  <FormLabel>Duration (Days)</FormLabel>
                  <Input
                    type="number"
                    min={1}
                    value={duration}
                    onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                  />
                </FormItem>
              </div>

              <Separator />

              {/* D. AUTO-RETURN INFO */}
              <div className="bg-slate-50 p-4 rounded-md border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    System Generated Return
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="text-xl font-bold text-slate-800">
                      {wStart
                        ? format(addDays(wStart, duration), "MMMM do, yyyy")
                        : "---"}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-base px-2 py-0 h-7 bg-white"
                    >
                      {startTime}
                    </Badge>
                  </div>
                  {wStart && (
                    <p className="text-[10px] text-amber-600 font-medium">
                      (Car is unavailable from {format(wStart, "MMM d")} to
                      {format(addDays(wStart, duration - 1), "MMM d")})
                    </p>
                  )}
                  <p className="text-xs text-slate-500">
                    Must return by this time to avoid late fees.
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-600">
                    Total Duration
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {duration * 24} Hours
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* LOCATIONS (USING EXTRACTED COMPONENT) */}
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

        {/* RIGHT COLUMN: FINANCIALS (Sticky) */}
        <div className="space-y-6">
          <Card className="bg-slate-50 border-slate-200 shadow-sm sticky top-6">
            <CardHeader className="pb-3 border-b">
              <CardTitle>Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 pt-4">
              {/* Base Rate */}
              <div className="bg-white p-3 rounded border shadow-sm">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-sm">Vehicle Rental</span>
                  <span className="font-bold">
                    ₱ {rentTotal.toLocaleString()}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground flex justify-between items-center">
                  <span>
                    {days} Days x ₱{dailyRate}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-[10px]">Override?</span>
                    <Switch
                      checked={!!wCustomRate}
                      onCheckedChange={(c) =>
                        setValue(
                          "custom_daily_rate",
                          c ? selectedCar?.rate || 1000 : undefined,
                        )
                      }
                      className="scale-75 origin-right"
                    />
                  </div>
                </div>
                {wCustomRate && (
                  <Input
                    type="number"
                    className="mt-2 h-7 text-right text-xs"
                    value={wCustomRate}
                    onChange={(e) =>
                      setValue("custom_daily_rate", parseFloat(e.target.value))
                    }
                  />
                )}
              </div>

              {/* Driver Option */}
              <div className="bg-white p-3 rounded border shadow-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-sm">With Driver?</span>
                  <Switch
                    checked={wWithDriver}
                    onCheckedChange={(c) => setValue("with_driver", c)}
                    className="scale-75 origin-right"
                  />
                </div>
                {wWithDriver && (
                  <div className="flex justify-between items-center text-xs text-slate-600 pt-2 mt-2 border-t">
                    <span>Rate/Day:</span>
                    <div className="flex items-center gap-1">
                      ₱{" "}
                      <Input
                        type="number"
                        className="w-16 h-6 text-right px-1 text-xs"
                        value={wDriverFee}
                        onChange={(e) =>
                          setValue(
                            "driver_fee_per_day",
                            parseFloat(e.target.value),
                          )
                        }
                      />
                    </div>
                    <span className="font-bold">
                      ₱ {(days * (wDriverFee || 0)).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Extras (Accordion) */}
              <Accordion
                type="single"
                collapsible
                className="bg-white rounded border px-3 shadow-sm"
              >
                <AccordionItem value="charges" className="border-none">
                  <AccordionTrigger className="py-3 text-sm font-semibold hover:no-underline">
                    <div className="flex justify-between w-full pr-2">
                      <span>Add-ons & Fees</span>
                      <span className="text-blue-600">
                        ₱ {extrasTotal.toLocaleString()}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pb-3">
                      {fields.map((item, index) => (
                        <div key={item.id} className="flex gap-2 items-end">
                          <div className="grid gap-1 flex-1">
                            <span className="text-[10px] text-muted-foreground">
                              Category
                            </span>
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
                              className="h-7 text-xs"
                            />
                          </div>
                          <div className="grid gap-1 w-20">
                            <span className="text-[10px] text-muted-foreground">
                              Amount
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
                              className="h-7 text-xs text-right"
                            />
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-500 shrink-0"
                            onClick={() => remove(index)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2 mt-2 pt-2 border-t border-dashed">
                        <Select
                          onValueChange={(val) => {
                            const pre = PREDEFINED_CHARGES.find(
                              (p) => p.label === val,
                            );
                            if (pre)
                              append({
                                category: pre.label,
                                amount: pre.amount,
                                description: "Predefined",
                              });
                          }}
                        >
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue placeholder="Add Predefined..." />
                          </SelectTrigger>
                          <SelectContent>
                            {PREDEFINED_CHARGES.map((c) => (
                              <SelectItem key={c.label} value={c.label}>
                                {c.label} (₱{c.amount})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            append({ category: "Other", amount: 0 })
                          }
                          className="h-8 w-8 shrink-0"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              {/* Subtotals & Total */}
              <div className="space-y-1 text-xs pt-2 text-slate-600">
                {(wPickupPrice || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Pickup Fee</span>
                    <span>₱ {wPickupPrice?.toLocaleString()}</span>
                  </div>
                )}
                {(wDropoffPrice || 0) > 0 && (
                  <div className="flex justify-between">
                    <span>Dropoff Fee</span>
                    <span>₱ {wDropoffPrice?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-red-500">Discount</span>
                  <Input
                    type="number"
                    className="w-20 h-6 text-right text-red-500 border-red-200 text-xs"
                    value={wDiscount}
                    onChange={(e) =>
                      setValue("discount_amount", parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>

              {/* Security Deposit */}
              <div className="bg-amber-50 p-3 rounded border border-amber-200">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-semibold text-amber-800">
                      Security Deposit
                    </span>
                    <Popover>
                      <PopoverTrigger>
                        <Info className="h-3 w-3 text-amber-600" />
                      </PopoverTrigger>
                      <PopoverContent className="text-xs w-40">
                        Refundable upon return.
                      </PopoverContent>
                    </Popover>
                  </div>
                  <Input
                    type="number"
                    className="w-24 h-7 text-right bg-white text-xs"
                    value={wSecurityDeposit}
                    onChange={(e) =>
                      setValue("security_deposit", parseFloat(e.target.value))
                    }
                  />
                </div>
              </div>

              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-slate-500">
                  TOTAL PAYABLE
                </span>
                <span className="text-2xl font-extrabold text-slate-800">
                  ₱ {totalPayable.toLocaleString()}
                </span>
              </div>

              {/* Payment */}
              <div className="pt-2">
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
                  />
                  <label
                    htmlFor="pay"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Record Payment Now?
                  </label>
                </div>
                {wPayment && (
                  <div className="grid grid-cols-2 gap-2 animate-in fade-in zoom-in-95">
                    <Input
                      type="number"
                      placeholder="Amount"
                      value={wPayment.amount}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setValue(
                          "initial_payment.amount",
                          isNaN(val) ? 0 : val,
                        );
                      }}
                    />
                    <Select
                      value={wPayment.method}
                      onValueChange={(v: any) =>
                        setValue("initial_payment.method", v)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="GCash">GCash</SelectItem>
                        <SelectItem value="Card">Card</SelectItem>
                        <SelectItem value="Bank Transfer">
                          Bank Transfer
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      className="col-span-2"
                      placeholder="Reference No."
                      value={wPayment.reference || ""}
                      onChange={(e) =>
                        setValue("initial_payment.reference", e.target.value)
                      }
                    />
                  </div>
                )}
                <div className="mt-3 p-2 bg-blue-50 text-blue-700 rounded text-center text-sm font-bold border border-blue-100">
                  Balance Due: ₱ {balanceDue.toLocaleString()}
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full mt-2"
                disabled={isCreating}
              >
                {isCreating ? "Processing..." : "Create Booking"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>

      {/* Map Dialog */}
      <Dialog open={mapOpen} onOpenChange={setMapOpen}>
        <DialogContent className="max-w-5xl h-[600px] p-0 overflow-hidden flex flex-col">
          <DialogHeader className="p-3 bg-white border-b z-10 shadow-sm shrink-0">
            <DialogTitle>Select Location</DialogTitle>
            <p className="text-xs text-muted-foreground">
              Click a Blue Pin to select a Hub, or click anywhere else to set a
              Custom Location.
            </p>
          </DialogHeader>
          <div className="flex-1 relative h-full bg-slate-100">
            <OrmocMapSelector
              hubs={hubs}
              onLocationSelect={(lat, lng, name) => {
                if (name) {
                  const field =
                    activeMapField === "pickup" ? "pickup" : "dropoff";
                  setValue(`${field}_type`, "hub");
                  setValue(`${field}_location`, name);
                  setValue(`${field}_price`, 0);
                  setValue(`${field}_coordinates`, `${lat},${lng}`);
                } else {
                  const field =
                    activeMapField === "pickup" ? "pickup" : "dropoff";
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
