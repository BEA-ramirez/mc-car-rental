"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Check,
  AlertTriangle,
  Clock,
  Save,
  Loader2,
  Camera,
  ShieldCheck,
  X,
  ListChecks,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInspectionChecklist } from "@/actions/docs-mutations";
import { uploadInspectionPhotoAction } from "@/actions/docs-mutations";
import { cn } from "@/lib/utils";
import imageCompression from "browser-image-compression";

type InspectionExecutionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  inspection: any;
};

export default function InspectionExecutionModal({
  isOpen,
  onClose,
  inspection,
}: InspectionExecutionModalProps) {
  const queryClient = useQueryClient();
  const [checklist, setChecklist] = useState<any[]>([]);

  // Camera State
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingItemId, setUploadingItemId] = useState<string | null>(null);
  const [activeUploadContext, setActiveUploadContext] = useState<{
    categoryId: string;
    itemId: string;
  } | null>(null);

  useEffect(() => {
    if (isOpen && inspection?.checklist_data) {
      setChecklist(inspection.checklist_data);
    }
  }, [isOpen, inspection]);

  // --- SAVE ENTIRE REPORT ---
  const saveMutation = useMutation({
    mutationFn: async (data: any[]) =>
      updateInspectionChecklist(inspection.inspection_id, data),
    onSuccess: () => {
      toast.success("Inspection report saved successfully.");
      queryClient.invalidateQueries({ queryKey: ["inspections"] });
      onClose();
    },
    onError: (err) => toast.error(`Failed to save: ${err.message}`),
  });

  // --- HANDLERS ---
  const handleStatusChange = (
    categoryId: string,
    itemId: string,
    newStatus: string,
  ) => {
    setChecklist((prev) =>
      prev.map((cat) =>
        cat.categoryId === categoryId
          ? {
              ...cat,
              items: cat.items.map((item: any) =>
                item.itemId === itemId ? { ...item, status: newStatus } : item,
              ),
            }
          : cat,
      ),
    );
  };

  const handleNoteChange = (
    categoryId: string,
    itemId: string,
    newNote: string,
  ) => {
    setChecklist((prev) =>
      prev.map((cat) =>
        cat.categoryId === categoryId
          ? {
              ...cat,
              items: cat.items.map((item: any) =>
                item.itemId === itemId ? { ...item, notes: newNote } : item,
              ),
            }
          : cat,
      ),
    );
  };

  const removePhoto = (categoryId: string, itemId: string) => {
    setChecklist((prev) =>
      prev.map((cat) =>
        cat.categoryId === categoryId
          ? {
              ...cat,
              items: cat.items.map((item: any) =>
                item.itemId === itemId ? { ...item, photoUrl: null } : item,
              ),
            }
          : cat,
      ),
    );
  };

  // --- THE COMPRESSION & UPLOAD MAGIC ---
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !activeUploadContext) return;

    const { categoryId, itemId } = activeUploadContext;
    setUploadingItemId(itemId);

    try {
      // 1. Compress the Image
      const options = {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 1280,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);

      // 2. Prepare FormData
      const formData = new FormData();
      formData.append("file", compressedFile, file.name);

      // 3. Upload to Supabase via Server Action
      const result = await uploadInspectionPhotoAction(
        inspection.booking_id,
        formData,
      );

      // 4. Attach URL to the specific item
      if (result.success) {
        setChecklist((prev) =>
          prev.map((cat) =>
            cat.categoryId === categoryId
              ? {
                  ...cat,
                  items: cat.items.map((item: any) =>
                    item.itemId === itemId
                      ? { ...item, photoUrl: result.url }
                      : item,
                  ),
                }
              : cat,
          ),
        );
        toast.success("Evidence photo attached!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to upload photo");
    } finally {
      setUploadingItemId(null);
      setActiveUploadContext(null);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  if (!inspection) return null;

  const vehicleName = inspection.bookings?.cars
    ? `${inspection.bookings.cars.brand} ${inspection.bookings.cars.model}`
    : "Unknown Vehicle";
  const bookingRef = inspection.booking_id?.split("-")[0] || "---";

  const getSegmentBtnClass = (currentStatus: string, targetStatus: string) => {
    const base =
      "flex-1 h-7 text-[9px] font-bold uppercase tracking-widest rounded-md flex items-center justify-center gap-1 transition-all outline-none";
    if (currentStatus !== targetStatus)
      return cn(
        base,
        "text-muted-foreground hover:text-foreground hover:bg-secondary bg-transparent shadow-none",
      );

    if (targetStatus === "PASS")
      return cn(
        base,
        "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/20",
      );
    if (targetStatus === "ISSUE")
      return cn(
        base,
        "bg-destructive/10 text-destructive shadow-sm ring-1 ring-destructive/20",
      );
    return cn(
      base,
      "bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm ring-1 ring-amber-500/20",
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] xl:max-w-[1000px] p-0 h-[85vh] flex flex-col border-border bg-background shadow-2xl rounded-2xl transition-colors duration-300 [&>button.absolute]:hidden">
        {/* Hidden File Input for Camera */}
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />

        {/* --- FORMAL HEADER --- */}
        <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                {inspection.type} Inspection: {vehicleName}
              </DialogTitle>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground leading-none">
                <span>
                  Ref: <span className="text-foreground">{bookingRef}</span>
                </span>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span>
                  Inspector:{" "}
                  <span className="text-foreground">
                    {inspection.users?.full_name || "System"}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            onClick={onClose}
            disabled={saveMutation.isPending || uploadingItemId !== null}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* --- SCROLLABLE BODY --- */}
        <div className="flex-1 overflow-y-auto p-4 bg-background space-y-4 custom-scrollbar">
          {checklist.map((category) => (
            <div
              key={category.categoryId}
              className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors"
            >
              <div className="bg-secondary/50 border-b border-border px-3 py-2 flex items-center gap-1.5 transition-colors">
                <ListChecks className="w-3.5 h-3.5 text-muted-foreground" />
                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                  {category.categoryName}
                </h3>
              </div>

              <div className="divide-y divide-border">
                {category.items.map((item: any) => (
                  <div
                    key={item.itemId}
                    className="p-2.5 flex flex-col lg:flex-row lg:items-start gap-3 hover:bg-secondary/30 transition-colors group"
                  >
                    {/* Item Label */}
                    <div className="lg:w-1/3 flex items-center pt-1">
                      <span className="text-[11px] font-bold text-foreground">
                        {item.label}
                      </span>
                    </div>

                    {/* Controls Row */}
                    <div className="flex-1 flex flex-col gap-2">
                      <div className="flex flex-col sm:flex-row gap-3">
                        {/* Segmented Control */}
                        <div className="flex items-center p-0.5 bg-secondary border border-border rounded-lg w-full sm:w-[220px] shrink-0 h-8 transition-colors">
                          <button
                            onClick={() =>
                              handleStatusChange(
                                category.categoryId,
                                item.itemId,
                                "PASS",
                              )
                            }
                            className={getSegmentBtnClass(item.status, "PASS")}
                          >
                            <Check className="w-3 h-3" /> Pass
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(
                                category.categoryId,
                                item.itemId,
                                "PENDING",
                              )
                            }
                            className={getSegmentBtnClass(
                              item.status,
                              "PENDING",
                            )}
                          >
                            <Clock className="w-3 h-3" /> Pend
                          </button>
                          <button
                            onClick={() =>
                              handleStatusChange(
                                category.categoryId,
                                item.itemId,
                                "ISSUE",
                              )
                            }
                            className={getSegmentBtnClass(item.status, "ISSUE")}
                          >
                            <AlertTriangle className="w-3 h-3" /> Issue
                          </button>
                        </div>

                        {/* Dynamic Issue Input */}
                        <div className="flex-1 flex items-center gap-2 min-h-[32px]">
                          {item.status === "ISSUE" ? (
                            <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200 w-full">
                              <Input
                                placeholder="Describe the issue..."
                                value={item.notes || ""}
                                onChange={(e) =>
                                  handleNoteChange(
                                    category.categoryId,
                                    item.itemId,
                                    e.target.value,
                                  )
                                }
                                className="h-8 text-[10px] font-medium bg-destructive/5 border-destructive/20 focus-visible:ring-destructive text-foreground rounded-lg shadow-none flex-1 transition-colors"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 shrink-0 text-muted-foreground border-border bg-card rounded-lg hover:text-foreground hover:bg-secondary transition-colors"
                                title="Attach Photo"
                                onClick={() => {
                                  setActiveUploadContext({
                                    categoryId: category.categoryId,
                                    itemId: item.itemId,
                                  });
                                  fileInputRef.current?.click();
                                }}
                                disabled={uploadingItemId === item.itemId}
                              >
                                {uploadingItemId === item.itemId ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                                ) : (
                                  <Camera className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[9px] uppercase tracking-widest font-bold text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block mt-1">
                              No action required
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Display Uploaded Thumbnail */}
                      {item.photoUrl && item.status === "ISSUE" && (
                        <div className="flex items-center gap-2 animate-in fade-in slide-in-from-top-1 mt-1">
                          <div className="relative group/photo">
                            <img
                              src={item.photoUrl}
                              alt="Issue evidence"
                              className="h-10 w-10 object-cover rounded-md border border-border shadow-sm"
                            />
                            <button
                              onClick={() =>
                                removePhoto(category.categoryId, item.itemId)
                              }
                              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover/photo:opacity-100 transition-opacity shadow-sm"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">
                            <ImageIcon className="w-3 h-3" /> Evidence Attached
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="bg-card border-t border-border p-3 shrink-0 flex gap-2 justify-end transition-colors z-10">
          <Button
            variant="outline"
            className="h-8 px-4 text-[10px] font-semibold bg-card text-foreground hover:bg-secondary border-border rounded-lg shadow-none transition-colors"
            onClick={onClose}
            disabled={saveMutation.isPending || uploadingItemId !== null}
          >
            Cancel
          </Button>
          <Button
            className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
            onClick={() => saveMutation.mutate(checklist)}
            disabled={saveMutation.isPending || uploadingItemId !== null}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-2" />
            )}
            Save & Execute
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
