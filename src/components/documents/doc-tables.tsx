"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle, AlertTriangle, Trash2, Edit2 } from "lucide-react";
import {
  useKYCDocuments,
  useContracts,
  useInspections,
} from "../../../hooks/use-documents";
import { format } from "date-fns";
import { formatCategory } from "./documents-main";
import { cn } from "@/lib/utils";

// status badge component
const StatusBadge = ({ status }: { status: string }) => {
  switch (status.toUpperCase()) {
    case "VERIFIED":
    case "SIGNED":
      return (
        <Badge
          variant="outline"
          className="text-[8px] font-bold border-emerald-500/20 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 h-4 px-1.5 rounded uppercase tracking-widest"
        >
          Verified
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="text-[8px] font-bold border-amber-500/20 text-amber-600 dark:text-amber-400 bg-amber-500/10 h-4 px-1.5 rounded uppercase tracking-widest"
        >
          Pending
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className="text-[8px] font-bold border-destructive/20 text-destructive bg-destructive/10 h-4 px-1.5 rounded uppercase tracking-widest"
        >
          Rejected
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge
          variant="outline"
          className="text-[8px] font-bold border-border text-muted-foreground bg-secondary h-4 px-1.5 rounded uppercase tracking-widest"
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
  onEdit,
  onDelete,
}: {
  onViewReview: (row: any) => void;
  onEdit: (row: any) => void;
  onDelete: (row: any) => void;
}) {
  const { data: documents = [], isLoading } = useKYCDocuments();

  if (isLoading)
    return (
      <div className="p-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Loading Records...
      </div>
    );

  if (documents.length === 0)
    return (
      <div className="p-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        No documents found.
      </div>
    );

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-secondary/30 border-b border-border transition-colors">
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest w-[250px]">
              Customer
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Document Type
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Uploaded Date
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Expiry Date
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Status
            </th>
            {/* Split into two columns for perfect alignment */}
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right w-[80px]">
              Manage
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right w-[80px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {documents.map((doc: any, idx: number) => (
            <tr
              key={doc.document_id || `kyc-${idx}`}
              className="hover:bg-secondary/30 transition-colors group bg-background"
            >
              <td className="px-3 py-2">
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-foreground">
                    {doc.users?.full_name || "Unknown"}
                  </span>
                  <span className="text-[9px] font-medium text-muted-foreground truncate">
                    {doc.users?.email || "No email"}
                  </span>
                </div>
              </td>
              <td className="px-3 py-2 text-[10px] font-bold text-foreground">
                {formatCategory(doc.category)}
              </td>
              <td className="px-3 py-2 text-[10px] font-semibold text-muted-foreground font-mono">
                {doc.created_at
                  ? format(new Date(doc.created_at), "MMM dd, yyyy")
                  : "---"}
              </td>
              <td className="px-3 py-2 text-[10px] font-semibold text-muted-foreground font-mono">
                {doc.expiry_date
                  ? format(new Date(doc.expiry_date), "MMM dd, yyyy")
                  : "---"}
              </td>
              <td className="px-3 py-2">
                <StatusBadge status={doc.status} />
              </td>
              
              {/* COLUMN 1: Edit & Delete Icons */}
              <td className="px-3 py-2">
                <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                    onClick={() => onEdit(doc)}
                    title="Edit Document"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    onClick={() => onDelete(doc)}
                    title="Delete Document"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </td>

              {/* COLUMN 2: Primary Action Button */}
              <td className="px-3 py-2 text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  /* Added w-[64px] (w-16) to ensure the button itself is the exact same width regardless of the word */
                  className="h-6 w-16 px-0 text-[9px] font-bold text-primary hover:text-primary hover:bg-primary/10 rounded-md transition-colors flex items-center justify-center"
                  onClick={() => onViewReview(doc)}
                >
                  {doc.status?.toUpperCase() === "PENDING" ? "REVIEW" : "VIEW"}
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
      <div className="p-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Loading Contracts...
      </div>
    );

  if (contracts.length === 0)
    return (
      <div className="p-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        No contracts found.
      </div>
    );

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-secondary/30 border-b border-border transition-colors">
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Booking Ref
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest w-[200px]">
              Customer
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Vehicle
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Rental Dates
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Status
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right w-[150px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
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
                className="hover:bg-secondary/30 transition-colors group bg-background"
              >
                <td className="px-3 py-2 text-[10px] font-bold font-mono text-muted-foreground">
                  {contract.booking_id?.split("-")[0] || "---"}
                </td>
                <td className="px-3 py-2 text-[11px] font-bold text-foreground truncate">
                  {customerName}
                </td>
                <td className="px-3 py-2 text-[10px] font-bold text-muted-foreground">
                  {vehicleName}
                </td>
                <td className="px-3 py-2 text-[10px] font-semibold text-muted-foreground">
                  {dates}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge
                    status={contract.is_signed ? "SIGNED" : "UNSIGNED"}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {!contract.is_signed && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-[9px] font-bold text-muted-foreground hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10 rounded-md opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity shadow-none"
                        onClick={() => onRemind(contract)}
                      >
                        Remind
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-6 text-[9px] font-bold rounded-md shadow-none transition-colors",
                        contract.is_signed
                          ? "bg-card border-border text-foreground hover:bg-secondary"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20",
                      )}
                      onClick={() => onPreview(contract)}
                    >
                      {contract.is_signed ? "View" : "Review & Sign"}
                    </Button>
                  </div>
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
      <div className="p-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        Loading Inspections...
      </div>
    );

  if (inspections.length === 0)
    return (
      <div className="p-8 text-center text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
        No inspections found.
      </div>
    );

  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-secondary/30 border-b border-border transition-colors">
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Booking Ref
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Vehicle
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Type
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Inspector
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
              Issues
            </th>
            <th className="px-3 py-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-right w-[120px]">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {inspections.map((row: any, idx: number) => {
            const vehicleName = row.bookings?.cars
              ? `${row.bookings.cars.brand} ${row.bookings.cars.model}`
              : "Unknown Vehicle";

            const isFlagged =
              Array.isArray(row.checklist_data) &&
              row.checklist_data.some((item: any) => item.status === "ISSUE");

            return (
              <tr
                key={row.inspection_id || `inspection-${idx}`}
                className="hover:bg-secondary/30 transition-colors bg-background group"
              >
                <td className="px-3 py-2 text-[10px] font-bold font-mono text-muted-foreground">
                  {row.booking_id?.split("-")[0] || "---"}
                </td>

                <td className="px-3 py-2 text-[11px] font-bold text-foreground">
                  {vehicleName}
                </td>

                <td className="px-3 py-2 text-[10px] font-bold text-muted-foreground">
                  {row.type}
                </td>

                <td className="px-3 py-2 text-[10px] font-semibold text-muted-foreground">
                  {row.users?.full_name || "System"}
                </td>

                <td className="px-3 py-2">
                  {isFlagged ? (
                    <span className="flex items-center text-[9px] font-bold uppercase tracking-widest text-destructive">
                      <AlertTriangle className="w-3 h-3 mr-1" /> Yes
                    </span>
                  ) : (
                    <span className="flex items-center text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      <CheckCircle className="w-3 h-3 mr-1" /> None
                    </span>
                  )}
                </td>

                <td className="px-3 py-2 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-[9px] font-bold text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md transition-colors"
                    onClick={() => onViewReport(row)}
                  >
                    <Eye className="w-3 h-3 mr-1.5" /> View
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
