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
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Inbox,
  PanelRightClose,
  Plus,
  Calendar as CalendarIcon,
  Loader2,
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
import AdminBookingForm from "./admin-booking-form";
import { useScheduler } from "../../../hooks/use-scheduler";

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

    // Using the hook's mutation directly without local loading state!
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
    <div className="h-[calc(100vh-80px)] bg-slate-50 flex flex-col font-sans">
      {/* HEADER (Glassmorphism & Compact) */}
      <div className="h-16 px-6 border-b bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-6">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 leading-tight">
              Schedule Overview
            </h1>
            <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 mt-0.5">
              <CalendarIcon className="w-3.5 h-3.5" />
              {format(date, "MMMM yyyy")}
            </div>
          </div>
        </div>

        {/* TOOLBAR */}
        <div className="flex items-center bg-white border border-slate-200 rounded-md p-1 shadow-sm h-9 gap-1">
          {/* 1. COMPACT OVERRIDE TOGGLE */}
          <div
            className={cn(
              "flex items-center gap-1.5 px-2 h-7 rounded-sm transition-colors",
              isOverrideMode ? "bg-amber-50" : "hover:bg-slate-50",
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
                "text-[9px] font-bold uppercase tracking-wider cursor-pointer select-none",
                isOverrideMode ? "text-amber-700" : "text-slate-500",
              )}
            >
              Override
            </Label>
          </div>

          {/* Divider */}
          <div className="h-4 w-px bg-slate-200 mx-1" />

          {/* 2. NEW BOOKING (Primary Action) */}
          <Button
            size="sm"
            onClick={() => handleOpenNewBooking()}
            className="h-7 text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white px-3 rounded-sm shadow-none"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            New
          </Button>

          {/* 3. QUEUE TOGGLE (Ghost Action with Integrated Badge) */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "h-7 text-xs font-medium px-2.5 rounded-sm transition-all hover:bg-slate-100 text-slate-600",
              !isSidebarOpen &&
                pendingRequests.length > 0 &&
                "text-amber-700 hover:text-amber-800 hover:bg-amber-50",
            )}
          >
            {isSidebarOpen ? (
              <PanelRightClose className="w-4 h-4 mr-1.5 opacity-70" />
            ) : (
              <Inbox className="w-4 h-4 mr-1.5 opacity-70" />
            )}
            Queue
            {/* Conditional Micro-Badge */}
            {!isSidebarOpen && pendingRequests.length > 0 && (
              <span className="ml-1.5 flex h-4 min-w-[16px] items-center justify-center rounded-sm bg-amber-100 px-1 text-[9px] font-bold text-amber-700">
                {pendingRequests.length}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* TIMELINE */}
        <div className="flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out">
          {/* MODERN LOADING OVERLAY */}
          {loading && (
            <div className="absolute inset-0 z-50 bg-slate-50/40 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 transition-opacity">
              <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              <span className="text-sm font-semibold text-slate-700 tracking-tight">
                Syncing schedule...
              </span>
            </div>
          )}

          <TimelineScheduler
            resources={resources}
            events={confirmedEvents}
            ghostBooking={ghostBooking}
            isOverrideMode={isOverrideMode}
            // CRITICAL ADDITION: Keep the hook's date in sync with the timeline's view!
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
            onEditClick={(event) => console.log("Edit booking", event.id)}
            onResizeEvent={(event, newEnd) =>
              setResizeTarget({ event, newEnd })
            }
            onEarlyReturnClick={(evt) => setEarlyReturnTarget(evt)}
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
            onDeleteClick={(evt) => console.log("Delete", evt.id)}
          />
        </div>

        {/* SIDEBAR */}
        <div
          className={cn(
            "border-l bg-white shadow-2xl z-40 transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
            isSidebarOpen ? "w-[280px] opacity-100" : "w-0 opacity-0",
          )}
        >
          <div className="w-[280px] h-full flex flex-col">
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

      {/* DIALOGS */}
      <ProposalDialog
        isOpen={isProposalOpen}
        onClose={() => setIsProposalOpen(false)}
        onConfirm={handleConfirmProposal}
        original={originalBooking}
        proposed={ghostBooking}
        isSending={isReassigning} // Used the hook's state!
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

      {/* FORM SHEET */}
      <Sheet open={isFormOpen} onOpenChange={setIsFormOpen}>
        <SheetContent
          side="right"
          className="w-full sm:max-w-[800px] xl:max-w-[1000px] overflow-y-auto p-0 bg-slate-50 [&>button.absolute]:hidden"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Create New Booking</SheetTitle>
            <SheetDescription>
              Fill out the form to create a new vehicle booking.
            </SheetDescription>
          </SheetHeader>

          {isFormOpen && (
            <AdminBookingForm
              key={`${formPrefill?.carId}-${formPrefill?.startDate?.getTime()}-${formPrefill?.duration}`}
              initialCarId={formPrefill?.carId}
              initialStartDate={formPrefill?.startDate}
              initialDuration={formPrefill?.duration}
              onSuccess={() => setIsFormOpen(false)}
              onCancel={() => setIsFormOpen(false)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

export default BookingMain;
