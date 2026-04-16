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
import { useClients } from "../../../hooks/use-clients";
import { cn } from "@/lib/utils";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
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
  const { sendCustomEmail, isSendingCustomEmail } = useClients(null);

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
      await sendCustomEmail({
        userId,
        subject,
        body: message,
      });

      onClose(); // Close the modal upon success
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] p-0 overflow-hidden border-border shadow-2xl rounded-2xl flex flex-col [&>button.absolute]:hidden bg-background transition-colors duration-300">
        {/* CUSTOM HIGH-CONTRAST HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm transition-colors">
              <Mail className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                Compose Message
              </DialogTitle>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Secure System Communication
              </span>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
            onClick={onClose}
            disabled={isSendingCustomEmail}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* FORM BODY */}
        <form onSubmit={handleSend} className="flex flex-col flex-1">
          <div className="p-5 space-y-4 bg-background transition-colors">
            {/* Read-Only Recipient Field */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                To
              </label>
              <div className="flex items-center h-8 px-3 bg-secondary/50 border border-border rounded-lg overflow-hidden transition-colors">
                <span className="text-[11px] font-bold text-foreground mr-1.5 truncate">
                  {recipientName}
                </span>
                <span className="text-[10px] font-mono text-muted-foreground truncate">
                  &lt;{recipientEmail}&gt;
                </span>
              </div>
            </div>

            {/* Subject Line */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                Subject
                <span className="text-destructive text-[9px] font-bold">*</span>
              </label>
              <Input
                autoFocus
                placeholder="e.g., Missing Document for KYC Verification"
                className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-1 focus-visible:ring-primary transition-colors text-foreground"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                disabled={isSendingCustomEmail}
                required
              />
            </div>

            {/* Message Body */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center justify-between">
                Message Body
                <span className="text-destructive text-[9px] font-bold">*</span>
              </label>
              <Textarea
                placeholder="Type your message here..."
                className="min-h-[140px] text-[11px] font-medium bg-secondary border-border rounded-lg shadow-none resize-none focus-visible:ring-1 focus-visible:ring-primary leading-relaxed transition-colors text-foreground"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={isSendingCustomEmail}
                required
              />
            </div>

            {/* Helper Context Box */}
            <div className="flex items-start gap-2 bg-primary/10 p-3 rounded-lg border border-primary/20 mt-1 transition-colors">
              <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <p className="text-[10px] text-primary/80 font-bold uppercase tracking-widest leading-relaxed">
                This message will be dispatched immediately via the official
                system Gmail account. A copy will not be saved locally.
              </p>
            </div>
          </div>

          {/* ACTION FOOTER */}
          <div className="px-5 py-3 border-t border-border bg-card flex items-center justify-end gap-2 shrink-0 transition-colors">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSendingCustomEmail}
              className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-none border-border bg-background text-foreground hover:bg-secondary transition-colors"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isSendingCustomEmail || !subject.trim() || !message.trim()
              }
              className="h-8 min-w-[120px] text-[10px] font-bold uppercase tracking-widest rounded-lg shadow-sm bg-primary hover:opacity-90 text-primary-foreground transition-opacity"
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
