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

function NavMain({
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
        <SidebarGroupLabel className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1 px-2 h-auto whitespace-nowrap transition-all duration-200 overflow-hidden group-data-[collapsible=icon]:h-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:m-0 group-data-[collapsible=icon]:p-0">
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
                        "h-8 px-2.5 rounded-sm transition-all duration-200 gap-2.5",
                        isActive
                          ? "bg-slate-100 text-slate-900 font-bold"
                          : "text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-900",
                      )}
                    >
                      {item.icon && (
                        <item.icon
                          className={cn(
                            "w-3.5 h-3.5 shrink-0 transition-colors",
                            isActive ? "text-slate-900" : "text-slate-400",
                          )}
                        />
                      )}

                      {/* Smooth text fade-out */}
                      <span className="text-[11px] tracking-wide flex-1 whitespace-nowrap overflow-hidden transition-all duration-200 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0">
                        {item.title}
                      </span>

                      {/* Smooth chevron fade-out */}
                      <ChevronRight className="w-3.5 h-3.5 ml-auto transition-all duration-200 group-data-[state=open]/collapsible:rotate-90 opacity-50 group-data-[collapsible=icon]:w-0 group-data-[collapsible=icon]:opacity-0 group-data-[collapsible=icon]:m-0" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub className="border-slate-200 ml-3.5 pl-0 pr-0 mt-0.5 transition-all duration-200">
                      {item.items.map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className={cn(
                                "h-7 px-3 rounded-sm transition-all duration-200 relative before:absolute before:left-[-1px] before:top-1/2 before:-translate-y-1/2 before:w-[2px] before:h-0 before:bg-slate-900 hover:before:h-3",
                                isSubActive
                                  ? "bg-slate-50 text-slate-900 font-bold before:h-4"
                                  : "text-slate-500 font-medium hover:text-slate-900 hover:bg-transparent",
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
                      "h-8 px-2.5 rounded-sm transition-all duration-200 gap-2.5",
                      isParentActive
                        ? "bg-slate-100 text-slate-900 font-bold"
                        : "text-slate-500 font-semibold hover:bg-slate-50 hover:text-slate-900",
                    )}
                  >
                    <Link href={item.url} className="flex items-center w-full">
                      {item.icon && (
                        <item.icon
                          className={cn(
                            "w-3.5 h-3.5 shrink-0 transition-colors",
                            isParentActive
                              ? "text-slate-900"
                              : "text-slate-400",
                          )}
                        />
                      )}

                      {/* Smooth text fade-out */}
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

export default NavMain;
