"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useDriverApplications } from "../../../hooks/use-drivers";
import { getInitials, toTitleCase } from "@/actions/helper/format-text";
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
  Mail,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import DriverReviewModal from "./driver-review-modal";
import MessageModal from "../clients/message-modal";

export default function DriverRequestsQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  const [messageRecipient, setMessageRecipient] = useState<{
    userId: string;
    name: string;
    email: string;
  } | null>(null);

  // Pagination State (Client-side for now since data payload is likely small for pending queue)
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // USE THE NEW HOOK
  const { pendingDrivers, isLoading, isFetching, verifyDriver, rejectDriver } =
    useDriverApplications();

  // Client-side search filtering
  const filteredDrivers = pendingDrivers.filter(
    (driver: any) =>
      driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      driver.email.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Client-side pagination
  const totalCount = filteredDrivers.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const paginatedDrivers = filteredDrivers.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const handleVerify = async (driverId: string) => {
    try {
      await verifyDriver({ driverId });
      setSelectedDocument(null);
    } catch (error) {
      console.error("Failed to verify:", error);
    }
  };

  const handleReject = async (driverId: string, reason: string) => {
    try {
      await rejectDriver({ driverId, reason });
      setSelectedDocument(null);
    } catch (error) {
      console.error("Failed to reject:", error);
    }
  };

  const handleMessageUser = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    setMessageRecipient({
      userId: user.user_id,
      name: user.full_name || "Applicant",
      email: user.email,
    });
  };

  return (
    <div className="flex flex-col h-125 w-full bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
      {/* TOOLBAR - Compact */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-slate-200 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search driver applicants..."
            className="pl-9 h-9 w-64 text-xs font-medium bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-[#0F172A] rounded-sm shadow-none transition-colors"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-slate-400" />
          )}
        </div>
        <div className="flex items-center gap-4 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Ready
            </span>
          </div>
          <div className="w-px h-3 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-sm"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Awaiting Docs
            </span>
          </div>
        </div>
      </div>

      {/* QUEUE LIST */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar p-0 relative">
        {isLoading && !isFetching ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-3 text-[#0F172A]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Loading Queue...
            </span>
          </div>
        ) : paginatedDrivers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8FAFC]/50 text-slate-400">
            <div className="w-10 h-10 rounded-sm bg-white flex items-center justify-center mb-3 border border-slate-200 shadow-sm">
              <Inbox className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F172A]">
              Queue is empty
            </span>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              No pending driver applications to review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedDrivers.map((driver: any) => {
              const hasLicense = !!driver.license_id_url;
              const hasValidId = !!driver.valid_id_url;
              const isReady = hasLicense || hasValidId;

              return (
                <div
                  key={driver.driver_id} // USING DRIVER ID NOW
                  className={cn(
                    "flex items-center justify-between px-4 py-3 hover:bg-[#F8FAFC] transition-colors group cursor-pointer",
                    !isReady && "bg-slate-50/50 opacity-70",
                  )}
                  onClick={() => {
                    if (isReady) {
                      setSelectedDocument({
                        id: driver.driver_id, // Pass the driver_id to the modal
                        customerName: driver.full_name,
                        customerEmail: driver.email,
                        customerPhone: driver.phone_number || "N/A",
                        trustScore: driver.trust_score || 5.0,
                        appliedAt: format(
                          new Date(driver.created_at),
                          "MMM dd, yyyy",
                        ),
                        licenseUrl: driver.license_id_url,
                        validIdUrl: driver.valid_id_url,
                      });
                    }
                  }}
                >
                  {/* LEFT: Applicant Info */}
                  <div className="flex items-center gap-3 w-[30%] min-w-50">
                    <Avatar className="h-9 w-9 rounded-sm border border-slate-200">
                      <AvatarImage
                        src={driver.profile_picture_url || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-[10px] font-bold bg-[#F1F5F9] text-slate-600 rounded-sm">
                        {getInitials(driver.full_name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-[#0F172A] truncate">
                          {toTitleCase(driver.full_name)}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 truncate">
                        {driver.email}
                      </span>
                    </div>
                  </div>

                  {/* MIDDLE: Document Status */}
                  <div className="hidden md:flex flex-col gap-1.5 w-[30%]">
                    <div className="flex items-center gap-2">
                      <div className="w-25 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        License
                      </div>
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                        {hasLicense ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                            <span className="text-emerald-700">Uploaded</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-300" />{" "}
                            <span className="text-slate-400">Missing</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-25 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Secondary ID
                      </div>
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                        {hasValidId ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />{" "}
                            <span className="text-emerald-700">Uploaded</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-300" />{" "}
                            <span className="text-slate-400">Missing</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Action & Timestamp */}
                  <div className="flex flex-col items-end justify-center w-[20%]">
                    {isReady ? (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold uppercase tracking-widest bg-[#0F172A] text-white border-[#0F172A] h-5 px-2 rounded-sm shadow-none flex items-center gap-1 mb-1"
                      >
                        <ShieldCheck className="w-3 h-3" /> Review
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold uppercase tracking-widest bg-amber-50 text-amber-600 border-amber-200 h-5 px-2 rounded-sm shadow-none flex items-center gap-1 mb-1"
                      >
                        <Clock className="w-3 h-3" /> Waiting
                      </Badge>
                    )}
                    <span className="text-[9px] font-medium uppercase tracking-widest text-slate-400">
                      {format(new Date(driver.created_at), "MMM dd, yy")}
                    </span>
                  </div>

                  {/* FAR RIGHT: Hover Reveal Buttons */}
                  <div className="flex items-center justify-end gap-1 w-[10%] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMessageUser(e, driver)}
                      className="h-7 w-7 rounded-sm text-slate-400 hover:text-[#0F172A] hover:bg-slate-100"
                      title="Send Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-sm text-slate-400 hover:text-[#2563EB] hover:bg-blue-50"
                      disabled={!isReady}
                      title="Review Application"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PAGINATION FOOTER - Compact */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#F8FAFC] border-t border-slate-200 shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
          Showing{" "}
          <span className="text-[#0F172A]">{paginatedDrivers.length}</span> of{" "}
          <span className="text-[#0F172A]">{totalCount}</span>
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="h-7 rounded-sm text-[9px] font-bold uppercase tracking-widest px-2.5 bg-white border-slate-200 shadow-none"
          >
            <ChevronLeft className="w-3 h-3 mr-1" /> Prev
          </Button>
          <div className="flex items-center justify-center min-w-8 text-[10px] font-bold text-[#0F172A]">
            {currentPage} / {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || isLoading}
            className="h-7 rounded-sm text-[9px] font-bold uppercase tracking-widest px-2.5 bg-white border-slate-200 shadow-none"
          >
            Next <ChevronRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* MODALS */}
      <DriverReviewModal
        isOpen={!!selectedDocument}
        onClose={() => setSelectedDocument(null)}
        document={selectedDocument}
        onVerify={handleVerify}
        onReject={handleReject}
      />

      <MessageModal
        isOpen={!!messageRecipient}
        onClose={() => setMessageRecipient(null)}
        userId={messageRecipient?.userId || ""}
        recipientName={messageRecipient?.name || ""}
        recipientEmail={messageRecipient?.email || ""}
      />
    </div>
  );
}
