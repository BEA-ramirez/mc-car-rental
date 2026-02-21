"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Filter, Star, Loader2, Car } from "lucide-react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { useFleetPartners } from "../../../hooks/use-fleetPartners";
import { PartnerForm } from "./partner-form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { toTitleCase } from "@/actions/helper/format-text";

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
      const name = p.business_name || p.users?.full_name || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    }) || [];

  return (
    <>
      <div className="flex flex-col h-full bg-white shrink-0">
        {/* --- SEARCH & ACTIONS HEADER --- */}
        <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              Partner Directory
            </span>
            <Button
              size="sm"
              className="h-7 text-[10px] bg-blue-600 hover:bg-blue-700 text-white shadow-sm px-2.5 rounded-md"
              onClick={handleAdd}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Partner
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <Input
                placeholder="Search business or name..."
                className="pl-8 h-8 text-xs bg-white border-slate-200 focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 bg-white border-slate-200 text-slate-700 shrink-0"
            >
              <Filter className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>

        {/* --- SCROLLABLE LIST --- */}
        <ScrollArea className="flex-1 min-h-0 p-3">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Loading partners...</span>
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed border-slate-200 rounded-md mt-2">
              <p className="text-xs text-slate-500 font-semibold">
                No partners found.
              </p>
              {searchQuery && (
                <p className="text-[10px] text-slate-400 mt-1">
                  Adjust your search query.
                </p>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {filteredPartners.map((partner) => {
                const isActive = activePartnerId === partner.car_owner_id;
                const user = partner.users;
                const displayName =
                  partner.business_name || user?.full_name || "Unknown Partner";
                const profilePicture =
                  user?.profile_picture_url ||
                  `https://ui-avatars.com/api/?name=${displayName.replace(" ", "+")}&background=random&color=fff`;

                return (
                  <div
                    key={partner.car_owner_id}
                    onClick={() => handleSelect(partner)}
                    className={cn(
                      "group flex items-start gap-3 p-2.5 rounded-md border cursor-pointer transition-all",
                      isActive
                        ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
                    )}
                  >
                    {/* Avatar */}
                    <div className="relative w-10 h-10 shrink-0 rounded-full border border-slate-200 overflow-hidden bg-slate-50">
                      <Image
                        src={profilePicture}
                        alt="Profile"
                        fill
                        className="object-cover"
                        sizes="40px"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col overflow-hidden flex-1 justify-center py-0.5">
                      <h4 className="text-xs font-bold text-slate-800 truncate leading-tight">
                        {toTitleCase(displayName)}
                      </h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-[10px] font-medium text-slate-500">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400 mr-1" />
                          {user?.trust_score || "5.0"}
                        </div>
                        <div className="w-[1px] h-2.5 bg-slate-300" />
                        <div className="flex items-center text-[10px] font-medium text-slate-500">
                          <Car className="w-3 h-3 text-slate-400 mr-1" />
                          {partner.total_units} cars
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
      </div>

      {/* --- FORM MODAL --- */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px] h-[85vh] flex flex-col p-0 border-slate-200 shadow-xl rounded-lg overflow-hidden gap-0 bg-slate-50">
          <DialogHeader className="p-4 border-b border-slate-200 bg-white shrink-0">
            <DialogTitle className="text-base font-bold text-slate-800">
              {editingPartner
                ? "Edit Partner Details"
                : "Add New Fleet Partner"}
            </DialogTitle>
          </DialogHeader>
          <PartnerForm
            data={
              editingPartner
                ? { ...editingPartner, isAdd: false }
                : { isAdd: true }
            }
            closeDialog={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
});

FleetPartnersDataGrid.displayName = "FleetPartnersDataGrid";
export default FleetPartnersDataGrid;
