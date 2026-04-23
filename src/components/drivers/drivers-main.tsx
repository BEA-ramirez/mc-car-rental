"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Loader2,
  Briefcase,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";
import { useDrivers } from "../../../hooks/use-drivers";
import { CompleteDriverType } from "@/lib/schemas/driver";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Import components
import DriverProfileHeader from "./driver-profile-header";
import DispatchCalendar, {
  ScheduleBooking,
} from "@/components/drivers/dispatch-calendar";
import DriverDocsTab from "./driver-docs-tab";
import DriverForm from "./driver-form";
import { DeleteDialog } from "../delete-dialog";

interface DriversMainProps {
  schedules?: ScheduleBooking[];
  isSchedulesLoading?: boolean;
  // --- NEW PROPS FOR DRIVER PORTAL ---
  isDriverMode?: boolean;
  currentDriverData?: CompleteDriverType | null;
}

export default function DriversMain({
  schedules = [],
  isSchedulesLoading = false,
  isDriverMode = false,
  currentDriverData = null,
}: DriversMainProps) {
  // If in driver mode, the selected driver is permanently locked to themselves.
  const [selectedDriver, setSelectedDriver] =
    useState<CompleteDriverType | null>(currentDriverData);
  const [searchQuery, setSearchQuery] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

  const [driverToEdit, setDriverToEdit] = useState<CompleteDriverType | null>(
    null,
  );
  const [driverToDelete, setDriverToDelete] =
    useState<CompleteDriverType | null>(null);

  const {
    data: drivers,
    isLoading: isDriversLoading,
    deleteDriver,
    isDeleting,
  } = useDrivers();

  // Auto-sync the selected driver when React Query fetches fresh data
  useEffect(() => {
    if (selectedDriver && drivers) {
      // Find the fresh version of the currently selected driver
      const freshDriverData = drivers.find(
        (d: any) => d.driver_id === selectedDriver.driver_id,
      );

      // If we found them, and the data is actually a new reference, update the state!
      if (freshDriverData && freshDriverData !== selectedDriver) {
        setSelectedDriver(freshDriverData);
      }
    }
  }, [drivers, selectedDriver]);

  // Keep state synced if currentDriverData loads asynchronously
  useEffect(() => {
    if (isDriverMode && currentDriverData) {
      setSelectedDriver(currentDriverData);
    }
  }, [isDriverMode, currentDriverData]);

  const filteredDrivers =
    drivers?.filter(
      (d) =>
        d.profiles?.full_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        d.display_id?.toLowerCase().includes(searchQuery.toLowerCase()),
    ) || [];

  const driverSpecificSchedules = schedules.filter(
    (s) => s.driver_id === selectedDriver?.driver_id,
  );

  const handleDeleteDriver = async () => {
    if (!driverToDelete?.driver_id) return;

    try {
      await deleteDriver(driverToDelete.driver_id);
      setOpenDeleteDialog(false);

      // Only clear the right panel if we deleted the person we were looking at!
      if (selectedDriver?.driver_id === driverToDelete.driver_id) {
        setSelectedDriver(null);
      }

      // Clean up
      setDriverToDelete(null);
    } catch {
      // Handle error
    }
  };

  // ==========================================
  // VIEW 1: DRIVER MOBILE DASHBOARD
  // ==========================================
  if (isDriverMode) {
    if (!selectedDriver) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-6 bg-background transition-colors duration-300">
          <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Loading Your Profile...
          </p>
        </div>
      );
    }

    return (
      // Mobile-native layout: No fixed heights, natural body scrolling, no borders
      <div className="flex flex-col w-full min-h-screen bg-background pb-20 transition-colors duration-300">
        <div className="bg-card shadow-sm border-b border-border transition-colors">
          <DriverProfileHeader
            driver={selectedDriver}
            isSelfView={true}
            onOpenEdit={() => {
              setDriverToEdit(selectedDriver); // Pass the current driver to the form
              setOpenDialog(true);
            }}
          />
        </div>

        <div className="px-4 pt-6">
          <Tabs defaultValue="sched" className="flex flex-col w-full">
            <TabsList className="bg-secondary/50 shadow-inner border border-border/50 h-9 p-1 flex justify-start w-full rounded-lg mb-5 overflow-x-auto custom-scrollbar transition-colors">
              <TabsTrigger
                value="sched"
                className="flex-1 rounded-md px-3 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm uppercase tracking-widest whitespace-nowrap transition-all"
              >
                Schedule
              </TabsTrigger>
              <TabsTrigger
                value="performance"
                className="flex-1 rounded-md px-3 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm uppercase tracking-widest whitespace-nowrap transition-all"
              >
                Wallet
              </TabsTrigger>
              <TabsTrigger
                value="docs"
                className="flex-1 rounded-md px-3 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground data-[state=active]:bg-background data-[state=active]:shadow-sm uppercase tracking-widest whitespace-nowrap transition-all"
              >
                Docs
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sched" className="m-0 outline-none">
              <DispatchCalendar
                bookings={driverSpecificSchedules}
                isLoading={isSchedulesLoading}
                mode="specific"
              />
            </TabsContent>

            <TabsContent value="docs" className="m-0 outline-none">
              <DriverDocsTab driverId={selectedDriver.driver_id || ""} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  }

  // ==========================================
  // VIEW 2: ADMIN MASTER MANAGEMENT
  // ==========================================
  return (
    <div className="flex flex-col md:flex-row w-full min-h-[600px] md:h-full bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-colors duration-300">
      {/* LEFT SIDEBAR: ROSTER */}
      <div className="w-full md:w-[280px] flex flex-col border-b md:border-b-0 md:border-r border-border bg-secondary/30 shrink-0 z-10 h-full transition-colors">
        {/* Sidebar Header & Search */}
        <div className="p-3 border-b border-border bg-card flex flex-col gap-2.5 shrink-0 transition-colors">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-bold text-foreground uppercase tracking-widest">
              Driver Roster
            </h2>
            <Button
              size="icon"
              variant="ghost"
              className="h-7 w-7 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground shadow-none transition-colors"
              onClick={() => {
                setDriverToEdit(null); // Null means "Create Mode"
                setOpenDialog(true);
                // Notice we REMOVED setSelectedDriver(null) here!
              }}
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Search name or ID..."
              className="pl-8 h-8 text-[11px] font-medium bg-secondary border-border focus-visible:ring-1 focus-visible:ring-primary rounded-lg shadow-none transition-colors text-foreground"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Scrollable Driver List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-background transition-colors">
          <div className="p-2 space-y-1">
            {isDriversLoading ? (
              <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
              </div>
            ) : filteredDrivers.length === 0 ? (
              <div className="py-10 text-center text-[9px] uppercase tracking-widest text-muted-foreground font-bold">
                No drivers found
              </div>
            ) : (
              filteredDrivers.map((driver) => {
                const isActive = selectedDriver?.driver_id === driver.driver_id;
                return (
                  <div
                    key={driver.driver_id}
                    onClick={() => setSelectedDriver(driver)}
                    className={cn(
                      "group flex items-center justify-between gap-3 p-2 rounded-lg cursor-pointer transition-all border shrink-0",
                      isActive
                        ? "bg-primary/10 border-primary/20 shadow-sm"
                        : "bg-card border-border hover:border-primary/50 hover:shadow-sm hover:bg-secondary/50",
                    )}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      <div className="relative shrink-0">
                        <Avatar
                          className={cn(
                            "h-8 w-8 border rounded-lg transition-colors bg-secondary",
                            isActive ? "border-primary/30" : "border-border",
                          )}
                        >
                          <AvatarImage
                            src={
                              driver.profiles?.profile_picture_url || undefined
                            }
                            className="object-cover"
                          />
                          <AvatarFallback
                            className={cn(
                              "text-[9px] font-bold rounded-lg transition-colors",
                              isActive
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground",
                            )}
                          >
                            {getInitials(driver.profiles?.full_name || "D")}
                          </AvatarFallback>
                        </Avatar>

                        {/* Status Indicator Dot */}
                        <div
                          className={cn(
                            "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 transition-colors",
                            driver.driver_status === "Available"
                              ? "bg-emerald-500"
                              : driver.driver_status === "On Trip"
                                ? "bg-blue-500"
                                : "bg-amber-500",
                            isActive
                              ? "border-background"
                              : "border-card group-hover:border-secondary",
                          )}
                        />
                      </div>
                      <div className="flex-1 min-w-0 flex flex-col justify-center">
                        <span
                          className={cn(
                            "text-[11px] font-bold truncate mb-0.5 transition-colors",
                            isActive ? "text-primary" : "text-foreground",
                          )}
                        >
                          {toTitleCase(driver.profiles?.full_name || "Unknown")}
                        </span>
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              "text-[9px] font-mono truncate uppercase tracking-widest transition-colors",
                              isActive
                                ? "text-primary/70"
                                : "text-muted-foreground",
                            )}
                          >
                            {driver.display_id}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ACTION MENU */}
                    <div onClick={(e) => e.stopPropagation()}>
                      <DropdownMenu modal={false}>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "h-6 w-6 rounded-md shrink-0 lg:opacity-0 group-hover:opacity-100 transition-all shadow-none",
                              isActive
                                ? "text-primary hover:text-primary hover:bg-primary/20"
                                : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                            )}
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="start"
                          className="w-24 rounded-lg border-border shadow-xl bg-popover p-1"
                        >
                          <DropdownMenuItem
                            className="text-[10px] font-bold uppercase tracking-widest text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-md transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              setDriverToDelete(driver); // Lock in the EXACT driver clicked from the list
                              setOpenDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: DETAILS */}
      <div className="flex-1 min-w-0 flex flex-col bg-background overflow-hidden min-h-[500px] transition-colors">
        {!selectedDriver ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground bg-secondary/20 p-6 text-center transition-colors">
            <Briefcase className="w-12 h-12 mb-3 opacity-20" />
            <h3 className="text-[11px] font-bold text-foreground uppercase tracking-widest">
              No Driver Selected
            </h3>
            <p className="text-[10px] font-medium text-muted-foreground/70 mt-1 max-w-xs">
              Select a driver from the roster to view their dispatch schedule.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-full w-full">
            <DriverProfileHeader
              driver={selectedDriver}
              isSelfView={false}
              onOpenEdit={() => {
                setDriverToEdit(selectedDriver); // Pass the current driver to the form
                setOpenDialog(true);
              }}
            />

            <Tabs
              defaultValue="sched"
              className="flex flex-col flex-1 min-h-0 w-full px-4 sm:px-6 pt-4"
            >
              <TabsList className="bg-transparent border-b border-border h-9 p-0 flex justify-start w-full rounded-none mb-4 shrink-0 overflow-x-auto custom-scrollbar transition-colors">
                <TabsTrigger
                  value="sched"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-1.5 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground uppercase tracking-widest whitespace-nowrap transition-all"
                >
                  Schedule & Dispatch
                </TabsTrigger>
                <TabsTrigger
                  value="docs"
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-3 py-1.5 text-[10px] font-bold text-muted-foreground data-[state=active]:text-foreground uppercase tracking-widest whitespace-nowrap transition-all"
                >
                  Compliance Docs
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="sched"
                className="flex-1 min-h-0 overflow-hidden outline-none m-0 pb-4 flex flex-col"
              >
                <DispatchCalendar
                  bookings={driverSpecificSchedules}
                  isLoading={isSchedulesLoading}
                  mode="specific"
                />
              </TabsContent>

              <TabsContent
                value="docs"
                className="flex-1 min-h-0 overflow-y-auto custom-scrollbar outline-none m-0 pb-4 flex flex-col"
              >
                <DriverDocsTab driverId={selectedDriver.driver_id || ""} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      <DriverForm
        open={openDialog}
        onOpenChange={setOpenDialog}
        initialData={driverToEdit}
      />
      <DeleteDialog
        isOpen={openDeleteDialog}
        onClose={() => {
          setOpenDeleteDialog(false);
          setDriverToDelete(null); // Clean up on cancel
        }}
        onConfirm={() => handleDeleteDriver()}
        title="Delete Driver"
        description={`Are you sure you want to delete ${driverToDelete?.profiles?.full_name || "this driver"}?`}
        isDeleting={isDeleting}
      />
    </div>
  );
}
