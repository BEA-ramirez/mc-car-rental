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
import { Button } from "@/components/ui/button";
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
    <div className="flex flex-col gap-4 w-full transition-colors duration-300">
      {/* --- TOP SECTION: BRANDING & ACTIONS --- */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          {/* Business Icon Placeholder */}
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-black text-lg shrink-0 shadow-sm transition-colors">
            {selectedPartner.business_name?.charAt(0).toUpperCase() || "P"}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-bold text-foreground leading-none truncate uppercase tracking-tight">
              {toTitleCase(selectedPartner.business_name || "Unknown Partner")}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[9px] font-mono font-bold text-muted-foreground bg-secondary px-1.5 py-0.5 rounded border border-border transition-colors">
                ID: {selectedPartner.car_owner_id.slice(0, 8).toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-background border-border hover:bg-secondary transition-colors"
            onClick={onEdit}
          >
            <Edit2 className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" /> Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-background border-border hover:bg-secondary transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
            Message
          </Button>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 bg-background border-border hover:bg-secondary transition-colors"
              >
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-44 rounded-xl shadow-xl border-border bg-popover p-1 transition-colors"
            >
              <DropdownMenuItem className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-muted-foreground focus:bg-secondary focus:text-foreground rounded-lg transition-colors py-2">
                <Calendar className="w-3.5 h-3.5 mr-2" /> Schedule Payout
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-[10px] font-bold uppercase tracking-widest cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg transition-colors py-2"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5 mr-2" /> Archive Partner
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* --- INFO STRIP: CONTACT & KEY DATA --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 px-3.5 py-2.5 bg-secondary/30 border border-border rounded-xl shrink-0 transition-colors">
        <div className="flex flex-col gap-0.5">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <User className="w-3 h-3" /> Representative
          </p>
          <p className="text-[11px] font-bold text-foreground truncate">
            {selectedPartner.users?.first_name}{" "}
            {selectedPartner.users?.last_name}
          </p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Mail className="w-3 h-3" /> Email
          </p>
          <p className="text-[11px] font-bold text-foreground truncate font-mono">
            {selectedPartner.users?.email}
          </p>
        </div>
        <div className="flex flex-col gap-0.5">
          <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Phone className="w-3 h-3" /> Phone
          </p>
          <p className="text-[11px] font-bold text-foreground font-mono">
            {selectedPartner.users?.phone_number || "N/A"}
          </p>
        </div>
        <div className="flex items-center gap-4 ml-auto border-l border-border pl-4 transition-colors">
          <div className="text-center">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
              Trust
            </p>
            <span className="text-[11px] font-black text-foreground flex items-center justify-center gap-1">
              <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
              {selectedPartner.users?.trust_score || "5.0"}
            </span>
          </div>
          <div className="text-center">
            <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest mb-0.5">
              Share
            </p>
            <span className="text-[11px] font-black text-foreground flex items-center justify-center gap-1">
              <BadgePercent className="w-3 h-3 text-primary" />
              {selectedPartner.revenue_share_percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
