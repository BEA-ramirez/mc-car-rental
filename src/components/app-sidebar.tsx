"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter, // <-- Imported SidebarFooter
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

import NavMain from "./sidebar/nav-main"; // <-- Adjust path to where your ModeToggle is saved
import { ModeToggle } from "./mode-toggle";

export const sidebarData = {
  overview: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    { title: "Calendar", url: "/admin/calendar", icon: Calendar },
  ],
  operations: [
    { title: "Bookings", url: "/admin/bookings", icon: ListCheck },
    { title: "Clients", url: "/admin/clients", icon: SquareUser },
    { title: "Drivers", url: "/admin/drivers", icon: LifeBuoy },
  ],
  fleet: [
    { title: "Units (Cars)", url: "/admin/units", icon: CarFront },
    { title: "Tracking", url: "/admin/tracking", icon: Route },
    { title: "Fleet Partners", url: "/admin/fleet-partners", icon: Users },
  ],
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
      className="border-r border-sidebar-border bg-sidebar text-sidebar-foreground"
      {...props}
    >
      <SidebarHeader className="p-1 group-data-[collapsible=icon]:p-2 border-b border-sidebar-border bg-sidebar transition-all duration-200">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              onClick={toggleSidebar}
              className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground cursor-pointer rounded-lg p-1.5 transition-all duration-200 group-data-[collapsible=icon]:!p-0 group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!justify-center"
            >
              <div className="bg-primary text-primary-foreground flex aspect-square size-7 items-center justify-center rounded-md shrink-0 shadow-[0_0_10px_rgba(100,197,195,0.2)] transition-all duration-200 group-data-[collapsible=icon]:!m-0">
                <SwatchBook className="w-3.5 h-3.5" />
              </div>

              <div className="flex flex-col gap-0.5 leading-none overflow-hidden ml-1 transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:!ml-0">
                <span className="font-black text-[12px] text-sidebar-foreground uppercase tracking-widest truncate whitespace-nowrap">
                  MC Rentals
                </span>
                <span className="font-semibold text-[9px] text-sidebar-foreground/50 uppercase tracking-wider truncate whitespace-nowrap">
                  Admin System
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar pt-2 transition-all duration-200 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <NavMain items={sidebarData.overview} label="Overview" />
        <NavMain items={sidebarData.operations} label="Operations" />
        <NavMain items={sidebarData.fleet} label="Fleet Management" />
        <NavMain items={sidebarData.business} label="Business Hub" />
      </SidebarContent>

      {/* --- ADDED SIDEBAR FOOTER FOR MODE TOGGLE --- */}
      <SidebarFooter className="bg-sidebar border-t border-sidebar-border p-3 transition-all duration-200 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex justify-center group-data-[collapsible=icon]:justify-center">
            {/* The ModeToggle button is placed here. It will center perfectly when collapsed. */}
            <ModeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
