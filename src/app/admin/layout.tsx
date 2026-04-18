"use client";

import { usePathname } from "next/navigation";
import React, { useMemo, useState } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Settings, UserCircle, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CarCatalogueModal from "@/components/dashboard/car-catalogue";
import NotificationsPopover from "@/components/topbar/notifications-popover";
import SettingsDialog from "@/components/settings/settings-dialog";
import LogoutDialog from "@/components/auth/logout-dialog";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // State to manage the Settings Takeover Modal
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLogoutOpen, setIsLogoutOpen] = useState(false);

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
      {/* 1. LAYOUT FRAME: 
        Uses bg-background and text-foreground to instantly sync with light/dark themes
      */}
      <SidebarInset className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground font-sans transition-colors duration-300">
        {/* 2. HEADER: 
          Transparent background, tight padding, semantic border
        */}
        <header className="flex justify-between items-center py-3 px-6 border-b border-border shrink-0 bg-transparent transition-colors duration-300">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb) => {
                if (crumb.label === "Admin") return null;
                return (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem className="hidden md:block">
                      {crumb.isLast ? (
                        <BreadcrumbPage className="text-[11px] font-bold uppercase tracking-widest text-foreground">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink
                          href={crumb.href}
                          className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!crumb.isLast && (
                      <BreadcrumbSeparator className="hidden md:block text-muted-foreground/50" />
                    )}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>

          {/* RIGHT ACTIONS CLUSTER */}
          <div className="flex items-center gap-2">
            <CarCatalogueModal />

            {/* Semantic separator line */}
            <div className="h-4 w-px bg-border mx-1 hidden sm:block" />

            {/* Notifications */}
            <NotificationsPopover />

            {/* Settings (Converted from Link to Button Trigger) */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              onClick={() => setIsSettingsOpen(true)}
            >
              <Settings className="w-4 h-4" />
            </Button>

            {/* User Profile */}
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary ml-1 transition-colors shadow-none outline-none focus-visible:ring-1 focus-visible:ring-primary"
                >
                  <UserCircle className="w-[18px] h-[18px]" />
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent
                align="end"
                className="w-36 rounded-xl border-border bg-popover shadow-xl p-1 transition-colors"
              >
                <DropdownMenuLabel className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground px-2 py-1.5">
                  My Account
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border" />

                <DropdownMenuItem className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary px-2.5 py-1.5">
                  <User className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  Profile
                </DropdownMenuItem>

                <DropdownMenuItem className="text-[11px] font-semibold rounded-lg cursor-pointer transition-colors focus:bg-secondary px-2.5 py-1.5">
                  <Settings className="w-3.5 h-3.5 mr-2 text-muted-foreground" />
                  Settings
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-border mt-1" />

                <DropdownMenuItem
                  className="text-[10px] font-bold uppercase tracking-widest text-destructive hover:text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer py-2 mt-1 rounded-lg transition-colors"
                  onClick={() => {
                    setIsLogoutOpen(true);
                  }}
                >
                  <LogOut className="w-3.5 h-3.5 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* 4. MAIN CONTENT AREA */}
        <main className="flex-1 overflow-y-auto bg-transparent custom-scrollbar">
          {children}
        </main>

        {/* --- GLOBAL MODALS --- */}
        <SettingsDialog
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
        />
        <LogoutDialog
          isOpen={isLogoutOpen}
          onClose={() => setIsLogoutOpen(false)}
        />
      </SidebarInset>
    </SidebarProvider>
  );
}
