"use client";

import React, { useState, useEffect } from "react";
import TimelineScheduler, {
  SchedulerEvent,
  SchedulerResource,
} from "@/components/scheduler/timeline-scheduler";
import { getSchedulerData } from "@/actions/scheduler";
import {
  startOfMonth,
  endOfMonth,
  addMonths,
  addDays,
  differenceInHours,
} from "date-fns"; // Added differenceInHours
import PendingRequestsSidebar from "./pending-request-sidebar";
import ProposalDialog from "@/components/bookings/proposal-dialog";
import ResizeDialog from "@/components/bookings/resize-dialog";
import EarlyReturnDialog from "@/components/bookings/early-return-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Inbox, PanelRightClose, Plus } from "lucide-react";
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

function BookingMain() {
  const [date, setDate] = useState(new Date());
  const [resources, setResources] = useState<SchedulerResource[]>([]);
  const [events, setEvents] = useState<SchedulerEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // --- FORM SHEET STATE ---
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formPrefill, setFormPrefill] = useState<{
    carId?: string;
    startDate?: Date;
    duration?: number; // Added duration to prefill
  } | null>(null);

  // --- GHOST & PROPOSAL STATE ---
  const [selectedPendingId, setSelectedPendingId] = useState<string | null>(
    null,
  );
  const [ghostBooking, setGhostBooking] = useState<SchedulerEvent | null>(null);
  const [isProposalOpen, setIsProposalOpen] = useState(false);
  const [isSendingProposal, setIsSendingProposal] = useState(false);

  // --- RESIZE STATE ---
  const [resizeTarget, setResizeTarget] = useState<{
    event: SchedulerEvent;
    newEnd: Date;
  } | null>(null);
  const [isResizeSaving, setIsResizeSaving] = useState(false);

  // --- EARLY RETURN STATE ---
  const [earlyReturnTarget, setEarlyReturnTarget] =
    useState<SchedulerEvent | null>(null);
  const [isEarlyReturnProcessing, setIsEarlyReturnProcessing] = useState(false);

  // --- BUFFER RESIZE STATE ---
  const [bufferTarget, setBufferTarget] = useState<{
    event: SchedulerEvent;
    newBuffer: number;
  } | null>(null);
  const [isBufferSaving, setIsBufferSaving] = useState(false);

  // --- SPLIT TARGET STATES ---
  const [splitTarget, setSplitTarget] = useState<{
    event: SchedulerEvent;
    splitDate: Date;
  } | null>(null);
  const [isSplitProcessing, setIsSplitProcessing] = useState(false);

  // --- OVERRIDE BOOKING STATE ---
  const [isOverrideMode, setIsOverrideMode] = useState(false);

  // --- DATA FETCHING ---
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const start = startOfMonth(addMonths(date, -1));
      const end = endOfMonth(addMonths(date, 1));
      const { resources, events } = await getSchedulerData(start, end);
      setResources(resources);
      setEvents(events);
      setLoading(false);
    };
    fetchData();
  }, [date]);

  const pendingRequests = events.filter((e) => e.status === "pending");
  const confirmedEvents = events.filter((e) => e.status !== "pending");

  const originalBooking =
    pendingRequests.find((e) => e.id === selectedPendingId) || null;

  // --- OPEN FORM HANDLER (Updated to accept duration) ---
  const handleOpenNewBooking = (
    carId?: string,
    startDate?: Date,
    duration?: number,
  ) => {
    setFormPrefill({ carId, startDate, duration });
    setIsFormOpen(true);
  };

  // --- DRAG-TO-CREATE HANDLER ---
  const handleTimeRangeSelect = (
    resourceId: string,
    start: Date,
    end: Date,
  ) => {
    // Calculate difference in hours and convert to days (minimum 1 day)
    const diffHours = differenceInHours(end, start);
    const durationDays = Math.max(1, Math.ceil(diffHours / 24));

    // Open the form with the prefilled data
    handleOpenNewBooking(resourceId, start, durationDays);
  };

  // --- HANDLERS: SIDEBAR ---
  const handleSelectRequest = (req: SchedulerEvent) => {
    if (selectedPendingId === req.id) {
      setSelectedPendingId(null);
      setGhostBooking(null);
    } else {
      setSelectedPendingId(req.id);
      const resource = resources.find((r) => r.id === req.resourceId);
      setGhostBooking({
        ...req,
        subtitle: resource?.title || "Unknown Car",
      });
    }
  };

  // --- HANDLERS: GHOST MOVEMENT ---
  const handleGhostMove = (newResourceId: string) => {
    if (ghostBooking) {
      if (ghostBooking.resourceId !== newResourceId) {
        const newResource = resources.find((r) => r.id === newResourceId);
        setGhostBooking({
          ...ghostBooking,
          resourceId: newResourceId,
          subtitle: newResource?.title || "Unknown Car",
        });
      }
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
        console.log(
          `Overriding! VIP: ${req.title}, Victim: ${conflictingBooking.title}`,
        );

        const demotedVictim = {
          ...conflictingBooking,
          status: "pending" as const,
          subtitle: "⚠️ Displaced - Needs Reschedule",
        };

        const promotedVIP = {
          ...req,
          status: "confirmed" as const,
          subtitle: "Approved via Override",
        };

        setEvents((prev) =>
          prev.map((e) => {
            if (e.id === conflictingBooking.id) return demotedVictim;
            if (e.id === req.id) return promotedVIP;
            return e;
          }),
        );

        setSelectedPendingId(null);
        setGhostBooking(null);
      } else {
        if (ghostBooking && ghostBooking.resourceId !== req.resourceId) {
          setIsProposalOpen(true);
        } else {
          alert(
            "Cannot approve: Time slot is occupied. Enable Override to force.",
          );
        }
      }
    } else {
      if (ghostBooking && ghostBooking.resourceId !== req.resourceId) {
        setIsProposalOpen(true);
      } else {
        console.log("Standard Approval for:", req);
        setEvents((prev) =>
          prev.map((e) =>
            e.id === req.id ? { ...e, status: "confirmed" } : e,
          ),
        );
        setSelectedPendingId(null);
        setGhostBooking(null);
      }
    }
  };

  const handleConfirmProposal = async () => {
    if (!ghostBooking || !originalBooking) return;
    setIsSendingProposal(true);
    console.log("Sending Proposal:", {
      bookingId: originalBooking.id,
      newCarId: ghostBooking.resourceId,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSendingProposal(false);
    setIsProposalOpen(false);
    setSelectedPendingId(null);
    setGhostBooking(null);
  };

  const handleResizeEvent = (event: SchedulerEvent, newEnd: Date) => {
    setResizeTarget({ event, newEnd });
  };

  const confirmResize = async () => {
    if (!resizeTarget) return;
    setIsResizeSaving(true);
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === resizeTarget.event.id
          ? { ...evt, end: resizeTarget.newEnd }
          : evt,
      ),
    );
    await new Promise((r) => setTimeout(r, 800));
    setIsResizeSaving(false);
    setResizeTarget(null);
  };

  const handleConfirmEarlyReturn = async (
    refundAmount: number,
    shouldRefund: boolean,
  ) => {
    if (!earlyReturnTarget) return;
    setIsEarlyReturnProcessing(true);
    const newEndDate = new Date();
    const originalAmount = earlyReturnTarget.amount || 0;
    const finalPrice = shouldRefund
      ? originalAmount - refundAmount
      : originalAmount;
    setEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === earlyReturnTarget.id) {
          return {
            ...evt,
            end: newEndDate,
            status: "confirmed",
            amount: finalPrice,
            paymentStatus: "Paid",
            subtitle: "Returned Early",
          };
        }
        return evt;
      }),
    );
    await new Promise((r) => setTimeout(r, 1000));
    setIsEarlyReturnProcessing(false);
    setEarlyReturnTarget(null);
  };

  const handleAddMaintenance = (resourceId: string, startDate: Date) => {
    const newBlock: SchedulerEvent = {
      id: `maint-${Date.now()}`,
      resourceId: resourceId,
      start: startDate,
      end: addDays(startDate, 1),
      title: "Maintenance",
      subtitle: "Blocked",
      status: "maintenance",
    };
    setEvents((prev) => [...prev, newBlock]);
  };

  const handleResizeBuffer = (event: SchedulerEvent, newBuffer: number) => {
    setBufferTarget({ event, newBuffer });
  };

  const confirmBufferResize = async () => {
    if (!bufferTarget) return;
    setIsBufferSaving(true);
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === bufferTarget.event.id
          ? { ...evt, bufferDuration: bufferTarget.newBuffer }
          : evt,
      ),
    );
    await new Promise((r) => setTimeout(r, 600));
    setIsBufferSaving(false);
    setBufferTarget(null);
  };

  const handleSplitEvent = (event: SchedulerEvent, splitDate: Date) => {
    setSplitTarget({ event, splitDate });
  };

  const confirmSplit = async (finalSplitDate: Date) => {
    if (!splitTarget) return;
    setIsSplitProcessing(true);
    const { event } = splitTarget;
    const newEventId = `split-${Date.now()}`;

    const part1: SchedulerEvent = { ...event, end: finalSplitDate };
    const part2: SchedulerEvent = {
      ...event,
      id: newEventId,
      start: finalSplitDate,
      end: event.end,
      title: `${event.title} (Part 2)`,
      status: "pending",
    };

    setEvents((prev) => [
      ...prev.map((e) => (e.id === event.id ? part1 : e)),
      part2,
    ]);
    await new Promise((r) => setTimeout(r, 800));
    setIsSplitProcessing(false);
    setSplitTarget(null);
  };

  const handleStatusChange = async (
    event: SchedulerEvent,
    newStatus: string,
  ) => {
    console.log(`Updating status for ${event.id} to ${newStatus}`);

    // Optimistic UI Update
    setEvents((prev) =>
      prev.map((evt) =>
        evt.id === event.id ? { ...evt, status: newStatus as any } : evt,
      ),
    );

    // TODO: Call your Server Action here to update the DB
    // await updateBookingStatusInDB(event.id, newStatus);
  };

  return (
    <div className="h-[calc(100vh-80px)] bg-slate-50/50 flex flex-col">
      {/* HEADER */}
      <div className="h-14 px-6 border-b bg-white flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold tracking-tight text-slate-800">
            Booking Schedule
          </h1>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center space-x-2">
            <Switch
              id="override-mode"
              checked={isOverrideMode}
              onCheckedChange={setIsOverrideMode}
            />
            <Label
              htmlFor="override-mode"
              className={cn(
                "text-xs font-bold cursor-pointer",
                isOverrideMode ? "text-amber-600" : "text-slate-500",
              )}
            >
              {isOverrideMode ? "Override ON" : "Override OFF"}
            </Label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={() => handleOpenNewBooking()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" /> New Booking
          </Button>

          <Button
            variant={isSidebarOpen ? "ghost" : "outline"}
            size="sm"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "gap-2 transition-all",
              !isSidebarOpen &&
                pendingRequests.length > 0 &&
                "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100",
            )}
          >
            {isSidebarOpen ? (
              <PanelRightClose className="w-4 h-4" />
            ) : (
              <Inbox className="w-4 h-4" />
            )}
            {isSidebarOpen ? "Hide Queue" : "Pending Requests"}
            {!isSidebarOpen && pendingRequests.length > 0 && (
              <Badge
                variant="secondary"
                className="ml-1 bg-amber-200 text-amber-800 hover:bg-amber-300 h-5 px-1.5"
              >
                {pendingRequests.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* TIMELINE */}
        <div className="flex-1 flex flex-col relative min-w-0 transition-all duration-300 ease-in-out">
          {loading && (
            <div className="absolute inset-0 z-50 bg-white/50 flex items-center justify-center backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900"></div>
            </div>
          )}

          <TimelineScheduler
            resources={resources}
            events={confirmedEvents}
            ghostBooking={ghostBooking}
            isOverrideMode={isOverrideMode}
            onGhostMove={handleGhostMove}
            // Point click handler to form prefill
            onEmptyClick={(resourceId, clickedDate) => {
              if (ghostBooking) {
                handleGhostMove(resourceId);
              } else {
                handleOpenNewBooking(resourceId, clickedDate);
              }
            }}
            // Point Drag-to-Select handler to form prefill
            onTimeRangeSelect={handleTimeRangeSelect}
            onEditClick={(event) => console.log("Edit booking", event.id)}
            onResizeEvent={handleResizeEvent}
            onEarlyReturnClick={(evt) => setEarlyReturnTarget(evt)}
            onAddMaintenance={handleAddMaintenance}
            onResizeBuffer={handleResizeBuffer}
            onSplitEvent={handleSplitEvent}
            onStatusChange={handleStatusChange}
            onDeleteClick={(evt) => console.log("Delete", evt.id)}
          />
        </div>

        {/* SIDEBAR */}
        <div
          className={cn(
            "border-l bg-white shadow-xl z-40 transition-all duration-300 ease-in-out overflow-hidden flex flex-col",
            isSidebarOpen ? "w-[320px] opacity-100" : "w-0 opacity-0",
          )}
        >
          <div className="w-[320px] h-full flex flex-col">
            <PendingRequestsSidebar
              requests={pendingRequests}
              selectedId={selectedPendingId}
              onSelect={handleSelectRequest}
              onApprove={handleApproveClick}
              onReject={(req) => console.log("Reject", req)}
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
        isSending={isSendingProposal}
      />
      <ResizeDialog
        isOpen={!!resizeTarget}
        onClose={() => setResizeTarget(null)}
        onConfirm={confirmResize}
        event={resizeTarget?.event || null}
        newEnd={resizeTarget?.newEnd || null}
        isSaving={isResizeSaving}
      />
      <EarlyReturnDialog
        isOpen={!!earlyReturnTarget}
        onClose={() => setEarlyReturnTarget(null)}
        onConfirm={handleConfirmEarlyReturn}
        event={earlyReturnTarget}
        isProcessing={isEarlyReturnProcessing}
      />
      <BufferResizeDialog
        isOpen={!!bufferTarget}
        onClose={() => setBufferTarget(null)}
        onConfirm={confirmBufferResize}
        event={bufferTarget?.event || null}
        newBuffer={bufferTarget?.newBuffer || null}
        isSaving={isBufferSaving}
      />
      <SplitBookingDialog
        isOpen={!!splitTarget}
        onClose={() => setSplitTarget(null)}
        onConfirm={confirmSplit}
        event={splitTarget?.event || null}
        initialSplitDate={splitTarget?.splitDate || null}
        isProcessing={isSplitProcessing}
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
              initialDuration={formPrefill?.duration} // PASSING NEW PROP
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
