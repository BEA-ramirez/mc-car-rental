import React from "react";
import {
  Star,
  Wallet,
  Activity,
  Car,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, subDays } from "date-fns";

const mockLedger = [
  { id: "TXN-1", type: "Trip Earning", amount: 1500, date: new Date() },
  {
    id: "TXN-2",
    type: "Fuel Reimbursement",
    amount: -800,
    date: subDays(new Date(), 1),
  },
  {
    id: "TXN-3",
    type: "Trip Earning",
    amount: 2200,
    date: subDays(new Date(), 2),
  },
];

export default function DriverPerformanceTab() {
  return (
    <div className="space-y-4">
      {/* TOP KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500" /> Driver Rating
          </span>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-black text-slate-900 leading-none">
              4.8
            </span>
            <span className="text-[10px] text-slate-400 mb-1">/ 5.0</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Car className="w-3.5 h-3.5" /> Total Trips
          </span>
          <span className="text-3xl font-black text-slate-900 leading-none">
            142
          </span>
        </div>
        <div className="bg-white border border-slate-200 p-5 rounded-sm shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5" /> Completion Rate
          </span>
          <span className="text-3xl font-black text-emerald-600 leading-none">
            98.5%
          </span>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-sm shadow-sm flex flex-col justify-between text-white">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5" /> Wallet Balance
          </span>
          <span className="text-3xl font-black text-white font-mono leading-none">
            ₱ 4,500
          </span>
        </div>
      </div>

      {/* RECENT WALLET LEDGER */}
      <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col h-[350px]">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Recent Wallet Ledger
          </h3>
        </div>
        <ScrollArea className="flex-1">
          <div className="divide-y divide-slate-100">
            {mockLedger.map((txn) => (
              <div
                key={txn.id}
                className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${txn.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}
                  >
                    {txn.amount > 0 ? (
                      <ArrowUpRight className="w-4 h-4" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      {txn.type}
                    </p>
                    <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                      {txn.id} • {format(txn.date, "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
                <span
                  className={`text-sm font-bold font-mono ${txn.amount > 0 ? "text-emerald-600" : "text-red-600"}`}
                >
                  {txn.amount > 0 ? "+" : ""}₱{" "}
                  {Math.abs(txn.amount).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
