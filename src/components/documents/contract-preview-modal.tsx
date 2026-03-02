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
      <DialogContent className="max-w-[80vw] xl:max-w-[1000px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col h-[85vh] max-h-[850px] [&>button.absolute]:hidden bg-slate-200/50">
        {/* --- HEADER --- */}
        <DialogHeader className="px-5 py-4 border-b border-slate-200 bg-white shrink-0 flex flex-row items-center justify-between z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
              <FileSignature className="w-4 h-4 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Rental Agreement Preview
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                Ref: {contract.id} • {contract.customerName}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest rounded-sm h-7 px-3 border shadow-sm",
                isSigned
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-amber-50 text-amber-700 border-amber-200",
              )}
            >
              {isSigned ? "Signed & Executed" : "Pending Signature"}
            </Badge>
            <div className="w-px h-6 bg-slate-200 mx-1" />
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

        {/* --- BODY (PDF VIEWER STYLE) --- */}
        <ScrollArea className="flex-1 h-full p-4 sm:p-8">
          {/* THE PAPER DOCUMENT */}
          <div className="w-full max-w-[700px] mx-auto bg-white shadow-md border border-slate-200 p-8 sm:p-12 min-h-[800px] flex flex-col rounded-sm relative">
            {/* If we have the dynamic HTML, render it! */}
            {contract.htmlContent ? (
              <div
                className="prose prose-sm prose-slate max-w-none prose-p:leading-relaxed prose-headings:text-slate-900"
                dangerouslySetInnerHTML={{ __html: contract.htmlContent }}
              />
            ) : (
              /* Fallback for old contracts without HTML */
              <div className="text-center py-20 text-slate-400 font-medium text-sm">
                Legacy contract data not available for rendering.
              </div>
            )}

            {/* Overlaid Signature Image (if already signed) */}
            {isSigned && contract.signatureUrl && (
              <div className="absolute bottom-[100px] left-[10%] w-[40%] flex justify-center items-end h-24 pointer-events-none">
                <img
                  src={contract.signatureUrl}
                  alt="Customer Signature"
                  className="max-h-full object-contain drop-shadow-sm opacity-90 mix-blend-multiply"
                />
                <span className="absolute -bottom-6 bg-white px-2 text-[9px] font-bold text-emerald-600 uppercase tracking-widest">
                  Verified: {contract.signedAt}
                </span>
              </div>
            )}
          </div>

          {/* THE SIGNATURE EXECUTION PANEL */}
          {!isSigned && (
            <div className="w-full max-w-[700px] mx-auto mt-6 bg-white border border-slate-300 rounded-sm shadow-sm overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-500">
              <div className="bg-slate-900 px-5 py-3 flex items-center gap-2">
                <PenTool className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-widest">
                  Digital Signature Required
                </h3>
              </div>

              <div className="p-6 bg-slate-50">
                <p className="text-[11px] font-medium text-slate-500 mb-3 uppercase tracking-widest text-center">
                  Please draw your signature below
                </p>

                {/* Canvas Container */}
                <div className="bg-white border-2 border-dashed border-slate-300 rounded-sm relative shadow-inner touch-none">
                  <SignatureCanvas
                    ref={sigCanvas}
                    canvasProps={{
                      className: "w-full h-[200px] cursor-crosshair",
                    }}
                    backgroundColor="rgba(0,0,0,0)"
                    penColor="#0f172a" // Deep slate color for realistic ink
                  />
                </div>

                <div className="mt-4 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[10px] font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-sm uppercase tracking-wider"
                    onClick={handleClearSignature}
                  >
                    <Eraser className="w-3.5 h-3.5 mr-1.5" /> Clear Pad
                  </Button>

                  <Button
                    size="sm"
                    className="h-9 px-6 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-sm"
                    onClick={handleSaveSignature}
                    disabled={isSigning}
                  >
                    <Check className="w-4 h-4 mr-1.5" />
                    {isSigning ? "Executing..." : "Execute Agreement"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bottom spacing so the modal doesn't cut off the signature box */}
          <div className="h-12" />
        </ScrollArea>

        {/* --- FOOTER ACTIONS --- */}
        <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex justify-end gap-2 z-10">
          <Button
            variant="ghost"
            className="h-9 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={onClose}
          >
            Close
          </Button>
          <Button
            variant="outline"
            className="h-9 px-4 text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm shadow-sm"
            onClick={() => window.print()}
          >
            <Printer className="w-3.5 h-3.5 mr-2" /> Print
          </Button>
          <Button
            className="h-9 px-4 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-sm shadow-sm"
            onClick={() => onDownload && onDownload(contract.id)}
            disabled={!isSigned}
          >
            <Download className="w-3.5 h-3.5 mr-2" />
            {isSigned ? "Download PDF" : "PDF Unavailable"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
