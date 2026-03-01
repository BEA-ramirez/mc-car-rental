"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateInspectionChecklist } from "@/actions/docs-mutations";
import { cn } from "@/lib/utils";

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

  useEffect(() => {
    if (isOpen && inspection?.checklist_data) {
      setChecklist(inspection.checklist_data);
    }
  }, [isOpen, inspection]);

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

  if (!inspection) return null;

  const vehicleName = inspection.bookings?.cars
    ? `${inspection.bookings.cars.brand} ${inspection.bookings.cars.model}`
    : "Unknown Vehicle";
  const bookingRef = inspection.booking_id?.split("-")[0] || "---";

  // Helper for our custom segmented control buttons
  const getSegmentBtnClass = (currentStatus: string, targetStatus: string) => {
    const base =
      "flex-1 h-7 text-[10px] font-bold rounded-sm flex items-center justify-center gap-1.5 transition-all outline-none";
    if (currentStatus !== targetStatus)
      return cn(
        base,
        "text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 bg-transparent",
      );

    if (targetStatus === "PASS")
      return cn(
        base,
        "bg-emerald-100 text-emerald-800 shadow-sm ring-1 ring-emerald-300",
      );
    if (targetStatus === "ISSUE")
      return cn(base, "bg-red-100 text-red-800 shadow-sm ring-1 ring-red-300");
    return cn(
      base,
      "bg-amber-100 text-amber-800 shadow-sm ring-1 ring-amber-300",
    ); // PENDING
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[750px] p-0 h-[85vh] flex flex-col border-slate-200 shadow-2xl rounded-sm [&>button.absolute]:hidden">
        {/* --- FORMAL HEADER --- */}
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                {inspection.type} Inspection: {vehicleName}
              </DialogTitle>
              <div className="flex items-center gap-2 text-[10px] font-medium text-slate-500 leading-none">
                <span>
                  Ref:{" "}
                  <span className="font-mono font-bold text-slate-700">
                    {bookingRef}
                  </span>
                </span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span>
                  Inspector:{" "}
                  <span className="font-bold text-slate-700">
                    {inspection.users?.full_name || "System"}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={onClose}
            disabled={saveMutation.isPending}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* --- SCROLLABLE BODY --- */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50 space-y-5">
          {checklist.map((category) => (
            <div
              key={category.categoryId}
              className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <div className="bg-slate-100/50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5 text-slate-400" />
                <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-widest">
                  {category.categoryName}
                </h3>
              </div>

              {/* Checklist Items */}
              <div className="divide-y divide-slate-100">
                {category.items.map((item: any) => (
                  <div
                    key={item.itemId}
                    className="p-3 flex flex-col lg:flex-row lg:items-center gap-4 hover:bg-slate-50 transition-colors group"
                  >
                    {/* Item Label */}
                    <div className="lg:w-1/3 flex items-center">
                      <span className="text-xs font-bold text-slate-800">
                        {item.label}
                      </span>
                    </div>

                    {/* Controls Row */}
                    <div className="flex-1 flex flex-col sm:flex-row gap-3">
                      {/* Segmented Control */}
                      <div className="flex items-center p-0.5 bg-slate-100 border border-slate-200 rounded-sm w-full sm:w-[220px] shrink-0">
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
                          className={getSegmentBtnClass(item.status, "PENDING")}
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
                          <div className="flex-1 flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200">
                            <Input
                              placeholder="Describe the issue in detail..."
                              value={item.notes || ""}
                              onChange={(e) =>
                                handleNoteChange(
                                  category.categoryId,
                                  item.itemId,
                                  e.target.value,
                                )
                              }
                              className="h-8 text-xs bg-red-50/30 border-red-200 focus-visible:ring-red-400 rounded-sm shadow-none"
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 shrink-0 text-slate-500 border-slate-200 rounded-sm hover:text-slate-900 hover:bg-slate-100"
                              title="Attach Photo"
                            >
                              <Camera className="w-3.5 h-3.5" />
                            </Button>
                          </div>
                        ) : (
                          <span className="text-[10px] font-medium text-slate-400 italic opacity-0 group-hover:opacity-100 transition-opacity hidden sm:block">
                            No action required.
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex gap-2 justify-end">
          <Button
            variant="ghost"
            className="h-9 px-4 text-xs font-bold text-slate-600 rounded-sm hover:text-slate-900 hover:bg-slate-100"
            onClick={onClose}
            disabled={saveMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            className="h-9 px-6 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white rounded-sm shadow-sm"
            onClick={() => saveMutation.mutate(checklist)}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-2" />
            )}
            Save & Execute Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
