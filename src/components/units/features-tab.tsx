import { useState } from "react";
import { useFleetSettings } from "../../../hooks/use-fleetSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Tag, Loader2, Pencil, Save } from "lucide-react"; // Added Pencil, Save
import { Card } from "@/components/ui/card";
import { FeatureType } from "@/lib/schemas/car";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
      feature_id: editingFeature.feature_id, // Important: ID triggers UPDATE logic
      name: editingFeature.name,
      description: editingFeature.description,
      is_archived: false,
    });

    setIsEditOpen(false);
    setEditingFeature(null);
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* --- ADD NEW BAR (Same as before) --- */}
      <div className="flex flex-col gap-2 p-4 border rounded-lg bg-muted/10">
        <h4 className="text-sm font-semibold text-muted-foreground mb-1">
          Add New Feature
        </h4>
        <div className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <Input
              placeholder="Feature Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-background"
            />
            <Input
              placeholder="Description (Optional)"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              className="bg-background"
            />
          </div>
          <Button onClick={handleAdd} disabled={!newName.trim()}>
            <Plus className="w-4 h-4 mr-2" /> Add
          </Button>
        </div>
      </div>

      {/* --- LIST --- */}
      {isFeaturesLoading ? (
        <div className="flex flex-col h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-xs">Loading features...</p>
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto pr-2 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {features.map((feature) => (
              <Card
                key={feature.feature_id}
                className="p-3 flex items-start justify-between group hover:border-primary transition-colors"
              >
                <div className="flex flex-col gap-1 overflow-hidden">
                  <div className="flex items-center gap-2">
                    <Tag className="w-3.5 h-3.5 text-primary" />
                    <span className="font-medium text-sm truncate">
                      {feature.name}
                    </span>
                  </div>
                  {feature.description && (
                    <p className="text-xs text-muted-foreground truncate max-w-50 pl-5">
                      {feature.description}
                    </p>
                  )}
                </div>

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* EDIT BUTTON */}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEditModal(feature)}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>

                  {/* DELETE BUTTON */}
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => deleteFeature(feature.feature_id!)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* --- EDIT DIALOG --- */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-106.25">
          <DialogHeader>
            <DialogTitle>Edit Feature</DialogTitle>
          </DialogHeader>

          {editingFeature && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editingFeature.name}
                  onChange={(e) =>
                    setEditingFeature({
                      ...editingFeature,
                      name: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="desc">Description</Label>
                <Input
                  id="desc"
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

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit}>
              <Save className="w-4 h-4 mr-2" /> Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
