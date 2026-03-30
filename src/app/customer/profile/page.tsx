"use client";

import { useState, useEffect } from "react";
import {
  User,
  ShieldCheck,
  FileText,
  UploadCloud,
  Car,
  Key,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useProfile } from "../../../../hooks/use-profile";

export default function CustomerProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  // Real Data Hook
  const {
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    uploadDocument,
    isUploadingDoc,
  } = useProfile();

  // Local Form State
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    address: "",
  });

  // Sync Form State when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.full_name || "",
        phone: profile.phone_number || "",
        address: profile.address || "",
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (isEditing) {
      const submitData = new FormData();
      submitData.append("fullName", formData.fullName);
      submitData.append("phone", formData.phone);
      submitData.append("address", formData.address);
      await updateProfile(submitData);
    }
    setIsEditing(!isEditing);
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: "license_id" | "valid_id",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append("file", file);
    uploadData.append("category", category);

    const toastId = toast.loading(
      `Uploading ${category === "license_id" ? "License" : "ID"}...`,
    );

    try {
      await uploadDocument(uploadData);
      toast.dismiss(toastId);
    } catch (error) {
      toast.dismiss(toastId);
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === "verified" || status === "approved")
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
          <CheckCircle2 className="w-3 h-3" /> Verified
        </span>
      );
    if (status === "pending")
      return (
        <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-md border border-amber-200">
          <Clock className="w-3 h-3" /> In Review
        </span>
      );
    return (
      <span className="flex items-center gap-1 text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200">
        <AlertCircle className="w-3 h-3" /> Action Needed
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error loading profile.
      </div>
    );
  }

  // --- Find Most Recent Documents ---
  const documents = profile.documents || [];
  const latestLicense = documents
    .filter((d: any) => d.category === "license_id")
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];

  const latestValidId = documents
    .filter((d: any) => d.category === "valid_id")
    .sort(
      (a: any, b: any) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )[0];

  const licenseStatus = latestLicense?.status || "unverified";
  const validIdStatus = latestValidId?.status || "unverified";
  const accountStatus = profile.account_status || "unverified";

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans pb-24">
      {/* Premium Header */}
      <div className="bg-slate-900 text-white pt-16 pb-24 px-6">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-3xl font-black border-4 border-slate-800 shrink-0 uppercase">
            {profile.full_name ? profile.full_name.charAt(0) : "?"}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black tracking-tight mb-1">
              {profile.full_name || "New User"}
            </h1>
            <p className="text-slate-400 text-sm mb-3">{profile.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2">
              {getStatusBadge(accountStatus)}
              <span className="text-xs font-medium text-slate-500 bg-slate-800 px-2 py-1 rounded-md">
                Trust Score:{" "}
                {profile.trust_score
                  ? Number(profile.trust_score).toFixed(1)
                  : "5.0"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 -mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* LEFT COLUMN: Personal Info & Documents */}
          <div className="lg:col-span-8 space-y-8">
            {/* Personal Details Form */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                    <User className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Personal Details
                  </h2>
                </div>
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  disabled={isUpdating}
                  className={cn(
                    "rounded-xl font-bold",
                    isEditing
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "border-slate-200 text-slate-600",
                  )}
                  onClick={handleSave}
                >
                  {isUpdating
                    ? "Saving..."
                    : isEditing
                      ? "Save Changes"
                      : "Edit Profile"}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Full Name
                  </Label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({ ...formData, fullName: e.target.value })
                    }
                    disabled={!isEditing}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 disabled:opacity-100 disabled:text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Email Address
                  </Label>
                  <Input
                    value={profile.email || ""}
                    disabled={true}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 opacity-60 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Phone Number
                  </Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 disabled:opacity-100 disabled:text-slate-900 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Complete Address
                  </Label>
                  <Input
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                    className="h-12 rounded-xl border-slate-200 bg-slate-50 disabled:opacity-100 disabled:text-slate-900 font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Identity Verification (KYC) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-900">
                    Identity Verification
                  </h2>
                </div>
              </div>
              <p className="text-sm text-slate-500 mb-6 max-w-lg">
                To keep our fleet and community safe, we require a valid
                Driver's License and one additional Government ID.
              </p>

              <div className="space-y-4">
                {/* Driver's License */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                      <Car className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                        Professional Driver's License
                        {getStatusBadge(licenseStatus)}
                      </h4>
                      {latestLicense ? (
                        <p className="text-xs text-slate-500 font-mono">
                          File: {latestLicense.file_name}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Required for self-drive rentals.
                        </p>
                      )}
                    </div>
                  </div>
                  {(licenseStatus === "unverified" ||
                    licenseStatus === "rejected") && (
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        disabled={isUploadingDoc}
                        onChange={(e) => handleFileUpload(e, "license_id")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-slate-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 bg-white shadow-sm shrink-0 w-full sm:w-auto"
                      >
                        <UploadCloud className="w-4 h-4 mr-2" /> Upload
                      </Button>
                    </div>
                  )}
                </div>

                {/* Valid ID */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl gap-4">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm shrink-0">
                      <FileText className="w-6 h-6 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                        Secondary Valid ID
                        {getStatusBadge(validIdStatus)}
                      </h4>
                      {latestValidId ? (
                        <p className="text-xs text-slate-500 font-mono">
                          File: {latestValidId.file_name}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500">
                          Passport, UMID, Postal, or National ID.
                        </p>
                      )}
                    </div>
                  </div>
                  {(validIdStatus === "unverified" ||
                    validIdStatus === "rejected") && (
                    <div className="relative">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        disabled={isUploadingDoc}
                        onChange={(e) => handleFileUpload(e, "valid_id")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-lg border-slate-200 text-blue-600 hover:bg-blue-50 hover:text-blue-700 bg-white shadow-sm shrink-0 w-full sm:w-auto"
                      >
                        <UploadCloud className="w-4 h-4 mr-2" /> Upload
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Partner Hub */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-3xl p-6 md:p-8 shadow-lg text-white border border-slate-800 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl -mr-10 -mt-10" />

              <h2 className="text-xl font-black mb-2 relative z-10">
                Partner with Us
              </h2>
              <p className="text-sm text-slate-400 mb-8 relative z-10 leading-relaxed">
                Turn your driving skills or your idle vehicle into a consistent
                source of income.
              </p>

              <div className="space-y-4 relative z-10">
                <div
                  onClick={() => router.push("/customer/apply-driver")}
                  className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                      <Key className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
                      Become a Driver
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 pl-11">
                    Apply to be an official company driver. Drive our fleet, set
                    your schedule, and earn daily fees.
                  </p>
                </div>

                <div
                  onClick={() => router.push("/customer/list-vehicle")}
                  className="bg-slate-800/50 hover:bg-slate-800 border border-slate-700 p-4 rounded-2xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                      <Car className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                      List Your Vehicle
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 pl-11">
                    Become a Fleet Partner. Enroll your SUV or Sedan and earn up
                    to 70% revenue share per booking.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
