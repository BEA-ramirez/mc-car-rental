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
import Image from "next/image";
// A clean, gray placeholder with a "document" icon
const FALLBACK_IMAGE =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSIjOTRhM2I4IiBzdHJva2Utd2lkdGg9IjEiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHJlY3QgeD0iMCIgeT0iMCIgd2lkdGg9IjI0IiBoZWlnaHQ9IjI0IiBmaWxsPSIjZjFmNWY5IiBzdHJva2U9Im5vbmUiLz48cGF0aCBkPSJNMTQgMmgtNmEyIDIgMCAwIDAtMiAydjE2YTIgMiAwIDAgMCAyIDJoMTJhMiAyIDAgMCAwIDItMnYtOGwtNi02eiIvPjxwYXRoIGQ9Ik0xNCAydjZhNiA2IDAgMCAwIDYgNnIvPjxwYXRoIGQ9Ik05IDE1aDYuNSIvPjxwYXRoIGQ9Ik05IDE5aDYuNSIvPjxwYXRoIGQ9Ik05IDExaDEiLz48L3N2Zz4=";

export type ViewedDocument = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  trustScore: number;
  type: string;
  uploadedAt: string;
  imageUrl?: string;
  status: "verified" | "rejected" | "expired";
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
  const [rotation, setRotation] = useState(0);
  const [note, setNote] = useState("");
  console.log("Viewed doc", doc);

  React.useEffect(() => {
    if (isOpen) {
      setRotation(0); // Reset rotation on open
      setNote(doc?.internalNotes || "");
    }
  }, [isOpen, doc]);

  if (!doc) return null;

  const isVerified = doc.status === "verified";
  const isRejected = doc.status === "rejected";
  const isExpired = doc.status === "expired";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] xl:max-w-[1000px] p-0 gap-0! overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[90vh] transition-colors duration-300 [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center border border-border shadow-sm">
              <FileText className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                Document Details
              </DialogTitle>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                {doc.type} • ID: {doc.id}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest rounded h-6 px-2 border",
                isVerified &&
                  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
                isRejected &&
                  "bg-destructive/10 text-destructive border-destructive/20",
                isExpired && "bg-secondary text-muted-foreground border-border",
              )}
            >
              Status: {doc.status}
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
        <div className="flex flex-1 overflow-hidden">
          {/* LEFT: IMAGE VIEWER */}
          <div className="flex-[4] bg-zinc-950 dark:bg-black relative flex flex-col border-r border-border transition-colors">
            {/* OVERLAY TOOLBAR */}
            <div className="absolute top-4 left-4 flex gap-2 z-10 bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 backdrop-blur-md shadow-2xl">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[10px] font-bold text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-md transition-colors uppercase tracking-widest"
              >
                <ZoomIn className="w-3 h-3 mr-1.5" /> Zoom
              </Button>
              <div className="w-px h-7 bg-zinc-800" />
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

            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-hidden">
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-full h-48 rounded-md overflow-hidden">
                  <Image
                    src={doc.imageUrl || ""}
                    alt="Customer Document"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: DATA & ACTIONS */}
          <div className="w-[320px] bg-background flex flex-col shrink-0 transition-colors">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* STATUS BANNERS */}
              {isVerified && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl flex gap-2.5 items-start shadow-sm transition-colors">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-widest mb-0.5">
                      Officially Verified
                    </span>
                    <span className="text-[10px] text-emerald-600/90 dark:text-emerald-400/90 font-medium leading-tight">
                      This document meets all compliance requirements for rental
                      approval.
                    </span>
                  </div>
                </div>
              )}
              {isRejected && (
                <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-xl flex gap-2.5 items-start shadow-sm transition-colors">
                  <AlertCircle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-1">
                      Rejection Reason
                    </span>
                    <span className="text-[10px] text-destructive font-semibold leading-relaxed bg-background px-2 py-1.5 rounded-lg border border-destructive/20 shadow-sm">
                      "{doc.rejectionReason || "No reason provided."}"
                    </span>
                  </div>
                </div>
              )}
              {isExpired && (
                <div className="bg-secondary/50 border border-border p-3 rounded-xl flex gap-2.5 items-start shadow-sm transition-colors">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-foreground uppercase tracking-widest mb-0.5">
                      Validity Expired
                    </span>
                    <span className="text-[10px] text-muted-foreground font-medium leading-tight">
                      Customer must upload a renewed document before booking
                      again.
                    </span>
                  </div>
                </div>
              )}

              {/* DETAILS BOXES */}
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
                    <div className="text-[11px] font-bold text-foreground">
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
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                        Uploaded On
                      </div>
                      <div className="text-[10px] font-mono font-semibold text-muted-foreground">
                        {doc.uploadedAt}
                      </div>
                    </div>
                    {doc.expiryDate && (
                      <div>
                        <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                          Expires On
                        </div>
                        <div className="text-[10px] font-mono font-bold text-foreground">
                          {doc.expiryDate}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* INTERNAL NOTES SECTION */}
              <div className="space-y-1.5 pt-1">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-foreground">
                    <Edit3 className="w-3 h-3" /> Internal Notes
                  </span>
                  <span className="normal-case text-[9px] font-medium text-muted-foreground/70">
                    Not visible to customer
                  </span>
                </label>
                <div className="flex flex-col gap-2">
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Add an internal log or note here..."
                    className="min-h-[80px] text-[11px] font-medium leading-relaxed bg-background border-border shadow-sm rounded-lg resize-y focus-visible:ring-1 focus-visible:ring-primary p-2.5 transition-colors"
                  />
                  {note !== (doc.internalNotes || "") && (
                    <Button
                      size="sm"
                      className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest self-end bg-primary hover:opacity-90 text-primary-foreground rounded-lg transition-opacity"
                      onClick={() => onSaveNote && onSaveNote(doc.id, note)}
                    >
                      Save Note
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Action Footer */}
            <div className="bg-card border-t border-border p-3 shrink-0 flex gap-2 justify-between sticky bottom-0 z-10 transition-colors">
              {onDelete && (
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8 border-destructive/30 text-destructive hover:bg-destructive/10 rounded-lg shrink-0 transition-colors"
                  onClick={() => onDelete(doc.id)}
                  title="Delete Record"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              )}

              <div className="flex flex-1 gap-2 justify-end">
                {isVerified && onRevoke ? (
                  <Button
                    variant="outline"
                    className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest border-orange-500/30 text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 rounded-lg transition-colors"
                    onClick={() => onRevoke(doc.id)}
                  >
                    <Undo2 className="w-3.5 h-3.5 mr-1.5" /> Revoke
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest border-border text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
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
