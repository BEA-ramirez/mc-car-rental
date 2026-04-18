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
      } catch {
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
    } catch {
      toast.error("Failed to save fee configurations.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
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
        <span className="text-[11px] font-bold text-muted-foreground">₱</span>
      </div>
      <Input
        type="number"
        min="0"
        step="10"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 pl-7 text-[11px] font-bold text-foreground bg-secondary border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary font-mono transition-colors"
      />
    </div>
  );

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col max-w-3xl transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <Banknote className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
              Standard Fees & Deposits
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Configure default logistics surcharges, driver rates, and security
              deposits.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-6 bg-background transition-colors">
        {/* Section 1: Logistics & Delivery */}
        <div>
          <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-border pb-1.5">
            <Truck className="w-3.5 h-3.5" /> Logistics & Delivery
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center justify-between">
                Custom Pickup
              </label>
              <p className="text-[9px] text-muted-foreground/70 leading-tight mb-1.5">
                Base fee for delivering the car outside a standard hub.
              </p>
              <CurrencyInput
                value={fees.custom_pickup_fee}
                onChange={(val) => handleChange("custom_pickup_fee", val)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center justify-between">
                Custom Dropoff
              </label>
              <p className="text-[9px] text-muted-foreground/70 leading-tight mb-1.5">
                Base fee for retrieving the car outside a standard hub.
              </p>
              <CurrencyInput
                value={fees.custom_dropoff_fee}
                onChange={(val) => handleChange("custom_dropoff_fee", val)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-amber-500" /> Rush Surcharge
                </span>
              </label>
              <p className="text-[9px] text-muted-foreground/70 leading-tight mb-1.5">
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
          <h3 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-1.5 border-b border-border pb-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Add-ons & Security
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-xl">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <UserCircle className="w-3 h-3" /> Daily Driver Rate
                </span>
              </label>
              <p className="text-[9px] text-muted-foreground/70 leading-tight mb-1.5">
                Standard 10-hour daily rate for chauffeur services.
              </p>
              <CurrencyInput
                value={fees.driver_rate_per_day}
                onChange={(val) => handleChange("driver_rate_per_day", val)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-[9px] font-bold text-foreground uppercase tracking-widest flex items-center justify-between">
                Default Security Deposit
              </label>
              <p className="text-[9px] text-muted-foreground/70 leading-tight mb-1.5">
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
      <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end transition-colors">
        <Button
          className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
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
