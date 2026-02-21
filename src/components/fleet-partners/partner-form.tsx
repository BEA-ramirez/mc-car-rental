"use client";

import { useState } from "react";
import { managePartner } from "@/actions/manage-partner";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
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
import { cn } from "@/lib/utils";

// Helper to sanitize/default data
function sanitizeData(props: any) {
  if (!props)
    return {
      isAdd: true,
      revenue_share_percentage: 70,
      active_status: false,
      verification_status: "pending",
    };

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

  if (data.isAdd) {
    data.user_id = data.user_id || "";
    data.active_status = data.active_status ?? false;
    data.verification_status = data.verification_status ?? "pending";
    data.revenue_share_percentage = data.revenue_share_percentage ?? 70;
  }
  return data;
}

interface PartnerFormProps {
  data: any;
  closeDialog: () => void;
}

export function PartnerForm({ data: rawData, closeDialog }: PartnerFormProps) {
  const initialData = sanitizeData(rawData);
  const isAdd = !!initialData.isAdd;

  const { data: availableUsers = [], isLoading: isLoadingUsers } =
    useUnassignedCarOwners();

  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const handleChange = (e: any) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value;

    if (fieldErrors?.[name]) {
      setFieldErrors((prev) => ({ ...prev!, [name]: [] }));
    }
    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
  };

  const handleSelectChange = (name: string, value: string) => {
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
          closeDialog();
          return `${formData.business_name || "Partner"} saved successfully!`;
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

  return (
    <div className="flex flex-col h-full bg-white relative">
      <Tabs defaultValue="profile" className="flex flex-col flex-1 min-h-0">
        {/* TAB NAVIGATION */}
        <div className="px-5 pt-3 pb-3 border-b border-slate-100 bg-white shrink-0">
          <TabsList className="h-8 bg-slate-100 p-0.5 rounded-md border border-slate-200 inline-flex w-full">
            <TabsTrigger
              value="profile"
              className="flex-1 h-6 text-[11px] font-medium rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
            >
              Partner Profile
            </TabsTrigger>
            <TabsTrigger
              value="financials"
              className="flex-1 h-6 text-[11px] font-medium rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all"
            >
              Financials & Legal
            </TabsTrigger>
          </TabsList>
        </div>

        {/* SCROLLABLE TAB CONTENT */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50/50 pb-20">
          {/* --- TAB 1: PROFILE --- */}
          <TabsContent value="profile" className="m-0 space-y-4 outline-none">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Link Account
              </label>
              {isAdd ? (
                <Select
                  value={formData.user_id}
                  onValueChange={(v) => handleSelectChange("user_id", v)}
                >
                  <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
                    <SelectValue placeholder="Select a user applicant" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    {availableUsers.length > 0 ? (
                      availableUsers.map((user: any) => (
                        <SelectItem
                          key={user.user_id}
                          value={user.user_id}
                          className="text-xs"
                        >
                          {user.full_name} - {user.email}
                        </SelectItem>
                      ))
                    ) : (
                      <p className="p-2 text-xs text-muted-foreground text-center">
                        No applicants found
                      </p>
                    )}
                  </SelectContent>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-slate-100/50 rounded-md border border-slate-200 border-dashed h-9">
                  <User className="h-3.5 w-3.5 text-slate-400" />
                  <span className="text-xs font-medium text-slate-700">
                    {formData.users?.full_name || "Linked User"}
                  </span>
                </div>
              )}
              {fieldErrors?.user_id && (
                <p className="text-[10px] text-red-500">
                  {fieldErrors.user_id[0]}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Business Name
              </label>
              <div className="relative">
                <Briefcase className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="pl-8 h-9 text-xs bg-white border-slate-200"
                  placeholder="Enter official business name"
                />
              </div>
              {fieldErrors?.business_name && (
                <p className="text-[10px] text-red-500">
                  {fieldErrors.business_name[0]}
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Verification
                </label>
                <Select
                  value={formData.verification_status}
                  onValueChange={(v) =>
                    handleSelectChange("verification_status", v)
                  }
                >
                  <SelectTrigger className="h-9 text-xs bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="z-[9999]">
                    <SelectItem value="pending" className="text-xs">
                      Pending
                    </SelectItem>
                    <SelectItem
                      value="verified"
                      className="text-xs text-emerald-600"
                    >
                      Verified
                    </SelectItem>
                    <SelectItem
                      value="rejected"
                      className="text-xs text-red-600"
                    >
                      Rejected
                    </SelectItem>
                  </SelectContent>
                </Select>
                {fieldErrors?.verification_status && (
                  <p className="text-[10px] text-red-500">
                    {fieldErrors.verification_status[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5 flex flex-col justify-end">
                <div className="flex items-center justify-between space-x-2 rounded-md border border-slate-200 bg-white p-2 h-9 shadow-sm">
                  <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider block">
                    Active Status
                  </label>
                  <Switch
                    checked={formData.active_status}
                    onCheckedChange={(checked) =>
                      setFormData((prev: any) => ({
                        ...prev,
                        active_status: checked,
                      }))
                    }
                  />
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Internal Notes
              </label>
              <Textarea
                name="owner_notes"
                value={formData.owner_notes || ""}
                onChange={handleChange}
                placeholder="Private admin notes..."
                className="resize-none min-h-[80px] text-xs bg-white border-slate-200"
              />
              <p className="text-[9px] text-slate-400 mt-1">
                Visible only to administrative staff.
              </p>
            </div>
          </TabsContent>

          {/* --- TAB 2: FINANCIALS --- */}
          <TabsContent
            value="financials"
            className="m-0 space-y-4 outline-none"
          >
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                Revenue Share (%)
              </label>
              <div className="relative w-1/2">
                <Percent className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  type="number"
                  name="revenue_share_percentage"
                  value={formData.revenue_share_percentage}
                  onChange={handleChange}
                  className="pl-8 h-9 text-xs bg-white border-slate-200"
                  max={100}
                  min={0}
                />
              </div>
              <p className="text-[9px] text-slate-400 mt-1">
                The percentage of revenue assigned to the partner.
              </p>
              {fieldErrors?.revenue_share_percentage && (
                <p className="text-[10px] text-red-500">
                  {fieldErrors.revenue_share_percentage[0]}
                </p>
              )}
            </div>

            <div className="border-t border-slate-200 my-2 pt-2" />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Bank Name
                </label>
                <div className="relative">
                  <Landmark className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    name="bank_name"
                    value={formData.bank_name || ""}
                    onChange={handleChange}
                    className="pl-8 h-9 text-xs bg-white border-slate-200"
                    placeholder="e.g. BDO"
                  />
                </div>
                {fieldErrors?.bank_name && (
                  <p className="text-[10px] text-red-500">
                    {fieldErrors.bank_name[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Account Holder
                </label>
                <div className="relative">
                  <User className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    name="bank_account_name"
                    value={formData.bank_account_name || ""}
                    onChange={handleChange}
                    className="pl-8 h-9 text-xs bg-white border-slate-200"
                    placeholder="Account Name"
                  />
                </div>
                {fieldErrors?.bank_account_name && (
                  <p className="text-[10px] text-red-500">
                    {fieldErrors.bank_account_name[0]}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Account Number
                </label>
                <div className="relative">
                  <CreditCard className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    name="bank_account_number"
                    value={formData.bank_account_number || ""}
                    onChange={handleChange}
                    className="pl-8 h-9 text-xs bg-white border-slate-200 font-mono"
                    placeholder="XXXX-XXXX-XXXX"
                  />
                </div>
                {fieldErrors?.bank_account_number && (
                  <p className="text-[10px] text-red-500">
                    {fieldErrors.bank_account_number[0]}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  Contract Expiry
                </label>
                <div className="relative">
                  <CalendarDays className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    type="date"
                    name="contract_expiry_date"
                    value={formData.contract_expiry_date || ""}
                    onChange={handleChange}
                    className="pl-8 h-9 text-xs bg-white border-slate-200"
                  />
                </div>
              </div>
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
            className="h-8 text-xs bg-white text-slate-700 border-slate-200 hover:bg-slate-50 shadow-sm"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm px-4"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />}
            {isSaving
              ? "Saving..."
              : isAdd
                ? "Add Fleet Partner"
                : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
