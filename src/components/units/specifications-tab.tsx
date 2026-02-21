import { useState } from "react";
import { useFleetSettings } from "../../../hooks/use-fleetSettings";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Users,
  Cog,
  Fuel,
  Car,
  Settings2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CarSpecificationType } from "@/lib/schemas/car";
import { SpecificationForm } from "./specification-form";
import { Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function SpecificationsTab() {
  const { specifications, deleteSpecification, isSpecificationsLoading } =
    useFleetSettings();
  const [editingSpec, setEditingSpec] = useState<CarSpecificationType | null>(
    null,
  );
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [specToDelete, setSpecToDelete] = useState<CarSpecificationType | null>(
    null,
  );

  const handleEdit = (spec: CarSpecificationType) => {
    setEditingSpec(spec);
    setIsFormOpen(true);
  };

  const handleCreate = () => {
    setEditingSpec(null);
    setIsFormOpen(true);
  };

  const confirmDelete = () => {
    if (specToDelete?.spec_id) {
      deleteSpecification(specToDelete.spec_id);
      setSpecToDelete(null);
    }
  };

  if (isFormOpen) {
    return (
      <SpecificationForm
        initialData={editingSpec}
        onClose={() => {
          setEditingSpec(null);
          setIsFormOpen(false);
        }}
      />
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] min-h-0 gap-4">
      {/* --- TOP ACTION BAR --- */}
      <div className="bg-slate-50 border border-slate-200 p-3 rounded-md shrink-0 flex justify-between items-center">
        <div>
          <h4 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Vehicle Configurations
          </h4>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Manage reusable specs templates for your fleet.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          className="h-8 text-xs bg-slate-900 hover:bg-slate-800 text-white shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Spec
        </Button>
      </div>

      {/* --- LIST AREA --- */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden border border-slate-200 rounded-md bg-white">
        {/* Header (Stays pinned at top) */}
        <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center shrink-0">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Active Configurations
          </span>
          <span className="text-[10px] font-medium text-slate-400 bg-slate-200/50 px-2 py-0.5 rounded-full">
            {specifications.length} Total
          </span>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-3">
          {isSpecificationsLoading ? (
            <div className="flex flex-col h-full items-center justify-center text-slate-400 gap-2 min-h-[150px]">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <p className="text-xs font-medium">Loading configurations...</p>
            </div>
          ) : specifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-slate-200 rounded-md">
              <Settings2 className="h-6 w-6 text-slate-300 mb-2" />
              <p className="text-xs font-semibold text-slate-600">
                No specifications found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 pb-4">
              {specifications.map((spec: CarSpecificationType) => (
                <div
                  key={spec.spec_id}
                  className="group flex flex-col justify-between p-3 rounded-md border border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm transition-all gap-2"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-[13px] text-slate-800 leading-tight pr-4">
                      {spec.name}
                    </h3>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                        onClick={() => handleEdit(spec)}
                        title="Edit Spec"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
                        onClick={() => setSpecToDelete(spec)}
                        title="Delete Spec"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Dense Info Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-1">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
                      <Users className="w-3 h-3 text-slate-400" />
                      {spec.passenger_capacity} Seats
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
                      <Cog className="w-3 h-3 text-slate-400" />
                      {spec.engine_type}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-slate-600">
                      <Car className="w-3 h-3 text-slate-400" />
                      {spec.body_type}
                    </div>
                  </div>

                  {/* Micro Badges */}
                  <div className="flex gap-1.5 mt-1 pt-2 border-t border-slate-50">
                    <Badge
                      variant="secondary"
                      className="h-4 text-[9px] uppercase tracking-wider px-1.5 py-0 bg-slate-100 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded"
                    >
                      {spec.transmission}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-4 text-[9px] uppercase tracking-wider px-1.5 py-0 bg-slate-100 text-slate-500 hover:bg-slate-100 border border-slate-200 rounded"
                    >
                      {spec.fuel_type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* --- DELETE DIALOG --- */}
      <AlertDialog
        open={!!specToDelete}
        onOpenChange={(open) => !open && setSpecToDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-[400px] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-base">
              <AlertTriangle className="h-5 w-5" />
              Delete Configuration?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 mt-2">
              Are you sure you want to delete{" "}
              <strong className="text-slate-900">{specToDelete?.name}</strong>?
              <br />
              <br />
              This action cannot be undone and will prevent you from creating
              new units with this configuration template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel className="h-8 text-xs bg-slate-50 hover:bg-slate-100 border-slate-200">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="h-8 text-xs bg-red-600 text-white hover:bg-red-700 shadow-sm"
            >
              Delete Spec
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
