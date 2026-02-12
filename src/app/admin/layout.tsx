"use client";
import { usePathname } from "next/navigation";
import React, { useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Bell, MessageCircleMore, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

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
      {/* 1. CHANGE: SidebarInset controls the layout frame.
        h-screen + overflow-hidden prevents the 'body' from scrolling. 
      */}
      <SidebarInset className="flex flex-col h-screen overflow-hidden">
        {/* 2. CHANGE: Header is now a sibling of Main (not inside it).
          This keeps it fixed at the top. 
        */}
        <header className="flex justify-between items-center py-3 px-4 bg-background shrink-0">
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((crumb, index) => {
                if (crumb.label === "Admin") return null;
                return (
                  <React.Fragment key={crumb.href}>
                    <BreadcrumbItem className="hidden md:block">
                      {crumb.isLast ? (
                        <BreadcrumbPage className="font-semibold text-foreground/80">
                          {crumb.label}
                        </BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!crumb.isLast && (
                      <BreadcrumbSeparator className="hidden md:block" />
                    )}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex gap-2">
            <Button size={"icon-sm"} variant={"outline"} className="bg-white">
              <Bell className="stroke-2 w-3 h-3" />
            </Button>
            <Button size={"icon-sm"} variant={"outline"} className="bg-white">
              <MessageCircleMore className="stroke-2 w-3 h-3" />
            </Button>
            <Button size={"icon-sm"} variant={"outline"} className="bg-white">
              <User className="stroke-2 w-3 h-3" />
            </Button>
          </div>
        </header>

        {/* 3. CHANGE: Main is flex-1 (takes remaining space).
          overflow-y-auto moves the scrollbar HERE.
          Removed h-screen.
        */}
        <main className="flex-1 overflow-y-auto bg-background pr-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
