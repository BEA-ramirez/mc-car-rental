"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useClients } from "../../../hooks/use-clients";
import { useDebounce } from "../../../hooks/use-debounce";
import {
  getInitials,
  toTitleCase,
  toTitleCaseLine,
} from "@/actions/helper/format-text";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Inbox,
  Search,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ReviewModal from "./review-modal";

export default function RequestsQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10; // Items per page

  const {
    data: pendingUsers = [],
    isLoading,
    isFetching, // Useful for showing background refreshes
    totalCount,
    totalPages,
    verifyApplicant,
    rejectApplicant,
  } = useClients({
    page: currentPage,
    limit: limit,
    search: debouncedSearch,
    statusFilter: ["pending"],
    roleFilter: [],
  });

  const handleVerify = async (
    userId: string,
    licenseExpiry: string,
    validIdExpiry: string,
  ) => {
    try {
      await verifyApplicant({ userId, licenseExpiry, validIdExpiry });
      setSelectedDocument(null);
    } catch (error) {
      console.error("Failed to verify:", error);
    }
  };

  const handleReject = async (
    userId: string,
    reason: string,
    rejectLicense: boolean,
    rejectValidId: boolean,
  ) => {
    try {
      await rejectApplicant({ userId, reason, rejectLicense, rejectValidId });
      setSelectedDocument(null);
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  // Reset to page 1 when search changes
  useEffect(() => {
    if (debouncedSearch) {
      setCurrentPage(1);
    }
  }, [debouncedSearch]);

  return (
    <div className="flex flex-col h-full relative w-full bg-[#F8FAFC] min-h-0 border border-slate-200 shadow-sm rounded-sm overflow-hidden">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-slate-200 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search applicants..."
            className="pl-9 h-9 w-72 text-xs font-medium bg-[#F1F5F9] border-slate-200 focus-visible:ring-1 focus-visible:ring-blue-600 focus-visible:bg-white rounded-sm shadow-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-slate-400" />
          )}
        </div>
        <div className="flex items-center gap-4 pr-2">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Ready for Review
            </span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Awaiting Docs
            </span>
          </div>
        </div>
      </div>

      {/* QUEUE LIST */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar p-0">
        {isLoading && !isFetching ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 py-20">
            <Loader2 className="w-6 h-6 animate-spin mb-4 text-blue-600" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Loading Queue...
            </span>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-[#F8FAFC]/50 py-20">
            <div className="w-12 h-12 rounded-full bg-[#F1F5F9] flex items-center justify-center mb-4 border border-slate-200">
              <Inbox className="w-5 h-5 text-slate-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Queue is empty
            </span>
            <p className="text-xs text-slate-400 mt-2 font-medium">
              No pending applications to review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingUsers.map((user: any) => {
              const hasLicense = !!user.license_id_url;
              const hasValidId = !!user.valid_id_url;
              const isReady = hasLicense || hasValidId;

              return (
                <div
                  key={user.user_id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-[#F8FAFC] transition-colors group cursor-pointer",
                    !isReady && "bg-[#F8FAFC]/50 opacity-80",
                  )}
                  onClick={() => {
                    if (isReady) {
                      setSelectedDocument({
                        id: user.user_id,
                        customerName: user.full_name,
                        customerEmail: user.email,
                        customerPhone: user.phone_number || "N/A",
                        trustScore: user.trust_score || 5.0,
                        type: "Driver's License & Valid ID",
                        uploadedAt: format(
                          new Date(user.created_at),
                          "MMM dd, yyyy",
                        ),
                        status: "Pending Review",
                        licenseUrl: user.license_id_url,
                        validIdUrl: user.valid_id_url,
                      });
                    }
                  }}
                >
                  {/* LEFT: Applicant Info */}
                  <div className="flex items-center gap-4 min-w-72">
                    <Avatar className="h-10 w-10 rounded-sm border border-slate-200">
                      <AvatarImage
                        src={user.profile_picture_url || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xs font-bold bg-[#F1F5F9] text-slate-600 rounded-sm">
                        {getInitials(user.full_name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-[#0F172A] leading-none">
                          {toTitleCase(user.full_name)}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase tracking-widest h-4 px-1.5 rounded-sm bg-white text-slate-600 border-slate-200 shadow-none font-bold"
                        >
                          {toTitleCaseLine(user.role)}
                        </Badge>
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {/* MIDDLE: Document Status */}
                  <div className="flex items-center gap-6 mt-4 sm:mt-0 flex-1 justify-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Driver's License
                      </span>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm border",
                          hasLicense
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-[#F8FAFC] text-slate-400 border-slate-200",
                        )}
                      >
                        {hasLicense ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {hasLicense ? "Uploaded" : "Missing"}
                      </div>
                    </div>

                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Secondary ID
                      </span>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 rounded-sm border",
                          hasValidId
                            ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                            : "bg-[#F8FAFC] text-slate-400 border-slate-200",
                        )}
                      >
                        {hasValidId ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <XCircle className="w-3 h-3" />
                        )}
                        {hasValidId ? "Uploaded" : "Missing"}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Action & Timestamp */}
                  <div className="flex flex-col items-end justify-center min-w-45 mt-4 sm:mt-0">
                    {isReady ? (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold uppercase tracking-widest bg-[#2563EB] text-white border-blue-700 hover:bg-blue-700 h-6 px-3 rounded-sm shadow-sm flex items-center gap-1.5 mb-1.5"
                      >
                        <ShieldCheck className="w-3 h-3" /> Review
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border-amber-200 h-6 px-3 rounded-sm shadow-none flex items-center gap-1.5 mb-1.5"
                      >
                        <Clock className="w-3 h-3" /> Waiting on User
                      </Badge>
                    )}
                    <span className="text-[10px] font-medium uppercase tracking-widest text-slate-400">
                      {format(new Date(user.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>

                  {/* FAR RIGHT: Hover Reveal Button */}
                  <div className="hidden sm:flex items-center justify-end w-12 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-sm text-slate-400 hover:text-[#2563EB] hover:bg-blue-50"
                      disabled={!isReady}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAGINATION FOOTER */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 shrink-0">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          Showing <span className="text-[#0F172A]">{pendingUsers.length}</span>{" "}
          of <span className="text-[#0F172A]">{totalCount}</span> requests
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="h-8 rounded-sm text-[10px] font-bold uppercase tracking-widest px-3"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
          </Button>
          <div className="flex items-center justify-center min-w-8 text-xs font-bold text-[#0F172A]">
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="h-8 rounded-sm text-[10px] font-bold uppercase tracking-widest px-3"
          >
            Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>

      <ReviewModal
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        document={selectedDocument}
        onVerify={handleVerify}
        onReject={handleReject}
      />
    </div>
  );
}
