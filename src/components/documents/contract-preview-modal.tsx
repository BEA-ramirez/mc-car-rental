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
import {
  X,
  Download,
  FileSignature,
  Printer,
  PenTool,
  Eraser,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import SignatureCanvas from "react-signature-canvas";
import Image from "next/image";

export type ContractPreview = {
  id: string; // Booking Ref
  customerName: string;
  vehicle: string;
  rentalDates: string;
  status: "SIGNED" | "UNSIGNED";
  signedAt?: string;
  htmlContent?: string; // NEW: The raw HTML from the database
  signatureUrl?: string; // NEW: The saved signature image
};

type ContractPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractPreview | null;
  onDownload?: (id: string) => void;
  onSign?: (id: string, signatureDataUrl: string) => void; // NEW: Action to save signature
};

export default function ContractPreviewModal({
  isOpen,
  onClose,
  contract,
  onDownload,
  onSign,
}: ContractPreviewModalProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [isSigning, setIsSigning] = useState(false);

  if (!contract) return null;

  const isSigned = contract.status === "SIGNED";

  const handleClearSignature = () => {
    sigCanvas.current?.clear();
  };

  const handleSaveSignature = () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Please provide a signature before saving.");
      return;
    }

    setIsSigning(true);
    // Gets the signature as a transparent PNG data URL
    const dataUrl = sigCanvas.current
      ?.getTrimmedCanvas()
      .toDataURL("image/png");

    if (onSign && dataUrl) {
      onSign(contract.id, dataUrl);
    }
    setIsSigning(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[80vw] xl:max-w-[1000px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[85vh] max-h-[850px] transition-colors duration-300 [&>button.absolute]:hidden">
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

        {/* --- BODY (PDF VIEWER STYLE) --- */}
        <ScrollArea className="flex-1 h-full p-4 sm:p-6 bg-secondary/30 custom-scrollbar">
          {/* THE PAPER DOCUMENT - Locked to white background with black text */}
          <div className="w-full max-w-[700px] mx-auto bg-white shadow-sm border border-border p-6 sm:p-10 min-h-[800px] flex flex-col rounded-xl relative">
            {/* If we have the dynamic HTML, render it! */}
            {contract.htmlContent ? (
              <div
                // Removed dark:prose-invert, locked text to black
                className="prose prose-sm max-w-none prose-p:leading-relaxed prose-headings:text-black text-black"
                dangerouslySetInnerHTML={{ __html: contract.htmlContent }}
              />
            ) : (
              /* Fallback for old contracts without HTML */
              <div className="text-center py-20 text-zinc-500 font-medium text-xs">
                Legacy contract data not available for rendering.
              </div>
            )}

            {/* Overlaid Signature Image (if already signed) */}
            {isSigned && contract.signatureUrl && (
              <div className="absolute bottom-[80px] left-[10%] w-[40%] flex justify-center items-end h-24 pointer-events-none">
                <Image
                  src={contract.signatureUrl}
                  alt="Customer Signature"
                  // Removed dark:invert so the signature stays dark on the white paper
                  className="max-h-full object-contain drop-shadow-sm opacity-90"
                />
                <span className="absolute -bottom-5 bg-white px-2 text-[9px] font-bold text-emerald-700 uppercase tracking-widest border border-emerald-500/20 rounded">
                  Verified: {contract.signedAt}
                </span>
              </div>
            )}
          </div>

          {/* THE SIGNATURE EXECUTION PANEL (Remains theme-adaptable) */}
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

                {/* Canvas Container */}
                <div className="bg-card border-2 border-dashed border-border rounded-lg relative shadow-sm touch-none transition-colors">
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      className: "w-full h-[160px] cursor-crosshair",
                    }}
                    backgroundColor="transparent"
                    penColor="currentColor" // Adapts to light/dark text color via CSS
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

          {/* Bottom spacing so the modal doesn't cut off the signature box */}
          <div className="h-8" />
        </ScrollArea>

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
            onClick={() => onDownload && onDownload(contract.id)}
            disabled={!isSigned}
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {isSigned ? "Download PDF" : "PDF Unavailable"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
