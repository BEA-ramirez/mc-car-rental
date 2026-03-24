"use client";

import React, { useState, useEffect } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
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
  ExternalLink,
  IdCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ReviewDocument = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  trustScore: number;
  appliedAt: string;
  licenseUrl: string;
  validIdUrl: string;
};

type ReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  document: ReviewDocument | null;
  // UPDATED: Now expects two string dates matching your server action payload
  onVerify: (id: string, licenseExpiry: string, validIdExpiry: string) => void;
  // UPDATED: Now expects individual booleans instead of an object
  onReject: (
    id: string,
    reason: string,
    rejectLicense: boolean,
    rejectValidId: boolean,
  ) => void;
};

export default function ReviewModal({
  isOpen,
  onClose,
  document: doc,
  onVerify,
  onReject,
}: ReviewModalProps) {
  // UPDATED: Split expiry into two separate states
  const [licenseExpiry, setLicenseExpiry] = useState<Date | undefined>(
    undefined,
  );
  const [validIdExpiry, setValidIdExpiry] = useState<Date | undefined>(
    undefined,
  );

  const [rejectReason, setRejectReason] = useState("");
  const [actionMode, setActionMode] = useState<"verify" | "reject" | null>(
    null,
  );
  const [rotation, setRotation] = useState(0);
  const [activeDoc, setActiveDoc] = useState<"license" | "secondary">(
    "license",
  );

  const [rejectedDocs, setRejectedDocs] = useState({
    license: false,
    validId: false,
  });

  useEffect(() => {
    if (isOpen) {
      setLicenseExpiry(undefined);
      setValidIdExpiry(undefined);
      setRejectReason("");
      setActionMode(null);
      setRotation(0);
      setActiveDoc("license");
      setRejectedDocs({ license: false, validId: false });
    }
  }, [isOpen]);

  if (!doc) return null;

  const currentImageUrl =
    activeDoc === "license" ? doc.licenseUrl : doc.validIdUrl;

  const isRejectValid =
    rejectReason.trim() !== "" &&
    (rejectedDocs.license || rejectedDocs.validId);

  // Validation: Both dates required to verify
  const isVerifyValid = !!licenseExpiry && !!validIdExpiry;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] xl:max-w-[1100px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col h-[85vh] [&>button.absolute]:hidden bg-slate-50">
        {/* HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-slate-200 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center border border-slate-800 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                KYC Verification Hub
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
              className="text-[10px] font-bold bg-amber-50 border-amber-200 text-amber-700 uppercase tracking-widest rounded-sm h-7 px-3"
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
          <div className="flex-[5] bg-slate-950 relative flex flex-col border-r border-slate-800 min-w-0">
            <div className="flex items-center justify-between p-3 border-b border-slate-800 bg-slate-900/50">
              <Tabs
                value={activeDoc}
                onValueChange={(v) => {
                  setActiveDoc(v as any);
                  setRotation(0);
                }}
                className="w-[300px]"
              >
                <TabsList className="bg-slate-800/50 p-1 h-8 rounded-sm w-full grid grid-cols-2">
                  <TabsTrigger
                    value="license"
                    className="h-6 text-[9px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
                  >
                    Driver's License
                  </TabsTrigger>
                  <TabsTrigger
                    value="secondary"
                    className="h-6 text-[9px] font-bold uppercase tracking-widest rounded-[2px] data-[state=active]:bg-slate-700 data-[state=active]:text-white text-slate-400"
                  >
                    Secondary ID
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-sm border border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[10px] font-bold text-slate-300 hover:bg-slate-700 hover:text-white rounded-[2px]"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  <RotateCw className="w-3 h-3 mr-1.5" /> Rotate
                </Button>
                <div className="w-px h-4 bg-slate-700 mx-1" />
                <a
                  href={currentImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center h-6 px-2 text-[10px] font-bold text-slate-300 hover:bg-slate-700 hover:text-white rounded-[2px] transition-colors"
                >
                  <ExternalLink className="w-3 h-3 mr-1.5" /> Open Full
                </a>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
              <div className="w-full h-full flex items-center justify-center relative">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000_100%),linear-gradient(45deg,#000_25%,transparent_25%,transparent_75%,#000_75%,#000_100%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]" />
                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt="Document Scan"
                    className="max-w-full max-h-full object-contain rounded-sm shadow-2xl transition-transform duration-200 ease-in-out z-10"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-slate-500 z-10">
                    <IdCard className="w-12 h-12 opacity-30" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Document Missing
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT: DATA & ACTIONS --- */}
          <div className="w-[380px] bg-slate-50 flex flex-col shrink-0 min-w-0">
            <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
              {/* Customer Info Box */}
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden">
                <div className="bg-slate-50 border-b border-slate-200 px-3 py-2 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    Applicant Profile
                  </span>
                </div>
                <div className="p-4 space-y-3.5">
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                      Full Name
                    </div>
                    <div className="text-sm font-bold text-slate-900">
                      {doc.customerName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </div>
                      <div className="text-xs font-mono text-slate-700">
                        {doc.customerPhone}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Trust Score
                      </div>
                      <div className="text-xs font-bold font-mono text-emerald-600">
                        {doc.trustScore.toFixed(1)} / 5.0
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </div>
                    <div className="text-xs font-mono text-slate-700 truncate">
                      {doc.customerEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION: VERIFY */}
              {actionMode === "verify" && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <CalendarIcon className="w-3 h-3" /> License Expiry{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-medium h-9 text-xs bg-white border-emerald-200 hover:bg-white hover:border-emerald-300 focus:ring-emerald-500 rounded-sm shadow-none",
                            !licenseExpiry && "text-slate-400",
                          )}
                        >
                          {licenseExpiry
                            ? format(licenseExpiry, "MMM dd, yyyy")
                            : "Select date..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border-slate-200 shadow-xl rounded-sm"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={licenseExpiry}
                          onSelect={setLicenseExpiry}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-emerald-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <CalendarIcon className="w-3 h-3" /> Valid ID Expiry{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-medium h-9 text-xs bg-white border-emerald-200 hover:bg-white hover:border-emerald-300 focus:ring-emerald-500 rounded-sm shadow-none",
                            !validIdExpiry && "text-slate-400",
                          )}
                        >
                          {validIdExpiry
                            ? format(validIdExpiry, "MMM dd, yyyy")
                            : "Select date..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border-slate-200 shadow-xl rounded-sm"
                        align="start"
                      >
                        <Calendar
                          mode="single"
                          selected={validIdExpiry}
                          onSelect={setValidIdExpiry}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <p className="text-[9px] text-emerald-600/80 font-bold mt-2 uppercase tracking-widest">
                    Dates must match the uploaded documents exactly.
                  </p>
                </div>
              )}

              {/* ACTION: REJECT */}
              {actionMode === "reject" && (
                <div className="bg-red-50 border border-red-200 p-4 rounded-sm animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" /> Select Documents to
                      Reject <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-col gap-2.5 bg-white border border-red-100 p-3 rounded-sm">
                      <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded-sm border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          checked={rejectedDocs.license}
                          onChange={(e) =>
                            setRejectedDocs((prev) => ({
                              ...prev,
                              license: e.target.checked,
                            }))
                          }
                        />
                        Driver's License
                      </label>
                      <label className="flex items-center gap-2.5 text-xs font-bold text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded-sm border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
                          checked={rejectedDocs.validId}
                          onChange={(e) =>
                            setRejectedDocs((prev) => ({
                              ...prev,
                              validId: e.target.checked,
                            }))
                          }
                        />
                        Secondary Valid ID
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-red-800 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      Feedback Message <span className="text-red-500">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Image is blurry..."
                      className="h-9 text-xs bg-white border-red-200 focus-visible:ring-red-500 rounded-sm shadow-none"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <p className="text-[9px] text-red-600/80 font-bold mt-2 uppercase tracking-widest">
                      This message will be emailed to the applicant.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex flex-col gap-2 z-10 shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
              {actionMode === null ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest border-slate-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 rounded-sm shadow-none"
                    onClick={() => setActionMode("reject")}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                  </Button>
                  <Button
                    className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-none"
                    onClick={() => setActionMode("verify")}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Verify ID
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="h-9 px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 rounded-sm"
                    onClick={() => setActionMode(null)}
                  >
                    Cancel
                  </Button>

                  {actionMode === "verify" ? (
                    <Button
                      className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-none"
                      disabled={!isVerifyValid}
                      onClick={() => {
                        if (licenseExpiry && validIdExpiry) {
                          // Format as YYYY-MM-DD for the database
                          onVerify(
                            doc.id,
                            format(licenseExpiry, "yyyy-MM-dd"),
                            format(validIdExpiry, "yyyy-MM-dd"),
                          );
                        }
                      }}
                    >
                      Confirm Approval
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 h-9 text-[10px] font-bold uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white rounded-sm shadow-none"
                      disabled={!isRejectValid}
                      onClick={() => {
                        onReject(
                          doc.id,
                          rejectReason,
                          rejectedDocs.license,
                          rejectedDocs.validId,
                        );
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
