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
      } catch {
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
    } catch {
      toast.error("Failed to save tax settings.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
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
        "relative inline-flex h-4 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out outline-none focus-visible:ring-1 focus-visible:ring-primary",
        enabled ? "bg-primary" : "bg-secondary border border-border",
      )}
    >
      <span
        className={cn(
          "pointer-events-none inline-block h-3 w-3 transform rounded-full bg-background shadow-sm ring-0 transition duration-200 ease-in-out",
          enabled ? "translate-x-2" : "-translate-x-2",
        )}
      />
    </button>
  );

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col max-w-3xl transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-sm">
            <ReceiptCent className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
              Tax Configuration
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Manage Value-Added Tax (VAT) application
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-5 bg-background transition-colors">
        {/* Master Toggle */}
        <div
          className={cn(
            "p-3 border rounded-xl flex items-center justify-between transition-colors shadow-sm",
            tax.enabled
              ? "border-emerald-500/30 bg-emerald-500/5"
              : "border-border bg-secondary/30",
          )}
        >
          <div className="flex flex-col">
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
              Enable Taxation
            </h3>
            <p className="text-[9px] font-medium text-muted-foreground mt-0.5">
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
          <div className="animate-in fade-in slide-in-from-top-2 space-y-5 border-t border-border pt-5 transition-colors">
            {/* Row 1: Tax Name & Percentage */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <FileDigit className="w-3 h-3" /> Tax Identification Name
                </label>
                <Input
                  placeholder="e.g., VAT, GST, Sales Tax"
                  value={tax.tax_name}
                  onChange={(e) => handleChange("tax_name", e.target.value)}
                  className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
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
                    className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary pr-8 font-mono transition-colors text-foreground"
                  />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <span className="text-[11px] font-bold text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Registration Number */}
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <Calculator className="w-3 h-3" /> BIR / Tax Registration Number
                (TIN)
              </label>
              <Input
                placeholder="e.g., 123-456-789-000"
                value={tax.registration_number}
                onChange={(e) =>
                  handleChange("registration_number", e.target.value)
                }
                className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary font-mono max-w-md transition-colors text-foreground"
              />
              <p className="text-[9px] font-medium text-muted-foreground/70 mt-1 uppercase tracking-widest">
                This will be printed on official receipts.
              </p>
            </div>

            {/* Row 3: Inclusive vs Exclusive Toggle */}
            <div className="space-y-1.5 pt-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                Pricing Calculation Model
              </label>
              <div className="flex bg-secondary p-1 rounded-lg border border-border max-w-md transition-colors">
                <button
                  type="button"
                  onClick={() => handleChange("is_inclusive", true)}
                  className={cn(
                    "flex-1 text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-md transition-all",
                    tax.is_inclusive
                      ? "bg-background text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                  )}
                >
                  Inclusive
                </button>
                <button
                  type="button"
                  onClick={() => handleChange("is_inclusive", false)}
                  className={cn(
                    "flex-1 text-[10px] font-bold uppercase tracking-widest py-1.5 rounded-md transition-all",
                    !tax.is_inclusive
                      ? "bg-background text-foreground shadow-sm border border-border/50"
                      : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                  )}
                >
                  Exclusive
                </button>
              </div>
              <p className="text-[9px] font-medium text-muted-foreground/70 leading-relaxed max-w-md mt-1.5">
                {tax.is_inclusive
                  ? "Tax is already included in your listing prices. The system will extract the tax amount from the total for receipts."
                  : "Tax will be added on top of your listing prices at checkout."}
              </p>
            </div>
          </div>
        )}
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
          Save Settings
        </Button>
      </div>
    </div>
  );
}
