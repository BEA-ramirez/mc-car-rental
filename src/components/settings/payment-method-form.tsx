"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Loader2,
  Wallet,
  Landmark,
  Smartphone,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import {
  getPaymentMethods,
  savePaymentMethods,
  PaymentMethods,
} from "@/actions/settings";
import { cn } from "@/lib/utils";

const DEFAULT_METHODS: PaymentMethods = {
  bdo: { enabled: false, account_name: "", account_number: "" },
  gcash: { enabled: false, account_name: "", account_number: "" },
  cash: { enabled: true },
};

export default function PaymentMethodsForm() {
  const [methods, setMethods] = useState<PaymentMethods>(DEFAULT_METHODS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getPaymentMethods();
        if (data) {
          // Merge with defaults just in case some keys are missing
          setMethods({ ...DEFAULT_METHODS, ...data });
        }
      } catch {
        toast.error("Failed to load payment methods.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleToggle = (key: keyof PaymentMethods) => {
    setMethods((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const handleChange = (
    key: keyof PaymentMethods,
    field: "account_name" | "account_number",
    value: string,
  ) => {
    setMethods((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePaymentMethods(methods);
      toast.success("Payment configurations saved successfully!");
    } catch {
      toast.error("Failed to save payment methods.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Loading Payment Settings...
      </div>
    );

  // Custom Toggle Component to keep it lightweight
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
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <Wallet className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
              Payment & Receiving Accounts
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Configure active payment channels for your customers
            </p>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-4 space-y-3 bg-background transition-colors">
        {/* GCASH CARD */}
        <div
          className={cn(
            "border rounded-xl transition-all duration-200",
            methods.gcash.enabled
              ? "border-primary/30 bg-primary/5 shadow-sm"
              : "border-border bg-secondary/30",
          )}
        >
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  methods.gcash.enabled
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                <Smartphone className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  GCash Mobile Wallet
                </h3>
                <p className="text-[9px] font-medium text-muted-foreground mt-0.5">
                  Accept direct payments via GCash.
                </p>
              </div>
            </div>
            <CustomToggle
              enabled={methods.gcash.enabled}
              onClick={() => handleToggle("gcash")}
            />
          </div>

          {methods.gcash.enabled && (
            <div className="px-3 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Account Name
                </label>
                <Input
                  placeholder="e.g., Juan Dela Cruz"
                  value={methods.gcash.account_name || ""}
                  onChange={(e) =>
                    handleChange("gcash", "account_name", e.target.value)
                  }
                  className="h-8 text-[11px] font-semibold bg-background border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  GCash Number
                </label>
                <Input
                  placeholder="0917 123 4567"
                  value={methods.gcash.account_number || ""}
                  onChange={(e) =>
                    handleChange("gcash", "account_number", e.target.value)
                  }
                  className="h-8 text-[11px] font-semibold bg-background border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary font-mono transition-colors text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* BDO BANK TRANSFER CARD */}
        <div
          className={cn(
            "border rounded-xl transition-all duration-200",
            methods.bdo.enabled
              ? "border-primary/30 bg-primary/5 shadow-sm"
              : "border-border bg-secondary/30",
          )}
        >
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  methods.bdo.enabled
                    ? "bg-primary/20 text-primary"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                <Landmark className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Bank Transfer
                </h3>
                <p className="text-[9px] font-medium text-muted-foreground mt-0.5">
                  Accept corporate or personal bank deposits.
                </p>
              </div>
            </div>
            <CustomToggle
              enabled={methods.bdo.enabled}
              onClick={() => handleToggle("bdo")}
            />
          </div>

          {methods.bdo.enabled && (
            <div className="px-3 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Account Name
                </label>
                <Input
                  placeholder="MC Car Rental Inc."
                  value={methods.bdo.account_name || ""}
                  onChange={(e) =>
                    handleChange("bdo", "account_name", e.target.value)
                  }
                  className="h-8 text-[11px] font-semibold bg-background border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Account Number
                </label>
                <Input
                  placeholder="1234 5678 9012"
                  value={methods.bdo.account_number || ""}
                  onChange={(e) =>
                    handleChange("bdo", "account_number", e.target.value)
                  }
                  className="h-8 text-[11px] font-semibold bg-background border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary font-mono transition-colors text-foreground"
                />
              </div>
            </div>
          )}
        </div>

        {/* CASH CARD */}
        <div
          className={cn(
            "border rounded-xl transition-all duration-200",
            methods.cash.enabled
              ? "border-emerald-500/30 bg-emerald-500/5 shadow-sm"
              : "border-border bg-secondary/30",
          )}
        >
          <div className="p-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center transition-colors",
                  methods.cash.enabled
                    ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                    : "bg-secondary text-muted-foreground",
                )}
              >
                <Banknote className="w-4 h-4" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider">
                  Over-the-Counter Cash
                </h3>
                <p className="text-[9px] font-medium text-muted-foreground mt-0.5">
                  Allow payments upon vehicle pickup or at your hub.
                </p>
              </div>
            </div>
            <CustomToggle
              enabled={methods.cash.enabled}
              onClick={() => handleToggle("cash")}
            />
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
          Save Configurations
        </Button>
      </div>
    </div>
  );
}
