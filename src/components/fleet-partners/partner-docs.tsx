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
    <div className="flex flex-col h-full w-full bg-transparent transition-colors duration-300">
      {/* Header Info */}
      <div className="flex items-center justify-between mb-4 shrink-0 border-b border-border pb-2.5 transition-colors">
        <div>
          <h3 className="text-[10px] font-bold text-foreground uppercase tracking-widest leading-none">
            Compliance & Legal Records
          </h3>
          <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1.5">
            Contracts, Permits, and Identification
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-[9px] font-bold uppercase tracking-widest rounded-lg border-border shadow-none bg-background text-foreground hover:bg-secondary transition-colors"
        >
          Upload Document
        </Button>
      </div>

      {/* Scrollable List Area */}
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-sm z-10 transition-colors">
            <Loader2 className="w-5 h-5 animate-spin text-primary mb-2" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Retrieving Documents...
            </span>
          </div>
        ) : !documents || documents.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/30 rounded-xl border border-dashed border-border z-10 transition-colors">
            <FileSignature className="w-6 h-6 text-muted-foreground/30 mb-2 opacity-80" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              No Documents Found
            </span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 pb-4">
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
                    "flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl border bg-card transition-all shadow-sm",
                    isRejected || isExpired
                      ? "border-destructive/30 bg-destructive/5"
                      : "border-border hover:border-primary/40",
                  )}
                >
                  {/* Left Side: Icon & Details */}
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div
                      className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0 border transition-colors",
                        isVerified
                          ? "bg-emerald-500/10 border-emerald-500/20"
                          : isRejected
                            ? "bg-destructive/10 border-destructive/20"
                            : "bg-secondary border-border",
                      )}
                    >
                      <FileText
                        className={cn(
                          "w-4 h-4",
                          isVerified
                            ? "text-emerald-600 dark:text-emerald-400"
                            : isRejected
                              ? "text-destructive"
                              : "text-muted-foreground",
                        )}
                      />
                    </div>

                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[11px] font-bold text-foreground uppercase tracking-tight transition-colors">
                          {formatCategory(doc.category)}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[8px] font-bold h-4 px-1.5 uppercase tracking-widest rounded shadow-none flex items-center gap-1 transition-colors",
                            isVerified
                              ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                              : isRejected
                                ? "bg-destructive/10 text-destructive border-destructive/20"
                                : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
                          )}
                        >
                          {isVerified && (
                            <CheckCircle2 className="w-2.5 h-2.5" />
                          )}
                          {isPending && <Clock className="w-2.5 h-2.5" />}
                          {isRejected && (
                            <AlertCircle className="w-2.5 h-2.5" />
                          )}
                          {doc.status}
                        </Badge>
                        {isExpired && (
                          <Badge
                            variant="outline"
                            className="bg-destructive text-destructive-foreground border-destructive text-[8px] font-bold h-4 px-1.5 uppercase tracking-widest rounded shadow-none transition-colors"
                          >
                            EXPIRED
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-mono tracking-wider transition-colors">
                        <span
                          className="truncate max-w-[150px] sm:max-w-[200px]"
                          title={doc.file_name}
                        >
                          {doc.file_name}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-border" />
                        <span>
                          Uploaded{" "}
                          {format(new Date(doc.created_at), "MMM dd, yyyy")}
                        </span>

                        {doc.expiry_date && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-border" />
                            <span
                              className={cn(
                                isExpired && "text-destructive font-bold",
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
                        <p className="mt-2 text-[9px] font-medium text-destructive/90 bg-destructive/10 p-2 rounded-lg border border-destructive/20 transition-colors">
                          <span className="font-bold uppercase tracking-widest mr-1 text-destructive">
                            Reason:
                          </span>
                          {doc.rejection_reason}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right Side: Actions */}
                  <div className="flex items-center gap-2 mt-3 sm:mt-0 ml-[54px] sm:ml-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Download Document"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-[9px] font-bold uppercase tracking-widest rounded-lg border-border shadow-none text-foreground hover:bg-secondary transition-colors"
                      onClick={() => {
                        if (doc.file_url) window.open(doc.file_url, "_blank");
                      }}
                      disabled={!doc.file_url}
                    >
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />{" "}
                      View
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
