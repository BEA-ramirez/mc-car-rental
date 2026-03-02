"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Loader2,
  ReceiptCent,
  Calculator,
  FileDigit,
  Percent,
} from "lucide-react";
import { toast } from "sonner";
import {
  getTaxSettings,
  saveTaxSettings,
  TaxSettings,
} from "@/actions/settings";
import { cn } from "@/lib/utils";

const DEFAULT_TAX: TaxSettings = {
  enabled: true,
  tax_name: "VAT",
  percentage: 12,
  is_inclusive: true,
  registration_number: "",
};

export default function TaxSettingsForm() {
  const [tax, setTax] = useState<TaxSettings>(DEFAULT_TAX);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getTaxSettings();
        if (data) setTax({ ...DEFAULT_TAX, ...data });
      } catch (error) {
        toast.error("Failed to load tax settings.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (
    field: keyof TaxSettings,
    value: string | boolean | number,
  ) => {
    setTax((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveTaxSettings(tax);
      toast.success("Tax configurations updated successfully!");
    } catch (error) {
      toast.error("Failed to save tax settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-bold animate-pulse">
        Loading Tax Configuration...
      </div>
    );

  const CustomToggle = ({
    enabled,
    onClick,
  }: {
    enabled: boolean;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex h-5 w-9 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-blue-600",
        enabled ? "bg-emerald-500" : "bg-slate-200",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out",
          enabled ? "translate-x-2" : "-translate-x-2",
        )}
      />
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col max-w-3xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ReceiptCent className="w-4 h-4 text-emerald-600" />
            Tax Configuration
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Manage Value-Added Tax (VAT) and how it applies to your base prices.
          </p>
        </div>
      </div>

      <div className="p-6 space-y-6 bg-white">
        {/* Master Toggle */}
        <div
          className={cn(
            "p-4 border rounded-sm flex items-center justify-between transition-colors",
            tax.enabled
              ? "border-emerald-200 bg-emerald-50/30"
              : "border-slate-200 bg-slate-50",
          )}
        >
          <div>
            <h3 className="text-sm font-bold text-slate-800">
              Enable Taxation
            </h3>
            <p className="text-[10px] font-medium text-slate-500">
              Apply tax calculations to customer invoices and receipts.
            </p>
          </div>
          <CustomToggle
            enabled={tax.enabled}
            onClick={() => handleChange("enabled", !tax.enabled)}
          />
        </div>

        {/* Configuration Fields (Hidden if disabled) */}
        {tax.enabled && (
          <div className="animate-in fade-in slide-in-from-top-2 space-y-6 border-t border-slate-100 pt-6">
            {/* Row 1: Tax Name & Percentage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <FileDigit className="w-3 h-3" /> Tax Identification Name
                </label>
                <Input
                  placeholder="e.g., VAT, GST, Sales Tax"
                  value={tax.tax_name}
                  onChange={(e) => handleChange("tax_name", e.target.value)}
                  className="h-9 text-xs border-slate-200 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Percent className="w-3 h-3" /> Tax Percentage
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    min="0"
                    step="0.1"
                    placeholder="12"
                    value={tax.percentage || ""}
                    onChange={(e) =>
                      handleChange(
                        "percentage",
                        parseFloat(e.target.value) || 0,
                      )
                    }
                    className="h-9 text-xs border-slate-200 bg-white pr-8 font-mono"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-xs font-bold text-slate-400">%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Registration Number */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <Calculator className="w-3 h-3" /> BIR / Tax Registration Number
                (TIN)
              </label>
              <Input
                placeholder="e.g., 123-456-789-000"
                value={tax.registration_number}
                onChange={(e) =>
                  handleChange("registration_number", e.target.value)
                }
                className="h-9 text-xs border-slate-200 bg-white font-mono max-w-md"
              />
              <p className="text-[9px] text-slate-400 mt-1">
                This will be printed on official receipts.
              </p>
            </div>

            {/* Row 3: Inclusive vs Exclusive Toggle */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                Pricing Calculation Model
              </label>
              <div className="flex bg-slate-100 p-1 rounded-sm border border-slate-200 max-w-md">
                <button
                  type="button"
                  onClick={() => handleChange("is_inclusive", true)}
                  className={cn(
                    "flex-1 text-xs font-bold py-1.5 rounded-sm transition-all",
                    tax.is_inclusive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  Inclusive
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("is_inclusive", false)}
                  className={cn(
                    "flex-1 text-xs font-bold py-1.5 rounded-sm transition-all",
                    !tax.is_inclusive
                      ? "bg-white text-slate-900 shadow-sm border border-slate-200/50"
                      : "text-slate-500 hover:text-slate-700",
                  )}
                >
                  Exclusive
                </button>
              </div>
              <p className="text-[9px] text-slate-500 leading-relaxed max-w-md">
                {tax.is_inclusive
                  ? "Tax is already included in your listing prices. The system will extract the tax amount from the total for receipts."
                  : "Tax will be added on top of your listing prices at checkout."}
              </p>
            </div>
          </div>
        )}
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
          Save Tax Settings
        </Button>
      </div>
    </div>
  );
}
