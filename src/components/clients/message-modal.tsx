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
import { Mail, X, Send, Loader2, Info } from "lucide-react";
import { useClients } from "../../../hooks/use-clients"; // Adjust path if needed
import { cn } from "@/lib/utils";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string; // <-- NEW: Added userId to props
  recipientName: string;
  recipientEmail: string;
}

export default function MessageModal({
  isOpen,
  onClose,
  userId,
  recipientName,
  recipientEmail,
}: MessageModalProps) {
  // --- NEW: Destructure the custom email functions from your hook ---
  const { sendCustomEmail, isSendingCustomEmail } = useClients();

  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Reset the form every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setSubject("");
      setMessage("");
    }
  }, [isOpen]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) return;

    try {
      // --- UPDATED: Call the actual mutation ---
      await sendCustomEmail({
        userId,
        subject,
        body: message,
      });

      onClose(); // Close the modal upon success
    } catch (error) {
      console.error("Failed to send email:", error);
      // Toasts are already handled inside your hook, so no need to add them here
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col [&>button.absolute]:hidden bg-white">
        {/* CUSTOM HIGH-CONTRAST HEADER */}
        <DialogHeader className="px-5 py-4 border-b border-slate-200 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-blue-50 flex items-center justify-center border border-blue-100 shadow-sm">
              <Mail className="w-4 h-4 text-blue-600" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Compose Message
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                Secure System Communication
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={onClose}
            disabled={isSendingCustomEmail}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* FORM BODY */}
        <form onSubmit={handleSend} className="flex flex-col flex-1">
          <div className="p-5 space-y-4">
            {/* Read-Only Recipient Field */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                To
              </label>
              <div className="flex items-center h-9 px-3 bg-slate-50 border border-slate-200 rounded-sm overflow-hidden">
                <span className="text-xs font-bold text-slate-700 mr-1.5">
                  {recipientName}
                </span>
                <span className="text-xs font-mono text-slate-400">
                  &lt;{recipientEmail}&gt;
                </span>
              </div>
            </div>

            {/* Subject Line */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Subject
                <span className="text-red-500 text-[9px] lowercase normal-case font-medium">
                  *
                </span>
              </label>
              <Input
                autoFocus
                placeholder="e.g., Missing Document for KYC Verification"
                className="h-9 text-xs shadow-sm border-slate-200 rounded-sm focus-visible:ring-blue-500"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSendingCustomEmail}
                required
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-between">
                Message Body
                <span className="text-red-500 text-[9px] lowercase normal-case font-medium">
                  *
                </span>
              </label>
              <Textarea
                placeholder="Type your message here..."
                className="min-h-[160px] text-xs shadow-sm border-slate-200 rounded-sm resize-none focus-visible:ring-blue-500 leading-relaxed"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSendingCustomEmail}
                required
              />
            </div>

            {/* Helper Context Box */}
            <div className="flex items-start gap-2 bg-blue-50 p-3 rounded-sm border border-blue-100 mt-2">
              <Info className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-800 font-medium leading-relaxed">
                This message will be dispatched immediately via the official
                system Gmail account. A copy will not be saved locally.
              </p>
            </div>
          </div>

          {/* ACTION FOOTER */}
          <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSendingCustomEmail}
              className="h-9 text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-none border-slate-200 text-slate-600 hover:bg-white"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSendingCustomEmail || !subject.trim() || !message.trim()
              }
              className="h-9 min-w-[130px] text-[10px] font-bold uppercase tracking-widest rounded-sm shadow-none bg-blue-600 text-white hover:bg-blue-700 transition-colors"
            >
              {isSendingCustomEmail ? (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 mr-2" />
              )}
              {isSendingCustomEmail ? "Sending..." : "Send Email"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
