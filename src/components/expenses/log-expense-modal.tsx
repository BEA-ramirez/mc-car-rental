"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  X,
  Plus,
  Receipt,
  FileText,
  Banknote,
  Car,
  CalendarDays,
  Check,
  ChevronsUpDown,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

import { useFinancials } from "../../../hooks/use-financials";
import { useUnits } from "../../../hooks/use-units";
import { useBookings } from "../../../hooks/use-bookings";

const expenseSchema = z.object({
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0,
      "Amount must be greater than zero",
    ),
  category: z.string().min(1, "Please select a category"),
  notes: z.string().min(3, "Please provide a valid description/reference"),
  // Use .preprocess to ensure nulls become undefined for the form, or just keep as string
  car_id: z.string().nullable().optional(),
  booking_id: z.string().nullable().optional(),

  chargeToOwner: z.boolean(),
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

type LogExpenseModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LogExpenseModal({
  isOpen,
  onClose,
}: LogExpenseModalProps) {
  const { logExpense, isLogging } = useFinancials();
  const { units } = useUnits();
  const { bookings } = useBookings();

  const [openCar, setOpenCar] = useState(false);
  const [openBooking, setOpenBooking] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      amount: "",
      category: "",
      notes: "",
      car_id: "",
      booking_id: "",
      chargeToOwner: false,
    },
  });

  // Watch values for conditional rendering
  const watchedCategory = watch("category");
  const watchedCarId = watch("car_id");

  // Reset form whenever the modal opens or closes
  useEffect(() => {
    if (isOpen) reset();
  }, [isOpen, reset]);

  // 3. Submit Handler
  const onSubmit = async (data: ExpenseFormValues) => {
    try {
      await logExpense({
        amount: parseFloat(data.amount),
        category: data.category,
        notes: data.notes,
        car_id: data.car_id || undefined,
        booking_id: data.booking_id || undefined,
        chargeToOwner: data.chargeToOwner,
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[480px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col transition-colors duration-300 [&>button.absolute]:hidden">
        <DialogHeader className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                Log Manual Expense
              </DialogTitle>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Master Ledger Entry
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
          <div className="p-4 space-y-4 bg-background transition-colors">
            <div className="grid grid-cols-2 gap-3">
              {/* AMOUNT FIELD */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Banknote className="w-3 h-3" /> Amount (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...register("amount")}
                    className={cn(
                      "h-8 text-[11px] pl-7 font-bold text-foreground bg-secondary border-border shadow-none rounded-lg focus-visible:ring-primary transition-colors",
                      errors.amount &&
                        "border-destructive focus-visible:ring-destructive",
                    )}
                  />
                </div>
                {errors.amount && (
                  <p className="text-[9px] text-destructive font-bold">
                    {errors.amount.message}
                  </p>
                )}
              </div>

              {/* CATEGORY FIELD */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Receipt className="w-3 h-3" /> Category
                </label>
                <Controller
                  control={control}
                  name="category"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(val) => {
                        field.onChange(val);
                        if (val !== "VEHICLE_EXPENSE")
                          setValue("chargeToOwner", false);
                      }}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-8 w-full text-[11px] font-bold text-foreground bg-secondary border-border shadow-none rounded-lg focus:ring-primary transition-colors",
                          errors.category &&
                            "border-destructive focus:ring-destructive",
                        )}
                      >
                        <SelectValue placeholder="Select..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                        {/* Passes VEHICLE_EXPENSE to trigger the RPC logic */}
                        <SelectItem
                          value="VEHICLE_EXPENSE"
                          className="text-[11px] font-medium text-amber-600 dark:text-amber-400 font-bold"
                        >
                          Vehicle (Fuel/Maint/Repair)
                        </SelectItem>
                        <SelectItem
                          value="MARKETING"
                          className="text-[11px] font-medium"
                        >
                          Marketing & Ads
                        </SelectItem>
                        <SelectItem
                          value="OFFICE_SUPPLIES"
                          className="text-[11px] font-medium"
                        >
                          Office Supplies
                        </SelectItem>
                        <SelectItem
                          value="SOFTWARE"
                          className="text-[11px] font-medium"
                        >
                          Software & Subs
                        </SelectItem>
                        <SelectItem
                          value="SALARY"
                          className="text-[11px] font-medium"
                        >
                          Salary / Wages
                        </SelectItem>
                        <SelectItem
                          value="OWNER_PAYOUT"
                          className="text-[11px] font-medium"
                        >
                          Owner Payout
                        </SelectItem>
                        <SelectItem
                          value="MISC"
                          className="text-[11px] font-medium"
                        >
                          Miscellaneous
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-[9px] text-destructive font-bold">
                    {errors.category.message}
                  </p>
                )}
              </div>
            </div>

            <div className="p-3 bg-secondary/50 border border-border rounded-xl space-y-3 transition-colors">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border pb-1.5">
                Optional Cost Allocation
              </span>
              <div className="grid grid-cols-2 gap-3">
                {/* CAR ID SELECTOR */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Car className="w-3 h-3" /> Vehicle
                  </label>
                  <Controller
                    control={control}
                    name="car_id"
                    render={({ field }) => (
                      <Popover open={openCar} onOpenChange={setOpenCar}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "h-8 text-[11px] font-semibold bg-background border-border hover:bg-secondary rounded-lg w-full justify-between px-2.5 shadow-none transition-colors",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <span className="truncate">
                              {field.value
                                ? units.find((c) => c.car_id === field.value)
                                    ?.plate_number
                                : "Select plate..."}
                            </span>
                            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[200px] p-0 border-border bg-popover shadow-xl rounded-xl"
                          align="start"
                        >
                          <Command>
                            <CommandInput
                              placeholder="Search..."
                              className="h-8 text-[11px]"
                            />
                            {/* FIXED HEIGHT ADDED HERE */}
                            <CommandList className="max-h-[200px] overflow-y-auto custom-scrollbar">
                              <CommandEmpty className="text-[10px] py-2 text-center text-muted-foreground">
                                No asset found.
                              </CommandEmpty>
                              <CommandGroup>
                                {units.map((car) => (
                                  <CommandItem
                                    key={car.car_id}
                                    value={`${car.brand} ${car.plate_number}`}
                                    onSelect={() => {
                                      field.onChange(car.car_id);
                                      setOpenCar(false);
                                    }}
                                    className="text-[11px] cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-3.5 w-3.5 text-primary",
                                        field.value === car.car_id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <div className="flex flex-col">
                                      <span className="font-bold text-foreground">
                                        {car.plate_number}
                                      </span>
                                      <span className="text-[9px] text-muted-foreground">
                                        {car.brand}
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>

                {/* BOOKING ID SELECTOR */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <CalendarDays className="w-3 h-3" /> Booking
                  </label>
                  <Controller
                    control={control}
                    name="booking_id"
                    render={({ field }) => (
                      <Popover open={openBooking} onOpenChange={setOpenBooking}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "h-8 text-[11px] font-semibold bg-background border-border hover:bg-secondary rounded-lg w-full justify-between px-2.5 shadow-none transition-colors",
                              !field.value && "text-muted-foreground",
                            )}
                          >
                            <span className="truncate">
                              {field.value
                                ? field.value.split("-")[0] + "..."
                                : "Ref ID..."}
                            </span>
                            <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-[200px] p-0 border-border bg-popover shadow-xl rounded-xl"
                          align="start"
                        >
                          <Command>
                            <CommandInput
                              placeholder="Search ref..."
                              className="h-8 text-[11px]"
                            />
                            {/* FIXED HEIGHT ADDED HERE */}
                            <CommandList className="max-h-[200px] overflow-y-auto custom-scrollbar">
                              <CommandEmpty className="text-[10px] py-2 text-center text-muted-foreground">
                                No booking found.
                              </CommandEmpty>
                              <CommandGroup>
                                {bookings.map((b) => (
                                  <CommandItem
                                    key={b.booking_id}
                                    value={`${b.booking_id}`}
                                    onSelect={() => {
                                      field.onChange(b.booking_id);
                                      setOpenBooking(false);
                                    }}
                                    className="text-[11px] cursor-pointer"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-3.5 w-3.5 text-primary",
                                        field.value === b.booking_id
                                          ? "opacity-100"
                                          : "opacity-0",
                                      )}
                                    />
                                    <span className="font-bold font-mono">
                                      {b.booking_id?.split("-")[0]}...
                                    </span>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    )}
                  />
                </div>
              </div>

              {/* CHARGE TO OWNER CHECKBOX */}
              {watchedCategory === "VEHICLE_EXPENSE" && watchedCarId && (
                <div className="flex items-start gap-2.5 mt-1 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg transition-colors">
                  <Controller
                    control={control}
                    name="chargeToOwner"
                    render={({ field }) => (
                      <input
                        type="checkbox"
                        id="chargeToOwner"
                        checked={field.value}
                        onChange={(e) => field.onChange(e.target.checked)}
                        className="mt-0.5 rounded border-amber-500/30 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer bg-background"
                      />
                    )}
                  />
                  <label
                    htmlFor="chargeToOwner"
                    className="text-[10px] font-bold text-amber-700 dark:text-amber-400 cursor-pointer leading-tight"
                  >
                    Owner Chargeback: Deduct this from the owner&apos;s next
                    payout.
                  </label>
                </div>
              )}
            </div>

            {/* DESCRIPTION FIELD */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Description & Reference
              </label>
              <Textarea
                {...register("notes")}
                placeholder="e.g., OR# 10293 - Handover prep wash"
                className={cn(
                  "min-h-[70px] text-[11px] font-medium text-foreground bg-secondary border-border shadow-none rounded-lg resize-none focus-visible:ring-1 focus-visible:ring-primary transition-colors",
                  errors.notes &&
                    "border-destructive focus-visible:ring-destructive",
                )}
              />
              {errors.notes && (
                <p className="text-[9px] text-destructive font-bold">
                  {errors.notes.message}
                </p>
              )}
            </div>
          </div>

          <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end gap-2 z-10 transition-colors">
            <Button
              type="button"
              variant="outline"
              className="h-8 px-4 text-[10px] font-semibold text-foreground bg-card hover:bg-secondary border-border rounded-lg shadow-none transition-colors"
              onClick={onClose}
              disabled={isLogging}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLogging}
              className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
            >
              {isLogging ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Logging...
                </>
              ) : (
                "Log to Ledger"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
