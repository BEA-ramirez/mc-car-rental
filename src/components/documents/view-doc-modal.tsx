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
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  ZoomIn,
  Download,
  User,
  ShieldCheck,
  Phone,
  Mail,
  AlertCircle,
  X,
  Undo2,
  Trash2,
  CheckCircle,
  Clock,
  RotateCw,
  Edit3,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewedDocument = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  trustScore: number;
  type: string;
  uploadedAt: string;
  imageUrl?: string;
  status: "VERIFIED" | "REJECTED" | "EXPIRED";
  expiryDate?: string;
  rejectionReason?: string;
  internalNotes?: string;
};

type ViewDocumentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  document: ViewedDocument | null;
  onRevoke?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSaveNote?: (id: string, note: string) => void;
};

export default function ViewDocumentModal({
  isOpen,
  onClose,
  document: doc,
  onRevoke,
  onDelete,
  onSaveNote,
}: ViewDocumentModalProps) {
  const [rotation, setRotation] = useState(0); // <-- ADDED ROTATION STATE
  const [note, setNote] = useState("");

  React.useEffect(() => {
    if (isOpen) {
      setRotation(0); // Reset rotation on open
      setNote(doc?.internalNotes || "");
    }
  }, [isOpen, doc]);

  if (!doc) return null;

  const isVerified = doc.status === "VERIFIED";
  const isRejected = doc.status === "REJECTED";
  const isExpired = doc.status === "EXPIRED";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] xl:max-w-[1000px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col h-[90vh] [&>button.absolute]:hidden">
        <DialogHeader className="px-5 py-3 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-slate-100 flex items-center justify-center border border-slate-200">
              <FileText className="w-4 h-4 text-slate-600" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Document Details
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                {doc.type} • ID: {doc.id}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest rounded-sm h-7 px-3 border",
                isVerified &&
                  "bg-emerald-50 text-emerald-700 border-emerald-200",
                isRejected && "bg-red-50 text-red-700 border-red-200",
                isExpired && "bg-slate-100 text-slate-600 border-slate-300",
              )}
            >
              Status: {doc.status}
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

        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 bg-slate-950 relative flex flex-col border-r border-slate-800">
            {/* OVERLAY TOOLBAR */}
            <div className="absolute top-4 left-4 flex gap-2 z-10 bg-slate-900/80 p-1 rounded-sm border border-slate-700 backdrop-blur-sm shadow-xl">
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

            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                {/* <-- ADDED CSS TRANSFORM ROTATION --> */}
                <div
                  className="w-full max-w-[650px] aspect-[1.58/1] max-h-full bg-slate-800 border-2 border-slate-700 border-dashed rounded-sm flex flex-col items-center justify-center text-slate-500 gap-3 shadow-2xl transition-transform duration-300 ease-in-out"
                  style={{ transform: `rotate(${rotation}deg)` }}
                >
                  <FileText className="w-16 h-16 opacity-30" />
                  <span className="text-xs font-bold uppercase tracking-widest opacity-70">
                    [ Document Image Rendered Here ]
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="w-[360px] bg-slate-50 flex flex-col shrink-0">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">
              {/* STATUS BANNERS */}
              {isVerified && (
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-sm flex gap-3 items-start shadow-sm">
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider mb-0.5">
                      Officially Verified
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium leading-tight">
                      This document meets all compliance requirements for rental
                      approval.
                    </span>
                  </div>
                </div>
              )}
              {isRejected && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-sm flex gap-3 items-start shadow-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-red-900 uppercase tracking-wider mb-1">
                      Rejection Reason
                    </span>
                    <span className="text-[11px] text-red-700 font-semibold leading-tight bg-white px-2 py-1.5 rounded-sm border border-red-100">
                      "{doc.rejectionReason || "No reason provided."}"
                    </span>
                  </div>
                </div>
              )}
              {isExpired && (
                <div className="bg-slate-200/50 border border-slate-300 p-3 rounded-sm flex gap-3 items-start shadow-sm">
                  <Clock className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-0.5">
                      Validity Expired
                    </span>
                    <span className="text-[10px] text-slate-600 font-medium leading-tight">
                      Customer must upload a renewed document before booking
                      again.
                    </span>
                  </div>
                </div>
              )}

              {/* DETAILS BOXES */}
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
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                        Uploaded On
                      </div>
                      <div className="text-[11px] font-mono font-medium text-slate-600">
                        {doc.uploadedAt}
                      </div>
                    </div>
                    {doc.expiryDate && (
                      <div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-0.5">
                          Expires On
                        </div>
                        <div className="text-[11px] font-mono font-bold text-slate-800">
                          {doc.expiryDate}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* <-- ADDED INTERNAL NOTES SECTION --> */}
              <div className="space-y-1.5 pt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Edit3 className="w-3 h-3" /> Internal Staff Notes
                  </span>
                  <span className="normal-case text-[9px] font-medium text-slate-400">
                    Not visible to customer
                  </span>
                </label>
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add an internal log or note here..."
                    className="min-h-[80px] text-xs font-medium leading-relaxed bg-white border-slate-200 shadow-sm rounded-sm resize-y focus-visible:ring-1 focus-visible:ring-slate-300 p-2.5"
                  />
                  {note !== (doc.internalNotes || "") && (
                    <Button
                      size="sm"
                      className="h-7 text-[10px] font-bold self-end bg-slate-800 hover:bg-slate-900 rounded-sm"
                      onClick={() => onSaveNote && onSaveNote(doc.id, note)} // <--- ADD THIS onClick
                    >
                      Save Note
                    </Button>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex flex-col gap-2 sticky bottom-0 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
              <div className="flex gap-2">
                {onDelete && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-9 w-9 border-red-200 text-red-600 hover:bg-red-50 rounded-sm shrink-0"
                    onClick={() => onDelete(doc.id)}
                    title="Delete Record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
                {isVerified && onRevoke && (
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-xs font-bold border-orange-200 text-orange-700 hover:bg-orange-50 rounded-sm"
                    onClick={() => onRevoke(doc.id)}
                  >
                    <Undo2 className="w-3.5 h-3.5 mr-1.5" /> Revoke Approval
                  </Button>
                )}
                {!isVerified && (
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-xs font-bold border-slate-200 text-slate-700 hover:bg-slate-50 rounded-sm"
                    onClick={onClose}
                  >
                    Close Window
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
