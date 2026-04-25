"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  User,
  ShieldCheck,
  Phone,
  Mail,
  X,
  FileText,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReviewModal, { ReviewDocument } from "../documents/review-modal";

export type DriverReviewDocument = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  trustScore: number;
  appliedAt: string;
  licenseUrl: string;
  licenseStatus: string;
  validIdUrl: string;
  validIdStatus: string;
};

type DriverReviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  document: DriverReviewDocument | null;
  onVerify: (id: string, expiryDate?: Date) => void;
  onReject: (id: string, reason: string) => void;
};

export default function DriverReviewModal({
  isOpen,
  onClose,
  document: doc,
  onVerify,
  onReject,
}: DriverReviewModalProps) {
  const [selectedDoc, setSelectedDoc] = useState<ReviewDocument | null>(null);

  if (!doc) return null;

  // Helper to determine badge colors based on status
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "verified":
      case "approved":
        return "bg-emerald-500/10 text-emerald-600 border-emerald-500/20";
      case "rejected":
        return "bg-destructive/10 text-destructive border-destructive/20";
      default:
        return "bg-amber-500/10 text-amber-600 border-amber-500/20";
    }
  };

  // Helper to open the KYC Review Modal for a specific document
  const handleOpenDocReview = (type: "Driver's License" | "Secondary ID") => {
    const isLicense = type === "Driver's License";
    setSelectedDoc({
      id: doc.id,
      customerName: doc.customerName,
      customerEmail: doc.customerEmail,
      customerPhone: doc.customerPhone,
      trustScore: doc.trustScore,
      type: type,
      uploadedAt: doc.appliedAt,
      imageUrl: isLicense ? doc.licenseUrl : doc.validIdUrl,
      status: isLicense ? doc.licenseStatus : doc.validIdStatus,
    });
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md p-0 overflow-hidden border-border shadow-2xl rounded-2xl bg-background transition-colors duration-300">
          <DialogHeader className="px-5 py-4 border-b border-border bg-card flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-primary" />
              <DialogTitle className="text-sm font-bold uppercase tracking-tight">
                Driver Profile Review
              </DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={onClose}
            >
              <X className="w-4 h-4" />
            </Button>
          </DialogHeader>

          <div className="p-6 space-y-6">
            {/* PROFILE INFO */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center border border-border">
                  <User className="w-6 h-6 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-foreground">
                    {doc.customerName}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[10px] font-mono mt-1"
                  >
                    ID: {doc.id.split("-")[0]}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 pt-2">
                <div className="flex items-center gap-3 text-xs">
                  <Mail className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {doc.customerEmail}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {doc.customerPhone}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span className="font-bold">
                    Trust Score: {doc.trustScore.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* DOCUMENT LIST */}
            <div className="space-y-3">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <FileText className="w-3.5 h-3.5" /> Required Documents
              </h4>

              <div className="flex flex-col gap-2">
                {/* License Badge */}
                <button
                  onClick={() => handleOpenDocReview("Driver's License")}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-secondary transition-all group text-left"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">
                      Driver's License
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                      Click to Review
                    </span>
                  </div>
                  <Badge
                    className={cn(
                      "text-[9px] uppercase font-bold",
                      getStatusColor(doc.licenseStatus),
                    )}
                  >
                    {doc.licenseStatus}
                  </Badge>
                </button>

                {/* Valid ID Badge */}
                <button
                  onClick={() => handleOpenDocReview("Secondary ID")}
                  className="flex items-center justify-between p-3 rounded-xl border border-border bg-card hover:bg-secondary transition-all group text-left"
                >
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold">
                      Secondary ID (Valid ID)
                    </span>
                    <span className="text-[9px] text-muted-foreground uppercase tracking-widest">
                      Click to Review
                    </span>
                  </div>
                  <Badge
                    className={cn(
                      "text-[9px] uppercase font-bold",
                      getStatusColor(doc.validIdStatus),
                    )}
                  >
                    {doc.validIdStatus}
                  </Badge>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <ReviewModal
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        document={selectedDoc}
        onVerify={onVerify}
        onReject={onReject}
      />
    </>
  );
}
