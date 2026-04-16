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

  const { saveClient, isSaving } = useClients(null);
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
      account_status: rawData?.account_status || "PENDING",
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

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="flex flex-col h-[85vh] sm:h-[650px] bg-background relative text-foreground overflow-hidden transition-colors duration-300"
      >
        {/* --- HIGH-CONTRAST HEADER --- */}
        <div className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm transition-colors">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                {isAdd ? "Add New Client" : "Edit Client Profile"}
              </h2>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none font-mono">
                {isAdd
                  ? "Create System Record"
                  : `ID: ${rawData?.user_id?.split("-")[0].toUpperCase() || "PENDING"}`}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!isAdd && (
              <Badge
                variant="outline"
                className="text-[9px] font-bold bg-secondary border-border text-muted-foreground uppercase tracking-widest rounded h-6 px-2 hidden sm:inline-flex transition-colors"
              >
                Status: {rawData?.account_status || "PENDING"}
              </Badge>
            )}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
              onClick={closeDialog}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Tabs defaultValue="account" className="flex flex-col flex-1 min-h-0">
          {/* UPGRADED PILL TABS */}
          <div className="p-3 sm:px-4 border-b border-border bg-secondary/30 shrink-0 z-10 transition-colors">
            <TabsList className="h-9 bg-background/50 p-1 flex w-full rounded-lg border border-border shadow-inner transition-colors">
              <TabsTrigger
                value="account"
                className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-foreground data-[state=active]:shadow-sm data-[state=active]:text-background text-muted-foreground transition-all"
              >
                Account
              </TabsTrigger>
              <TabsTrigger
                value="contact"
                className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-foreground data-[state=active]:shadow-sm data-[state=active]:text-background text-muted-foreground transition-all"
              >
                Contact
              </TabsTrigger>
              <TabsTrigger
                value="compliance"
                className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-foreground data-[state=active]:shadow-sm data-[state=active]:text-background text-muted-foreground transition-all"
              >
                Compliance
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-y-auto p-4 pb-20 custom-scrollbar bg-background transition-colors">
            {/* TAB 1: ACCOUNT */}
            <TabsContent value="account" className="m-0 space-y-5 outline-none">
              {/* Profile Identity Section */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 rounded-xl border border-border shadow-sm bg-secondary transition-colors">
                      <AvatarImage
                        src={previewUrl || currentProfilePic || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="bg-secondary text-foreground text-xl font-bold rounded-xl transition-colors">
                        {getInitials(`${firstName} ${lastName}`)}
                      </AvatarFallback>
                    </Avatar>
                    <button
                      type="button"
                      onClick={() => profilePicRef.current?.click()}
                      className="absolute inset-0 bg-background/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity rounded-xl border border-border"
                    >
                      <Camera className="w-5 h-5 text-foreground mb-1" />
                      <span className="text-[9px] font-bold text-foreground uppercase tracking-widest">
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

                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      First Name
                    </label>
                    <Input
                      className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                      {...methods.register("first_name")}
                    />
                    {methods.formState.errors.first_name && (
                      <span className="text-destructive text-[9px] font-bold uppercase tracking-widest">
                        {methods.formState.errors.first_name.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Last Name
                    </label>
                    <Input
                      className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                      {...methods.register("last_name")}
                    />
                    {methods.formState.errors.last_name && (
                      <span className="text-destructive text-[9px] font-bold uppercase tracking-widest">
                        {methods.formState.errors.last_name.message}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      Email Address
                    </label>
                    <Input
                      className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary font-mono transition-colors text-foreground disabled:opacity-50"
                      disabled={!isAdd}
                      {...methods.register("email")}
                    />
                    {methods.formState.errors.email && (
                      <span className="text-destructive text-[9px] font-bold uppercase tracking-widest">
                        {methods.formState.errors.email.message}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Security & Access Card */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4 transition-colors">
                <div className="flex items-center gap-2 border-b border-border pb-2.5 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Security & Access
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {isAdd ? (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Temporary Password
                      </label>
                      <Input
                        type="password"
                        className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                        {...methods.register("password")}
                      />
                      <p className="text-[9px] text-muted-foreground font-medium uppercase tracking-widest">
                        User will be required to change this upon first login.
                      </p>
                      {methods.formState.errors.password && (
                        <span className="text-destructive text-[9px] font-bold uppercase tracking-widest block mt-1">
                          {methods.formState.errors.password.message}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
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
                            <SelectTrigger className="h-8 w-full! text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus:ring-1 focus:ring-primary transition-colors text-foreground">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                              <SelectItem
                                value="PENDING"
                                className="text-[11px] font-semibold focus:bg-secondary"
                              >
                                Pending
                              </SelectItem>
                              <SelectItem
                                value="VERIFIED"
                                className="text-[11px] font-semibold focus:bg-secondary"
                              >
                                Verified
                              </SelectItem>
                              <SelectItem
                                value="REJECTED"
                                className="text-[11px] font-semibold focus:bg-secondary"
                              >
                                Rejected
                              </SelectItem>
                              <SelectItem
                                value="SUSPENDED"
                                className="text-[11px] font-semibold focus:bg-secondary"
                              >
                                Suspended
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
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
                          <SelectTrigger className="h-8 w-full! text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus:ring-1 focus:ring-primary transition-colors text-foreground">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                            <SelectItem
                              value="customer"
                              className="text-[11px] font-semibold focus:bg-secondary"
                            >
                              Customer
                            </SelectItem>
                            <SelectItem
                              value="driver"
                              className="text-[11px] font-semibold focus:bg-secondary"
                            >
                              Driver
                            </SelectItem>
                            <SelectItem
                              value="car_owner"
                              className="text-[11px] font-semibold focus:bg-secondary"
                            >
                              Car Owner
                            </SelectItem>
                            <SelectItem
                              value="staff"
                              className="text-[11px] font-semibold focus:bg-secondary"
                            >
                              Staff
                            </SelectItem>
                            <SelectItem
                              value="admin"
                              className="text-[11px] font-semibold focus:bg-secondary"
                            >
                              Admin
                            </SelectItem>
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
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4 transition-colors">
                <div className="flex items-center gap-2 border-b border-border pb-2.5 transition-colors">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Contact Details
                  </h3>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    Phone Number
                  </label>
                  <Input
                    className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary font-mono max-w-sm transition-colors text-foreground"
                    {...methods.register("phone_number")}
                  />
                  {methods.formState.errors.phone_number && (
                    <span className="text-destructive text-[9px] font-bold uppercase tracking-widest">
                      {methods.formState.errors.phone_number.message}
                    </span>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    Complete Address
                  </label>
                  <Textarea
                    className="text-[11px] font-medium bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary resize-none min-h-[80px] transition-colors text-foreground"
                    {...methods.register("address")}
                  />
                  {methods.formState.errors.address && (
                    <span className="text-destructive text-[9px] font-bold uppercase tracking-widest">
                      {methods.formState.errors.address.message}
                    </span>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* TAB 3: COMPLIANCE */}
            <TabsContent
              value="compliance"
              className="m-0 space-y-4 outline-none"
            >
              {/* Driver's License Card */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4 transition-colors">
                <div className="flex items-center gap-2 border-b border-border pb-2.5 transition-colors">
                  <IdCard className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Driver's License
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                        License Number
                        {methods.formState.errors.license_number && (
                          <span className="text-destructive text-[9px] font-bold">
                            Required
                          </span>
                        )}
                      </label>
                      <Input
                        className="h-8 text-[11px] font-bold uppercase tracking-widest bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary font-mono transition-colors text-foreground"
                        {...methods.register("license_number")}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Expiry Date
                      </label>
                      <Input
                        type="date"
                        className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                        {...methods.register("license_expiry_date")}
                      />
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
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
                      <div className="border border-border rounded-lg h-full min-h-[90px] flex flex-col items-center justify-center bg-secondary/50 p-3 text-center gap-1.5 relative shadow-sm transition-colors">
                        <FileBadge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[9px] font-bold text-foreground uppercase tracking-widest break-all">
                          {files.license_id_url.name}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1.5 right-1.5 h-5 w-5 rounded-md shadow-none"
                          onClick={(e) => removeFile(e, "license_id_url")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : rawData?.license_id_url ? (
                      <div className="border border-border rounded-lg h-full min-h-[90px] flex flex-col items-center justify-center bg-secondary/50 p-3 text-center gap-2 shadow-sm transition-colors">
                        <a
                          href={rawData.license_id_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="w-3.5 h-3.5" /> View Current
                          Record
                        </a>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-3 text-[9px] font-bold uppercase tracking-widest rounded-md bg-background border-border text-foreground hover:bg-secondary shadow-none transition-colors"
                          onClick={() => licenseInputRef.current?.click()}
                        >
                          Upload Replacement
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border border-dashed border-border rounded-lg h-full min-h-[90px] flex flex-col items-center justify-center bg-background hover:bg-secondary/50 transition-colors cursor-pointer p-4 text-center group shadow-none"
                        onClick={() => licenseInputRef.current?.click()}
                      >
                        <UploadCloud className="w-4 h-4 text-muted-foreground group-hover:text-foreground mb-1 transition-colors" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
                          Select File
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Valid ID Card */}
              <div className="p-4 rounded-xl border border-border bg-card shadow-sm space-y-4 transition-colors">
                <div className="flex items-center gap-2 border-b border-border pb-2.5 transition-colors">
                  <ShieldCheck className="w-4 h-4 text-muted-foreground" />
                  <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Secondary Valid ID
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                        Expiry Date
                      </label>
                      <Input
                        type="date"
                        className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                        {...methods.register("valid_id_expiry_date")}
                      />
                    </div>
                    <div className="flex items-start gap-2 bg-primary/10 p-3 rounded-lg border border-primary/20 transition-colors">
                      <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                      <p className="text-[9px] text-primary/80 font-bold uppercase tracking-widest leading-relaxed">
                        Passports, National IDs, or Postal IDs required for
                        background checks.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-1.5">
                    <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
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
                      <div className="border border-border rounded-lg h-full min-h-[90px] flex flex-col items-center justify-center bg-secondary/50 p-3 text-center gap-1.5 relative shadow-sm transition-colors">
                        <FileBadge className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        <span className="text-[9px] font-bold text-foreground uppercase tracking-widest break-all">
                          {files.valid_id_url.name}
                        </span>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1.5 right-1.5 h-5 w-5 rounded-md shadow-none"
                          onClick={(e) => removeFile(e, "valid_id_url")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    ) : rawData?.valid_id_url ? (
                      <div className="border border-border rounded-lg h-full min-h-[90px] flex flex-col items-center justify-center bg-secondary/50 p-3 text-center gap-2 shadow-sm transition-colors">
                        <a
                          href={rawData.valid_id_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <FileText className="w-3.5 h-3.5" /> View Current
                          Record
                        </a>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="h-6 px-3 text-[9px] font-bold uppercase tracking-widest rounded-md bg-background border-border text-foreground hover:bg-secondary shadow-none transition-colors"
                          onClick={() => validInputRef.current?.click()}
                        >
                          Upload Replacement
                        </Button>
                      </div>
                    ) : (
                      <div
                        className="border border-dashed border-border rounded-lg h-full min-h-[90px] flex flex-col items-center justify-center bg-background hover:bg-secondary/50 transition-colors cursor-pointer p-4 text-center group shadow-none"
                        onClick={() => validInputRef.current?.click()}
                      >
                        <UploadCloud className="w-4 h-4 text-muted-foreground group-hover:text-foreground mb-1 transition-colors" />
                        <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground group-hover:text-foreground transition-colors">
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
        <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 z-20 shadow-[0_-4px_12px_hsl(var(--shadow)/0.03)] transition-colors">
          <Button
            type="button"
            variant="outline"
            onClick={closeDialog}
            className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-none border-border bg-background text-foreground hover:bg-secondary transition-colors"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="h-8 px-5 min-w-[120px] text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm bg-primary hover:opacity-90 text-primary-foreground transition-opacity"
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
