"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Download,
  Eye,
  FileSignature,
  ShieldAlert,
  CheckCircle,
  Search,
  Mail,
  AlertTriangle,
} from "lucide-react";
import {
  useKYCDocuments,
  useContracts,
  useInspections,
} from "../../../hooks/use-documents";
import { format } from "date-fns";
import { formatCategory } from "./documents-main";
import { cn } from "@/lib/utils";

// --- STATUS BADGE COMPONENT ---
const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toUpperCase()) {
    case "VERIFIED":
    case "SIGNED":
      return (
        <Badge
          variant="outline"
          className="text-[9px] font-bold border-emerald-200 text-emerald-700 bg-emerald-50 h-5 px-1.5 rounded-sm uppercase tracking-widest"
        >
          Verified
        </Badge>
      );
    case "PENDING":
    case "UNSIGNED":
      return (
        <Badge
          variant="outline"
          className="text-[9px] font-bold border-amber-200 text-amber-700 bg-amber-50 h-5 px-1.5 rounded-sm uppercase tracking-widest"
        >
          Pending
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className="text-[9px] font-bold border-red-200 text-red-700 bg-red-50 h-5 px-1.5 rounded-sm uppercase tracking-widest"
        >
          Rejected
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge
          variant="outline"
          className="text-[9px] font-bold border-slate-300 text-slate-600 bg-slate-100 h-5 px-1.5 rounded-sm uppercase tracking-widest"
        >
          Expired
        </Badge>
      );
    default:
      return null;
  }
};

export function KYCTable({
  onViewReview,
}: {
  onViewReview: (row: any) => void;
}) {
  const { data: documents = [], isLoading } = useKYCDocuments();

  if (isLoading)
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        Loading Records...
      </div>
    );

  if (documents.length === 0)
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        No documents found.
      </div>
    );

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Document Type
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Uploaded Date
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Expiry Date
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {documents.map((doc: any, idx: number) => (
            <tr
              key={doc.document_id || `kyc-${idx}`}
              className="hover:bg-slate-50/50 transition-colors group"
            >
              <td className="px-4 py-3">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-800">
                    {doc.users?.full_name || "Unknown"}
                  </span>
                  <span className="text-[10px] font-medium text-slate-500">
                    {doc.users?.email || "No email"}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3 text-xs font-medium text-slate-700">
                {formatCategory(doc.category)}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                {doc.created_at
                  ? format(new Date(doc.created_at), "MMM dd, yyyy")
                  : "---"}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600 font-mono">
                {doc.expiry_date
                  ? format(new Date(doc.expiry_date), "MMM dd, yyyy")
                  : "---"}
              </td>
              <td className="px-4 py-3">
                <StatusBadge status={doc.status} />
              </td>
              <td className="px-4 py-3 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-sm"
                  onClick={() => onViewReview(doc)}
                >
                  {doc.status?.toUpperCase() === "PENDING" ? "Review" : "View"}
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ContractsTable({
  onRemind,
  onPreview,
}: {
  onRemind: (row: any) => void;
  onPreview: (row: any) => void;
}) {
  const { data: contracts = [], isLoading } = useContracts();

  if (isLoading)
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        Loading Contracts...
      </div>
    );

  if (contracts.length === 0)
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        No contracts found.
      </div>
    );

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Booking Ref
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Customer
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Vehicle
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Rental Dates
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {contracts.map((contract: any) => {
            // Safe extraction of nested data
            const booking = contract.bookings || {};
            const customerName = booking.users?.full_name || "Unknown Customer";
            const vehicleName = booking.cars
              ? `${booking.cars.brand} ${booking.cars.model}`
              : "Unknown Vehicle";
            const dates =
              booking.start_date && booking.end_date
                ? `${format(new Date(booking.start_date), "MMM dd")} - ${format(new Date(booking.end_date), "MMM dd")}`
                : "Dates Unknown";

            return (
              <tr
                key={contract.contract_id}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-xs font-bold font-mono text-slate-700">
                  {contract.booking_id?.split("-")[0] || "---"}
                </td>
                <td className="px-4 py-3 text-xs font-bold text-slate-800">
                  {customerName}
                </td>
                <td className="px-4 py-3 text-xs font-medium text-slate-700">
                  {vehicleName}
                </td>
                <td className="px-4 py-3 text-xs text-slate-600">{dates}</td>
                <td className="px-4 py-3">
                  <StatusBadge
                    status={contract.is_signed ? "SIGNED" : "UNSIGNED"}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  {contract.is_signed ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 px-2 text-[10px] font-bold border-slate-200 rounded-sm text-slate-600"
                      onClick={() => onPreview(contract)}
                    >
                      <Download className="w-3 h-3 mr-1.5" /> PDF
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-[10px] font-bold text-orange-600 hover:text-orange-700 hover:bg-orange-50 rounded-sm"
                      onClick={() => onRemind(contract)}
                    >
                      <Mail className="w-3 h-3 mr-1.5" /> Remind
                    </Button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function InspectionsTable({
  onViewReport,
}: {
  onViewReport: (row: any) => void;
}) {
  const { data: inspections = [], isLoading } = useInspections();

  if (isLoading)
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        Loading Inspections...
      </div>
    );

  if (inspections.length === 0)
    return (
      <div className="p-8 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        No inspections found.
      </div>
    );

  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200">
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Booking Ref
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Vehicle
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Type
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Inspector
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Issues Flagged
            </th>
            <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider text-right">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {/* NOTICE the idx added here for the fallback key */}
          {inspections.map((row: any, idx: number) => {
            // Map the real joined database columns
            const vehicleName = row.bookings?.cars
              ? `${row.bookings.cars.brand} ${row.bookings.cars.model}`
              : "Unknown Vehicle";

            // Check the actual JSONB array for issues
            const isFlagged =
              Array.isArray(row.checklist_data) &&
              row.checklist_data.some((item: any) => item.status === "ISSUE");

            return (
              <tr
                key={row.inspection_id || `inspection-${idx}`}
                className="hover:bg-slate-50/50 transition-colors"
              >
                <td className="px-4 py-3 text-xs font-bold font-mono text-slate-700">
                  {row.booking_id?.split("-")[0] || "---"}
                </td>

                <td className="px-4 py-3 text-xs font-bold text-slate-800">
                  {vehicleName}
                </td>

                <td className="px-4 py-3 text-xs font-medium text-slate-700">
                  {row.type}
                </td>

                <td className="px-4 py-3 text-xs text-slate-600">
                  {row.users?.full_name || "System"}
                </td>

                <td className="px-4 py-3">
                  {isFlagged ? (
                    <span className="flex items-center text-[10px] font-bold text-red-600">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Yes
                    </span>
                  ) : (
                    <span className="flex items-center text-[10px] font-bold text-slate-400">
                      <CheckCircle className="w-3 h-3 mr-1" /> None
                    </span>
                  )}
                </td>

                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-[10px] font-bold text-slate-600 hover:text-slate-900 rounded-sm"
                    onClick={() => onViewReport(row)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" /> View Report
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
