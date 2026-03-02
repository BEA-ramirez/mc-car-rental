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
      } catch (error) {
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
    } catch (error) {
      toast.error("Failed to save payment methods.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-bold animate-pulse">
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
            <Wallet className="w-4 h-4 text-emerald-600" />
            Payment & Receiving Accounts
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Configure the active payment channels available to your customers.
          </p>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-6 space-y-4 bg-white">
        {/* GCASH CARD */}
        <div
          className={cn(
            "border rounded-sm transition-all duration-200",
            methods.gcash.enabled
              ? "border-blue-200 bg-blue-50/10 shadow-sm"
              : "border-slate-200 bg-slate-50/50",
          )}
        >
          <div className="p-4 flex items-center justify-between border-b border-transparent">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-sm flex items-center justify-center",
                  methods.gcash.enabled
                    ? "bg-blue-100 text-blue-600"
                    : "bg-slate-200 text-slate-400",
                )}
              >
                <Smartphone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  GCash Mobile Wallet
                </h3>
                <p className="text-[10px] font-medium text-slate-500">
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
            <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Account Name
                </label>
                <Input
                  placeholder="e.g., Juan Dela Cruz"
                  value={methods.gcash.account_name || ""}
                  onChange={(e) =>
                    handleChange("gcash", "account_name", e.target.value)
                  }
                  className="h-8 text-xs border-slate-200 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  GCash Number
                </label>
                <Input
                  placeholder="0917 123 4567"
                  value={methods.gcash.account_number || ""}
                  onChange={(e) =>
                    handleChange("gcash", "account_number", e.target.value)
                  }
                  className="h-8 text-xs border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* BDO BANK TRANSFER CARD */}
        <div
          className={cn(
            "border rounded-sm transition-all duration-200",
            methods.bdo.enabled
              ? "border-indigo-200 bg-indigo-50/10 shadow-sm"
              : "border-slate-200 bg-slate-50/50",
          )}
        >
          <div className="p-4 flex items-center justify-between border-b border-transparent">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-sm flex items-center justify-center",
                  methods.bdo.enabled
                    ? "bg-indigo-100 text-indigo-600"
                    : "bg-slate-200 text-slate-400",
                )}
              >
                <Landmark className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  BDO Bank Transfer
                </h3>
                <p className="text-[10px] font-medium text-slate-500">
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
            <div className="px-4 pb-4 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Account Name
                </label>
                <Input
                  placeholder="MC Car Rental Inc."
                  value={methods.bdo.account_name || ""}
                  onChange={(e) =>
                    handleChange("bdo", "account_name", e.target.value)
                  }
                  className="h-8 text-xs border-slate-200 bg-white"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  Account Number
                </label>
                <Input
                  placeholder="1234 5678 9012"
                  value={methods.bdo.account_number || ""}
                  onChange={(e) =>
                    handleChange("bdo", "account_number", e.target.value)
                  }
                  className="h-8 text-xs border-slate-200 bg-white font-mono"
                />
              </div>
            </div>
          )}
        </div>

        {/* CASH CARD */}
        <div
          className={cn(
            "border rounded-sm transition-all duration-200",
            methods.cash.enabled
              ? "border-emerald-200 bg-emerald-50/10 shadow-sm"
              : "border-slate-200 bg-slate-50/50",
          )}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-sm flex items-center justify-center",
                  methods.cash.enabled
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-slate-200 text-slate-400",
                )}
              >
                <Banknote className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-800">
                  Over-the-Counter Cash
                </h3>
                <p className="text-[10px] font-medium text-slate-500">
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
          Save Payment Configurations
        </Button>
      </div>
    </div>
  );
}
