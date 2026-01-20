"use client";

import { UserType } from "@/lib/schemas/user";
import { useState } from "react";
import { managePartner } from "@/actions/manage-partner"; // Import your action
import { Button } from "@/components/ui/button"; // Optional: Use standard button if you prefer

// Helper to sanitize/default data
function sanitizeData(props: any) {
  // CLONE the object using spread syntax to avoid "Object is not extensible" error
  const data = { ...props };
  if (data.isAdd) {
    if (data.active_status === undefined) data.active_status = false;
    if (data.verification_status === undefined)
      data.verification_status = "pending";
    if (!data.revenue_share_percentage) data.revenue_share_percentage = 70;
  }
  return data;
}

interface PartnerFormProps {
  data: any;
  availableUsers: UserType[];
  closeDialog: () => void; // <--- NEW PROP to close the grid
}

export function PartnerForm({
  data: rawData,
  availableUsers,
  closeDialog,
}: PartnerFormProps) {
  // 1. Sanitize and Clone (Fixes "Not Extensible" error)
  const initialData = sanitizeData(rawData);
  const isAdd = !!initialData.isAdd;

  // 2. Local State
  const [formData, setFormData] = useState(initialData);
  const [isSaving, setIsSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<
    string,
    string[]
  > | null>(null);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // 3. Handle Input Changes (Updates Local State Only)
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    let finalValue: any = value;

    if (type === "checkbox") {
      finalValue = (e.target as HTMLInputElement).checked;
    }

    // Clear error for this field when user starts typing
    if (fieldErrors?.[name]) {
      setFieldErrors((prev) => ({ ...prev!, [name]: [] }));
    }

    setFormData((prev: any) => ({ ...prev, [name]: finalValue }));
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
        submitData.append(key, val.toString());
      }
    });

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
    // DIV instead of FORM to prevent Hydration Error
    <div className="grid gap-4 py-2 px-1">
      {/* --- USER SELECTION --- */}
      <div className="grid gap-2">
        <label className={labelClass}>Account Owner</label>
        {!isAdd ? (
          <>
            <input
              className={inputClass}
              disabled
              value={formData.partner_name || "Unknown"}
            />
            {/* Store ID in state, no need for hidden input if we use formData state */}
          </>
        ) : (
          <select
            name="user_id"
            className={inputClass}
            onChange={handleChange}
            value={formData.user_id || ""}
          >
            <option value="" disabled>
              Select a user...
            </option>
            {availableUsers.map((user) => (
              <option key={user.user_id} value={user.user_id}>
                {user.full_name} ({user.email})
              </option>
            ))}
          </select>
        )}
        {/* Display Error for User ID */}
        <ErrorMsg field="user_id" />
      </div>

      {/* --- BUSINESS NAME --- */}
      <div className="grid gap-2">
        <label className={labelClass}>Business Name</label>
        <input
          name="business_name"
          className={inputClass}
          value={formData.business_name || ""}
          onChange={handleChange}
          placeholder="e.g. Prestige Rentals"
        />
        <ErrorMsg field="business_name" />
      </div>

      {/* --- REVENUE & STATUS --- */}
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <label className={labelClass}>Rev. Share (%)</label>
          <input
            name="revenue_share_percentage"
            type="number"
            className={inputClass}
            value={formData.revenue_share_percentage}
            onChange={handleChange}
          />
          <ErrorMsg field="revenue_share_percentage" />
        </div>

        <div className="grid gap-2">
          <label className={labelClass}>Status</label>
          <select
            name="verification_status"
            className={inputClass}
            value={formData.verification_status}
            onChange={handleChange}
          >
            <option value="pending">Pending</option>
            <option value="verified">Verified</option>
            <option value="rejected">Rejected</option>
          </select>
          <ErrorMsg field="verification_status" />
        </div>
      </div>

      {/* --- CHECKBOX --- */}
      <div className="flex items-center space-x-2 border p-3 rounded-md">
        <input
          type="checkbox"
          id="active_status"
          name="active_status"
          className="h-4 w-4"
          checked={!!formData.active_status}
          onChange={handleChange}
        />
        <label htmlFor="active_status" className={labelClass}>
          Active Partner (Visible)
        </label>
      </div>

      {/* --- NOTES --- */}
      <div className="grid gap-2">
        <label className={labelClass}>Notes</label>
        <textarea
          name="owner_notes"
          className={`${inputClass} min-h-[80px] py-2`}
          value={formData.owner_notes || ""}
          onChange={handleChange}
        />
        <ErrorMsg field="owner_notes" />
      </div>

      {/* --- ERROR MESSAGE --- */}
      {globalError && (
        <div className="p-2 bg-red-100 text-red-700 text-sm rounded">
          {globalError}
        </div>
      )}

      {/* --- CUSTOM SAVE BUTTON --- */}
      <div className="flex justify-end gap-2 mt-2">
        {/* We add our own button since we are hiding Syncfusion's footer */}
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Partner"}
        </Button>
      </div>
    </div>
  );
}
