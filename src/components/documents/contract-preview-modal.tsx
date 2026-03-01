"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, FileSignature, CheckCircle, Printer } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

export type ContractPreview = {
  id: string; // Booking Ref
  customerName: string;
  vehicle: string;
  rentalDates: string;
  status: "SIGNED" | "UNSIGNED";
  signedAt?: string;
};

type ContractPreviewModalProps = {
  isOpen: boolean;
  onClose: () => void;
  contract: ContractPreview | null;
  onDownload?: (id: string) => void;
};

export default function ContractPreviewModal({
  isOpen,
  onClose,
  contract,
  onDownload,
}: ContractPreviewModalProps) {
  if (!contract) return null;

  const isSigned = contract.status === "SIGNED";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* 4xl is the perfect width for a portrait document preview */}
      <DialogContent className="max-w-4xl p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col h-[85vh] max-h-[850px] [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between z-10 shadow-sm">
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
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold uppercase tracking-widest rounded-sm h-7 px-3 border",
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

        {/* BODY (PDF VIEWER STYLE) */}
        <div className="flex flex-1 overflow-hidden bg-slate-200/50">
          <ScrollArea className="flex-1 h-full p-4 sm:p-8">
            {/* The "Paper" Document */}
            <div className="w-full max-w-[700px] mx-auto bg-white shadow-md border border-slate-200 p-8 sm:p-12 min-h-[800px] flex flex-col rounded-sm">
              {/* Document Header */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-6">
                <div>
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    Rental Agreement
                  </h1>
                  <p className="text-xs font-bold text-slate-500 mt-1 uppercase tracking-widest">
                    Ref: {contract.id}
                  </p>
                </div>
                <div className="text-right">
                  <h2 className="text-sm font-bold text-slate-800">
                    Your Car Rental Company
                  </h2>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Ormoc City, Leyte, Philippines
                  </p>
                  <p className="text-[10px] text-slate-500">
                    contact@rentalcompany.com
                  </p>
                </div>
              </div>

              {/* Document Details Grid */}
              <div className="grid grid-cols-2 gap-6 mb-8 bg-slate-50 p-4 border border-slate-100 rounded-sm">
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Renter Name
                  </span>
                  <span className="block text-sm font-bold text-slate-800">
                    {contract.customerName}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Vehicle Details
                  </span>
                  <span className="block text-sm font-bold text-slate-800">
                    {contract.vehicle}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Rental Period
                  </span>
                  <span className="block text-sm font-bold text-slate-800">
                    {contract.rentalDates}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                    Agreement Date
                  </span>
                  <span className="block text-sm font-bold text-slate-800">
                    October 14, 2025
                  </span>
                </div>
              </div>

              {/* Terms and Conditions (Mock Text) */}
              <div className="flex-1 space-y-4 text-[11px] leading-relaxed text-slate-600 font-medium text-justify">
                <p>
                  <strong>1. ACCEPTANCE OF TERMS:</strong> By signing this
                  agreement, the Renter acknowledges having received the vehicle
                  described above in good condition and agrees to return it in
                  the same condition, subject to normal wear and tear, on the
                  return date specified.
                </p>
                <p>
                  <strong>2. USE OF VEHICLE:</strong> The vehicle shall not be
                  used to carry passengers or property for hire, to tow or push
                  anything, to be operated in a test, race, or contest, or while
                  the Renter is under the influence of alcohol or narcotics.
                </p>
                <p>
                  <strong>3. LIABILITY:</strong> The Renter assumes full
                  responsibility for any damage to the vehicle, loss of the
                  vehicle, and any third-party claims arising from the use of
                  the vehicle during the rental period.
                </p>
                <p>
                  <strong>4. LATE RETURN:</strong> A penalty fee applies if the
                  vehicle is not returned at the agreed date and time. Any
                  extension must be requested and approved in writing prior to
                  the expiration of the current rental period.
                </p>
                <div className="h-20" /> {/* Spacer */}
              </div>

              {/* Signature Block */}
              <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-2 gap-12">
                {/* Company Signature */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Authorized Representative
                  </span>
                  <div className="h-12 border-b border-slate-300 mb-2 flex items-end pb-1">
                    <span className="font-serif text-lg text-slate-800 italic">
                      Management Signature
                    </span>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500">
                    Date: Oct 14, 2025
                  </span>
                </div>

                {/* Customer Signature */}
                <div>
                  <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4">
                    Renter Signature
                  </span>
                  {isSigned ? (
                    <div className="relative">
                      {/* Simulating a digital signature */}
                      <div className="absolute -top-4 left-2 rotate-[-5deg] text-blue-800 font-serif text-3xl italic opacity-80">
                        {contract.customerName}
                      </div>
                      <div className="h-12 border-b border-slate-300 mb-2 flex items-end pb-1 relative z-10">
                        {/* Empty to let the absolute sig float above */}
                      </div>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
                        <CheckCircle className="w-3 h-3" /> Digitally Signed (
                        {contract.signedAt})
                      </span>
                    </div>
                  ) : (
                    <div>
                      <div className="h-12 border-b border-dashed border-slate-300 mb-2 flex items-center justify-center bg-slate-50">
                        <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                          Awaiting Signature
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-400">
                        Date: ---
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* FOOTER */}
        <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex justify-end gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] z-10">
          <Button
            variant="ghost"
            className="h-9 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={onClose}
          >
            Close Preview
          </Button>
          <Button
            variant="outline"
            className="h-9 px-4 text-xs font-bold border-slate-300 text-slate-700 hover:bg-slate-50 rounded-sm shadow-sm"
            onClick={() => console.log("Printing...")}
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
