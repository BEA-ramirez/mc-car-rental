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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Calculator,
  X,
  Calendar as CalendarIcon,
  User,
  AlertCircle,
  CheckCircle,
  Loader2,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
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

  const [openOwner, setOpenOwner] = useState(false);
  const [selectedOwner, setSelectedOwner] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    if (prefilledOwnerId && isOpen) {
      setSelectedOwner(prefilledOwnerId);
    }
  }, [prefilledOwnerId, isOpen]);

  // Reset local state when modal closes
  useEffect(() => {
    if (!isOpen && !prefilledOwnerId) {
      setSelectedOwner("");
      setStartDate("");
      setEndDate("");
    }
  }, [isOpen, prefilledOwnerId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generatePayout({
        ownerId: selectedOwner,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
      });
      onClose();
    } catch (error) {
      console.error(error);
    }
  };

  // Helper to find the selected owner's display name
  const selectedOwnerName = selectedOwner
    ? fleetPartners?.find((p: any) => p.car_owner_id === selectedOwner)
        ?.business_name ||
      fleetPartners?.find((p: any) => p.car_owner_id === selectedOwner)?.users
        ?.email
    : "Choose an owner...";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[420px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col transition-colors duration-300 [&>button.absolute]:hidden">
        {/* HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
              <Calculator className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                Generate Payout
              </DialogTitle>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
                Owner Settlement
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

        <form onSubmit={handleGenerate} className="flex flex-col">
          <div className="p-4 space-y-4 bg-background transition-colors">
            {/* Searchable Owner Selection */}
            <div className="space-y-1.5 flex flex-col">
              <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                <User className="w-3 h-3" /> Fleet Owner
              </label>
              <Popover open={openOwner} onOpenChange={setOpenOwner}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openOwner}
                    className={cn(
                      "h-8 text-[11px] font-semibold bg-secondary border-border hover:bg-secondary/80 rounded-lg w-full justify-between px-3 shadow-none transition-colors",
                      !selectedOwner && "text-muted-foreground",
                    )}
                  >
                    <span className="truncate">{selectedOwnerName}</span>
                    <ChevronsUpDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-[388px] p-0 border-border bg-popover shadow-xl rounded-xl"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search owner..."
                      className="h-8 text-[11px]"
                    />
                    {/* Fixed Height & Scrollable Wrapper */}
                    <CommandList className="max-h-[200px] overflow-y-auto custom-scrollbar">
                      <CommandEmpty className="text-[10px] py-2 text-center text-muted-foreground">
                        No fleet owner found.
                      </CommandEmpty>
                      <CommandGroup>
                        {fleetPartners?.map((partner: any) => {
                          const displayName =
                            partner.business_name || partner.user?.full_name;
                          return (
                            <CommandItem
                              key={partner.car_owner_id}
                              value={displayName} // Used by CommandInput for searching
                              onSelect={() => {
                                setSelectedOwner(partner.car_owner_id);
                                setOpenOwner(false);
                              }}
                              className="text-[11px] font-medium cursor-pointer"
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-3.5 w-3.5 text-primary",
                                  selectedOwner === partner.car_owner_id
                                    ? "opacity-100"
                                    : "opacity-0",
                                )}
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-foreground">
                                  {displayName}
                                </span>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarIcon className="w-3 h-3" /> Start Date
                </label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-primary transition-colors"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                  <CalendarIcon className="w-3 h-3" /> End Date
                </label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 text-[11px] font-semibold bg-secondary border-border rounded-lg shadow-none focus-visible:ring-primary transition-colors"
                  required
                />
              </div>
            </div>

            {/* Information Banner */}
            <div className="bg-primary/5 border border-primary/20 p-3 rounded-xl flex gap-2.5 items-start shadow-sm transition-colors">
              <AlertCircle className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-0.5">
                  Batch Calculation
                </span>
                <span className="text-[10px] text-muted-foreground font-medium leading-relaxed">
                  Sweeps unsettled bookings and maintenance within these dates,
                  calculates commission, and locks them to a new record.
                </span>
              </div>
            </div>
          </div>

          <div className="bg-card border-t border-border p-3 shrink-0 flex justify-end gap-2 z-10 transition-colors">
            <Button
              type="button"
              variant="outline"
              className="h-8 px-4 text-[10px] font-semibold text-foreground bg-card hover:bg-secondary border-border rounded-lg shadow-none transition-colors"
              onClick={onClose}
              disabled={isGeneratingPayout}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                isGeneratingPayout || !selectedOwner || !startDate || !endDate
              }
              className="h-8 px-5 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
            >
              {isGeneratingPayout ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <CheckCircle className="w-3 h-3 mr-2" />
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
