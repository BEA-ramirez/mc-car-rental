"use client";

import { useState, useEffect, useRef } from "react";
import { manageUser } from "@/actions/manage-user";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  FileBadge,
  CalendarDays,
  ShieldCheck,
  UploadCloud,
  Loader2,
  ImagePlus,
  Trash2,
  FileText,
} from "lucide-react";

// UI Components
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

// Helper to sanitize/default data
function sanitizeData(props: any) {
  const data = { ...props };

  if (data.isAdd) {
    data.role = "customer";
    data.email = "";
    data.first_name = "";
    data.last_name = "";
    data.phone_number = "";
    data.address = "";
    data.profile_picture_url = "";
    data.license_number = "";
    data.license_expiry_date = "";
    data.valid_id_expiry_date = "";
    data.trust_score = 5.0;
    data.account_status = "pending";
  } else {
    const fullName = data.full_name || "";
    const parts = fullName.split(" ");
    data.first_name = data.first_name || parts[0] || "";
    data.last_name = data.last_name || parts.slice(1).join(" ") || "";

    data.license_number = data.license_number || "";
    data.trust_score = data.trust_score || 5.0;

    // Format dates for HTML Input type="date" (YYYY-MM-DD)
    data.license_expiry_date = data.license_expiry_date
      ? new Date(data.license_expiry_date).toISOString().split("T")[0]
      : "";
    data.valid_id_expiry_date = data.valid_id_expiry_date
      ? new Date(data.valid_id_expiry_date).toISOString().split("T")[0]
      : "";
  }
  return data;
}

interface ClientFormProps {
  data: any;
  closeDialog: () => void;
}

export function ClientForm({ data: rawData, closeDialog }: ClientFormProps) {
  const queryClient = useQueryClient();
  const initialData = sanitizeData(rawData);
  const isAdd = !!initialData.isAdd || !rawData;

  // Refs for manual uploader cleanup
  const profileInputRef = useRef<HTMLInputElement>(null);
  const validIdInputRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(initialData);

  // Files State
  const [files, setFiles] = useState<{
    profile_picture_url?: File | null;
    valid_id_url?: File | null;
    license_id_url?: File | null;
  }>({});

  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Reset form when data changes
  useEffect(() => {
    setFormData(sanitizeData(rawData));
    setFiles({});
    setPreviewUrl(null);
    setPassword("");
    setFieldErrors(null);
    setGlobalError(null);
  }, [rawData]);

  // Cleanup preview URL
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    if (fieldErrors?.[name]) {
      setFieldErrors((prev) => ({ ...prev!, [name]: [] }));
    }
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setGlobalError(null);
    setFieldErrors(null);

    const submitData = new FormData();

    if (formData.user_id) submitData.append("user_id", formData.user_id);

    const constructedFullName =
      `${formData.first_name || ""} ${formData.last_name || ""}`.trim();
    submitData.append("full_name", constructedFullName);

    // Basic Info
    submitData.append("email", formData.email || "");
    submitData.append("first_name", formData.first_name || "");
    submitData.append("last_name", formData.last_name || "");
    submitData.append("role", formData.role || "customer");
    submitData.append("account_status", formData.account_status || "pending");

    // Contact
    submitData.append("phone_number", formData.phone_number || "");
    submitData.append("address", formData.address || "");

    // Compliance
    submitData.append("license_number", formData.license_number || "");
    submitData.append("trust_score", formData.trust_score?.toString() || "5");

    // Dates
    if (formData.license_expiry_date) {
      submitData.append(
        "license_expiry_date",
        new Date(formData.license_expiry_date).toISOString(),
      );
    }
    if (formData.valid_id_expiry_date) {
      submitData.append(
        "valid_id_expiry_date",
        new Date(formData.valid_id_expiry_date).toISOString(),
      );
    }

    if (isAdd && password) {
      submitData.append("password", password);
    }

    // Files
    if (files.profile_picture_url)
      submitData.append("profile_picture_url", files.profile_picture_url);
    if (files.valid_id_url)
      submitData.append("valid_id_url", files.valid_id_url);
    if (files.license_id_url)
      submitData.append("license_id_url", files.license_id_url);

    const promise = manageUser({ message: "", success: false }, submitData);

    toast.promise(promise, {
      loading: isAdd ? "Creating user..." : "Updating user...",
      success: (result) => {
        if (result.success) {
          queryClient.invalidateQueries({ queryKey: ["clients"] });
          closeDialog();
          return isAdd
            ? "User created successfully!"
            : "User updated successfully!";
        } else {
          setIsSaving(false);
          if (result.errors) setFieldErrors(result.errors);
          if (result.message) setGlobalError(result.message);
          throw new Error(result.message || "Failed to save");
        }
      },
      error: (err) => {
        setIsSaving(false);
        return err.message || "An unexpected error occurred.";
      },
    });
  };

  // Generic File Change Handler for native inputs
  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: keyof typeof files,
  ) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];
      setFiles((prev) => ({ ...prev, [fieldName]: selectedFile }));

      // Special handling for profile preview
      if (fieldName === "profile_picture_url") {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const objectURL = URL.createObjectURL(selectedFile);
        setPreviewUrl(objectURL);
      }
    }
  };

  const removeFile = (fieldName: keyof typeof files, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles((prev) => ({ ...prev, [fieldName]: null }));
    if (fieldName === "profile_picture_url") setPreviewUrl(null);
  };

  const getProfileImageSrc = () => {
    if (previewUrl) return previewUrl;
    if (formData.profile_picture_url) return formData.profile_picture_url;
    const fname = formData.first_name || "New";
    const lname = formData.last_name || "User";
    return `https://ui-avatars.com/api/?name=${fname}+${lname}&background=random&color=fff`;
  };

  return (
    <div className="flex flex-col h-full bg-white relative">
      <Tabs defaultValue="account" className="flex flex-col flex-1 min-h-0">
        {/* TAB NAVIGATION */}
        <div className="px-5 pt-3 pb-3 border-b border-slate-100 bg-white shrink-0">
          <TabsList className="h-8 bg-slate-100 p-0.5 rounded-md border border-slate-200 inline-flex w-full">
            <TabsTrigger
              value="account"
              className="flex-1 h-6 text-[11px] font-medium rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
            >
              Account
            </TabsTrigger>
            <TabsTrigger
              value="contact"
              className="flex-1 h-6 text-[11px] font-medium rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
            >
              Contact
            </TabsTrigger>
            <TabsTrigger
              value="compliance"
              className="flex-1 h-6 text-[11px] font-medium rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
            >
              Compliance
            </TabsTrigger>
          </TabsList>
        </div>

        {/* SCROLLABLE TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 pb-20">
          {/* ================= TAB 1: ACCOUNT ================= */}
          <TabsContent value="account" className="m-0 space-y-4 outline-none">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center justify-center gap-2 mb-4">
              <div
                className="relative w-20 h-20 rounded-full border-2 border-dashed border-slate-300 bg-white shadow-sm cursor-pointer group transition-all overflow-hidden"
                onClick={() => profileInputRef.current?.click()}
              >
                <Image
                  src={getProfileImageSrc()}
                  alt="Profile"
                  fill
                  className="object-cover transition-opacity group-hover:opacity-50"
                  unoptimized
                />
                <div className="absolute inset-0 flex items-center justify-center bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ImagePlus className="w-6 h-6 text-white drop-shadow-md" />
                </div>
              </div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Profile Photo
              </p>
              <input
                type="file"
                ref={profileInputRef}
                className="hidden"
                accept=".jpg,.png,.jpeg"
                onChange={(e) => handleFileChange(e, "profile_picture_url")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    name="first_name"
                    className="pl-8 h-9 text-xs bg-white border-slate-200"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                  />
                </div>
                {fieldErrors?.first_name && (
                  <p className="text-[10px] text-red-500">
                    {fieldErrors.first_name[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    name="last_name"
                    className="pl-8 h-9 text-xs bg-white border-slate-200"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                </div>
                {fieldErrors?.last_name && (
                  <p className="text-[10px] text-red-500">
                    {fieldErrors.last_name[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  name="email"
                  type="email"
                  className="pl-8 h-9 text-xs bg-white border-slate-200"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isAdd}
                  placeholder="john.doe@example.com"
                />
              </div>
              {fieldErrors?.email && (
                <p className="text-[10px] text-red-500">
                  {fieldErrors.email[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              {isAdd ? (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Temporary Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      type="password"
                      className="pl-8 h-9 text-xs bg-white border-slate-200"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                    />
                  </div>
                  {fieldErrors?.password && (
                    <p className="text-[10px] text-red-500">
                      {fieldErrors.password[0]}
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                    Account Status
                  </label>
                  <Select
                    value={formData.account_status}
                    onValueChange={(v) =>
                      handleSelectChange("account_status", v)
                    }
                  >
                    <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-md border-slate-200">
                      <SelectItem value="pending" className="text-xs">
                        Pending
                      </SelectItem>
                      <SelectItem value="verified" className="text-xs">
                        Verified
                      </SelectItem>
                      <SelectItem value="rejected" className="text-xs">
                        Rejected
                      </SelectItem>
                      <SelectItem
                        value="banned"
                        className="text-xs text-red-600"
                      >
                        Banned
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  System Role
                </label>
                <Select
                  value={formData.role}
                  onValueChange={(v) => handleSelectChange("role", v)}
                >
                  <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-md border-slate-200">
                    <SelectItem value="customer" className="text-xs">
                      Customer
                    </SelectItem>
                    <SelectItem value="driver" className="text-xs">
                      Driver
                    </SelectItem>
                    <SelectItem value="car_owner" className="text-xs">
                      Car Owner
                    </SelectItem>
                    <SelectItem value="staff" className="text-xs">
                      Staff
                    </SelectItem>
                    <SelectItem value="admin" className="text-xs">
                      Admin
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors?.role && (
                  <p className="text-[10px] text-red-500">
                    {fieldErrors.role[0]}
                  </p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ================= TAB 2: CONTACT ================= */}
          <TabsContent
            value="contact"
            className="m-0 space-y-4 min-h-[250px] outline-none"
          >
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  name="phone_number"
                  className="pl-8 h-9 text-xs bg-white border-slate-200"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="0912 345 6789"
                />
              </div>
              {fieldErrors?.phone_number && (
                <p className="text-[10px] text-red-500">
                  {fieldErrors.phone_number[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Complete Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-3 h-3.5 w-3.5 text-slate-400" />
                <Textarea
                  name="address"
                  className="pl-8 pt-2.5 text-xs bg-white border-slate-200 resize-none min-h-[120px]"
                  value={formData.address || ""}
                  onChange={handleChange}
                  placeholder="House No., Street Name, Barangay, City, Province"
                />
              </div>
              {fieldErrors?.address && (
                <p className="text-[10px] text-red-500">
                  {fieldErrors.address[0]}
                </p>
              )}
            </div>
          </TabsContent>

          {/* ================= TAB 3: COMPLIANCE ================= */}
          <TabsContent
            value="compliance"
            className="m-0 space-y-4 min-h-[300px] outline-none"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  License Number
                </label>
                <div className="relative">
                  <FileBadge className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    name="license_number"
                    className="pl-8 h-9 text-xs bg-white border-slate-200 uppercase"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="L02-XX-XXXXXX"
                  />
                </div>
                {fieldErrors?.license_number && (
                  <p className="text-[10px] text-red-500">
                    {fieldErrors.license_number[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  License Expiry
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="date"
                    className="pl-8 h-9 text-xs bg-white border-slate-200"
                    value={formData.license_expiry_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        license_expiry_date: e.target.value,
                      })
                    }
                  />
                </div>
                {fieldErrors?.license_expiry_date && (
                  <p className="text-[10px] text-red-500">
                    {fieldErrors.license_expiry_date[0]}
                  </p>
                )}
              </div>
            </div>

            {/* Custom Shadcn File Uploader (License) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                License Document Scan
              </label>
              <input
                type="file"
                ref={licenseInputRef}
                className="hidden"
                accept=".jpg,.png,.pdf"
                onChange={(e) => handleFileChange(e, "license_id_url")}
              />

              {!files.license_id_url ? (
                <div
                  className="border border-dashed border-slate-300 rounded-md h-20 flex flex-col items-center justify-center bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm"
                  onClick={() => licenseInputRef.current?.click()}
                >
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1.5" />
                  <p className="text-[10px] text-slate-500 font-medium">
                    Click to upload license
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md bg-slate-50 shadow-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1.5 bg-white border border-slate-200 rounded text-slate-500">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {files.license_id_url.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                    onClick={(e) => removeFile("license_id_url", e)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 my-2" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Valid ID Expiry
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="date"
                    className="pl-8 h-9 text-xs bg-white border-slate-200"
                    value={formData.valid_id_expiry_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        valid_id_expiry_date: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Trust Score (0-5)
                </label>
                <div className="relative">
                  <ShieldCheck className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="number"
                    step="0.1"
                    max="5"
                    min="0"
                    className="pl-8 h-9 text-xs bg-white border-slate-200"
                    value={formData.trust_score}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>

            {/* Custom Shadcn File Uploader (Valid ID) */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Valid ID Scan
              </label>
              <input
                type="file"
                ref={validIdInputRef}
                className="hidden"
                accept=".jpg,.png,.pdf"
                onChange={(e) => handleFileChange(e, "valid_id_url")}
              />

              {!files.valid_id_url ? (
                <div
                  className="border border-dashed border-slate-300 rounded-md h-20 flex flex-col items-center justify-center bg-white hover:bg-slate-50 cursor-pointer transition-colors shadow-sm"
                  onClick={() => validIdInputRef.current?.click()}
                >
                  <UploadCloud className="h-4 w-4 text-slate-400 mb-1.5" />
                  <p className="text-[10px] text-slate-500 font-medium">
                    Click to upload valid ID
                  </p>
                </div>
              ) : (
                <div className="flex items-center justify-between p-2 border border-slate-200 rounded-md bg-slate-50 shadow-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <div className="p-1.5 bg-white border border-slate-200 rounded text-slate-500">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-xs font-medium text-slate-700 truncate">
                      {files.valid_id_url.name}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                    onClick={(e) => removeFile("valid_id_url", e)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* --- FLOATING FOOTER ACTIONS --- */}
      <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-between z-10">
        <div className="text-[11px] text-red-600 font-medium line-clamp-1 pr-2">
          {globalError}
        </div>
        <div className="flex gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={closeDialog}
            disabled={isSaving}
            className="h-8 text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            {isSaving ? "Saving..." : isAdd ? "Create Client" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
