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
import { X, Plus, Receipt, FileText, Banknote } from "lucide-react";
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
      <DialogContent className="max-w-md p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm flex flex-col [&>button.absolute]:hidden">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-sm bg-emerald-50 border border-emerald-100 flex items-center justify-center shadow-sm">
              <Plus className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-slate-900 tracking-tight leading-none mb-1">
                Log Misc Income
              </DialogTitle>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-widest leading-none">
                Master Ledger Entry
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="p-5 space-y-5 bg-slate-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Banknote className="w-3 h-3" /> Amount (₱)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    ₱
                  </span>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="h-9 text-xs pl-7 font-bold text-slate-900 bg-white border-slate-200 shadow-sm rounded-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Receipt className="w-3 h-3" /> Category
                </label>
                <Select value={category} onValueChange={setCategory} required>
                  <SelectTrigger className="h-9 text-xs font-bold bg-white border-slate-200 shadow-sm rounded-sm">
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent className="rounded-sm border-slate-200">
                    <SelectItem
                      value="ASSET_SALE"
                      className="text-xs font-medium"
                    >
                      Asset Sale
                    </SelectItem>
                    <SelectItem
                      value="INSURANCE_PAYOUT"
                      className="text-xs font-medium"
                    >
                      Insurance Payout
                    </SelectItem>
                    <SelectItem
                      value="REFUND_RECEIVED"
                      className="text-xs font-medium"
                    >
                      Refund Received (Vendor)
                    </SelectItem>
                    <SelectItem
                      value="OTHER_INCOME"
                      className="text-xs font-medium"
                    >
                      Other Income
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3 h-3" /> Description & Reference
              </label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Sold old dashcam to external buyer"
                className="min-h-[80px] text-xs font-medium bg-white border-slate-200 shadow-sm rounded-sm resize-none focus-visible:ring-1 focus-visible:ring-slate-300"
                required
              />
            </div>
          </div>
          <div className="bg-white border-t border-slate-200 p-4 shrink-0 flex justify-end gap-2 z-10">
            <Button
              type="button"
              variant="ghost"
              className="h-9 px-4 text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-sm"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoggingMisc}
              className="h-9 px-4 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-sm shadow-sm transition-all"
            >
              {isLoggingMisc ? "Logging..." : "Log Income"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
