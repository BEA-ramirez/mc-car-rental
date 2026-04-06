"use client";

import { useState } from "react";
import { useFleetSettings } from "../../../hooks/use-fleetSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Tag, Loader2, Edit2, Save } from "lucide-react";
import { FeatureType } from "@/lib/schemas/car";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

export default function FeaturesTab() {
  const { features, saveFeature, deleteFeature, isFeaturesLoading } =
    useFleetSettings();

  // State for Adding
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");

  // State for Editing
  const [editingFeature, setEditingFeature] = useState<FeatureType | null>(
    null,
  );
  const [isEditOpen, setIsEditOpen] = useState(false);

  // --- HANDLERS ---
  const handleAdd = async () => {
    if (!newName.trim()) return;
    await saveFeature({
      name: newName,
      description: newDesc,
      is_archived: false,
    });
    setNewName("");
    setNewDesc("");
  };

  const openEditModal = (feature: FeatureType) => {
    setEditingFeature(feature);
    setIsEditOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingFeature || !editingFeature.name.trim()) return;

    await saveFeature({
      feature_id: editingFeature.feature_id,
      name: editingFeature.name,
      description: editingFeature.description,
      is_archived: false,
    });

    setIsEditOpen(false);
    setEditingFeature(null);
  };

  return (
    <div className="flex flex-col h-full min-h-0 gap-3 pb-2 transition-colors duration-300">
      {/* --- ADD NEW BAR --- */}
      <div className="bg-card border border-border p-3 rounded-xl shrink-0 shadow-sm transition-colors">
        <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Create New Feature
        </h4>
        <div className="flex flex-col md:flex-row gap-2 items-start">
          <Input
            placeholder="E.g., Apple CarPlay"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-[11px] font-medium bg-secondary text-foreground flex-1 border-border focus-visible:ring-primary rounded-lg shadow-none transition-colors"
          />
          <Input
            placeholder="Brief description (Optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-8 text-[11px] font-medium bg-secondary text-foreground flex-[1.5] border-border focus-visible:ring-primary rounded-lg shadow-none transition-colors"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="h-8 text-[11px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground w-full md:w-auto shrink-0 shadow-none rounded-lg transition-opacity"
          >
            Add Feature
          </Button>
        </div>
      </div>

      {/* --- LIST AREA --- */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden border border-border rounded-xl bg-card shadow-sm transition-colors">
        {/* Header - Stays pinned */}
        <div className="px-4 py-2.5 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0">
          <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
            Active Features
          </span>
          <span className="text-[9px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
            {features.length} Total
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0 custom-scrollbar bg-background/50">
          {isFeaturesLoading ? (
            <div className="flex flex-col h-full min-h-[150px] items-center justify-center text-muted-foreground gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-[11px] font-semibold">Loading features...</p>
            </div>
          ) : features.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-border rounded-xl bg-card">
              <Tag className="h-6 w-6 text-muted-foreground/50 mb-2" />
              <p className="text-[11px] font-semibold text-muted-foreground">
                No features added yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 pb-2">
              {features.map((feature) => (
                <div
                  key={feature.feature_id}
                  className="group flex items-start justify-between p-2.5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all cursor-default"
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="bg-secondary p-1.5 rounded-md border border-border shrink-0 mt-0.5">
                      <Tag className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-bold text-[11px] text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                        {feature.name}
                      </span>
                      {feature.description ? (
                        <span className="text-[10px] font-medium text-muted-foreground truncate mt-0.5">
                          {feature.description}
                        </span>
                      ) : (
                        <span className="text-[10px] text-muted-foreground/50 italic mt-0.5 font-medium">
                          No description provided.
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 ml-2 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                      onClick={() => openEditModal(feature)}
                      title="Edit Feature"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                      onClick={() => deleteFeature(feature.feature_id!)}
                      title="Delete Feature"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- EDIT DIALOG --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-xl gap-0 border-border shadow-2xl bg-background transition-colors duration-300">
          <DialogHeader className="p-4 bg-card border-b border-border">
            <DialogTitle className="text-sm font-bold text-foreground flex items-center gap-2 uppercase tracking-wider">
              <Edit2 className="w-4 h-4 text-primary" /> Edit Feature
            </DialogTitle>
            <DialogDescription className="text-[11px] font-medium text-muted-foreground mt-1">
              Update the name or description of this amenity.
            </DialogDescription>
          </DialogHeader>

          {editingFeature && (
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                >
                  Feature Name
                </Label>
                <Input
                  id="name"
                  className="h-8 text-[11px] font-medium bg-secondary text-foreground border-border focus-visible:ring-primary rounded-lg shadow-none"
                  value={editingFeature.name}
                  onChange={(e) =>
                    setEditingFeature({
                      ...editingFeature,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-1.5">
                <Label
                  htmlFor="desc"
                  className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest"
                >
                  Description
                </Label>
                <Input
                  id="desc"
                  className="h-8 text-[11px] font-medium bg-secondary text-foreground border-border focus-visible:ring-primary rounded-lg shadow-none"
                  value={editingFeature.description || ""}
                  onChange={(e) =>
                    setEditingFeature({
                      ...editingFeature,
                      description: e.target.value,
                    })
                  }
                />
              </div>
            </div>
          )}

          <DialogFooter className="p-3 bg-card border-t border-border flex sm:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-[11px] font-semibold bg-card hover:bg-secondary text-foreground border-border rounded-lg shadow-none transition-colors"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-[11px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity"
              onClick={handleSaveEdit}
            >
              <Save className="w-3.5 h-3.5 mr-1.5" />
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
