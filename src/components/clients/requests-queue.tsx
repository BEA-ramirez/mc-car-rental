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
    statusFilter: ["PENDING"],
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
    <div className="flex flex-col h-full relative w-full bg-background min-h-0 transition-colors duration-300">
      {/* TOOLBAR */}
      <div className="flex items-center justify-between p-2.5 bg-card border-b border-border shrink-0 transition-colors">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search applicants..."
            className="pl-8 h-8 w-64 text-[11px] font-medium bg-secondary border-border focus-visible:ring-1 focus-visible:ring-primary rounded-lg shadow-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {isFetching && (
            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-4 pr-2">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-sm" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Ready for Review
            </span>
          </div>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Awaiting Docs
            </span>
          </div>
        </div>
      </div>

      {/* QUEUE LIST */}
      <div className="flex-1 overflow-y-auto bg-background custom-scrollbar p-0 transition-colors">
        {isLoading && !isFetching ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground py-20">
            <Loader2 className="w-6 h-6 animate-spin mb-3 text-primary" />
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Loading Queue...
            </span>
          </div>
        ) : pendingUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground bg-secondary/20 py-20 transition-colors">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-3 border border-border">
              <Inbox className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest">
              Queue is empty
            </span>
            <p className="text-[11px] text-muted-foreground/70 mt-1 font-medium">
              No pending applications to review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {pendingUsers.map((user: any) => {
              const hasLicense = !!user.license_id_url;
              const hasValidId = !!user.valid_id_url;
              const isReady = hasLicense || hasValidId;

              return (
                <div
                  key={user.user_id}
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-3 hover:bg-secondary/50 transition-colors group cursor-pointer",
                    !isReady &&
                      "bg-secondary/20 opacity-80 hover:bg-secondary/40",
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
                  <div className="flex items-center gap-3 min-w-64">
                    <Avatar className="h-8 w-8 rounded-lg border border-border bg-secondary">
                      <AvatarImage
                        src={user.profile_picture_url || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-[9px] font-bold text-foreground rounded-lg">
                        {getInitials(user.full_name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-foreground leading-none">
                          {toTitleCase(user.full_name)}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[8px] uppercase tracking-widest h-4 px-1.5 rounded bg-background text-muted-foreground border-border shadow-none font-bold"
                        >
                          {toTitleCaseLine(user.role)}
                        </Badge>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground mt-0.5">
                        {user.email}
                      </span>
                    </div>
                  </div>

                  {/* MIDDLE: Document Status */}
                  <div className="flex items-center gap-4 mt-3 sm:mt-0 flex-1 justify-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        Driver's License
                      </span>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border transition-colors",
                          hasLicense
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-secondary text-muted-foreground/70 border-border",
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

                    <div className="flex flex-col items-center gap-1">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        Secondary ID
                      </span>
                      <div
                        className={cn(
                          "flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded border transition-colors",
                          hasValidId
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                            : "bg-secondary text-muted-foreground/70 border-border",
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
                  <div className="flex flex-col items-end justify-center min-w-40 mt-3 sm:mt-0">
                    {isReady ? (
                      <Badge
                        variant="outline"
                        className="text-[9px] font-bold uppercase tracking-widest bg-primary text-primary-foreground border-primary hover:opacity-90 h-6 px-3 rounded-lg shadow-sm flex items-center gap-1.5 mb-1 transition-opacity"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" /> Review
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[8px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 h-5 px-2 rounded flex items-center gap-1.5 mb-1 shadow-none transition-colors"
                      >
                        <Clock className="w-3 h-3" /> Waiting on User
                      </Badge>
                    )}
                    <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
                      {format(new Date(user.created_at), "MMM dd, yyyy")}
                    </span>
                  </div>

                  {/* FAR RIGHT: Hover Reveal Button */}
                  <div className="hidden sm:flex items-center justify-end w-10 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
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
      <div className="flex items-center justify-between px-4 py-2 bg-card border-t border-border shrink-0 transition-colors">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Showing <span className="text-foreground">{pendingUsers.length}</span>{" "}
          of <span className="text-foreground">{totalCount}</span> requests
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="h-7 rounded-lg text-[9px] font-bold uppercase tracking-widest px-3 border-border hover:bg-secondary text-foreground transition-colors shadow-none"
          >
            <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
          </Button>
          <div className="flex items-center justify-center min-w-8 text-[11px] font-bold text-foreground font-mono">
            {currentPage} / {totalPages === 0 ? 1 : totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || isLoading}
            className="h-7 rounded-lg text-[9px] font-bold uppercase tracking-widest px-3 border-border hover:bg-secondary text-foreground transition-colors shadow-none"
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
