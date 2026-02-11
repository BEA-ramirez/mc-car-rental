import { useState, useRef } from "react";
import { getCurrentUserId } from "@/actions/auth";
import { uploadFile } from "@/actions/helper/upload-file";
import { toast } from "sonner";

interface UseFileUploadOptions {
  bucket: string;
  folder: string;
  onUploadComplete?: (uploads: { url: string; path: string }[]) => void;
}

export const useFileUpload = ({
  bucket,
  folder,
  onUploadComplete,
}: UseFileUploadOptions) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const uploadedFiles: { url: string; path: string }[] = [];

    try {
      const userId = await getCurrentUserId();
      if (!userId) throw new Error("User authentication failed");

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const result = await uploadFile(file, bucket, folder, userId);

        if (result) {
          uploadedFiles.push(result);
        }
      }
      if (onUploadComplete && uploadedFiles.length > 0) {
        onUploadComplete(uploadedFiles);
        toast.success("Upload successful");
      }
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Upload failed");
    } finally {
      setIsUploading(false);
      // reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const triggerFileDialog = () => {
    if (!isUploading) {
      fileInputRef.current?.click();
    }
  };

  return {
    isUploading,
    fileInputRef,
    handleFileSelect,
    triggerFileDialog,
  };
};
