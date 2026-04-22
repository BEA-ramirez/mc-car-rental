"use client";

import React, { useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  X,
  Download,
  FileSignature,
  Printer,
  PenTool,
  Eraser,
  Check,
  Pencil,
  Save,
} from "lucide-react";
import { cn } from "@/lib/utils";
import SignatureCanvas from "react-signature-canvas";
import { toast } from "sonner";

export type ContractPreview = {
  id: string; // Booking Ref
  customerName: string;
  vehicle: string;
  rentalDates: string;
  status: "SIGNED" | "UNSIGNED";
  signedAt?: string;
  htmlContent?: string;
  signatureUrl?: string;
};

type ContractPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractPreview | null;
  onSign?: (id: string, signatureDataUrl: string) => void;
  // NEW: Prop to handle server-side updates
  onUpdateFields?: (
    id: string,
    destination: string,
    fuelLevel: string,
  ) => Promise<void>;
  isUpdatingContract?: boolean;
};

export default function ContractPreviewModal({
  isOpen,
  onClose,
  contract,
  onSign,
  onUpdateFields,
  isUpdatingContract = false,
}: ContractPreviewModalProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSigning, setIsSigning] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // --- Edit Mode State ---
  const [isEditing, setIsEditing] = useState(false);
  const [editDestination, setEditDestination] = useState("");
  const [editFuelLevel, setEditFuelLevel] = useState("");

  if (!contract) return null;

  const isSigned = contract.status === "SIGNED";

  const handleClearSignature = () => sigCanvas.current?.clear();

  const handleSaveSignature = () => {
    if (sigCanvas.current?.isEmpty()) {
      toast.error("Please provide a signature before saving.");
      return;
    }
    setIsSigning(true);
    const dataUrl = sigCanvas.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");
    if (onSign && dataUrl) onSign(contract.id, dataUrl);
    setIsSigning(false);
  };

  // --- Apply Edits via Server Action ---
  const handleApplyEdits = async () => {
    if (!onUpdateFields) return;
    try {
      await onUpdateFields(contract.id, editDestination, editFuelLevel);
      setIsEditing(false);
      setEditDestination("");
      setEditFuelLevel("");
    } catch (error) {
      console.error("Failed to update fields:", error);
    }
  };

  const handleDownloadPDF = () => {
    setIsDownloading(true);
    const toastId = toast.loading("Preparing document...");
    try {
      const element = document.getElementById("pdf-contract-container");
      if (!element) throw new Error("Document container not found");

      const iframe = document.createElement("iframe");
      iframe.style.display = "none";
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document;
      if (!iframeDoc) throw new Error("Could not access iframe window");

      iframeDoc.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Rental_Agreement_${contract.id}</title>
            <style>
              @page { margin: 0.5in; size: letter portrait; }
              body { 
                margin: 0; padding: 0; background: white; 
                -webkit-print-color-adjust: exact; print-color-adjust: exact;
                font-family: Arial, sans-serif;
              }
              .pdf-wrapper {
                position: relative; width: 100%; max-width: 800px; margin: 0 auto;
              }
            </style>
          </head>
          <body>
            <div class="pdf-wrapper">
              ${element.innerHTML}
            </div>
          </body>
        </html>
      `);

      iframeDoc.close();
      iframe.contentWindow?.focus();

      setTimeout(() => {
        iframe.contentWindow?.print();
        document.body.removeChild(iframe);
        toast.success("Document ready!", { id: toastId });
        setIsDownloading(false);
      }, 400);
    } catch (error) {
      console.error("PDF Generation failed:", error);
      toast.error("Failed to prepare document.", { id: toastId });
      setIsDownloading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] gap-0 xl:max-w-[1000px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[85vh] max-h-[900px] transition-colors duration-300 [&>button.absolute]:hidden">
        {/* --- HEADER --- */}
        <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between z-10 shadow-sm transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shadow-sm border border-primary/20">
              <FileSignature className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                Rental Agreement Preview
              </DialogTitle>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                Ref: {contract.id} • {contract.customerName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest rounded h-6 px-2 border shadow-sm",
                isSigned
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                  : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
              )}
            >
              {isSigned ? "Signed & Executed" : "Pending Signature"}
            </Badge>

            {/* Quick Edit Button (Only visible if unsigned) */}
            {!isSigned && (
              <>
                <div className="w-px h-6 bg-border mx-1" />
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest text-primary border-primary/30 hover:bg-primary/10 transition-colors"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  <Pencil className="w-3.5 h-3.5 mr-1.5" />
                  {isEditing ? "Cancel Edit" : "Quick Edit"}
                </Button>
              </>
            )}

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

        {/* --- BODY --- */}
        <div className="flex-1 overflow-y-auto min-h-0 p-4 sm:p-6 bg-secondary/30 custom-scrollbar relative">
          {/* Quick Edit Panel Slide-down */}
          {isEditing && !isSigned && (
            <div className="w-full max-w-[700px] mx-auto mb-4 bg-card border border-primary/30 rounded-xl shadow-md overflow-hidden animate-in slide-in-from-top-4 fade-in duration-300">
              <div className="bg-primary/5 px-4 py-2.5 flex items-center gap-2 border-b border-primary/10">
                <Pencil className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                  Quick Edit Variables
                </h3>
              </div>
              <div className="p-4 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Update Destination
                  </label>
                  <Input
                    placeholder="e.g. Cebu City"
                    value={editDestination}
                    onChange={(e) => setEditDestination(e.target.value)}
                    className="h-8 text-[11px] font-medium"
                  />
                </div>
                <div>
                  <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5 block">
                    Update Fuel Level
                  </label>
                  <Input
                    placeholder="e.g. Half Tank"
                    value={editFuelLevel}
                    onChange={(e) => setEditFuelLevel(e.target.value)}
                    className="h-8 text-[11px] font-medium"
                  />
                </div>
              </div>
              <div className="bg-secondary/30 px-4 py-3 border-t border-border flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-[10px] font-bold uppercase tracking-widest"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90"
                  onClick={handleApplyEdits}
                  disabled={
                    isUpdatingContract || (!editDestination && !editFuelLevel)
                  }
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  {isUpdatingContract ? "Saving..." : "Apply & Save"}
                </Button>
              </div>
            </div>
          )}

          {/* THE PDF DOCUMENT */}
          <div
            id="pdf-contract-container"
            className="w-full max-w-[700px] mx-auto bg-white shadow-sm border border-border p-8 sm:p-12 min-h-[800px] flex flex-col rounded-xl relative"
          >
            {contract.htmlContent ? (
              <div
                className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-black text-black"
                dangerouslySetInnerHTML={{ __html: contract.htmlContent }}
              />
            ) : (
              <div className="text-center py-20 text-zinc-500 font-medium text-xs">
                Contract data not available.
              </div>
            )}

            {isSigned && contract.signatureUrl && (
              <div
                style={{
                  position: "absolute",
                  bottom: "160px",
                  right: "16px",
                  width: "45%",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  alignItems: "center",
                  height: "112px",
                  pointerEvents: "none",
                  zIndex: 10,
                }}
              >
                <img
                  src={contract.signatureUrl}
                  alt="Customer Signature"
                  style={{
                    maxHeight: "100%",
                    objectFit: "contain",
                    opacity: 0.95,
                    marginBottom: "-8px",
                  }}
                />
                <span
                  style={{
                    backgroundColor: "white",
                    padding: "2px 8px",
                    fontSize: "8px",
                    fontWeight: "bold",
                    color: "#047857",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    border: "1px solid rgba(16, 185, 129, 0.2)",
                    borderRadius: "4px",
                    boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                  }}
                >
                  Verified: {contract.signedAt}
                </span>
              </div>
            )}
          </div>

          {/* THE SIGNATURE EXECUTION PANEL */}
          {!isSigned && (
            <div className="w-full max-w-[700px] mx-auto mt-6 bg-card border border-border rounded-xl shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500 transition-colors">
              <div className="bg-secondary/50 px-4 py-2.5 flex items-center gap-2 border-b border-border transition-colors">
                <PenTool className="w-3.5 h-3.5 text-primary" />
                <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                  Digital Signature Required
                </h3>
              </div>

              <div className="p-5 bg-background transition-colors">
                <p className="text-[9px] font-bold text-muted-foreground mb-2.5 uppercase tracking-widest text-center">
                  Please draw your signature below
                </p>

                <div className="bg-card border-2 border-dashed border-border rounded-lg relative shadow-sm touch-none transition-colors">
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      className: "w-full h-[160px] cursor-crosshair",
                    }}
                    backgroundColor="transparent"
                    penColor="currentColor"
                  />
                </div>

                <div className="mt-3 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[9px] font-bold text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg uppercase tracking-widest transition-colors"
                    onClick={handleClearSignature}
                  >
                    <Eraser className="w-3 h-3 mr-1.5" /> Clear Pad
                  </Button>

                  <Button
                    size="sm"
                    className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
                    onClick={handleSaveSignature}
                    disabled={isSigning}
                  >
                    <Check className="w-3.5 h-3.5 mr-1.5" />
                    {isSigning ? "Executing..." : "Execute Agreement"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="h-8" />
        </div>

        {/* --- FOOTER ACTIONS --- */}
        <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end gap-2 z-10 transition-colors shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
          <Button
            variant="ghost"
            className="h-8 px-4 text-[10px] font-semibold text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="outline"
            className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest border-border text-foreground hover:bg-secondary rounded-lg shadow-none transition-colors"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />{" "}
            Print
          </Button>
          <Button
            className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
            onClick={handleDownloadPDF}
            disabled={isDownloading}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {isDownloading ? "Generating..." : "Download PDF"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
