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

  // NEW: State for owner chargeback
  const [chargeToOwner, setChargeToOwner] = useState(false);

  // Combobox States
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
        chargeToOwner: chargeToOwner, // Pass to server action
      });
      onClose();

      // Reset form
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
      <DialogContent className="max-w-lg p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col [&>button.absolute]:hidden">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 text-slate-700" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Log Manual Expense
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                Master Ledger Entry
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-5 space-y-5 bg-slate-50">
            <div className="grid grid-cols-2 gap-4">
              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Banknote className="w-3 h-3" /> Amount (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₱
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-9 text-xs pl-7 font-bold text-slate-900 bg-white border-slate-200 shadow-sm rounded-sm"
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
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
                  <SelectTrigger className="h-9 text-xs font-bold bg-white border-slate-200 shadow-sm rounded-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm border-slate-200">
                    <SelectItem
                      value="OPERATIONAL"
                      className="text-xs font-medium"
                    >
                      Operational (Rent/Utils)
                    </SelectItem>
                    <SelectItem
                      value="MARKETING"
                      className="text-xs font-medium"
                    >
                      Marketing & Ads
                    </SelectItem>
                    <SelectItem
                      value="SOFTWARE"
                      className="text-xs font-medium"
                    >
                      Software & Subscriptions
                    </SelectItem>
                    <SelectItem
                      value="VEHICLE_EXPENSE"
                      className="text-xs font-medium"
                    >
                      Vehicle Expense (Wash/Toll)
                    </SelectItem>
                    <SelectItem value="MISC" className="text-xs font-medium">
                      Miscellaneous
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3.5 bg-white border border-slate-200 rounded-sm shadow-sm space-y-3">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                Optional Cost Allocation
              </span>
              <div className="grid grid-cols-2 gap-4">
                {/* Searchable Assign to Car */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Car className="w-3 h-3" /> Assign to Vehicle
                  </label>
                  <Popover open={openCar} onOpenChange={setOpenCar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCar}
                        className={cn(
                          "h-8 text-xs font-medium bg-slate-50 border-slate-200 hover:bg-white rounded-sm w-full justify-between px-3",
                          !selectedCarId && "text-slate-500",
                        )}
                      >
                        {selectedCarId
                          ? units.find((c) => c.car_id === selectedCarId)
                              ?.plate_number
                          : "Search plate..."}
                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[220px] p-0 border-slate-200 shadow-md rounded-sm"
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search vehicle..."
                          className="h-8 text-xs"
                        />
                        <CommandList>
                          <CommandEmpty className="text-xs py-3 text-center text-slate-500">
                            No vehicle found.
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                setSelectedCarId("");
                                setOpenCar(false);
                                setChargeToOwner(false);
                              }}
                              className="text-xs text-slate-500 italic py-1.5 cursor-pointer"
                            >
                              Clear selection
                            </CommandItem>
                            {units.map((car) => (
                              <CommandItem
                                key={car.car_id}
                                value={`${car.brand} ${car.plate_number}`}
                                onSelect={() => {
                                  setSelectedCarId(car.car_id || "");
                                  setOpenCar(false);
                                }}
                                className="py-1.5 cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-3.5 w-3.5 text-blue-600",
                                    selectedCarId === car.car_id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-800">
                                    {car.plate_number}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
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

                {/* Searchable Assign to Booking */}
                <div className="space-y-1.5 flex flex-col">
                  <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <CalendarDays className="w-3 h-3" /> Link to Booking
                  </label>
                  <Popover open={openBooking} onOpenChange={setOpenBooking}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openBooking}
                        className={cn(
                          "h-8 text-xs font-medium bg-slate-50 border-slate-200 hover:bg-white rounded-sm w-full justify-between px-3",
                          !selectedBookingId && "text-slate-500",
                        )}
                      >
                        {selectedBookingId
                          ? selectedBookingId.split("-")[0] + "..."
                          : "Search Ref..."}
                        <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[220px] p-0 border-slate-200 shadow-md rounded-sm"
                      align="start"
                    >
                      <Command>
                        <CommandInput
                          placeholder="Search ID..."
                          className="h-8 text-xs"
                        />
                        <CommandList>
                          <CommandEmpty className="text-xs py-3 text-center text-slate-500">
                            No booking found.
                          </CommandEmpty>
                          <CommandGroup>
                            <CommandItem
                              value="none"
                              onSelect={() => {
                                setSelectedBookingId("");
                                setOpenBooking(false);
                              }}
                              className="text-xs text-slate-500 italic py-1.5 cursor-pointer"
                            >
                              Clear selection
                            </CommandItem>
                            {bookings.map((b) => (
                              <CommandItem
                                key={b.booking_id}
                                value={`${b.booking_id}`}
                                onSelect={() => {
                                  setSelectedBookingId(b.booking_id || "");
                                  setOpenBooking(false);
                                }}
                                className="py-1.5 cursor-pointer"
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-3.5 w-3.5 text-blue-600",
                                    selectedBookingId === b.booking_id
                                      ? "opacity-100"
                                      : "opacity-0",
                                  )}
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-slate-800">
                                    {b.booking_id?.split("-")[0]}...
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
              </div>

              {/* NEW: Charge to Owner Checkbox */}
              {category === "VEHICLE_EXPENSE" && selectedCarId && (
                <div className="flex items-center gap-2 mt-4 p-3 bg-amber-50 border border-amber-100 rounded-sm">
                  <input
                    type="checkbox"
                    id="chargeToOwner"
                    checked={chargeToOwner}
                    onChange={(e) => setChargeToOwner(e.target.checked)}
                    className="rounded border-amber-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <label
                    htmlFor="chargeToOwner"
                    className="text-xs font-bold text-amber-800 cursor-pointer"
                  >
                    Deduct this expense from the fleet owner's next payout.
                  </label>
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Description & Reference
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Car wash for Vios before handover - OR# 10293"
                className="min-h-[80px] text-xs font-medium bg-white border-slate-200 shadow-sm rounded-sm resize-none focus-visible:ring-1 focus-visible:ring-slate-300"
                required
              />
            </div>
          </div>

          <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex justify-end gap-2 z-10">
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLogging}
              className="h-9 px-4 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-sm transition-all"
            >
              {isLogging ? "Logging..." : "Log to Ledger"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
