"use client";

import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export default function NavMain({
  label,
  items,
}: {
  label?: string;
  items: {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: {
      title: string;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup className="px-3 py-2 transition-all duration-200 group-data-[collapsible=icon]:px-2">
      {label && (
        <SidebarGroupLabel className="text-[9px] font-bold uppercase tracking-widest text-sidebar-foreground/50 mb-1 px-2 h-auto whitespace-nowrap transition-all duration-200 overflow-hidden group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:m-0 group-data-[collapsible=icon]:p-0">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="space-y-0.5">
        {items.map((item) => {
          const isParentActive =
            pathname === item.url || pathname.startsWith(item.url + "/");
          const hasActiveChild = item.items?.some(
            (sub) => pathname === sub.url,
          );
          const isActive = isParentActive || hasActiveChild;

          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={item.isActive || hasActiveChild}
              className="group/collapsible"
            >
              {item.items ? (
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={cn(
                        "h-8 px-2.5 rounded-lg transition-all duration-200 gap-2.5",
                        isActive
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-sidebar-foreground/70 font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {item.icon && (
                        <item.icon
                          className={cn(
                            "w-3.5 h-3.5 shrink-0 transition-colors",
                            // FIX: Scoped to menu-item so it only hovers individually
                            isActive
                              ? "text-primary"
                              : "text-sidebar-foreground/50 group-hover/menu-item:text-sidebar-accent-foreground",
                          )}
                        />
                      )}

                      <span className="text-[11px] tracking-wide flex-1 whitespace-nowrap overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                        {item.title}
                      </span>

                      <ChevronRight className="w-3.5 h-3.5 ml-auto transition-all duration-200 group-data-[state=open]/collapsible:rotate-90 text-sidebar-foreground/40 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:m-0" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-sidebar-border ml-3.5 pl-0 pr-0 mt-0.5 transition-all duration-200">
                      {item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={cn(
                                "h-7 px-3 rounded-lg transition-all duration-200 relative before:absolute before:left-[-1px] before:top-1/2 before:-translate-y-1/2 before:w-[2px] before:h-0 before:bg-sidebar-foreground/20 hover:before:h-3 hover:before:bg-primary",
                                isSubActive
                                  ? "bg-sidebar-accent text-primary font-bold before:h-4 before:bg-primary"
                                  : "text-sidebar-foreground/70 font-medium hover:text-sidebar-accent-foreground hover:bg-transparent",
                              )}
                            >
                              <Link href={subItem.url}>
                                <span className="text-[10px] tracking-wide ml-1 whitespace-nowrap">
                                  {subItem.title}
                                </span>
                              </Link>
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        );
                      })}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    className={cn(
                      "h-8 px-2.5 rounded-lg transition-all duration-200 gap-2.5",
                      isParentActive
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-sidebar-foreground/70 font-medium hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Link href={item.url} className="flex items-center w-full">
                      {item.icon && (
                        <item.icon
                          className={cn(
                            "w-3.5 h-3.5 shrink-0 transition-colors",
                            // FIX: Scoped to menu-item so it only hovers individually
                            isParentActive
                              ? "text-primary"
                              : "text-sidebar-foreground/50 group-hover/menu-item:text-sidebar-accent-foreground",
                          )}
                        />
                      )}

                      <span className="text-[11px] tracking-wide flex-1 whitespace-nowrap overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
