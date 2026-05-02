import { useState, useRef } from "react";
import { getCurrentUserId } from "@/actions/auth";
import { uploadFile } from "@/actions/helper/upload-file";
import { toast } from "sonner";
import imageCompression from "browser-image-compression";

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
        let fileToUpload: File = files[i];

        // --- CLIENT-SIDE COMPRESSION ---
        // If it's an image, squish it below 800kb so it easily passes
        // the Next.js 1MB Server Action limit!
        if (fileToUpload.type.startsWith("image/")) {
          const options = {
            maxSizeMB: 0.8, // Strict 800kb limit
            maxWidthOrHeight: 1920, // 1080p resolution
            useWebWorker: true,
          };
          try {
            const compressedBlob = await imageCompression(
              fileToUpload,
              options,
            );
            // Convert the compressed Blob back into a File object for the server action
            fileToUpload = new File([compressedBlob], fileToUpload.name, {
              type: compressedBlob.type,
              lastModified: Date.now(),
            });
          } catch (compressErr) {
            console.warn(
              "Compression failed, attempting original file.",
              compressErr,
            );
          }
        }

        // Send the compressed file to your Server Action
        const result = await uploadFile(fileToUpload, bucket, folder, userId);

        if (result) {
          uploadedFiles.push(result);
        }
      }

      if (onUploadComplete && uploadedFiles.length > 0) {
        onUploadComplete(uploadedFiles);
        toast.success("Upload successful");
      }
    } catch (error: any) {
      console.error("Upload error", error);

      // Catch Next.js specific payload limits just in case
      if (
        error.message?.includes("Body exceeded 1 MB") ||
        error.message?.includes("payload too large")
      ) {
        toast.error("File is too large. Next.js 1MB limit reached.");
      } else {
        toast.error(error.message || "Upload failed");
      }
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
