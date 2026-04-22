"use client";

import { useState, useEffect } from "react";
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
import Image from "next/image";
import { cn } from "@/lib/utils";

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
      <DialogContent className="max-w-[90vw] xl:max-w-[1100px] p-0 overflow-hidden border-border shadow-2xl rounded-2xl flex flex-col h-[85vh] [&>button.absolute]:hidden bg-background transition-colors duration-300">
        {/* HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm transition-colors">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                Driver Application Review
              </DialogTitle>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none font-mono">
                App ID: {doc.id.split("-")[0]} • Submitted {doc.appliedAt}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[9px] font-bold bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400 uppercase tracking-widest rounded-lg h-7 px-2.5 shadow-none transition-colors"
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
          <div className="flex-[3] lg:flex-[5] bg-black relative flex flex-col border-r border-border min-w-0 transition-colors">
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
                  <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> Full Screen
                </a>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-6 overflow-hidden relative">
              <div className="w-full h-full flex items-center justify-center relative">
                {/* Grid Background pattern */}
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff_100%),linear-gradient(45deg,#fff_25%,transparent_25%,transparent_75%,#fff_75%,#fff_100%)] bg-[length:20px_20px] bg-[position:0_0,10px_10px]" />

                {currentImageUrl ? (
                  <Image
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
          <div className="w-full lg:w-[360px] bg-background flex flex-col shrink-0 min-w-0 transition-colors">
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
              {/* Applicant Profile Box */}
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
                      <div className="text-[11px] font-mono text-foreground font-medium">
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
                    <div className="text-[11px] font-mono text-foreground font-medium truncate">
                      {doc.customerEmail}
                    </div>
                  </div>
                </div>
              </div>

              {/* ACTION: VERIFY */}
              {actionMode === "verify" && (
                <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm flex flex-col items-center justify-center text-center space-y-3 py-6 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-1">
                    <CheckCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
                    Approve Driver
                  </h3>
                  <p className="text-[9px] text-emerald-600/90 dark:text-emerald-400/90 font-bold uppercase tracking-widest leading-relaxed">
                    By confirming, you verify that the provided documents are
                    authentic and valid.
                  </p>
                </div>
              )}

              {/* ACTION: REJECT */}
              {actionMode === "reject" && (
                <div className="bg-destructive/5 border border-destructive/20 p-4 rounded-xl animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-sm space-y-4 transition-colors">
                  <div>
                    <label className="text-[9px] font-bold text-destructive uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                      <AlertCircle className="w-3 h-3" /> Feedback Message{" "}
                      <span className="text-destructive">*</span>
                    </label>
                    <Input
                      placeholder="e.g. Image is blurry, please re-upload..."
                      className="h-8 text-[11px] font-medium bg-background border-destructive/30 focus-visible:ring-1 focus-visible:ring-destructive rounded-lg shadow-none transition-colors text-foreground"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                    />
                    <p className="text-[9px] text-destructive/80 font-bold mt-2 uppercase tracking-widest leading-relaxed">
                      This feedback will be emailed directly to the applicant.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Action Footer */}
            <div className="bg-card border-t border-border p-4 shrink-0 flex flex-col gap-2.5 z-10 shadow-[0_-4px_12px_hsl(var(--shadow)/0.03)] transition-colors">
              {actionMode === null ? (
                <div className="flex gap-2.5">
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
                    <CheckCircle className="w-3.5 h-3.5 mr-1.5" /> Approve
                    Driver
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2.5">
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
                      onClick={() => onVerify(doc.id)}
                    >
                      Confirm Approval
                    </Button>
                  ) : (
                    <Button
                      className="flex-1 h-8 text-[10px] font-bold uppercase tracking-widest bg-destructive hover:opacity-90 text-destructive-foreground rounded-lg shadow-sm transition-opacity"
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
