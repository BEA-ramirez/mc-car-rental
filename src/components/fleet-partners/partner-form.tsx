"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { managePartner } from "@/actions/manage-partner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  User,
  Landmark,
  CreditCard,
  CalendarDays,
  Briefcase,
  Percent,
  Loader2,
  Check,
  ChevronsUpDown,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { useQueryClient } from "@tanstack/react-query";
import { useUnassignedCarOwners } from "../../../hooks/use-fleetPartners";
import { toast } from "sonner";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { cn } from "@/lib/utils";

// --- 1. ZOD SCHEMA ---
export const fleetPartnerFormSchema = z.object({
  car_owner_id: z.string().optional(),
  user_id: z.string().min(1, "You must link a user account."),
  business_name: z.string().min(1, "Business name is required."),
  verification_status: z.enum(["PENDING", "VERIFIED", "REJECTED"]),
  active_status: z.boolean(),
  owner_notes: z.string().optional().nullable(),
  revenue_share_percentage: z.number().min(0).max(100),
  bank_name: z.string().optional().nullable(),
  bank_account_name: z.string().optional().nullable(),
  bank_account_number: z.string().optional().nullable(),
  contract_expiry_date: z.string().optional().nullable(),
});

export type FleetPartnerFormValues = z.infer<typeof fleetPartnerFormSchema>;

// --- 2. PROPS INTERFACE ---
export interface PartnerFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FleetPartnerType | null;
}

export function PartnerForm({
  open,
  onOpenChange,
  initialData,
}: PartnerFormProps) {
  const isAdd = !initialData;
  const { data: availableUsers = [], isLoading: isLoadingUsers } =
    useUnassignedCarOwners();
  const queryClient = useQueryClient();

  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // --- 3. REACT HOOK FORM SETUP ---
  const form = useForm<FleetPartnerFormValues>({
    resolver: zodResolver(fleetPartnerFormSchema),
    defaultValues: {
      user_id: "",
      business_name: "",
      verification_status: "PENDING",
      active_status: false,
      owner_notes: "",
      revenue_share_percentage: 70,
      bank_name: "",
      bank_account_name: "",
      bank_account_number: "",
      contract_expiry_date: "",
    },
  });

  // Safely reset form when opened or when initialData changes
  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          car_owner_id: initialData.car_owner_id,
          user_id: initialData.user_id,
          business_name: initialData.business_name || "",
          verification_status:
            (initialData.verification_status as
              | "PENDING"
              | "VERIFIED"
              | "REJECTED") || "PENDING",
          active_status: initialData.active_status ?? false,
          owner_notes: initialData.owner_notes || "",
          revenue_share_percentage: initialData.revenue_share_percentage ?? 70,
          bank_name: initialData.bank_name || "",
          bank_account_name: initialData.bank_account_name || "",
          bank_account_number: initialData.bank_account_number || "",
          contract_expiry_date: initialData.contract_expiry_date
            ? new Date(initialData.contract_expiry_date)
                .toISOString()
                .split("T")[0]
            : "",
        });
      } else {
        form.reset({
          user_id: "",
          business_name: "",
          verification_status: "PENDING",
          active_status: false,
          owner_notes: "",
          revenue_share_percentage: 70,
          bank_name: "",
          bank_account_name: "",
          bank_account_number: "",
          contract_expiry_date: "",
        });
      }
    }
  }, [initialData, open, form]);

  const onSelectUser = (userId: string) => {
    form.setValue("user_id", userId, { shouldValidate: true });
    setComboboxOpen(false);
  };

  // --- 4. SUBMIT HANDLER ---
  const onSubmit = async (values: FleetPartnerFormValues) => {
    setIsSaving(true);

    // Convert to FormData to match your existing Server Action signature
    const submitData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      if (val !== undefined && val !== null) {
        submitData.append(
          key,
          typeof val === "boolean" ? (val ? "true" : "false") : val.toString(),
        );
      }
    });

    const promise = managePartner({ message: "", success: false }, submitData);

    toast.promise(promise, {
      loading: isAdd ? "Saving fleet partner..." : "Updating partner...",
      success: (result) => {
        if (result.success) {
          queryClient.invalidateQueries({ queryKey: ["fleet-partners"] });
          queryClient.invalidateQueries({ queryKey: ["unassigned-owners"] });
          onOpenChange(false);
          return `${values.business_name} saved successfully!`;
        } else {
          setIsSaving(false);
          // Map server errors back to Zod/React Hook Form
          if (result.errors) {
            Object.entries(result.errors).forEach(([field, messages]) => {
              form.setError(field as keyof FleetPartnerFormValues, {
                type: "server",
                message: messages[0],
              });
            });
            throw new Error("Please fix the errors in the form.");
          }
          throw new Error(result.message || "Failed to save.");
        }
      },
      error: (err) => {
        setIsSaving(false);
        return err.message || "An unexpected error occurred.";
      },
    });
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) form.reset();
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col p-0 border-slate-200 shadow-xl rounded-sm overflow-hidden gap-0 bg-white">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <DialogTitle className="text-sm font-bold text-[#0F172A] tracking-tight">
            {initialData ? "Edit Partner Details" : "Add New Fleet Partner"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full relative min-h-0 bg-slate-50/50"
          >
            <Tabs
              defaultValue="profile"
              className="flex flex-col flex-1 min-h-0"
            >
              {/* TAB NAVIGATION */}
              <div className="px-6 pt-4 pb-0 bg-white shrink-0">
                <TabsList className="h-9 bg-slate-100 p-1 rounded-sm border border-slate-200 inline-flex w-full mb-4">
                  <TabsTrigger
                    value="profile"
                    className="flex-1 h-7 text-[11px] font-bold rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#0F172A] text-slate-500 uppercase tracking-widest transition-all"
                  >
                    Partner Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="financials"
                    className="flex-1 h-7 text-[11px] font-bold rounded-[2px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-[#0F172A] text-slate-500 uppercase tracking-widest transition-all"
                  >
                    Financials & Legal
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* SCROLLABLE TAB CONTENT */}
              <div className="flex-1 overflow-y-auto px-6 py-5 pb-24 custom-scrollbar">
                {/* --- TAB 1: PROFILE --- */}
                <TabsContent
                  value="profile"
                  className="m-0 space-y-5 outline-none"
                >
                  {/* LINK ACCOUNT COMBOBOX */}
                  {!initialData ? (
                    <FormField
                      control={form.control}
                      name="user_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col space-y-0">
                          <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                            Link Account
                          </FormLabel>
                          <Popover
                            open={comboboxOpen}
                            onOpenChange={setComboboxOpen}
                          >
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  role="combobox"
                                  className={cn(
                                    "w-full justify-between h-9 text-xs rounded-sm border-slate-200 shadow-none focus:ring-1 focus:ring-[#0F172A]",
                                    !field.value && "text-slate-400",
                                  )}
                                >
                                  {field.value
                                    ? availableUsers?.find(
                                        (u) => u.user_id === field.value,
                                      )?.full_name
                                    : "Search applicants..."}
                                  <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[550px] p-0 border-slate-200 rounded-sm shadow-md">
                              <Command>
                                <CommandInput
                                  placeholder="Search name or email..."
                                  className="h-9 text-xs"
                                />
                                <CommandList>
                                  <CommandEmpty className="text-xs py-3 text-center text-slate-500">
                                    {isLoadingUsers
                                      ? "Loading..."
                                      : "No applicants found."}
                                  </CommandEmpty>
                                  <CommandGroup>
                                    {availableUsers?.map((user) => (
                                      <CommandItem
                                        key={user.user_id}
                                        value={user.full_name}
                                        onSelect={() =>
                                          onSelectUser(user.user_id)
                                        }
                                        className="text-xs cursor-pointer"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-3.5 w-3.5",
                                            user.user_id === field.value
                                              ? "opacity-100 text-[#0F172A]"
                                              : "opacity-0",
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span className="font-medium text-[#0F172A]">
                                            {user.full_name}
                                          </span>
                                          <span className="text-[10px] text-slate-500">
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
                          <FormMessage className="text-[10px] text-red-500 font-bold mt-1.5" />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="space-y-0 flex flex-col">
                      {/* SECRET INPUT FOR ZOD VALIDATION */}
                      <input type="hidden" {...form.register("user_id")} />

                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                        Linked Account
                      </label>
                      <div className="flex items-center gap-2.5 px-3 bg-slate-100/50 rounded-sm border border-slate-200 border-dashed h-9">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        <span className="text-xs font-bold text-slate-700">
                          {initialData.users?.first_name}{" "}
                          {initialData.users?.last_name}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* BUSINESS NAME */}
                  <FormField
                    control={form.control}
                    name="business_name"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                          Business Name
                        </FormLabel>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <FormControl>
                            <Input
                              {...field}
                              className="pl-9 h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]"
                              placeholder="Enter official business name"
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-[10px] text-red-500 font-bold mt-1.5" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-5">
                    {/* VERIFICATION */}
                    <FormField
                      control={form.control}
                      name="verification_status"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Verification
                          </FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus:ring-1 focus:ring-[#0F172A]">
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="rounded-sm border-slate-200">
                              <SelectItem
                                value="PENDING"
                                className="text-xs font-medium text-amber-600"
                              >
                                Pending
                              </SelectItem>
                              <SelectItem
                                value="VERIFIED"
                                className="text-xs font-medium text-emerald-600"
                              >
                                Verified
                              </SelectItem>
                              <SelectItem
                                value="REJECTED"
                                className="text-xs font-medium text-red-600"
                              >
                                Rejected
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage className="text-[10px] text-red-500 font-bold mt-1.5" />
                        </FormItem>
                      )}
                    />

                    {/* ACTIVE STATUS */}
                    <FormField
                      control={form.control}
                      name="active_status"
                      render={({ field }) => (
                        <FormItem className="space-y-0 flex flex-col justify-end">
                          <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Active Status
                          </FormLabel>
                          <div className="flex items-center justify-between px-3 rounded-sm border border-slate-200 bg-white h-9 shadow-none">
                            <span className="text-xs font-bold text-slate-700">
                              {field.value ? "Active" : "Inactive"}
                            </span>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-emerald-500"
                              />
                            </FormControl>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* INTERNAL NOTES */}
                  <FormField
                    control={form.control}
                    name="owner_notes"
                    render={({ field }) => (
                      <FormItem className="space-y-0">
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                          Internal Notes
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="Private admin notes..."
                            className="resize-none min-h-[80px] text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]"
                          />
                        </FormControl>
                        <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                          Visible only to administrative staff.
                        </p>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* --- TAB 2: FINANCIALS --- */}
                <TabsContent
                  value="financials"
                  className="m-0 space-y-5 outline-none"
                >
                  {/* REVENUE SHARE */}
                  <FormField
                    control={form.control}
                    name="revenue_share_percentage"
                    render={({ field }) => (
                      <FormItem className="space-y-0 w-1/2 pr-2.5">
                        <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                          Revenue Share (%)
                        </FormLabel>
                        <div className="relative">
                          <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              onChange={(e) =>
                                field.onChange(
                                  e.target.value === ""
                                    ? 0
                                    : Number(e.target.value),
                                )
                              }
                              className="pl-9 h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]"
                              max={100}
                              min={0}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-[10px] text-red-500 font-bold mt-1.5" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                          Percentage of revenue assigned.
                        </p>
                      </FormItem>
                    )}
                  />

                  <hr className="border-slate-200/80 my-2" />

                  <div className="grid grid-cols-2 gap-5">
                    {/* BANK NAME */}
                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Bank Name
                          </FormLabel>
                          <div className="relative">
                            <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                className="pl-9 h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]"
                                placeholder="e.g. BDO"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-[10px] text-red-500 font-bold mt-1.5" />
                        </FormItem>
                      )}
                    />

                    {/* ACCOUNT HOLDER */}
                    <FormField
                      control={form.control}
                      name="bank_account_name"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Account Holder
                          </FormLabel>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                className="pl-9 h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]"
                                placeholder="Account Name"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-[10px] text-red-500 font-bold mt-1.5" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    {/* ACCOUNT NUMBER */}
                    <FormField
                      control={form.control}
                      name="bank_account_number"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Account Number
                          </FormLabel>
                          <div className="relative">
                            <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                className="pl-9 h-9 text-xs bg-white border-slate-200 font-mono rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]"
                                placeholder="XXXX-XXXX-XXXX"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-[10px] text-red-500 font-bold mt-1.5" />
                        </FormItem>
                      )}
                    />

                    {/* CONTRACT EXPIRY */}
                    <FormField
                      control={form.control}
                      name="contract_expiry_date"
                      render={({ field }) => (
                        <FormItem className="space-y-0">
                          <FormLabel className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">
                            Contract Expiry
                          </FormLabel>
                          <div className="relative">
                            <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                value={field.value || ""}
                                className="pl-9 h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-[10px] text-red-500 font-bold mt-1.5" />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </div>

              {/* --- FLOATING FOOTER ACTIONS --- */}
              <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-end z-10 shrink-0">
                <div className="flex gap-2.5 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSaving}
                    className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-none rounded-sm"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    disabled={isSaving}
                    className="h-8 text-[10px] font-bold uppercase tracking-widest bg-[#0F172A] hover:bg-slate-800 text-white shadow-none px-4 rounded-sm"
                  >
                    {isSaving && (
                      <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    )}
                    {isSaving
                      ? "Saving..."
                      : isAdd
                        ? "Add Fleet Partner"
                        : "Save Changes"}
                  </Button>
                </div>
              </div>
            </Tabs>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
