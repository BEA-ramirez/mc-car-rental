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
} from "lucide-react";

import NavMain from "./sidebar/nav-main";
import NavUser from "./sidebar/nav-user";

export const sidebarData = {
  user: {
    name: "Admin User",
    email: "admin_user@gmail.com",
    avatar: "/vercel.svg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboard,
      isActive: true,
    },
    {
      title: "Bookings",
      url: "#",
      icon: ListCheck,
    },
    {
      title: "Calendar",
      url: "#",
      icon: Calendar,
    },
    {
      title: "Clients",
      url: "#",
      icon: SquareUser,
    },
    {
      title: "Units",
      url: "#",
      icon: CarFront,
    },
    {
      title: "Engagements",
      url: "#",
      icon: Users,
    },
    {
      title: "Tracking",
      url: "#",
      icon: Route,
    },
    {
      title: "Drivers",
      url: "#",
      icon: LifeBuoy,
    },
    {
      title: "Financials",
      url: "#",
      icon: ChartColumnBig,
      items: [
        {
          title: "Income",
          url: "#",
        },
        {
          title: "Expenses",
          url: "#",
        },
      ],
    },
    {
      title: "Documents Management",
      url: "#",
      icon: FileText,
    },
    {
      title: "Reports",
      url: "#",
      icon: ChartPie,
    },
    {
      title: "Settings",
      url: "#",
      icon: Settings,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="mt-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <a href="#">
                <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                  <GalleryVerticalEnd className="size-4" />
                </div>
                <div className="flex flex-col gap-0.5 leading-none">
                  <span className="font-medium">MC ORMOC CAR RENTAL</span>
                  <span className="">v0.0.0</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={sidebarData.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
