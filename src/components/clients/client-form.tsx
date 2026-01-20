"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "../ui/button";
import { Loader2 } from "lucide-react";
import { manageUser } from "@/actions/manage-user";
import {
  UploaderComponent,
  FilesPropModel,
  RemovingEventArgs,
} from "@syncfusion/ej2-react-inputs";
import Image from "next/image";

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

  // to manually cleanup uploaders
  const validIdUploaderRef = useRef<UploaderComponent>(null);
  const licenseUploaderRef = useRef<UploaderComponent>(null);

  useEffect(() => {
    setIsLoading(true);
    setFormData(sanitizeData(rawData));
    setFiles({});
    setPreviewUrl(null);
    setPassword("");
    setFieldErrors(null);
    setGlobalError(null);

    // clear the file lists visually in the UI if refs exist
    validIdUploaderRef.current?.clearAll();
    licenseUploaderRef.current?.clearAll();

    const timer = setTimeout(() => setIsLoading(false), 200);
    return () => clearTimeout(timer);
  }, [rawData]);

  const [isLoading, setIsLoading] = useState(true);
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
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup preview URL when closing dialog
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
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
        submitData,
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files: fileList } = e.target;
    if (fileList && fileList.length > 0) {
      setFiles((prev) => ({ ...prev, [name]: fileList[0] }));
    }
  };

  const onFileSelect = (args: any, fieldName: string) => {
    // Ensure we have files
    if (args.filesData && args.filesData.length > 0) {
      console.log("File Selected:", args.filesData[0]);
      console.log("Raw File:", args.filesData[0]?.rawFile);
      // Syncfusion sometimes nests the file in 'rawFile', strictly type it
      const selectedFile = args.filesData[0].rawFile as File;

      if (selectedFile) {
        // 1. Update the 'files' state for the form submission
        setFiles((prev) => ({ ...prev, [fieldName]: selectedFile }));

        // 2. Generate Preview (Explicitly check field name)
        if (fieldName === "profile_picture_url") {
          // Revoke old URL to avoid memory leaks if they select multiple times
          if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
          }

          const objectURL = URL.createObjectURL(selectedFile);
          setPreviewUrl(objectURL);
        }
      }
    }
  };

  // helper to determine which image to show: preview, existing, or default
  const getProfileImageSrc = () => {
    // the new file selected
    if (previewUrl) return previewUrl;
    // existing image url
    if (formData.profile_picture_url) return formData.profile_picture_url;
    // default avatar
    return `https://ui-avatars.com/api/?name=${formData.first_name}+${formData.last_name}&background=random&color=fff`;
  };

  const onFileRemove = (args: RemovingEventArgs, fieldName: string) => {
    setFiles((prev) => {
      const newState = { ...prev };
      delete (newState as any)[fieldName];
      return newState;
    });
    args.postRawFile = false; // prevent Syncfusion from removing the file from its internal list, or sending a delete request to the server
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
    <div className="grid gap-4 py-2 px-1 w-[30rem] relative">
      {isLoading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-background">
          <Loader2 className="h-10 w-10 animate-spin text-violet-600" />
          <p className="text-xs text-gray-500 font-medium mt-2">
            Loading details...
          </p>
        </div>
      )}
      <div
        className={
          isLoading
            ? "opacity-0"
            : "opacity-100 transition-opacity duration-200"
        }
      >
        <div className="space-y-4">
          <label className={labelClass}>Profile Picture</label>
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10">
              <Image
                key={previewUrl || formData.profile_picture_url || "default"}
                src={getProfileImageSrc()}
                alt="Profile"
                fill /* Fills the relative parent above */
                className="rounded-full object-cover border"
                sizes="40px"
              />
            </div>

            <div className="flex-1">
              <UploaderComponent
                id="profile-upload"
                type="file"
                multiple={false}
                autoUpload={false}
                allowedExtensions=".jpg, .png, .jpeg"
                buttons={{ browse: "Change Photo" }}
                showFileList={false}
                selected={(args) => onFileSelect(args, "profile_picture_url")}
              />
              <p className="text-xs text-gray-500 mt-1">
                Allowed: JPG, PNG. Max 5MB.
              </p>
            </div>
          </div>
        </div>
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
        <div className="grid grid-cols-2 gap-4">
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
            <div className="flex-1">
              <UploaderComponent
                ref={validIdUploaderRef}
                id="valid-id-upload"
                type="file"
                multiple={false}
                autoUpload={false}
                allowedExtensions=".jpg, .png, .jpeg, .pdf"
                showFileList={true} // Visible file list!
                selected={(args) => onFileSelect(args, "valid_id_url")}
                removing={(args) => onFileRemove(args, "valid_id_url")}
              />
              <p className="text-xs text-gray-500 mt-1">
                Allowed: JPG, PNG. Max 5MB.
              </p>
            </div>
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
            <div className="flex-1">
              <UploaderComponent
                ref={licenseUploaderRef}
                id="license-upload"
                type="file"
                multiple={false}
                autoUpload={false}
                allowedExtensions=".jpg, .png, .jpeg, .pdf"
                showFileList={true} // Visible file list!
                selected={(args) => onFileSelect(args, "license_id_url")}
                removing={(args) => onFileRemove(args, "license_id_url")}
              />
              <p className="text-xs text-gray-500 mt-1">
                Allowed: JPG, PNG. Max 5MB.
              </p>
            </div>
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
    </div>
  );
}
