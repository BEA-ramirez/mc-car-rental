"use client";

import React, { useState } from "react";
import {
  FileText,
  AlertCircle,
  Clock,
  ArrowRight,
  Upload,
  Search,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

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
import { DeleteDialog } from "../delete-dialog";

import {
  usePendingDocuments,
  useExpiringDocuments,
  useDocumentMutations,
} from "../../../hooks/use-documents";
import { format, differenceInDays } from "date-fns";

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
  const [reminderCtx, setReminderCtx] = useState<ReminderContext | null>(null);
  const [viewDoc, setViewDoc] = useState<ViewedDocument | null>(null);
  const [inspectionDoc, setInspectionDoc] = useState<InspectionReport | null>(
    null,
  );
  const [contractDoc, setContractDoc] = useState<ContractPreview | null>(null);
  const [activeInspection, setActiveInspection] = useState<any | null>(null);

  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [editDoc, setEditDoc] = useState<any | null>(null);
  const [docToDelete, setDocToDelete] = useState<any | null>(null);

  const { data: pendingDocs = [], isLoading: loadingPending } =
    usePendingDocuments();
  const { data: expiringDocs = [], isLoading: loadingExpiring } =
    useExpiringDocuments();

  const {
    verifyDoc,
    rejectDoc,
    revokeDoc,
    deleteDoc,
    updateNote,
    signContract,
    isPending,
  } = useDocumentMutations();

  // --- GLOBALIZE SEARCH & ACTIVE FILTERS ---
  const [kycPage, setKycPage] = useState(1);
  const [globalSearch, setGlobalSearch] = useState("");
  const [docFilters, setDocFilters] = useState({
    category: "all",
    status: "all",
    file_type: "all",
    expiry_date: "",
  });

  return (
    <div className="flex flex-col h-full bg-background font-sans transition-colors duration-300">
      {/* --- SCROLLABLE BODY --- */}
      <div className="flex-1 overflow-y-auto p-4 md:p-5 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto space-y-5">
          {/* --- PRIORITY INBOX (ACTION REQUIRED) --- */}
          <div>
            <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2.5 flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
              Action Required
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Box 1: Pending Verifications */}
              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors">
                <div className="bg-amber-500/10 border-b border-border px-3 py-2 flex justify-between items-center shrink-0 transition-colors">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                    <FileText className="w-3 h-3" /> Pending Verifications
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-amber-500/20 border-amber-500/30 text-amber-700 dark:text-amber-300 text-[9px] px-1.5 h-4 rounded-md font-bold tracking-widest"
                  >
                    {pendingDocs.length}
                  </Badge>
                </div>
                <ScrollArea className="h-[140px] bg-background/50">
                  {loadingPending ? (
                    <div className="p-4 text-[11px] font-medium text-muted-foreground text-center">
                      Loading...
                    </div>
                  ) : pendingDocs.length === 0 ? (
                    <div className="p-4 text-[11px] font-medium text-muted-foreground text-center">
                      No pending verifications.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {pendingDocs.map((doc: any) => (
                        <div
                          key={doc.document_id}
                          className="p-2.5 flex items-center justify-between hover:bg-secondary/50 transition-colors group cursor-default"
                        >
                          <div className="flex flex-col overflow-hidden pr-2">
                            <span className="text-[11px] font-bold text-foreground truncate">
                              {doc.users?.full_name || "Unknown"}
                            </span>
                            <span className="text-[9px] font-medium text-muted-foreground truncate uppercase tracking-widest mt-0.5">
                              {formatCategory(doc.category)} •{" "}
                              {format(new Date(doc.created_at), "MMM dd")}
                            </span>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-[9px] font-bold border-border bg-card rounded-lg text-foreground hover:bg-secondary opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            onClick={() => {
                              const supabaseUrl =
                                process.env.NEXT_PUBLIC_SUPABASE_URL;
                              const publicUrl =
                                doc.file_url ||
                                `${supabaseUrl}/storage/v1/object/public/documents/${doc.file_path}`;

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
                                imageUrl: publicUrl,
                              });
                            }}
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
              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col overflow-hidden transition-colors">
                <div className="bg-orange-500/10 border-b border-border px-3 py-2 flex justify-between items-center shrink-0 transition-colors">
                  <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Clock className="w-3 h-3" /> Expiring Soon
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-orange-500/20 border-orange-500/30 text-orange-700 dark:text-orange-300 text-[9px] px-1.5 h-4 rounded-md font-bold tracking-widest"
                  >
                    {expiringDocs.length}
                  </Badge>
                </div>
                <ScrollArea className="h-[140px] bg-background/50">
                  {loadingExpiring ? (
                    <div className="p-4 text-[11px] font-medium text-muted-foreground text-center">
                      Loading...
                    </div>
                  ) : expiringDocs.length === 0 ? (
                    <div className="p-4 text-[11px] font-medium text-muted-foreground text-center">
                      No documents expiring soon.
                    </div>
                  ) : (
                    <div className="divide-y divide-border">
                      {expiringDocs.map((doc: any) => {
                        const daysLeft = differenceInDays(
                          new Date(doc.expiry_date),
                          new Date(),
                        );
                        return (
                          <div
                            key={doc.document_id}
                            className="p-2.5 flex items-center justify-between hover:bg-secondary/50 transition-colors group cursor-default"
                          >
                            <div className="flex flex-col overflow-hidden pr-2">
                              <span className="text-[11px] font-bold text-foreground truncate">
                                {doc.users?.full_name || "Unknown"}
                              </span>
                              <span className="text-[9px] font-medium text-muted-foreground truncate uppercase tracking-widest mt-0.5">
                                {formatCategory(doc.category)}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              <Badge
                                variant="outline"
                                className="text-[9px] font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 border-orange-500/20 px-1.5 py-0 h-5 rounded uppercase tracking-widest"
                              >
                                In {daysLeft} Days
                              </Badge>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 rounded-md text-muted-foreground hover:text-primary hover:bg-primary/10 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
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
                                <ArrowRight className="w-3.5 h-3.5" />
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

          <hr className="border-border" />

          {/* --- MAIN DOCUMENT REGISTRY --- */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                Document Registry
              </h2>
              <Button
                size="sm"
                className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
                onClick={() => {
                  setEditDoc(null);
                  setIsUploadOpen(true);
                }}
              >
                <Upload className="w-3.5 h-3.5 mr-1.5" /> Upload Document
              </Button>
            </div>

            <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col transition-colors">
              {/* Custom Tab Header */}
              <div className="border-b border-border bg-secondary/30 px-3 pt-2 flex items-center justify-between transition-colors">
                <Tabs
                  value={activeTab}
                  onValueChange={setActiveTab}
                  className="w-full"
                >
                  <TabsList className="bg-transparent h-9 p-0 flex gap-4 border-b-0 justify-start w-full">
                    <TabsTrigger
                      value="kyc"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all"
                    >
                      Customer KYC
                    </TabsTrigger>
                    <TabsTrigger
                      value="contracts"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all"
                    >
                      Agreements
                    </TabsTrigger>
                    <TabsTrigger
                      value="inspections"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground data-[state=active]:text-foreground transition-all"
                    >
                      Inspections
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Toolbar */}
              <div className="p-3 border-b border-border flex gap-2 bg-card transition-colors">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search records..."
                    value={globalSearch}
                    onChange={(e) => {
                      setGlobalSearch(e.target.value);
                      setKycPage(1); // Reset page on search to prevent empty states
                    }}
                    className="w-full h-8 pl-8 pr-3 text-[11px] font-medium bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary text-foreground placeholder:text-muted-foreground transition-colors shadow-none"
                  />
                </div>

                {/* --- FULLY WIRED FILTER POPOVER --- */}
                {activeTab === "kyc" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-8 text-[11px] font-semibold rounded-lg border-border transition-colors",
                          docFilters.category !== "all" ||
                            docFilters.status !== "all"
                            ? "bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
                            : "text-foreground bg-card hover:bg-secondary",
                        )}
                      >
                        <Filter className="w-3.5 h-3.5 mr-1.5" /> Filter
                        {(docFilters.category !== "all" ||
                          docFilters.status !== "all") && (
                          <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] text-primary-foreground">
                            !
                          </span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-56 p-3 rounded-xl border-border bg-popover shadow-xl"
                      align="end"
                    >
                      <div className="space-y-3">
                        <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Filter KYC Documents
                        </h4>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            Category
                          </label>
                          <Select
                            value={docFilters.category}
                            onValueChange={(val) => {
                              setDocFilters((prev) => ({
                                ...prev,
                                category: val,
                              }));
                              setKycPage(1);
                            }}
                          >
                            <SelectTrigger className="h-8 w-full text-[11px] bg-secondary border-border focus:ring-1 focus:ring-primary shadow-none">
                              <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-border shadow-xl">
                              <SelectItem value="all" className="text-[11px]">
                                All Categories
                              </SelectItem>
                              <SelectItem
                                value="license_id"
                                className="text-[11px]"
                              >
                                Driver's License
                              </SelectItem>
                              <SelectItem
                                value="valid_id"
                                className="text-[11px]"
                              >
                                Valid ID
                              </SelectItem>
                              <SelectItem
                                value="business_permit"
                                className="text-[11px]"
                              >
                                Business Permit
                              </SelectItem>
                              <SelectItem
                                value="certificate_of_registration"
                                className="text-[11px]"
                              >
                                CR
                              </SelectItem>
                              <SelectItem
                                value="official_receipt"
                                className="text-[11px]"
                              >
                                OR
                              </SelectItem>
                              <SelectItem value="other" className="text-[11px]">
                                Other / Misc
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                            Status
                          </label>
                          <Select
                            value={docFilters.status}
                            onValueChange={(val) => {
                              setDocFilters((prev) => ({
                                ...prev,
                                status: val,
                              }));
                              setKycPage(1);
                            }}
                          >
                            <SelectTrigger className="h-8 w-full text-[11px] bg-secondary border-border focus:ring-1 focus:ring-primary shadow-none">
                              <SelectValue placeholder="All Statuses" />
                            </SelectTrigger>
                            <SelectContent className="rounded-lg border-border shadow-xl">
                              <SelectItem value="all" className="text-[11px]">
                                All Statuses
                              </SelectItem>
                              <SelectItem
                                value="PENDING"
                                className="text-[11px]"
                              >
                                Pending
                              </SelectItem>
                              <SelectItem
                                value="VERIFIED"
                                className="text-[11px]"
                              >
                                Verified
                              </SelectItem>
                              <SelectItem
                                value="REJECTED"
                                className="text-[11px]"
                              >
                                Rejected
                              </SelectItem>
                              <SelectItem
                                value="EXPIRED"
                                className="text-[11px]"
                              >
                                Expired
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <Button
                          variant="ghost"
                          className="w-full h-8 text-[9px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                          onClick={() => {
                            setDocFilters({
                              category: "all",
                              status: "all",
                              file_type: "all",
                              expiry_date: "",
                            });
                            setKycPage(1);
                          }}
                        >
                          Reset Filters
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              {/* Table Container */}
              <div className="bg-background min-h-[400px] transition-colors">
                {activeTab === "kyc" && (
                  <KYCTable
                    currentPage={kycPage}
                    onPageChange={setKycPage}
                    searchTerm={globalSearch}
                    filters={docFilters}
                    onEdit={(doc) => {
                      setEditDoc(doc);
                      setIsUploadOpen(true);
                    }}
                    onDelete={(doc) => {
                      setDocToDelete(doc);
                    }}
                    onViewReview={(doc) => {
                      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
                      const publicUrl =
                        doc.file_url ||
                        `${supabaseUrl}/storage/v1/object/public/documents/${doc.file_path}`;

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
                        imageUrl: publicUrl,
                        status: doc.status.toUpperCase(),
                        expiryDate: doc.expiry_date
                          ? format(new Date(doc.expiry_date), "MMM dd, yyyy")
                          : undefined,
                        rejectionReason: doc.rejection_reason,
                        internalNotes: doc.internal_notes,
                      };
                      if (doc.status === "PENDING") setReviewDoc(mappedDoc);
                      else setViewDoc(mappedDoc as ViewedDocument);
                    }}
                  />
                )}
                {activeTab === "contracts" && (
                  <ContractsTable
                    searchTerm={globalSearch}
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
                        htmlContent: row.contract_html,
                        signatureUrl: row.customer_signature_url,
                      })
                    }
                  />
                )}
                {activeTab === "inspections" && (
                  <InspectionsTable
                    searchTerm={globalSearch}
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
        onVerify={async (id, expiry) => {
          try {
            await verifyDoc({ id, expiry });
            setReviewDoc(null);
          } catch {}
        }}
        onReject={async (id, reason) => {
          try {
            await rejectDoc({ id, reason });
            setReviewDoc(null);
          } catch {}
        }}
      />

      <UploadModal
        isOpen={isUploadOpen}
        initialData={editDoc}
        onClose={() => {
          setIsUploadOpen(false);
          setEditDoc(null);
        }}
      />

      <ReminderModal
        isOpen={!!reminderCtx}
        onClose={() => setReminderCtx(null)}
        context={reminderCtx}
        onSend={(id, subject, message) => {
          console.log(`Sent to ${id}:`, { subject, message });
        }}
      />

      <ViewDocumentModal
        isOpen={!!viewDoc}
        onClose={() => setViewDoc(null)}
        document={viewDoc}
        onRevoke={async (id) => {
          await revokeDoc(id);
          setViewDoc(null);
        }}
        onDelete={async (id) => {
          if (
            confirm(
              "Are you absolutely sure you want to permanently delete this document?",
            )
          ) {
            try {
              await deleteDoc(id);
              setViewDoc(null);
            } catch {}
          }
        }}
        onSaveNote={async (id, note) => {
          await updateNote({ id, note });
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
        onSign={async (id, signatureDataUrl) => {
          try {
            await signContract({ id, signatureDataUrl });
            setContractDoc(null);
          } catch {}
        }}
      />

      <InspectionExecutionModal
        isOpen={!!activeInspection}
        onClose={() => setActiveInspection(null)}
        inspection={activeInspection}
        blueprintUrl={activeInspection?.images?.blueprint_bg}
      />

      {/* WIRED DELETE DIALOG WITH FIX */}
      <DeleteDialog
        isOpen={!!docToDelete}
        onClose={() => setDocToDelete(null)}
        onConfirm={async () => {
          if (docToDelete?.document_id) {
            try {
              await deleteDoc(docToDelete.document_id);
              setDocToDelete(null); // <-- FIXED: Auto-closes dialog upon success
            } catch (error) {
              console.error("Deletion failed", error);
            }
          }
        }}
        isDeleting={isPending}
        title="Delete Document"
        description={`Are you sure you want to delete ${docToDelete?.file_name || "this document"}? This action cannot be undone and may affect the customer's verification status.`}
      />
    </div>
  );
}
