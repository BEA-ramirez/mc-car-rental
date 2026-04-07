"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import {
  UploadCloud,
  ScanLine,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface ReceiptScannerProps {
  onScanComplete: (file: File, referenceNumber: string, amount: string) => void;
  expectedAmount: number;
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

      // 1. Hunt for Reference Number
      const refRegex =
        /(?:ref|reference)[.\s]*no[.\s]*[:\-]?\s*([0-9\s]{13,20})/i;
      const refMatch = rawText.match(refRegex);
      const cleanRef =
        refMatch && refMatch[1] ? refMatch[1].replace(/\s/g, "") : "";

      // 2. Hunt for Amount
      const amountRegex =
        /(?:php|amount|total|p)[\s:.-]*p?h?p?[\s]*((?:\d{1,3}(?:,\d{3})+|\d+)\.\d{2})/i;
      const amountMatch = rawText.match(amountRegex);
      const cleanAmount =
        amountMatch && amountMatch[1] ? amountMatch[1].replace(/,/g, "") : "";

      setReferenceNumber(cleanRef);
      setScannedAmount(cleanAmount);

      if (cleanRef && cleanAmount) {
        setScanStatus("success");
      } else if (cleanRef || cleanAmount) {
        setScanStatus("partial");
      } else {
        setScanStatus("failed");
      }

      onScanComplete(file, cleanRef, cleanAmount);
    } catch (error) {
      console.error("OCR Scan failed:", error);
      setScanStatus("failed");
    } finally {
      setIsScanning(false);
    }
  };

  const isAmountMatching = Number(scannedAmount) === expectedAmount;

  return (
    <div className="bg-black/40 border border-white/5 rounded-2xl p-5 md:p-6 w-full shadow-inner">
      <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
        <Label className="text-[10px] md:text-[11px] font-bold text-gray-400 uppercase tracking-widest block">
          Upload Proof of Payment
        </Label>
        <span className="text-[8px] bg-[#64c5c3]/10 text-[#64c5c3] px-2 py-1 rounded-sm uppercase tracking-widest font-bold border border-[#64c5c3]/20">
          OCR Enabled
        </span>
      </div>

      <div className="relative group mb-4">
        <Input
          type="file"
          accept="image/*"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          onChange={handleImageChange}
          disabled={isScanning}
        />
        <div
          className={cn(
            "border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 transition-all text-center relative overflow-hidden",
            previewUrl
              ? "border-[#64c5c3]/30 bg-[#64c5c3]/5"
              : "border-white/10 hover:border-[#64c5c3]/50 hover:bg-white/5",
            isScanning && "opacity-50 pointer-events-none",
          )}
        >
          {previewUrl ? (
            <div className="flex flex-col items-center">
              <div className="relative w-24 h-32 mb-3 rounded-lg overflow-hidden border border-white/10 shadow-lg">
                <Image
                  src={previewUrl}
                  alt="Receipt Preview"
                  fill
                  className="object-cover opacity-80"
                />
              </div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#64c5c3] flex items-center gap-1">
                <RefreshCw className="w-3 h-3" /> Tap to Change Image
              </p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-3 group-hover:bg-[#64c5c3]/10 group-hover:text-[#64c5c3] transition-colors">
                <UploadCloud className="w-5 h-5 text-gray-400 group-hover:text-[#64c5c3]" />
              </div>
              <p className="text-[10px] font-bold text-white uppercase tracking-widest">
                Tap to upload receipt
              </p>
              <p className="text-[9px] text-gray-500 mt-1 uppercase tracking-widest">
                Supports JPG, PNG (Max 5MB)
              </p>
            </>
          )}
        </div>
      </div>

      {isScanning && (
        <div className="mt-4 p-4 bg-black/60 border border-[#64c5c3]/20 rounded-xl flex flex-col items-center justify-center gap-3">
          <ScanLine className="w-6 h-6 text-[#64c5c3] animate-pulse" />
          <div className="w-full">
            <div className="flex justify-between text-[9px] font-bold uppercase tracking-widest text-[#64c5c3] mb-2">
              <span>Scanning Receipt...</span>
              <span>{scanProgress}%</span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#64c5c3] transition-all duration-300 ease-out"
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
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <p className="text-[10px] font-bold uppercase tracking-widest">
                Verification Successful
              </p>
            </div>
          )}
          {scanStatus === "success" && !isAmountMatching && (
            <div className="flex items-start gap-2 text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium leading-relaxed">
                <strong className="uppercase tracking-widest">
                  Amount mismatch!
                </strong>
                <br />
                Detected ₱{scannedAmount} but total is ₱{expectedAmount}. Please
                verify manually.
              </p>
            </div>
          )}
          {(scanStatus === "failed" || scanStatus === "partial") && (
            <div className="flex items-start gap-2 text-amber-400 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <p className="text-[10px] font-medium leading-relaxed">
                <strong className="uppercase tracking-widest">
                  Partial Scan
                </strong>
                <br />
                Could not read all details perfectly. Please verify fields
                below.
              </p>
            </div>
          )}

          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-4 bg-black/40 p-4 rounded-xl border border-white/5">
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
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
                className="font-mono text-xs bg-transparent border-white/10 text-white focus:border-[#64c5c3] focus:ring-0 rounded-lg h-10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-bold uppercase tracking-widest text-gray-500">
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
                  "font-mono text-xs bg-transparent border-white/10 text-white focus:border-[#64c5c3] focus:ring-0 rounded-lg h-10",
                  !isAmountMatching &&
                    scannedAmount !== "" &&
                    "border-red-500/50 text-red-400 focus:border-red-500",
                )}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
