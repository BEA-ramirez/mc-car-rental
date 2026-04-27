"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, Tag, Car, X } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="sm:max-w-5xl w-[95vw] gap-0! h-[90vh] flex flex-col p-0 overflow-hidden rounded-2xl border-border shadow-2xl bg-background transition-colors duration-300 [&>button.absolute]:hidden">
        {/* --- MODAL HEADER --- */}
        <DialogHeader className="px-5 py-4 bg-card shrink-0 flex flex-row items-center justify-between transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-sm transition-colors">
              <Settings className="w-4 h-4 text-primary" />
            </div>
            <div className="flex flex-col text-left">
              <DialogTitle className="text-sm font-bold text-foreground tracking-tight leading-none mb-1.5 uppercase">
                Fleet Configuration
              </DialogTitle>
              <DialogDescription className="text-[10px] font-medium text-muted-foreground leading-none m-0">
                Manage global settings, specifications, and features.
              </DialogDescription>
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition-colors shadow-none"
            onClick={() => onOpenChange(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        {/* --- TABS --- */}
        <Tabs defaultValue="specs" className="flex-1 flex flex-col min-h-0">
          {/* Tabs Navigation Bar */}
          <div className="px-4 py-2 border-b border-border bg-secondary/30 shrink-0 z-10 transition-colors">
            <TabsList className="h-9 bg-background/50 p-1 flex w-full max-w-[400px] rounded-lg border border-border shadow-inner transition-colors">
              <TabsTrigger
                value="specs"
                className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-foreground data-[state=active]:shadow-sm data-[state=active]:text-background text-muted-foreground transition-all gap-1.5"
              >
                <Car className="w-3.5 h-3.5" />
                Configurations
              </TabsTrigger>
              <TabsTrigger
                value="features"
                className="flex-1 h-7 text-[10px] font-bold uppercase tracking-widest rounded-md data-[state=active]:bg-foreground data-[state=active]:shadow-sm data-[state=active]:text-background text-muted-foreground transition-all gap-1.5"
              >
                <Tag className="w-3.5 h-3.5" />
                Features
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Tabs Content Area */}
          <div className="flex-1 min-h-0 overflow-y-auto p-4 sm:p-3 bg-background custom-scrollbar transition-colors">
            <TabsContent
              value="specs"
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
