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
      <AlertDialogContent className="sm:max-w-[360px] p-4 bg-background border-border rounded-2xl shadow-2xl gap-0 transition-colors duration-300">
        <AlertDialogHeader className="text-left flex flex-row items-start gap-3 space-y-0">
          {/* Sharp, geometric icon container with glassmorphic styling */}
          <div className="flex items-center justify-center w-8 h-8 rounded-lg border border-destructive/20 bg-destructive/10 shrink-0 mt-0.5 transition-colors">
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>

          {/* Tighter text grouping */}
          <div className="flex flex-col gap-1.5">
            <AlertDialogTitle className="text-[12px] font-bold text-foreground uppercase tracking-widest leading-none mt-1">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[12px] font-medium text-muted-foreground leading-relaxed pr-2">
              {description}
            </AlertDialogDescription>
          </div>
        </AlertDialogHeader>

        <AlertDialogFooter className="mt-5 sm:space-x-2">
          <AlertDialogCancel
            disabled={isDeleting}
            className="h-8 px-4 text-[10px] font-semibold uppercase tracking-widest text-foreground bg-card shadow-none border-border rounded-lg hover:bg-secondary transition-colors m-0"
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
              "h-8 px-5 text-[10px] font-bold uppercase tracking-widest shadow-sm min-w-[100px] rounded-lg m-0 transition-colors",
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
