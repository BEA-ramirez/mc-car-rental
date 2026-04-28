"use client";

import React from "react";
import { format } from "date-fns";
import { FleetPartnerType } from "@/lib/schemas/car-owner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Wallet,
  TrendingUp,
  Percent,
  Loader2,
  FileText,
  ArrowRight,
  Download,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePartnerPayoutHistory } from "../../../hooks/use-fleetPartners";

interface PartnerFinancialsProps {
  selectedPartner: FleetPartnerType | null;
}

export default function PartnerFinancials({
  selectedPartner,
}: PartnerFinancialsProps) {
  const { data: payouts, isLoading } = usePartnerPayoutHistory(
    selectedPartner?.car_owner_id,
  );

  if (!selectedPartner) return null;

  // Format currency helper
  const formatPHP = (amount: number) => {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full w-full bg-transparent transition-colors duration-300">
      {/* --- TOP METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 shrink-0">
        {/* Wallet Balance */}
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm flex flex-col justify-between transition-colors hover:border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Pending Wallet
            </span>
            <div className="bg-amber-500/10 p-1.5 rounded-lg border border-amber-500/20 shrink-0">
              <Wallet className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="text-xl font-black text-foreground font-mono leading-none mb-1.5">
            {formatPHP(selectedPartner.wallet_balance || 0)}
          </div>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            Unsettled Revenue
          </span>
        </div>

        {/* Lifetime Earnings */}
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm flex flex-col justify-between transition-colors hover:border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Lifetime Earnings
            </span>
            <div className="bg-emerald-500/10 p-1.5 rounded-lg border border-emerald-500/20 shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="text-xl font-black text-foreground font-mono leading-none mb-1.5">
            {formatPHP(selectedPartner.total_lifetime_earnings || 0)}
          </div>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            Total Paid Out
          </span>
        </div>

        {/* Revenue Share */}
        <div className="bg-card border border-border rounded-xl p-3.5 shadow-sm flex flex-col justify-between transition-colors hover:border-primary/30">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest leading-none">
              Contract Terms
            </span>
            <div className="bg-primary/10 p-1.5 rounded-lg border border-primary/20 shrink-0">
              <Percent className="w-3.5 h-3.5 text-primary" />
            </div>
          </div>
          <div className="text-xl font-black text-foreground font-mono leading-none mb-1.5">
            {selectedPartner.revenue_share_percentage}%
          </div>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
            Partner Revenue Share
          </span>
        </div>
      </div>

      {/* --- LEDGER TABLE --- */}
      <div className="flex items-center justify-end mb-3 shrink-0 pb-1 transition-colors">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-3 text-[9px] font-bold uppercase tracking-widest rounded-lg border-border shadow-none bg-background text-foreground hover:bg-secondary transition-colors"
        >
          <Download className="w-3 h-3 mr-1.5" /> Export CSV
        </Button>
      </div>

      <div className="flex-1 min-h-[300px] overflow-y-auto custom-scrollbar border border-border rounded-xl bg-card relative transition-colors shadow-sm">
        <table className="w-full text-left text-[11px] whitespace-nowrap">
          <thead className="bg-secondary/30 border-b border-border sticky top-0 z-10 transition-colors">
            <tr>
              <th className="h-9 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Period
              </th>
              <th className="h-9 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Gross Revenue
              </th>
              <th className="h-9 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Commission
              </th>
              <th className="h-9 px-4 text-[9px] font-bold uppercase tracking-widest text-foreground">
                Net Payout
              </th>
              <th className="h-9 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                Status
              </th>
              <th className="h-9 px-4 text-[9px] font-bold uppercase tracking-widest text-muted-foreground text-right w-[60px]">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-primary mb-2" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      Loading Ledger...
                    </span>
                  </div>
                </td>
              </tr>
            ) : !payouts || payouts.length === 0 ? (
              <tr>
                <td colSpan={6} className="h-40 text-center">
                  <div className="flex flex-col items-center justify-center">
                    <FileText className="w-6 h-6 text-muted-foreground/30 mb-2 opacity-80" />
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                      No Settlement History
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              payouts.map((payout: any) => (
                <tr
                  key={payout.payout_id}
                  className="hover:bg-secondary/40 transition-colors group cursor-default"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-foreground transition-colors">
                        {format(new Date(payout.period_start), "MMM dd")} -{" "}
                        {format(new Date(payout.period_end), "MMM dd, yyyy")}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono mt-0.5">
                        ID: {payout.payout_id.split("-")[0].toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono font-medium text-muted-foreground">
                    {formatPHP(payout.total_revenue)}
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono font-medium text-destructive">
                    -{formatPHP(payout.commission_deducted)}
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatPHP(payout.net_payout)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[8px] font-bold h-4 px-1.5 uppercase tracking-widest rounded shadow-none transition-colors",
                        payout.status === "PAID"
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                          : payout.status === "PENDING"
                            ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                            : "bg-secondary text-muted-foreground border-border",
                      )}
                    >
                      {payout.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-lg opacity-0 group-hover:opacity-100 transition-all text-muted-foreground hover:text-foreground hover:bg-secondary"
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
