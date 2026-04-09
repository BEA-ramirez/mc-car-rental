"use client";

import React, { useState } from "react";
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
      <DialogContent className="max-w-6xl xl:max-w-[1150px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[85vh] max-h-[800px] transition-colors duration-300 [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
              <ClipboardCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                Vehicle Inspection Report
              </DialogTitle>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                Ref: {report.id} • {report.vehicle}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest rounded h-6 px-2 border",
                report.type === "Pre-trip"
                  ? "bg-primary/10 text-primary border-primary/20"
                  : "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20",
              )}
            >
              {report.type}
            </Badge>
            <div className="w-px h-6 bg-border mx-1" />
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* SPLIT BODY */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* LEFT: DATA & CHECKLIST (Fixed at 380px) */}
          <div className="w-[380px] bg-background flex flex-col border-r border-border shrink-0 h-full transition-colors">
            <ScrollArea className="flex-1 h-full custom-scrollbar">
              <div className="p-5 space-y-5">
                {/* Status Warning Banner */}
                {hasIssues ? (
                  <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-xl flex gap-2.5 items-start shadow-sm transition-colors">
                    <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-0.5">
                        Issues Detected
                      </span>
                      <span className="text-[10px] text-destructive/80 font-medium leading-tight">
                        Damages or missing items were flagged during this
                        inspection.
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex gap-2.5 items-start shadow-sm transition-colors">
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-0.5">
                        All Clear
                      </span>
                      <span className="text-[10px] text-emerald-600/80 dark:text-emerald-400/80 font-medium leading-tight">
                        Vehicle passed inspection with no flagged issues.
                      </span>
                    </div>
                  </div>
                )}

                {/* Meta Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <CalendarIcon className="w-3 h-3" /> Date
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      {report.date}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <User className="w-3 h-3" /> Inspector
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      {report.inspector}
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Gauge className="w-3 h-3" /> Odometer
                    </span>
                    <span className="text-[11px] font-bold text-foreground font-mono">
                      {report.odometer} km
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 mb-1">
                      <Fuel className="w-3 h-3" /> Fuel Level
                    </span>
                    <span className="text-[11px] font-bold text-foreground">
                      {report.fuelLevel}
                    </span>
                  </div>
                </div>

                <hr className="border-border" />

                {/* Checklist */}
                <div>
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5">
                    Inspection Checklist
                  </h4>
                  <div className="space-y-2">
                    {report.checklist.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex flex-col p-2.5 bg-card border border-border rounded-xl shadow-sm transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-foreground pr-2">
                            {item.item}
                          </span>
                          {item.status === "OK" ? (
                            <Badge
                              variant="outline"
                              className="text-[9px] font-bold border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 h-5 px-2 rounded uppercase tracking-widest"
                            >
                              OK
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-[9px] font-bold border-destructive/20 text-destructive bg-destructive/10 h-5 px-2 rounded uppercase tracking-widest flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3 h-3" /> Issue
                            </Badge>
                          )}
                        </div>
                        {item.remark && (
                          <div className="mt-2 text-[10px] font-medium text-foreground bg-secondary/50 p-2 rounded-lg border border-border leading-relaxed">
                            <span className="font-bold text-muted-foreground">
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
                    <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      Overall Notes
                    </h4>
                    <p className="text-[11px] font-medium text-foreground bg-card border border-border p-3 rounded-xl leading-relaxed shadow-sm transition-colors">
                      {report.notes}
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT: PHOTO GRID */}
          <div className="flex-[2] bg-secondary/30 relative flex flex-col overflow-hidden min-h-0 h-full transition-colors">
            <div className="bg-card border-b border-border px-5 py-3 flex justify-between items-center shrink-0 transition-colors">
              <span className="text-[10px] font-bold text-foreground uppercase tracking-widest flex items-center gap-2">
                <ImageIcon className="w-3.5 h-3.5 text-muted-foreground" />{" "}
                Evidence Photos
              </span>
              <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
                {report.images.length} Photos Attached
              </span>
            </div>

            <ScrollArea className="flex-1 h-full custom-scrollbar">
              <div className="p-5 grid grid-cols-2 lg:grid-cols-3 gap-4">
                {report.images.map((img, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col gap-1.5 group cursor-pointer"
                  >
                    {/* Visual Container */}
                    <div className="w-full aspect-[4/3] bg-card border border-border shadow-sm rounded-xl flex items-center justify-center group-hover:border-primary group-hover:shadow-md transition-all relative overflow-hidden">
                      <ImageIcon className="w-8 h-8 text-muted-foreground group-hover:scale-110 transition-transform duration-300" />

                      {/* Interactive Hover Overlay */}
                      <div className="absolute inset-0 bg-background/0 group-hover:bg-background/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-6 h-6 text-foreground opacity-0 group-hover:opacity-100 drop-shadow-md transition-opacity duration-300 bg-secondary/80 p-1.5 rounded-full backdrop-blur-sm" />
                      </div>
                    </div>
                    {/* Label */}
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-center truncate px-1 group-hover:text-foreground transition-colors">
                      {img.label}
                    </span>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-10 transition-colors">
          <Button
            variant="outline"
            className="h-8 px-4 text-[10px] font-semibold text-foreground bg-card hover:bg-secondary border-border rounded-lg shadow-none transition-colors"
            onClick={onClose}
          >
            Close Report
          </Button>
          <Button
            variant="outline"
            className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest border-border text-foreground hover:bg-secondary rounded-lg shadow-sm transition-colors"
            onClick={() => onDownload && onDownload(report.id)}
          >
            <Download className="w-3.5 h-3.5 mr-2 text-muted-foreground" />{" "}
            Download PDF
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
