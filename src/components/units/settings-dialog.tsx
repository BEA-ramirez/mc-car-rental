"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "../ui/button";
import { Settings, Tag, Car } from "lucide-react";
import FeaturesTab from "./features-tab";
import SpecificationsTab from "./specifications-tab";

export function FleetSettingsDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-transparent! shadow-none! cursor-pointer text-foreground hover:bg-foreground/10"
        >
          <Settings />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Fleet Configuration
          </DialogTitle>
          <DialogDescription>
            Manage global settings, reusable car specifications, and features.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="specs"
          className="flex-1 flex flex-col overflow-hidden"
        >
          <div className="px-6 pt-4">
            <TabsList>
              <TabsTrigger value="specs" className="gap-2">
                <Car className="w-4 h-4" /> Car Configurations
              </TabsTrigger>
              <TabsTrigger value="features" className="gap-2">
                <Tag className="w-4 h-4" /> Global Features
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 bg-muted/10 overflow-hidden p-6 pt-2">
            <TabsContent value="specs" className="h-full m-0">
              <SpecificationsTab />
            </TabsContent>
            <TabsContent value="features" className="h-full m-0">
              <FeaturesTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
