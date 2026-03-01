import React from "react";
import ServiceAreaEditor from "@/components/bookings/service-area-editor";
import InspectionTemplateBuilder from "@/components/settings/inspection-template-builder";
import ContractTemplateBuilder from "@/components/settings/contract-template-builder";
import { Settings as SettingsIcon } from "lucide-react";

function Settings() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-y-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <SettingsIcon className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              System Settings
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Manage global templates, configurations, and preferences.
            </p>
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6 max-w-[1400px] mx-auto w-full space-y-10">
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Inspection Checklists
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure the standardized forms used throughout the rental
              lifecycle.
            </p>
          </div>
          <InspectionTemplateBuilder />
        </section>

        {/* --- ADD THE CONTRACT SECTION HERE --- */}
        <section>
          <div className="mb-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Legal Agreements
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Design the HTML contract that customers will sign digitally.
            </p>
          </div>
          <ContractTemplateBuilder />
        </section>
      </div>
    </div>
  );
}

export default Settings;
