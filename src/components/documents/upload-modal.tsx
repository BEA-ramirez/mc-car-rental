"use client";

import React, { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import {
  UploadCloud,
  X,
  User,
  FileText,
  Calendar as CalendarIcon,
  Check,
  FileUp,
  Loader2,
  ChevronsUpDown,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDropdownData,
  useDocumentMutations,
} from "../../../hooks/use-documents";

const DOC_TYPES = [
  { value: "license_id", label: "Driver's License" },
  { value: "valid_id", label: "Valid ID" },
  { value: "other", label: "Other / Misc" },
];

const uploadDocSchema = z
  .object({
    documentId: z.string().optional(),
    customerId: z.string().min(1, "Customer is required."),
    docCategory: z.string().min(1, "Document category is required."),
    status: z.enum(["PENDING", "VERIFIED", "REJECTED", "EXPIRED"]),
    expiryDate: z.date().optional().nullable(),
    internal_notes: z.string().optional().nullable(),
    file: z.any().optional(),
  })
  .superRefine((data, ctx) => {
    // Require file upload only if it's a new document
    if (!data.documentId && (!data.file || data.file === null)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A file must be uploaded.",
        path: ["file"],
      });
    }
  });

type UploadFormValues = z.infer<typeof uploadDocSchema>;

type UploadModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialData?: any | null;
};

export default function UploadModal({
  isOpen,
  onClose,
  initialData,
}: UploadModalProps) {
  const { users } = useDropdownData();
  const { uploadDoc, updateDoc, isPending } = useDocumentMutations();

  console.log("initial data", initialData);
  const isEdit = !!initialData;
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadDocSchema),
    defaultValues: {
      documentId: "",
      customerId: "",
      docCategory: "",
      status: "PENDING",
      internal_notes: "",
      file: null,
    },
  });

  const currentFile = form.watch("file");

  // Pre-fill form if editing, reset if creating
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        form.reset({
          documentId: initialData.document_id,
          customerId: initialData.user_id,
          docCategory: initialData.category,
          status: initialData.status || "PENDING",
          expiryDate: initialData.expiry_date
            ? new Date(initialData.expiry_date)
            : undefined,
          internal_notes: initialData.internal_notes || "",
          file: null, // Keep null, they only set it if they want to replace the file
        });
      } else {
        form.reset({
          documentId: "",
          customerId: "",
          docCategory: "",
          status: "PENDING",
          internal_notes: "",
          file: null,
        });
      }
    }
  }, [isOpen, initialData, form]);

  // HANDLERS
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      form.setValue("file", e.dataTransfer.files[0], { shouldValidate: true });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      form.setValue("file", e.target.files[0], { shouldValidate: true });
    }
  };

  const onSubmit = async (values: UploadFormValues) => {
    const formData = new FormData();

    if (values.documentId) formData.append("documentId", values.documentId);
    if (values.file) formData.append("file", values.file);

    formData.append("customerId", values.customerId);
    formData.append("docCategory", values.docCategory);
    formData.append("status", values.status);

    if (values.expiryDate)
      formData.append("expiryDate", values.expiryDate.toISOString());
    if (values.internal_notes)
      formData.append("internal_notes", values.internal_notes);

    if (isEdit) {
      await updateDoc(formData);
    } else {
      await uploadDoc(formData);
    }

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[450px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col [&>button.absolute]:hidden transition-colors duration-300">
        {/* --- HEADER --- */}
        <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              {isEdit ? (
                <FileText className="w-4 h-4 text-primary" />
              ) : (
                <UploadCloud className="w-4 h-4 text-primary" />
              )}
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                {isEdit ? "Edit Document" : "Upload Document"}
              </DialogTitle>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                {isEdit ? "Update Registry Record" : "Add to Registry"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
            onClick={onClose}
            disabled={isPending}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col"
          >
            <div className="p-4 bg-background space-y-4 overflow-y-auto max-h-[70vh] custom-scrollbar transition-colors">
              {/* REQUIRED: CUSTOMER COMBOBOX */}
              <FormField
                control={form.control}
                name="customerId"
                render={({ field }) => (
                  <FormItem className="flex flex-col space-y-0">
                    <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Link to Customer{" "}
                      <span className="text-destructive">*</span>
                    </FormLabel>
                    <Popover
                      modal={true}
                      open={comboboxOpen}
                      onOpenChange={setComboboxOpen}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            role="combobox"
                            disabled={users.isLoading}
                            className={cn(
                              "w-full justify-between h-8 text-[11px] rounded-lg bg-secondary border-border shadow-none focus:ring-1 focus:ring-primary hover:bg-card transition-colors",
                              !field.value && "text-muted-foreground",
                              form.formState.errors.customerId &&
                                "border-destructive/50 ring-1 ring-destructive/20",
                            )}
                          >
                            <span className="truncate font-semibold">
                              {users.isLoading
                                ? "Loading users..."
                                : field.value
                                  ? users.data?.find(
                                      (u: any) => u.user_id === field.value,
                                    )?.full_name
                                  : "Search user..."}
                            </span>
                            <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-[418px] p-0 border-border rounded-xl shadow-xl bg-popover"
                        align="start"
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search name or email..."
                            className="h-9 text-[11px] font-medium bg-transparent"
                          />
                          <CommandList className="max-h-[200px] overflow-y-auto custom-scrollbar">
                            <CommandEmpty className="text-[10px] py-4 text-center font-semibold text-muted-foreground">
                              No customer found.
                            </CommandEmpty>
                            <CommandGroup>
                              {users.data?.map((user: any) => (
                                <CommandItem
                                  key={user.user_id}
                                  value={user.full_name || ""}
                                  onSelect={() => {
                                    form.setValue("customerId", user.user_id, {
                                      shouldValidate: true,
                                    });
                                    setComboboxOpen(false);
                                  }}
                                  className="py-2 cursor-pointer transition-colors focus:bg-secondary"
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-3.5 w-3.5",
                                      user.user_id === field.value
                                        ? "opacity-100 text-primary"
                                        : "opacity-0",
                                    )}
                                  />
                                  <div className="flex flex-col overflow-hidden">
                                    <span className="font-bold text-[11px] text-foreground truncate">
                                      {user.full_name}
                                    </span>
                                    <span className="text-[9px] font-medium text-muted-foreground truncate">
                                      {user.email}
                                    </span>
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <FormMessage className="text-[9px] text-destructive font-bold mt-1.5" />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-3">
                {/* REQUIRED: DOCUMENT TYPE */}
                <FormField
                  control={form.control}
                  name="docCategory"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <FileText className="w-3 h-3" /> Document Category{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "w-full h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus:ring-1 focus:ring-primary hover:bg-card transition-colors",
                              form.formState.errors.docCategory &&
                                "border-destructive/50 ring-1 ring-destructive/20",
                            )}
                          >
                            <SelectValue placeholder="Select type..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                          {DOC_TYPES.map((type) => (
                            <SelectItem
                              key={type.value}
                              value={type.value}
                              className="text-[11px] font-medium focus:bg-secondary transition-colors"
                            >
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[9px] text-destructive font-bold mt-1.5" />
                    </FormItem>
                  )}
                />

                {/* REQUIRED: STATUS */}
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem className="space-y-0">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" /> Status{" "}
                        <span className="text-destructive">*</span>
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger
                            className={cn(
                              "w-full h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus:ring-1 focus:ring-primary hover:bg-card transition-colors",
                              form.formState.errors.status &&
                                "border-destructive/50 ring-1 ring-destructive/20",
                            )}
                          >
                            <SelectValue placeholder="Select status..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                          <SelectItem
                            value="PENDING"
                            className="text-[11px] font-medium text-amber-600 dark:text-amber-500"
                          >
                            Pending
                          </SelectItem>
                          <SelectItem
                            value="VERIFIED"
                            className="text-[11px] font-medium text-emerald-600 dark:text-emerald-500"
                          >
                            Verified
                          </SelectItem>
                          <SelectItem
                            value="REJECTED"
                            className="text-[11px] font-medium text-destructive"
                          >
                            Rejected
                          </SelectItem>
                          <SelectItem
                            value="EXPIRED"
                            className="text-[11px] font-medium text-slate-500"
                          >
                            Expired
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage className="text-[9px] text-destructive font-bold mt-1.5" />
                    </FormItem>
                  )}
                />

                {/* OPTIONAL: EXPIRY DATE */}
                <FormField
                  control={form.control}
                  name="expiryDate"
                  render={({ field }) => (
                    <FormItem className="space-y-0 flex flex-col justify-end">
                      <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                        <CalendarIcon className="w-3 h-3" /> Expiry Date
                        <span className="text-muted-foreground/70 font-normal normal-case tracking-normal ml-1">
                          (Optional)
                        </span>
                      </FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none hover:bg-card focus:ring-1 focus:ring-primary transition-colors",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value
                                ? format(field.value, "MMM d, yyyy")
                                : "No Expiry"}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent
                          className="w-auto p-0 border-border rounded-xl shadow-xl bg-popover"
                          align="start"
                        >
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage className="text-[9px] text-destructive font-bold mt-1.5" />
                    </FormItem>
                  )}
                />
              </div>

              {/* OPTIONAL: INTERNAL NOTE FIELD */}
              <FormField
                control={form.control}
                name="internal_notes"
                render={({ field }) => (
                  <FormItem className="space-y-0">
                    <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3 h-3" /> Internal Note
                      <span className="text-muted-foreground/70 font-normal normal-case tracking-normal ml-1">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        placeholder="Add private context about this document..."
                        className="resize-none min-h-[60px] text-[11px] font-medium bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors"
                      />
                    </FormControl>
                    <FormMessage className="text-[9px] text-destructive font-bold mt-1.5" />
                  </FormItem>
                )}
              />

              {/* CONDITIONAL REQUIRED: FILE UPLOAD DRAG/DROP */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1.5">
                  <FileUp className="w-3 h-3" /> Upload File{" "}
                  {!isEdit && <span className="text-destructive">*</span>}
                </label>
                <div
                  className={cn(
                    "border-2 border-dashed rounded-xl p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-colors",
                    currentFile || (isEdit && initialData?.file_name)
                      ? "border-primary/50 bg-primary/5 hover:bg-primary/10"
                      : "border-border bg-card hover:bg-secondary hover:border-primary/50",
                    form.formState.errors.file &&
                      "border-destructive/50 bg-destructive/10",
                  )}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/jpeg,image/png,application/pdf"
                  />
                  {currentFile ? (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mb-2">
                        <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <p className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 truncate max-w-[250px]">
                        {currentFile.name}
                      </p>
                      <p className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 uppercase tracking-widest">
                        {(currentFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : isEdit && initialData?.file_name ? (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center mb-2">
                        <FileText className="w-4 h-4 text-primary" />
                      </div>
                      <p className="text-[11px] font-bold text-foreground truncate max-w-[250px]">
                        {initialData.file_name}
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground mt-0.5 uppercase tracking-widest">
                        Click to replace file
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center mb-2.5">
                        <UploadCloud className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <p className="text-[11px] font-bold text-foreground">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-[9px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">
                        PNG, JPG, or PDF (Max. 5MB)
                      </p>
                    </>
                  )}
                </div>
                {form.formState.errors.file && (
                  <p className="text-[9px] text-destructive font-bold mt-1.5">
                    {form.formState.errors.file.message as string}
                  </p>
                )}
              </div>
            </div>

            {/* FOOTER ACTIONS */}
            <div className="bg-card border-t border-border p-3 shrink-0 flex gap-2 justify-end transition-colors z-10">
              <Button
                type="button"
                variant="outline"
                className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-card text-foreground border-border hover:bg-secondary shadow-none rounded-lg transition-colors"
                onClick={onClose}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
                disabled={isPending}
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />{" "}
                    Saving...
                  </>
                ) : isEdit ? (
                  "Save Changes"
                ) : (
                  "Upload Document"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
