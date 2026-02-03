"use client";
import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { usePathname } from "next/navigation"; // Already imported
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
    <SidebarGroup>
      {label && (
        <SidebarGroupLabel className="uppercase text-[11px] text-foreground/50">
          {label}
        </SidebarGroupLabel>
      )}
      <SidebarMenu className="mt-[-0.2rem]">
        {items.map((item) => {
          // Logic: Is this specific item or any of its children active?
          const isParentActive =
            pathname === item.url || pathname.startsWith(item.url + "/");
          const hasActiveChild = item.items?.some(
            (sub) => pathname === sub.url,
          );

          return (
            <Collapsible
              key={item.title}
              asChild
              // Automatically open the dropdown if a child is active
              defaultOpen={item.isActive || hasActiveChild}
              className="group/collapsible"
            >
              {item.items ? (
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className="gap-3 hover:shadow-sm"
                      variant={"outline"}
                      // shadcn isActive prop
                      isActive={isParentActive || hasActiveChild}
                    >
                      {item.icon && (
                        <item.icon
                          className={`stroke-[2px] size-1 ${isParentActive || hasActiveChild ? "text-primary" : ""}`}
                        />
                      )}
                      <span
                        className={`text-[13px] text-foreground/70 font-medium ${isParentActive || hasActiveChild ? "text-primary" : ""}`}
                      >
                        {item.title}
                      </span>
                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      {item.items?.map((subItem) => {
                        const isSubActive = pathname === subItem.url;
                        return (
                          <SidebarMenuSubItem key={subItem.title}>
                            <SidebarMenuSubButton
                              asChild
                              className="gap-3 hover:shadow-sm"
                              isActive={isSubActive}
                            >
                              <Link href={subItem.url}>
                                <span
                                  className={`text-[13px] font-medium ${isSubActive ? "text-primary" : ""}`}
                                >
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
                    className="gap-2 hover:shadow-sm"
                    isActive={isParentActive}
                  >
                    <Link href={item.url} className="flex items-center">
                      {item.icon && (
                        <item.icon
                          className={`stroke-[2px] size-1 ${isParentActive ? "text-primary" : ""}`}
                        />
                      )}
                      <span
                        className={`text-[13px] font-medium text-foreground/70 ${isParentActive ? "text-primary" : ""}`}
                      >
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
