"use client";

import { useState, useEffect, useRef } from "react";
import { manageUser } from "@/actions/manage-user";
import {
  UploaderComponent,
  RemovingEventArgs,
} from "@syncfusion/ej2-react-inputs";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Lock,
  Shield,
  FileBadge,
  CalendarDays,
  ShieldCheck,
  UploadCloud,
  Briefcase,
  Plus,
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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

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
    data.valid_id_expiry_date = "";
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
  const isAdd = !!initialData.isAdd;

  // Refs for manual uploader cleanup
  const validIdUploaderRef = useRef<UploaderComponent>(null);
  const licenseUploaderRef = useRef<UploaderComponent>(null);
  const profileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState(initialData);
  const [files, setFiles] = useState<{
    profile_picture_url?: File;
    valid_id_url?: File;
    license_id_url?: File;
  }>({});
  const [password, setPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  console.log("Form Data:", formData);

  // Reset form when data changes
  useEffect(() => {
    setFormData(sanitizeData(rawData));
    setFiles({});
    setPreviewUrl(null);
    setPassword("");
    setFieldErrors(null);
    setGlobalError(null);

    validIdUploaderRef.current?.clearAll();
    licenseUploaderRef.current?.clearAll();
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

  const onFileSelect = (args: any, fieldName: string) => {
    if (args.filesData && args.filesData.length > 0) {
      const selectedFile = args.filesData[0].rawFile as File;
      if (selectedFile) {
        setFiles((prev) => ({ ...prev, [fieldName]: selectedFile }));
        if (fieldName === "profile_picture_url") {
          if (previewUrl) URL.revokeObjectURL(previewUrl);
          const objectURL = URL.createObjectURL(selectedFile);
          setPreviewUrl(objectURL);
        }
      }
    }
  };

  // a specific handler for the native profile input
  const handleProfileFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFile = e.target.files[0];

      // Update State
      setFiles((prev) => ({ ...prev, profile_picture_url: selectedFile }));

      // Update Preview
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const objectURL = URL.createObjectURL(selectedFile);
      setPreviewUrl(objectURL);
    }
  };

  const getProfileImageSrc = () => {
    if (previewUrl) return previewUrl;
    if (formData.profile_picture_url) return formData.profile_picture_url;

    // 👇 FIX: Provide a fallback so the URL is never empty/broken
    const fname = formData.first_name || "New";
    const lname = formData.last_name || "User";

    return `https://ui-avatars.com/api/?name=${fname}+${lname}&background=random&color=fff`;
  };

  const onFileRemove = (args: RemovingEventArgs, fieldName: string) => {
    setFiles((prev) => {
      const newState = { ...prev };
      delete (newState as any)[fieldName];
      return newState;
    });
    args.postRawFile = false;
  };

  const triggerProfileUpload = () => {
    // Directly click the native input using React Ref
    profileInputRef.current?.click();
  };
  return (
    <div className="w-120 bg-card border border-foreground/10 p-3 rounded-md">
      <Tabs defaultValue="account" className="w-full text-[14px] bg-card!">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        {/* ================= TAB 1: ACCOUNT ================= */}
        <TabsContent value="account" className="space-y-4 py-4">
          {/* Profile Picture Section */}
          <div className="flex flex-col items-center justify-center gap-2 mb-6">
            <div
              className="relative w-20 h-20 rounded-full border-2 border-dashed border-muted-foreground/30 hover:border-primary cursor-pointer group transition-all overflow-hidden"
              onClick={triggerProfileUpload}
            >
              {/* Profile Image */}
              <Image
                src={getProfileImageSrc()}
                alt="Profile"
                fill
                className="object-cover transition-opacity group-hover:opacity-60"
              />

              {/* Overlay with Plus Icon */}
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="bg-white/20 backdrop-blur-[2px] p-2 rounded-full shadow-sm">
                  <Plus className="w-6 h-6 text-white stroke-[3]" />
                </div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground font-medium">
              Click to upload photo
            </p>

            <input
              type="file"
              ref={profileInputRef}
              className="hidden"
              accept=".jpg,.png,.jpeg"
              onChange={handleProfileFileChange}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field className="gap-2">
              <FieldLabel>First Name</FieldLabel>
              <FieldContent className="gap-0!">
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="first_name"
                    className="pl-9"
                    value={formData.first_name}
                    onChange={handleChange}
                    placeholder="John"
                  />
                </div>
              </FieldContent>
              <FieldError className="text-[12px] font-medium ml-2">
                {fieldErrors?.first_name?.[0]}
              </FieldError>
            </Field>

            <Field className="gap-2">
              <FieldLabel className="text-[14px]">Last Name</FieldLabel>
              <FieldContent className="gap-0!">
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="last_name"
                    className="pl-9"
                    value={formData.last_name}
                    onChange={handleChange}
                    placeholder="Doe"
                  />
                </div>
              </FieldContent>
              <FieldError className="text-[12px] font-medium ml-2">
                {fieldErrors?.last_name?.[0]}
              </FieldError>
            </Field>
          </div>

          <Field className="gap-2">
            <FieldLabel>Email Address</FieldLabel>
            <FieldContent className="gap-0!">
              <div className="relative">
                <Mail className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="email"
                  type="email"
                  className="pl-9"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isAdd}
                  placeholder="john.doe@example.com"
                />
              </div>
            </FieldContent>
            <FieldError className="text-[12px] font-medium ml-2">
              {fieldErrors?.email?.[0]}
            </FieldError>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            {isAdd ? (
              <Field className="gap-2">
                <FieldLabel>Temporary Password</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <Lock className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      className="pl-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••"
                    />
                  </div>
                </FieldContent>
                <FieldError className="text-[12px] font-medium ml-2">
                  {fieldErrors?.password?.[0]}
                </FieldError>
              </Field>
            ) : (
              <Field className="gap-2">
                <FieldLabel>Account Status</FieldLabel>
                <Select
                  value={formData.account_status}
                  onValueChange={(v) => handleSelectChange("account_status", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-999999">
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}

            <Field className="gap-2">
              <FieldLabel>System Role</FieldLabel>
              <Select
                value={formData.role}
                onValueChange={(v) => handleSelectChange("role", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-999999">
                  <SelectItem value="customer">Customer</SelectItem>
                  <SelectItem value="driver">Driver</SelectItem>
                  <SelectItem value="car_owner">Car Owner</SelectItem>
                  <SelectItem value="staff">Staff</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
              <FieldError className="text-[12px] font-medium ml-2">
                {fieldErrors?.role?.[0]}
              </FieldError>
            </Field>
          </div>
        </TabsContent>

        {/* ================= TAB 2: CONTACT ================= */}
        <TabsContent value="contact" className="space-y-4 py-4 min-h-[300px]">
          <Field className="gap-2">
            <FieldLabel>Phone Number</FieldLabel>
            <FieldContent>
              <div className="relative">
                <Phone className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="phone_number"
                  className="pl-9"
                  value={formData.phone_number}
                  onChange={handleChange}
                  placeholder="0912 345 6789"
                />
              </div>
            </FieldContent>
            <FieldDescription className="text-[12px] ml-2">
              Enter valid mobile number.
            </FieldDescription>
            <FieldError className="text-[12px] font-medium ml-2">
              {fieldErrors?.phone_number?.[0]}
            </FieldError>
          </Field>

          <Field className="gap-2">
            <FieldLabel>Complete Address</FieldLabel>
            <FieldContent>
              <div className="relative">
                <MapPin className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                <Textarea
                  name="address"
                  className="pl-9 resize-none min-h-[100px]"
                  value={formData.address || ""}
                  onChange={handleChange}
                  placeholder="House No., Street Name, Barangay, City, Province"
                />
              </div>
            </FieldContent>
            <FieldError className="text-[12px] font-medium ml-2">
              {fieldErrors?.address?.[0]}
            </FieldError>
          </Field>
        </TabsContent>

        {/* ================= TAB 3: COMPLIANCE ================= */}
        <TabsContent
          value="compliance"
          className="space-y-4 py-4 min-h-[300px]"
        >
          <Field>
            <FieldLabel>Trust Score (0 - 5)</FieldLabel>
            <FieldContent>
              <div className="relative">
                <ShieldCheck className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  step="0.1"
                  max="5"
                  min="0"
                  className="pl-9"
                  value={formData.trust_score}
                  onChange={handleChange}
                />
              </div>
            </FieldContent>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>License Number</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <FileBadge className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    name="license_number"
                    className="pl-9"
                    value={formData.license_number}
                    onChange={handleChange}
                    placeholder="L02-XX-XXXXXX"
                  />
                </div>
              </FieldContent>
              <FieldError>{fieldErrors?.license_number?.[0]}</FieldError>
            </Field>

            <Field>
              <FieldLabel>License Expiry</FieldLabel>
              <FieldContent>
                <div className="relative">
                  <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    className="pl-9"
                    value={formData.license_expiry_date || ""}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        license_expiry_date: e.target.value,
                      })
                    }
                  />
                </div>
              </FieldContent>
              <FieldError>{fieldErrors?.license_expiry_date?.[0]}</FieldError>
            </Field>
          </div>

          <Field>
            <FieldLabel>License Image</FieldLabel>
            <FieldContent>
              <div className="border border-input rounded-md p-1 flex items-center gap-2">
                <UploadCloud className="h-4 w-4 ml-2 text-muted-foreground" />
                <div className="flex-1">
                  <UploaderComponent
                    ref={licenseUploaderRef}
                    id="license-upload"
                    type="file"
                    multiple={false}
                    autoUpload={false}
                    allowedExtensions=".jpg,.png,.pdf"
                    showFileList={true}
                    selected={(args) => onFileSelect(args, "license_id_url")}
                    removing={(args) => onFileRemove(args, "license_id_url")}
                  />
                </div>
              </div>
            </FieldContent>
          </Field>

          <div className="border-t pt-4 mt-2">
            <div className="grid grid-cols-2 gap-4">
              <Field>
                <FieldLabel>Valid ID Expiry</FieldLabel>
                <FieldContent>
                  <div className="relative">
                    <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      className="pl-9"
                      value={formData.valid_id_expiry_date || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          valid_id_expiry_date: e.target.value,
                        })
                      }
                    />
                  </div>
                </FieldContent>
              </Field>

              <Field>
                <FieldLabel>Valid ID Image</FieldLabel>
                <FieldContent>
                  <div className="border border-input rounded-md p-1 flex items-center gap-2 h-[40px]">
                    <Shield className="h-4 w-4 ml-2 text-muted-foreground" />
                    <div className="flex-1 -mt-1">
                      <UploaderComponent
                        ref={validIdUploaderRef}
                        id="valid-id-upload"
                        type="file"
                        multiple={false}
                        autoUpload={false}
                        allowedExtensions=".jpg,.png,.pdf"
                        showFileList={true}
                        selected={(args) => onFileSelect(args, "valid_id_url")}
                        removing={(args) => onFileRemove(args, "valid_id_url")}
                      />
                    </div>
                  </div>
                </FieldContent>
              </Field>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-between items-center pt-4">
        {globalError && (
          <p className="text-xs text-red-500 font-medium">{globalError}</p>
        )}
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-primary hover:bg-primary/60 text-card border-none font-medium text-[12px] px-3! py-2!"
          >
            {isSaving ? "Saving..." : isAdd ? "Create Client" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
