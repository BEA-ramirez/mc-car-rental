"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FileText,
  ZoomIn,
  Download,
  CheckCircle,
  XCircle,
  Calendar as CalendarIcon,
  User,
  ShieldCheck,
  Phone,
  Mail,
  AlertCircle,
  X,
  RotateCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock interface for the document being reviewed
export type ReviewDocument = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  trustScore: number;
  type: string;
  uploadedAt: string;
  imageUrl?: string;
  status: string;
};

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  document: ReviewDocument | null;
  onVerify: (id: string, expiryDate?: Date) => void;
  onReject: (id: string, reason: string) => void;
};

export default function ReviewModal({
  isOpen,
  onClose,
  document: doc,
  onVerify,
  onReject,
}: ReviewModalProps) {
  const [expiryDate, setExpiryDate] = useState<Date | undefined>(undefined);
  const [rejectReason, setRejectReason] = useState("");
  const [actionMode, setActionMode] = useState<"verify" | "reject" | null>(
    null,
  );
  const [rotation, setRotation] = useState(0);

  // Reset state when modal opens/closes
  React.useEffect(() => {
    if (isOpen) {
      setExpiryDate(undefined);
      setRejectReason("");
      setActionMode(null);
      setRotation(0);
    }
  }, [isOpen]);

  if (!doc) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* --- IMPROVED: MASSIVE WIDTH & HEIGHT --- */}
      <DialogContent className="max-w-[80vw] xl:max-w-[1000px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[90vh] transition-colors duration-300 [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                KYC Verification Hub
              </DialogTitle>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                {doc.type} • ID: {doc.id}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[9px] font-bold bg-secondary border-border text-muted-foreground uppercase tracking-widest rounded h-6 px-2"
            >
              Status: {doc.status}
            </Badge>
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
        <div className="flex flex-1 overflow-hidden">
          {/* --- LEFT: IMAGE VIEWER (MUCH LARGER flex-[4]) --- */}
          <div className="flex-[4] bg-zinc-950 dark:bg-black relative flex flex-col border-r border-border">
            {/* Overlay Toolbar */}
            <div className="absolute top-4 left-4 flex gap-2 z-10 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 backdrop-blur-md shadow-2xl">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors uppercase tracking-widest"
              >
                <ZoomIn className="w-3 h-3 mr-1.5" /> Fit
              </Button>
              <div className="w-px h-7 bg-zinc-800" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors uppercase tracking-widest"
              >
                <ZoomIn className="w-3 h-3 mr-1.5" /> Zoom
              </Button>
              <div className="w-px h-7 bg-zinc-800" />
              {/* <-- ADDED ROTATE BUTTON --> */}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors uppercase tracking-widest"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <RotateCw className="w-3 h-3 mr-1.5" /> Rotate
              </Button>
              <div className="w-px h-7 bg-zinc-800" />
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors"
                title="Download Document"
              >
                <Download className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* --- IMPROVED: Removed max-w-lg to allow full expansion --- */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-auto aspect-[1.58/1] max-h-full bg-zinc-900 border-2 border-zinc-800 border-dashed rounded-xl flex flex-col items-center justify-center text-zinc-600 gap-3 shadow-2xl transition-all">
                  <FileText className="w-12 h-12 opacity-30" />
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-70">
                    [ Document Image Rendered Here ]
                  </span>
                  <span className="text-[9px] font-medium font-mono bg-black px-2 py-1 rounded-md border border-zinc-800">
                    mock_id_card_visual.png
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DATA & ACTIONS (Fixed width) */}
          <div className="w-[320px] bg-background flex flex-col shrink-0 transition-colors border-l border-border">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Customer Info Box */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                <div className="bg-secondary/50 border-b border-border px-3 py-2 flex items-center gap-2">
                  <User className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">
                    Customer Profile
                  </span>
                </div>
                <div className="p-3.5 space-y-3">
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                      Full Name
                    </div>
                    <div className="text-xs font-bold text-foreground truncate">
                      {doc.customerName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        <Phone className="w-2.5 h-2.5" /> Phone
                      </div>
                      <div className="text-[10px] font-semibold text-foreground truncate">
                        {doc.customerPhone}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-2.5 h-2.5" /> Trust
                      </div>
                      <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                        ⭐ {doc.trustScore.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1">
                      <Mail className="w-2.5 h-2.5" /> Email
                    </div>
                    <div className="text-[10px] font-semibold text-foreground truncate">
                      {doc.customerEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Info Box */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                <div className="bg-secondary/50 border-b border-border px-3 py-2 flex items-center gap-2">
                  <FileText className="w-3 h-3 text-muted-foreground" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-foreground">
                    Metadata
                  </span>
                </div>
                <div className="p-3.5 space-y-3">
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                      Document Type
                    </div>
                    <div className="text-[11px] font-bold text-foreground">
                      {doc.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                      Uploaded On
                    </div>
                    <div className="text-[10px] font-mono font-semibold text-muted-foreground">
                      {doc.uploadedAt}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Forms */}
              {actionMode === "verify" && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3.5 rounded-xl animate-in fade-in zoom-in-95 duration-200 transition-colors">
                  <label className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5 block">
                    Record Expiry Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-semibold h-8 text-[10px] bg-background border-emerald-500/30 focus:ring-emerald-500 rounded-lg shadow-none transition-colors",
                          !expiryDate && "text-muted-foreground",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {expiryDate
                          ? format(expiryDate, "MMM d, yyyy")
                          : "Select date (if applicable)"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-border bg-popover shadow-xl rounded-xl"
                      align="start"
                    >
                      <Calendar
                        mode="single"
                        selected={expiryDate}
                        onSelect={setExpiryDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <p className="text-[9px] text-emerald-600/80 dark:text-emerald-400/80 font-medium mt-2">
                    Required for Driver's Licenses.
                  </p>
                </div>
              )}

              {actionMode === "reject" && (
                <div className="bg-destructive/10 border border-destructive/20 p-3.5 rounded-xl animate-in fade-in zoom-in-95 duration-200 transition-colors">
                  <label className="text-[9px] font-bold text-destructive uppercase tracking-widest mb-1.5 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Reason for Rejection
                  </label>
                  <Input
                    placeholder="e.g. Image is blurry, expired ID..."
                    className="h-8 text-[10px] bg-background border-destructive/30 focus-visible:ring-destructive rounded-lg shadow-none"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <p className="text-[9px] text-destructive/80 font-medium mt-2">
                    This message will be sent to the customer.
                  </p>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="bg-card border-t border-border p-3 shrink-0 flex flex-col gap-2 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] transition-colors">
              {actionMode === null ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest border-destructive/30 text-destructive hover:bg-destructive/10 rounded-lg shadow-none transition-colors"
                    onClick={() => setActionMode("reject")}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                  </Button>
                  <Button
                    className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
                    onClick={() => setActionMode("verify")}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Verify
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="h-8 px-3 text-[10px] font-bold uppercase tracking-widest text-muted-foreground rounded-lg hover:bg-secondary transition-colors"
                    onClick={() => setActionMode(null)}
                  >
                    Cancel
                  </Button>
                  {actionMode === "verify" ? (
                    <Button
                      className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
                      onClick={() => {
                        onVerify(doc.id, expiryDate);
                        onClose();
                      }}
                    >
                      Confirm Verify
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-destructive hover:bg-destructive/90 text-white rounded-lg shadow-sm transition-colors"
                      disabled={!rejectReason.trim()}
                      onClick={() => {
                        onReject(doc.id, rejectReason);
                        onClose();
                      }}
                    >
                      Confirm Reject
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
