"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";

import {
  LayoutDashboard,
  ListCheck,
  CarFront,
  Calendar,
  SquareUser,
  ChartColumnBig,
  Route,
  LifeBuoy,
  Users,
  FileText,
  ChartPie,
  SwatchBook,
} from "lucide-react";

import NavMain from "./sidebar/nav-main";

export const sidebarData = {
  // Group 1: Overview
  overview: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    { title: "Calendar", url: "/admin/calendar", icon: Calendar },
  ],
  // Group 2: Operations
  operations: [
    { title: "Bookings", url: "/admin/bookings", icon: ListCheck },
    { title: "Clients", url: "/admin/clients", icon: SquareUser },
    { title: "Drivers", url: "/admin/drivers", icon: LifeBuoy },
  ],
  // Group 3: Fleet
  fleet: [
    { title: "Units (Cars)", url: "/admin/units", icon: CarFront },
    { title: "Tracking", url: "/admin/tracking", icon: Route },
    { title: "Fleet Partners", url: "/admin/fleet-partners", icon: Users },
  ],
  // Group 4: Business
  business: [
    {
      title: "Financials",
      url: "/admin/financials",
      icon: ChartColumnBig,
      items: [
        { title: "Income", url: "/admin/financials/income" },
        { title: "Expenses", url: "/admin/financials/expenses" },
      ],
    },
    { title: "Documents", url: "/admin/docs-mngmt", icon: FileText },
    { title: "Reports", url: "/admin/reports", icon: ChartPie },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();

  return (
    <Sidebar
      collapsible="icon"
      className="border-r border-slate-200 bg-white"
      {...props}
    >
      {/* Changed p-4 to p-3, and added group-data-[collapsible=icon]:p-2
        This gives the logo enough room to perfectly center when collapsed!
      */}
      <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2  border-slate-100 bg-white transition-all duration-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={toggleSidebar}
              className="hover:bg-slate-50 cursor-pointer rounded-sm p-1.5 transition-all duration-200 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!justify-center"
            >
              {/* Added group-data-[collapsible=icon]:!m-0 to strip any accidental margins */}
              <div className="bg-slate-900 text-white flex aspect-square size-7 items-center justify-center rounded-sm shrink-0 shadow-sm transition-all duration-200 group-data-[collapsible=icon]:!m-0">
                <SwatchBook className="w-3.5 h-3.5" />
              </div>

              {/* CRITICAL FIX: Added group-data-[collapsible=icon]:!ml-0 to kill the phantom margin! */}
              <div className="flex flex-col gap-0.5 leading-none overflow-hidden ml-1 transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:!ml-0">
                <span className="font-black text-[12px] text-slate-900 uppercase tracking-widest truncate whitespace-nowrap">
                  MC Rentals
                </span>
                <span className="font-medium text-[9px] text-slate-500 uppercase tracking-wider truncate whitespace-nowrap">
                  Admin System
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-white pt-2 custom-scrollbar transition-all duration-200">
        <NavMain items={sidebarData.overview} label="Overview" />
        <NavMain items={sidebarData.operations} label="Operations" />
        <NavMain items={sidebarData.fleet} label="Fleet Management" />
        <NavMain items={sidebarData.business} label="Business Hub" />
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  );
}
