"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Save,
  Loader2,
  Building2,
  Mail,
  Phone,
  MapPin,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { CompanyProfile } from "@/actions/settings";
import { useBookingSettings } from "../../../hooks/use-settings";

const DEFAULT_PROFILE: CompanyProfile = {
  name: "",
  email: "",
  address: "",
  website: "",
  contact_number: "",
};

export default function CompanyProfileForm() {
  // 1. Pull everything from our master hook
  const { data, isLoading, saveCompanyProfile, isSavingCompanyProfile } =
    useBookingSettings();

  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);

  // 2. Sync the hook's cached data into our local state when it loads
  useEffect(() => {
    if (data?.companyProfile) {
      setProfile(data.companyProfile);
    }
  }, [data?.companyProfile]);

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email) {
      toast.error("Business Name and Email are required.");
      return;
    }

    // 3. Call the hook's mutation! It handles the loading state and toasts automatically.
    try {
      await saveCompanyProfile(profile);
    } catch (error) {
      console.error("Save failed:", error);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Loading Profile...
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col max-w-3xl transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <Building2 className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
              Company Identity
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Primary business details for contracts & invoices
            </p>
          </div>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-4 space-y-4 bg-background transition-colors">
        {/* Row 1: Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3 h-3" /> Registered Business Name
            </label>
            <Input
              placeholder="e.g., MC Car Rental Services"
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-8 text-[11px] font-normal bg-secondary border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> Official Email Address
            </label>
            <Input
              type="email"
              placeholder="admin@rentalcompany.com"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-8 text-[11px] font-normal bg-secondary border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
            />
          </div>
        </div>

        {/* Row 2: Phone & Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> Contact Number
            </label>
            <Input
              placeholder="+63 917 123 4567"
              value={profile.contact_number}
              onChange={(e) => handleChange("contact_number", e.target.value)}
              className="h-8 text-[11px] font-normal bg-secondary border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Website URL
            </label>
            <Input
              placeholder="www.rentalcompany.com"
              value={profile.website}
              onChange={(e) => handleChange("website", e.target.value)}
              className="h-8 text-[11px] font-normal bg-secondary border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
            />
          </div>
        </div>

        {/* Row 3: Address (Full Width) */}
        <div className="space-y-1.5 border-t border-border pt-4 mt-1 transition-colors">
          <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Headquarters Address
          </label>
          <Input
            placeholder="Complete street address, city, and province..."
            value={profile.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="h-8 text-[11px] font-normal bg-secondary border-border shadow-none rounded-lg focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
          />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end transition-colors">
        <Button
          type="button" // Prevent accidental form submissions
          className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
          onClick={handleSave}
          disabled={isSavingCompanyProfile}
        >
          {isSavingCompanyProfile ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-2" />
          )}
          Save Profile
        </Button>
      </div>
    </div>
  );
}
