"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Loader2,
  Banknote,
  ShieldAlert,
  Truck,
  UserCircle,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import {
  getBookingFees,
  saveBookingFees,
  BookingFees,
} from "@/actions/settings";

const DEFAULT_FEES: BookingFees = {
  rush_fee: 200,
  custom_pickup_fee: 500,
  custom_dropoff_fee: 500,
  driver_rate_per_day: 500,
  security_deposit_default: 3000,
};

export default function BookingFeesForm() {
  const [fees, setFees] = useState<BookingFees>(DEFAULT_FEES);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getBookingFees();
        if (data) setFees({ ...DEFAULT_FEES, ...data });
      } catch (error) {
        toast.error("Failed to load fee configurations.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (field: keyof BookingFees, value: string) => {
    const numericValue = value === "" ? 0 : parseFloat(value);
    setFees((prev) => ({ ...prev, [field]: numericValue }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveBookingFees(fees);
      toast.success("Standard fees and deposits updated!");
    } catch (error) {
      toast.error("Failed to save fee configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-bold animate-pulse">
        Loading Fee Settings...
      </div>
    );

  // A tiny helper component for currency inputs to keep the code clean
  const CurrencyInput = ({
    value,
    onChange,
  }: {
    value: number;
    onChange: (val: string) => void;
  }) => (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <span className="text-xs font-bold text-slate-400">₱</span>
      </div>
      <Input
        type="number"
        min="0"
        step="10"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-9 pl-7 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-sm shadow-sm font-mono font-medium"
      />
    </div>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col max-w-3xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Banknote className="w-4 h-4 text-emerald-600" />
            Standard Fees & Deposits
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configure default logistics surcharges, driver rates, and security
            deposits.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-8 bg-white">
        {/* Section 1: Logistics & Delivery */}
        <div>
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <Truck className="w-3.5 h-3.5 text-slate-400" /> Logistics &
            Delivery
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Custom Pickup
              </label>
              <p className="text-[9px] text-slate-400 leading-tight mb-1">
                Base fee for delivering the car outside a standard hub.
              </p>
              <CurrencyInput
                value={fees.custom_pickup_fee}
                onChange={(val) => handleChange("custom_pickup_fee", val)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Custom Dropoff
              </label>
              <p className="text-[9px] text-slate-400 leading-tight mb-1">
                Base fee for retrieving the car outside a standard hub.
              </p>
              <CurrencyInput
                value={fees.custom_dropoff_fee}
                onChange={(val) => handleChange("custom_dropoff_fee", val)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Rush Surcharge
                </span>
              </label>
              <p className="text-[9px] text-slate-400 leading-tight mb-1">
                Extra fee applied to bookings made within 24 hours.
              </p>
              <CurrencyInput
                value={fees.rush_fee}
                onChange={(val) => handleChange("rush_fee", val)}
              />
            </div>
          </div>
        </div>

        {/* Section 2: Add-ons & Security */}
        <div>
          <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-1.5 border-b border-slate-100 pb-2">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400" /> Add-ons &
            Security
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-xl">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <UserCircle className="w-3 h-3" /> Daily Driver Rate
                </span>
              </label>
              <p className="text-[9px] text-slate-400 leading-tight mb-1">
                Standard 10-hour daily rate for chauffeur services.
              </p>
              <CurrencyInput
                value={fees.driver_rate_per_day}
                onChange={(val) => handleChange("driver_rate_per_day", val)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Default Security Deposit
              </label>
              <p className="text-[9px] text-slate-400 leading-tight mb-1">
                Standard refundable deposit applied to self-drive rentals.
              </p>
              <CurrencyInput
                value={fees.security_deposit_default}
                onChange={(val) =>
                  handleChange("security_deposit_default", val)
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-slate-50 border-t border-slate-200 p-4 shrink-0 flex justify-end">
        <Button
          className="h-9 px-6 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-sm"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-2" />
          )}
          Save Standard Fees
        </Button>
      </div>
    </div>
  );
}
