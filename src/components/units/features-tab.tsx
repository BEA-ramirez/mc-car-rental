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
    // FIX 1: Use h-full min-h-0 so it perfectly fills the TabsContent without pushing outside the dialog
    <div className="flex flex-col h-full min-h-0 gap-4 pb-2">
      {/* --- ADD NEW BAR --- */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-md shrink-0">
        <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
          Create New Feature
        </h4>
        <div className="flex flex-col md:flex-row gap-2 items-start">
          <Input
            placeholder="E.g., Apple CarPlay"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="h-8 text-xs bg-white flex-1 border-slate-200 focus-visible:ring-1"
          />
          <Input
            placeholder="Brief description (Optional)"
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="h-8 text-xs bg-white flex-[1.5] border-slate-200 focus-visible:ring-1"
          />
          <Button
            size="sm"
            onClick={handleAdd}
            disabled={!newName.trim()}
            className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white w-full md:w-auto shrink-0 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" />
            Add Feature
          </Button>
        </div>
      </div>

      {/* --- LIST AREA --- */}
      {/* FIX 2: Added min-h-0 to the flex-1 container to allow inner scrolling */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden border border-slate-200 rounded-md bg-white">
        {/* Header - Stays pinned */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Active Features
          </span>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">
            {features.length} Total
          </span>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-3 min-h-0">
          {isFeaturesLoading ? (
            <div className="flex flex-col h-full min-h-[150px] items-center justify-center text-slate-400 gap-2">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading features...</p>
            </div>
          ) : features.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-slate-200 rounded-md">
              <Tag className="h-6 w-6 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                No features added yet.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 pb-2">
              {features.map((feature) => (
                <div
                  key={feature.feature_id}
                  className="group flex items-start justify-between p-2.5 rounded-md border border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start gap-3 overflow-hidden">
                    <div className="bg-slate-100 p-1.5 rounded border border-slate-200 shrink-0 mt-0.5">
                      <Tag className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-semibold text-xs text-slate-800 truncate">
                        {feature.name}
                      </span>
                      {feature.description ? (
                        <span className="text-[10px] text-slate-500 truncate mt-0.5">
                          {feature.description}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 italic mt-0.5">
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
                      className="h-6 w-6 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                      onClick={() => openEditModal(feature)}
                      title="Edit Feature"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
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
        <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden rounded-lg gap-0 border-slate-200 shadow-xl bg-white">
          <DialogHeader className="p-4 bg-slate-50 border-b border-slate-100">
            <DialogTitle className="text-base font-bold text-slate-800">
              Edit Feature
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 mt-1">
              Update the name or description of this amenity.
            </DialogDescription>
          </DialogHeader>

          {editingFeature && (
            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label
                  htmlFor="name"
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >
                  Feature Name
                </Label>
                <Input
                  id="name"
                  className="h-8 text-xs border-slate-200 focus-visible:ring-1"
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
                  className="text-[10px] font-bold text-slate-500 uppercase tracking-wider"
                >
                  Description
                </Label>
                <Input
                  id="desc"
                  className="h-8 text-xs border-slate-200 focus-visible:ring-1"
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

          <DialogFooter className="p-3 bg-slate-50 border-t border-slate-100 flex sm:justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs bg-white hover:bg-slate-100 border-slate-200 text-slate-700"
              onClick={() => setIsEditOpen(false)}
            >
              Cancel
            </Button>
            <Button
              size="sm"
              className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
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
