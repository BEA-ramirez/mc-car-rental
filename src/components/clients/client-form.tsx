"use client";

import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { manageUser } from "@/actions/manage-user";
import { createServerParamsForMetadata } from "next/dist/server/request/params";

// helper to sanitize/default data
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
    data.valid_id_url = "";
    data.license_id_url = "";
  } else {
    const fullName = data.full_name || "";
    const parts = fullName.split(" ");
    data.first_name = data.first_name || parts[0] || "";
    data.last_name = data.last_name || parts.slice(1).join(" ") || "";
  }
  return data;
}

interface ClientFormProps {
  data: any;
  closeDialog: () => void;
}

export function ClientForm({ data: rawData, closeDialog }: ClientFormProps) {
  const initialData = sanitizeData(rawData);
  const isAdd = !!initialData.isAdd;

  useEffect(() => {
    setFormData(sanitizeData(rawData));
    setFiles({});
    setPassword("");
    setFieldErrors(null);
    setGlobalError(null);
  }, [rawData]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    //clear specific field error when typing
    if (fieldErrors?.[name]) {
      setFieldErrors((prev) => ({ ...prev!, [name]: [] }));
    }

    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    setGlobalError(null);
    setFieldErrors(null);

    const submitData = new FormData();

    //append all form data excluding full_name
    // Object.keys(formData).forEach((key) => {
    //   if (
    //     key !== "full_name" &&
    //     formData[key] !== undefined &&
    //     formData[key] !== null
    //   ) {
    //     submitData.append(key, formData[key].toString());
    //   }
    // });

    if (formData.user_id) submitData.append("user_id", formData.user_id);

    const constructedFullName = `${formData.first_name || ""} ${
      formData.last_name || ""
    }`.trim();
    submitData.append("full_name", constructedFullName);
    submitData.append("email", formData.email || "");
    submitData.append("first_name", formData.first_name || "");
    submitData.append("last_name", formData.last_name || "");
    submitData.append("role", formData.role || "customer");
    submitData.append("phone_number", formData.phone_number || "");
    submitData.append("address", formData.address || "");

    if (isAdd && password) {
      submitData.append("password", password);
    }

    // only append files if a new file was selected
    if (files.profile_picture_url)
      submitData.append("profile_picture_url", files.profile_picture_url);
    if (files.valid_id_url)
      submitData.append("valid_id_url", files.valid_id_url);
    if (files.license_id_url)
      submitData.append("license_id_url", files.license_id_url);

    // Debug: log what we're sending
    console.log("Submitting data:", Object.fromEntries(submitData.entries()));

    try {
      const result = await manageUser(
        { success: false, message: "" },
        submitData
      );

      console.log("Result:", result);

      if (result.success) {
        closeDialog();
      } else {
        if (result.errors) setFieldErrors(result.errors);
        if (result.message) setGlobalError(result.message);
      }
    } catch (error) {
      console.error("Error saving user:", error);
      setGlobalError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    if (fieldErrors?.[name]) {
      setFieldErrors((prev) => ({ ...prev!, [name]: [] }));
    }
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  // Styles
  const inputClass =
    "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50";
  const labelClass = "text-sm font-medium leading-none mb-2 block";
  const ErrorMsg = ({ field }: { field: string }) => {
    if (!fieldErrors?.[field]) return null;
    return <p className="text-red-500 text-xs mt-1">{fieldErrors[field][0]}</p>;
  };

  return (
    <div className="grid gap-4 py-2 px-1">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>First Name</label>
          <input
            name="first_name"
            className={inputClass}
            value={formData.first_name || ""}
            onChange={handleChange}
            placeholder="first name"
          />
          <ErrorMsg field="first_name" />
        </div>
        <div>
          <label className={labelClass}>Last Name</label>
          <input
            name="last_name"
            className={inputClass}
            value={formData.last_name || ""}
            onChange={handleChange}
            placeholder="last name"
          />
          <ErrorMsg field="last_name" />
        </div>
      </div>
      <div>
        <label className={labelClass}>Email</label>
        <input
          name="email"
          type="email"
          className={inputClass}
          value={formData.email || ""}
          onChange={handleChange}
          disabled={!isAdd}
        />
        <ErrorMsg field="email" />
      </div>
      {isAdd && (
        <div>
          <label className={labelClass}>Temporary Password</label>
          <input
            type="password"
            className={inputClass}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 6 characters"
          />
          <ErrorMsg field="password" />
        </div>
      )}
      <div>
        <label className={labelClass}>System Role</label>
        <select
          name="role"
          className={inputClass}
          value={formData.role || "customer"}
          onChange={handleChange}
        >
          <option value="customer">Customer</option>
          <option value="staff">Staff</option>
          <option value="car_owner">Car Owner</option>
          <option value="admin">Admin</option>
        </select>
        <ErrorMsg field="role" />
      </div>
      <div>
        <label className={labelClass}>Phone Number</label>
        <input
          name="phone_number"
          className={inputClass}
          value={formData.phone_number || ""}
          onChange={handleChange}
        />
        <ErrorMsg field="phone_number" />
      </div>
      <div>
        <label className={labelClass}>Address</label>
        <input
          name="address"
          className={inputClass}
          value={formData.address || ""}
          onChange={handleChange}
          placeholder="City, Street..."
        />
        <ErrorMsg field="address" />
      </div>
      <div className="border-t pt-4 mt-2">
        <h3 className="font-semibold mb-3 text-sm">Documents & Images</h3>
        <div className="space-y-4">
          <label className={labelClass}>Profile Picture</label>
          <div className="flex items-center gap-4">
            {formData.profile_picture_url && !files.profile_picture_url && (
              <img
                src={formData.profile_picture_url}
                alt="Current"
                className="w-10 h-10 rounded-full object-cover border"
              />
            )}
            <input
              type="file"
              name="profile_picture"
              accept="image/*"
              className="text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
              onChange={handleFileChange}
            />
          </div>
        </div>
        <div>
          <label className={labelClass}>Valid ID</label>
          {formData.valid_id_url && !files.valid_id_url && (
            <a
              href={formData.valid_id_url}
              target="_blank"
              className="text-xs text-blue-500 underline mb-1 block"
            >
              View Current ID
            </a>
          )}
          <input
            type="file"
            name="valid_id"
            accept="image/*"
            className={inputClass}
            onChange={handleFileChange}
          />
        </div>
        <div>
          <label className={labelClass}>Driver's License</label>
          {formData.license_id_url && !files.license_id_url && (
            <a
              href={formData.license_id_url}
              target="_blank"
              className="text-xs text-blue-500 underline mb-1 block"
            >
              View Current License
            </a>
          )}
          <input
            type="file"
            name="license_id"
            accept="image/*"
            className={inputClass}
            onChange={handleFileChange}
          />
        </div>
      </div>
      {globalError && (
        <div className="p-2 bg-red-100 text-red-700 text-sm rounded">
          {globalError}
        </div>
      )}
      <div className="flex justify-end mt-4">
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : isAdd ? "Create User" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
