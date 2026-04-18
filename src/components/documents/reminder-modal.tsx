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
      <DialogContent className="max-w-[450px] p-0 border-border shadow-2xl rounded-xl flex flex-col max-h-[90vh] bg-background transition-colors duration-300 [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground uppercase tracking-wider leading-none mb-1">
                Send Notification
              </DialogTitle>
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                {context.type === "expiry"
                  ? "Document Expiry Reminder"
                  : "Contract Signature Reminder"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors"
            onClick={onClose}
            disabled={isSending}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* BODY */}
        <div className="p-4 bg-background space-y-4 overflow-y-auto flex-1 custom-scrollbar">
          {/* Context Banner */}
          <div className="bg-card border border-border rounded-xl p-3 flex items-center gap-3 shadow-sm transition-colors">
            <div className="w-8 h-8 rounded-lg bg-secondary border border-border flex items-center justify-center shrink-0">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex flex-col flex-1 truncate pr-2">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                Recipient
              </span>
              <span className="text-[11px] font-bold text-foreground leading-none truncate">
                {context.customerName}
              </span>
            </div>
            <div className="flex flex-col text-right pl-3 border-l border-border shrink-0 max-w-[150px]">
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">
                Destination
              </span>
              <span className="text-[11px] font-medium text-foreground leading-none truncate">
                {context.customerEmail}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            {/* Subject Field */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                Subject Line
              </label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="h-8 text-[11px] font-semibold text-foreground bg-secondary border-border shadow-none rounded-lg focus-visible:ring-primary transition-colors"
              />
            </div>

            {/* Message Body Field */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex justify-between items-end">
                <span>Message Body</span>
                <span className="normal-case font-medium text-[9px] text-muted-foreground/70">
                  Editable template
                </span>
              </label>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="min-h-[120px] text-[11px] font-medium leading-relaxed text-foreground bg-secondary border-border shadow-none rounded-lg resize-y focus-visible:ring-primary p-3 transition-colors custom-scrollbar"
              />
            </div>
          </div>

          {/* Quick Context Hint */}
          <div className="flex items-start gap-2.5 text-[10px] font-medium text-muted-foreground bg-secondary/50 p-2.5 rounded-lg border border-border transition-colors shadow-sm">
            {context.type === "expiry" ? (
              <Clock className="w-3.5 h-3.5 text-orange-500 dark:text-orange-400 shrink-0 mt-0.5" />
            ) : (
              <FileSignature className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            )}
            <p className="leading-relaxed">
              An automated log of this communication will be saved to the
              customer&apos;s profile history upon sending.
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="bg-card border-t border-border p-3 shrink-0 flex gap-2 justify-end transition-colors">
          <Button
            variant="outline"
            className="h-8 px-4 text-[10px] font-semibold text-foreground bg-card hover:bg-secondary border-border rounded-lg shadow-none transition-colors"
            onClick={onClose}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button
            className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
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
