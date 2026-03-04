import ExpensesMain from "@/components/expenses/expenses-main";

export const metadata = {
  title: "Expenses & Payouts | Admin Dashboard",
  description:
    "Manage fleet owner payouts, maintenance costs, and operational ledger.",
};

export default function ExpensesPage() {
  return <ExpensesMain />;
}
