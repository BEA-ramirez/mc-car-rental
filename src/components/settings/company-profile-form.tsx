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
import {
  getCompanyProfile,
  saveCompanyProfile,
  CompanyProfile,
} from "@/actions/settings";

const DEFAULT_PROFILE: CompanyProfile = {
  name: "",
  email: "",
  address: "",
  website: "",
  contact_number: "",
};

export default function CompanyProfileForm() {
  const [profile, setProfile] = useState<CompanyProfile>(DEFAULT_PROFILE);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getCompanyProfile();
        if (data) setProfile(data);
      } catch (error) {
        toast.error("Failed to load company profile.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  const handleChange = (field: keyof CompanyProfile, value: string) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!profile.name || !profile.email) {
      toast.error("Business Name and Email are required.");
      return;
    }

    setIsSaving(true);
    try {
      await saveCompanyProfile(profile);
      toast.success("Company profile updated successfully!");
    } catch (error) {
      toast.error("Failed to save company profile.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-bold animate-pulse">
        Loading Profile...
      </div>
    );

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col max-w-3xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-blue-600" />
            Company Identity
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Primary business details used in contracts, invoices, and automated
            emails.
          </p>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-6 space-y-6 bg-white">
        {/* Row 1: Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Building2 className="w-3 h-3" /> Registered Business Name
            </label>
            <Input
              placeholder="e.g., MC Car Rental Services"
              value={profile.name}
              onChange={(e) => handleChange("name", e.target.value)}
              className="h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-sm shadow-sm font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Mail className="w-3 h-3" /> Official Email Address
            </label>
            <Input
              type="email"
              placeholder="admin@rentalcompany.com"
              value={profile.email}
              onChange={(e) => handleChange("email", e.target.value)}
              className="h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-sm shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Row 2: Phone & Website */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Phone className="w-3 h-3" /> Contact Number
            </label>
            <Input
              placeholder="+63 917 123 4567"
              value={profile.contact_number}
              onChange={(e) => handleChange("contact_number", e.target.value)}
              className="h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-sm shadow-sm font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
              <Globe className="w-3 h-3" /> Website URL
            </label>
            <Input
              placeholder="www.rentalcompany.com"
              value={profile.website}
              onChange={(e) => handleChange("website", e.target.value)}
              className="h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-sm shadow-sm font-medium"
            />
          </div>
        </div>

        {/* Row 3: Address (Full Width) */}
        <div className="space-y-1.5 border-t border-slate-100 pt-5 mt-2">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3 h-3" /> Headquarters Address
          </label>
          <Input
            placeholder="Complete street address, city, and province..."
            value={profile.address}
            onChange={(e) => handleChange("address", e.target.value)}
            className="h-9 text-xs border-slate-200 focus-visible:ring-blue-500 rounded-sm shadow-sm font-medium"
          />
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
          Save Profile Changes
        </Button>
      </div>
    </div>
  );
}
