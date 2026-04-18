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
    <div className="flex flex-col h-full w-full bg-transparent">
      {/* --- TOP METRICS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 shrink-0">
        {/* Wallet Balance */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Pending Wallet
            </span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-[#0F172A] font-mono">
            {formatPHP(selectedPartner.wallet_balance || 0)}
          </div>
          <span className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest">
            Unsettled Revenue
          </span>
        </div>

        {/* Lifetime Earnings */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Lifetime Earnings
            </span>
            <TrendingUp className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-[#0F172A] font-mono">
            {formatPHP(selectedPartner.total_lifetime_earnings || 0)}
          </div>
          <span className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest">
            Total Paid Out
          </span>
        </div>

        {/* Revenue Share */}
        <div className="bg-white border border-slate-200 rounded-sm p-4 shadow-sm flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-blue-500" />
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              Contract Terms
            </span>
            <Percent className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-[#0F172A] font-mono">
            {selectedPartner.revenue_share_percentage}%
          </div>
          <span className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest">
            Partner Revenue Share
          </span>
        </div>
      </div>

      {/* --- LEDGER TABLE --- */}
      <div className="flex items-center justify-between mb-3 px-1 shrink-0">
        <h3 className="text-[10px] font-bold text-slate-800 uppercase tracking-widest">
          Settlement Ledger
        </h3>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-[9px] font-bold uppercase tracking-widest rounded-sm border-slate-200 shadow-none"
        >
          Export CSV
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar border border-slate-200 rounded-sm bg-white relative">
        {isLoading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/50 z-10">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400 mb-3" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">
              Loading Ledger...
            </span>
          </div>
        ) : !payouts || payouts.length === 0 ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-50/50 z-10">
            <FileText className="w-6 h-6 text-slate-300 mb-3 opacity-50" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              No Settlement History
            </span>
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F8FAFC] border-b border-slate-200 sticky top-0 z-10">
              <tr>
                <th className="h-10 px-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Period
                </th>
                <th className="h-10 px-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Gross Revenue
                </th>
                <th className="h-10 px-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Commission
                </th>
                <th className="h-10 px-4 text-[9px] font-bold uppercase tracking-widest text-[#0F172A]">
                  Net Payout
                </th>
                <th className="h-10 px-4 text-[9px] font-bold uppercase tracking-widest text-slate-500">
                  Status
                </th>
                <th className="h-10 px-4 text-[9px] font-bold uppercase tracking-widest text-slate-500 text-right">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payouts.map((payout: any) => (
                <tr
                  key={payout.payout_id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="px-4 py-3">
                    <div className="flex flex-col">
                      <span className="text-[11px] font-bold text-[#0F172A]">
                        {format(new Date(payout.period_start), "MMM dd")} -{" "}
                        {format(new Date(payout.period_end), "MMM dd, yyyy")}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono mt-0.5">
                        ID: {payout.payout_id.split("-")[0].toUpperCase()}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-slate-600">
                    {formatPHP(payout.total_revenue)}
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono text-red-600">
                    -{formatPHP(payout.commission_deducted)}
                  </td>
                  <td className="px-4 py-3 text-[11px] font-mono font-bold text-emerald-600">
                    {formatPHP(payout.net_payout)}
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[9px] font-bold h-5 px-1.5 uppercase tracking-widest rounded-[2px] shadow-none",
                        payout.status === "PAID"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : payout.status === "PENDING"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-slate-50 text-slate-700 border-slate-200",
                      )}
                    >
                      {payout.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-sm opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-[#0F172A]"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
