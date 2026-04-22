"use client";

import React from "react";
import { updatePartnerStatus } from "@/actions/helper/approve-partner";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import Image from "next/image";

function FleetPartnerReview({
  selectedPartner,
  setIsOpen,
}: {
  selectedPartner: any | null; // Set to any to accept the joined RPC data
  setIsOpen: (open: boolean) => void;
}) {
  if (!selectedPartner) return null;

  const user = selectedPartner.users || {};

  return (
    <div className="space-y-4">
      {/* 1. Header Profile */}
      <div className="flex items-center gap-3 p-4 bg-card border border-border rounded-xl shadow-sm transition-colors">
        <div className="h-12 w-12 shrink-0 rounded-lg bg-secondary border border-border overflow-hidden relative transition-colors">
          <Image
            src={user.profile_picture_url || "/default-avatar.png"}
            alt="Profile"
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-bold text-[11px] text-foreground uppercase truncate">
              {user.first_name} {user.last_name}
            </h3>
            <span className="text-[8px] font-bold px-1.5 py-0.5 uppercase tracking-widest rounded border shadow-none transition-colors bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20">
              PENDING REVIEW
            </span>
          </div>
          <p className="text-[10px] font-mono text-muted-foreground truncate">
            {user.email}
          </p>
        </div>
      </div>

      {/* 2. Details Grid */}
      <div className="grid grid-cols-2 gap-4 border border-border bg-secondary/30 p-4 rounded-xl transition-colors">
        <div>
          <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1 block">
            Business Name
          </label>
          <p className="text-[11px] font-bold text-foreground">
            {selectedPartner.business_name || "N/A"}
          </p>
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1 block">
            Phone
          </label>
          <p className="text-[11px] font-medium font-mono text-foreground">
            {user.phone_number || "N/A"}
          </p>
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1 block">
            Revenue Share
          </label>
          <p className="text-[11px] font-bold text-foreground font-mono">
            {selectedPartner.revenue_share_percentage}%
          </p>
        </div>
        <div>
          <label className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest mb-1 block">
            Applied On
          </label>
          <p className="text-[11px] font-medium font-mono text-foreground">
            {selectedPartner.created_at
              ? new Date(selectedPartner.created_at).toLocaleDateString()
              : "-"}
          </p>
        </div>
      </div>

      {/* 3. Action Buttons */}
      <div className="space-y-3 pt-2">
        <h4 className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
          <AlertCircle className="w-3 h-3" />
          Admin Actions
        </h4>

        <div className="grid grid-cols-2 gap-2.5">
          <Button
            variant="outline"
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-destructive/5 text-destructive border-destructive/30 hover:bg-destructive/10 rounded-lg shadow-none transition-colors"
            onClick={async () => {
              const res = await updatePartnerStatus(
                selectedPartner.car_owner_id,
                selectedPartner.user_id,
                "reject",
              );
              if (res.success) {
                setIsOpen(false);
              }
            }}
          >
            <XCircle className="w-3.5 h-3.5 mr-1.5" />
            Reject
          </Button>

          <Button
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-sm transition-colors"
            onClick={async () => {
              const res = await updatePartnerStatus(
                selectedPartner.car_owner_id,
                selectedPartner.user_id,
                "approve",
              );
              if (res.success) {
                setIsOpen(false);
              }
            }}
          >
            <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
            Approve
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FleetPartnerReview;
