import { useState } from "react";
import { useFleetSettings } from "../../../hooks/use-fleetSettings";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Pen, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CarSpecificationType } from "@/lib/schemas/car";
import { SpecificationForm } from "./specification-form"; // We'll build this next
import { Loader2, Users, Cog } from "lucide-react";
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
    <div className="flex flex-col h-full gap-4">
      <div className="flex justify-between items-center">
        <h3 className="text-md font-semibold">Defined Configurations</h3>
        <Button onClick={handleCreate}>
          <Plus className="w-4 h-4 mr-2" /> New Configuration
        </Button>
      </div>

      {isSpecificationsLoading ? (
        <div className="flex h-40 items-center justify-center rounded-md bg-muted/10">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-xs">Refreshing list...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 overflow-y-auto pr-2 pb-10">
          {specifications.map((spec: CarSpecificationType) => (
            <Card
              key={spec.spec_id}
              className="hover:shadow-md transition-shadow group p-0 gap-0 hover:border-primary"
            >
              <CardHeader className="p-4 pb-0 flex flex-row items-start justify-between">
                <CardTitle className="text-sm font-bold line-clamp-2 h-10 leading-tight">
                  {spec.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="z-20 relative p-4 h-full">
                <div className="grid grid-cols-2 gap-y-1 gap-x-1 text-xs mb-3">
                  <span className="flex flex-col items-center justify-center gap-1 border rounded-sm">
                    <Users className="w-6 h-6 text-foreground/70" />
                    <strong>{spec.passenger_capacity} Seats</strong>
                  </span>
                  <span className="flex flex-col items-center justify-center gap-1 border rounded-sm">
                    <Cog />
                    <strong className="text-center">{spec.engine_type}</strong>
                  </span>
                </div>
                <div className="text-xs flex flex-wrap gap-2 text-muted-foreground ">
                  <Badge variant="outline" className="bg-foreground/20">
                    {spec.body_type}
                  </Badge>
                  <Badge variant="outline" className="bg-foreground/20">
                    {spec.transmission}
                  </Badge>
                  <Badge variant="outline" className="bg-foreground/20">
                    {spec.fuel_type}
                  </Badge>
                </div>
                <div className="absolute z-50 bottom-2 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEdit(spec)}
                  >
                    <Pen className="w-3.5 h-3.5 " />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => setSpecToDelete(spec)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <AlertDialog
        open={!!specToDelete}
        onOpenChange={(open) => !open && setSpecToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Configuration?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{" "}
              <strong>{specToDelete?.name}</strong>? This action cannot be
              undone and will prevent you from creating new units with this
              configuration.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
