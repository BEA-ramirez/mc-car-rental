"use client";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Search,
  Funnel,
  Settings,
  Download,
  LayoutList,
  Sheet,
  Plus,
  Loader2,
  AlertTriangle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { FleetSettingsDialog } from "./settings-dialog";
import { useState } from "react";
import UnitsCard from "./units-card";
import { useUnits } from "../../../hooks/use-units";
import { CompleteCarType } from "@/lib/schemas/car";
import { UnitsForm } from "./units-form";

export default function UnitsCardGrid() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unitToDelete, setUnitToDelete] = useState<CompleteCarType | null>(
    null,
  );

  const [editingUnit, setEditingUnit] = useState<CompleteCarType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { units, isUnitsLoading, deleteUnit, isDeleting } = useUnits();
  const filteredUnits = units.filter((unit) => {
    const query = searchQuery.toLowerCase();
    return (
      unit.plate_number.toLowerCase().includes(query) ||
      unit.brand.toLowerCase().includes(query) ||
      unit.model.toLowerCase().includes(query) ||
      unit.color.toLowerCase().includes(query)
    );
  });

  const handleEdit = (unit: CompleteCarType) => {
    setEditingUnit(unit);
    setIsEditOpen(true);
  };

  const handleFormOpenChange = (open: boolean) => {
    setIsAddUnitOpen(open);
    setIsEditOpen(open);
    if (!open) setEditingUnit(null);
  };

  const confirmDelete = async () => {
    if (unitToDelete?.car_id) {
      await deleteUnit(unitToDelete.car_id);
      setUnitToDelete(null);
    }
  };

  return (
    <div className="bg-card p-3 w-full shadow-sm rounded-md min-h-screen">
      <div className="flex flex-row-reverse mb-2">
        <Button
          variant="default"
          onClick={() => setIsAddUnitOpen(true)}
          className=" flex items-center gap-2 bg-primary border rounded-sm text-xs! shadow-none! cursor-pointer text-card"
        >
          <Plus />
          <p className="text-md text-normal">Add Unit</p>
        </Button>
      </div>
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-foreground font-semibold">Units Information</h2>
        <div className="flex items-center gap-2">
          <div className="relative flex items-center gap-2">
            <Search className="absolute left-2 top-2.4 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search unit..."
              className="pl-8 border-gray-300 rounded-sm text-xs!"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className=" flex items-center gap-2 bg-transparent! border rounded-sm text-xs! shadow-none! cursor-pointer text-muted-foreground"
              >
                <Funnel />
                <p className="text-md text-normal">Filter</p>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-20">
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2">
                    <p>Refresh</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2 ">
                    <p>Review</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <div className="border flex items-center rounded-sm">
            <Button
              variant="outline"
              className="bg-transparent! border-y-none! border-l-none! border-r rounded-none! shadow-none! cursor-pointer text-muted-foreground"
            >
              <LayoutList />
            </Button>
            <Button
              variant="outline"
              className="bg-transparent! border-none!  shadow-none! cursor-pointer text-muted-foreground"
            >
              <Sheet />
            </Button>
          </div>
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className=" flex items-center gap-2 bg-transparent! border rounded-sm text-xs! shadow-none! cursor-pointer text-muted-foreground"
              >
                <Download size={"icon-sm"} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-20">
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2">
                    <p>Refresh</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2 ">
                    <p>Review</p>
                  </div>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <FleetSettingsDialog
            open={isSettingsOpen}
            onOpenChange={setIsSettingsOpen}
          />
        </div>
      </div>

      {isUnitsLoading ? (
        <div className="flex h-[90%] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="flex min-h-180 flex-col items-center justify-center border border-dashed rounded-lg text-muted-foreground">
          <p>No units found.</p>
          {searchQuery && <p className="text-xs">Try adjusting your search.</p>}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredUnits.map((unit) => (
            <UnitsCard
              key={unit.car_id}
              unit={unit}
              onRequestDelete={(u) => setUnitToDelete(u)}
              onEdit={() => handleEdit(unit)}
            />
          ))}
        </div>
      )}

      <AlertDialog
        open={!!unitToDelete}
        onOpenChange={(open) => !open && setUnitToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Delete Unit?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the{" "}
              <strong>
                {unitToDelete?.brand} {unitToDelete?.model}
              </strong>{" "}
              ({unitToDelete?.plate_number})?
              <br />
              <br />
              This action will archive the unit and it will no longer be
              available for rentals.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault(); // Prevent auto-close to show loading state if needed
                confirmDelete();
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Unit"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <UnitsForm
        open={isAddUnitOpen || isEditOpen}
        onOpenChange={handleFormOpenChange}
        initialData={editingUnit}
      />
    </div>
  );
}
