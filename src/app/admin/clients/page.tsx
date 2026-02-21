import React from "react";
import ClientsDataGrid from "@/components/clients/clients-datagrid";
import ClientsOverview from "@/components/clients/clients-overview";

export default async function ClientPage() {
  return (
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50/50 min-h-0">
      {/* --- PAGE HEADER --- */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-10">
        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-800">
            Clients Management
          </h1>
          <p className="text-xs text-muted-foreground">
            Overview and directory of all registered customers, partners, and
            staff.
          </p>
        </div>
      </div>

      {/* The overview metrics sit cleanly at the top */}
      <ClientsOverview />

      {/* The grid takes the remaining height. 
          NOTE: Make sure `h-[calc(100vh-80px)]` is changed to `h-full` 
          inside your `clients-datagrid.tsx` wrapper div! 
      */}
      <div className="flex-1 min-h-0">
        <ClientsDataGrid />
      </div>
    </div>
  );
}
