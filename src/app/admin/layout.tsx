"use client";
import { usePathname } from "next/navigation";
import React from "react";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
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
import { useMemo } from "react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const breadcrumbs = useMemo(() => {
    const segments = pathname.split("/").filter((segment) => segment !== ""); //remove empty strings

    return segments.map((segment, index) => {
      const href = `/${segments.slice(0, index + 1).join("/")}`;
      // formatting
      const label = segment
        .replace(/-/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase());

      return { href, label, isLast: index === segments.length - 1 };
    });
  }, [pathname]);

  const pageTitle =
    breadcrumbs.length > 0
      ? breadcrumbs[breadcrumbs.length - 1].label
      : "Dashboard";

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <main className="bg-background flex-1 h-screen overflow-auto">
          <header className="flex justify-between items-center py-2 px-3">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbs.map((crumb, index) => {
                  // Skip rendering the "admin" root segment if you added a custom Home link above
                  if (crumb.label === "Admin") return null;

                  return (
                    <React.Fragment key={crumb.href}>
                      <BreadcrumbItem className="hidden md:block ">
                        {crumb.isLast ? (
                          <BreadcrumbPage className="!font-[600]">
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
            <div className="flex gap-1">
              <Button
                size={"icon-sm"}
                variant={"outline"}
                className="bg-white cursor-pointer"
              >
                <Bell className="stroke-[0.15rem] " />
              </Button>
              <Button
                size={"icon-sm"}
                variant={"outline"}
                className="bg-white cursor-pointer"
              >
                <MessageCircleMore className="stroke-[0.15rem]" />
              </Button>
              <Button
                size={"icon-sm"}
                variant={"outline"}
                className="bg-white cursor-pointer"
              >
                <User className="stroke-[0.15rem]" />
              </Button>
            </div>
          </header>
          <div className="pr-3 bg-background">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
