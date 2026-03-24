"use client";

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
  Trash2,
  FileText,
  IdCard,
  X,
  Camera,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

import { useForm, FormProvider, Controller } from "react-hook-form";
import { useState, useRef } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientFormSchema, type ClientFormValues } from "@/lib/schemas/client";
import { formatDate } from "@/utils/format-date";
import { useClients } from "../../../hooks/use-clients";
import { getInitials } from "@/actions/helper/format-text";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface ClientFormProps {
  data: any;
  closeDialog: () => void;
}

export function ClientForm({ data: rawData, closeDialog }: ClientFormProps) {
  const isAdd = !rawData || !!rawData?.isAdd;

  console.log("Raw data", rawData);

  const { saveClient, isSaving } = useClients();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<any>({});
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);

  const profilePicRef = useRef<HTMLInputElement>(null);
  const licenseInputRef = useRef<HTMLInputElement>(null);
  const validInputRef = useRef<HTMLInputElement>(null);

  const removeFile = (e: React.MouseEvent, fieldName: string) => {
    e.stopPropagation();

    setFiles((prev: any) => {
      const newFiles = { ...prev };
      delete newFiles[fieldName];
      return newFiles;
    });

    if (fieldName === "license_id_url" && licenseInputRef.current) {
      licenseInputRef.current.value = "";
      if (rawData?.license_document_id) {
        setDocumentsToDelete((prev) =>
          prev.filter((id) => id !== rawData.license_document_id),
        );
      }
    }
    if (fieldName === "valid_id_url" && validInputRef.current) {
      validInputRef.current.value = "";
      if (rawData?.valid_id_document_id) {
        setDocumentsToDelete((prev) =>
          prev.filter((id) => id !== rawData.valid_id_document_id),
        );
      }
    }
    if (fieldName === "profile_picture_url" && profilePicRef.current) {
      profilePicRef.current.value = "";
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e: any, fieldName: string) => {
    if (e.target.files && e.target.files.length > 0) {
      const f = e.target.files[0];
      setFiles((prev: any) => ({ ...prev, [fieldName]: f }));

      if (fieldName === "profile_picture_url") {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
        setPreviewUrl(URL.createObjectURL(f));
      }

      if (fieldName === "license_id_url" && rawData?.license_document_id) {
        setDocumentsToDelete((prev) =>
          prev.includes(rawData.license_document_id)
            ? prev
            : [...prev, rawData.license_document_id],
        );
      }
      if (fieldName === "valid_id_url" && rawData?.valid_id_document_id) {
        setDocumentsToDelete((prev) =>
          prev.includes(rawData.valid_id_document_id)
            ? prev
            : [...prev, rawData.valid_id_document_id],
        );
      }
    }
  };

  const onSubmit = async (data: ClientFormValues) => {
    const submitData = new FormData();

    if (rawData?.user_id) {
      submitData.append("user_id", rawData.user_id);
    }

    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        submitData.append(key, value.toString());
      }
    });

    if (files.profile_picture_url)
      submitData.append("profile_picture_url", files.profile_picture_url);
    if (files.license_id_url)
      submitData.append("license_id_url", files.license_id_url);
    if (files.valid_id_url)
      submitData.append("valid_id_url", files.valid_id_url);

    if (documentsToDelete.length > 0) {
      const docsDelete = JSON.stringify(documentsToDelete);
      submitData.append("deleted_documents", docsDelete);
    }

    try {
      await saveClient(submitData);

      // ONLY close and clear state if it was successful!
      setFiles({});
      setPreviewUrl(null);
      closeDialog();
    } catch (error) {
      console.error("Failed to save client:", error);
    }
  };

  const safeFormatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return ""; // Check if Invalid Date
      return format(date, "yyyy-MM-dd");
    } catch {
      return "";
    }
  };

  const methods = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      user_id: rawData?.user_id || undefined,
      first_name: rawData?.first_name || "",
      last_name: rawData?.last_name || "",
      password: "",
      email: rawData?.email || "",
      role: rawData?.role || "customer",
      account_status: rawData?.account_status || "pending",
      phone_number: rawData?.phone_number || "",
      address: rawData?.address || "",
      license_number: rawData?.license_number || "",
      trust_score: rawData?.trust_score ?? 5,
      license_expiry_date: safeFormatDate(rawData?.license_expiry_date),
      valid_id_expiry_date: safeFormatDate(rawData?.valid_id_expiry_date),
      profile_picture_url: rawData?.profile_picture_url || "",
      valid_id_url: rawData?.valid_id_url || "",
      license_id_url: rawData?.license_id_url || "",
      is_archived: rawData?.is_archived ?? false,
    },
  });

  const { isSubmitting } = methods.formState;
  const firstName = methods.watch("first_name");
  const lastName = methods.watch("last_name");
  const currentProfilePic = methods.watch("profile_picture_url");
  console.log("Form Errors:", methods.formState.errors);

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex flex-col h-[85vh] sm:h-[650px] bg-white relative text-slate-800 overflow-hidden"
      >
        {/* --- CUSTOM HIGH-CONTRAST HEADER --- */}
        <div className="px-5 py-4 border-b border-slate-200 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-blue-50 flex items-center justify-center border border-blue-100">
              <User className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex flex-col text-left">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                {isAdd ? "Add New Client" : "Edit Client Profile"}
              </h2>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                {isAdd
                  ? "Create a new system record"
                  : `ID: ${rawData?.user_id?.split("-")[0].toUpperCase() || "PENDING"}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isAdd && (
              <Badge
                variant="outline"
                className="text-[10px] font-bold bg-slate-50 border-slate-200 text-slate-600 uppercase tracking-widest rounded-sm h-7 px-3 hidden sm:inline-flex"
              >
                Status: {rawData?.account_status || "Pending"}
              </Badge>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
              onClick={closeDialog}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="account" className="flex flex-col flex-1 min-h-0">
          {/* UPGRADED PILL TABS */}
          <div className="p-3 sm:px-5 border-b border-slate-200 bg-slate-50 shrink-0 z-10">
            <TabsList className="h-9 bg-slate-200/60 p-1 flex w-full rounded-sm">
              <TabsTrigger
                value="account"
                className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
              >
                Account
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
              >
                Contact
              </TabsTrigger>
              <TabsTrigger
                value="compliance"
                className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
              >
                Compliance
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-5 pb-24 thin-scrollbar">
            {/* TAB 1: ACCOUNT */}
            <TabsContent value="account" className="m-0 space-y-6 outline-none">
              {/* Profile Identity Section */}
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="flex flex-col items-center gap-3 shrink-0">
                  <div className="relative group">
                    <Avatar className="h-24 w-24 rounded-sm border border-slate-200 shadow-sm">
                      <AvatarImage
                        src={previewUrl || currentProfilePic || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-slate-100 text-slate-500 text-2xl font-bold rounded-sm">
                        {getInitials(`${firstName} ${lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => profilePicRef.current?.click()}
                      className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-sm"
                    >
                      <Camera className="w-6 h-6 text-white mb-1" />
                      <span className="text-[9px] font-bold text-white uppercase tracking-widest">
                        Change
                      </span>
                    </button>
                  </div>
                  <input
                    type="file"
                    ref={profilePicRef}
                    className="hidden"
                    accept=".jpg,.png,.jpeg"
                    onChange={(e) => handleFileChange(e, "profile_picture_url")}
                  />
                </div>

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      First Name
                    </label>
                    <Input
                      className="h-9 text-xs shadow-sm border-slate-200 rounded-sm"
                      {...methods.register("first_name")}
                    />
                    {methods.formState.errors.first_name && (
                      <span className="text-red-500 text-[10px] font-medium">
                        {methods.formState.errors.first_name.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Last Name
                    </label>
                    <Input
                      className="h-9 text-xs shadow-sm border-slate-200 rounded-sm"
                      {...methods.register("last_name")}
                    />
                    {methods.formState.errors.last_name && (
                      <span className="text-red-500 text-[10px] font-medium">
                        {methods.formState.errors.last_name.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Email Address
                    </label>
                    <Input
                      className="h-9 text-xs shadow-sm font-mono border-slate-200 rounded-sm"
                      disabled={!isAdd}
                      {...methods.register("email")}
                    />
                    {methods.formState.errors.email && (
                      <span className="text-red-500 text-[10px] font-medium">
                        {methods.formState.errors.email.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Security & Access Card */}
              <div className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Security & Access
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-1">
                  {isAdd ? (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Temporary Password
                      </label>
                      <Input
                        type="password"
                        className="h-9 text-xs shadow-sm border-slate-200 rounded-sm"
                        {...methods.register("password")}
                      />
                      <p className="text-[9px] text-slate-400 font-medium">
                        User will be required to change this upon first login.
                      </p>
                      {methods.formState.errors.password && (
                        <span className="text-red-500 text-[10px] font-medium">
                          {methods.formState.errors.password.message}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Account Status
                      </label>
                      <Controller
                        control={methods.control}
                        name="account_status"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <SelectTrigger className="h-9 text-xs shadow-sm border-slate-200 rounded-sm">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-sm">
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="rejected">Rejected</SelectItem>
                              <SelectItem value="suspended">
                                Suspended
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      System Role
                    </label>
                    <Controller
                      control={methods.control}
                      name="role"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="h-9 text-xs shadow-sm border-slate-200 rounded-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-sm">
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="driver">Driver</SelectItem>
                            <SelectItem value="car_owner">Car Owner</SelectItem>
                            <SelectItem value="staff">Staff</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* TAB 2: CONTACT */}
            <TabsContent value="contact" className="m-0 outline-none">
              <div className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-5">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Contact Details
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Phone Number
                  </label>
                  <Input
                    className="h-9 text-xs shadow-sm font-mono border-slate-200 rounded-sm max-w-sm"
                    {...methods.register("phone_number")}
                  />
                  {methods.formState.errors.phone_number && (
                    <span className="text-red-500 text-[10px] font-medium">
                      {methods.formState.errors.phone_number.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    Complete Address
                  </label>
                  <Textarea
                    className="text-xs shadow-sm resize-none min-h-[100px] border-slate-200 rounded-sm"
                    {...methods.register("address")}
                  />
                  {methods.formState.errors.address && (
                    <span className="text-red-500 text-[10px] font-medium">
                      {methods.formState.errors.address.message}
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: COMPLIANCE */}
            <TabsContent
              value="compliance"
              className="m-0 space-y-5 outline-none"
            >
              {/* Driver's License Card */}
              <div className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <IdCard className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Driver's License
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                        License Number
                        {methods.formState.errors.license_number && (
                          <span className="text-red-500 text-[9px] font-medium lowercase normal-case">
                            Required
                          </span>
                        )}
                      </label>
                      <Input
                        className="h-9 text-xs shadow-sm font-mono uppercase border-slate-200 rounded-sm"
                        {...methods.register("license_number")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Expiry Date
                      </label>
                      <Input
                        type="date"
                        className="h-9 text-xs shadow-sm border-slate-200 rounded-sm"
                        {...methods.register("license_expiry_date")}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Document Scan
                    </label>
                    <input
                      type="file"
                      ref={licenseInputRef}
                      className="hidden"
                      accept=".jpg,.png,.pdf"
                      onChange={(e) => handleFileChange(e, "license_id_url")}
                    />

                    {files.license_id_url ? (
                      <div className="border border-slate-300 rounded-sm h-full min-h-[90px] flex flex-col items-center justify-center bg-white p-3 text-center gap-2 relative shadow-sm">
                        <FileBadge className="w-6 h-6 text-emerald-600" />
                        <span className="text-[10px] font-medium text-slate-700 break-all">
                          {files.license_id_url.name}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1.5 right-1.5 h-6 w-6 rounded-sm shadow-none"
                          onClick={(e) => removeFile(e, "license_id_url")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : rawData?.license_id_url ? (
                      <div className="border border-slate-300 rounded-sm h-full min-h-[90px] flex flex-col items-center justify-center bg-white p-3 text-center gap-2 shadow-sm">
                        <a
                          href={rawData.license_id_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="w-4 h-4" /> View Current Record
                        </a>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest rounded-sm mt-1"
                          onClick={() => licenseInputRef.current?.click()}
                        >
                          Upload Replacement
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border border-dashed border-slate-300 rounded-sm h-full min-h-[90px] flex flex-col items-center justify-center bg-white hover:bg-slate-50 transition-colors cursor-pointer p-4 text-center group"
                        onClick={() => licenseInputRef.current?.click()}
                      >
                        <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-slate-600 mb-1.5 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700">
                          Select File
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Valid ID Card */}
              <div className="p-4 rounded-sm border border-slate-200 bg-slate-50/50 space-y-4">
                <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
                  <ShieldCheck className="w-4 h-4 text-slate-500" />
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-widest">
                    Secondary Valid ID
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Expiry Date
                      </label>
                      <Input
                        type="date"
                        className="h-9 text-xs shadow-sm border-slate-200 rounded-sm"
                        {...methods.register("valid_id_expiry_date")}
                      />
                    </div>
                    <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-sm border border-blue-100">
                      <AlertCircle className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-blue-800 font-medium leading-relaxed">
                        Secondary IDs are typically Passports, National IDs, or
                        Postal IDs required for initial background checks.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                      Document Scan
                    </label>
                    <input
                      type="file"
                      ref={validInputRef}
                      className="hidden"
                      accept=".jpg,.png,.pdf"
                      onChange={(e) => handleFileChange(e, "valid_id_url")}
                    />

                    {files.valid_id_url ? (
                      <div className="border border-slate-300 rounded-sm h-full min-h-[90px] flex flex-col items-center justify-center bg-white p-3 text-center gap-2 relative shadow-sm">
                        <FileBadge className="w-6 h-6 text-emerald-600" />
                        <span className="text-[10px] font-medium text-slate-700 break-all">
                          {files.valid_id_url.name}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1.5 right-1.5 h-6 w-6 rounded-sm shadow-none"
                          onClick={(e) => removeFile(e, "valid_id_url")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : rawData?.valid_id_url ? (
                      <div className="border border-slate-300 rounded-sm h-full min-h-[90px] flex flex-col items-center justify-center bg-white p-3 text-center gap-2 shadow-sm">
                        <a
                          href={rawData.valid_id_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="w-4 h-4" /> View Current Record
                        </a>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest rounded-sm mt-1"
                          onClick={() => validInputRef.current?.click()}
                        >
                          Upload Replacement
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border border-dashed border-slate-300 rounded-sm h-full min-h-[90px] flex flex-col items-center justify-center bg-white hover:bg-slate-50 transition-colors cursor-pointer p-4 text-center group"
                        onClick={() => validInputRef.current?.click()}
                      >
                        <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-slate-600 mb-1.5 transition-colors" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 group-hover:text-slate-700">
                          Select File
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        {/* FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-slate-200 bg-white flex items-center justify-end gap-2 z-20 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
            className="h-9 text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-none border-slate-200 text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-9 min-w-[120px] text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-none bg-slate-900 text-white hover:bg-slate-800"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : null}
            {isAdd ? "Save Client" : "Update Profile"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
