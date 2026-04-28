"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PartnerHeader from "./partner-header";
import PartnerRevenueChart from "./partner-revenue-chart";
import PartnerCarUtil from "./partner-car-util";
import { FleetPartnerType } from "@/lib/schemas/car-owner";
import PartnerUnits from "./partner-units";
import {
  Handshake,
  Car,
  DollarSign,
  FileText,
  History,
  LayoutDashboard,
  Plus,
  ChevronsUpDown,
  Check,
  Loader2,
  Building2,
} from "lucide-react";
import PartnerFinancials from "./partner-financials";
import PartnerDocs from "./partner-docs";
import PartnerLogs from "./partner-logs";

// New Imports for the Combobox and State
import { useFleetPartners } from "../../../hooks/use-fleetPartners";
import { PartnerForm } from "./partner-form";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

export default function ActivePartners() {
  const { data: partners, isLoading } = useFleetPartners();

  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    null,
  );
  const [isComboboxOpen, setIsComboboxOpen] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<FleetPartnerType | null>(
    null,
  );

  const selectedPartner =
    partners?.find((p) => p.car_owner_id === selectedPartnerId) || null;

  const handleAdd = () => {
    setEditingPartner(null);
    setIsFormOpen(true);
  };

  const handleEdit = () => {
    if (selectedPartner) {
      setEditingPartner(selectedPartner);
      setIsFormOpen(true);
    }
  };

  return (
    <div className="flex flex-col w-full relative bg-background text-foreground transition-colors duration-300">
      {/* --- TOP TOOLBAR: COMBOBOX & ACTIONS --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border-b border-border bg-card shrink-0 gap-4 transition-colors">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <Building2 className="w-4 h-4 text-primary" />
          </div>

          <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={isComboboxOpen}
                className="w-full sm:w-[320px] justify-between h-10 bg-secondary/50 border-border hover:bg-secondary transition-colors"
              >
                {selectedPartner ? (
                  <div className="flex items-center gap-2.5 truncate">
                    <Avatar className="w-6 h-6 border border-border">
                      <AvatarImage
                        src={
                          selectedPartner.users?.profile_picture_url ||
                          undefined
                        }
                        className="object-cover"
                      />
                      <AvatarFallback className="text-[9px] bg-primary text-primary-foreground font-bold">
                        {getInitials(
                          selectedPartner.business_name ||
                            selectedPartner.users?.first_name ||
                            "P",
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-[11px] font-bold truncate uppercase tracking-widest">
                      {selectedPartner.business_name ||
                        `${selectedPartner.users?.first_name} ${selectedPartner.users?.last_name}`}
                    </span>
                  </div>
                ) : (
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest">
                    Select a fleet partner...
                  </span>
                )}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-full sm:w-[320px] p-0 rounded-xl shadow-xl border-border bg-card"
              align="start"
            >
              <Command>
                <CommandInput
                  placeholder="Search partners..."
                  className="h-10 text-[11px] font-medium"
                />
                <CommandList className="max-h-[300px] custom-scrollbar">
                  <CommandEmpty className="py-6 text-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mx-auto mb-2" />
                    ) : (
                      "No partners found."
                    )}
                  </CommandEmpty>
                  <CommandGroup>
                    {partners?.map((partner) => {
                      const displayName =
                        partner.business_name ||
                        `${partner.users?.first_name} ${partner.users?.last_name}` ||
                        "Unknown Partner";
                      return (
                        <CommandItem
                          key={partner.car_owner_id}
                          value={displayName} // Used for filtering
                          onSelect={() => {
                            setSelectedPartnerId(partner.car_owner_id);
                            setIsComboboxOpen(false);
                          }}
                          className="flex items-center gap-2.5 py-2 cursor-pointer aria-selected:bg-secondary transition-colors"
                        >
                          <Check
                            className={cn(
                              "h-4 w-4 shrink-0 text-primary transition-opacity",
                              selectedPartnerId === partner.car_owner_id
                                ? "opacity-100"
                                : "opacity-0",
                            )}
                          />
                          <Avatar className="h-7 w-7 border border-border shrink-0">
                            <AvatarImage
                              src={
                                partner.users?.profile_picture_url || undefined
                              }
                              className="object-cover"
                            />
                            <AvatarFallback className="text-[9px] bg-secondary text-foreground font-bold">
                              {getInitials(displayName)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[11px] font-bold truncate">
                              {toTitleCase(displayName)}
                            </span>
                            <span className="text-[9px] text-muted-foreground font-mono truncate">
                              {partner.car_owner_id.slice(0, 6)} •{" "}
                              {partner.total_units || 0} Cars
                            </span>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <Button
          size="sm"
          onClick={handleAdd}
          className="h-9 sm:h-10 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-none transition-opacity shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Partner
        </Button>
      </div>

      {/* --- MAIN CONTENT: UNIFIED CANVAS --- */}
      {/* REMOVED: flex-1, h-full, min-h-0 */}
      <div className="w-full bg-background flex flex-col relative transition-colors">
        {selectedPartner ? (
          // REMOVED: h-full, min-h-0
          <div className="flex flex-col w-full">
            {/* 1. Integrated Header */}
            <div className="bg-card p-4 sm:p-5 border-b border-border shrink-0 transition-colors">
              <PartnerHeader
                selectedPartner={selectedPartner}
                onEdit={handleEdit}
              />
            </div>

            {/* 2. Content Sections */}
            {/* REMOVED: flex-1, min-h-0, overflow-y-auto, custom-scrollbar */}
            <div className="flex flex-col w-full">
              {/* Section Header */}
              <div className="flex items-center px-4 sm:px-5 py-2.5 bg-secondary/50 border-b border-border gap-2 transition-colors">
                <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                  Analytics & Fleet Summary
                </span>
              </div>

              {/* Grid Row */}
              <div className="grid grid-cols-1 xl:grid-cols-5 border-b border-border bg-background min-h-[300px] transition-colors shrink-0">
                <div className="xl:col-span-3 p-4 sm:p-5 border-b xl:border-b-0 xl:border-r border-border flex flex-col transition-colors">
                  <PartnerRevenueChart ownerId={selectedPartner.car_owner_id} />
                </div>
                <div className="xl:col-span-2 p-4 sm:p-5 flex flex-col transition-colors">
                  <PartnerCarUtil ownerId={selectedPartner.car_owner_id} />
                </div>
              </div>

              {/* 3. Integrated Management Tabs */}
              <div className="bg-background transition-colors pb-12">
                <Tabs defaultValue="units" className="w-full">
                  <div className="bg-secondary/30 px-3 py-2 border-b border-border transition-colors sticky top-0 z-10">
                    <TabsList className="h-8 bg-transparent p-0 flex justify-start w-full gap-2">
                      <TabsTrigger
                        value="units"
                        className="uppercase h-8 text-[9px] font-bold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:border-border border border-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all gap-1.5"
                      >
                        <Car className="w-3.5 h-3.5" /> Fleet Units
                      </TabsTrigger>
                      <TabsTrigger
                        value="financials"
                        className="uppercase h-8 text-[9px] font-bold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:border-border border border-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Financials
                      </TabsTrigger>
                      <TabsTrigger
                        value="documents"
                        className="uppercase h-8 text-[9px] font-bold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:border-border border border-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all gap-1.5"
                      >
                        <FileText className="w-3.5 h-3.5" /> Documents
                      </TabsTrigger>
                      <TabsTrigger
                        value="logs"
                        className="uppercase h-8 text-[9px] font-bold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:border-border border border-transparent data-[state=active]:text-foreground data-[state=active]:shadow-sm text-muted-foreground transition-all gap-1.5"
                      >
                        <History className="w-3.5 h-3.5" /> Activity Logs
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-4 sm:p-5 w-full h-[500px]">
                    <TabsContent
                      value="units"
                      className="m-0 outline-none data-[state=active]:flex flex-col w-full"
                    >
                      <PartnerUnits selectedPartner={selectedPartner} />
                    </TabsContent>
                    <TabsContent
                      value="financials"
                      className="m-0 outline-none data-[state=active]:flex flex-col w-full"
                    >
                      <PartnerFinancials selectedPartner={selectedPartner} />
                    </TabsContent>
                    <TabsContent
                      value="documents"
                      className="m-0 outline-none data-[state=active]:flex flex-col w-full"
                    >
                      <PartnerDocs selectedPartner={selectedPartner} />
                    </TabsContent>
                    <TabsContent
                      value="logs"
                      className="m-0 outline-none data-[state=active]:flex flex-col w-full"
                    >
                      <PartnerLogs selectedPartner={selectedPartner} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State - Full Width Centered */
          // ADDED: min-h-[500px] so it has some body when nothing is selected
          <div className="flex flex-col items-center justify-center min-h-[500px] w-full bg-background px-6 text-center transition-colors">
            <div className="relative mb-5">
              <div className="absolute inset-0 bg-primary/10 blur-2xl rounded-full scale-150 transition-colors" />
              <div className="relative p-6 rounded-3xl bg-secondary/50 border border-border shadow-sm transition-colors">
                <Handshake className="w-12 h-12 text-muted-foreground/50" />
              </div>
            </div>
            <h3 className="text-sm font-bold text-foreground uppercase tracking-widest transition-colors mb-2">
              Partner Selection Required
            </h3>
            <p className="text-[11px] font-medium text-muted-foreground max-w-[320px] leading-relaxed transition-colors">
              Use the dropdown menu at the top to select a fleet partner. You
              can view their performance analytics, manage their fleet, and
              review financial records here.
            </p>
          </div>
        )}
      </div>

      {/* --- FORM MODAL --- */}
      <PartnerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingPartner}
      />
    </div>
  );
}
