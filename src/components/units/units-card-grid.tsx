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
  Settings,
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
import UnitsTableList from "./units-table-list";
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
    <div className="flex flex-col h-full bg-background text-foreground font-sans overflow-hidden transition-colors duration-300">
      {/* TOOLBAR HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-4 py-3 md:px-6 md:py-4 shrink-0 gap-4 border-b border-border bg-card/50">
        {/* Left Side: Global Identity / Search */}
        <div className="relative flex items-center">
          <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search plate, brand..."
            className="pl-8 h-8 w-[200px] sm:w-[250px] text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background rounded-md shadow-none transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Right Side: Toolbar / Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Filter Dropdown */}
          <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-[10px] font-semibold uppercase tracking-widest bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground rounded-md shadow-none transition-colors"
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 rounded-lg shadow-md border-border bg-popover"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-[11px] font-medium cursor-pointer text-popover-foreground focus:bg-secondary">
                  <RefreshCw className="h-3.5 w-3.5 mr-2 text-muted-foreground" />{" "}
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuItem className="text-[11px] font-medium cursor-pointer text-popover-foreground focus:bg-secondary">
                  <ClipboardList className="h-3.5 w-3.5 mr-2 text-muted-foreground" />{" "}
                  Review Status
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

          {/* Layout Toggle */}
          <div className="flex items-center bg-secondary border border-border rounded-md p-0.5 transition-colors">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-7 rounded-sm transition-all",
                viewMode === "list"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              )}
              onClick={() => setViewMode("list")}
            >
              <LayoutList className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-7 rounded-sm transition-all",
                viewMode === "grid"
                  ? "bg-background shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-background/50",
              )}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

          {/* Export & Settings */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md shadow-none transition-colors"
            title="Export Fleet Data"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="h-8 w-8 bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md shadow-none transition-colors"
            title="Fleet Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>

          {/* Add Unit Button */}
          <Button
            size="sm"
            onClick={() => setIsAddUnitOpen(true)}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-primary hover:opacity-90 text-primary-foreground ml-1 rounded-md shadow-none transition-opacity"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Unit
          </Button>
        </div>
      </div>

      {/* SCROLLABLE GRID AREA */}
      <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
        <div className="max-w-[1600px] mx-auto p-4 md:p-6">
          {isUnitsLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Loading units...
                </span>
              </div>
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] bg-card border border-dashed border-border rounded-xl shadow-sm transition-colors">
              <Car className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                No units found.
              </p>
              {searchQuery ? (
                <p className="text-[10px] text-muted-foreground/70 mt-1 font-medium">
                  Try adjusting your search query.
                </p>
              ) : (
                <Button
                  variant="link"
                  className="text-[10px] font-bold uppercase tracking-widest text-primary mt-2 hover:opacity-80"
                  onClick={() => setIsAddUnitOpen(true)}
                >
                  + Add your first vehicle
                </Button>
              )}
            </div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredUnits.map((unit) => (
                <UnitsCard
                  key={unit.car_id}
                  unit={unit}
                  onRequestDelete={(u) => setUnitToDelete(u)}
                  onEdit={() => handleEdit(unit)}
                />
              ))}
            </div>
          ) : (
            <UnitsTableList
              units={filteredUnits}
              onEdit={handleEdit}
              onRequestDelete={setUnitToDelete}
            />
          )}
        </div>
      </div>

      {/* DIALOGS */}
      <AlertDialog
        open={!!unitToDelete}
        onOpenChange={(open) => !open && setUnitToDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-[425px] rounded-xl bg-card border-border shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive text-xs font-bold uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4" /> Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] font-medium text-muted-foreground mt-2 leading-relaxed">
              Are you sure you want to delete the{" "}
              <strong className="text-foreground">
                {unitToDelete?.brand} {unitToDelete?.model}
              </strong>{" "}
              (
              <span className="font-mono text-foreground">
                {unitToDelete?.plate_number}
              </span>
              )?
              <br />
              <br />
              This action will permanently archive the unit. It will be removed
              from the active fleet and scheduler.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 border-t border-border pt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-8 text-[10px] font-semibold uppercase tracking-widest bg-card border-border hover:bg-secondary text-foreground rounded-md shadow-none transition-colors"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="h-8 text-[10px] font-bold uppercase tracking-widest bg-destructive text-destructive-foreground hover:opacity-90 rounded-md shadow-none transition-opacity"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />{" "}
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
