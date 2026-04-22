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
} from "lucide-react";

import Image from "next/image";

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
  users: [
    { title: "Clients", url: "/admin/clients", icon: SquareUser },
    { title: "Drivers", url: "/admin/drivers", icon: LifeBuoy },
    { title: "Fleet Partners", url: "/admin/fleet-partners", icon: Users },
  ],
  fleet: [
    { title: "Bookings", url: "/admin/bookings", icon: ListCheck },
    { title: "Units (Cars)", url: "/admin/units", icon: CarFront },
    { title: "Tracking", url: "/admin/tracking", icon: Route },
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
              <div className="relative flex aspect-square size-12 items-center justify-center shrink-0 transition-all duration-200 group-data-[collapsible=icon]:!m-0">
                <Image
                  src="/mc-ormoc-logo.png" /* Change this to your exact filename */
                  alt="Company Logo"
                  width={40}
                  height={40}
                  priority
                  className="object-contain"
                />
              </div>

              <div className="flex flex-col gap-0.5 leading-none overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:!ml-0">
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
        <NavMain items={sidebarData.users} label="Users" />
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
