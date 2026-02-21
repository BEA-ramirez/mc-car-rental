"use client";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Search,
  Filter,
  Download,
  LayoutList,
  LayoutGrid,
  Plus,
  Loader2,
  AlertTriangle,
  RefreshCw,
  ClipboardList,
  Car,
  Settings, // <-- Added back the Settings icon
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
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
import { cn } from "@/lib/utils";

export default function UnitsCardGrid() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [unitToDelete, setUnitToDelete] = useState<CompleteCarType | null>(
    null,
  );

  const [editingUnit, setEditingUnit] = useState<CompleteCarType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Example state for layout toggle (if you plan to implement list view later)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

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
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white border-b border-slate-200 shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight">
            Fleet Units
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage your vehicles, pricing, and availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search plate, brand..."
              className="pl-8 h-8 w-[200px] text-xs bg-slate-50 border-slate-200 focus-visible:ring-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs font-medium bg-white border-slate-200 text-slate-700"
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 rounded-md shadow-md border-slate-200"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-xs cursor-pointer">
                  <RefreshCw className="h-3.5 w-3.5 mr-2 text-slate-500" />
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs cursor-pointer">
                  <ClipboardList className="h-3.5 w-3.5 mr-2 text-slate-500" />
                  Review Status
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Layout Toggle (Segmented Control) */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-md p-0.5 ml-1">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-7 rounded-[4px]",
                viewMode === "list"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700",
              )}
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-7 rounded-[4px]",
                viewMode === "grid"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700",
              )}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Download */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white border-slate-200 text-slate-700 ml-1"
            title="Export Fleet Data"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>

          {/* Settings Button */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white border-slate-200 text-slate-700"
            onClick={() => setIsSettingsOpen(true)}
            title="Fleet Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>

          {/* Add Unit Button */}
          <Button
            size="sm"
            onClick={() => setIsAddUnitOpen(true)}
            className="h-8 text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white ml-2 shadow-sm"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Add Unit
          </Button>
        </div>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-6">
        {isUnitsLoading ? (
          <div className="flex h-[400px] items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              <span className="text-xs font-medium">Loading units...</span>
            </div>
          </div>
        ) : filteredUnits.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[400px] bg-white border border-dashed border-slate-300 rounded-lg">
            <Car className="h-10 w-10 text-slate-300 mb-3" />
            <p className="text-sm font-semibold text-slate-700">
              No units found.
            </p>
            {searchQuery ? (
              <p className="text-xs text-muted-foreground mt-1">
                Try adjusting your search query.
              </p>
            ) : (
              <Button
                variant="link"
                className="text-xs text-blue-600 mt-2"
                onClick={() => setIsAddUnitOpen(true)}
              >
                + Add your first vehicle
              </Button>
            )}
          </div>
        ) : (
          <div className="flex flex-wrap gap-5">
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
      </div>

      {/* DIALOGS */}
      <AlertDialog
        open={!!unitToDelete}
        onOpenChange={(open) => !open && setUnitToDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-[425px] rounded-lg">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-base">
              <AlertTriangle className="h-5 w-5" />
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 mt-2">
              Are you sure you want to delete the{" "}
              <strong className="text-slate-900">
                {unitToDelete?.brand} {unitToDelete?.model}
              </strong>{" "}
              (<span className="font-mono">{unitToDelete?.plate_number}</span>)?
              <br />
              <br />
              This action will permanently archive the unit. It will be removed
              from the active fleet and scheduler.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-8 text-xs bg-slate-50 hover:bg-slate-100 border-slate-200"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              className="h-8 text-xs bg-red-600 text-white hover:bg-red-700 shadow-sm"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Unit"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <FleetSettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
      />

      <UnitsForm
        open={isAddUnitOpen || isEditOpen}
        onOpenChange={handleFormOpenChange}
        initialData={editingUnit}
      />
    </div>
  );
}
