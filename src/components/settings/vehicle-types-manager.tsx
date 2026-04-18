"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Plus,
  Trash2,
  Save,
  Loader2,
  CarFront,
  GripVertical,
} from "lucide-react";
import { toast } from "sonner";
import { getSystemSettings, updateSystemSetting } from "@/actions/settings";

// Helper to generate quick unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function VehicleTypesManager() {
  const [types, setTypes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing types on mount
  useEffect(() => {
    const loadTypes = async () => {
      try {
        const data = await getSystemSettings(["vehicle_types"]);
        const existingTypes = data.vehicle_types || [];

        // If empty, start them off with common defaults
        setTypes(
          existingTypes.length > 0
            ? existingTypes
            : [
                { id: generateId(), label: "Sedan", isActive: true },
                { id: generateId(), label: "SUV", isActive: true },
                { id: generateId(), label: "Van", isActive: true },
              ],
        );
      } catch {
        toast.error("Failed to load vehicle types.");
      } finally {
        setIsLoading(false);
      }
    };
    loadTypes();
  }, []);

  // --- ACTIONS ---
  const addType = () => {
    setTypes([...types, { id: generateId(), label: "", isActive: true }]);
  };

  const updateTypeLabel = (id: string, newLabel: string) => {
    setTypes(types.map((t) => (t.id === id ? { ...t, label: newLabel } : t)));
  };

  const toggleTypeStatus = (id: string, newStatus: boolean) => {
    setTypes(
      types.map((t) => (t.id === id ? { ...t, isActive: newStatus } : t)),
    );
  };

  const deleteType = (id: string) => {
    setTypes(types.filter((t) => t.id !== id));
  };

  // --- SAVE ---
  const handleSave = async () => {
    // Basic validation: clear out empty labels
    const cleanedTypes = types.filter((t) => t.label.trim() !== "");

    if (cleanedTypes.length === 0) {
      toast.error("You must have at least one vehicle type.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await updateSystemSetting("vehicle_types", cleanedTypes);
      if (!res.success) throw new Error(res.message);

      setTypes(cleanedTypes); // Update UI with cleaned version
      toast.success("Vehicle types saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save vehicle types.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Loading Vehicle Types...
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col max-w-3xl transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <CarFront className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
              Vehicle Classifications
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Define the categories used for filtering cars
            </p>
          </div>
        </div>
        <Button
          className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
          onClick={handleSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
          ) : (
            <Save className="w-3.5 h-3.5 mr-2" />
          )}
          Save Changes
        </Button>
      </div>

      {/* Builder Body */}
      <div className="p-4 space-y-3 bg-background transition-colors">
        {/* Table Headers */}
        <div className="flex items-center px-4 py-1 text-[9px] font-bold text-muted-foreground uppercase tracking-widest border-b border-border pb-2 transition-colors">
          <div className="w-5"></div> {/* Spacer for drag handle */}
          <div className="flex-1">Category Name</div>
          <div className="w-20 text-center">Status</div>
          <div className="w-8"></div> {/* Spacer for delete button */}
        </div>

        {/* List Items */}
        {types.map((type) => (
          <div
            key={type.id}
            className="flex items-center gap-3 bg-card border border-border rounded-lg shadow-sm p-2 animate-in fade-in slide-in-from-bottom-2 duration-300 transition-colors"
          >
            <GripVertical className="w-3.5 h-3.5 text-muted-foreground cursor-grab active:cursor-grabbing shrink-0" />

            <Input
              placeholder="e.g., Sedan, SUV, Luxury"
              value={type.label}
              onChange={(e) => updateTypeLabel(type.id, e.target.value)}
              className="h-8 text-[11px] font-bold bg-secondary border-border focus-visible:ring-primary flex-1 shadow-none rounded-md transition-colors text-foreground"
            />

            <div className="w-20 flex justify-center shrink-0">
              <Switch
                checked={type.isActive}
                onCheckedChange={(checked) =>
                  toggleTypeStatus(type.id, checked)
                }
                className="scale-90" // Slightly smaller switch to fit density
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-md transition-colors"
              onClick={() => deleteType(type.id)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        ))}

        <div className="pt-2">
          <Button
            variant="outline"
            className="w-full border-dashed border-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-secondary h-10 text-[10px] font-bold uppercase tracking-widest rounded-lg transition-colors shadow-none"
            onClick={addType}
          >
            <Plus className="w-3.5 h-3.5 mr-2" /> Add Vehicle Category
          </Button>
        </div>
      </div>
    </div>
  );
}
