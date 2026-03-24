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
import { Loader2, AlertTriangle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  isDeleting: boolean;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  isDeleting,
}: DeleteDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="sm:max-w-[380px] p-5 bg-white border-slate-200 rounded-sm shadow-xl gap-0">
        <AlertDialogHeader className="text-left flex flex-row items-start gap-3 space-y-0">
          {/* Sharp, squared-off icon container instead of a bubbly circle */}
          <div className="flex items-center justify-center w-8 h-8 rounded-sm border border-red-200 bg-red-50 shrink-0 mt-0.5">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>

          {/* Tighter text grouping */}
          <div className="flex flex-col gap-1.5">
            <AlertDialogTitle className="text-sm font-bold text-slate-900 leading-none mt-1">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs text-slate-500 leading-relaxed pr-2">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-6 sm:space-x-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="h-8 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-600 shadow-none border-slate-200 rounded-sm hover:bg-slate-50 m-0"
          >
            Cancel
          </AlertDialogCancel>

          <button
            onClick={(e) => {
              e.preventDefault(); // Prevent modal from closing immediately
              onConfirm();
            }}
            disabled={isDeleting}
            className={cn(
              buttonVariants({ variant: "destructive" }),
              "h-8 px-4 text-[10px] font-bold uppercase tracking-widest shadow-none min-w-[100px] rounded-sm m-0",
            )}
          >
            {isDeleting ? (
              <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
            ) : null}
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
