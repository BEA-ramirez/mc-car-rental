"use client";

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
    <div className="flex flex-col h-full min-h-0 gap-3 pb-2 transition-colors duration-300">
      {/* --- TOP ACTION BAR --- */}
      <div className="bg-card border border-border p-3 rounded-xl shrink-0 flex justify-between items-center shadow-sm transition-colors">
        <div>
          <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
            <Settings2 className="w-3.5 h-3.5" /> Vehicle Configurations
          </h4>
          <p className="text-[9px] text-muted-foreground/70 mt-1 font-medium">
            Manage reusable specs templates for your fleet.
          </p>
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          className="h-8 text-[11px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-none transition-opacity"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Spec
        </Button>
      </div>

      {/* --- LIST AREA --- */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden border border-border rounded-xl bg-card shadow-sm transition-colors">
        {/* Header (Stays pinned at top) */}
        <div className="px-4 py-2.5 border-b border-border bg-secondary/30 flex justify-between items-center shrink-0">
          <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
            Active Configurations
          </span>
          <span className="text-[9px] font-semibold text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded-md">
            {specifications.length} Total
          </span>
        </div>

        {/* Scrollable Content Container */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar bg-background/50">
          {isSpecificationsLoading ? (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-2 min-h-[150px]">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-[11px] font-semibold">
                Loading configurations...
              </p>
            </div>
          ) : specifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 border border-dashed border-border rounded-xl bg-card">
              <Settings2 className="h-6 w-6 text-muted-foreground/50 mb-2" />
              <p className="text-[11px] font-semibold text-muted-foreground">
                No specifications found.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-2 pb-2">
              {specifications.map((spec: CarSpecificationType) => (
                <div
                  key={spec.spec_id}
                  className="group flex flex-col justify-between p-3 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-primary/5 transition-all gap-2 cursor-default"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-[12px] text-foreground leading-tight pr-4 group-hover:text-primary transition-colors">
                      {spec.name}
                    </h3>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
                        onClick={() => handleEdit(spec)}
                        title="Edit Spec"
                      >
                        <Edit2 className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => setSpecToDelete(spec)}
                        title="Delete Spec"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>

                  {/* Dense Info Row */}
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 mt-0.5">
                    <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <Users className="w-3 h-3 text-muted-foreground/70" />
                      {spec.passenger_capacity} Seats
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <Cog className="w-3 h-3 text-muted-foreground/70" />
                      {spec.engine_type}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
                      <Car className="w-3 h-3 text-muted-foreground/70" />
                      {spec.body_type}
                    </div>
                  </div>

                  {/* Micro Badges */}
                  <div className="flex gap-1.5 mt-1 pt-2 border-t border-border">
                    <Badge
                      variant="secondary"
                      className="h-4 text-[9px] uppercase tracking-wider px-1.5 py-0 bg-secondary text-muted-foreground border border-border rounded"
                    >
                      {spec.transmission}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-4 text-[9px] uppercase tracking-wider px-1.5 py-0 bg-secondary text-muted-foreground border border-border rounded"
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
        <AlertDialogContent className="sm:max-w-[400px] rounded-xl bg-background border-border shadow-2xl transition-colors duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive text-[13px] font-bold uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              Delete Configuration?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{specToDelete?.name}</strong>?
              <br />
              <br />
              This action cannot be undone and will prevent you from creating
              new units with this configuration template.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 border-t border-border pt-4">
            <AlertDialogCancel className="h-8 text-[10px] font-semibold uppercase tracking-widest bg-card border-border hover:bg-secondary text-foreground rounded-lg shadow-none transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="h-8 text-[10px] font-bold uppercase tracking-widest bg-destructive hover:opacity-90 text-destructive-foreground rounded-lg shadow-sm transition-opacity"
            >
              Delete Spec
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
