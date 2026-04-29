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
    <div className="h-screen bg-background text-foreground font-sans flex flex-col transition-colors duration-300">
      {/* --- COMPACT TOP HEADER (Matches AdminCarDetailsPage) --- */}
      <header className="px-4 py-3 sm:px-6 shrink-0 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-transparent border-b border-border/50 z-10">
        <div className="flex items-start gap-3 w-full sm:w-auto">
          <button className="mt-1 p-1 bg-card border border-border rounded shadow-sm text-muted-foreground hover:text-primary transition-colors shrink-0 cursor-default">
            <Building2 className="w-3.5 h-3.5" />
          </button>

          <div className="flex flex-col w-full">
            <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1.5 mb-0.5">
              <span>Fleet Operations</span>
              <span className="opacity-50">/</span>
              <span className="text-primary">Partner Management</span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto mt-0.5">
              <Popover open={isComboboxOpen} onOpenChange={setIsComboboxOpen}>
                <PopoverTrigger asChild>
                  <button
                    role="combobox"
                    aria-expanded={isComboboxOpen}
                    className="flex items-center justify-between w-full sm:w-[320px] px-3 py-1.5 bg-card border border-border hover:border-primary/50 rounded shadow-sm text-[11px] font-medium text-foreground transition-colors"
                  >
                    {selectedPartner ? (
                      <div className="flex items-center gap-2 truncate">
                        <Avatar className="w-4 h-4 border border-border">
                          <AvatarImage
                            src={
                              selectedPartner.users?.profile_picture_url ||
                              undefined
                            }
                            className="object-cover"
                          />
                          <AvatarFallback className="text-[7px] bg-primary text-primary-foreground font-bold">
                            {getInitials(
                              selectedPartner.business_name ||
                                selectedPartner.users?.first_name ||
                                "P",
                            )}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold truncate uppercase tracking-widest text-[10px]">
                          {selectedPartner.business_name ||
                            `${selectedPartner.users?.first_name} ${selectedPartner.users?.last_name}`}
                        </span>
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                        Select a fleet partner...
                      </span>
                    )}
                    <ChevronsUpDown className="ml-2 h-3.5 w-3.5 shrink-0 opacity-50" />
                  </button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-full sm:w-[320px] p-0 rounded-xl shadow-xl border-border bg-popover"
                  align="start"
                >
                  <Command>
                    <CommandInput
                      placeholder="Search partners..."
                      className="h-9 text-[11px] font-medium"
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
                              value={displayName}
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
                              <Avatar className="h-6 w-6 border border-border shrink-0">
                                <AvatarImage
                                  src={
                                    partner.users?.profile_picture_url ||
                                    undefined
                                  }
                                  className="object-cover"
                                />
                                <AvatarFallback className="text-[8px] bg-secondary text-foreground font-bold">
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
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleAdd}
            className="w-full sm:w-auto px-4 py-1.5 bg-primary hover:opacity-90 text-primary-foreground rounded shadow-sm text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-opacity"
          >
            <Plus className="w-3.5 h-3.5" /> Add Partner
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <main className="flex-1 overflow-y-auto p-2 py-4 sm:px-2 custom-scrollbar bg-background">
        <div className="max-w-[1600px] mx-auto flex flex-col gap-4 pb-8">
          {selectedPartner ? (
            <>
              {/* 1. Header Card */}
              <div className="bg-card border border-border rounded-xl p-4 shadow-sm shrink-0 transition-colors">
                <PartnerHeader
                  selectedPartner={selectedPartner}
                  onEdit={handleEdit}
                />
              </div>

              {/* 2. Analytics Grid (Split just like Car Details) */}
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 shrink-0">
                <div className="xl:col-span-8 bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col min-h-[350px] transition-colors">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                    <LayoutDashboard className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Revenue Analytics
                    </span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <PartnerRevenueChart
                      ownerId={selectedPartner.car_owner_id}
                    />
                  </div>
                </div>

                <div className="xl:col-span-4 bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col min-h-[350px] transition-colors">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
                    <Car className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                      Fleet Utilization
                    </span>
                  </div>
                  <div className="flex-1 min-h-0">
                    <PartnerCarUtil ownerId={selectedPartner.car_owner_id} />
                  </div>
                </div>
              </div>

              {/* 3. Management Tabs Card */}
              <div className="bg-card border border-border rounded-xl shadow-sm flex flex-col min-h-[400px] transition-colors">
                <Tabs
                  defaultValue="units"
                  className="w-full flex flex-col h-full"
                >
                  <div className="px-4 pt-4 border-b border-border/50">
                    <TabsList className="h-8 bg-transparent p-0 flex justify-start w-full gap-2 mb-[-1px]">
                      <TabsTrigger
                        value="units"
                        className="uppercase h-8 text-[10px] font-bold px-4 rounded-t-lg rounded-b-none border-t border-l border-r border-transparent data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:border-b-background text-muted-foreground data-[state=active]:text-foreground transition-all gap-1.5 relative top-[1px]"
                      >
                        <Car className="w-3.5 h-3.5" /> Fleet Units
                      </TabsTrigger>
                      <TabsTrigger
                        value="financials"
                        className="uppercase h-8 text-[10px] font-bold px-4 rounded-t-lg rounded-b-none border-t border-l border-r border-transparent data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:border-b-background text-muted-foreground data-[state=active]:text-foreground transition-all gap-1.5 relative top-[1px]"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Financials
                      </TabsTrigger>
                      <TabsTrigger
                        value="documents"
                        className="uppercase h-8 text-[10px] font-bold px-4 rounded-t-lg rounded-b-none border-t border-l border-r border-transparent data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:border-b-background text-muted-foreground data-[state=active]:text-foreground transition-all gap-1.5 relative top-[1px]"
                      >
                        <FileText className="w-3.5 h-3.5" /> Documents
                      </TabsTrigger>
                      <TabsTrigger
                        value="logs"
                        className="uppercase h-8 text-[10px] font-bold px-4 rounded-t-lg rounded-b-none border-t border-l border-r border-transparent data-[state=active]:bg-background data-[state=active]:border-border data-[state=active]:border-b-background text-muted-foreground data-[state=active]:text-foreground transition-all gap-1.5 relative top-[1px]"
                      >
                        <History className="w-3.5 h-3.5" /> Logs
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <div className="p-4 sm:p-5 flex-1 bg-background rounded-b-xl">
                    <TabsContent value="units" className="m-0 outline-none">
                      <PartnerUnits selectedPartner={selectedPartner} />
                    </TabsContent>
                    <TabsContent
                      value="financials"
                      className="m-0 outline-none"
                    >
                      <PartnerFinancials selectedPartner={selectedPartner} />
                    </TabsContent>
                    <TabsContent value="documents" className="m-0 outline-none">
                      <PartnerDocs selectedPartner={selectedPartner} />
                    </TabsContent>
                    <TabsContent value="logs" className="m-0 outline-none">
                      <PartnerLogs selectedPartner={selectedPartner} />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>
            </>
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center h-[60vh] w-full text-center text-muted-foreground">
              <Handshake className="w-12 h-12 mb-4 opacity-30" />
              <h2 className="text-lg font-bold text-foreground">
                Partner Selection Required
              </h2>
              <p className="text-xs mt-2 max-w-sm">
                Use the dropdown menu at the top to select a fleet partner. You
                can view their performance analytics, manage their fleet, and
                review financial records here.
              </p>
            </div>
          )}
        </div>
      </main>

      {/* --- FORM MODAL --- */}
      <PartnerForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        initialData={editingPartner}
      />
    </div>
  );
}
