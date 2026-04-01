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
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useProfile } from "../../../../hooks/use-profile";
import Link from "next/link";

// Form zod schema
const ProfileSchema = z.object({
  first_name: z.string().min(2, "First name is required"),
  last_name: z.string().min(2, "Last name is required"),
  phone_number: z
    .string()
    .min(10, "Valid phone number required")
    .optional()
    .or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
});

type ProfileFormValues = z.infer<typeof ProfileSchema>;

// --- CUSTOM HIGH-END LOGO ---
const PremiumLogo = () => (
  <div className="relative w-6 h-6 flex items-center justify-center group cursor-pointer">
    <div className="absolute w-full h-full border-[1.5px] border-white/80 rounded-sm transform rotate-45 transition-transform duration-700 group-hover:rotate-90" />
    <div className="absolute w-full h-full border-[1.5px] border-blue-500/80 rounded-sm transform -rotate-45 transition-transform duration-700 group-hover:-rotate-90" />
    <span className="relative z-10 text-[8px] font-black text-white tracking-tighter">
      M
    </span>
  </div>
);

export default function CustomerProfilePage() {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const {
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    uploadDocument,
    isUploadingDoc,
  } = useProfile();

  // Initialize useForm
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      first_name: "",
      last_name: "",
      phone_number: "",
      address: "",
    },
  });

  useEffect(() => {
    if (profile) {
      form.reset({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone_number: profile.phone_number || "",
        address: profile.address || "",
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    const submitData = new FormData();
    submitData.append("first_name", data.first_name);
    submitData.append("last_name", data.last_name);
    submitData.append("phone", data.phone_number || "");
    submitData.append("address", data.address || "");

    await updateProfile(submitData);
    setIsEditing(false);
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

  // Main Account Status Badge
  const getStatusBadge = (status: string) => {
    if (status === "verified")
      return (
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-sm border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Verified
        </span>
      );
    if (status === "pending")
      return (
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-sm border border-amber-500/20">
          <Clock className="w-3 h-3" /> In Review
        </span>
      );
    if (status === "expired" || status === "rejected") {
      return (
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-sm border border-red-500/20">
          <AlertCircle className="w-3 h-3" /> Re-upload Document
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-slate-400 bg-white/5 px-2 py-0.5 rounded-sm border border-white/10">
        <AlertCircle className="w-3 h-3" /> Action Needed
      </span>
    );
  };

  // Specific colored badges for the document list
  const getDocStatusBadge = (status: string) => {
    if (status === "verified")
      return (
        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold">
          Verified
        </span>
      );
    if (status === "pending")
      return (
        <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold">
          Pending Review
        </span>
      );
    if (status === "expired" || status === "rejected")
      return (
        <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold">
          Rejected / Expired
        </span>
      );
    return (
      <span className="text-slate-400 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded-sm text-[8px] uppercase tracking-widest font-bold">
        Unverified
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center text-[10px] uppercase tracking-widest text-slate-500 font-medium">
        Loading...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#0A0C10] flex items-center justify-center text-[10px] uppercase tracking-widest text-red-400 font-medium">
        Error loading profile.
      </div>
    );
  }

  // Find most recent docs
  const documents = profile.documents || [];
  const latestLicense = documents.find((d: any) => d.category === "license_id");
  const latestValidId = documents.find((d: any) => d.category === "valid_id");

  const licenseStatus = latestLicense?.status || "unverified";
  const validIdStatus = latestValidId?.status || "unverified";
  const accountStatus = profile.account_status || "unverified";

  return (
    <div className="min-h-screen bg-[#0A0C10] font-sans selection:bg-blue-900 selection:text-white pb-24">
      {/* Top Nav (Premium Frosted Glass) */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0C10]/80 backdrop-blur-xl border-b border-white/5 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-4 cursor-pointer group"
          >
            <PremiumLogo />
            <span className="text-[10px] font-medium text-white tracking-[0.3em] uppercase mt-0.5 group-hover:text-blue-400 transition-colors duration-500">
              MC Ormoc
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/customer/fleet"
              className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
            >
              Fleet
            </Link>
            <Link
              href="/customer/my-bookings"
              className="text-[9px] font-medium uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors"
            >
              Itinerary
            </Link>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-900/10 via-[#0A0C10] to-[#0A0C10] -z-10" />
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="w-24 h-24 rounded-full bg-[#111623] flex items-center justify-center text-3xl font-light text-white border border-white/10 shrink-0 uppercase shadow-2xl">
            {profile.full_name ? profile.full_name.charAt(0) : "?"}
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl font-light text-white tracking-tighter mb-2">
              {profile.full_name || "New User"}
            </h1>
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-widest mb-4">
              {profile.email}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              {getStatusBadge(accountStatus)}
              <span className="text-[9px] font-medium text-slate-400 uppercase tracking-widest bg-white/5 border border-white/10 px-2 py-0.5 rounded-sm">
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
      <div className="max-w-5xl mx-auto px-6 mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Personal Info & Documents */}
          <div className="lg:col-span-8 space-y-12">
            {/* Form */}
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="bg-white/[0.02] backdrop-blur-xl rounded-sm p-8 shadow-2xl border border-white/5 relative overflow-hidden"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="flex items-center justify-between mb-10 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <User className="w-5 h-5 text-blue-500" />
                  <h2 className="text-lg font-light text-white tracking-wide">
                    Personal Details
                  </h2>
                </div>

                {isEditing ? (
                  <Button
                    key="save-btn" // FIX: Forces React to treat this as a distinct element
                    type="submit"
                    size="sm"
                    disabled={isUpdating}
                    className="rounded-none h-8 px-4 font-bold text-[9px] uppercase tracking-widest bg-white text-[#0A0C10] hover:bg-blue-600 hover:text-white transition-all duration-300"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                ) : (
                  <Button
                    key="edit-btn" // FIX: Forces React to treat this as a distinct element
                    type="button" // FIX: Explicitly prevents form submission
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault(); // FIX: Completely blocks any native browser submit action
                      setIsEditing(true);
                    }}
                    className="rounded-none h-8 px-4 font-bold text-[9px] uppercase tracking-widest bg-transparent border-white/20 text-white hover:bg-white hover:text-[#0A0C10] transition-all duration-300"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                    First Name
                  </Label>
                  <Input
                    {...form.register("first_name")}
                    disabled={!isEditing}
                    className={cn(
                      "h-11 rounded-none border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all duration-300 disabled:opacity-50",
                      form.formState.errors.first_name && "border-red-500/50",
                    )}
                  />
                  {form.formState.errors.first_name && (
                    <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                      {form.formState.errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                    Last Name
                  </Label>
                  <Input
                    {...form.register("last_name")}
                    disabled={!isEditing}
                    className={cn(
                      "h-11 rounded-none border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all duration-300 disabled:opacity-50",
                      form.formState.errors.last_name && "border-red-500/50",
                    )}
                  />
                  {form.formState.errors.last_name && (
                    <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                      {form.formState.errors.last_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                    Email Address
                  </Label>
                  <Input
                    value={profile.email || ""}
                    disabled={true}
                    className="h-11 rounded-none border-transparent bg-transparent text-slate-400 opacity-60 font-light cursor-not-allowed px-0"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                    Phone Number
                  </Label>
                  <Input
                    {...form.register("phone_number")}
                    disabled={!isEditing}
                    className={cn(
                      "h-11 rounded-none border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all duration-300 disabled:opacity-50",
                      form.formState.errors.phone_number && "border-red-500/50",
                    )}
                  />
                  {form.formState.errors.phone_number && (
                    <p className="text-[9px] text-red-400 mt-1 uppercase tracking-wider">
                      {form.formState.errors.phone_number.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[9px] font-medium text-slate-500 uppercase tracking-[0.2em]">
                    Complete Address
                  </Label>
                  <Input
                    {...form.register("address")}
                    disabled={!isEditing}
                    className="h-11 rounded-none border-white/10 bg-white/5 text-white placeholder:text-white/20 focus-visible:ring-1 focus-visible:ring-blue-500 transition-all duration-300 disabled:opacity-50"
                  />
                </div>
              </div>
            </form>

            {/* Identity Verification (KYC) */}
            <div className="bg-white/[0.02] backdrop-blur-xl rounded-sm p-8 shadow-2xl border border-white/5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

              <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/5">
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <h2 className="text-lg font-light text-white tracking-wide">
                    Identity Verification
                  </h2>
                </div>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-light mb-8 max-w-lg leading-relaxed">
                To keep our fleet and community safe, we require a valid
                Driver's License and one additional Government ID.
              </p>

              <div className="space-y-4">
                {/* Driver's License */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#050608] border border-white/5 rounded-sm gap-4 transition-all hover:border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-sm border border-white/10 shrink-0">
                      <Car className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-medium text-slate-200 uppercase tracking-widest mb-1 flex items-center gap-3">
                        Professional Driver's License
                      </h4>
                      {latestLicense ? (
                        <div className="mt-3 flex items-center gap-3">
                          {getDocStatusBadge(licenseStatus)}
                          <p className="text-[9px] text-slate-500 font-mono tracking-widest">
                            {latestLicense.file_name}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-3">
                          {getDocStatusBadge(licenseStatus)}
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                            Required for self-drive rentals.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {(licenseStatus === "expired" ||
                    licenseStatus === "rejected" ||
                    licenseStatus === "pending" ||
                    licenseStatus === "unverified") && (
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
                        className="rounded-none h-9 px-4 font-bold text-[9px] uppercase tracking-widest bg-transparent border-white/20 text-white hover:bg-white hover:text-[#0A0C10] transition-all shrink-0 w-full sm:w-auto"
                      >
                        <UploadCloud className="w-3 h-3 mr-2" /> Upload
                      </Button>
                    </div>
                  )}
                </div>

                {/* Valid ID */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-[#050608] border border-white/5 rounded-sm gap-4 transition-all hover:border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-sm border border-white/10 shrink-0">
                      <FileText className="w-5 h-5 text-slate-400" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-medium text-slate-200 uppercase tracking-widest mb-1 flex items-center gap-3">
                        Secondary Valid ID
                      </h4>
                      {latestValidId ? (
                        <div className="mt-3 flex items-center gap-3">
                          {getDocStatusBadge(validIdStatus)}
                          <p className="text-[9px] text-slate-500 font-mono tracking-widest">
                            {latestValidId.file_name}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-3 flex items-center gap-3">
                          {getDocStatusBadge(validIdStatus)}
                          <p className="text-[9px] text-slate-500 uppercase tracking-widest">
                            Passport, UMID, Postal, or National ID.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {(validIdStatus === "expired" ||
                    validIdStatus === "rejected" ||
                    validIdStatus === "pending" ||
                    validIdStatus === "unverified") && (
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
                        className="rounded-none h-9 px-4 font-bold text-[9px] uppercase tracking-widest bg-transparent border-white/20 text-white hover:bg-white hover:text-[#0A0C10] transition-all shrink-0 w-full sm:w-auto"
                      >
                        <UploadCloud className="w-3 h-3 mr-2" /> Upload
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Partner Hub */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#111623]/80 backdrop-blur-xl rounded-sm p-8 shadow-2xl text-white border border-white/5 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />

              <h2 className="text-2xl font-light tracking-tight mb-2 relative z-10">
                Partner with Us
              </h2>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-light mb-10 relative z-10 leading-relaxed border-b border-white/5 pb-6">
                Turn your driving skills or your idle vehicle into a consistent
                source of income.
              </p>

              <div className="space-y-4 relative z-10">
                {profile.role !== "driver" && (
                  <div
                    onClick={() => router.push("/customer/apply-driver")}
                    className="bg-[#050608]/50 hover:bg-[#050608] border border-white/5 p-5 rounded-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-sm">
                        <Key className="w-4 h-4" />
                      </div>
                      <h3 className="text-[11px] font-medium uppercase tracking-widest text-slate-200 group-hover:text-white transition-colors">
                        Become a Driver
                      </h3>
                    </div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-light leading-relaxed pl-10">
                      Apply to be an official company driver. Drive our fleet,
                      set your schedule, and earn daily fees.
                    </p>
                  </div>
                )}

                {profile.role !== "fleet_partner" && (
                  <div
                    onClick={() => router.push("/customer/list-vehicle")}
                    className="bg-[#050608]/50 hover:bg-[#050608] border border-white/5 p-5 rounded-sm transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-sm">
                        <Car className="w-4 h-4" />
                      </div>
                      <h3 className="text-[11px] font-medium uppercase tracking-widest text-slate-200 group-hover:text-white transition-colors">
                        List Your Vehicle
                      </h3>
                    </div>
                    <p className="text-[9px] text-slate-500 uppercase tracking-widest font-light leading-relaxed pl-10">
                      Become a Fleet Partner. Enroll your SUV or Sedan and earn
                      up to 70% revenue share per booking.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
