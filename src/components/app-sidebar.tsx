"use client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

import { GalleryVerticalEnd, KeySquare } from "lucide-react";

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
  Settings,
  Bell,
  SwatchBook,
} from "lucide-react";

import NavMain from "./sidebar/nav-main";
import NavUser from "./sidebar/nav-user";

export const sidebarData = {
  user: {
    name: "Admin User",
    email: "admin@rentals.com",
    avatar: "/vercel.svg",
  },
  // Group 1: Overview
  overview: [
    {
      title: "Dashboard",
      url: "/admin/dashboard",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Calendar",
      url: "/admin/calendar",
      icon: Calendar,
    },
  ],
  // Group 2: Operations
  operations: [
    {
      title: "Bookings",
      url: "/admin/bookings",
      icon: ListCheck,
    },
    {
      title: "Clients",
      url: "/admin/clients",
      icon: SquareUser,
    },
    {
      title: "Drivers",
      url: "/admin/drivers",
      icon: LifeBuoy,
    },
  ],
  // Group 3: Fleet
  fleet: [
    {
      title: "Units (Cars)",
      url: "/admin/units",
      icon: CarFront,
    },
    {
      title: "Tracking",
      url: "/admin/tracking",
      icon: Route,
    },
    {
      title: "Fleet Partners",
      url: "/admin/fleet-partners",
      icon: Users,
    },
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
    {
      title: "Documents",
      url: "/admin/docs-mngmt",
      icon: FileText,
    },
    {
      title: "Reports",
      url: "/admin/reports",
      icon: ChartPie,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { toggleSidebar } = useSidebar();
  return (
    <Sidebar collapsible="icon" {...props} className="bg-[#f8f8f8]">
      <SidebarHeader className="bg-transparent">
        <SidebarMenu>
          <SidebarMenuItem>
            {/* 3. Add onClick to your MenuButton */}
            <SidebarMenuButton
              size="lg"
              onClick={toggleSidebar}
              className="hover:bg-accent cursor-pointer"
            >
              <div className="bg-[#00ddd2] text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg shrink-0">
                <SwatchBook className="size-4" />
              </div>
              <div className="flex flex-col gap-0.5 leading-none overflow-hidden">
                <span className="font-bold text-md text-[#222] truncate">
                  MC
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.overview} label="Overview" />
        <NavMain items={sidebarData.operations} label="Operations" />
        <NavMain items={sidebarData.fleet} label="Fleet Management" />
        <NavMain items={sidebarData.business} label="Business Hub" />
      </SidebarContent>
      {/* <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter> */}
      <SidebarRail />
    </Sidebar>
  );
}
