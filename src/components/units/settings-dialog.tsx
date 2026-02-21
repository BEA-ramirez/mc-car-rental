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
      <DialogContent className="sm:max-w-4xl h-[85vh] flex flex-col p-0 gap-0 overflow-hidden rounded-lg border-slate-200 shadow-xl bg-white">
        {/* --- MODAL HEADER --- */}
        <DialogHeader className="px-5 py-4 border-b border-slate-200 bg-white shrink-0">
          <DialogTitle className="flex items-center gap-2 text-base font-bold text-slate-800 tracking-tight">
            <div className="bg-slate-100 p-1.5 rounded-md border border-slate-200">
              <Settings className="w-4 h-4 text-slate-600" />
            </div>
            Fleet Configuration
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-1.5">
            Manage global settings, reusable car specifications, and features
            for your entire fleet.
          </DialogDescription>
        </DialogHeader>

        {/* --- TABS --- */}
        <Tabs defaultValue="specs" className="flex-1 flex flex-col min-h-0">
          {/* Tabs Navigation Bar */}
          <div className="px-5 pt-3 pb-3 bg-white shrink-0 border-b border-slate-100">
            <TabsList className="h-8 bg-slate-100 p-0.5 rounded-md border border-slate-200 inline-flex">
              <TabsTrigger
                value="specs"
                className="h-6 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                Configurations
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="h-6 text-xs font-medium px-4 rounded-[4px] data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-slate-900 text-slate-500 transition-all gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" />
                Global Features
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tabs Content Area */}
          <div className="flex-1 min-h-0 overflow-hidden p-5">
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
