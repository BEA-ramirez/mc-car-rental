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
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          <CheckCircle2 className="w-3.5 h-3.5" /> Verified
        </span>
      );
    if (status === "pending")
      return (
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
          <Clock className="w-3.5 h-3.5" /> In Review
        </span>
      );
    if (status === "expired" || status === "rejected") {
      return (
        <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-red-400 bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
          <AlertCircle className="w-3.5 h-3.5" /> Action Needed
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold text-gray-400 bg-white/5 px-3 py-1 rounded-full border border-white/10">
        <AlertCircle className="w-3.5 h-3.5" /> Unverified
      </span>
    );
  };

  // Specific colored badges for the document list
  const getDocStatusBadge = (status: string) => {
    if (status === "verified")
      return (
        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold">
          Verified
        </span>
      );
    if (status === "pending")
      return (
        <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold">
          Reviewing
        </span>
      );
    if (status === "expired" || status === "rejected")
      return (
        <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold">
          Rejected/Expired
        </span>
      );
    return (
      <span className="text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-widest font-bold">
        Missing
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050B10] flex items-center justify-center text-xs uppercase tracking-widest text-gray-500 font-bold">
        <div className="w-8 h-8 border-4 border-white/10 border-t-[#64c5c3] rounded-full animate-spin mr-4" />{" "}
        Loading Profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#050B10] flex items-center justify-center text-xs uppercase tracking-widest text-red-400 font-bold">
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
    <div className="min-h-screen bg-[#050B10] text-white font-sans selection:bg-[#64c5c3] selection:text-black pb-24">
      {/* Top Nav (Glassmorphic) */}
      <nav className="fixed top-0 w-full z-50 bg-[#050B10]/50 backdrop-blur-lg border-b border-white/5 transition-all duration-500">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 cursor-pointer group"
          >
            <span className="text-2xl font-black tracking-tighter text-white group-hover:text-[#64c5c3] transition-colors duration-300">
              MC ORMOC
            </span>
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/customer/fleet"
              className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#64c5c3] transition-colors"
            >
              Fleet
            </Link>
            <Link
              href="/customer/my-bookings"
              className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-[#64c5c3] transition-colors"
            >
              Bookings
            </Link>
          </div>
        </div>
      </nav>

      {/* Profile Header */}
      <div className="relative pt-32 pb-16 px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-[#64c5c3]/10 rounded-full blur-[120px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-28 h-28 rounded-full bg-[#0a1118] flex items-center justify-center text-4xl font-black text-[#64c5c3] border-2 border-white/10 shrink-0 uppercase shadow-2xl relative overflow-hidden">
            {profile.full_name ? profile.full_name.charAt(0) : "?"}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#64c5c3]/10 to-transparent pointer-events-none" />
          </div>

          <div className="text-center md:text-left mt-2">
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tighter uppercase mb-2 leading-none">
              {profile.full_name || "New User"}
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm font-bold tracking-widest mb-4">
              {profile.email}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-3">
              {getStatusBadge(accountStatus)}
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-black/40 border border-white/10 px-3 py-1 rounded-full flex items-center gap-2">
                Trust Score:{" "}
                <span className="text-[#64c5c3]">
                  {profile.trust_score
                    ? Number(profile.trust_score).toFixed(1)
                    : "5.0"}
                </span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-6xl mx-auto px-6 mt-12 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: Personal Info & Documents */}
          <div className="lg:col-span-8 space-y-8">
            {/* Form */}
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="bg-[#0a1118]/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white/5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-[#64c5c3]/10 rounded-xl">
                    <User className="w-5 h-5 text-[#64c5c3]" />
                  </div>
                  <h2 className="text-xl font-black text-white uppercase tracking-wider">
                    Personal Details
                  </h2>
                </div>

                {isEditing ? (
                  <Button
                    key="save-btn"
                    type="submit"
                    disabled={isUpdating}
                    className="rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest bg-[#64c5c3] text-black hover:bg-[#52a3a1] transition-all duration-300 w-full sm:w-auto"
                  >
                    {isUpdating ? "Saving..." : "Save Changes"}
                  </Button>
                ) : (
                  <Button
                    key="edit-btn"
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsEditing(true);
                    }}
                    variant="outline"
                    className="rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest bg-transparent border-white/20 text-white hover:bg-white hover:text-black transition-all duration-300 w-full sm:w-auto"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    First Name
                  </Label>
                  <Input
                    {...form.register("first_name")}
                    disabled={!isEditing}
                    className={cn(
                      "h-12 rounded-xl bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] transition-all disabled:opacity-50 disabled:bg-black/20",
                      form.formState.errors.first_name &&
                        "border-red-500/50 focus-visible:ring-red-500",
                    )}
                  />
                  {form.formState.errors.first_name && (
                    <p className="text-[9px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                      {form.formState.errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Last Name
                  </Label>
                  <Input
                    {...form.register("last_name")}
                    disabled={!isEditing}
                    className={cn(
                      "h-12 rounded-xl bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] transition-all disabled:opacity-50 disabled:bg-black/20",
                      form.formState.errors.last_name &&
                        "border-red-500/50 focus-visible:ring-red-500",
                    )}
                  />
                  {form.formState.errors.last_name && (
                    <p className="text-[9px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                      {form.formState.errors.last_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Email Address
                  </Label>
                  <Input
                    value={profile.email || ""}
                    disabled={true}
                    className="h-12 rounded-xl border-transparent bg-white/5 text-gray-400 font-medium cursor-not-allowed"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Phone Number
                  </Label>
                  <Input
                    {...form.register("phone_number")}
                    disabled={!isEditing}
                    className={cn(
                      "h-12 rounded-xl bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] transition-all disabled:opacity-50 disabled:bg-black/20",
                      form.formState.errors.phone_number &&
                        "border-red-500/50 focus-visible:ring-red-500",
                    )}
                  />
                  {form.formState.errors.phone_number && (
                    <p className="text-[9px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                      {form.formState.errors.phone_number.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                    Complete Address
                  </Label>
                  <Input
                    {...form.register("address")}
                    disabled={!isEditing}
                    className="h-12 rounded-xl bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] transition-all disabled:opacity-50 disabled:bg-black/20"
                  />
                </div>
              </div>
            </form>

            {/* Identity Verification (KYC) */}
            <div className="bg-[#0a1118]/80 backdrop-blur-xl rounded-3xl p-6 md:p-10 shadow-2xl border border-white/5">
              <div className="flex items-center gap-3 mb-4 pb-6 border-b border-white/10">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-wider">
                  Identity Verification
                </h2>
              </div>
              <p className="text-[10px] sm:text-xs text-gray-400 font-bold mb-8 max-w-lg leading-relaxed">
                To keep our fleet and community safe, we require a valid
                Driver's License and one additional Government ID.
              </p>

              <div className="space-y-4">
                {/* Driver's License */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-black/40 border border-white/5 rounded-2xl gap-4 transition-all hover:border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                      <Car className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1 flex items-center gap-3">
                        Professional Driver's License
                      </h4>
                      {latestLicense ? (
                        <div className="mt-2 flex items-center gap-3">
                          {getDocStatusBadge(licenseStatus)}
                          <p className="text-[9px] text-gray-500 font-mono tracking-widest truncate max-w-[120px] sm:max-w-[200px]">
                            {latestLicense.file_name}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-3">
                          {getDocStatusBadge(licenseStatus)}
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                            Required for self-drive.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {(licenseStatus === "expired" ||
                    licenseStatus === "rejected" ||
                    licenseStatus === "pending" ||
                    licenseStatus === "unverified") && (
                    <div className="relative w-full sm:w-auto">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        disabled={isUploadingDoc}
                        onChange={(e) => handleFileUpload(e, "license_id")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest bg-white/5 border-white/20 text-white hover:bg-[#64c5c3] hover:text-black hover:border-transparent transition-all shrink-0"
                      >
                        <UploadCloud className="w-4 h-4 mr-2" /> Upload
                      </Button>
                    </div>
                  )}
                </div>

                {/* Valid ID */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 md:p-6 bg-black/40 border border-white/5 rounded-2xl gap-4 transition-all hover:border-white/10">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/10 shrink-0">
                      <FileText className="w-5 h-5 text-gray-400" />
                    </div>
                    <div>
                      <h4 className="text-[11px] font-bold text-white uppercase tracking-widest mb-1 flex items-center gap-3">
                        Secondary Valid ID
                      </h4>
                      {latestValidId ? (
                        <div className="mt-2 flex items-center gap-3">
                          {getDocStatusBadge(validIdStatus)}
                          <p className="text-[9px] text-gray-500 font-mono tracking-widest truncate max-w-[120px] sm:max-w-[200px]">
                            {latestValidId.file_name}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2 flex items-center gap-3">
                          {getDocStatusBadge(validIdStatus)}
                          <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">
                            Passport, UMID, or Postal.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {(validIdStatus === "expired" ||
                    validIdStatus === "rejected" ||
                    validIdStatus === "pending" ||
                    validIdStatus === "unverified") && (
                    <div className="relative w-full sm:w-auto">
                      <Input
                        type="file"
                        accept="image/*,.pdf"
                        disabled={isUploadingDoc}
                        onChange={(e) => handleFileUpload(e, "valid_id")}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <Button
                        variant="outline"
                        className="w-full sm:w-auto rounded-xl h-10 px-6 font-bold text-[10px] uppercase tracking-widest bg-white/5 border-white/20 text-white hover:bg-[#64c5c3] hover:text-black hover:border-transparent transition-all shrink-0"
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
            <div className="bg-[#0a1118]/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl text-white border border-white/5 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#64c5c3]/10 rounded-full blur-[80px] pointer-events-none" />

              <h2 className="text-3xl font-black uppercase tracking-tighter mb-2 relative z-10">
                Partner with Us
              </h2>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-8 relative z-10 leading-relaxed border-b border-white/10 pb-6">
                Turn your driving skills or your idle vehicle into a consistent
                source of income.
              </p>

              <div className="space-y-4 relative z-10">
                {profile.role !== "driver" && (
                  <div
                    onClick={() => router.push("/customer/apply-driver")}
                    className="bg-black/40 hover:bg-white/5 border border-white/5 p-6 rounded-2xl transition-all cursor-pointer group hover:border-[#64c5c3]/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-[#64c5c3]/10 text-[#64c5c3] rounded-xl group-hover:bg-[#64c5c3] group-hover:text-black transition-colors">
                        <Key className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[#64c5c3] transition-colors">
                        Become a Driver
                      </h3>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed pl-12">
                      Apply to be an official company driver. Drive our fleet,
                      set your schedule, and earn daily fees.
                    </p>
                  </div>
                )}

                {profile.role !== "fleet_partner" && (
                  <div
                    onClick={() => router.push("/customer/list-vehicle")}
                    className="bg-black/40 hover:bg-white/5 border border-white/5 p-6 rounded-2xl transition-all cursor-pointer group hover:border-[#64c5c3]/30"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2.5 bg-[#64c5c3]/10 text-[#64c5c3] rounded-xl group-hover:bg-[#64c5c3] group-hover:text-black transition-colors">
                        <Car className="w-4 h-4" />
                      </div>
                      <h3 className="text-xs font-black uppercase tracking-widest text-white group-hover:text-[#64c5c3] transition-colors">
                        List Your Vehicle
                      </h3>
                    </div>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-relaxed pl-12">
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
