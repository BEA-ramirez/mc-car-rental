import React from "react";
import ClientsDataGrid from "@/components/clients/clients-datagrid";
import { getUsers } from "@/actions/helper/get-users";

async function Client() {
  const users = await getUsers();
  return (
    <div>
      <ClientsDataGrid users={users} />
    </div>
  );
}

export default Client;
