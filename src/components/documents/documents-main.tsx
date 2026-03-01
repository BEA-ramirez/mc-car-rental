"use client";

import React, { useState } from "react";
import {
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Upload,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KYCTable, ContractsTable, InspectionsTable } from "./doc-tables";
import ReviewModal, { ReviewDocument } from "./review-modal";
import UploadModal from "./upload-modal";
import ReminderModal, { ReminderContext } from "./reminder-modal";
import ViewDocumentModal, { ViewedDocument } from "./view-doc-modal";
import InspectionModal, { InspectionReport } from "./inspection-modal";
import InspectionExecutionModal from "./inspection-execution-modal";
import ContractPreviewModal, {
  ContractPreview,
} from "./contract-preview-modal";
import {
  usePendingDocuments,
  useExpiringDocuments,
  useDocumentMutations,
} from "../../../hooks/use-documents";
import { format, differenceInDays } from "date-fns";
import { cn } from "@/lib/utils";

export const formatCategory = (cat: string) => {
  if (!cat) return "Unknown";
  return cat
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export default function DocumentsMain() {
  const [activeTab, setActiveTab] = useState("kyc");
  const [reviewDoc, setReviewDoc] = useState<ReviewDocument | null>(null);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [reminderCtx, setReminderCtx] = useState<ReminderContext | null>(null);
  const [viewDoc, setViewDoc] = useState<ViewedDocument | null>(null);
  const [inspectionDoc, setInspectionDoc] = useState<InspectionReport | null>(
    null,
  );
  const [contractDoc, setContractDoc] = useState<ContractPreview | null>(null);

  const { data: pendingDocs = [], isLoading: loadingPending } =
    usePendingDocuments();
  const { data: expiringDocs = [], isLoading: loadingExpiring } =
    useExpiringDocuments();

  const { verifyDoc, rejectDoc, revokeDoc, deleteDoc, updateNote, isPending } =
    useDocumentMutations();

  // New state for the interactive Digital Clipboard
  const [activeInspection, setActiveInspection] = useState<any | null>(null);

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans">
      {/* --- FORMAL HEADER --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              Documents & Compliance
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Verify identities, manage contracts, and track inspections.
            </p>
          </div>
        </div>
        <Button
          size="sm"
          className="h-8 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-sm shadow-sm"
          onClick={() => setIsUploadOpen(true)}
        >
          <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Document
        </Button>
      </div>

      {/* --- SCROLLABLE BODY --- */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* --- PRIORITY INBOX (ACTION REQUIRED) --- */}
          <div>
            <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Action Required
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Box 1: Pending Verifications */}
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col overflow-hidden">
                <div className="bg-amber-50 border-b border-amber-100 px-3 py-2 flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Pending Verifications
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-amber-200/50 text-amber-800 hover:bg-amber-200/50 text-[9px] px-1.5 h-4 rounded-sm"
                  >
                    {pendingDocs.length}
                  </Badge>
                </div>
                <ScrollArea className="h-[140px]">
                  {loadingPending ? (
                    <div className="p-4 text-xs font-medium text-slate-400 text-center">
                      Loading...
                    </div>
                  ) : pendingDocs.length === 0 ? (
                    <div className="p-4 text-xs font-medium text-slate-400 text-center">
                      No pending verifications.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {pendingDocs.map((doc: any) => (
                        <div
                          key={doc.document_id}
                          className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                        >
                          <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">
                              {doc.users?.full_name || "Unknown"}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500">
                              {formatCategory(doc.category)} •{" "}
                              {format(new Date(doc.created_at), "MMM dd")}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[10px] font-bold border-slate-200 bg-white rounded-sm text-slate-700 hover:bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() =>
                              setReviewDoc({
                                id: doc.document_id,
                                customerName: doc.users?.full_name || "Unknown",
                                customerEmail: doc.users?.email || "N/A",
                                customerPhone: doc.users?.phone_number || "N/A",
                                trustScore: doc.users?.trust_score || 5.0,
                                type: formatCategory(doc.category),
                                uploadedAt: format(
                                  new Date(doc.created_at),
                                  "MMM dd, yyyy HH:mm",
                                ),
                                status: "PENDING",
                                imageUrl: doc.file_path,
                              })
                            }
                          >
                            Review <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </div>

              {/* Box 2: Expiring Soon */}
              <div className="bg-white border border-slate-200 rounded-sm shadow-sm flex flex-col overflow-hidden">
                <div className="bg-orange-50 border-b border-orange-100 px-3 py-2 flex justify-between items-center shrink-0">
                  <span className="text-[10px] font-bold text-orange-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Expiring Soon
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-orange-200/50 text-orange-800 hover:bg-orange-200/50 text-[9px] px-1.5 h-4 rounded-sm"
                  >
                    {expiringDocs.length}
                  </Badge>
                </div>
                <ScrollArea className="h-[140px]">
                  {loadingExpiring ? (
                    <div className="p-4 text-xs font-medium text-slate-400 text-center">
                      Loading...
                    </div>
                  ) : expiringDocs.length === 0 ? (
                    <div className="p-4 text-xs font-medium text-slate-400 text-center">
                      No documents expiring soon.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {expiringDocs.map((doc: any) => {
                        const daysLeft = differenceInDays(
                          new Date(doc.expiry_date),
                          new Date(),
                        );
                        return (
                          <div
                            key={doc.document_id}
                            className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                          >
                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-slate-800">
                                {doc.users?.full_name || "Unknown"}
                              </span>
                              <span className="text-[10px] font-medium text-slate-500">
                                {formatCategory(doc.category)}
                              </span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-[10px] font-bold text-orange-600 bg-orange-100 px-1.5 py-0.5 rounded-sm">
                                In {daysLeft} Days
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-sm text-slate-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Send Reminder"
                                onClick={() =>
                                  setReminderCtx({
                                    id: doc.document_id,
                                    customerName:
                                      doc.users?.full_name || "Unknown",
                                    customerEmail: doc.users?.email || "N/A",
                                    type: "expiry",
                                    documentName: formatCategory(doc.category),
                                    daysLeft: daysLeft,
                                  })
                                }
                              >
                                <ArrowRight className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
            </div>
          </div>

          <hr className="border-slate-200" />

          {/* --- MAIN DOCUMENT REGISTRY --- */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">
                Document Registry
              </h2>
            </div>

            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
              {/* Custom Tab Header */}
              <div className="border-b border-slate-200 bg-slate-50/50 px-2 pt-2 flex items-center justify-between">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="bg-transparent h-9 p-0 flex gap-4 border-b-0 justify-start w-full">
                    <TabsTrigger
                      value="kyc"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-xs font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none"
                    >
                      Customer KYC
                    </TabsTrigger>
                    <TabsTrigger
                      value="contracts"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-xs font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none"
                    >
                      Agreements & Contracts
                    </TabsTrigger>
                    <TabsTrigger
                      value="inspections"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-slate-900 data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-xs font-bold text-slate-500 data-[state=active]:text-slate-900 transition-none"
                    >
                      Inspection Reports
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Toolbar */}
              <div className="p-3 border-b border-slate-100 flex gap-2 bg-white">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search customer, ID, or file name..."
                    className="w-full h-8 pl-8 pr-3 text-xs bg-slate-50 border border-slate-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-slate-300 transition-all font-medium"
                  />
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-semibold rounded-sm border-slate-200 text-slate-600 bg-white"
                >
                  <Filter className="w-3 h-3 mr-1.5" /> Filter
                </Button>
              </div>

              {/* Table Container Placeholder */}
              <div className="bg-white min-h-[400px]">
                {activeTab === "kyc" && (
                  <KYCTable
                    onViewReview={(doc) => {
                      const mappedDoc = {
                        id: doc.document_id,
                        customerName: doc.users?.full_name || "Unknown",
                        customerEmail: doc.users?.email || "N/A",
                        customerPhone: doc.users?.phone_number || "N/A",
                        trustScore: doc.users?.trust_score || 5.0,
                        type: formatCategory(doc.category),
                        uploadedAt: format(
                          new Date(doc.created_at),
                          "MMM dd, yyyy HH:mm",
                        ),
                        imageUrl: doc.file_path,
                        status: doc.status.toUpperCase(),
                        expiryDate: doc.expiry_date
                          ? format(new Date(doc.expiry_date), "MMM dd, yyyy")
                          : undefined,
                        rejectionReason: doc.rejection_reason,
                        internalNotes: doc.internal_notes,
                      };
                      if (doc.status === "pending") setReviewDoc(mappedDoc);
                      else setViewDoc(mappedDoc as ViewedDocument);
                    }}
                  />
                )}
                {activeTab === "contracts" && (
                  <ContractsTable
                    onRemind={(row) =>
                      setReminderCtx({
                        id: row.contract_id,
                        customerName:
                          row.bookings?.users?.full_name || "Unknown",
                        customerEmail: row.bookings?.users?.email || "N/A",
                        type: "contract",
                        bookingRef: row.booking_id,
                      })
                    }
                    onPreview={(row) =>
                      setContractDoc({
                        id: row.booking_id,
                        customerName:
                          row.bookings?.users?.full_name || "Unknown",
                        vehicle: row.bookings?.cars
                          ? `${row.bookings.cars.brand} ${row.bookings.cars.model}`
                          : "Unknown",
                        rentalDates:
                          row.bookings?.start_date && row.bookings?.end_date
                            ? `${format(new Date(row.bookings.start_date), "MMM dd, yyyy")} - ${format(new Date(row.bookings.end_date), "MMM dd, yyyy")}`
                            : "Unknown",
                        status: row.is_signed ? "SIGNED" : "UNSIGNED",
                        signedAt: row.signed_at
                          ? format(
                              new Date(row.signed_at),
                              "MMM dd, yyyy HH:mm",
                            )
                          : undefined,
                      })
                    }
                  />
                )}
                {activeTab === "inspections" && (
                  <InspectionsTable
                    onViewReport={(row) => setActiveInspection(row)}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- ALL MODALS --- */}
      <ReviewModal
        isOpen={!!reviewDoc}
        onClose={() => setReviewDoc(null)}
        document={reviewDoc}
        onVerify={(id, expiry) => {
          verifyDoc.mutate({ id, expiry });
          setReviewDoc(null);
        }}
        onReject={(id, reason) => {
          rejectDoc.mutate({ id, reason });
          setReviewDoc(null);
        }}
      />
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
      <ReminderModal
        isOpen={!!reminderCtx}
        onClose={() => setReminderCtx(null)}
        context={reminderCtx}
        onSend={(id, subject, message) => {
          console.log(`Sent to ${id}:`, { subject, message });
          // Implement actual send logic here later
        }}
      />
      <ViewDocumentModal
        isOpen={!!viewDoc}
        onClose={() => setViewDoc(null)}
        document={viewDoc}
        onRevoke={(id) => {
          revokeDoc.mutate(id);
          setViewDoc(null);
        }}
        onDelete={(id) => {
          if (
            confirm(
              "Are you absolutely sure you want to permanently delete this document?",
            )
          ) {
            deleteDoc.mutate({ id });
            setViewDoc(null);
          }
        }}
        onSaveNote={(id, note) => {
          updateNote.mutate({ id, note });
        }}
      />
      <InspectionModal
        isOpen={!!inspectionDoc}
        onClose={() => setInspectionDoc(null)}
        report={inspectionDoc}
        onDownload={(id) => console.log("Downloading report for", id)}
      />
      <ContractPreviewModal
        isOpen={!!contractDoc}
        onClose={() => setContractDoc(null)}
        contract={contractDoc}
        onDownload={(id) => console.log("Downloading contract PDF:", id)}
      />

      {/* NEW: Digital Clipboard Execution Modal */}
      <InspectionExecutionModal
        isOpen={!!activeInspection}
        onClose={() => setActiveInspection(null)}
        inspection={activeInspection}
      />
    </div>
  );
}
