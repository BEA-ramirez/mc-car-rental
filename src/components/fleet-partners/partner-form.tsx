"use client";

import { UserType } from "@/lib/schemas/user";
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
} from "lucide-react";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { Switch } from "../ui/switch";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

// Helper to sanitize/default data
function sanitizeData(props: any) {
  const { car_owner_id, full_name, ...rest } = props;
  // Clone the object using spread syntax to avoid "Object is not extensible" error
  const data = { ...rest };
  data.business_name = data.business_name || "";
  data.bank_name = data.bank_name || "";
  data.bank_account_name = data.bank_account_name || "";
  data.bank_account_number = data.bank_account_number || "";
  data.owner_notes = data.owner_notes || "";
  data.contract_expiry_date = data.contract_expiry_date || "";

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
  availableUsers: UserType[];
  closeDialog: () => void;
}

export function PartnerForm({
  data: rawData,
  availableUsers,
  closeDialog,
}: PartnerFormProps) {
  const initialData = sanitizeData(rawData);
  const isAdd = !!initialData.isAdd;

  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  console.log("form data:", formData);

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

  // 4. Custom Save Handler
  const handleSave = async () => {
    setIsSaving(true);
    setFieldErrors(null); // Clear previous errors
    setGlobalError(null);

    // Create FormData manually
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

    console.log("Sumbitted data", submitData);

    try {
      const result = await managePartner(
        { message: "", success: false },
        submitData,
      );

      if (result.success) {
        // SUCCESS: Close the dialog
        closeDialog();
      } else {
        // ERROR: Show message
        // If validation fails, result.errors contains { business_name: ["Too short"], ... }
        if (result.errors) {
          setFieldErrors(result.errors);
        }
        if (result.message) {
          setGlobalError(result.message);
        }
      }
    } catch (err) {
      console.error(err);
      setGlobalError("An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  // Styles
  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";
  const labelClass =
    "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";
  const ErrorMsg = ({ field }: { field: string }) => {
    if (!fieldErrors?.[field]) return null;
    return <p className="text-red-500 text-xs mt-1">{fieldErrors[field][0]}</p>;
  };

  return (
    <div className="w-137.5 bg-card">
      <Tabs defaultValue="profile" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="profile">Partner Profile</TabsTrigger>
          <TabsTrigger value="financials">Financials & Legal</TabsTrigger>
        </TabsList>

        {/* --- TAB 1: PROFILE --- */}
        <TabsContent value="profile" className="space-y-4 py-4">
          <Field>
            <FieldLabel>Link Account</FieldLabel>
            <FieldContent>
              {isAdd ? (
                <Select
                  value={formData.user_id} // This links the state back to the UI
                  onValueChange={(v) => handleSelectChange("user_id", v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a user applicant" />
                  </SelectTrigger>
                  <SelectGroup>
                    <SelectContent position="popper" className="z-999999">
                      {availableUsers.length > 0 ? (
                        availableUsers.map((user) => (
                          <SelectItem key={user.user_id} value={user.user_id}>
                            {user.full_name} - {user.email}
                          </SelectItem>
                        ))
                      ) : (
                        <p className="p-2 text-xs text-muted-foreground text-center">
                          No applicants found
                        </p>
                      )}
                    </SelectContent>
                  </SelectGroup>
                </Select>
              ) : (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md border border-dashed">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formData.full_name}
                  </span>
                </div>
              )}
            </FieldContent>
            <FieldDescription>
              Select the user who applied to be a partner.
            </FieldDescription>
            <FieldError>{fieldErrors?.user_id?.[0]}</FieldError>
          </Field>

          <Field>
            <FieldLabel>Business Name</FieldLabel>
            <FieldContent>
              <div className="relative">
                <Briefcase className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="business_name"
                  value={formData.business_name}
                  onChange={handleChange}
                  className="pl-9"
                  placeholder="Enter official business name"
                />
              </div>
            </FieldContent>
            <FieldError>{fieldErrors?.business_name?.[0]}</FieldError>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Verification</FieldLabel>
              <Select
                value={formData.verification_status}
                onValueChange={(v) =>
                  handleSelectChange("verification_status", v)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-999999">
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <FieldError>{fieldErrors?.verification_status?.[0]}</FieldError>
            </Field>

            <Field className="flex flex-col justify-end pb-2">
              <div className="flex items-center justify-between space-x-2 rounded-md border p-2 h-10">
                <FieldLabel className="mb-0">Active Status</FieldLabel>
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
            </Field>
          </div>

          <Field>
            <FieldLabel>Internal Notes</FieldLabel>
            <Textarea
              name="owner_notes"
              value={formData.owner_notes || ""}
              onChange={handleChange}
              placeholder="Private admin notes..."
              className="resize-none h-20"
            />
            <FieldDescription>
              Visible only to administrative staff.
            </FieldDescription>
          </Field>
        </TabsContent>

        {/* --- TAB 2: FINANCIALS --- */}
        <TabsContent value="financials" className="space-y-4 py-4">
          <Field>
            <FieldLabel>Revenue Share (%)</FieldLabel>
            <div className="relative">
              <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="number"
                name="revenue_share_percentage"
                value={formData.revenue_share_percentage}
                onChange={handleChange}
                className="pl-9"
                max={100}
                min={0}
              />
            </div>
            <FieldDescription>
              The percentage of revenue assigned to the partner.
            </FieldDescription>
            <FieldError>
              {fieldErrors?.revenue_share_percentage?.[0]}
            </FieldError>
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Bank Name</FieldLabel>
              <div className="relative">
                <Landmark className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="bank_name"
                  value={formData.bank_name || ""}
                  onChange={handleChange}
                  className="pl-9"
                  placeholder="e.g. BDO"
                />
              </div>
              <FieldError>{fieldErrors?.bank_name?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel>Account Holder</FieldLabel>
              <Input
                name="bank_account_name"
                value={formData.bank_account_name || ""}
                onChange={handleChange}
                placeholder="Account Name"
              />
              <FieldError>{fieldErrors?.bank_account_name?.[0]}</FieldError>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field>
              <FieldLabel>Account Number</FieldLabel>
              <div className="relative">
                <CreditCard className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  name="bank_account_number"
                  value={formData.bank_account_number || ""}
                  onChange={handleChange}
                  className="pl-9"
                />
              </div>
              <FieldError>{fieldErrors?.bank_account_number?.[0]}</FieldError>
            </Field>
            <Field>
              <FieldLabel>Contract Expiry</FieldLabel>
              <div className="relative">
                <CalendarDays className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  name="contract_expiry_date"
                  value={formData.contract_expiry_date || ""}
                  onChange={handleChange}
                  className="pl-9"
                />
              </div>
            </Field>
          </div>
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex justify-between items-center mt-6 pt-4 border-t">
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
            className="bg-[#00ddd2] hover:bg-[#00c4ba] text-black border-none font-bold"
          >
            {isSaving ? "Saving..." : "Save Fleet Partner"}
          </Button>
        </div>
      </div>
    </div>
  );
}
