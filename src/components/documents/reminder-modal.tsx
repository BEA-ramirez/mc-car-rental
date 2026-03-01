"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send, X, Mail, Clock, FileSignature, User } from "lucide-react";

export type ReminderContext = {
  id: string;
  customerName: string;
  customerEmail: string;
  type: "expiry" | "contract";
  documentName?: string; // e.g., "Driver's License"
  daysLeft?: number;
  bookingRef?: string;
};

type ReminderModalProps = {
  isOpen: boolean;
  onClose: () => void;
  context: ReminderContext | null;
  onSend: (id: string, subject: string, message: string) => void;
};

export default function ReminderModal({
  isOpen,
  onClose,
  context,
  onSend,
}: ReminderModalProps) {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  // Auto-generate the template based on the context when the modal opens
  useEffect(() => {
    if (isOpen && context) {
      if (context.type === "expiry") {
        setSubject(
          `Action Required: Your ${context.documentName} is expiring soon`,
        );
        setMessage(
          `Hi ${context.customerName},\n\nThis is a friendly reminder from our administrative team that your ${context.documentName} on file will expire in ${context.daysLeft} days.\n\nTo ensure no interruptions for your future bookings, please log into your account and upload a renewed copy of your document at your earliest convenience.\n\nThank you,\nThe Management Team`,
        );
      } else if (context.type === "contract") {
        setSubject(
          `Signature Required: Rental Agreement for Booking ${context.bookingRef}`,
        );
        setMessage(
          `Hi ${context.customerName},\n\nWe noticed that you have an upcoming rental (Booking Ref: ${context.bookingRef}), but your Rental Agreement remains unsigned.\n\nPlease review and electronically sign the document via your dashboard prior to vehicle pickup to ensure a smooth handover process.\n\nThank you,\nThe Management Team`,
        );
      }
    } else {
      setSubject("");
      setMessage("");
      setIsSending(false);
    }
  }, [isOpen, context]);

  if (!context) return null;

  const handleSend = () => {
    setIsSending(true);
    // Simulate network delay for UX purposes
    setTimeout(() => {
      onSend(context.id, subject, message);
      onClose();
    }, 600);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* IMPROVED: max-h-[90vh] flex flex-col to force internal scrolling if needed */}
      <DialogContent className="max-w-[500px] p-0 border-slate-200 shadow-2xl rounded-sm flex flex-col max-h-[90vh] [&>button.absolute]:hidden">
        {/* HEADER - Tighter padding */}
        <DialogHeader className="px-4 py-3 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
              <Mail className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Send Notification
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                {context.type === "expiry"
                  ? "Document Expiry Reminder"
                  : "Contract Signature Reminder"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={onClose}
            disabled={isSending}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* BODY - overflow-y-auto to handle short screens cleanly */}
        <div className="p-4 bg-slate-50 space-y-4 overflow-y-auto flex-1">
          {/* Context Banner */}
          <div className="bg-white border border-slate-200 rounded-sm p-2.5 flex items-center gap-2.5 shadow-sm">
            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
              <User className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex flex-col flex-1 truncate">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                Recipient
              </span>
              <span className="text-xs font-bold text-slate-800 leading-none truncate">
                {context.customerName}
              </span>
            </div>
            <div className="flex flex-col text-right pl-3 border-l border-slate-100 shrink-0">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider leading-none mb-1">
                Email Destination
              </span>
              <span className="text-[10px] font-medium text-slate-600 leading-none">
                {context.customerEmail}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Subject Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Subject Line
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-8 text-xs font-semibold bg-white border-slate-200 shadow-sm rounded-sm focus-visible:ring-1 focus-visible:ring-slate-300"
              />
            </div>

            {/* Message Body Field - Reduced min-height */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-end">
                <span>Message Body</span>
                <span className="normal-case font-medium text-[9px] text-slate-400">
                  Editable template
                </span>
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] text-xs font-medium leading-relaxed bg-white border-slate-200 shadow-sm rounded-sm resize-y focus-visible:ring-1 focus-visible:ring-slate-300 p-2.5"
              />
            </div>
          </div>

          {/* Quick Context Hint - Fixed className typo */}
          <div className="flex items-start gap-2 text-[10px] font-medium text-slate-500 bg-slate-100/50 p-2 rounded-sm border border-slate-200/60">
            {context.type === "expiry" ? (
              <Clock className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
            ) : (
              <FileSignature className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
            )}
            <p className="leading-tight">
              An automated log of this communication will be saved to the
              customer's profile history upon sending.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-white border-t border-slate-200 p-3 shrink-0 flex gap-2 justify-end">
          <Button
            variant="ghost"
            className="h-8 px-4 text-xs font-bold text-slate-600 rounded-sm hover:text-slate-900 hover:bg-slate-100"
            onClick={onClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            className="h-8 px-6 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-sm shadow-sm"
            onClick={handleSend}
            disabled={isSending || !subject.trim() || !message.trim()}
          >
            <Send className="w-3.5 h-3.5 mr-2" />
            {isSending ? "Dispatching..." : "Send Reminder"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
