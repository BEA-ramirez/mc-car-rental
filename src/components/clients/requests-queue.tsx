"use client";

import { useState } from "react"; // Removed useMemo
import { format } from "date-fns";
import { useClients } from "../../../hooks/use-clients";
import { useDebounce } from "../../../hooks/use-debounce"; // <-- IMPORT DEBOUNCE
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
  FileText,
  IdCard,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Inbox,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import ReviewModal from "./review-modal";

export default function RequestsQueue() {
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500); // <-- Add Debounce
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);

  // --- UPDATED: Tell the server EXACTLY what we want ---
  const {
    data: pendingUsers = [], // Rename data directly to pendingUsers
    isLoading,
    verifyApplicant,
    rejectApplicant,
  } = useClients({
    page: 1,
    limit: 50, // Grab up to 50 pending requests at a time for the queue
    search: debouncedSearch,
    statusFilter: ["pending"], // <-- THIS IS THE MAGIC KEY
    roleFilter: [],
  });

  // Note: We completely deleted the pendingUsers useMemo block!
  // The server handles the filtering now.

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

  return (
    <div className="flex flex-col h-full relative w-full bg-slate-50 min-h-0">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-slate-200 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Search applicants..."
            className="pl-8 h-8 w-64 text-xs font-medium bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:bg-white rounded-sm shadow-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Ready for Review
            </span>
          </div>
          <div className="w-px h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Awaiting Docs
            </span>
          </div>
        </div>
      </div>

      {/* QUEUE LIST */}
      <div className="flex-1 overflow-y-auto bg-white custom-scrollbar p-0">
        {pendingUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-50/50 py-20">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 border border-slate-200">
              <Inbox className="w-6 h-6 text-slate-300" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
              Queue is empty
            </span>
            <p className="text-xs text-slate-400 mt-1">
              No pending applications to review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {pendingUsers.map((user: any) => {
              const hasLicense = !!user.license_id_url;
              const hasValidId = !!user.valid_id_url;
              const isReady = hasLicense && hasValidId;

              return (
                <div
                  key={user.user_id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-slate-50 transition-colors group cursor-pointer",
                    isReady ? "bg-white" : "bg-slate-50/30",
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
                  <div className="flex items-center gap-4 min-w-[300px]">
                    <Avatar className="h-10 w-10 rounded-sm border border-slate-200">
                      <AvatarImage
                        src={user.profile_picture_url || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-xs font-bold bg-slate-100 text-slate-600 rounded-sm">
                        {getInitials(user.full_name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-bold text-slate-900 leading-none">
                          {toTitleCase(user.full_name)}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase tracking-widest h-4 px-1.5 rounded-sm bg-slate-100 text-slate-600 border-slate-200 shadow-none"
                        >
                          {toTitleCaseLine(user.role)}
                        </Badge>
                      </div>
                      <span className="text-xs font-mono text-slate-500">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {/* MIDDLE: Document Status */}
                  <div className="flex items-center gap-8 mt-4 sm:mt-0 flex-1 justify-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-400">
                        Driver's License
                      </span>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-sm border",
                          hasLicense
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200",
                        )}
                      >
                        {hasLicense ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
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
                          "flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-sm border",
                          hasValidId
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-slate-50 text-slate-500 border-slate-200",
                        )}
                      >
                        {hasValidId ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {hasValidId ? "Uploaded" : "Missing"}
                      </div>
                    </div>
                  </div>

                  {/* RIGHT: Action & Timestamp */}
                  <div className="flex flex-col items-end justify-center min-w-[180px] mt-4 sm:mt-0">
                    {isReady ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold uppercase tracking-widest bg-emerald-600 text-white border-emerald-700 h-6 px-3 rounded-sm shadow-sm flex items-center gap-1 mb-1"
                      >
                        <ShieldCheck className="w-3 h-3" /> Ready
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold uppercase tracking-widest bg-amber-100 text-amber-800 border-amber-200 h-6 px-3 rounded-sm shadow-none flex items-center gap-1 mb-1"
                      >
                        <Clock className="w-3 h-3" /> Waiting on User
                      </Badge>
                    )}
                    <span className="text-[10px] font-medium text-slate-400">
                      Applied:{" "}
                      {format(new Date(user.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>

                  {/* FAR RIGHT: Hover Reveal Button */}
                  <div className="hidden sm:flex items-center justify-end w-12 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-sm text-slate-400 hover:text-blue-600 hover:bg-blue-50"
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
