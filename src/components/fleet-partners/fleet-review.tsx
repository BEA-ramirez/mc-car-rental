import React from "react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { updatePartnerStatus } from "@/actions/helper/approve-partner";
import { toast } from "sonner";
import { CheckCircle, XCircle, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";

function FleetPartnerReview({
  selectedPartner,
  setIsOpen,
}: {
  selectedPartner: FleetPartnerType | null;
  setIsOpen: (open: boolean) => void;
}) {
  return (
    <div className="space-y-6">
      {/* 1. Header Profile */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="h-16 w-16 rounded-full bg-slate-200 overflow-hidden relative">
          {/* Use your Image component here */}
          <img
            src={
              selectedPartner?.users.profile_picture_url ||
              "/default-avatar.png"
            }
            alt="Profile"
            className="object-cover w-full h-full"
          />
        </div>
        <div>
          <h3 className="font-bold text-lg">
            {selectedPartner?.users.full_name}
          </h3>
          <p className="text-sm text-muted-foreground">
            {selectedPartner?.users.email}
          </p>
          <div className="flex gap-2 mt-1">
            {/* Re-use your status badge logic here */}
            <span
              className={`text-xs px-2 py-0.5 rounded-full capitalize 
                ${
                  selectedPartner?.verification_status === "verified"
                    ? "bg-green-100 text-green-700"
                    : selectedPartner?.verification_status === "rejected"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                }`}
            >
              {selectedPartner?.verification_status}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Details Grid */}
      <div className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
        <div>
          <label className="text-xs text-muted-foreground uppercase font-bold">
            Business Name
          </label>
          <p className="font-medium">{selectedPartner?.business_name}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase font-bold">
            Phone
          </label>
          <p className="font-medium">{selectedPartner?.users.phone_number}</p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase font-bold">
            Revenue Share
          </label>
          <p className="font-medium">
            {selectedPartner?.revenue_share_percentage}%
          </p>
        </div>
        <div>
          <label className="text-xs text-muted-foreground uppercase font-bold">
            Applied On
          </label>
          <p className="font-medium">
            {selectedPartner?.created_at
              ? new Date(selectedPartner?.created_at).toLocaleDateString()
              : "-"}
          </p>
        </div>
      </div>

      {/* 3. Action Buttons (Only show if PENDING) */}
      {selectedPartner?.verification_status === "pending" ? (
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Admin Actions
          </h4>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="destructive"
              onClick={async () => {
                const res = await updatePartnerStatus(
                  selectedPartner.car_owner_id,
                  selectedPartner.user_id,
                  "reject",
                );
                if (res.success) {
                  setIsOpen(false);
                  // Refresh grid logic if needed
                }
              }}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject Application
            </Button>

            <Button
              className="bg-green-600 hover:bg-green-700"
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
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve & Verify
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 bg-slate-50 text-center rounded-lg text-sm text-muted-foreground">
          This application has already been processed.
        </div>
      )}
    </div>
  );
}

export default FleetPartnerReview;
