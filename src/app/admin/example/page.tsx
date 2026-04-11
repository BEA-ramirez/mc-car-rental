"use client";
import { paymentColumns } from "@/components/columns";
import { DataTable } from "@/components/data-table";
import { useIncomes } from "../../../../hooks/use-incomes";

export default function IncomesDashboard() {
  const { data } = useIncomes(); // Assuming this fetches your dashboard data

  return (
    <div className="p-6">
      <h2 className="text-lg font-bold mb-4">Recent Payments</h2>

      {/* Boom. You now have a fully sorted, paginated, and searchable table! */}
      <DataTable
        columns={paymentColumns}
        data={data?.recentPayments || []}
        searchKey="title" // Adds a search bar that filters by the "title" column
      />
    </div>
  );
}
