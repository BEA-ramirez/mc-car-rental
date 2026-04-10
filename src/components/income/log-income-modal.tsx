"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { X, Plus, Receipt, FileText, Banknote, Loader2 } from "lucide-react";
import { useIncomes } from "../../../hooks/use-incomes";

type LogIncomeModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function LogIncomeModal({
  isOpen,
  onClose,
}: LogIncomeModalProps) {
  const { logMisc, isLoggingMisc } = useIncomes();

  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category) return;

    await logMisc({
      amount: parseFloat(amount),
      category,
      notes,
    });

    setAmount("");
    setCategory("");
    setNotes("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[400px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col transition-colors duration-300 [&>button.absolute]:hidden">
        <DialogHeader className="px-4 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                Log Misc Income
              </DialogTitle>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Master Ledger Entry
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-4 space-y-4 bg-background transition-colors">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Banknote className="w-3 h-3" /> Amount (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[11px] font-bold text-muted-foreground">
                    ₱
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-8 text-[11px] pl-7 font-bold text-foreground bg-secondary border-border shadow-none rounded-lg focus-visible:ring-emerald-500 transition-colors"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <Receipt className="w-3 h-3" /> Category
                </label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="h-8 w-full text-[11px] font-bold text-foreground bg-secondary border-border shadow-none rounded-lg focus:ring-emerald-500 transition-colors">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-border bg-popover shadow-xl">
                    <SelectItem
                      value="ASSET_SALE"
                      className="text-[11px] font-medium transition-colors focus:bg-secondary"
                    >
                      Asset Sale
                    </SelectItem>
                    <SelectItem
                      value="INSURANCE_PAYOUT"
                      className="text-[11px] font-medium transition-colors focus:bg-secondary"
                    >
                      Insurance Payout
                    </SelectItem>
                    <SelectItem
                      value="REFUND_RECEIVED"
                      className="text-[11px] font-medium transition-colors focus:bg-secondary"
                    >
                      Refund Received (Vendor)
                    </SelectItem>
                    <SelectItem
                      value="OTHER_INCOME"
                      className="text-[11px] font-medium transition-colors focus:bg-secondary"
                    >
                      Other Income
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Description & Reference
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Sold old dashcam to external buyer"
                className="min-h-[70px] text-[11px] font-medium text-foreground bg-secondary border-border shadow-none rounded-lg resize-none focus-visible:ring-1 focus-visible:ring-emerald-500 transition-colors"
                required
              />
            </div>
          </div>

          <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end gap-2 z-10 transition-colors">
            <Button
              type="button"
              variant="outline"
              className="h-8 px-4 text-[10px] font-semibold text-foreground hover:bg-secondary border-border shadow-none rounded-lg transition-colors"
              onClick={onClose}
              disabled={isLoggingMisc}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoggingMisc || !amount || !category}
              className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
            >
              {isLoggingMisc ? (
                <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
              ) : null}
              {isLoggingMisc ? "Logging..." : "Log Income"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
