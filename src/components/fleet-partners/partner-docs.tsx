"use client";

import React from "react";
import { format } from "date-fns";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FileText,
  Loader2,
  ExternalLink,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileSignature,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePartnerDocuments } from "../../../hooks/use-fleetPartners";

interface PartnerDocsProps {
  selectedPartner: FleetPartnerType | null;
}

export default function PartnerDocs({ selectedPartner }: PartnerDocsProps) {
  const { data: documents, isLoading } = usePartnerDocuments(
    selectedPartner?.car_owner_id,
  );

  if (!selectedPartner) return null;

  // Helper to make internal category codes look nice (e.g. "business_permit" -> "Business Permit")
  const formatCategory = (str: string) => {
    return str
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 px-1 shrink-0">
        <div>
          <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
            Compliance & Legal Records
          </h3>
          <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-1">
            Contracts, Permits, and Identification
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[9px] font-bold uppercase tracking-widest rounded-sm border-slate-200 shadow-none bg-white"
        >
          Upload Document
        </Button>
      </div>

      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar px-1 relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Retrieving Documents...
            </span>
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 rounded-sm border border-dashed border-slate-200 z-10">
            <FileSignature className="w-6 h-6 text-slate-300 mb-3 opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              No Documents Found
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-6">
            {documents.map((doc: any) => {
              const isVerified =
                doc.status === "VERIFIED" || doc.status === "APPROVED";
              const isRejected = doc.status === "REJECTED";
              const isPending = doc.status === "PENDING";

              // Check if doc is expired
              const isExpired =
                doc.expiry_date && new Date(doc.expiry_date) < new Date();

              return (
                <div
                  key={doc.document_id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-sm border bg-white transition-all shadow-sm",
                    isRejected || isExpired
                      ? "border-red-200 bg-red-50/30"
                      : "border-slate-200 hover:border-slate-300 hover:shadow-md",
                  )}
                >
                  {/* Left Side: Icon & Details */}
                  <div className="flex items-start sm:items-center gap-4">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-sm flex items-center justify-center shrink-0 border",
                        isVerified
                          ? "bg-emerald-50 border-emerald-100"
                          : isRejected
                            ? "bg-red-50 border-red-100"
                            : "bg-slate-50 border-slate-200",
                      )}
                    >
                      <FileText
                        className={cn(
                          "w-4 h-4",
                          isVerified
                            ? "text-emerald-600"
                            : isRejected
                              ? "text-red-600"
                              : "text-slate-400",
                        )}
                      />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-[#0F172A] uppercase tracking-tight">
                          {formatCategory(doc.category)}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-bold h-4 px-1.5 uppercase tracking-widest rounded-[2px] shadow-none flex items-center gap-1",
                            isVerified
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isRejected
                                ? "bg-red-50 text-red-700 border-red-200"
                                : "bg-amber-50 text-amber-700 border-amber-200",
                          )}
                        >
                          {isVerified && <CheckCircle2 className="w-2 h-2" />}
                          {isPending && <Clock className="w-2 h-2" />}
                          {isRejected && <AlertCircle className="w-2 h-2" />}
                          {doc.status}
                        </Badge>
                        {isExpired && (
                          <Badge
                            variant="outline"
                            className="bg-red-600 text-white border-red-700 text-[8px] font-bold h-4 px-1.5 uppercase tracking-widest rounded-[2px] shadow-none"
                          >
                            EXPIRED
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono tracking-wide">
                        <span
                          className="truncate max-w-[150px] sm:max-w-[200px]"
                          title={doc.file_name}
                        >
                          {doc.file_name}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span>
                          Uploaded{" "}
                          {format(new Date(doc.created_at), "MMM dd, yyyy")}
                        </span>

                        {doc.expiry_date && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span
                              className={cn(
                                isExpired && "text-red-600 font-bold",
                              )}
                            >
                              Expires{" "}
                              {format(
                                new Date(doc.expiry_date),
                                "MMM dd, yyyy",
                              )}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Show rejection reason if applicable */}
                      {isRejected && doc.rejection_reason && (
                        <p className="mt-2 text-[10px] font-medium text-red-600 bg-red-50 p-2 rounded-sm border border-red-100">
                          <span className="font-bold uppercase tracking-widest mr-1">
                            Reason:
                          </span>
                          {doc.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex items-center gap-2 mt-4 sm:mt-0 ml-14 sm:ml-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-sm text-slate-400 hover:text-[#0F172A] hover:bg-slate-100"
                      title="Download Document"
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[9px] font-bold uppercase tracking-widest rounded-sm border-slate-200 shadow-none text-slate-700 hover:bg-slate-50"
                      onClick={() => {
                        if (doc.file_url) window.open(doc.file_url, "_blank");
                      }}
                      disabled={!doc.file_url}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
