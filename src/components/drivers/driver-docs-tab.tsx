import React from "react";
import {
  FileText,
  CheckCircle2,
  AlertCircle,
  UploadCloud,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const requiredDocs = [
  {
    name: "Professional Driver's License",
    status: "Valid",
    date: "Expires Oct 2028",
    color: "border-emerald-500 bg-emerald-50",
  },
  {
    name: "NBI Clearance",
    status: "Missing",
    date: "Required for dispatch",
    color: "border-red-500 bg-red-50",
  },
  {
    name: "Police Clearance",
    status: "Valid",
    date: "Uploaded Jan 2026",
    color: "border-emerald-500 bg-emerald-50",
  },
];

export default function DriverDocsTab() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {requiredDocs.map((doc, i) => (
        <div
          key={i}
          className="bg-white border border-slate-200 rounded-sm shadow-sm p-5 flex items-start justify-between"
        >
          <div className="flex items-start gap-3">
            <div className={`w-1 h-10 rounded-full ${doc.color}`} />
            <div>
              <h4 className="text-xs font-bold text-slate-900">{doc.name}</h4>
              <div className="flex items-center gap-1 mt-1">
                {doc.status === "Valid" ? (
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                ) : (
                  <AlertCircle className="w-3 h-3 text-red-600" />
                )}
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${doc.status === "Valid" ? "text-emerald-700" : "text-red-700"}`}
                >
                  {doc.status}
                </span>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">{doc.date}</p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            className="h-8 text-xs font-bold shadow-none rounded-sm"
          >
            {doc.status === "Valid" ? (
              <>
                <Eye className="w-3.5 h-3.5 mr-1" /> View
              </>
            ) : (
              <>
                <UploadCloud className="w-3.5 h-3.5 mr-1" /> Upload
              </>
            )}
          </Button>
        </div>
      ))}
    </div>
  );
}
