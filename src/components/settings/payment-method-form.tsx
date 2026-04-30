"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // (Optional)
import {
  Save,
  Loader2,
  Wallet,
  Landmark,
  Smartphone,
  Banknote,
  Trash2,
  Plus,
  UploadCloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentMethods } from "@/actions/settings";
import { useBookingSettings } from "../../../hooks/use-settings";
import { useFileUpload } from "../../../hooks/use-file-upload";
import Image from "next/image";
import { toast } from "sonner"; // Make sure toast is imported

const DEFAULT_METHODS: PaymentMethods = {
  bank: {
    enabled: false,
    account_name: "",
    account_number: "",
    instructions: "",
  },
  gcash: {
    enabled: false,
    account_name: "",
    account_number: "",
    instructions: "",
  },
  cash: { enabled: true, instructions: "" },
};

export default function PaymentMethodsForm() {
  const {
    data: settingsData,
    isLoading,
    savePaymentMethods,
    isSavingPayments,
  } = useBookingSettings();

  const [methods, setMethods] = useState<PaymentMethods>(DEFAULT_METHODS);
  const [newMethodName, setNewMethodName] = useState("");

  // Track which payment method requested an image upload
  const [activeUploadKey, setActiveUploadKey] = useState<string | null>(null);

  // Sync state when React Query fetches data
  useEffect(() => {
    if (settingsData?.payments) {
      setMethods({ ...DEFAULT_METHODS, ...settingsData.payments });
    }
  }, [settingsData?.payments]);

  // --- FILE UPLOAD HOOK ---
  const { isUploading, fileInputRef, handleFileSelect, triggerFileDialog } =
    useFileUpload({
      bucket: "documents",
      folder: "system_assets",
      onUploadComplete: (newFiles) => {
        if (activeUploadKey && newFiles.length > 0) {
          handleChange(activeUploadKey, "qr_code_url", newFiles[0].url);
          setActiveUploadKey(null);
        }
      },
    });

  // --- HANDLERS ---
  const handleToggle = (key: string) => {
    setMethods((prev) => ({
      ...prev,
      [key]: { ...prev[key], enabled: !prev[key].enabled },
    }));
  };

  const handleChange = (
    key: string,
    field: "account_name" | "account_number" | "qr_code_url" | "instructions",
    value: string,
  ) => {
    setMethods((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  const handleAddMethod = () => {
    if (!newMethodName.trim()) return;

    // Create a safe key (e.g. "BPI Bank" -> "bpi_bank")
    const key = newMethodName.toLowerCase().replace(/\s+/g, "_");

    if (!methods[key]) {
      setMethods((prev) => ({
        ...prev,
        [key]: {
          enabled: false,
          account_name: "",
          account_number: "",
          instructions: "",
          name: newMethodName,
        },
      }));
      setNewMethodName("");
    }
  };

  const handleDeleteMethod = (key: string) => {
    const updated = { ...methods };
    delete updated[key];
    setMethods(updated);

    // Optional but highly recommended: Give non-blocking feedback!
    toast.info("Method removed. Click 'Save' to apply changes.");
  };

  const handleSave = async () => {
    // The hook natively handles success/error toasts
    try {
      await savePaymentMethods(methods);
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Loading Payment Settings...
      </div>
    );

  // Custom Toggle Component
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
    <div className="bg-card shadow-sm overflow-hidden flex flex-col max-w-3xl transition-colors">
      {/* Hidden File Input used by the hook */}
      <Input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleFileSelect}
        disabled={isUploading || isSavingPayments} // <-- Locked during saves
      />

      {/* Form Body - Dynamic Mapping */}
      <div className="pt-4 space-y-3 bg-background transition-colors">
        {Object.entries(methods).map(([key, details]) => {
          const isCash = key === "cash";
          const isWallet = key.includes("gcash") || key.includes("maya");
          const displayName = details.name || key.replace(/_/g, " ");

          return (
            <div
              key={key}
              className={cn(
                "border rounded-xl transition-all duration-200",
                details.enabled
                  ? isCash
                    ? "border-emerald-500/30 bg-emerald-500/5 shadow-sm"
                    : "border-primary/30 bg-primary/5 shadow-sm"
                  : "border-border bg-secondary/30",
              )}
            >
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center transition-colors shrink-0",
                      details.enabled
                        ? isCash
                          ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                          : "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {isCash ? (
                      <Banknote className="w-4 h-4" />
                    ) : isWallet ? (
                      <Smartphone className="w-4 h-4" />
                    ) : (
                      <Landmark className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-[11px] font-bold text-foreground uppercase tracking-wider capitalize">
                      {displayName}
                    </h3>
                    <p className="text-[9px] font-medium text-muted-foreground mt-0.5">
                      {isCash
                        ? "Allow payments upon vehicle pickup or at your hub."
                        : `Accept direct payments via ${displayName}.`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CustomToggle
                    enabled={details.enabled}
                    onClick={() => handleToggle(key)}
                  />
                  {!isCash && (
                    <Button
                      variant="ghost"
                      size="icon"
                      disabled={isSavingPayments}
                      className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md disabled:opacity-50"
                      onClick={() => handleDeleteMethod(key)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>

              {details.enabled && !isCash && (
                <div className="px-3 pb-3 pt-1 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in slide-in-from-top-2">
                  {/* Row 1: Name and Number */}
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Account Name
                    </label>
                    <Input
                      placeholder="e.g., Juan Dela Cruz"
                      value={details.account_name || ""}
                      disabled={isSavingPayments}
                      onChange={(e) =>
                        handleChange(key, "account_name", e.target.value)
                      }
                      className="h-8 text-[11px] font-semibold bg-background border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground disabled:opacity-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Account Number
                    </label>
                    <Input
                      placeholder="0000 0000 0000"
                      value={details.account_number || ""}
                      disabled={isSavingPayments}
                      onChange={(e) =>
                        handleChange(key, "account_number", e.target.value)
                      }
                      className="h-8 text-[11px] font-semibold bg-background border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary font-mono transition-colors text-foreground disabled:opacity-50"
                    />
                  </div>

                  {/* Row 2: Instructions */}
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Payment Instructions
                    </label>
                    <Input
                      placeholder="e.g., Please put your Booking ID in the transfer remarks."
                      value={details.instructions || ""}
                      disabled={isSavingPayments}
                      onChange={(e) =>
                        handleChange(key, "instructions", e.target.value)
                      }
                      className="h-8 text-[11px] font-semibold bg-background border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground disabled:opacity-50"
                    />
                  </div>

                  {/* Row 3: QR CODE UPLOAD SECTION */}
                  <div className="space-y-2 sm:col-span-2 mt-2 border-t border-border pt-3">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      QR Code Image
                      {isUploading && activeUploadKey === key && (
                        <Loader2 className="w-3 h-3 animate-spin text-primary" />
                      )}
                    </label>

                    {details.qr_code_url ? (
                      <div className="flex items-center gap-3">
                        <div className="relative w-16 h-16 rounded-md border border-border overflow-hidden bg-white shadow-sm">
                          <Image
                            src={details.qr_code_url}
                            alt={`${displayName} QR`}
                            fill
                            className="object-contain"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={isSavingPayments || isUploading}
                          onClick={() => handleChange(key, "qr_code_url", "")}
                          className="h-8 text-[10px] font-bold uppercase tracking-widest text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-50"
                        >
                          Remove QR
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-[10px] font-bold uppercase tracking-widest border-dashed text-muted-foreground hover:text-foreground disabled:opacity-50"
                        disabled={isUploading || isSavingPayments}
                        onClick={() => {
                          setActiveUploadKey(key);
                          triggerFileDialog();
                        }}
                      >
                        <UploadCloud className="w-3.5 h-3.5 mr-2" />
                        {isUploading && activeUploadKey === key
                          ? "Uploading..."
                          : "Upload QR Code"}
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* ADD NEW METHOD BAR */}
        <div className="mt-4  flex items-center gap-2 pt-2 border-t border-border">
          <Input
            placeholder="Add new method (e.g. Maya, UnionBank)"
            value={newMethodName}
            disabled={isSavingPayments}
            onChange={(e) => setNewMethodName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddMethod()}
            className="h-8 text-[11px] font-semibold bg-secondary border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground flex-1 disabled:opacity-50"
          />
          <Button
            size="sm"
            onClick={handleAddMethod}
            disabled={!newMethodName.trim() || isSavingPayments}
            className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground transition-colors shrink-0 shadow-none disabled:opacity-50"
          >
            <Plus className="w-3.5 h-3.5 mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-background p-3 shrink-0 flex justify-end transition-colors">
        <Button
          className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity disabled:opacity-50"
          onClick={handleSave}
          disabled={isSavingPayments || isUploading}
        >
          {isSavingPayments ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-2" />
          )}
          {isSavingPayments ? "Saving..." : "Save Configurations"}
        </Button>
      </div>
    </div>
  );
}
