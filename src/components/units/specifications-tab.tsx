"use client";

import { useState } from "react";
import { useFleetSettings } from "../../../hooks/use-fleetSettings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  Edit2,
  AlertTriangle,
  Users,
  Cog,
  Car,
  Settings2,
  Search,
  Loader2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CarSpecificationType } from "@/lib/schemas/car";
import { SpecificationForm } from "./specification-form";
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

  const [searchQuery, setSearchQuery] = useState("");
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

  // Filter specifications based on search query
  const filteredSpecs = specifications.filter(
    (spec) =>
      spec.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      spec.body_type.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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
    <div className="flex flex-col h-full min-h-0 gap-4 transition-colors duration-300">
      {/* --- TOP ACTION BAR --- */}
      <div className="shrink-0 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors">
        <div className="relative w-full sm:w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search configurations..."
            className="pl-9 h-9 text-xs font-medium bg-card border-border shadow-sm focus-visible:ring-1 focus-visible:ring-primary rounded-lg transition-colors text-foreground placeholder:text-muted-foreground"
          />
        </div>
        <Button
          size="sm"
          onClick={handleCreate}
          className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground rounded-lg shadow-sm transition-opacity shrink-0"
        >
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Specification
        </Button>
      </div>

      {/* --- LIST AREA --- */}
      <div className="flex flex-col flex-1 min-h-0 overflow-hidden border border-border rounded-xl bg-card shadow-sm transition-colors">
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-background/50">
          {isSpecificationsLoading ? (
            <div className="flex flex-col h-full items-center justify-center text-muted-foreground gap-3 min-h-[200px]">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <p className="text-[10px] font-bold uppercase tracking-widest">
                Loading configurations...
              </p>
            </div>
          ) : specifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] border border-dashed border-border rounded-xl bg-card">
              <Settings2 className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                No specifications found.
              </p>
            </div>
          ) : filteredSpecs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[200px] border border-dashed border-border rounded-xl bg-card">
              <Search className="h-8 w-8 text-muted-foreground/30 mb-3" />
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                No results match your search.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 pb-2">
              {filteredSpecs.map((spec: CarSpecificationType) => (
                <div
                  key={spec.spec_id}
                  className="group flex flex-col justify-between p-4 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-secondary/40 transition-colors gap-3 cursor-default shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-bold text-xs text-foreground leading-tight pr-4 group-hover:text-primary transition-colors uppercase tracking-wide">
                      {spec.name}
                    </h3>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                        onClick={() => handleEdit(spec)}
                        title="Edit Spec"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        onClick={() => setSpecToDelete(spec)}
                        title="Delete Spec"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Dense Info Row */}
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                      <Users className="w-3.5 h-3.5 text-primary/70" />
                      {spec.passenger_capacity} Seats
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                      <Cog className="w-3.5 h-3.5 text-primary/70" />
                      {spec.engine_type}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-muted-foreground">
                      <Car className="w-3.5 h-3.5 text-primary/70" />
                      {spec.body_type}
                    </div>
                  </div>

                  {/* Micro Badges */}
                  <div className="flex gap-2 mt-2 pt-3 border-t border-border">
                    <Badge
                      variant="secondary"
                      className="h-5 text-[9px] font-bold uppercase tracking-widest px-2 bg-secondary text-foreground border border-border rounded shadow-none"
                    >
                      {spec.transmission}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="h-5 text-[9px] font-bold uppercase tracking-widest px-2 bg-secondary text-foreground border border-border rounded shadow-none"
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
        <AlertDialogContent className="sm:max-w-[400px] rounded-2xl bg-background border-border shadow-2xl transition-colors duration-300">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive text-sm font-bold uppercase tracking-wider">
              <AlertTriangle className="h-4 w-4" />
              Delete Configuration?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs font-medium text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to delete{" "}
              <strong className="text-foreground">{specToDelete?.name}</strong>?
              <br />
              <br />
              This action cannot be undone and will prevent you from assigning
              this configuration to new fleet units.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 border-t border-border pt-4">
            <AlertDialogCancel className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest bg-card border-border hover:bg-secondary text-foreground rounded-lg shadow-none transition-colors">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="h-9 px-4 text-[10px] font-bold uppercase tracking-widest bg-destructive hover:opacity-90 text-destructive-foreground rounded-lg shadow-sm transition-opacity"
            >
              Delete Spec
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
