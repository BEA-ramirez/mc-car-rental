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
} from "lucide-react";
import { toTitleCase } from "@/actions/helper/format-text";

type PartnerReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  partner: any | null; // Receives the raw joined car_owner + users object
  onApprove: (payload: { carOwnerId: string; userId: string }) => void;
  onReject: (payload: {
    carOwnerId: string;
    userId: string;
    reason: string;
  }) => void;
};

export default function PartnerReviewModal({
  isOpen,
  onClose,
  partner,
  onApprove,
  onReject,
}: PartnerReviewModalProps) {
  const [rejectReason, setRejectReason] = useState("");
  const [actionMode, setActionMode] = useState<"approve" | "reject" | null>(
    null,
  );

  useEffect(() => {
    if (isOpen) {
      setRejectReason("");
      setActionMode(null);
    }
  }, [isOpen]);

  if (!partner) return null;

  const user = partner.users || {};
  // const displayName =
  //   partner.business_name ||
  //   `${user.first_name || ""} ${user.last_name || ""}`.trim();
  const isRejectValid = rejectReason.trim() !== "";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] xl:max-w-[950px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col h-[80vh] [&>button.absolute]:hidden bg-white">
        {/* --- HEADER --- */}
        <DialogHeader className="px-5 py-3 border-b border-slate-200 bg-[#F8FAFC] shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-[#0F172A] flex items-center justify-center border border-slate-800 shadow-sm">
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-[#0F172A] tracking-tight leading-none mb-1">
                Fleet Partner Application
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                App ID: {partner.car_owner_id.split("-")[0].toUpperCase()} •
                Submitted{" "}
                {new Date(partner.created_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
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

        {/* --- SPLIT BODY --- */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* --- LEFT: BUSINESS & FINANCIAL DOSSIER --- */}
          <div className="flex-[5] flex flex-col min-w-0 border-r border-slate-200 bg-white">
            <div className="flex items-center px-6 py-3 bg-slate-50/50 border-b border-slate-100 gap-2 shrink-0">
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                Business & Financial Details
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
              {/* Business Overview */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Company Information
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-sm p-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Briefcase className="w-3 h-3" /> Registered Name
                    </p>
                    <p className="text-xs font-bold text-[#0F172A] truncate">
                      {toTitleCase(partner.business_name || "N/A")}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-sm p-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Percent className="w-3 h-3" /> Proposed Revenue Share
                    </p>
                    <p className="text-xs font-bold text-blue-600">
                      {partner.revenue_share_percentage ?? 70}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Financial Data */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Payout & Banking Configuration
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-sm p-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <Landmark className="w-3 h-3" /> Bank Name
                    </p>
                    <p className="text-xs font-bold text-[#0F172A]">
                      {partner.bank_name || "Not Provided"}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-sm p-3">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <User className="w-3 h-3" /> Account Holder
                    </p>
                    <p className="text-xs font-bold text-[#0F172A]">
                      {partner.bank_account_name || "Not Provided"}
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-sm p-3 md:col-span-2">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                      <CreditCard className="w-3 h-3" /> Account Number
                    </p>
                    <p className="text-xs font-mono font-bold text-[#0F172A]">
                      {partner.bank_account_number || "Not Provided"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Additional Meta */}
              <div>
                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">
                  Contract Status
                </h4>
                <div className="bg-slate-50 border border-slate-100 rounded-sm p-3 inline-block pr-12">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                    <CalendarDays className="w-3 h-3" /> Contract Expiry
                  </p>
                  <p className="text-xs font-bold text-[#0F172A]">
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

          {/* --- RIGHT: DATA & ACTIONS --- */}
          <div className="w-full lg:w-[360px] bg-[#F8FAFC] flex flex-col shrink-0 min-w-0">
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
                      Representative
                    </div>
                    <div className="text-sm font-bold text-[#0F172A]">
                      {user.first_name
                        ? `${user.first_name} ${user.last_name}`
                        : "N/A"}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> Phone
                      </div>
                      <div className="text-[11px] font-mono font-bold text-slate-700 bg-slate-50 p-1.5 border border-slate-100 rounded-sm">
                        {user.phone_number || "N/A"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Trust Score
                      </div>
                      <div className="text-[11px] font-bold font-mono text-emerald-600 bg-emerald-50 border border-emerald-100 p-1.5 rounded-sm">
                        {user.trust_score
                          ? Number(user.trust_score).toFixed(1)
                          : "5.0"}{" "}
                        / 5.0
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Email
                    </div>
                    <div className="text-[11px] font-mono font-bold text-slate-700 truncate bg-slate-50 p-1.5 border border-slate-100 rounded-sm">
                      {user.email || "N/A"}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION: VERIFY */}
              {actionMode === "approve" && (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-sm animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm flex flex-col items-center justify-center text-center space-y-3 py-6">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-bold text-emerald-900">
                    Approve Partner
                  </h3>
                  <p className="text-[10px] text-emerald-700 font-bold uppercase tracking-widest leading-relaxed">
                    By confirming, this applicant will gain full access to the
                    fleet owner dashboard and payout system.
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
                      placeholder="e.g. Invalid banking details provided..."
                      className="h-10 text-xs bg-white border-red-200 focus-visible:ring-red-500 rounded-sm shadow-none font-medium"
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
                    onClick={() => setActionMode("approve")}
                  >
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
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

                  {actionMode === "approve" ? (
                    <Button
                      className="flex-1 h-10 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-none transition-colors"
                      onClick={() =>
                        onApprove({
                          carOwnerId: partner.car_owner_id,
                          userId: partner.user_id,
                        })
                      }
                    >
                      Confirm Approval
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 h-10 text-[10px] font-bold uppercase tracking-widest bg-red-600 hover:bg-red-700 text-white rounded-sm shadow-none transition-colors"
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
