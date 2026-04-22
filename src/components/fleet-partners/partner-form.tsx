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

export const fleetPartnerFormSchema = z.object({
  car_owner_id: z.string().optional(),
  user_id: z.string().min(1, "You must link a user account."),
  business_name: z.string().min(1, "Business name is required."),
  active_status: z.boolean(),
  owner_notes: z.string().optional().nullable(),
  revenue_share_percentage: z.number().min(0).max(100),
  bank_name: z.string().optional().nullable(),
  bank_account_name: z.string().optional().nullable(),
  bank_account_number: z.string().optional().nullable(),
  contract_expiry_date: z.string().optional().nullable(),
});

export type FleetPartnerFormValues = z.infer<typeof fleetPartnerFormSchema>;

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

  const form = useForm<FleetPartnerFormValues>({
    resolver: zodResolver(fleetPartnerFormSchema),
    defaultValues: {
      user_id: "",
      business_name: "",
      active_status: true, // Defaulting to true for new partners
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
          active_status: initialData.active_status ?? true,
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
          active_status: true,
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
      <DialogContent className="sm:max-w-[550px] h-[85vh] flex flex-col p-0 border-border shadow-2xl rounded-2xl overflow-hidden gap-0 bg-background transition-colors duration-300">
        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-border bg-card shrink-0 transition-colors">
          <DialogTitle className="text-sm font-bold text-foreground tracking-tight uppercase leading-none">
            {initialData ? "Edit Partner Details" : "Add New Fleet Partner"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full relative min-h-0 bg-background transition-colors"
          >
            <Tabs
              defaultValue="profile"
              className="flex flex-col flex-1 min-h-0"
            >
              {/* TAB NAVIGATION */}
              <div className="px-5 pt-4 pb-0 bg-background shrink-0 transition-colors">
                <TabsList className="h-9 bg-secondary/50 p-1 rounded-lg border border-border/50 inline-flex w-full mb-3 shadow-inner transition-colors">
                  <TabsTrigger
                    value="profile"
                    className="flex-1 h-7 text-[10px] font-bold rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground uppercase tracking-widest transition-all"
                  >
                    Partner Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="financials"
                    className="flex-1 h-7 text-[10px] font-bold rounded-md data-[state=active]:bg-background data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground uppercase tracking-widest transition-all"
                  >
                    Financials & Legal
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* SCROLLABLE TAB CONTENT */}
              <div className="flex-1 overflow-y-auto px-5 py-4 pb-20 custom-scrollbar transition-colors">
                {/* --- TAB 1: PROFILE --- */}
                <TabsContent
                  value="profile"
                  className="m-0 space-y-4 outline-none"
                >
                  {/* LINK ACCOUNT COMBOBOX */}
                  {!initialData ? (
                    <FormField
                      control={form.control}
                      name="user_id"
                      render={({ field }) => (
                        <FormItem className="flex flex-col space-y-1.5">
                          <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
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
                                    "w-full justify-between h-8 text-[11px] font-semibold rounded-lg border-border bg-secondary shadow-none hover:bg-secondary/80 focus:ring-1 focus:ring-primary transition-colors text-foreground",
                                    !field.value && "text-muted-foreground",
                                  )}
                                >
                                  {field.value
                                    ? availableUsers?.find(
                                        (u) => u.user_id === field.value,
                                      )?.full_name
                                    : "Search applicants..."}
                                  <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-[510px] p-0 border-border rounded-xl shadow-xl bg-popover transition-colors">
                              <Command>
                                <CommandInput
                                  placeholder="Search name or email..."
                                  className="h-9 text-[11px] font-medium border-none focus:ring-0"
                                />
                                <CommandList className="custom-scrollbar">
                                  <CommandEmpty className="text-[10px] font-bold uppercase tracking-widest py-4 text-center text-muted-foreground">
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
                                        className="text-[11px] font-semibold cursor-pointer rounded-lg aria-selected:bg-secondary transition-colors px-3 py-2"
                                      >
                                        <Check
                                          className={cn(
                                            "mr-2 h-3.5 w-3.5",
                                            user.user_id === field.value
                                              ? "opacity-100 text-primary"
                                              : "opacity-0",
                                          )}
                                        />
                                        <div className="flex flex-col">
                                          <span className="text-foreground">
                                            {user.full_name}
                                          </span>
                                          <span className="text-[9px] font-mono text-muted-foreground mt-0.5">
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
                          <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-destructive" />
                        </FormItem>
                      )}
                    />
                  ) : (
                    <div className="bg-secondary/30 p-3 border border-border rounded-xl transition-colors">
                      <input type="hidden" {...form.register("user_id")} />

                      <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                        Linked Account
                      </label>
                      <div className="flex items-center gap-2.5 px-3 bg-background rounded-lg border border-border h-8 transition-colors">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-[11px] font-bold text-foreground">
                          {initialData.users?.first_name}{" "}
                          {initialData.users?.last_name}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* BUSINESS NAME */}
                    <FormField
                      control={form.control}
                      name="business_name"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                            Business Name
                          </FormLabel>
                          <div className="relative">
                            <Briefcase className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <FormControl>
                              <Input
                                {...field}
                                className="pl-8 h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                                placeholder="Enter official business name"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-destructive" />
                        </FormItem>
                      )}
                    />

                    {/* ACTIVE STATUS (Now adjacent to Business Name) */}
                    <FormField
                      control={form.control}
                      name="active_status"
                      render={({ field }) => (
                        <FormItem className="space-y-0 flex flex-col justify-end">
                          <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                            Operational Status
                          </FormLabel>
                          <div className="flex items-center justify-between px-3 rounded-lg border border-border bg-background h-8 shadow-none transition-colors">
                            <span className="text-[11px] font-bold text-foreground">
                              {field.value
                                ? "Active & Dispatching"
                                : "Suspended"}
                            </span>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                                className="data-[state=checked]:bg-emerald-500 scale-90"
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
                      <FormItem className="space-y-1.5 pt-2">
                        <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                          Internal Notes
                        </FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            value={field.value || ""}
                            placeholder="Private admin notes..."
                            className="resize-none min-h-[80px] text-[11px] font-medium bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                          />
                        </FormControl>
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">
                          Visible only to administrative staff.
                        </p>
                      </FormItem>
                    )}
                  />
                </TabsContent>

                {/* --- TAB 2: FINANCIALS --- */}
                <TabsContent
                  value="financials"
                  className="m-0 space-y-4 outline-none"
                >
                  {/* REVENUE SHARE */}
                  <FormField
                    control={form.control}
                    name="revenue_share_percentage"
                    render={({ field }) => (
                      <FormItem className="space-y-1.5 w-1/2 pr-2.5">
                        <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                          Revenue Share (%)
                        </FormLabel>
                        <div className="relative">
                          <Percent className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
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
                              className="pl-8 h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                              max={100}
                              min={0}
                            />
                          </FormControl>
                        </div>
                        <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-destructive" />
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mt-1">
                          Percentage of revenue assigned.
                        </p>
                      </FormItem>
                    )}
                  />

                  <hr className="border-border my-2 transition-colors" />

                  <div className="grid grid-cols-2 gap-4">
                    {/* BANK NAME */}
                    <FormField
                      control={form.control}
                      name="bank_name"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                            Bank Name
                          </FormLabel>
                          <div className="relative">
                            <Landmark className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                className="pl-8 h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                                placeholder="e.g. BDO"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-destructive" />
                        </FormItem>
                      )}
                    />

                    {/* ACCOUNT HOLDER */}
                    <FormField
                      control={form.control}
                      name="bank_account_name"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                            Account Holder
                          </FormLabel>
                          <div className="relative">
                            <User className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                className="pl-8 h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                                placeholder="Account Name"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-destructive" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {/* ACCOUNT NUMBER */}
                    <FormField
                      control={form.control}
                      name="bank_account_number"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                            Account Number
                          </FormLabel>
                          <div className="relative">
                            <CreditCard className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <FormControl>
                              <Input
                                {...field}
                                value={field.value || ""}
                                className="pl-8 h-8 text-[11px] font-semibold bg-secondary border-border font-mono rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                                placeholder="XXXX-XXXX-XXXX"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-destructive" />
                        </FormItem>
                      )}
                    />

                    {/* CONTRACT EXPIRY */}
                    <FormField
                      control={form.control}
                      name="contract_expiry_date"
                      render={({ field }) => (
                        <FormItem className="space-y-1.5">
                          <FormLabel className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest block">
                            Contract Expiry
                          </FormLabel>
                          <div className="relative">
                            <CalendarDays className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <FormControl>
                              <Input
                                {...field}
                                type="date"
                                value={field.value || ""}
                                className="pl-8 h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                              />
                            </FormControl>
                          </div>
                          <FormMessage className="text-[9px] font-bold uppercase tracking-widest text-destructive" />
                        </FormItem>
                      )}
                    />
                  </div>
                </TabsContent>
              </div>

              {/* --- FLOATING FOOTER ACTIONS --- */}
              <div className="absolute bottom-0 left-0 right-0 px-5 py-3 border-t border-border bg-card flex items-center justify-end z-10 shrink-0 transition-colors">
                <div className="flex gap-2 shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenChange(false)}
                    disabled={isSaving}
                    className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-background text-foreground border-border hover:bg-secondary shadow-none rounded-lg transition-colors"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSaving}
                    className="h-8 px-5 min-w-[140px] text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground shadow-sm rounded-lg transition-opacity"
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
