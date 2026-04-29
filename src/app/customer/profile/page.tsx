"use client";

import { useState, useEffect, useRef } from "react";
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
  Camera,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import imageCompression from "browser-image-compression";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { useProfile } from "../../../../hooks/use-profile";

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

  // Track the name of the document currently being uploaded
  const [uploadingDocMeta, setUploadingDocMeta] = useState<{
    category: string;
    name: string;
  } | null>(null);

  const {
    profile,
    isLoading,
    updateProfile,
    isUpdating,
    uploadDocument,
    isUploadingDoc,
  } = useProfile();

  // Profile Picture Upload State
  const profilePicRef = useRef<HTMLInputElement>(null);
  const [previewPicUrl, setPreviewPicUrl] = useState<string | null>(null);

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
      // Set initial profile picture preview if it exists in the profile
      if (profile.profile_picture_url) {
        setPreviewPicUrl(profile.profile_picture_url);
      }
    }
  }, [profile, form]);

  const onSubmit = async (data: ProfileFormValues) => {
    const submitData = new FormData();
    submitData.append("first_name", data.first_name);
    submitData.append("last_name", data.last_name);
    submitData.append("phone", data.phone_number || "");
    submitData.append("address", data.address || "");

    // If there's a new profile picture selected, compress and append it
    if (profilePicRef.current?.files?.[0]) {
      let picFile = profilePicRef.current.files[0];

      if (picFile.type.startsWith("image/")) {
        try {
          const compressedBlob = await imageCompression(picFile, {
            maxSizeMB: 0.8,
            maxWidthOrHeight: 1920,
            useWebWorker: true,
          });
          picFile = new File([compressedBlob], picFile.name, {
            type: compressedBlob.type,
            lastModified: Date.now(),
          });
        } catch (err) {
          console.warn("Profile pic compression failed, using original.");
        }
      }
      submitData.append("profile_picture", picFile);
    }

    await updateProfile(submitData);
    setIsEditing(false);
  };

  const handleProfilePicSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (previewPicUrl && !previewPicUrl.startsWith("http")) {
        URL.revokeObjectURL(previewPicUrl);
      }
      setPreviewPicUrl(URL.createObjectURL(file));
      setIsEditing(true);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: "license_id" | "valid_id",
  ) => {
    let file = e.target.files?.[0];
    if (!file) return;

    setUploadingDocMeta({ category, name: file.name });
    const toastId = toast.loading(
      `Compressing & Uploading ${category === "license_id" ? "License" : "ID"}...`,
    );

    try {
      // --- CLIENT-SIDE COMPRESSION ---
      if (file.type.startsWith("image/")) {
        const compressedBlob = await imageCompression(file, {
          maxSizeMB: 0.8,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
        });
        file = new File([compressedBlob], file.name, {
          type: compressedBlob.type,
          lastModified: Date.now(),
        });
      }

      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("category", category);

      await uploadDocument(uploadData);
      toast.success("Document uploaded successfully!", { id: toastId });
    } catch (err: any) {
      toast.error(err.message || "Failed to upload document", { id: toastId });
    } finally {
      setUploadingDocMeta(null);
      e.target.value = ""; // Reset input
    }
  };

  // Main Account Status Badge
  const getStatusBadge = (status: string) => {
    if (status === "VERIFIED")
      return (
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
          <CheckCircle2 className="w-3 h-3" /> Verified
        </span>
      );
    if (status === "PENDING")
      return (
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded border border-amber-500/20">
          <Clock className="w-3 h-3" /> In Review
        </span>
      );
    if (status === "EXPIRED" || status === "REJECTED") {
      return (
        <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-red-400 bg-red-500/10 px-2.5 py-0.5 rounded border border-red-500/20">
          <AlertCircle className="w-3 h-3" /> Action Needed
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 text-[9px] uppercase tracking-widest font-bold text-gray-400 bg-white/5 px-2.5 py-0.5 rounded border border-white/10">
        <AlertCircle className="w-3 h-3" /> Unverified
      </span>
    );
  };

  // Specific colored badges for the document list
  const getDocStatusBadge = (status: string) => {
    if (status === "VERIFIED")
      return (
        <span className="text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold">
          Verified
        </span>
      );
    if (status === "PENDING")
      return (
        <span className="text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold">
          Reviewing
        </span>
      );
    if (status === "EXPIRED" || status === "REJECTED")
      return (
        <span className="text-red-400 bg-red-500/10 border border-red-500/20 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold">
          Rejected/Expired
        </span>
      );
    return (
      <span className="text-gray-400 bg-white/5 border border-white/10 px-2 py-0.5 rounded text-[8px] uppercase tracking-widest font-bold">
        Missing
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-[80vh] bg-[#050B10] flex items-center justify-center text-[10px] uppercase tracking-widest text-gray-500 font-bold">
        <div className="w-6 h-6 border-2 border-white/10 border-t-[#64c5c3] rounded-full animate-spin mr-3" />{" "}
        Loading Profile...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[80vh] bg-[#050B10] flex items-center justify-center text-[10px] uppercase tracking-widest text-red-400 font-bold">
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
    <div className="min-h-screen bg-[#050B10] text-white font-sans selection:bg-[#64c5c3] selection:text-black pb-24 lg:pb-0">
      {/* Profile Header */}
      <div className="relative pt-24 sm:pt-32 pb-12 px-4 sm:px-6 overflow-hidden border-b border-white/5">
        <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[#64c5c3]/10 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
          {/* PROFILE PICTURE UPLOADER */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 rounded-2xl bg-[#0a1118] flex items-center justify-center text-3xl font-black text-[#64c5c3] border border-white/10 overflow-hidden shadow-2xl relative">
              {previewPicUrl ? (
                <Image
                  src={previewPicUrl}
                  alt="Profile"
                  fill
                  className="object-cover"
                />
              ) : profile.full_name ? (
                profile.full_name.charAt(0)
              ) : (
                "?"
              )}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#64c5c3]/5 to-transparent pointer-events-none" />
            </div>

            {/* Hover overlay to change picture */}
            <button
              type="button"
              onClick={() => profilePicRef.current?.click()}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-all duration-300 rounded-2xl border border-white/20"
            >
              <Camera className="w-5 h-5 text-white mb-1" />
              <span className="text-[8px] font-bold text-white uppercase tracking-widest">
                Update
              </span>
            </button>
            <input
              type="file"
              ref={profilePicRef}
              className="hidden"
              accept=".jpg,.png,.jpeg"
              onChange={handleProfilePicSelect}
            />
          </div>

          <div className="text-center md:text-left mt-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter uppercase mb-1.5 leading-none">
              {profile.full_name || "New User"}
            </h1>
            <p className="text-gray-400 text-xs font-bold tracking-widest mb-3">
              {profile.email}
            </p>
            <div className="flex items-center justify-center md:justify-start gap-2.5">
              {getStatusBadge(accountStatus)}
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-white/5 border border-white/10 px-2.5 py-0.5 rounded flex items-center gap-1.5">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mt-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* LEFT COLUMN: Personal Info & Documents */}
          <div className="lg:col-span-8 space-y-6">
            {/* Form */}
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="bg-[#0a1118]/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-2xl border border-white/5"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-white/10 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-[#64c5c3]/10 rounded-lg">
                    <User className="w-4 h-4 text-[#64c5c3]" />
                  </div>
                  <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                    Personal Details
                  </h2>
                </div>

                {isEditing ? (
                  <Button
                    key="save-btn"
                    type="submit"
                    disabled={isUpdating}
                    className="rounded-lg h-8 px-5 font-bold text-[9px] uppercase tracking-widest bg-[#64c5c3] text-black hover:bg-[#52a3a1] transition-all duration-300 w-full sm:w-auto shadow-[0_0_10px_rgba(100,197,195,0.2)]"
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
                    className="rounded-lg h-8 px-5 font-bold text-[9px] uppercase tracking-widest bg-white/5 border-white/10 text-white hover:bg-white hover:text-black transition-all duration-300 w-full sm:w-auto shadow-none"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    First Name
                  </Label>
                  <Input
                    {...form.register("first_name")}
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-xs rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] transition-all disabled:opacity-50 disabled:bg-black/20",
                      form.formState.errors.first_name &&
                        "border-red-500/50 focus-visible:ring-red-500",
                    )}
                  />
                  {form.formState.errors.first_name && (
                    <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                      {form.formState.errors.first_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    Last Name
                  </Label>
                  <Input
                    {...form.register("last_name")}
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-xs rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] transition-all disabled:opacity-50 disabled:bg-black/20",
                      form.formState.errors.last_name &&
                        "border-red-500/50 focus-visible:ring-red-500",
                    )}
                  />
                  {form.formState.errors.last_name && (
                    <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                      {form.formState.errors.last_name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    Email Address
                  </Label>
                  <Input
                    value={profile.email || ""}
                    disabled={true}
                    className="h-9 text-xs rounded-lg border-transparent bg-white/5 text-gray-400 font-medium cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    Phone Number
                  </Label>
                  <Input
                    {...form.register("phone_number")}
                    disabled={!isEditing}
                    className={cn(
                      "h-9 text-xs rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] font-mono transition-all disabled:opacity-50 disabled:bg-black/20",
                      form.formState.errors.phone_number &&
                        "border-red-500/50 focus-visible:ring-red-500",
                    )}
                  />
                  {form.formState.errors.phone_number && (
                    <p className="text-[8px] font-bold text-red-400 mt-1 uppercase tracking-widest">
                      {form.formState.errors.phone_number.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5 sm:col-span-2">
                  <Label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">
                    Complete Address
                  </Label>
                  <Input
                    {...form.register("address")}
                    disabled={!isEditing}
                    className="h-9 text-xs rounded-lg bg-black/50 border-white/10 text-white placeholder:text-gray-600 focus-visible:ring-[#64c5c3] transition-all disabled:opacity-50 disabled:bg-black/20"
                  />
                </div>
              </div>
            </form>

            {/* Identity Verification (KYC) */}
            <div className="bg-[#0a1118]/80 backdrop-blur-xl rounded-2xl p-5 md:p-6 shadow-2xl border border-white/5">
              <div className="flex items-center gap-2.5 mb-4 pb-4 border-b border-white/10">
                <div className="p-2 bg-emerald-500/10 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Identity Verification
                </h2>
              </div>
              <p className="text-[9px] text-gray-400 font-bold mb-5 max-w-lg leading-relaxed uppercase tracking-widest">
                To keep our fleet safe, we require a valid Driver&apos;s License
                and one Government ID.
              </p>

              <div className="space-y-3">
                {/* Driver's License */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl gap-4 transition-all hover:border-white/10">
                  <div className="flex items-start gap-3 w-full sm:w-auto">
                    <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 shrink-0">
                      <Car className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-1.5">
                        Professional Driver&apos;s License
                      </h4>
                      {latestLicense ? (
                        <div className="flex items-center gap-2">
                          {getDocStatusBadge(licenseStatus)}
                          <p className="text-[9px] text-gray-500 font-mono tracking-widest truncate max-w-[120px] sm:max-w-[180px]">
                            {latestLicense.file_name}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getDocStatusBadge(licenseStatus)}
                          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                            Required for self-drive.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {(licenseStatus === "EXPIRED" ||
                    licenseStatus === "REJECTED" ||
                    licenseStatus === "PENDING" ||
                    licenseStatus === "unverified") && (
                    <div className="relative w-full sm:w-[130px] shrink-0">
                      {/* Hide input entirely if this specific component is uploading to prevent UI bleed */}
                      {uploadingDocMeta?.category !== "license_id" && (
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          disabled={isUploadingDoc}
                          onChange={(e) => handleFileUpload(e, "license_id")}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 text-transparent file:hidden"
                        />
                      )}
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full rounded-lg h-8 px-3 font-bold text-[9px] uppercase tracking-widest transition-all overflow-hidden flex items-center justify-center gap-1.5",
                          uploadingDocMeta?.category === "license_id"
                            ? "bg-white/10 border-white/20 text-white/50 cursor-not-allowed"
                            : "bg-white/5 border-white/10 text-white hover:bg-[#64c5c3] hover:text-black hover:border-transparent",
                        )}
                      >
                        {uploadingDocMeta?.category === "license_id" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                            <span className="truncate max-w-[70px]">
                              {uploadingDocMeta.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 shrink-0" />{" "}
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                {/* Valid ID */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-black/40 border border-white/5 rounded-xl gap-4 transition-all hover:border-white/10">
                  <div className="flex items-start gap-3 w-full sm:w-auto">
                    <div className="p-2.5 bg-white/5 rounded-lg border border-white/10 shrink-0">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[10px] font-bold text-white uppercase tracking-widest mb-1.5">
                        Secondary Valid ID
                      </h4>
                      {latestValidId ? (
                        <div className="flex items-center gap-2">
                          {getDocStatusBadge(validIdStatus)}
                          <p className="text-[9px] text-gray-500 font-mono tracking-widest truncate max-w-[120px] sm:max-w-[180px]">
                            {latestValidId.file_name}
                          </p>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          {getDocStatusBadge(validIdStatus)}
                          <p className="text-[8px] text-gray-500 font-bold uppercase tracking-widest">
                            Passport, UMID, or Postal.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  {(validIdStatus === "EXPIRED" ||
                    validIdStatus === "REJECTED" ||
                    validIdStatus === "PENDING" ||
                    validIdStatus === "unverified") && (
                    <div className="relative w-full sm:w-[130px] shrink-0">
                      {/* Hide input entirely if this specific component is uploading to prevent UI bleed */}
                      {uploadingDocMeta?.category !== "valid_id" && (
                        <Input
                          type="file"
                          accept="image/*,.pdf"
                          disabled={isUploadingDoc}
                          onChange={(e) => handleFileUpload(e, "valid_id")}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 text-transparent file:hidden"
                        />
                      )}
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full rounded-lg h-8 px-3 font-bold text-[9px] uppercase tracking-widest transition-all overflow-hidden flex items-center justify-center gap-1.5",
                          uploadingDocMeta?.category === "valid_id"
                            ? "bg-white/10 border-white/20 text-white/50 cursor-not-allowed"
                            : "bg-white/5 border-white/10 text-white hover:bg-[#64c5c3] hover:text-black hover:border-transparent",
                        )}
                      >
                        {uploadingDocMeta?.category === "valid_id" ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
                            <span className="truncate max-w-[70px]">
                              {uploadingDocMeta.name}
                            </span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 shrink-0" />{" "}
                            Upload
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: The Partner Hub */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-[#0a1118]/80 backdrop-blur-xl rounded-2xl p-6 shadow-2xl text-white border border-white/5 relative overflow-hidden h-full flex flex-col">
              <div className="absolute top-0 right-0 w-48 h-48 bg-[#64c5c3]/10 rounded-full blur-[60px] pointer-events-none" />

              <h2 className="text-xl font-black uppercase tracking-tighter mb-1.5 relative z-10">
                Partner with Us
              </h2>
              <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-6 relative z-10 leading-relaxed border-b border-white/10 pb-4">
                Turn your driving skills or idle vehicle into a consistent
                income source.
              </p>

              <div className="space-y-3 relative z-10">
                {profile.role !== "driver" && (
                  <div
                    onClick={() => router.push("/customer/apply-driver")}
                    className="bg-black/40 hover:bg-white/5 border border-white/5 p-4 rounded-xl transition-all cursor-pointer group hover:border-[#64c5c3]/30"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="p-2 bg-[#64c5c3]/10 text-[#64c5c3] rounded-lg group-hover:bg-[#64c5c3] group-hover:text-black transition-colors">
                        <Key className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-white group-hover:text-[#64c5c3] transition-colors">
                        Become a Driver
                      </h3>
                    </div>
                    <p className="text-[9px] text-gray-500 font-medium leading-relaxed pl-10">
                      Apply to be an official company driver. Drive our fleet,
                      set your schedule, and earn daily fees.
                    </p>
                  </div>
                )}

                {profile.role !== "fleet_partner" && (
                  <div
                    onClick={() => router.push("/customer/list-vehicle")}
                    className="bg-black/40 hover:bg-white/5 border border-white/5 p-4 rounded-xl transition-all cursor-pointer group hover:border-[#64c5c3]/30"
                  >
                    <div className="flex items-center gap-2.5 mb-2">
                      <div className="p-2 bg-[#64c5c3]/10 text-[#64c5c3] rounded-lg group-hover:bg-[#64c5c3] group-hover:text-black transition-colors">
                        <Car className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-[11px] font-bold uppercase tracking-widest text-white group-hover:text-[#64c5c3] transition-colors">
                        List Your Vehicle
                      </h3>
                    </div>
                    <p className="text-[9px] text-gray-500 font-medium leading-relaxed pl-10">
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
