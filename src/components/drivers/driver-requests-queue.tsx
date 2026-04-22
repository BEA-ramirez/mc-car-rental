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
    <div className="flex flex-col h-[500px] w-full bg-background border border-border shadow-sm rounded-xl overflow-hidden transition-colors">
      {/* TOOLBAR - Compact */}
      <div className="flex items-center justify-between px-3 py-2.5 bg-card border-b border-border shrink-0 transition-colors">
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search driver applicants..."
            className="pl-8 h-8 w-64 text-[11px] font-medium bg-secondary border-border focus-visible:ring-1 focus-visible:ring-primary rounded-lg shadow-none transition-colors text-foreground"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset page on search
            }}
          />
          {isFetching && (
            <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
        <div className="flex items-center gap-4 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Ready
            </span>
          </div>
          <div className="w-px h-3 bg-border" />
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-sm"></span>
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              Awaiting Docs
            </span>
          </div>
        </div>
      </div>

      {/* QUEUE LIST */}
      <div className="flex-1 overflow-y-auto bg-background custom-scrollbar p-0 relative transition-colors">
        {isLoading && !isFetching ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 text-muted-foreground transition-colors">
            <Loader2 className="w-6 h-6 animate-spin mb-3 text-primary" />
            <span className="text-[9px] font-bold uppercase tracking-widest">
              Loading Queue...
            </span>
          </div>
        ) : paginatedDrivers.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-secondary/30 text-muted-foreground transition-colors">
            <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center mb-3 border border-border shadow-sm">
              <Inbox className="w-4 h-4 text-muted-foreground" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
              Queue is empty
            </span>
            <p className="text-[11px] text-muted-foreground/70 mt-1 font-medium">
              No pending driver applications to review.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {paginatedDrivers.map((driver: any) => {
              const hasLicense = !!driver.license_id_url;
              const hasValidId = !!driver.valid_id_url;
              const isReady = hasLicense || hasValidId;

              return (
                <div
                  key={driver.driver_id} // USING DRIVER ID NOW
                  className={cn(
                    "flex items-center justify-between px-4 py-2.5 hover:bg-secondary/50 transition-colors group cursor-pointer",
                    !isReady &&
                      "bg-secondary/20 opacity-70 hover:bg-secondary/40",
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
                  <div className="flex items-center gap-3 w-[30%] min-w-[200px]">
                    <Avatar className="h-8 w-8 rounded-lg border border-border bg-secondary">
                      <AvatarImage
                        src={driver.profile_picture_url || undefined}
                        className="object-cover"
                      />
                      <AvatarFallback className="text-[9px] font-bold bg-secondary text-foreground rounded-lg">
                        {getInitials(driver.full_name || "")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0 pr-2">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[11px] font-bold text-foreground truncate">
                          {toTitleCase(driver.full_name)}
                        </span>
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground truncate">
                        {driver.email}
                      </span>
                    </div>
                  </div>

                  {/* MIDDLE: Document Status */}
                  <div className="hidden md:flex flex-col gap-1.5 w-[30%]">
                    <div className="flex items-center gap-2">
                      <div className="w-[100px] text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        License
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold">
                        {hasLicense ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />{" "}
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Uploaded
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground/50" />{" "}
                            <span className="text-muted-foreground/70">
                              Missing
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-[100px] text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                        Secondary ID
                      </div>
                      <div className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest font-bold">
                        {hasValidId ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />{" "}
                            <span className="text-emerald-600 dark:text-emerald-400">
                              Uploaded
                            </span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-muted-foreground/50" />{" "}
                            <span className="text-muted-foreground/70">
                              Missing
                            </span>
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
                        className="text-[8px] font-bold uppercase tracking-widest bg-primary text-primary-foreground border-primary hover:opacity-90 h-5 px-2 rounded shadow-none flex items-center gap-1 mb-1 transition-opacity"
                      >
                        <ShieldCheck className="w-3 h-3" /> Review
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[8px] font-bold uppercase tracking-widest bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 h-5 px-2 rounded shadow-none flex items-center gap-1 mb-1 transition-colors"
                      >
                        <Clock className="w-3 h-3" /> Waiting
                      </Badge>
                    )}
                    <span className="text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
                      {format(new Date(driver.created_at), "MMM dd, yy")}
                    </span>
                  </div>

                  {/* FAR RIGHT: Hover Reveal Buttons */}
                  <div className="flex items-center justify-end gap-1 w-[10%] opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleMessageUser(e, driver)}
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                      title="Send Email"
                    >
                      <Mail className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
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
      <div className="flex items-center justify-between px-3 py-2 bg-card border-t border-border shrink-0 transition-colors">
        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
          Showing{" "}
          <span className="text-foreground">{paginatedDrivers.length}</span> of{" "}
          <span className="text-foreground">{totalCount}</span>
        </p>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1 || isLoading}
            className="h-7 rounded-lg text-[9px] font-bold uppercase tracking-widest px-2.5 bg-background border-border text-foreground hover:bg-secondary shadow-none transition-colors"
          >
            <ChevronLeft className="w-3 h-3 mr-1" /> Prev
          </Button>
          <div className="flex items-center justify-center min-w-8 text-[10px] font-bold text-foreground font-mono">
            {currentPage} / {totalPages === 0 ? 1 : totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages || isLoading}
            className="h-7 rounded-lg text-[9px] font-bold uppercase tracking-widest px-2.5 bg-background border-border text-foreground hover:bg-secondary shadow-none transition-colors"
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
