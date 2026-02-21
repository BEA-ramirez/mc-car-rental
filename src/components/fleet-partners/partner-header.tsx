"use client";

import React from "react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { toTitleCase } from "@/actions/helper/format-text";
import {
  Star,
  BadgePercent,
  Banknote,
  BookAlert,
  Activity,
  Edit2,
  Mail,
  Phone,
  Trash2,
  MessageSquare,
  MoreHorizontal,
  ShieldCheck,
  Calendar,
  User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useFleetPartners } from "../../../hooks/use-fleetPartners";

export default function PartnerHeader({
  selectedPartner,
  onEdit,
}: {
  selectedPartner: FleetPartnerType | null;
  onEdit: () => void;
}) {
  const { deletePartner } = useFleetPartners();

  if (!selectedPartner) return null;

  const handleDelete = () => {
    if (
      confirm(
        `Are you sure you want to archive ${selectedPartner.business_name}?`,
      )
    ) {
      deletePartner({
        carOwnerId: selectedPartner.car_owner_id,
        userId: selectedPartner.users.user_id,
      });
    }
  };

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* --- TOP SECTION: BRANDING & ACTIONS --- */}
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          {/* Business Icon/Initials Placeholder */}
          <div className="h-12 w-12 rounded-lg bg-slate-900 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-sm">
            {selectedPartner.business_name?.charAt(0) || "P"}
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 leading-tight">
              {toTitleCase(selectedPartner.business_name || "Unknown Partner")}
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                ID: {selectedPartner.car_owner_id.slice(0, 8)}...
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "text-[9px] uppercase tracking-wider h-5 px-2",
                  selectedPartner.verification_status === "verified"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-amber-50 text-amber-700 border-amber-200",
                )}
              >
                {selectedPartner.verification_status || "Pending"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-medium bg-white"
            onClick={onEdit}
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs font-medium bg-white"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-slate-400" />{" "}
            Message
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-white"
              >
                <MoreHorizontal className="h-4 w-4 text-slate-500" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem className="text-xs text-slate-600">
                <ShieldCheck className="w-3.5 h-3.5 mr-2" /> Verify Documents
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs text-slate-600">
                <Calendar className="w-3.5 h-3.5 mr-2" /> Schedule Payout
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-xs text-red-600 focus:text-red-700 focus:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Archive Partner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- INFO STRIP: CONTACT & KEY DATA --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl shrink-0">
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-3 h-3" /> Representative
          </p>
          <p className="text-xs font-semibold text-slate-700 truncate">
            {selectedPartner.users?.full_name}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> Email
          </p>
          <p className="text-xs font-semibold text-slate-700 truncate">
            {selectedPartner.users?.email}
          </p>
        </div>
        <div className="space-y-0.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> Phone
          </p>
          <p className="text-xs font-semibold text-slate-700">
            {selectedPartner.users?.phone_number || "N/A"}
          </p>
        </div>
        <div className="flex gap-4 ml-auto border-l border-slate-200 pl-4">
          <div className="text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase">
              Trust
            </p>
            <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
              {selectedPartner.users?.trust_score || "5.0"}
            </span>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-bold text-slate-400 uppercase">
              Share
            </p>
            <span className="text-xs font-bold text-slate-700 flex items-center justify-center gap-1">
              <BadgePercent className="w-3 h-3 text-blue-500" />
              {selectedPartner.revenue_share_percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* --- KPI CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Earnings */}
        <div className="border border-slate-200 rounded-lg p-3.5 flex items-center justify-between bg-white shadow-sm hover:border-slate-300 transition-colors">
          <div>
            <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Earnings (YTD)
            </h6>
            <p className="text-xl font-bold text-slate-900 leading-none">
              ₱45,000.00
            </p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
            <Banknote className="w-5 h-5 text-emerald-600" />
          </div>
        </div>

        {/* Compliance */}
        <div className="border border-slate-200 rounded-lg p-3.5 flex items-center justify-between bg-white shadow-sm hover:border-slate-300 transition-colors">
          <div>
            <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Compliance Status
            </h6>
            <p className="text-sm font-bold text-emerald-600 leading-none mt-1">
              Verified / All Docs Valid
            </p>
          </div>
          <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center border border-blue-100">
            <BookAlert className="w-5 h-5 text-blue-600" />
          </div>
        </div>

        {/* Fleet Health */}
        <div className="border border-slate-200 rounded-lg p-3.5 flex items-center justify-between bg-white shadow-sm hover:border-slate-300 transition-colors">
          <div>
            <h6 className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Fleet Availability
            </h6>
            <p className="text-sm font-bold text-amber-600 leading-none mt-1">
              1 Unit in Maintenance
            </p>
          </div>
          <div className="h-10 w-10 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
            <Activity className="w-5 h-5 text-amber-600" />
          </div>
        </div>
      </div>
    </div>
  );
}
