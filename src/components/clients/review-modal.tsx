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
  onVerify: (id: string, licenseExpiry: string, validIdExpiry: string) => void;
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
      <DialogContent className="max-w-[90vw] xl:max-w-[1100px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[85vh] transition-colors duration-300 [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center border border-border shadow-sm transition-colors">
              <ShieldCheck className="w-4 h-4 text-background" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                KYC Verification Hub
              </DialogTitle>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none font-mono">
                APP ID: {doc.id.split("-")[0]} • Submitted {doc.appliedAt}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[9px] font-bold bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-widest rounded-lg h-7 px-2.5 transition-colors"
            >
              Action Required
            </Badge>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg shadow-none transition-colors"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* SPLIT BODY */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* --- LEFT: DARK MODE IMAGE VIEWER --- */}
          <div className="flex-[5] bg-black relative flex flex-col border-r border-border min-w-0 transition-colors">
            <div className="flex items-center justify-between p-2.5 border-b border-white/10 bg-black/50 backdrop-blur-md">
              <Tabs
                value={activeDoc}
                onValueChange={(v) => {
                  setActiveDoc(v as any);
                  setRotation(0);
                }}
                className="w-64"
              >
                <TabsList className="bg-white/10 p-1 h-8 rounded-lg w-full grid grid-cols-2 border border-white/5">
                  <TabsTrigger
                    value="license"
                    className="h-6 text-[9px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/50 transition-colors"
                  >
                    Driver's License
                  </TabsTrigger>
                  <TabsTrigger
                    value="secondary"
                    className="h-6 text-[9px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-white/20 data-[state=active]:text-white text-white/50 transition-colors"
                  >
                    Secondary ID
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="flex items-center gap-1 bg-white/5 p-1 rounded-lg border border-white/10">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-[9px] font-bold uppercase tracking-widest text-white/70 hover:bg-white/20 hover:text-white rounded-md shadow-none transition-colors"
                  onClick={() => setRotation((r) => (r + 90) % 360)}
                >
                  <RotateCw className="w-3.5 h-3.5 mr-1.5" /> Rotate
                </Button>
                <div className="w-px h-4 bg-white/20 mx-1" />
                <a
                  href={currentImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center h-6 px-2 text-[9px] font-bold uppercase tracking-widest text-white/70 hover:bg-white/20 hover:text-white rounded-md transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Open Full
                </a>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Checkered background pattern for contrast */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff_100%),linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff_100%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]" />

                {currentImageUrl ? (
                  <img
                    src={currentImageUrl}
                    alt="Document Scan"
                    className="max-w-full max-h-full object-contain rounded shadow-2xl transition-transform duration-200 ease-in-out z-10"
                    style={{ transform: `rotate(${rotation}deg)` }}
                  />
                ) : (
                  <div className="flex flex-col items-center gap-3 text-white/30 z-10">
                    <IdCard className="w-12 h-12 opacity-50" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      Document Missing
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* --- RIGHT: DATA & ACTIONS --- */}
          <div className="w-[360px] bg-background flex flex-col shrink-0 min-w-0 transition-colors">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Customer Info Box */}
              <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors">
                <div className="bg-secondary/50 border-b border-border px-3 py-2 flex items-center gap-2 transition-colors">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                    Applicant Profile
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                      Full Name
                    </div>
                    <div className="text-[11px] font-bold text-foreground uppercase">
                      {doc.customerName}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                        <Phone className="w-3 h-3" /> Phone
                      </div>
                      <div className="text-[11px] font-mono font-medium text-foreground">
                        {doc.customerPhone}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                        <ShieldCheck className="w-3 h-3" /> Trust Score
                      </div>
                      <div className="text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
                        {doc.trustScore.toFixed(1)} / 5.0
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5 flex items-center gap-1.5">
                      <Mail className="w-3 h-3" /> Email
                    </div>
                    <div className="text-[11px] font-mono font-medium text-foreground truncate">
                      {doc.customerEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION: VERIFY */}
              {actionMode === "verify" && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm space-y-4 transition-colors">
                  <div>
                    <label className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <CalendarIcon className="w-3 h-3" /> License Expiry{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-semibold h-8 text-[11px] bg-background border-emerald-500/30 hover:bg-background hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 rounded-lg shadow-none transition-colors text-foreground",
                            !licenseExpiry && "text-muted-foreground",
                          )}
                        >
                          {licenseExpiry
                            ? format(licenseExpiry, "MMM dd, yyyy")
                            : "Select date..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border-border shadow-xl rounded-xl bg-popover"
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
                    <label className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <CalendarIcon className="w-3 h-3" /> Valid ID Expiry{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-semibold h-8 text-[11px] bg-background border-emerald-500/30 hover:bg-background hover:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500 rounded-lg shadow-none transition-colors text-foreground",
                            !validIdExpiry && "text-muted-foreground",
                          )}
                        >
                          {validIdExpiry
                            ? format(validIdExpiry, "MMM dd, yyyy")
                            : "Select date..."}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-auto p-0 border-border shadow-xl rounded-xl bg-popover"
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

                  <div className="flex items-start gap-2 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                    <AlertCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-[9px] text-emerald-600/90 dark:text-emerald-400/90 font-bold uppercase tracking-widest leading-relaxed">
                      Dates must match the uploaded documents exactly.
                    </p>
                  </div>
                </div>
              )}

              {/* ACTION: REJECT */}
              {actionMode === "reject" && (
                <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm space-y-4 transition-colors">
                  <div>
                    <label className="text-[9px] font-bold text-destructive uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" /> Select Documents
                      to Reject <span className="text-destructive">*</span>
                    </label>
                    <div className="flex flex-col gap-2.5 bg-background border border-destructive/20 p-3 rounded-lg transition-colors">
                      <label className="flex items-center gap-2.5 text-[11px] font-bold text-foreground cursor-pointer transition-colors hover:text-destructive">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-muted-foreground text-destructive focus:ring-destructive cursor-pointer"
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
                      <label className="flex items-center gap-2.5 text-[11px] font-bold text-foreground cursor-pointer transition-colors hover:text-destructive">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-muted-foreground text-destructive focus:ring-destructive cursor-pointer"
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
                    <label className="text-[9px] font-bold text-destructive uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      Feedback Message{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Image is blurry..."
                      className="h-8 text-[11px] font-medium bg-background border-destructive/30 focus-visible:ring-1 focus-visible:ring-destructive rounded-lg shadow-none transition-colors text-foreground"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <p className="text-[9px] text-destructive/80 font-bold mt-1.5 uppercase tracking-widest">
                      This message will be emailed to the applicant.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="bg-card border-t border-border p-4 shrink-0 flex flex-col gap-2.5 z-10 shadow-[0_-4px_12px_hsl(var(--shadow)/0.03)] transition-colors">
              {actionMode === null ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest border-destructive/30 text-destructive bg-card hover:bg-destructive/10 rounded-lg shadow-none transition-colors"
                    onClick={() => setActionMode("reject")}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                  </Button>
                  <Button
                    className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
                    onClick={() => setActionMode("verify")}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Verify ID
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
                    onClick={() => setActionMode(null)}
                  >
                    Cancel
                  </Button>

                  {actionMode === "verify" ? (
                    <Button
                      className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
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
                      className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-destructive hover:opacity-90 text-destructive-foreground rounded-lg shadow-sm transition-opacity"
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
