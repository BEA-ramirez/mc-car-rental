"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Settings as SettingsIcon,
  Building2,
  MapPin,
  Banknote,
  Wallet,
  ReceiptCent,
  Map,
  ListChecks,
  FileSignature,
  Monitor,
  Wrench,
  CarFront,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- EXISTING COMPONENTS ---
import InspectionTemplateBuilder from "@/components/settings/inspection-template-builder";
import ContractTemplateBuilder from "@/components/settings/contract-template-builder";
import CompanyProfileForm from "@/components/settings/company-profile-form";
import PaymentMethodsForm from "@/components/settings/payment-method-form";
import BookingFeesForm from "@/components/settings/booking-fees-form";
import TaxSettingsForm from "@/components/settings/tax-settings-form";
import BusinessHubsManager from "@/components/settings/business-hubs-manager";
import ServiceAreaEditor from "@/components/bookings/service-area-editor";
import VehicleTypesManager from "@/components/settings/vehicle-types-manager";

// --- SIDEBAR CONFIGURATION ---
const SETTINGS_TABS = [
  {
    group: "General",
    items: [
      {
        id: "company_profile",
        label: "Company Profile",
        icon: Building2,
        description: "Name, address, and contact details.",
      },
      {
        id: "business_hubs",
        label: "Business Hubs",
        icon: MapPin,
        description: "Manage garages and pickup kiosks.",
      },
    ],
  },
  {
    group: "Financials & Billing",
    items: [
      {
        id: "booking_fees",
        label: "Fees & Deposits",
        icon: Banknote,
        description: "Driver rates, delivery, and deposits.",
      },
      {
        id: "payment_methods",
        label: "Payment Methods",
        icon: Wallet,
        description: "Configure GCash, BDO, and Cash.",
      },
      {
        id: "tax_settings",
        label: "Tax Configuration",
        icon: ReceiptCent,
        description: "VAT and BIR registration details.",
      },
    ],
  },
  {
    group: "Operations",
    items: [
      {
        id: "service_area",
        label: "Service Area Map",
        icon: Map,
        description: "Define delivery boundaries via GMaps.",
      },
      {
        id: "vehicle_types",
        label: "Vehicle Classes",
        icon: CarFront,
        description: "Manage car categories like Sedan, SUV, etc.",
      },
    ],
  },
  {
    group: "Document Templates",
    items: [
      {
        id: "inspection_template",
        label: "Inspection Checklist",
        icon: ListChecks,
        description: "Pre/Post-trip digital clipboard.",
      },
      {
        id: "contract_template",
        label: "Legal Contracts",
        icon: FileSignature,
        description: "HTML rental agreement builder.",
      },
    ],
  },
  {
    group: "System Preferences",
    items: [
      {
        id: "appearance",
        label: "Appearance",
        icon: Monitor,
        description: "Dark mode, density, and UI scaling.",
      },
    ],
  },
];

// --- PLACEHOLDER COMPONENT ---
function PlaceholderSetting({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-sm p-8 flex flex-col items-center justify-center text-center h-[300px] transition-colors">
      <div className="w-10 h-10 bg-secondary border border-border rounded-lg flex items-center justify-center mb-3 transition-colors">
        <Wrench className="w-4 h-4 text-muted-foreground" />
      </div>
      <h2 className="text-xs font-bold text-foreground mb-1 uppercase tracking-widest">
        {title}
      </h2>
      <p className="text-[11px] font-medium text-muted-foreground max-w-sm mb-5 leading-relaxed">
        {description}
      </p>
      <span className="text-[9px] font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md uppercase tracking-widest border border-primary/20">
        Module In Development
      </span>
    </div>
  );
}

interface SettingsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

// --- MAIN DIALOG COMPONENT ---
export default function SettingsDialog({
  isOpen,
  onClose,
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("company_profile");

  // Helper to find the active tab's metadata
  const activeTabData = SETTINGS_TABS.flatMap((g) => g.items).find(
    (i) => i.id === activeTab,
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl gap-0! xl:max-w-[1000px] p-0 overflow-hidden border-border bg-background shadow-2xl rounded-2xl flex flex-col h-[85vh] max-h-[850px] transition-colors duration-300 [&>button.absolute]:hidden">
        {/* GLOBAL HEADER */}
        <DialogHeader className="px-5 py-3 border-b border-border bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center shadow-sm transition-colors">
              <SettingsIcon className="w-4 h-4 text-background" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
                System Settings
              </DialogTitle>
              <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
                Manage global templates & operational rules
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* BODY SPLIT (Sidebar + Content) */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* LEFT SIDEBAR NAVIGATION */}
          <div className="w-[200px] lg:w-[210px] bg-card border-r border-border shrink-0 flex flex-col transition-colors">
            <ScrollArea className="flex-1 custom-scrollbar">
              <div className="py-4 flex flex-col gap-5">
                {SETTINGS_TABS.map((group, gIdx) => (
                  <div key={gIdx} className="px-3">
                    <h3 className="px-3 text-[9px] font-bold text-muted-foreground uppercase tracking-widest mb-1.5">
                      {group.group}
                    </h3>
                    <div className="flex flex-col gap-0.5">
                      {group.items.map((item) => {
                        const isActive = activeTab === item.id;
                        const Icon = item.icon;
                        return (
                          <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={cn(
                              "w-full flex items-center gap-2.5 px-3 py-2 text-left text-[11px] font-bold rounded-lg transition-all outline-none",
                              isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                            )}
                          >
                            <Icon
                              className={cn(
                                "w-3.5 h-3.5 shrink-0",
                                isActive
                                  ? "text-primary"
                                  : "text-muted-foreground/70",
                              )}
                            />
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* RIGHT MAIN CONTENT AREA */}
          <div className="flex-1 bg-background flex flex-col transition-colors overflow-hidden relative min-h-0">
            <ScrollArea className="flex-1 custom-scrollbar h-full">
              <div className="p-5 lg:p-8 max-w-4xl mx-auto w-full">
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  {/* Dynamic Section Header */}
                  {activeTabData && (
                    <div className="mb-5 pb-5 border-b border-border transition-colors">
                      <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-2 uppercase">
                        <div className="w-7 h-7 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center transition-colors">
                          <activeTabData.icon className="w-3.5 h-3.5 text-primary" />
                        </div>
                        {activeTabData.label}
                      </h2>
                      <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest mt-1.5 ml-9">
                        {activeTabData.description}
                      </p>
                    </div>
                  )}

                  {/* Dynamic Content Renderer */}
                  <div className="w-full">
                    {/* General */}
                    {activeTab === "company_profile" && <CompanyProfileForm />}
                    {activeTab === "business_hubs" && <BusinessHubsManager />}

                    {/* Financials */}
                    {activeTab === "booking_fees" && <BookingFeesForm />}
                    {activeTab === "payment_methods" && <PaymentMethodsForm />}
                    {activeTab === "tax_settings" && <TaxSettingsForm />}

                    {/* Operations */}
                    {activeTab === "service_area" && <ServiceAreaEditor />}
                    {activeTab === "vehicle_types" && <VehicleTypesManager />}

                    {/* Documents */}
                    {activeTab === "inspection_template" && (
                      <InspectionTemplateBuilder />
                    )}
                    {activeTab === "contract_template" && (
                      <ContractTemplateBuilder />
                    )}

                    {/* System */}
                    {activeTab === "appearance" && (
                      <PlaceholderSetting
                        title="Appearance & Preferences"
                        description="Customize UI density, color themes, and general dashboard aesthetics."
                      />
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
