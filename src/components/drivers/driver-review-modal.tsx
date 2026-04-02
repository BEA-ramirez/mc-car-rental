"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CheckCircle,
  XCircle,
  User,
  ShieldCheck,
  Phone,
  Mail,
  AlertCircle,
  X,
  RotateCw,
  ExternalLink,
  IdCard,
} from "lucide-react";

export type DriverReviewDocument = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  trustScore: number;
  appliedAt: string;
  licenseUrl: string;
  validIdUrl: string;
};

type DriverReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  document: DriverReviewDocument | null;
  onVerify: (id: string) => void;
  // UPDATED: Simplified rejection payload
  onReject: (id: string, reason: string) => void;
};

export default function DriverReviewModal({
  isOpen,
  onClose,
  document: doc,
  onVerify,
  onReject,
}: DriverReviewModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [actionMode, setActionMode] = useState<"verify" | "reject" | null>(
    null,
  );
  const [rotation, setRotation] = useState(0);
  const [activeDoc, setActiveDoc] = useState<"license" | "secondary">(
    "license",
  );

  useEffect(() => {
    if (isOpen) {
      setRejectReason("");
      setActionMode(null);
      setRotation(0);
      setActiveDoc("license");
    }
  }, [isOpen]);

  if (!doc) return null;

  const currentImageUrl =
    activeDoc === "license" ? doc.licenseUrl : doc.validIdUrl;

  // Validation: Only requires a reason to be typed in
  const isRejectValid = rejectReason.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] xl:max-w-[1100px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col h-[85vh] [&>button.absolute]:hidden bg-slate-50">
        {/* HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-slate-200 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#0F172A] flex items-center justify-center border border-slate-800 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-[#0F172A] tracking-tight leading-none mb-1">
                Driver Application Review
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                App ID: {doc.id.split("-")[0].toUpperCase()} • Submitted{" "}
                {doc.appliedAt}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] font-bold bg-amber-50 border-amber-200 text-amber-700 uppercase tracking-widest rounded-sm h-7 px-3 shadow-none"
            >
              Action Required
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
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* --- LEFT: DARK MODE IMAGE VIEWER --- */}
          <div className="flex-[3] lg:flex-[5] bg-[#0A0C10] relative flex flex-col border-r border-slate-800 min-w-0">
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-[#111623]/50">
              <Tabs
                value={activeDoc}
                onValueChange={(v) => {
                  setActiveDoc(v as any);
                  setRotation(0);
                }}
                className="w-72"
              >
                <TabsList className="bg-[#050608] p-1 h-8 rounded-sm w-full grid grid-cols-2 border border-slate-800">
                  <TabsTrigger
                    value="license"
                    className="h-6 text-[9px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-[#111623] data-[state=active]:text-white text-slate-500"
                  >
                    Driver's License
                  </TabsTrigger>
                  <TabsTrigger
                    value="secondary"
                    className="h-6 text-[9px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-[#111623] data-[state=active]:text-white text-slate-500"
                  >
                    Secondary ID
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-1 bg-[#050608] p-1 rounded-sm border border-slate-800">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] font-bold text-slate-400 hover:bg-[#111623] hover:text-white rounded-[2px]"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  <RotateCw className="w-3 h-3 mr-1.5" /> Rotate
                </Button>
                <div className="w-px h-4 bg-slate-800 mx-1" />
                <a
                  href={currentImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center h-6 px-2 text-[10px] font-bold text-slate-400 hover:bg-[#111623] hover:text-white rounded-[2px] transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" /> Full Screen
                </a>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Grid Background pattern */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000_100%),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000_100%)] bg-size-[20px_20px] bg-position-[0_0,10px_10px]" />

                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt="Document Scan"
                    className="max-w-full max-h-full object-contain rounded-sm shadow-2xl transition-transform duration-200 ease-in-out z-10"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-600 z-10">
                    <IdCard className="w-12 h-12 opacity-20" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Document Missing
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT: DATA & ACTIONS --- */}
          <div className="w-full lg:w-96 bg-[#F8FAFC] flex flex-col shrink-0 min-w-0 border-l border-slate-200">
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {/* Applicant Profile Box */}
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                <div className="bg-[#F8FAFC] border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Applicant Profile
                  </span>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Full Name
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">
                      {doc.customerName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </div>
                      <div className="text-[11px] font-mono text-slate-700 bg-slate-50 p-1.5 border border-slate-100 rounded-sm">
                        {doc.customerPhone}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Trust Score
                      </div>
                      <div className="text-[11px] font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 p-1.5 rounded-sm">
                        {doc.trustScore.toFixed(1)} / 5.0
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </div>
                    <div className="text-[11px] font-mono text-slate-700 truncate bg-slate-50 p-1.5 border border-slate-100 rounded-sm">
                      {doc.customerEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION: VERIFY */}
              {actionMode === "verify" && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm flex flex-col items-center justify-center text-center space-y-3 py-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Approve Driver
                  </h3>
                  <p className="text-[10px] text-emerald-700 font-medium uppercase tracking-widest leading-relaxed">
                    By confirming, you verify that the provided documents are
                    authentic and valid.
                  </p>
                </div>
              )}

              {/* ACTION: REJECT */}
              {actionMode === "reject" && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-sm animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" /> Feedback Message{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Image is blurry, please re-upload..."
                      className="h-10 text-xs bg-white border-red-200 focus-visible:ring-red-500 rounded-sm shadow-none"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <p className="text-[9px] text-red-700 font-bold mt-3 uppercase tracking-widest leading-relaxed pt-1">
                      This feedback will be emailed directly to the applicant.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="bg-white border-t border-slate-200 p-5 shrink-0 flex flex-col gap-3 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
              {actionMode === null ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 h-10 text-[10px] font-bold uppercase tracking-widest border-slate-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-sm shadow-none transition-colors"
                    onClick={() => setActionMode("reject")}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                  </Button>
                  <Button
                    className="flex-1 h-10 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-none transition-colors"
                    onClick={() => setActionMode("verify")}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                    Driver
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <Button
                    variant="ghost"
                    className="h-10 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-sm transition-colors"
                    onClick={() => setActionMode(null)}
                  >
                    Cancel
                  </Button>

                  {actionMode === "verify" ? (
                    <Button
                      className="flex-1 h-10 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-none transition-colors"
                      onClick={() => onVerify(doc.id)}
                    >
                      Confirm Approval
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 h-10 text-[10px] font-bold uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white rounded-sm shadow-none transition-colors"
                      disabled={!isRejectValid}
                      onClick={() => {
                        onReject(doc.id, rejectReason);
                      }}
                    >
                      Send Rejection
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
