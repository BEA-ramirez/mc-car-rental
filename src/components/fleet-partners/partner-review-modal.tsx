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
import {
  CheckCircle,
  XCircle,
  User,
  ShieldCheck,
  Phone,
  Mail,
  AlertCircle,
  X,
  Briefcase,
  Landmark,
  CreditCard,
  Percent,
  CalendarDays,
  FileText,
  FileBadge,
  ChevronRight,
} from "lucide-react";
import { toTitleCase } from "@/actions/helper/format-text";
import { cn } from "@/lib/utils";
import ReviewModal, { ReviewDocument } from "../documents/review-modal";

type PartnerReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  partner: any | null; // Receives the raw joined car_owner + users + documents object
  onApprove: (payload: { carOwnerId: string; userId: string }) => void;
  onReject: (payload: {
    carOwnerId: string;
    userId: string;
    reason: string;
  }) => void;
  onVerifyDocument?: (id: string, expiryDate?: Date) => void;
  onRejectDocument?: (id: string, reason: string) => void;
};

export default function PartnerReviewModal({
  isOpen,
  onClose,
  partner,
  onApprove,
  onReject,
  onVerifyDocument,
  onRejectDocument,
}: PartnerReviewModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(
    null,
  );

  // State for the nested Document Review Modal
  const [reviewDoc, setReviewDoc] = useState<ReviewDocument | null>(null);

  useEffect(() => {
    if (isOpen) {
      setRejectReason("");
      setActionMode(null);
      setReviewDoc(null);
    }
  }, [isOpen]);

  if (!partner) return null;

  const user = partner.users || {};
  const isRejectValid = rejectReason.trim() !== "";

  // Helper to open the document viewer modal
  const handleOpenReview = (doc: any) => {
    setReviewDoc({
      id: doc.document_id,
      customerName: `${user.first_name} ${user.last_name}`,
      customerEmail: user.email,
      customerPhone: user.phone_number,
      trustScore: user.trust_score || 5,
      type: doc.category === "license_id" ? "Driver's License" : "Secondary ID",
      uploadedAt: new Date(doc.created_at).toLocaleDateString(),
      imageUrl: doc.file_path,
      status: doc.status,
    });
  };

  // Helper for document badge colors
  const getDocTheme = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return {
          container:
            "bg-emerald-500/10 border-emerald-500/20 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400",
          badge:
            "bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border-transparent",
          icon: "text-emerald-600 dark:text-emerald-400",
        };
      case "REJECTED":
        return {
          container:
            "bg-destructive/10 border-destructive/20 hover:bg-destructive/20 text-destructive",
          badge: "bg-destructive/20 text-destructive border-transparent",
          icon: "text-destructive",
        };
      default: // PENDING
        return {
          container:
            "bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400",
          badge:
            "bg-amber-500/20 text-amber-700 dark:text-amber-400 border-transparent",
          icon: "text-amber-600 dark:text-amber-400",
        };
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="!max-w-5xl !w-[95vw] p-0 overflow-hidden border-border shadow-2xl rounded-2xl flex flex-col h-[70vh] sm:h-[650px] [&>button.absolute]:hidden bg-background transition-colors duration-300">
          {/* --- HEADER --- */}
          <DialogHeader className="px-5 py-4 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm transition-colors">
                <Briefcase className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col text-left">
                <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1.5 uppercase">
                  Fleet Partner Application
                </DialogTitle>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none font-mono">
                  App ID: {partner.car_owner_id.split("-")[0]} • Submitted{" "}
                  {new Date(partner.created_at).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge
                variant="outline"
                className="text-[9px] font-bold bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-widest rounded-md h-6 px-2 shadow-none"
              >
                Action Required
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

          {/* --- MAIN GRID CONTENT --- */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-5 bg-secondary/10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 h-full max-w-6xl mx-auto">
              {/* --- CARD 1: BUSINESS & FINANCIAL DOSSIER --- */}
              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col transition-colors overflow-hidden">
                <div className="flex items-center px-4 py-3 bg-secondary/30 border-b border-border gap-2 shrink-0">
                  <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Business & Financial Details
                  </span>
                </div>

                <div className="p-4 space-y-5">
                  {/* Company Information */}
                  <div>
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      Company Information
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/40 border border-border rounded-lg p-2.5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Briefcase className="w-3 h-3" /> Registered Name
                        </p>
                        <p className="text-[11px] font-bold text-foreground truncate uppercase">
                          {toTitleCase(partner.business_name || "N/A")}
                        </p>
                      </div>
                      <div className="bg-secondary/40 border border-border rounded-lg p-2.5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Percent className="w-3 h-3" /> Revenue Share
                        </p>
                        <p className="text-[11px] font-bold font-mono text-primary">
                          {partner.revenue_share_percentage ?? 70}%
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payout Configuration */}
                  <div>
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      Payout Configuration
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/40 border border-border rounded-lg p-2.5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Landmark className="w-3 h-3" /> Bank Name
                        </p>
                        <p className="text-[11px] font-bold text-foreground uppercase">
                          {partner.bank_name || "Not Provided"}
                        </p>
                      </div>
                      <div className="bg-secondary/40 border border-border rounded-lg p-2.5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <User className="w-3 h-3" /> Account Holder
                        </p>
                        <p className="text-[11px] font-bold text-foreground uppercase truncate">
                          {partner.bank_account_name || "Not Provided"}
                        </p>
                      </div>
                      <div className="bg-secondary/40 border border-border rounded-lg p-2.5 col-span-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <CreditCard className="w-3 h-3" /> Account Number
                        </p>
                        <p className="text-[11px] font-mono font-bold text-foreground">
                          {partner.bank_account_number || "Not Provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Contract Status */}
                  <div className="pt-2 border-t border-border">
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      Contract Status
                    </h4>
                    <div className="bg-secondary/40 border border-border rounded-lg p-2.5 inline-flex flex-col min-w-[200px]">
                      <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                        <CalendarDays className="w-3 h-3" /> Contract Expiry
                      </p>
                      <p className="text-[11px] font-bold text-foreground font-mono">
                        {partner.contract_expiry_date
                          ? new Date(
                              partner.contract_expiry_date,
                            ).toLocaleDateString()
                          : "No Expiry Set"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* --- CARD 2: PROFILE & DOCUMENTS --- */}
              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col transition-colors overflow-hidden">
                <div className="flex items-center px-4 py-3 bg-secondary/30 border-b border-border gap-2 shrink-0">
                  <User className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                    Applicant Profile & KYC
                  </span>
                </div>

                <div className="p-4 space-y-5">
                  {/* User Profile */}
                  <div>
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      Identity
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-secondary/40 border border-border rounded-lg p-2.5 col-span-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
                          Representative Name
                        </p>
                        <p className="text-[11px] font-bold text-foreground uppercase">
                          {user.first_name
                            ? `${user.first_name} ${user.last_name}`
                            : "N/A"}
                        </p>
                      </div>
                      <div className="bg-secondary/40 border border-border rounded-lg p-2.5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> Phone
                        </p>
                        <p className="text-[11px] font-mono font-medium text-foreground truncate">
                          {user.phone_number || "N/A"}
                        </p>
                      </div>
                      <div className="bg-secondary/40 border border-border rounded-lg p-2.5">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <Mail className="w-3 h-3" /> Email
                        </p>
                        <p className="text-[11px] font-mono font-medium text-foreground truncate">
                          {user.email || "N/A"}
                        </p>
                      </div>
                      <div className="bg-secondary/40 border border-border rounded-lg p-2.5 col-span-2">
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
                          <ShieldCheck className="w-3 h-3" /> Trust Score
                        </p>
                        <p className="text-[11px] font-bold font-mono text-emerald-600 dark:text-emerald-400">
                          {user.trust_score
                            ? Number(user.trust_score).toFixed(1)
                            : "5.0"}{" "}
                          / 5.0
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* KYC Documents */}
                  <div className="pt-2 border-t border-border">
                    <h4 className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
                      KYC Documents
                    </h4>
                    {partner.documents && partner.documents.length > 0 ? (
                      <div className="space-y-2">
                        {partner.documents.map((doc: any) => {
                          const theme = getDocTheme(doc.status);
                          return (
                            <button
                              key={doc.document_id}
                              onClick={() => handleOpenReview(doc)}
                              className={cn(
                                "w-full flex items-center justify-between p-3 rounded-lg border transition-all text-left group",
                                theme.container,
                              )}
                            >
                              <div className="flex items-center gap-2.5">
                                <FileBadge
                                  className={cn("w-4 h-4 shrink-0", theme.icon)}
                                />
                                <div className="flex flex-col">
                                  <span className="text-[10px] font-bold uppercase tracking-widest leading-none mb-1">
                                    {doc.category === "license_id"
                                      ? "Driver's License"
                                      : "Secondary ID"}
                                  </span>
                                  <span className="text-[8px] font-medium uppercase tracking-widest opacity-80 leading-none flex items-center gap-1 group-hover:underline">
                                    Click to Review{" "}
                                    <ChevronRight className="w-2 h-2" />
                                  </span>
                                </div>
                              </div>
                              <Badge
                                className={cn(
                                  "text-[9px] font-bold uppercase tracking-widest px-2 h-6 rounded-md",
                                  theme.badge,
                                )}
                              >
                                {doc.status}
                              </Badge>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="p-4 border border-dashed border-border rounded-lg text-center bg-secondary/20">
                        <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                          No Documents Uploaded
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- STICKY FOOTER ACTIONS --- */}
          <div className="bg-card border-t border-border p-4 shrink-0 z-10 shadow-[0_-4px_12px_hsl(var(--shadow)/0.03)] transition-colors">
            <div className="max-w-6xl mx-auto w-full">
              {/* Default Action State */}
              {actionMode === null && (
                <div className="flex justify-end gap-3 w-full">
                  <Button
                    variant="outline"
                    className="w-[140px] h-9 text-[10px] font-bold uppercase tracking-widest border-destructive/30 text-destructive bg-card hover:bg-destructive/10 rounded shadow-none transition-colors"
                    onClick={() => setActionMode("reject")}
                  >
                    <XCircle className="w-3.5 h-3.5 mr-1.5" /> Reject
                  </Button>
                  <Button
                    className="w-[180px] h-9 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm transition-colors"
                    onClick={() => setActionMode("approve")}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                    Partner
                  </Button>
                </div>
              )}

              {/* Approve Confirmation State */}
              {actionMode === "approve" && (
                <div className="flex items-center justify-between w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <div>
                      <p className="text-[11px] font-bold text-foreground uppercase tracking-widest leading-none mb-0.5">
                        Confirm Approval
                      </p>
                      <p className="text-[9px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                        This grants full fleet access.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary rounded shadow-none"
                      onClick={() => setActionMode(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="h-9 px-6 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded shadow-sm transition-colors"
                      onClick={() =>
                        onApprove({
                          carOwnerId: partner.car_owner_id,
                          userId: partner.user_id,
                        })
                      }
                    >
                      Confirm
                    </Button>
                  </div>
                </div>
              )}

              {/* Reject Input State */}
              {actionMode === "reject" && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="flex-1 w-full relative">
                    <AlertCircle className="w-3.5 h-3.5 text-destructive absolute left-2.5 top-1/2 -translate-y-1/2" />
                    <Input
                      placeholder="Provide a reason for rejection..."
                      className="h-9 pl-8 text-[11px] bg-background border-destructive/30 focus-visible:ring-1 focus-visible:ring-destructive rounded shadow-sm font-medium transition-colors text-foreground w-full"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2 w-full sm:w-auto shrink-0 justify-end">
                    <Button
                      variant="ghost"
                      className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary rounded shadow-none"
                      onClick={() => setActionMode(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="h-9 px-6 text-[10px] font-bold uppercase tracking-widest bg-destructive hover:opacity-90 text-destructive-foreground rounded shadow-sm transition-opacity"
                      disabled={!isRejectValid}
                      onClick={() =>
                        onReject({
                          carOwnerId: partner.car_owner_id,
                          userId: partner.user_id,
                          reason: rejectReason,
                        })
                      }
                    >
                      Send Rejection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* --- MOUNT THE KYC REVIEW MODAL EXTERNALLY --- */}
      <ReviewModal
        isOpen={!!reviewDoc}
        onClose={() => setReviewDoc(null)}
        document={reviewDoc}
        onVerify={onVerifyDocument || (() => {})}
        onReject={onRejectDocument || (() => {})}
      />
    </>
  );
}
