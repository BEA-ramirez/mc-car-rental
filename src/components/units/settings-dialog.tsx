"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
      <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-xl border-border shadow-2xl bg-background transition-colors duration-300">
        {/* --- MODAL HEADER --- */}
        <DialogHeader className="px-4 py-3 md:px-5 md:py-4 border-b border-border bg-card shrink-0 transition-colors">
          <DialogTitle className="flex items-center gap-2 text-sm font-bold text-foreground uppercase tracking-wider">
            <div className="bg-primary/10 p-1.5 rounded-md border border-primary/20">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            Fleet Configuration
          </DialogTitle>
          <DialogDescription className="text-[11px] font-medium text-muted-foreground mt-1">
            Manage global settings, reusable car specifications, and features
            for your entire fleet.
          </DialogDescription>
        </DialogHeader>

        {/* --- TABS --- */}
        <Tabs defaultValue="specs" className="flex-1 flex flex-col min-h-0">
          {/* Tabs Navigation Bar */}
          <div className="px-4 py-2.5 md:px-5 bg-card shrink-0 border-b border-border transition-colors">
            <TabsList className="h-8 bg-secondary p-0.5 rounded-lg border border-border inline-flex">
              <TabsTrigger
                value="specs"
                className="h-6 text-[10px] font-semibold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                Configurations
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="h-6 text-[10px] font-semibold px-4 rounded-md data-[state=active]:bg-card data-[state=active]:shadow-sm data-[state=active]:text-foreground text-muted-foreground transition-all gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" />
                Global Features
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tabs Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden p-4 md:p-5 bg-background custom-scrollbar">
            <TabsContent
              value="specs"
              // Using data-[state=active]:flex ensures it behaves as a flex column ONLY when visible, fixing scroll issues
              className="h-full m-0 data-[state=active]:flex flex-col min-h-0 outline-none"
            >
              <SpecificationsTab />
            </TabsContent>

            <TabsContent
              value="features"
              className="h-full m-0 data-[state=active]:flex flex-col min-h-0 outline-none"
            >
              <FeaturesTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
