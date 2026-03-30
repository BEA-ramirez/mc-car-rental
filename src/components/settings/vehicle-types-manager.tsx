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
      } catch (error) {
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
      <div className="p-8 text-center text-slate-500 text-sm font-bold animate-pulse">
        Loading Vehicle Types...
      </div>
    );

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col max-w-3xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <CarFront className="w-4 h-4 text-blue-600" />
            Vehicle Classifications
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5 max-w-md">
            Define the categories used for filtering cars on the customer
            storefront and organizing your fleet.
          </p>
        </div>
        <Button
          className="h-8 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-sm shadow-sm"
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
      <div className="p-5 space-y-3 bg-slate-50/50">
        {/* Table Headers */}
        <div className="flex items-center px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200">
          <div className="w-6"></div> {/* Spacer for drag handle */}
          <div className="flex-1">Category Name</div>
          <div className="w-24 text-center">Active Status</div>
          <div className="w-10"></div> {/* Spacer for delete button */}
        </div>

        {/* List Items */}
        {types.map((type) => (
          <div
            key={type.id}
            className="flex items-center gap-4 bg-white border border-slate-200 rounded-sm shadow-sm p-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <GripVertical className="w-4 h-4 text-slate-300 cursor-grab active:cursor-grabbing shrink-0" />

            <Input
              placeholder="e.g., Sedan, SUV, Luxury"
              value={type.label}
              onChange={(e) => updateTypeLabel(type.id, e.target.value)}
              className="h-9 text-sm font-bold bg-slate-50 border-slate-200 focus-visible:ring-blue-500 flex-1"
            />

            <div className="w-24 flex justify-center shrink-0">
              <Switch
                checked={type.isActive}
                onCheckedChange={(checked) =>
                  toggleTypeStatus(type.id, checked)
                }
              />
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
              onClick={() => deleteType(type.id)}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ))}

        <div className="pt-3">
          <Button
            variant="outline"
            className="w-full border-dashed border-2 border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 hover:bg-white h-12 text-sm font-bold"
            onClick={addType}
          >
            <Plus className="w-4 h-4 mr-2" /> Add Vehicle Category
          </Button>
        </div>
      </div>
    </div>
  );
}
