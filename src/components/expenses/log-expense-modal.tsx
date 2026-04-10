"use client";

import React, { useState } from "react";
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

  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");
  const [chargeToOwner, setChargeToOwner] = useState(false);

  const [openCar, setOpenCar] = useState(false);
  const [selectedCarId, setSelectedCarId] = useState("");
  const [openBooking, setOpenBooking] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await logExpense({
        amount: parseFloat(amount),
        category,
        notes,
        car_id: selectedCarId || undefined,
        booking_id: selectedBookingId || undefined,
        chargeToOwner: chargeToOwner,
      });
      onClose();
      setAmount("");
      setCategory("");
      setNotes("");
      setSelectedCarId("");
      setSelectedBookingId("");
      setChargeToOwner(false);
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
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-4 space-y-4 bg-background transition-colors">
            <div className="grid grid-cols-2 gap-3">
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
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-8 text-[11px] pl-7 font-bold text-foreground bg-secondary border-border shadow-none rounded-lg focus-visible:ring-primary transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Receipt className="w-3 h-3" /> Category
                </label>
                <Select
                  value={category}
                  onValueChange={(val) => {
                    setCategory(val);
                    if (val !== "VEHICLE_EXPENSE") setChargeToOwner(false);
                  }}
                  required
                >
                  <SelectTrigger className="h-8 w-full! text-[11px] font-bold text-foreground bg-secondary border-border shadow-none rounded-lg focus:ring-primary transition-colors">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                    <SelectItem
                      value="OPERATIONAL"
                      className="text-[11px] font-medium"
                    >
                      Operational (Rent/Utils)
                    </SelectItem>
                    <SelectItem
                      value="MARKETING"
                      className="text-[11px] font-medium"
                    >
                      Marketing & Ads
                    </SelectItem>
                    <SelectItem
                      value="SOFTWARE"
                      className="text-[11px] font-medium"
                    >
                      Software & Subs
                    </SelectItem>
                    <SelectItem
                      value="VEHICLE_EXPENSE"
                      className="text-[11px] font-medium"
                    >
                      Vehicle (Wash/Toll)
                    </SelectItem>
                    <SelectItem
                      value="MISC"
                      className="text-[11px] font-medium"
                    >
                      Miscellaneous
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 bg-secondary/50 border border-border rounded-xl space-y-3 transition-colors">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block border-b border-border pb-1.5">
                Optional Cost Allocation
              </span>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <Car className="w-3 h-3" /> Vehicle
                  </label>
                  <Popover open={openCar} onOpenChange={setOpenCar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "h-8 text-[11px] font-semibold bg-background border-border hover:bg-secondary rounded-lg w-full justify-between px-2.5 shadow-none transition-colors",
                          !selectedCarId && "text-muted-foreground",
                        )}
                      >
                        <span className="truncate">
                          {selectedCarId
                            ? units.find((c) => c.car_id === selectedCarId)
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
                        <CommandList>
                          <CommandEmpty className="text-[10px] py-2 text-center text-muted-foreground">
                            No asset found.
                          </CommandEmpty>
                          <CommandGroup>
                            {units.map((car) => (
                              <CommandItem
                                key={car.car_id}
                                value={`${car.brand} ${car.plate_number}`}
                                onSelect={() => {
                                  setSelectedCarId(car.car_id || "");
                                  setOpenCar(false);
                                }}
                                className="text-[11px] cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-3.5 w-3.5 text-primary",
                                    selectedCarId === car.car_id
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
                </div>

                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                    <CalendarDays className="w-3 h-3" /> Booking
                  </label>
                  <Popover open={openBooking} onOpenChange={setOpenBooking}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "h-8 text-[11px] font-semibold bg-background border-border hover:bg-secondary rounded-lg w-full justify-between px-2.5 shadow-none transition-colors",
                          !selectedBookingId && "text-muted-foreground",
                        )}
                      >
                        <span className="truncate">
                          {selectedBookingId
                            ? selectedBookingId.split("-")[0] + "..."
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
                        <CommandList>
                          <CommandEmpty className="text-[10px] py-2 text-center text-muted-foreground">
                            No booking found.
                          </CommandEmpty>
                          <CommandGroup>
                            {bookings.map((b) => (
                              <CommandItem
                                key={b.booking_id}
                                value={`${b.booking_id}`}
                                onSelect={() => {
                                  setSelectedBookingId(b.booking_id || "");
                                  setOpenBooking(false);
                                }}
                                className="text-[11px] cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-3.5 w-3.5 text-primary",
                                    selectedBookingId === b.booking_id
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
                </div>
              </div>

              {category === "VEHICLE_EXPENSE" && selectedCarId && (
                <div className="flex items-start gap-2.5 mt-1 p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    id="chargeToOwner"
                    checked={chargeToOwner}
                    onChange={(e) => setChargeToOwner(e.target.checked)}
                    className="mt-0.5 rounded border-amber-500/30 text-amber-600 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer bg-background"
                  />
                  <label
                    htmlFor="chargeToOwner"
                    className="text-[10px] font-bold text-amber-700 dark:text-amber-400 cursor-pointer leading-tight"
                  >
                    Owner Chargeback: Deduct this from the owner's next payout.
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Description & Reference
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., OR# 10293 - Handover prep wash"
                className="min-h-[70px] text-[11px] font-medium text-foreground bg-secondary border-border shadow-none rounded-lg resize-none focus-visible:ring-1 focus-visible:ring-primary transition-colors"
                required
              />
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
