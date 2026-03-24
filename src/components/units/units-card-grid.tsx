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
    <div className="flex flex-col h-[calc(100vh-80px)] bg-slate-50 font-sans overflow-hidden">
      {/* GLOBAL PAGE HEADER WITH INTEGRATED CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shrink-0 z-20 shadow-sm gap-4">
        {/* Left Side: Global Identity */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-sm bg-slate-900 flex items-center justify-center shadow-sm">
            <Car className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 tracking-tight leading-none mb-1">
              Fleet Units
            </h1>
            <p className="text-[11px] font-medium text-slate-500 leading-none">
              Manage your vehicles, pricing, and availability.
            </p>
          </div>
        </div>

        {/* Right Side: Toolbar / Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
            <Input
              placeholder="Search plate, brand..."
              className="pl-8 h-8 w-[200px] text-xs font-medium bg-slate-50 border-slate-200 focus-visible:ring-1 focus-visible:bg-white rounded-sm shadow-none"
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
                className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white border-slate-200 text-slate-600 rounded-sm shadow-none"
              >
                <Filter className="h-3.5 w-3.5 mr-1.5" /> Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-36 rounded-sm shadow-md border-slate-200"
            >
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-xs font-medium cursor-pointer">
                  <RefreshCw className="h-3.5 w-3.5 mr-2 text-slate-500" />{" "}
                  Refresh
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs font-medium cursor-pointer">
                  <ClipboardList className="h-3.5 w-3.5 mr-2 text-slate-500" />{" "}
                  Review Status
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Layout Toggle */}
          <div className="flex items-center bg-slate-100 border border-slate-200 rounded-sm p-0.5">
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "h-6 w-7 rounded-[2px]",
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
                "h-6 w-7 rounded-[2px]",
                viewMode === "grid"
                  ? "bg-white shadow-sm text-slate-800"
                  : "text-slate-500 hover:text-slate-700",
              )}
              onClick={() => setViewMode("grid")}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="h-5 w-px bg-slate-200 mx-1 hidden sm:block" />

          {/* Export & Settings */}
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8 bg-white border-slate-200 text-slate-600 rounded-sm shadow-none"
            title="Export Fleet Data"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsSettingsOpen(true)}
            className="h-8 w-8 bg-white border-slate-200 text-slate-600 rounded-sm shadow-none"
            title="Fleet Settings"
          >
            <Settings className="h-3.5 w-3.5" />
          </Button>

          {/* Add Unit Button */}
          <Button
            size="sm"
            onClick={() => setIsAddUnitOpen(true)}
            className="h-8 text-[10px] font-bold uppercase tracking-widest bg-slate-900 hover:bg-slate-800 text-white ml-1 rounded-sm shadow-none"
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" /> Add Unit
          </Button>
        </div>
      </div>

      {/* SCROLLABLE GRID AREA */}
      <div className="flex-1 w-full overflow-y-auto custom-scrollbar">
        <div className="max-w-[1400px] mx-auto p-6">
          {isUnitsLoading ? (
            <div className="flex h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin text-slate-900" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  Loading units...
                </span>
              </div>
            </div>
          ) : filteredUnits.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] bg-white border border-dashed border-slate-300 rounded-sm shadow-sm">
              <Car className="h-8 w-8 text-slate-300 mb-3" />
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                No units found.
              </p>
              {searchQuery ? (
                <p className="text-[10px] text-slate-400 mt-1 font-medium">
                  Try adjusting your search query.
                </p>
              ) : (
                <Button
                  variant="link"
                  className="text-[10px] font-bold uppercase tracking-widest text-blue-600 mt-2"
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
      </div>

      {/* DIALOGS */}
      <AlertDialog
        open={!!unitToDelete}
        onOpenChange={(open) => !open && setUnitToDelete(null)}
      >
        <AlertDialogContent className="sm:max-w-[425px] rounded-sm bg-white border-slate-200 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-sm font-bold uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4" /> Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 mt-2 leading-relaxed">
              Are you sure you want to delete the{" "}
              <strong className="text-slate-900">
                {unitToDelete?.brand} {unitToDelete?.model}
              </strong>{" "}
              (
              <span className="font-mono text-slate-800">
                {unitToDelete?.plate_number}
              </span>
              )?
              <br />
              <br />
              This action will permanently archive the unit. It will be removed
              from the active fleet and scheduler.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4 border-t border-slate-100 pt-4">
            <AlertDialogCancel
              disabled={isDeleting}
              className="h-8 text-[10px] font-bold uppercase tracking-widest bg-white border-slate-200 hover:bg-slate-50 rounded-sm shadow-none"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                confirmDelete();
              }}
              disabled={isDeleting}
              className="h-8 text-[10px] font-bold uppercase tracking-widest bg-red-600 text-white hover:bg-red-700 rounded-sm shadow-none"
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
