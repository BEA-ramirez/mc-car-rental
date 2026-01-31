import React from "react";
import ClientsDataGrid from "@/components/clients/clients-datagrid";
import ClientsOverview from "@/components/clients/clients-overview";

async function Client() {
  return (
    <div className="flex flex-col gap-3">
      <ClientsOverview />
      <ClientsDataGrid />
    </div>
  );
}

export default Client;
