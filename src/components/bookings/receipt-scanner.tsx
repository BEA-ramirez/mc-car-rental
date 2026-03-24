"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import { UploadCloud, ScanLine, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface ReceiptScannerProps {
  // UPDATED: Now passes back the amount too!
  onScanComplete: (file: File, referenceNumber: string, amount: string) => void;
  expectedAmount: number; // We pass this in to compare!
}

export default function ReceiptScanner({
  onScanComplete,
  expectedAmount,
}: ReceiptScannerProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const [referenceNumber, setReferenceNumber] = useState("");
  const [scannedAmount, setScannedAmount] = useState("");

  // "partial" means it found one but not the other
  const [scanStatus, setScanStatus] = useState<
    "idle" | "success" | "partial" | "failed"
  >("idle");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    await scanReceipt(file);
  };

  const scanReceipt = async (file: File) => {
    setIsScanning(true);
    setScanStatus("idle");
    setScanProgress(0);

    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setScanProgress(Math.round(m.progress * 100));
          }
        },
      });

      const rawText = result.data.text;
      console.log("Raw OCR Text extracted:", rawText);

      // 1. Hunt for Reference Number (13 digits)
      const refRegex =
        /(?:ref|reference)[.\s]*no[.\s]*[:\-]?\s*([0-9\s]{13,20})/i;
      const refMatch = rawText.match(refRegex);
      const cleanRef =
        refMatch && refMatch[1] ? refMatch[1].replace(/\s/g, "") : "";

      // 2. Hunt for Amount (e.g., PHP 12,500.00 or 12500.00)
      // Looks for "PHP", "Amount", or "Total" followed by numbers with optional commas and decimals
      const amountRegex =
        /(?:php|amount|total|p)[\s:.-]*p?h?p?[\s]*((?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2})/i;
      const amountMatch = rawText.match(amountRegex);
      const cleanAmount =
        amountMatch && amountMatch[1] ? amountMatch[1].replace(/,/g, "") : "";

      setReferenceNumber(cleanRef);
      setScannedAmount(cleanAmount);

      // Determine how successful the scan was
      if (cleanRef && cleanAmount) {
        setScanStatus("success");
        onScanComplete(file, cleanRef, cleanAmount);
      } else if (cleanRef || cleanAmount) {
        setScanStatus("partial");
        // Still pass what we found
        onScanComplete(file, cleanRef, cleanAmount);
      } else {
        setScanStatus("failed");
      }
    } catch (error) {
      console.error("OCR Scan failed:", error);
      setScanStatus("failed");
    } finally {
      setIsScanning(false);
    }
  };

  // Helper to check if scanned amount matches expected amount
  const isAmountMatching = Number(scannedAmount) === expectedAmount;

  return (
    <div className="bg-white border border-slate-200 rounded-sm p-6 shadow-sm max-w-md w-full">
      <h3 className="text-sm font-bold text-slate-900 mb-4">
        Upload Proof of Payment
      </h3>

      <div className="relative">
        <Input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleImageChange}
          disabled={isScanning}
        />
        <div
          className={cn(
            "border-2 border-dashed rounded-sm flex flex-col items-center justify-center p-8 transition-colors text-center",
            previewUrl
              ? "border-blue-200 bg-blue-50/50"
              : "border-slate-300 hover:bg-slate-50",
            isScanning && "opacity-50 pointer-events-none",
          )}
        >
          {previewUrl ? (
            <div className="flex flex-col items-center">
              <img
                src={previewUrl}
                alt="Receipt Preview"
                className="h-32 object-contain mb-3 rounded-sm shadow-sm"
              />
              <p className="text-[10px] font-bold uppercase tracking-widest text-blue-600">
                Change Image
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                <UploadCloud className="w-6 h-6 text-slate-400" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                Tap to upload receipt
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Supports JPG, PNG (Max 5MB)
              </p>
            </>
          )}
        </div>
      </div>

      {isScanning && (
        <div className="mt-4 p-4 bg-slate-50 border border-slate-100 rounded-sm flex flex-col items-center justify-center gap-3">
          <ScanLine className="w-6 h-6 text-blue-500 animate-pulse" />
          <div className="w-full">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">
              <span>Scanning Receipt...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300 ease-out"
                style={{ width: `${scanProgress}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {!isScanning && scanStatus !== "idle" && (
        <div className="mt-5 space-y-4">
          {/* Status Messages */}
          {scanStatus === "success" && isAmountMatching && (
            <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 p-3 rounded-sm border border-emerald-100">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p className="text-xs font-medium">
                Receipt verified automatically!
              </p>
            </div>
          )}
          {scanStatus === "success" && !isAmountMatching && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-sm border border-red-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">
                Amount mismatch! We detected ₱{scannedAmount} but the total is ₱
                {expectedAmount}. Please verify manually.
              </p>
            </div>
          )}
          {(scanStatus === "failed" || scanStatus === "partial") && (
            <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-3 rounded-sm border border-amber-100">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-xs font-medium">
                Could not read all details clearly. Please verify the fields
                below.
              </p>
            </div>
          )}

          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Ref Number
              </label>
              <Input
                value={referenceNumber}
                onChange={(e) => {
                  setReferenceNumber(e.target.value);
                  if (selectedImage)
                    onScanComplete(
                      selectedImage,
                      e.target.value,
                      scannedAmount,
                    );
                }}
                placeholder="13-digit code"
                className="font-mono text-xs"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                Amount Paid (₱)
              </label>
              <Input
                type="number"
                value={scannedAmount}
                onChange={(e) => {
                  setScannedAmount(e.target.value);
                  if (selectedImage)
                    onScanComplete(
                      selectedImage,
                      referenceNumber,
                      e.target.value,
                    );
                }}
                placeholder="e.g. 12500"
                className={cn(
                  "font-mono text-xs",
                  !isAmountMatching &&
                    scannedAmount !== "" &&
                    "border-red-300 bg-red-50 text-red-900 focus-visible:ring-red-500",
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
