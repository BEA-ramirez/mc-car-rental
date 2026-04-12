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
import { cn } from "@/lib/utils";

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
      <div className="p-8 text-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest animate-pulse">
        Loading Template Builder...
      </div>
    );

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden flex flex-col max-w-3xl transition-colors">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0 transition-colors">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center shadow-sm">
            <ListChecks className="w-4 h-4 text-primary" />
          </div>
          <div className="flex flex-col text-left">
            <h2 className="text-sm font-bold text-foreground tracking-tight leading-none mb-1 uppercase">
              Master Inspection Template
            </h2>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-widest leading-none">
              Define the standard checklist for pre & post-trip inspections
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
          Save Template
        </Button>
      </div>

      {/* Builder Body */}
      <div className="p-4 space-y-4 bg-background transition-colors">
        {categories.map((category) => (
          <div
            key={category.id}
            className="bg-card border border-border rounded-xl shadow-sm p-3 animate-in fade-in slide-in-from-bottom-2 duration-300 transition-colors"
          >
            {/* Category Header */}
            <div className="flex items-center gap-2 mb-3">
              <GripVertical className="w-4 h-4 text-muted-foreground/50 cursor-grab active:cursor-grabbing" />
              <Input
                placeholder="Category Name (e.g., Exterior, Engine)"
                value={category.name}
                onChange={(e) =>
                  updateCategoryName(category.id, e.target.value)
                }
                className="h-8 text-[11px] font-bold bg-secondary border-border focus-visible:ring-1 focus-visible:ring-primary rounded-lg transition-colors text-foreground shadow-none"
              />
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg transition-colors"
                onClick={() => deleteCategory(category.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Checklist Items */}
            <div className="pl-6 space-y-1.5">
              {category.items.map((item) => (
                <div key={item.id} className="flex items-center gap-2 group">
                  <div className="w-3 h-3 border border-muted-foreground/30 rounded-sm shrink-0" />{" "}
                  {/* Fake checkbox for visuals */}
                  <Input
                    placeholder="Checklist Item (e.g., Front Bumper)"
                    value={item.label}
                    onChange={(e) =>
                      updateItemLabel(category.id, item.id, e.target.value)
                    }
                    className="h-7 text-[11px] font-medium border-transparent hover:border-border focus-visible:border-border focus-visible:ring-1 focus-visible:ring-primary bg-transparent hover:bg-secondary transition-colors text-foreground shadow-none px-2 rounded-md"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground/50 opacity-0 group-hover:opacity-100 hover:text-destructive hover:bg-destructive/10 shrink-0 transition-all rounded-md"
                    onClick={() => deleteItem(category.id, item.id)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}

              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest text-primary hover:text-primary hover:bg-primary/10 mt-1 rounded-md transition-colors"
                onClick={() => addItem(category.id)}
              >
                <Plus className="w-3 h-3 mr-1" /> Add Item
              </Button>
            </div>
          </div>
        ))}

        <Button
          variant="outline"
          className="w-full border-dashed border-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/50 hover:bg-secondary h-10 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors shadow-none"
          onClick={addCategory}
        >
          <Plus className="w-3.5 h-3.5 mr-2" /> Add New Category
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
