import React from "react";
import ServiceAreaEditor from "@/components/bookings/service-area-editor";

function Settings() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Platform Settings</h1>
        <p className="text-slate-500 mt-2">
          Manage your service areas, pricing, and system configurations.
        </p>
      </div>

      <hr className="border-slate-200" />

      {/* Service Area Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Service Area Boundary
            </h2>
            <p className="text-sm text-slate-500">
              Draw the polygon on the map to define where clients can book
              rides. Bookings outside this area will be restricted.
            </p>
          </div>
        </div>

        {/* The Editor Component */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
          <ServiceAreaEditor />
        </div>
      </section>

      {/* Placeholder for Future Settings */}
      <section className="opacity-50 pointer-events-none grayscale">
        <h2 className="text-xl font-semibold text-slate-800">
          Base Rates & Pricing
        </h2>
        <p className="text-sm text-slate-500 mb-4">Coming soon...</p>
        <div className="h-32 bg-slate-100 rounded-lg border border-dashed border-slate-300 flex items-center justify-center">
          Pricing Configuration
        </div>
      </section>
    </div>
  );
}

export default Settings;
