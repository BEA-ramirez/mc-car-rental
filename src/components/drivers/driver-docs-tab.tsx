"use client";

import React from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  Eye,
  Loader2,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDriverDocuments } from "../../../hooks/use-drivers";

interface DriverDocsTabProps {
  driverId: string;
}

export default function DriverDocsTab({ driverId }: DriverDocsTabProps) {
  const {
    data: documents = [],
    isLoading,
    error,
  } = useDriverDocuments(driverId);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-[#F8FAFC] border border-slate-200 rounded-sm">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600 mb-4" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Loading Documents...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-sm font-medium text-red-500 border border-red-100 bg-red-50 rounded-sm">
        Failed to load driver documents. Please try again.
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] bg-white border border-dashed border-slate-200 rounded-sm p-8 text-center">
        <FileText className="w-8 h-8 text-slate-300 mb-3" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          No Documents Found
        </span>
        <p className="text-xs text-slate-400 mt-2">
          This driver has not uploaded any documents yet.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {documents.map((doc: any) => {
        // Determine styling based on dynamic status
        let statusColor = "border-slate-200 bg-slate-50";
        let textStatusColor = "text-slate-600";
        let StatusIcon = FileText;

        if (doc.status === "Valid") {
          statusColor = "border-emerald-500 bg-emerald-50";
          textStatusColor = "text-emerald-700";
          StatusIcon = CheckCircle2;
        } else if (doc.status === "Rejected") {
          statusColor = "border-red-500 bg-red-50";
          textStatusColor = "text-red-700";
          StatusIcon = AlertCircle;
        } else if (doc.status === "Pending Review") {
          statusColor = "border-amber-500 bg-amber-50";
          textStatusColor = "text-amber-700";
          StatusIcon = Clock;
        }

        return (
          <div
            key={doc.id}
            className="bg-white border border-slate-200 rounded-sm shadow-sm p-5 flex items-start justify-between transition-colors hover:bg-[#F8FAFC]"
          >
            <div className="flex items-start gap-3 min-w-0 pr-4">
              <div
                className={`w-1 h-10 rounded-full shrink-0 ${statusColor}`}
              />
              <div className="min-w-0">
                <h4 className="text-xs font-bold text-[#0F172A] truncate">
                  {doc.name}
                </h4>
                <div className="flex items-center gap-1 mt-1">
                  <StatusIcon
                    className={`w-3 h-3 shrink-0 ${
                      doc.status === "Valid"
                        ? "text-emerald-600"
                        : doc.status === "Pending Review"
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider truncate ${textStatusColor}`}
                  >
                    {doc.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 mt-1.5 truncate">
                  {doc.date}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs font-bold shadow-none rounded-sm shrink-0 hover:bg-slate-100"
              onClick={() => {
                if (doc.fileUrl) {
                  // If you store full URLs, this works. If you store Supabase storage paths,
                  // you may need to format it with your Supabase project URL here.
                  window.open(doc.fileUrl, "_blank");
                }
              }}
            >
              <Eye className="w-3.5 h-3.5 mr-1 text-slate-500" /> View
            </Button>
          </div>
        );
      })}
    </div>
  );
}
