"use client";

import React from "react";
import {
  Bell,
  MapPin,
  Wallet,
  FileCheck,
  User,
  ChevronRight,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

// Mock data (you will replace this with your hooks later)
const driverData = {
  firstName: "Marcus",
  status: "AVAILABLE",
  todayEarnings: "2,450",
  nextTrip: "14:30 PM",
  rating: "4.9",
  unreadNotifs: 3,
};

export default function DriverPortalDashboard() {
  return (
    // Outer Wrapper: Now deep dark across all screen sizes
    <div className="min-h-screen bg-[#0A0C10] text-white flex flex-col relative overflow-hidden selection:bg-emerald-500/30">
      {/* Background Texture: Subtle machined grid lines */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[linear-gradient(rgba(255,255,255,1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,1)_1px,transparent_1px)] bg-[size:40px_40px]" />
      {/* Radial gradient to draw focus to the center/top */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#1A1D24]/40 via-[#0A0C10]/80 to-[#0A0C10] pointer-events-none" />

      {/* Main Content Container: Responsive sizing */}
      <div className="w-full max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10 flex flex-col min-h-screen relative z-10">
        {/* TOP HUD */}
        <header className="flex items-center justify-between mb-8 md:mb-12 shrink-0">
          <div className="flex items-center gap-3 md:gap-4">
            <Avatar className="w-10 h-10 md:w-12 md:h-12 border border-slate-700 shadow-xl">
              <AvatarImage src="" />
              <AvatarFallback className="bg-[#1A1D24] text-slate-300 text-xs md:text-sm font-bold">
                {driverData.firstName.charAt(0)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-slate-500">
                Welcome back
              </span>
              <span className="text-sm md:text-lg font-bold text-white tracking-tight">
                {driverData.firstName}
              </span>
            </div>
          </div>

          {/* Notification Bell with Neon Badge */}
          <button className="relative w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full bg-[#13161C] border border-slate-800 hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 shadow-lg">
            <Bell className="w-4 h-4 md:w-5 md:h-5 text-slate-300" />
            {driverData.unreadNotifs > 0 && (
              <span className="absolute top-2.5 right-2.5 md:top-3 md:right-3 w-2 h-2 md:w-2.5 md:h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
            )}
          </button>
        </header>

        {/* DASHBOARD GRID: Stacks on mobile, side-by-side on desktop */}
        <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
          {/* HERO STATUS RING (Left side on desktop) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-[#13161C]/80 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden min-h-[300px] md:min-h-[400px] shadow-2xl">
            <div className="absolute top-4 left-6">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-600">
                Telemetry
              </span>
            </div>

            <div className="relative flex items-center justify-center mt-4">
              {/* Outer breathing glow */}
              <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-2xl animate-pulse scale-150" />

              {/* Radiating sonar/ping ring */}
              <div className="absolute inset-0 rounded-full border border-emerald-500/30 animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]" />

              {/* Machined Bezels */}
              <div className="w-48 h-48 md:w-64 md:h-64 rounded-full border border-emerald-500/30 flex items-center justify-center bg-emerald-500/5 relative z-10 backdrop-blur-sm">
                <div className="w-40 h-40 md:w-52 md:h-52 rounded-full border-2 border-emerald-500/50 flex flex-col items-center justify-center bg-[#0A0C10] shadow-[inset_0_0_30px_rgba(16,185,129,0.15)] relative overflow-hidden">
                  {/* Subtle sweep gradient inside the dark core */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-emerald-500/5 to-transparent opacity-50" />

                  <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-emerald-500/80 mb-1 relative z-10">
                    System
                  </span>
                  <span className="text-xl md:text-2xl font-black tracking-widest text-emerald-400 relative z-10">
                    {driverData.status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Gauges & Command Grid */}
          <div className="lg:col-span-7 flex flex-col gap-6 md:gap-8">
            {/* GAUGES (Quick Stats) */}
            <div className="grid grid-cols-3 gap-3 md:gap-6">
              <div className="flex flex-col items-center justify-center bg-[#13161C]/80 border border-slate-800/80 rounded-2xl py-5 md:py-6 backdrop-blur-sm shadow-xl">
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Today
                </span>
                <span className="text-sm md:text-lg font-mono font-bold text-white tracking-tight">
                  <span className="text-slate-500 mr-1">₱</span>
                  {driverData.todayEarnings}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#13161C]/80 border border-slate-800/80 rounded-2xl py-5 md:py-6 backdrop-blur-sm shadow-xl">
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Next Trip
                </span>
                <span className="text-sm md:text-lg font-mono font-bold text-white tracking-tight">
                  {driverData.nextTrip}
                </span>
              </div>
              <div className="flex flex-col items-center justify-center bg-[#13161C]/80 border border-slate-800/80 rounded-2xl py-5 md:py-6 backdrop-blur-sm shadow-xl">
                <span className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">
                  Rating
                </span>
                <span className="text-sm md:text-lg font-mono font-bold text-white tracking-tight">
                  {driverData.rating}{" "}
                  <span className="text-slate-500 text-[10px] md:text-xs">
                    / 5
                  </span>
                </span>
              </div>
            </div>

            {/* THE COMMAND GRID */}
            <div className="grid grid-cols-2 gap-3 md:gap-6 flex-1">
              {/* Nav Card 1 */}
              <button className="group relative aspect-square md:aspect-auto bg-gradient-to-b from-[#1A1D24] to-[#13161C] border border-slate-700/50 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-3 md:gap-4 hover:border-blue-500/50 transition-all overflow-hidden active:scale-95 shadow-xl">
                <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors duration-500" />
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0A0C10] border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:border-blue-500/30 transition-all shadow-inner">
                  <MapPin className="w-5 h-5 md:w-6 md:h-6 text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                </div>
                <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors relative z-10">
                  Dispatch
                </span>
                <ChevronRight className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </button>

              {/* Nav Card 2 */}
              <button className="group relative aspect-square md:aspect-auto bg-gradient-to-b from-[#1A1D24] to-[#13161C] border border-slate-700/50 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-3 md:gap-4 hover:border-emerald-500/50 transition-all overflow-hidden active:scale-95 shadow-xl">
                <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors duration-500" />
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0A0C10] border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:border-emerald-500/30 transition-all shadow-inner">
                  <Wallet className="w-5 h-5 md:w-6 md:h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />
                </div>
                <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors relative z-10">
                  Wallet
                </span>
                <ChevronRight className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </button>

              {/* Nav Card 3 */}
              <button className="group relative aspect-square md:aspect-auto bg-gradient-to-b from-[#1A1D24] to-[#13161C] border border-slate-700/50 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-3 md:gap-4 hover:border-amber-500/50 transition-all overflow-hidden active:scale-95 shadow-xl">
                <div className="absolute inset-0 bg-amber-500/0 group-hover:bg-amber-500/5 transition-colors duration-500" />
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0A0C10] border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:border-amber-500/30 transition-all shadow-inner">
                  <FileCheck className="w-5 h-5 md:w-6 md:h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                </div>
                <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors relative z-10">
                  Documents
                </span>
                <ChevronRight className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </button>

              {/* Nav Card 4 */}
              <button className="group relative aspect-square md:aspect-auto bg-gradient-to-b from-[#1A1D24] to-[#13161C] border border-slate-700/50 rounded-2xl md:rounded-3xl flex flex-col items-center justify-center gap-3 md:gap-4 hover:border-purple-500/50 transition-all overflow-hidden active:scale-95 shadow-xl">
                <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-colors duration-500" />
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-[#0A0C10] border border-slate-800 flex items-center justify-center mb-1 group-hover:scale-110 group-hover:border-purple-500/30 transition-all shadow-inner">
                  <User className="w-5 h-5 md:w-6 md:h-6 text-purple-400 drop-shadow-[0_0_8px_rgba(192,132,252,0.5)]" />
                </div>
                <span className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-slate-300 group-hover:text-white transition-colors relative z-10">
                  Profile
                </span>
                <ChevronRight className="absolute bottom-4 right-4 md:bottom-6 md:right-6 w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-all -translate-x-4 group-hover:translate-x-0" />
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
