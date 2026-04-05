"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Star, Loader2, Car } from "lucide-react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { useFleetPartners } from "../../../hooks/use-fleetPartners";
import { PartnerForm } from "./partner-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";

// We expose a startEdit method so the parent can trigger the modal
export interface FleetPartnersGridRef {
  startEdit: () => void;
}

const FleetPartnersDataGrid = forwardRef<
  FleetPartnersGridRef,
  { onSelectPartner: (partner: FleetPartnerType | null) => void }
>(({ onSelectPartner }, ref) => {
  const { data: partners, isLoading } = useFleetPartners();

  const [searchQuery, setSearchQuery] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<FleetPartnerType | null>(
    null,
  );
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);

  // Expose method to parent
  useImperativeHandle(ref, () => ({
    startEdit: () => {
      if (activePartnerId) {
        const partnerToEdit = partners?.find(
          (p) => p.car_owner_id === activePartnerId,
        );
        if (partnerToEdit) {
          setEditingPartner(partnerToEdit);
          setIsFormOpen(true);
        }
      }
    },
  }));

  const handleAdd = () => {
    setEditingPartner(null);
    setIsFormOpen(true);
  };

  const handleSelect = (partner: FleetPartnerType) => {
    setActivePartnerId(partner.car_owner_id);
    onSelectPartner(partner);
  };

  const filteredPartners =
    partners?.filter((p) => {
      const name =
        p.business_name || p.users?.first_name + " " + p.users?.last_name || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];

  return (
    <>
      <div className="w-full h-full flex flex-col bg-[#F8FAFC] shrink-0 border-r border-slate-200">
        {/* --- SEARCH & ACTIONS HEADER --- */}
        <div className="p-4  bg-white flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between">
            <h2 className="text-[11px] font-bold text-slate-800 uppercase tracking-widest">
              Partner Directory
            </h2>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-sm hover:bg-slate-100 text-slate-600 shadow-none"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search business or name..."
              className="pl-8 h-9 text-xs bg-slate-50 border-slate-200 focus-visible:ring-1 rounded-sm shadow-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* --- SCROLLABLE LIST --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <div className="p-2.5 space-y-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="py-12 text-center text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                No partners found
              </div>
            ) : (
              filteredPartners.map((partner) => {
                const isActive = activePartnerId === partner.car_owner_id;
                const user = partner.users;
                const displayName =
                  partner.business_name ||
                  user?.first_name + " " + user?.last_name ||
                  "Unknown Partner";

                return (
                  <div
                    key={partner.car_owner_id}
                    onClick={() => handleSelect(partner)}
                    className={cn(
                      "group flex items-center justify-between gap-3 p-3 rounded-sm cursor-pointer transition-colors border shrink-0",
                      isActive
                        ? "bg-[#0F172A] border-[#0F172A] shadow-sm"
                        : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm",
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {/* Avatar with Status Dot */}
                      <div className="relative shrink-0">
                        <Avatar
                          className={cn(
                            "h-10 w-10 border rounded-sm",
                            isActive ? "border-slate-700" : "border-slate-200",
                          )}
                        >
                          <AvatarImage
                            src={user?.profile_picture_url || undefined}
                            className="object-cover"
                          />
                          <AvatarFallback
                            className={cn(
                              "text-[10px] font-bold rounded-sm",
                              isActive
                                ? "bg-slate-800 text-slate-200"
                                : "bg-slate-100 text-slate-600",
                            )}
                          >
                            {getInitials(displayName || "P")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Status Indicator Dot */}
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2",
                            partner.verification_status === "verified"
                              ? "bg-emerald-500"
                              : partner.verification_status === "rejected"
                                ? "bg-red-500"
                                : "bg-amber-500",
                            isActive ? "border-[#0F172A]" : "border-white",
                          )}
                        />
                      </div>

                      {/* Info Text */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span
                          className={cn(
                            "text-xs font-bold truncate mb-0.5",
                            isActive ? "text-white" : "text-[#0F172A]",
                          )}
                        >
                          {toTitleCase(displayName)}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[10px] font-mono truncate uppercase tracking-widest",
                              isActive ? "text-slate-400" : "text-slate-500",
                            )}
                          >
                            {partner.car_owner_id.slice(0, 6)}
                          </span>
                          <div
                            className={cn(
                              "flex items-center gap-0.5 text-[10px] font-bold",
                              isActive ? "text-slate-300" : "text-slate-500",
                            )}
                          >
                            <Star
                              className={cn(
                                "w-2.5 h-2.5",
                                isActive
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-400",
                              )}
                            />
                            {user?.trust_score || "5.0"}
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-0.5 text-[10px] font-bold",
                              isActive ? "text-slate-300" : "text-slate-500",
                            )}
                          >
                            <Car className="w-2.5 h-2.5 text-slate-400" />
                            {partner.total_units || 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* --- FORM MODAL --- */}
      {/* Updated the props to use the safe open/initialData interface */}
      <PartnerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingPartner}
      />
    </>
  );
});

FleetPartnersDataGrid.displayName = "FleetPartnersDataGrid";
export default FleetPartnersDataGrid;
