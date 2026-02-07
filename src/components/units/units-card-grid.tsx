"use client";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Search,
  Funnel,
  Settings,
  Download,
  LayoutList,
  Sheet,
  Plus,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FleetSettingsDialog } from "./settings-dialog";
import { useState } from "react";
import UnitsCard from "./units-card";

export default function UnitsCardGrid() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  return (
    <div className="bg-card p-3 w-full shadow-sm rounded-md">
      <div className="flex flex-row-reverse mb-2">
        <Button
          variant="default"
          className=" flex items-center gap-2 bg-primary border rounded-sm text-xs! shadow-none! cursor-pointer text-card"
        >
          <Plus />
          <p className="text-md text-normal">Add Unit</p>
        </Button>
      </div>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-foreground font-semibold">Units Information</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-2 top-2.4 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search unit..."
              className="pl-8 border-gray-300 rounded-sm text-xs!"
              //   onChange={handleSearch}
            />
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className=" flex items-center gap-2 bg-transparent! border rounded-sm text-xs! shadow-none! cursor-pointer text-muted-foreground"
              >
                <Funnel />
                <p className="text-md text-normal">Filter</p>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-20">
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2">
                    <p>Refresh</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2 ">
                    <p>Review</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="border flex items-center rounded-sm">
            <Button
              variant="outline"
              className="bg-transparent! border-y-none! border-l-none! border-r rounded-none! shadow-none! cursor-pointer text-muted-foreground"
            >
              <LayoutList />
            </Button>
            <Button
              variant="outline"
              className="bg-transparent! border-none!  shadow-none! cursor-pointer text-muted-foreground"
            >
              <Sheet />
            </Button>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className=" flex items-center gap-2 bg-transparent! border rounded-sm text-xs! shadow-none! cursor-pointer text-muted-foreground"
              >
                <Download size={"icon-sm"} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-20">
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2">
                    <p>Refresh</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2 ">
                    <p>Review</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <FleetSettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
          />
        </div>
      </div>
      <UnitsCard />
    </div>
  );
}
