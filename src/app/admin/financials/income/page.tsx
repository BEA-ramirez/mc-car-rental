import IncomesMain from "@/components/income/income-main";

export const metadata = {
  title: "Revenue & Collections | Admin Dashboard",
  description:
    "Track booking payments, ancillary fees, and outstanding receivables.",
};

export default function IncomesPage() {
  return (
    <div className="flex flex-col gap-6 ">
      <IncomesMain />
    </div>
  );
}
