import ReportsMain from "@/components/reports/reports-main";

export const metadata = {
  title: "Reports & Analytics | Admin Dashboard",
  description:
    "Financial aggregates, unit economics, and operational analytics.",
};

export default function ReportsPage() {
  // We return the component directly because ReportsMain handles
  // its own height (h-[calc(100vh-80px)]) and background styling.
  return <ReportsMain />;
}
