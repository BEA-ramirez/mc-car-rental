import React from "react";
import ClientsDataGrid from "@/components/clients/clients-datagrid";
import ClientsOverview from "@/components/clients/clients-overview";
import { getUsers } from "@/actions/helper/get-users";

async function Client() {
  const users = await getUsers();
  return (
    <div className="flex flex-col gap-3">
      <ClientsOverview />
      <ClientsDataGrid users={users} />
    </div>
  );
}

export default Client;
