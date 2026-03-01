"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  X,
  Download,
  User,
  Calendar as CalendarIcon,
  CheckCircle,
  AlertTriangle,
  Gauge,
  Fuel,
  ClipboardCheck,
  Image as ImageIcon,
  ZoomIn,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Mock interface for the inspection report
export type InspectionReport = {
  id: string; // Booking Ref
  vehicle: string;
  type: "Pre-trip" | "Post-trip";
  inspector: string;
  date: string;
  odometer: string;
  fuelLevel: string;
  notes: string;
  checklist: { item: string; status: "OK" | "ISSUE"; remark?: string }[];
  images: { label: string; url?: string }[];
};

type InspectionModalProps = {
  isOpen: boolean;
  onClose: () => void;
  report: InspectionReport | null;
  onDownload?: (id: string) => void;
};

export default function InspectionModal({
  isOpen,
  onClose,
  report,
  onDownload,
}: InspectionModalProps) {
  if (!report) return null;

  const hasIssues = report.checklist.some((item) => item.status === "ISSUE");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl xl:max-w-[1150px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col h-[85vh] max-h-[800px] [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
              <ClipboardCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Vehicle Inspection Report
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                Ref: {report.id} • {report.vehicle}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest rounded-sm h-7 px-3 border",
                report.type === "Pre-trip"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-purple-50 text-purple-700 border-purple-200",
              )}
            >
              {report.type}
            </Badge>
            <div className="w-px h-6 bg-slate-200 mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* SPLIT BODY */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* LEFT: DATA & CHECKLIST (Fixed at 400px) */}
          <div className="w-[400px] bg-slate-50 flex flex-col border-r border-slate-200 shrink-0 h-full">
            <ScrollArea className="flex-1 h-full">
              <div className="p-6 space-y-6">
                {/* Status Warning Banner */}
                {hasIssues ? (
                  <div className="bg-red-50 border border-red-200 p-3.5 rounded-sm flex gap-3 items-start shadow-sm">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-red-900 uppercase tracking-wider mb-0.5">
                        Issues Detected
                      </span>
                      <span className="text-[11px] text-red-700 font-medium leading-tight">
                        Damages or missing items were flagged during this
                        inspection.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-sm flex gap-3 items-start shadow-sm">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-0.5">
                        All Clear
                      </span>
                      <span className="text-[11px] text-emerald-700 font-medium leading-tight">
                        Vehicle passed inspection with no flagged issues.
                      </span>
                    </div>
                  </div>
                )}

                {/* Meta Details */}
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <CalendarIcon className="w-3 h-3" /> Date
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {report.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <User className="w-3 h-3" /> Inspector
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {report.inspector}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Gauge className="w-3 h-3" /> Odometer
                    </span>
                    <span className="text-sm font-bold text-slate-800 font-mono">
                      {report.odometer} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                      <Fuel className="w-3 h-3" /> Fuel Level
                    </span>
                    <span className="text-sm font-bold text-slate-800">
                      {report.fuelLevel}
                    </span>
                  </div>
                </div>

                <hr className="border-slate-200" />

                {/* Checklist */}
                <div>
                  <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-3">
                    Inspection Checklist
                  </h4>
                  <div className="space-y-2.5">
                    {report.checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col p-3 bg-white border border-slate-200 rounded-sm shadow-sm"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-bold text-slate-700">
                            {item.item}
                          </span>
                          {item.status === "OK" ? (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold border-emerald-200 text-emerald-700 bg-emerald-50 h-5 px-2 rounded-sm uppercase tracking-widest"
                            >
                              OK
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[10px] font-bold border-red-200 text-red-700 bg-red-50 h-5 px-2 rounded-sm uppercase tracking-widest flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" /> Issue
                            </Badge>
                          )}
                        </div>
                        {item.remark && (
                          <div className="mt-2 text-[11px] font-medium text-slate-600 bg-slate-50 p-2 rounded-sm border border-slate-100 leading-relaxed">
                            <span className="font-bold text-slate-800">
                              Note:
                            </span>{" "}
                            {item.remark}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Overall Notes */}
                {report.notes && (
                  <div>
                    <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                      Overall Notes
                    </h4>
                    <p className="text-xs font-medium text-slate-700 bg-white border border-slate-200 p-3.5 rounded-sm leading-relaxed shadow-sm">
                      {report.notes}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: PHOTO GRID */}
          <div className="flex-[2] bg-slate-100/50 relative flex flex-col overflow-hidden min-h-0 h-full">
            <div className="bg-white border-b border-slate-200 px-5 py-3 flex justify-between items-center shrink-0">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-4 h-4" /> Evidence Photos
              </span>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-sm">
                {report.images.length} Photos Attached
              </span>
            </div>

            <ScrollArea className="flex-1 h-full">
              {/* FIX: Moved padding into the div inside ScrollArea, and updated to a 3-column grid */}
              <div className="p-6 grid grid-cols-2 lg:grid-cols-3 gap-4">
                {report.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-2 group cursor-pointer"
                  >
                    {/* Visual Container */}
                    <div className="w-full aspect-[4/3] bg-white border border-slate-200 shadow-sm rounded-md flex items-center justify-center group-hover:border-blue-400 group-hover:shadow-md transition-all relative overflow-hidden">
                      <ImageIcon className="w-8 h-8 text-slate-300 group-hover:scale-110 transition-transform duration-300" />

                      {/* Interactive Hover Overlay */}
                      <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-slate-700 opacity-0 group-hover:opacity-100 drop-shadow-sm transition-opacity duration-300 bg-white/80 p-1.5 rounded-full" />
                      </div>
                    </div>
                    {/* Label */}
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider text-center truncate px-1">
                      {img.label}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex justify-end gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-10">
          <Button
            variant="ghost"
            className="h-9 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={onClose}
          >
            Close Report
          </Button>
          <Button
            variant="outline"
            className="h-9 px-4 text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm shadow-sm"
            onClick={() => onDownload && onDownload(report.id)}
          >
            <Download className="w-3.5 h-3.5 mr-2" /> Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
