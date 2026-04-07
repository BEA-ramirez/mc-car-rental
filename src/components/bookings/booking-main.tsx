"use client";

import React, { useState } from "react";
import TimelineScheduler, {
  SchedulerEvent,
  SchedulerResource,
} from "@/components/scheduler/timeline-scheduler";
import { getSchedulerData } from "@/actions/scheduler";
import { differenceInHours, addDays, format } from "date-fns";
import PendingRequestsSidebar from "./pending-request-sidebar";
import ProposalDialog from "@/components/bookings/proposal-dialog";
import ResizeDialog from "@/components/bookings/resize-dialog";
import EarlyReturnDialog from "@/components/bookings/early-return-dialog";
import ExtendBookingDialog from "./extend-booking-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Inbox,
  PanelRightClose,
  Plus,
  Calendar as CalendarIcon,
  Loader2,
  Trash,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetHeader,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import BufferResizeDialog from "./buffer-resize-dialog";
import SplitBookingDialog from "./split-booking-dialog";
import DispatchDialog from "./dispatch-dialog";
import AdminBookingForm from "./admin-booking-form";
import { useScheduler } from "../../../hooks/use-scheduler";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

function BookingMain() {
  const [date, setDate] = useState(new Date());
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- HOOK ---
  const {
    data,
    isLoading: loading,
    updateStatus,
    updateDates,
    isUpdatingDates,
    updateBuffer,
    isUpdatingBuffer,
    processEarlyReturn,
    isProcessingEarlyReturn,
    createMaintenance,
    isCreatingMaintenance,
    splitBooking,
    isSplittingBooking,
    reassignBooking,
    isReassigning,
    deleteBooking,
    isDeleting,
  } = useScheduler(date);

  const resources = data?.resources || [];
  const events = data?.events || [];

  // --- FORM SHEET STATE ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formPrefill, setFormPrefill] = useState<{
    carId?: string;
    startDate?: Date;
    duration?: number;
  } | null>(null);

  // --- GHOST & PROPOSAL STATE ---
  const [selectedPendingId, setSelectedPendingId] = useState<string | null>(
    null,
  );
  const [ghostBooking, setGhostBooking] = useState<SchedulerEvent | null>(null);
  const [isProposalOpen, setIsProposalOpen] = useState(false);

  // --- TARGET STATES ---
  const [resizeTarget, setResizeTarget] = useState<{
    event: SchedulerEvent;
    newEnd: Date;
  } | null>(null);
  const [earlyReturnTarget, setEarlyReturnTarget] =
    useState<SchedulerEvent | null>(null);
  const [bufferTarget, setBufferTarget] = useState<{
    event: SchedulerEvent;
    newBuffer: number;
  } | null>(null);
  const [splitTarget, setSplitTarget] = useState<{
    event: SchedulerEvent;
    splitDate: Date;
  } | null>(null);
  const [extendTarget, setExtendTarget] = useState<SchedulerEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SchedulerEvent | null>(null);
  const [editTarget, setEditTarget] = useState<SchedulerEvent | null>(null);
  const [dispatchTarget, setDispatchTarget] = useState<SchedulerEvent | null>(
    null,
  );

  // --- SETTINGS STATE ---
  const [isOverrideMode, setIsOverrideMode] = useState(false);

  const pendingRequests = events.filter((e) => e.status === "pending");
  const confirmedEvents = events.filter((e) => e.status !== "pending");
  const originalBooking =
    pendingRequests.find((e) => e.id === selectedPendingId) || null;

  // --- HANDLERS ---
  const handleOpenNewBooking = (
    carId?: string,
    startDate?: Date,
    duration?: number,
  ) => {
    setFormPrefill({ carId, startDate, duration });
    setIsFormOpen(true);
  };

  const handleTimeRangeSelect = (
    resourceId: string,
    start: Date,
    end: Date,
  ) => {
    const diffHours = differenceInHours(end, start);
    const durationDays = Math.max(1, Math.ceil(diffHours / 24));
    handleOpenNewBooking(resourceId, start, durationDays);
  };

  const handleSelectRequest = (req: SchedulerEvent) => {
    if (selectedPendingId === req.id) {
      setSelectedPendingId(null);
      setGhostBooking(null);
    } else {
      setSelectedPendingId(req.id);
      const resource = resources.find((r) => r.id === req.resourceId);
      setGhostBooking({ ...req, subtitle: resource?.title || "Unknown Car" });
    }
  };

  const handleGhostMove = (newResourceId: string) => {
    if (ghostBooking && ghostBooking.resourceId !== newResourceId) {
      const newResource = resources.find((r) => r.id === newResourceId);
      setGhostBooking({
        ...ghostBooking,
        resourceId: newResourceId,
        subtitle: newResource?.title || "Unknown Car",
      });
    }
  };

  const handleApproveClick = (req: SchedulerEvent) => {
    const conflictingBooking = events.find(
      (e) =>
        e.resourceId === req.resourceId &&
        e.id !== req.id &&
        e.status === "confirmed" &&
        req.start < e.end &&
        req.end > e.start,
    );

    if (conflictingBooking) {
      if (isOverrideMode) {
        updateStatus({ id: req.id, status: "confirmed" });
        setSelectedPendingId(null);
        setGhostBooking(null);
      } else if (ghostBooking && ghostBooking.resourceId !== req.resourceId) {
        setIsProposalOpen(true);
      } else {
        alert(
          "Cannot approve: Time slot is occupied. Enable Override to force.",
        );
      }
    } else {
      if (ghostBooking && ghostBooking.resourceId !== req.resourceId) {
        setIsProposalOpen(true);
      } else {
        updateStatus({ id: req.id, status: "confirmed" });
        setSelectedPendingId(null);
        setGhostBooking(null);
      }
    }
  };

  const handleConfirmProposal = async (agreedPrice: number) => {
    if (!ghostBooking || !originalBooking) return;
    reassignBooking({
      id: originalBooking.id,
      newCarId: ghostBooking.resourceId,
      newPrice: agreedPrice,
    });
    setIsProposalOpen(false);
    setSelectedPendingId(null);
    setGhostBooking(null);
  };

  const confirmResize = async () => {
    if (!resizeTarget) return;
    updateDates({ id: resizeTarget.event.id, newEndDate: resizeTarget.newEnd });
    setResizeTarget(null);
  };

  const handleConfirmEarlyReturn = async (
    refundAmount: number,
    shouldRefund: boolean,
  ) => {
    if (!earlyReturnTarget) return;
    const originalAmount = earlyReturnTarget.amount || 0;
    processEarlyReturn({
      id: earlyReturnTarget.id,
      newEnd: new Date(),
      finalPrice: shouldRefund ? originalAmount - refundAmount : originalAmount,
      refundAmount,
      shouldRefund,
    });
    setEarlyReturnTarget(null);
  };

  const confirmBufferResize = async () => {
    if (!bufferTarget) return;
    updateBuffer({
      id: bufferTarget.event.id,
      newBuffer: bufferTarget.newBuffer,
    });
    setBufferTarget(null);
  };

  const confirmSplit = async (finalSplitDate: Date) => {
    if (!splitTarget) return;
    splitBooking({ id: splitTarget.event.id, splitDate: finalSplitDate });
    setSplitTarget(null);
  };

  return (
    <div className="flex flex-col h-[93vh] bg-background font-sans overflow-hidden transition-colors duration-300">
      {/* GLOBAL PAGE HEADER WITH INTEGRATED CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 pt-3 md:px-6 md:pt-4 shrink-0 gap-4 ">
        {/* Left Side: Tabs */}
        <div className="flex items-center gap-3"></div>

        {/* Right Side: Integrated Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {/* OVERRIDE TOGGLE */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 h-8 rounded-md transition-colors border",
              isOverrideMode
                ? "bg-amber-500/10 border-amber-500/30"
                : "bg-card border-border hover:bg-secondary",
            )}
          >
            <Switch
              id="override-mode"
              checked={isOverrideMode}
              onCheckedChange={setIsOverrideMode}
              className="scale-75 data-[state=checked]:bg-amber-500"
            />
            <Label
              htmlFor="override-mode"
              className={cn(
                "text-[9px] font-bold uppercase tracking-widest cursor-pointer select-none",
                isOverrideMode
                  ? "text-amber-600 dark:text-amber-400"
                  : "text-muted-foreground",
              )}
            >
              Override
            </Label>
          </div>

          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

          {/* NEW BOOKING */}
          <Button
            size="sm"
            onClick={() => handleOpenNewBooking()}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground px-3 rounded-md shadow-none transition-opacity"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New Booking
          </Button>

          {/* QUEUE TOGGLE */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "h-8 text-[10px] font-bold uppercase tracking-widest px-3 rounded-md shadow-none transition-all",
              !isSidebarOpen && pendingRequests.length > 0
                ? "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500/20"
                : "bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {isSidebarOpen ? (
              <PanelRightClose className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <Inbox className="w-3.5 h-3.5 mr-1.5" />
            )}
            Queue
            {!isSidebarOpen && pendingRequests.length > 0 && (
              <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded bg-amber-500 px-1 text-[9px] font-black text-amber-50">
                {pendingRequests.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* FULL-HEIGHT BODY WRAPPER */}
      {/* Note: overflow-hidden is critical here so the Timeline handles its own scrollbars! */}
      <div className="flex-1 w-full overflow-hidden bg-background">
        <div className="max-w-[1600px] mx-auto p-3 md:p-4 h-full flex flex-col">
          {/* MAIN CARD SPLIT (Timeline + Sidebar) */}
          <div className="flex-1 flex overflow-hidden bg-card border border-border rounded-xl shadow-sm relative transition-colors duration-300">
            {/* TIMELINE AREA */}
            <div className="flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out">
              {/* MODERN LOADING OVERLAY */}
              {loading && (
                <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 transition-opacity">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    Syncing schedule...
                  </span>
                </div>
              )}

              <TimelineScheduler
                resources={resources}
                events={confirmedEvents}
                ghostBooking={ghostBooking}
                isOverrideMode={isOverrideMode}
                onDateChange={(newDate) => setDate(newDate)}
                onGhostMove={handleGhostMove}
                onEmptyClick={(resourceId, clickedDate) => {
                  if (ghostBooking) {
                    handleGhostMove(resourceId);
                  } else {
                    handleOpenNewBooking(resourceId, clickedDate);
                  }
                }}
                onTimeRangeSelect={handleTimeRangeSelect}
                onResizeEvent={(event, newEnd) =>
                  setResizeTarget({ event, newEnd })
                }
                onEarlyReturnClick={(evt) => setEarlyReturnTarget(evt)}
                onExtendClick={(event) => setExtendTarget(event)}
                onAddMaintenance={(resourceId, startDate) =>
                  createMaintenance({
                    carId: resourceId,
                    start: startDate,
                    end: addDays(startDate, 1),
                  })
                }
                onResizeBuffer={(event, newBuffer) =>
                  setBufferTarget({ event, newBuffer })
                }
                onSplitEvent={(event, splitDate) =>
                  setSplitTarget({ event, splitDate })
                }
                onStatusChange={(event, newStatus) =>
                  updateStatus({ id: event.id, status: newStatus })
                }
                onDeleteClick={(evt) => setDeleteTarget(evt)}
                onEditClick={(evt) => setEditTarget(evt)}
                onDispatchClick={(evt) => setDispatchTarget(evt)}
              />
            </div>

            {/* QUEUE SIDEBAR */}
            <div
              className={cn(
                "border-l border-border bg-secondary/10 z-40 transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
                isSidebarOpen ? "w-[280px] opacity-100" : "w-0 opacity-0",
              )}
            >
              <div className="w-[280px] h-full flex flex-col custom-scrollbar overflow-y-auto">
                <PendingRequestsSidebar
                  requests={pendingRequests}
                  selectedId={selectedPendingId}
                  onSelect={handleSelectRequest}
                  onApprove={handleApproveClick}
                  onReject={(req) =>
                    updateStatus({ id: req.id, status: "rejected" })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* DIALOGS */}
      <ProposalDialog
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        onConfirm={handleConfirmProposal}
        original={originalBooking}
        proposed={ghostBooking}
        isSending={isReassigning}
      />
      <ResizeDialog
        isOpen={!!resizeTarget}
        onClose={() => setResizeTarget(null)}
        onConfirm={confirmResize}
        event={resizeTarget?.event || null}
        newEnd={resizeTarget?.newEnd || null}
        isSaving={isUpdatingDates}
      />
      <EarlyReturnDialog
        isOpen={!!earlyReturnTarget}
        onClose={() => setEarlyReturnTarget(null)}
        onConfirm={handleConfirmEarlyReturn}
        event={earlyReturnTarget}
        isProcessing={isProcessingEarlyReturn}
      />
      <BufferResizeDialog
        isOpen={!!bufferTarget}
        onClose={() => setBufferTarget(null)}
        onConfirm={confirmBufferResize}
        event={bufferTarget?.event || null}
        newBuffer={bufferTarget?.newBuffer || null}
        isSaving={isUpdatingBuffer}
      />
      <SplitBookingDialog
        isOpen={!!splitTarget}
        onClose={() => setSplitTarget(null)}
        onConfirm={confirmSplit}
        event={splitTarget?.event || null}
        initialSplitDate={splitTarget?.splitDate || null}
        isProcessing={isSplittingBooking}
      />
      <ExtendBookingDialog
        isOpen={!!extendTarget}
        onClose={() => setExtendTarget(null)}
        onConfirm={(newEnd) => {
          if (!extendTarget) return;
          updateDates({ id: extendTarget.id, newEndDate: newEnd });
          setExtendTarget(null);
        }}
        event={extendTarget}
        isSaving={isUpdatingDates}
      />
      <DispatchDialog
        key={dispatchTarget?.id || "empty"}
        open={!!dispatchTarget}
        onOpenChange={(open) => {
          if (!open) setDispatchTarget(null);
        }}
        booking={dispatchTarget}
      />

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={() => setDeleteTarget(null)}
      >
        <AlertDialogContent className="sm:max-w-[400px] border-destructive/20 bg-background shadow-2xl rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
              <Trash className="w-4 h-4" /> Delete Booking?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-muted-foreground leading-relaxed mt-2">
              This will permanently remove the booking for{" "}
              <b className="text-foreground font-bold">{deleteTarget?.title}</b>
              . This action cannot be undone and will delete all associated
              financial records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 border-t border-border pt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-8 text-[10px] font-semibold uppercase tracking-widest bg-card border-border hover:bg-secondary text-foreground rounded-lg shadow-none transition-colors"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="h-8 text-[10px] font-bold uppercase tracking-widest bg-destructive hover:opacity-90 text-destructive-foreground rounded-lg shadow-sm transition-opacity"
              disabled={isDeleting}
              onClick={(e) => {
                e.preventDefault();
                if (deleteTarget) {
                  deleteBooking(deleteTarget.id, {
                    onSuccess: () => setDeleteTarget(null),
                  });
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Yes, Delete Booking"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* FORM SHEET */}
      <Sheet
        open={isFormOpen || !!editTarget}
        onOpenChange={(open) => {
          if (!open) {
            setIsFormOpen(false);
            setEditTarget(null);
          }
        }}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-[800px] xl:max-w-[1000px] overflow-y-auto p-0 bg-background [&>button.absolute]:hidden shadow-2xl border-l border-border transition-colors duration-300"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>
              {editTarget ? "Edit Booking" : "Create New Booking"}
            </SheetTitle>
            <SheetDescription>
              {editTarget
                ? "Update booking details."
                : "Fill out the form to create a new vehicle booking."}
            </SheetDescription>
          </SheetHeader>

          {/* Render the form if we are creating OR editing */}
          {(isFormOpen || editTarget) && (
            <AdminBookingForm
              key={
                editTarget
                  ? `edit-${editTarget.id}`
                  : `create-${formPrefill?.carId}-${formPrefill?.startDate?.getTime()}`
              }
              bookingId={editTarget?.id}
              initialCarId={
                editTarget ? editTarget.resourceId : formPrefill?.carId
              }
              initialStartDate={
                editTarget ? new Date(editTarget.start) : formPrefill?.startDate
              }
              initialDuration={
                editTarget
                  ? Math.max(
                      1,
                      Math.ceil(
                        differenceInHours(
                          new Date(editTarget.end),
                          new Date(editTarget.start),
                        ) / 24,
                      ),
                    )
                  : formPrefill?.duration
              }
              onSuccess={() => {
                setIsFormOpen(false);
                setEditTarget(null);
              }}
              onCancel={() => {
                setIsFormOpen(false);
                setEditTarget(null);
              }}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default BookingMain;
