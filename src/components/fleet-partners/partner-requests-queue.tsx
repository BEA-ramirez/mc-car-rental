"use client";

import { useState } from "react";
import { format } from "date-fns";
import { getInitials, toTitleCase } from "@/actions/helper/format-text";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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

// Assuming you have or will create these matching the driver equivalents
import { useFleetPartnerApplications } from "../../../hooks/use-fleetPartners";
import MessageModal from "../clients/message-modal";
import PartnerReviewModal from "./partner-review-modal";

export default function PartnerRequestsQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPartner, setSelectedPartner] = useState<any | null>(null);
  const [messageRecipient, setMessageRecipient] = useState<{
    userId: string;
    name: string;
    email: string;
  } | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;

  // Use your fleet partner application hook (make sure to create this if you haven't!)
  const {
    pendingPartners,
    isLoading,
    isFetching,
    approvePartner,
    rejectPartner,
  } = useFleetPartnerApplications();

  // Client-side search filtering
  const filteredPartners =
    pendingPartners?.filter((partner: any) => {
      const name =
        partner.business_name ||
        `${partner.users?.first_name} ${partner.users?.last_name}` ||
        "";
      return (
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        partner.users?.email?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }) || [];

  // Client-side pagination
  const totalCount = filteredPartners.length;
  const totalPages = Math.ceil(totalCount / limit) || 1;
  const paginatedPartners = filteredPartners.slice(
    (currentPage - 1) * limit,
    currentPage * limit,
  );

  const handleMessageUser = (e: React.MouseEvent, user: any) => {
    e.stopPropagation();
    setMessageRecipient({
      userId: user.user_id,
      name: user.first_name
        ? `${user.first_name} ${user.last_name}`
        : "Applicant",
      email: user.email,
    });
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border border-slate-200 shadow-sm rounded-sm overflow-hidden">
      {/* --- TOOLBAR --- */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#F8FAFC] border-b border-slate-200 shrink-0">
        <div className="relative flex items-center">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search partner applications..."
            className="pl-9 h-9 w-64 text-xs font-medium bg-white border-slate-200 focus-visible:ring-1 focus-visible:ring-[#0F172A] rounded-sm shadow-none transition-colors"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
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
              Missing Info
            </span>
          </div>
        </div>
      </div>

      {/* --- QUEUE LIST --- */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar p-0 relative">
        {isLoading && !isFetching ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white z-10 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin mb-3 text-[#0F172A]" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Loading Queue...
            </span>
          </div>
        ) : paginatedPartners.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#F8FAFC]/50 text-slate-400">
            <div className="w-10 h-10 rounded-sm bg-white flex items-center justify-center mb-3 border border-slate-200 shadow-sm">
              <Inbox className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F172A]">
              Queue is empty
            </span>
            <p className="text-[11px] text-slate-400 mt-1 font-medium">
              No pending fleet partner applications to review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {paginatedPartners.map((partner: any) => {
              const displayName =
                partner.business_name ||
                `${partner.users?.first_name} ${partner.users?.last_name}`;

              // Custom readiness logic for Partners
              const hasBankInfo = !!partner.bank_account_number;
              const hasContactInfo = !!partner.users?.phone_number;
              const isReady = hasBankInfo && hasContactInfo;

              return (
                <div
                  key={partner.car_owner_id}
                  className={cn(
                    "flex items-center justify-between px-4 py-3 hover:bg-[#F8FAFC] transition-colors group cursor-pointer",
                    !isReady && "bg-slate-50/50 opacity-70",
                  )}
                  onClick={() => {
                    if (isReady) setSelectedPartner(partner);
                  }}
                >
                  {/* LEFT: Applicant Info */}
                  <div className="flex items-center gap-3 w-[30%] min-w-[200px]">
                    <Avatar className="h-9 w-9 rounded-sm border border-slate-200">
                      <AvatarImage
                        src={partner.users?.profile_picture_url || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-[10px] font-bold bg-[#F1F5F9] text-slate-600 rounded-sm">
                        {getInitials(displayName)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-[#0F172A] truncate">
                          {toTitleCase(displayName)}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-slate-500 truncate">
                        {partner.users?.email}
                      </span>
                    </div>
                  </div>

                  {/* MIDDLE: Data Status Checks */}
                  <div className="hidden md:flex flex-col gap-1.5 w-[30%]">
                    <div className="flex items-center gap-2">
                      <div className="w-[100px] text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Bank Details
                      </div>
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                        {hasBankInfo ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-700">Provided</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-300" />
                            <span className="text-slate-400">Missing</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-[100px] text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Contact Info
                      </div>
                      <div className="flex items-center gap-1 text-[10px] uppercase tracking-widest font-bold">
                        {hasContactInfo ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-emerald-700">Verified</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-slate-300" />
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
                      {format(new Date(partner.created_at), "MMM dd, yy")}
                    </span>
                  </div>

                  {/* FAR RIGHT: Hover Reveal Buttons */}
                  <div className="flex items-center justify-end gap-1 w-[10%] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMessageUser(e, partner.users)}
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

      {/* --- PAGINATION FOOTER --- */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#F8FAFC] border-t border-slate-200 shrink-0">
        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
          Showing{" "}
          <span className="text-[#0F172A]">{paginatedPartners.length}</span> of{" "}
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

      {/* --- MODALS --- */}
      {selectedPartner && (
        <PartnerReviewModal
          isOpen={!!selectedPartner}
          onClose={() => setSelectedPartner(null)}
          partner={selectedPartner}
          onApprove={approvePartner}
          onReject={rejectPartner}
        />
      )}

      {messageRecipient && (
        <MessageModal
          isOpen={!!messageRecipient}
          onClose={() => setMessageRecipient(null)}
          userId={messageRecipient.userId}
          recipientName={messageRecipient.name}
          recipientEmail={messageRecipient.email}
        />
      )}
    </div>
  );
}
