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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Calculator,
  X,
  Calendar as CalendarIcon,
  User,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useFinancials } from "../../../hooks/use-financials";
import { useFleetPartners } from "../../../hooks/use-fleetPartners";

type GeneratePayoutModalProps = {
  isOpen: boolean;
  onClose: () => void;
  prefilledOwnerId?: string;
};

export default function GeneratePayoutModal({
  isOpen,
  onClose,
  prefilledOwnerId,
}: GeneratePayoutModalProps) {
  const { generatePayout, isGeneratingPayout } = useFinancials();
  const { data: fleetPartners } = useFleetPartners();

  const [selectedOwner, setSelectedOwner] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Pre-fill the owner if passed in from the sidebar
  useEffect(() => {
    if (prefilledOwnerId && isOpen) {
      setSelectedOwner(prefilledOwnerId);
    }
  }, [prefilledOwnerId, isOpen]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generatePayout({
        ownerId: selectedOwner,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      onClose();
      setStartDate("");
      setEndDate("");
      setSelectedOwner("");
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-slate-200 shadow-2xl rounded-sm [&>button.absolute]:hidden">
        <DialogHeader className="px-5 py-4 border-b border-slate-100 bg-slate-900 shrink-0 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-sm bg-white/10 flex items-center justify-center">
              <Calculator className="w-3.5 h-3.5 text-white" />
            </div>
            <DialogTitle className="text-sm font-bold text-white tracking-tight leading-none">
              Generate Owner Payout
            </DialogTitle>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10 rounded-sm"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <form onSubmit={handleGenerate} className="flex flex-col">
          <div className="p-5 space-y-5 bg-slate-50">
            {/* Owner Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3 h-3" /> Select Fleet Owner
              </label>
              <Select
                value={selectedOwner}
                onValueChange={setSelectedOwner}
                required
              >
                <SelectTrigger className="h-9 text-xs font-bold bg-white border-slate-200 shadow-sm rounded-sm">
                  <SelectValue placeholder="Choose an owner..." />
                </SelectTrigger>
                <SelectContent className="rounded-sm border-slate-200">
                  {fleetPartners?.map((partner: any) => (
                    <SelectItem
                      key={partner.car_owner_id}
                      value={partner.car_owner_id}
                      className="text-xs font-medium"
                    >
                      {partner.business_name || partner.user?.full_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarIcon className="w-3 h-3" /> Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-xs font-bold bg-white border-slate-200 shadow-sm rounded-sm"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarIcon className="w-3 h-3" /> End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-xs font-bold bg-white border-slate-200 shadow-sm rounded-sm"
                  required
                />
              </div>
            </div>

            {/* Information Banner */}
            <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-sm flex gap-3 items-start shadow-sm mt-2">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-0.5">
                  Batch Calculation
                </span>
                <span className="text-[10px] text-blue-700 font-medium leading-relaxed">
                  This action sweeps all{" "}
                  <strong className="font-bold">UNSETTLED</strong> bookings and
                  maintenance logs within these dates, calculates the platform
                  commission, and locks them to a new payout record.
                </span>
              </div>
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
              disabled={
                isGeneratingPayout || !selectedOwner || !startDate || !endDate
              }
              className="h-9 px-4 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-sm shadow-sm transition-all"
            >
              {isGeneratingPayout ? (
                "Calculating..."
              ) : (
                <>
                  <CheckCircle className="w-3.5 h-3.5 mr-2" /> Confirm &
                  Generate
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
