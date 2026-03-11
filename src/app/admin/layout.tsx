"use client";

import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, Settings, UserCircle, CarFront, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import CarCatalogueModal from "@/components/dashboard/car-catalogue";
import NotificationsPopover from "@/components/topbar/notifications-popover";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter((segment) => segment !== "");

    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return { href, label, isLast: index === segments.length - 1 };
    });
  }, [pathname]);

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* 1. LAYORT FRAME: 
        Set the background of the entire inset to slate-50 to match the dashboard.
      */}
      <SidebarInset className="flex flex-col h-screen overflow-hidden bg-slate-50 font-sans">
        {/* 2. HEADER: 
          Transparent background, tight padding, and a crisp bottom border.
        */}
        <header className="flex justify-between items-center py-3 px-6 border-b border-slate-200 shrink-0 bg-transparent">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                if (crumb.label === "Admin") return null;
                return (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem className="hidden md:block">
                      {crumb.isLast ? (
                        <BreadcrumbPage className="text-[11px] font-bold uppercase tracking-widest text-slate-900">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={crumb.href}
                          className="text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-600 transition-colors"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!crumb.isLast && (
                      <BreadcrumbSeparator className="hidden md:block text-slate-300" />
                    )}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>

          {/* 3. RIGHT ACTIONS CLUSTER */}
          <div className="flex items-center gap-2">
            {/* INJECT THE MODAL COMPONENT HERE! */}
            <CarCatalogueModal />

            {/* Subtle Divider */}
            <div className="h-4 w-px bg-slate-200 mx-1 hidden sm:block" />

            {/* Notifications */}
            <NotificationsPopover />

            {/* Settings */}
            <Link href={"/admin/settings"}>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-sm text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
              >
                <Settings className="w-4 h-4" />
              </Button>
            </Link>

            {/* User Profile */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-sm text-slate-500 hover:text-slate-900 hover:bg-slate-200/50 ml-1"
            >
              <UserCircle className="w-[18px] h-[18px]" />
            </Button>
          </div>
        </header>

        {/* 4. MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-transparent">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
