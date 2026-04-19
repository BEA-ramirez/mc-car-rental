import CustomerNavbar from "@/components/customer/customer-navbar";

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#050B10] text-white font-sans selection:bg-[#64c5c3] selection:text-black">
      <CustomerNavbar />
      <main className="relative">{children}</main>
    </div>
  );
}
