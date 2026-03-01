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
      <DialogContent className="max-w-[80vw] xl:max-w-[1000px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col h-[90vh] [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-blue-50 flex items-center justify-center border border-blue-100">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                KYC Verification Hub
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                {doc.type} • ID: {doc.id}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] font-bold bg-slate-50 border-slate-200 text-slate-600 uppercase tracking-widest rounded-sm h-7 px-3"
            >
              Status: {doc.status}
            </Badge>
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
        <div className="flex flex-1 overflow-hidden">
          {/* --- LEFT: IMAGE VIEWER (MUCH LARGER flex-[4]) --- */}
          <div className="flex-[4] bg-slate-950 relative flex flex-col border-r border-slate-800">
            {/* Overlay Toolbar */}
            <div className="absolute top-4 left-4 flex gap-2 z-10 bg-slate-900/80 p-1 rounded-sm border border-slate-700 backdrop-blur-sm shadow-xl">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white rounded-sm"
              >
                <ZoomIn className="w-3.5 h-3.5 mr-1.5" /> Fit to screen
              </Button>
              <div className="w-px h-8 bg-slate-700" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-300 hover:bg-slate-700 hover:text-white rounded-sm"
              >
                <Download className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white rounded-sm"
              >
                <ZoomIn className="w-3.5 h-3.5 mr-1.5" /> Zoom
              </Button>
              <div className="w-px h-8 bg-slate-700" />
              {/* <-- ADDED ROTATE BUTTON --> */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-bold text-slate-300 hover:bg-slate-700 hover:text-white rounded-sm"
                onClick={() => setRotation((r) => (r + 90) % 360)}
              >
                <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Rotate
              </Button>
              <div className="w-px h-8 bg-slate-700" />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-300 hover:bg-slate-700 hover:text-white rounded-sm"
                title="Download Document"
              >
                <Download className="w-4 h-4" />
              </Button>
            </div>

            {/* --- IMPROVED: Removed max-w-lg to allow full expansion --- */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-full h-auto aspect-[1.58/1] max-h-full bg-slate-800 border-2 border-slate-700 border-dashed rounded-sm flex flex-col items-center justify-center text-slate-500 gap-3 shadow-2xl transition-all">
                  <FileText className="w-16 h-16 opacity-30" />
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                    [ Document Image Rendered Here ]
                  </span>
                  <span className="text-[10px] font-medium font-mono bg-slate-900 px-2 py-1 rounded border border-slate-700">
                    mock_id_card_visual.png
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DATA & ACTIONS (Fixed width) */}
          <div className="w-[360px] bg-slate-50 flex flex-col shrink-0">
            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              {/* Customer Info Box */}
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Customer Profile
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Full Name
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {doc.customerName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </div>
                      <div className="text-[11px] font-medium text-slate-700">
                        {doc.customerPhone}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Trust Score
                      </div>
                      <div className="text-[11px] font-bold text-emerald-600">
                        ⭐ {doc.trustScore.toFixed(1)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-wider mb-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </div>
                    <div className="text-[11px] font-medium text-slate-700">
                      {doc.customerEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* Document Info Box */}
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                <div className="bg-slate-100 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Metadata
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Document Type
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      {doc.type}
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                      Uploaded On
                    </div>
                    <div className="text-xs font-mono font-medium text-slate-600">
                      {doc.uploadedAt}
                    </div>
                  </div>
                </div>
              </div>

              {/* Decision Forms */}
              {actionMode === "verify" && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm animate-in fade-in zoom-in-95 duration-200">
                  <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider mb-1.5 block">
                    Record Expiry Date
                  </label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-medium h-9 text-xs bg-white border-emerald-200 focus:ring-emerald-500 rounded-sm",
                          !expiryDate && "text-slate-400",
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5" />
                        {expiryDate
                          ? format(expiryDate, "MMM d, yyyy")
                          : "Select date (if applicable)"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-auto p-0 border-slate-200 shadow-xl"
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
                  <p className="text-[9px] text-emerald-600 font-medium mt-2">
                    Required for Driver's Licenses.
                  </p>
                </div>
              )}

              {actionMode === "reject" && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-sm animate-in fade-in zoom-in-95 duration-200">
                  <label className="text-[10px] font-bold text-red-800 uppercase tracking-wider mb-1.5 block flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Reason for Rejection
                  </label>
                  <Input
                    placeholder="e.g. Image is blurry, expired ID..."
                    className="h-9 text-xs bg-white border-red-200 focus-visible:ring-red-500 rounded-sm"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <p className="text-[9px] text-red-600 font-medium mt-2">
                    This message will be sent to the customer.
                  </p>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex flex-col gap-2 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
              {actionMode === null ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-xs font-bold border-red-200 text-red-600 hover:bg-red-50 rounded-sm"
                    onClick={() => setActionMode("reject")}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject ID
                  </Button>
                  <Button
                    className="flex-1 h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-sm"
                    onClick={() => setActionMode("verify")}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Verify ID
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="h-9 px-3 text-xs font-bold text-slate-500 rounded-sm"
                    onClick={() => setActionMode(null)}
                  >
                    Cancel
                  </Button>
                  {actionMode === "verify" ? (
                    <Button
                      className="flex-1 h-9 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-sm"
                      onClick={() => {
                        onVerify(doc.id, expiryDate);
                        onClose();
                      }}
                    >
                      Confirm Verification
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 h-9 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-sm shadow-sm"
                      disabled={!rejectReason.trim()}
                      onClick={() => {
                        onReject(doc.id, rejectReason);
                        onClose();
                      }}
                    >
                      Confirm Rejection
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
