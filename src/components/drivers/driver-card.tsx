"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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
import { Edit2, Trash2, AlertTriangle, Loader2 } from "lucide-react";
import { CompleteDriverType } from "@/lib/schemas/driver";
import { cn } from "@/lib/utils";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";
import { useDrivers } from "../../../hooks/use-drivers";
import { toast } from "sonner";

export default function DriverCard({
  driver,
  onClick,
  isActive,
  onEdit,
}: {
  driver: CompleteDriverType;
  onClick: () => void;
  isActive: boolean;
  onEdit: () => void;
}) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { deleteDriver, isDeleting } = useDrivers();

  const handleDelete = async () => {
    try {
      await deleteDriver(driver.driver_id || "");
      toast.success("Driver deleted successfully");
      setShowDeleteDialog(false);
    } catch (error) {
      toast.error("Failed to delete driver.");
    }
  };

  return (
    <>
      <div
        onClick={onClick}
        className={cn(
          "group flex flex-col p-2.5 rounded-md border cursor-pointer transition-all w-full",
          isActive
            ? "border-blue-500 bg-blue-50/50 ring-1 ring-blue-500 shadow-sm"
            : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm",
        )}
      >
        <div className="flex items-start justify-between">
          {/* --- AVATAR & INFO --- */}
          <div className="flex items-center gap-3 overflow-hidden">
            <Avatar className="h-10 w-10 border border-slate-200 shrink-0">
              <AvatarImage
                src={driver.profiles?.profile_picture_url || undefined}
              />
              <AvatarFallback className="bg-slate-100 text-slate-600 text-[10px] font-bold">
                {getInitials(driver.profiles?.full_name || "")}
              </AvatarFallback>
            </Avatar>

            <div className="flex flex-col overflow-hidden pr-2">
              <div className="flex items-center gap-1.5">
                {/* Status Dot */}
                <div
                  className={cn(
                    "w-1.5 h-1.5 rounded-full shrink-0",
                    driver.driver_status === "Available"
                      ? "bg-emerald-500"
                      : driver.driver_status === "On Trip"
                        ? "bg-blue-500"
                        : "bg-orange-500",
                  )}
                />
                <h4 className="text-xs font-bold text-slate-800 truncate">
                  {toTitleCase(driver.profiles?.full_name)}
                </h4>
              </div>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                {driver.profiles?.email}
              </p>
            </div>
          </div>

          {/* --- QUICK ACTIONS (Hover) --- */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              title="Edit Driver"
            >
              <Edit2 className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded hover:bg-red-50 text-slate-400 hover:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                setShowDeleteDialog(true);
              }}
              title="Delete Driver"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* --- FOOTER INFO --- */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100/80">
          <div className="flex items-center gap-2 text-[9px] font-medium text-slate-400 uppercase tracking-wider">
            <span>
              ID:{" "}
              <span className="text-slate-600 font-mono ml-0.5">
                {driver.display_id}
              </span>
            </span>
            <span className="w-[1px] h-2 bg-slate-200" />
            <span className="text-slate-500">
              {driver.profiles?.phone_number || "NO PHONE"}
            </span>
          </div>
        </div>
      </div>

      {/* --- DELETE DIALOG --- */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent
          onClick={(e) => e.stopPropagation()}
          className="sm:max-w-[400px] rounded-lg"
        >
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600 text-base">
              <AlertTriangle className="h-5 w-5" />
              Remove Driver?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-600 mt-2">
              Are you sure you want to remove{" "}
              <strong className="text-slate-900">
                {driver.profiles?.full_name}
              </strong>{" "}
              from the system? This action cannot be undone.
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
              onClick={handleDelete}
              className="h-8 text-xs bg-red-600 text-white hover:bg-red-700 shadow-sm"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                  Removing...
                </>
              ) : (
                "Remove Driver"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
