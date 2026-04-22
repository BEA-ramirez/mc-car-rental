"use client";

import { useState, forwardRef, useImperativeHandle } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Star, Loader2, Car } from "lucide-react";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import { useFleetPartners } from "../../../hooks/use-fleetPartners";
import { PartnerForm } from "./partner-form";
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
      <div className="w-full h-full flex flex-col bg-secondary/30 shrink-0 border-r border-border transition-colors">
        {/* --- SEARCH & ACTIONS HEADER --- */}
        <div className="p-3 bg-card flex flex-col gap-2.5 shrink-0 border-b border-border transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
              Partner Directory
            </h2>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground shadow-none transition-colors"
              onClick={handleAdd}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search business or name..."
              className="pl-8 h-8 text-[11px] font-medium bg-secondary border-border focus-visible:ring-1 focus-visible:ring-primary rounded-lg shadow-none text-foreground transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* --- SCROLLABLE LIST --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background transition-colors">
          <div className="p-2 space-y-1">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="py-10 text-center text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
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
                      "group flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-all border shrink-0",
                      isActive
                        ? "bg-primary/10 border-primary/20 shadow-sm"
                        : "bg-card border-border hover:border-primary/50 hover:shadow-sm hover:bg-secondary/50",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Avatar with Status Dot */}
                      <div className="relative shrink-0">
                        <Avatar
                          className={cn(
                            "h-8 w-8 border rounded-lg transition-colors bg-secondary",
                            isActive ? "border-primary/30" : "border-border",
                          )}
                        >
                          <AvatarImage
                            src={user?.profile_picture_url || undefined}
                            className="object-cover"
                          />
                          <AvatarFallback
                            className={cn(
                              "text-[9px] font-bold rounded-lg transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground",
                            )}
                          >
                            {getInitials(displayName || "P")}
                          </AvatarFallback>
                        </Avatar>
                      </div>

                      {/* Info Text */}
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span
                          className={cn(
                            "text-[11px] font-bold truncate mb-0.5 transition-colors",
                            isActive ? "text-primary" : "text-foreground",
                          )}
                        >
                          {toTitleCase(displayName)}
                        </span>

                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[9px] font-mono truncate uppercase tracking-widest transition-colors",
                              isActive
                                ? "text-primary/70"
                                : "text-muted-foreground",
                            )}
                          >
                            {partner.car_owner_id.slice(0, 6)}
                          </span>
                          <div
                            className={cn(
                              "flex items-center gap-0.5 text-[9px] font-bold transition-colors",
                              isActive
                                ? "text-primary/80"
                                : "text-muted-foreground",
                            )}
                          >
                            <Star
                              className={cn(
                                "w-2.5 h-2.5",
                                isActive
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-muted-foreground/50",
                              )}
                            />
                            {user?.trust_score || "5.0"}
                          </div>
                          <div
                            className={cn(
                              "flex items-center gap-0.5 text-[9px] font-bold transition-colors",
                              isActive
                                ? "text-primary/80"
                                : "text-muted-foreground",
                            )}
                          >
                            <Car
                              className={cn(
                                "w-2.5 h-2.5",
                                isActive
                                  ? "text-primary/60"
                                  : "text-muted-foreground/50",
                              )}
                            />
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
