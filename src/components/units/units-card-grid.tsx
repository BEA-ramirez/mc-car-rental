"use client";

import { useEffect, useState } from "react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import {
  Search,
  LayoutList,
  LayoutGrid,
  Plus,
  Loader2,
  RefreshCw,
  Car,
  Settings,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DeleteDialog } from "../delete-dialog";

import { FleetSettingsDialog } from "./settings-dialog";
import UnitsCard from "./units-card";
import { useUnitsAdmin, useUnits } from "../../../hooks/use-units";
import { CompleteCarType } from "@/lib/schemas/car";
import { UnitsForm } from "./units-form";
import UnitsTableList from "./units-table-list";
import { cn } from "@/lib/utils";

// --- HOOKS ---
import { useInView } from "react-intersection-observer";
import { useDebounce } from "../../../hooks/use-debounce";
import { useFleetPartners } from "../../../hooks/use-fleetPartners";
import { useBookingSettings } from "../../../hooks/use-settings";

export default function UnitsCardGrid() {
  const { ref, inView } = useInView();

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAddUnitOpen, setIsAddUnitOpen] = useState(false);
  const [unitToDelete, setUnitToDelete] = useState<CompleteCarType | null>(
    null,
  );
  const [editingUnit, setEditingUnit] = useState<CompleteCarType | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // --- FILTER STATES ---
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [ownerFilter, setOwnerFilter] = useState("All");

  const debouncedSearch = useDebounce(searchQuery, 500);

  // --- DATA FETCHING ---
  const { data: fleetPartners } = useFleetPartners();

  // NEW: Fetch dynamic vehicle types
  const { data: settingsData } = useBookingSettings();
  // Ensure we only show active vehicle types
  const activeVehicleTypes =
    settingsData?.vehicleTypes?.filter((vt: any) => vt.isActive) || [];

  // Pass the filters into your updated infinite hook
  const {
    units,
    isUnitsLoading,
    isRefetching,
    refreshUnits,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useUnitsAdmin({
    search: debouncedSearch,
    type: typeFilter,
    ownerId: ownerFilter,
  });

  const { deleteUnit, isDeleting } = useUnits();

  // Trigger next page load when sentinel is in view
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

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
      <div className="flex flex-col xl:flex-row xl:items-center justify-between px-4 py-3 md:px-6 md:py-4 shrink-0 gap-4 border-b border-border bg-card/50">
        {/* Left Side: Global Identity / Search & Filters */}
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex items-center">
            <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search plate, brand, model..."
              className="pl-8 h-8 w-full sm:w-[220px] text-[11px] font-medium bg-secondary border-border text-foreground focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background rounded-md shadow-none transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* DYNAMIC VEHICLE TYPE FILTER */}
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 w-[130px] text-[11px] font-medium bg-secondary border-border shadow-none">
              <SelectValue placeholder="Vehicle Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-[11px]">
                All Types
              </SelectItem>
              {activeVehicleTypes.map((type: any) => (
                <SelectItem
                  key={type.id}
                  value={type.label}
                  className="text-[11px]"
                >
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* DYNAMIC OWNER FILTER */}
          <Select value={ownerFilter} onValueChange={setOwnerFilter}>
            <SelectTrigger className="h-8 w-[150px] text-[11px] font-medium bg-secondary border-border shadow-none">
              <SelectValue placeholder="Owner" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All" className="text-[11px]">
                All Owners
              </SelectItem>
              {fleetPartners?.map((partner: any) => (
                <SelectItem
                  key={partner.car_owner_id}
                  value={partner.car_owner_id}
                  className="text-[11px]"
                >
                  {partner.business_name || partner.users?.full_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right Side: Toolbar / Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* REFRESH BUTTON UPDATED WITH SPINNER */}
          <Button
            variant="outline"
            size="icon"
            disabled={isRefetching}
            className="h-8 w-8 bg-card border-border text-muted-foreground hover:text-foreground hover:bg-secondary rounded-md shadow-none transition-colors disabled:opacity-50"
            title="Refresh Fleet Data"
            onClick={() => refreshUnits()}
          >
            <RefreshCw
              className={cn("h-3.5 w-3.5", isRefetching && "animate-spin")}
            />
          </Button>

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
          {isUnitsLoading && !isRefetching ? ( // Only show full-screen loader on initial fetch
            <div className="flex h-[400px] items-center justify-center">
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Loading units...
                </span>
              </div>
            </div>
          ) : units.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-[400px] bg-card border border-dashed border-border rounded-xl shadow-sm transition-colors">
              <Car className="h-8 w-8 text-muted-foreground/50 mb-3" />
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
                No units found.
              </p>
              {searchQuery || typeFilter !== "All" || ownerFilter !== "All" ? (
                <p className="text-[10px] text-muted-foreground/70 mt-1 font-medium">
                  Try adjusting your search query or filters.
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
              {units.map((unit) => (
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
              units={units}
              onEdit={handleEdit}
              onRequestDelete={setUnitToDelete}
            />
          )}

          {/* THE INVISIBLE TRIGGER ELEMENT FOR INFINITE SCROLL */}
          <div
            ref={ref}
            className="w-full h-16 mt-6 flex items-center justify-center"
          >
            {isFetchingNextPage && (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            )}
            {!hasNextPage && units.length > 0 && (
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                End of Inventory
              </p>
            )}
          </div>
        </div>
      </div>

      {/* --- REPLACED ALERT DIALOG WITH CUSTOM DELETE DIALOG --- */}
      <DeleteDialog
        isOpen={!!unitToDelete}
        onClose={() => setUnitToDelete(null)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Confirm Deletion"
        description={`Are you sure you want to delete the ${unitToDelete?.brand} ${unitToDelete?.model} (${unitToDelete?.plate_number})? This action will permanently archive the unit. It will be removed from the active fleet and scheduler.`}
      />

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
