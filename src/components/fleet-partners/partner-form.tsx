"use client";

import { useState, useEffect } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Landmark,
  CreditCard,
  CalendarDays,
  Briefcase,
  Percent,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { useQueryClient } from "@tanstack/react-query";
import { useUnassignedCarOwners } from "../../../hooks/use-fleetPartners";
import { toast } from "sonner";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { cn } from "@/lib/utils";

// Helper to sanitize/default data
function sanitizeData(props: any) {
  if (!props || Object.keys(props).length === 0 || props.isAdd) {
    return {
      isAdd: true,
      user_id: "",
      business_name: "",
      bank_name: "",
      bank_account_name: "",
      bank_account_number: "",
      owner_notes: "",
      contract_expiry_date: "",
      revenue_share_percentage: 70,
      active_status: false,
      verification_status: "pending",
    };
  }

  const { car_owner_id, full_name, ...rest } = props;
  const data = { ...rest };

  data.business_name = data.business_name || "";
  data.bank_name = data.bank_name || "";
  data.bank_account_name = data.bank_account_name || "";
  data.bank_account_number = data.bank_account_number || "";
  data.owner_notes = data.owner_notes || "";

  if (data.contract_expiry_date) {
    data.contract_expiry_date = new Date(data.contract_expiry_date)
      .toISOString()
      .split("T")[0];
  } else {
    data.contract_expiry_date = "";
  }

  return data;
}

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

  const [formData, setFormData] = useState(() => sanitizeData(initialData));
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  useEffect(() => {
    if (open) {
      setFormData(sanitizeData(initialData || { isAdd: true }));
      setFieldErrors(null);
      setGlobalError(null);
    }
  }, [initialData, open]);

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    if (fieldErrors?.[name]) {
      setFieldErrors((prev) => ({ ...prev!, [name]: [] }));
    }
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
    if (fieldErrors?.[name]) {
      setFieldErrors((prev) => ({ ...prev!, [name]: [] }));
    }
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setFieldErrors(null);
    setGlobalError(null);

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      const val = formData[key];
      if (val !== undefined && val !== null) {
        if (typeof val === "boolean") {
          submitData.append(key, val ? "true" : "false");
        } else {
          submitData.append(key, val.toString());
        }
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
          return `${formData.business_name || "Partner"} saved successfully!`;
        } else {
          setIsSaving(false);
          if (result.errors) setFieldErrors(result.errors);
          if (result.message) setGlobalError(result.message);
          throw new Error(result.message || "Failed to save.");
        }
      },
      error: (err) => {
        setIsSaving(false);
        return err.message || "An unexpected error occurred.";
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col p-0 border-slate-200 shadow-xl rounded-sm overflow-hidden gap-0 bg-white">
        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-white shrink-0">
          <DialogTitle className="text-sm font-bold text-[#0F172A] tracking-tight">
            {initialData ? "Edit Partner Details" : "Add New Fleet Partner"}
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full relative min-h-0 bg-slate-50/50">
          <Tabs defaultValue="profile" className="flex flex-col flex-1 min-h-0">
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
                <div className="space-y-0 flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Link Account
                  </label>
                  {isAdd ? (
                    <Select
                      value={formData.user_id}
                      onValueChange={(v) => handleSelectChange("user_id", v)}
                    >
                      <SelectTrigger
                        className={cn(
                          "h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus:ring-1 focus:ring-[#0F172A]",
                          fieldErrors?.user_id &&
                            "border-red-300 ring-1 ring-red-100",
                        )}
                      >
                        <SelectValue placeholder="Select a user applicant" />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] rounded-sm border-slate-200">
                        {availableUsers.length > 0 ? (
                          availableUsers.map((user: any) => (
                            <SelectItem
                              key={user.user_id}
                              value={user.user_id}
                              className="text-xs font-medium text-slate-700 cursor-pointer"
                            >
                              {user.full_name} - {user.email}
                            </SelectItem>
                          ))
                        ) : (
                          <p className="p-3 text-xs font-medium text-slate-400 text-center">
                            No applicants found
                          </p>
                        )}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center gap-2.5 px-3 bg-slate-100/50 rounded-sm border border-slate-200 h-9">
                      <User className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-xs font-bold text-slate-700">
                        {initialData?.users?.first_name}{" "}
                        {initialData?.users?.last_name}
                      </span>
                    </div>
                  )}
                  {fieldErrors?.user_id && (
                    <p className="text-[10px] text-red-500 font-bold mt-1.5">
                      {fieldErrors.user_id[0]}
                    </p>
                  )}
                </div>

                <div className="space-y-0 flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Business Name
                  </label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      name="business_name"
                      value={formData.business_name}
                      onChange={handleChange}
                      className={cn(
                        "pl-9 h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]",
                        fieldErrors?.business_name &&
                          "border-red-300 focus-visible:ring-red-200",
                      )}
                      placeholder="Enter official business name"
                    />
                  </div>
                  {fieldErrors?.business_name && (
                    <p className="text-[10px] text-red-500 font-bold mt-1.5">
                      {fieldErrors.business_name[0]}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-0 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Verification
                    </label>
                    <Select
                      value={formData.verification_status}
                      onValueChange={(v) =>
                        handleSelectChange("verification_status", v)
                      }
                    >
                      <SelectTrigger className="h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus:ring-1 focus:ring-[#0F172A]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="z-[9999] rounded-sm border-slate-200">
                        <SelectItem
                          value="pending"
                          className="text-xs font-medium text-amber-600"
                        >
                          Pending
                        </SelectItem>
                        <SelectItem
                          value="verified"
                          className="text-xs font-medium text-emerald-600"
                        >
                          Verified
                        </SelectItem>
                        <SelectItem
                          value="rejected"
                          className="text-xs font-medium text-red-600"
                        >
                          Rejected
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {fieldErrors?.verification_status && (
                      <p className="text-[10px] text-red-500 font-bold mt-1.5">
                        {fieldErrors.verification_status[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-0 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Active Status
                    </label>
                    <div className="flex items-center justify-between px-3 rounded-sm border border-slate-200 bg-white h-9 shadow-none">
                      <span className="text-xs font-bold text-slate-700">
                        {formData.active_status ? "Active" : "Inactive"}
                      </span>
                      <Switch
                        checked={formData.active_status}
                        onCheckedChange={(checked) =>
                          setFormData((prev: any) => ({
                            ...prev,
                            active_status: checked,
                          }))
                        }
                        className="data-[state=checked]:bg-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-0 flex flex-col">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Internal Notes
                  </label>
                  <Textarea
                    name="owner_notes"
                    value={formData.owner_notes || ""}
                    onChange={handleChange}
                    placeholder="Private admin notes..."
                    className="resize-none min-h-[80px] text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]"
                  />
                  <p className="text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest">
                    Visible only to administrative staff.
                  </p>
                </div>
              </TabsContent>

              {/* --- TAB 2: FINANCIALS --- */}
              <TabsContent
                value="financials"
                className="m-0 space-y-5 outline-none"
              >
                <div className="space-y-0 flex flex-col w-1/2 pr-2.5">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                    Revenue Share (%)
                  </label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      type="number"
                      name="revenue_share_percentage"
                      value={formData.revenue_share_percentage}
                      onChange={handleChange}
                      className={cn(
                        "pl-9 h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]",
                        fieldErrors?.revenue_share_percentage &&
                          "border-red-300",
                      )}
                      max={100}
                      min={0}
                    />
                  </div>
                  {fieldErrors?.revenue_share_percentage ? (
                    <p className="text-[10px] text-red-500 font-bold mt-1.5">
                      {fieldErrors.revenue_share_percentage[0]}
                    </p>
                  ) : (
                    <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-2">
                      Percentage of revenue assigned.
                    </p>
                  )}
                </div>

                <hr className="border-slate-200/80 my-2" />

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-0 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Bank Name
                    </label>
                    <div className="relative">
                      <Landmark className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        name="bank_name"
                        value={formData.bank_name || ""}
                        onChange={handleChange}
                        className={cn(
                          "pl-9 h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]",
                          fieldErrors?.bank_name && "border-red-300",
                        )}
                        placeholder="e.g. BDO"
                      />
                    </div>
                    {fieldErrors?.bank_name && (
                      <p className="text-[10px] text-red-500 font-bold mt-1.5">
                        {fieldErrors.bank_name[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-0 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Account Holder
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        name="bank_account_name"
                        value={formData.bank_account_name || ""}
                        onChange={handleChange}
                        className={cn(
                          "pl-9 h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]",
                          fieldErrors?.bank_account_name && "border-red-300",
                        )}
                        placeholder="Account Name"
                      />
                    </div>
                    {fieldErrors?.bank_account_name && (
                      <p className="text-[10px] text-red-500 font-bold mt-1.5">
                        {fieldErrors.bank_account_name[0]}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-0 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Account Number
                    </label>
                    <div className="relative">
                      <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        name="bank_account_number"
                        value={formData.bank_account_number || ""}
                        onChange={handleChange}
                        className={cn(
                          "pl-9 h-9 text-xs bg-white border-slate-200 font-mono rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]",
                          fieldErrors?.bank_account_number && "border-red-300",
                        )}
                        placeholder="XXXX-XXXX-XXXX"
                      />
                    </div>
                    {fieldErrors?.bank_account_number && (
                      <p className="text-[10px] text-red-500 font-bold mt-1.5">
                        {fieldErrors.bank_account_number[0]}
                      </p>
                    )}
                  </div>

                  <div className="space-y-0 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                      Contract Expiry
                    </label>
                    <div className="relative">
                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                      <Input
                        type="date"
                        name="contract_expiry_date"
                        value={formData.contract_expiry_date || ""}
                        onChange={handleChange}
                        className="pl-9 h-9 text-xs bg-white border-slate-200 rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-[#0F172A]"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </div>

            {/* --- FLOATING FOOTER ACTIONS --- */}
            <div className="absolute bottom-0 left-0 right-0 px-6 py-4 border-t border-slate-200 bg-white flex items-center justify-between z-10 shrink-0">
              <div className="text-[11px] text-red-600 font-bold line-clamp-1 pr-2 uppercase tracking-widest">
                {globalError}
              </div>
              <div className="flex gap-2.5 shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onOpenChange(false)}
                  disabled={isSaving}
                  className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-none rounded-sm"
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
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
        </div>
      </DialogContent>
    </Dialog>
  );
}
