"use client";

import React, { useState } from "react";
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
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm p-12 flex flex-col items-center justify-center text-center h-[400px]">
      <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-sm flex items-center justify-center mb-4">
        <Wrench className="w-5 h-5 text-slate-400" />
      </div>
      <h2 className="text-sm font-bold text-slate-900 mb-1">{title}</h2>
      <p className="text-xs text-slate-500 max-w-sm mb-6">{description}</p>
      <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-sm uppercase tracking-widest border border-blue-100">
        Module In Development
      </span>
    </div>
  );
}

// --- MAIN PAGE ---
export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("inspection_template");

  // Helper to find the active tab's metadata
  const activeTabData = SETTINGS_TABS.flatMap((g) => g.items).find(
    (i) => i.id === activeTab,
  );

  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-hidden">
      {/* GLOBAL HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <SettingsIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              System Settings
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Manage global templates, financial configurations, and operational
              rules.
            </p>
          </div>
        </div>
      </div>

      {/* BODY SPLIT (Sidebar + Content) */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT SIDEBAR NAVIGATION */}
        <aside className="w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0 py-4 flex flex-col gap-6">
          {SETTINGS_TABS.map((group, gIdx) => (
            <div key={gIdx} className="px-3">
              <h3 className="px-3 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
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
                        "w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-bold rounded-sm transition-all outline-none",
                        isActive
                          ? "bg-slate-900 text-white shadow-sm"
                          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
                      )}
                    >
                      <Icon
                        className={cn(
                          "w-3.5 h-3.5 shrink-0",
                          isActive ? "text-slate-300" : "text-slate-400",
                        )}
                      />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </aside>

        {/* RIGHT MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-slate-50/50 p-6 lg:p-10">
          <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* Dynamic Section Header */}
            {activeTabData && (
              <div className="mb-6">
                <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <activeTabData.icon className="w-5 h-5 text-blue-600" />
                  {activeTabData.label}
                </h2>
                <p className="text-xs font-medium text-slate-500 mt-1">
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

              {/* Documents (Your completed modules!) */}
              {activeTab === "inspection_template" && (
                <InspectionTemplateBuilder />
              )}
              {activeTab === "contract_template" && <ContractTemplateBuilder />}

              {/* System */}
              {activeTab === "appearance" && (
                <PlaceholderSetting
                  title="Appearance & Preferences"
                  description="Customize UI density, color themes, and general dashboard aesthetics."
                />
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
