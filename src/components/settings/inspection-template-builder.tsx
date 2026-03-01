"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  GripVertical,
  Save,
  Loader2,
  ListChecks,
} from "lucide-react";
import { toast } from "sonner";
import {
  getInspectionTemplate,
  saveInspectionTemplate,
  InspectionCategory,
} from "@/actions/settings";

// Helper to generate quick unique IDs
const generateId = () => Math.random().toString(36).substring(2, 9);

export default function InspectionTemplateBuilder() {
  const [categories, setCategories] = useState<InspectionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load existing template on mount
  useEffect(() => {
    const loadTemplate = async () => {
      try {
        const data = await getInspectionTemplate();
        // If empty, start them off with one default category
        setCategories(
          data.length > 0
            ? data
            : [
                {
                  id: generateId(),
                  name: "Exterior",
                  items: [{ id: generateId(), label: "Front Bumper" }],
                },
              ],
        );
      } catch (error) {
        toast.error("Failed to load template.");
      } finally {
        setIsLoading(false);
      }
    };
    loadTemplate();
  }, []);

  // --- CATEGORY ACTIONS ---
  const addCategory = () => {
    setCategories([...categories, { id: generateId(), name: "", items: [] }]);
  };

  const updateCategoryName = (id: string, newName: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === id ? { ...cat, name: newName } : cat,
      ),
    );
  };

  const deleteCategory = (id: string) => {
    setCategories(categories.filter((cat) => cat.id !== id));
  };

  // --- ITEM ACTIONS ---
  const addItem = (categoryId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: [...cat.items, { id: generateId(), label: "" }] }
          : cat,
      ),
    );
  };

  const updateItemLabel = (
    categoryId: string,
    itemId: string,
    newLabel: string,
  ) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? {
              ...cat,
              items: cat.items.map((item) =>
                item.id === itemId ? { ...item, label: newLabel } : item,
              ),
            }
          : cat,
      ),
    );
  };

  const deleteItem = (categoryId: string, itemId: string) => {
    setCategories(
      categories.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat,
      ),
    );
  };

  // --- SAVE ---
  const handleSave = async () => {
    // Basic validation: clear out empty items/categories
    const cleanedTemplate = categories
      .filter((cat) => cat.name.trim() !== "")
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((item) => item.label.trim() !== ""),
      }));

    if (cleanedTemplate.length === 0) {
      toast.error("Template cannot be completely empty.");
      return;
    }

    setIsSaving(true);
    try {
      await saveInspectionTemplate(cleanedTemplate);
      setCategories(cleanedTemplate); // Update UI with cleaned version
      toast.success("Inspection template saved successfully!");
    } catch (error) {
      toast.error("Failed to save template.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center text-slate-500 text-sm font-bold animate-pulse">
        Loading Template Builder...
      </div>
    );

  return (
    <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col max-w-3xl">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-blue-600" />
            Master Inspection Template
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Define the standard checklist used by staff during pre-trip and
            post-trip inspections.
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
          Save Template
        </Button>
      </div>

      {/* Builder Body */}
      <div className="p-5 space-y-6 bg-slate-50/50">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-white border border-slate-200 rounded-sm shadow-sm p-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-4">
              <GripVertical className="w-4 h-4 text-slate-300 cursor-grab active:cursor-grabbing" />
              <Input
                placeholder="Category Name (e.g., Exterior, Engine)"
                value={category.name}
                onChange={(e) =>
                  updateCategoryName(category.id, e.target.value)
                }
                className="h-9 text-sm font-bold bg-slate-50 border-slate-200 focus-visible:ring-blue-500"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                onClick={() => deleteCategory(category.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            {/* Checklist Items */}
            <div className="pl-6 space-y-2">
              {category.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <div className="w-3 h-3 border border-slate-300 rounded-sm shrink-0 mt-0.5" />{" "}
                  {/* Fake checkbox for visuals */}
                  <Input
                    placeholder="Checklist Item (e.g., Front Bumper, Headlights)"
                    value={item.label}
                    onChange={(e) =>
                      updateItemLabel(category.id, item.id, e.target.value)
                    }
                    className="h-8 text-xs border-transparent hover:border-slate-200 focus-visible:border-blue-500 focus-visible:ring-0 bg-transparent hover:bg-slate-50 transition-colors"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-300 opacity-0 group-hover:opacity-100 hover:text-red-600 hover:bg-red-50 shrink-0 transition-opacity"
                    onClick={() => deleteItem(category.id, item.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 mt-2"
                onClick={() => addItem(category.id)}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Add Item
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full border-dashed border-2 border-slate-300 text-slate-500 hover:text-slate-900 hover:border-slate-400 hover:bg-white h-12 text-sm font-bold"
          onClick={addCategory}
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Category
        </Button>
      </div>
    </div>
  );
}

// Just adding this quick X icon locally since we didn't import it at the top
const X = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M18 6 6 18" />
    <path d="m6 6 12 12" />
  </svg>
);
