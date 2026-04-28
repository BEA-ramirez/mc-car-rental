"use client";

import React from "react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { toTitleCase } from "@/actions/helper/format-text";
import {
  Star,
  BadgePercent,
  Edit2,
  Mail,
  Phone,
  Trash2,
  MessageSquare,
  MoreHorizontal,
  Calendar,
  User,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
        userId: selectedPartner.users.user_id || "",
      });
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full transition-colors duration-300">
      {/* --- TOP SECTION: BRANDING & ACTIONS --- */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* Avatar Placeholder */}
          <div className="w-10 h-10 rounded-full border border-border bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0 shadow-sm transition-colors">
            {selectedPartner.business_name?.charAt(0).toUpperCase() || "P"}
          </div>
          <div className="min-w-0 flex flex-col justify-center">
            <h2 className="text-sm font-bold text-foreground leading-none truncate">
              {toTitleCase(selectedPartner.business_name || "Unknown Partner")}
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground mt-1">
              ID: {selectedPartner.car_owner_id.slice(0, 8).toUpperCase()}
            </p>
          </div>
        </div>

        {/* Action Buttons (Matched to AdminCarDetailsPage style) */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            className="px-3 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded shadow-sm text-[11px] font-semibold flex items-center gap-1.5 transition-opacity"
          >
            <Edit2 className="w-3.5 h-3.5" /> Edit
          </button>

          <button
            className="p-1.5 border border-border rounded bg-secondary hover:border-primary/50 text-muted-foreground transition-colors"
            title="Message Partner"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </button>

          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 border border-border rounded bg-secondary hover:border-primary/50 text-muted-foreground transition-colors outline-none">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-40 rounded-lg shadow-xl border-border bg-popover p-1 transition-colors"
            >
              <DropdownMenuItem className="text-[11px] font-medium cursor-pointer text-muted-foreground focus:bg-secondary focus:text-foreground rounded transition-colors py-1.5">
                <Calendar className="w-3.5 h-3.5 mr-2" /> Schedule payout
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[11px] font-medium cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded transition-colors py-1.5"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Archive partner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- INFO STRIP: CONTACT & KEY DATA --- */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-1 pt-3 border-t border-border/50 transition-colors">
        <div className="flex flex-col gap-0.5">
          <p className="text-[9px] font-medium text-muted-foreground flex items-center gap-1.5">
            <User className="w-3 h-3" /> Representative
          </p>
          <p className="text-[11px] font-semibold text-foreground truncate pl-4.5">
            {selectedPartner.users?.first_name}{" "}
            {selectedPartner.users?.last_name}
          </p>
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-[9px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> Email
          </p>
          <p className="text-[11px] font-semibold text-foreground truncate pl-4.5">
            {selectedPartner.users?.email}
          </p>
        </div>

        <div className="flex flex-col gap-0.5">
          <p className="text-[9px] font-medium text-muted-foreground flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> Phone
          </p>
          <p className="text-[11px] font-semibold text-foreground truncate pl-4.5">
            {selectedPartner.users?.phone_number || "N/A"}
          </p>
        </div>

        <div className="flex items-center gap-5 lg:ml-auto lg:border-l lg:border-border lg:pl-5 transition-colors">
          <div className="flex flex-col gap-0.5">
            <p className="text-[9px] font-medium text-muted-foreground">
              Trust score
            </p>
            <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {selectedPartner.users?.trust_score || "5.0"}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <p className="text-[9px] font-medium text-muted-foreground">
              Rev share
            </p>
            <span className="text-[11px] font-semibold text-foreground flex items-center gap-1">
              <BadgePercent className="w-3 h-3 text-primary" />
              {selectedPartner.revenue_share_percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
