"use client";
import { useState } from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "../ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
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
import { Badge } from "../ui/badge";
import {
  EllipsisVertical,
  RotateCw,
  ScanSearch,
  CircleCheck,
  SquarePen,
  Trash2,
  CircleX,
} from "lucide-react";
import { CompleteDriverType } from "@/lib/schemas/driver";
import { cn } from "@/lib/utils";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";
import { useDrivers } from "../../../hooks/use-drivers";
import { toast } from "sonner";

function DriverCard({
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
    } catch (error) {
      toast.error("Failed to delete driver.");
    }
  };

  return (
    <>
      <Card
        onClick={onClick}
        className={cn(
          "mx-auto w-full max-w-sm p-2 gap-1 cursor-pointer transition-all hover:bg-accent/50 mb-3",
          // Active Styles: Stronger border and a subtle background
          isActive
            ? "border-primary bg-primary/5 ring-1 ring-primary/20"
            : "border-border",
        )}
      >
        <CardHeader className="p-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center justify-start gap-2">
              <Avatar className="size-12">
                <AvatarImage
                  src={driver.profiles?.profile_picture_url || undefined}
                  alt="@shadcn"
                />
                <AvatarFallback>
                  {getInitials(driver.profiles?.full_name)}
                </AvatarFallback>
                <AvatarBadge className="bg-green-600 dark:bg-green-800" />
              </Avatar>
              <div className="flex flex-col items-between justify-center">
                <CardTitle className="text-sm px-1">
                  {toTitleCase(driver.profiles?.full_name)}
                </CardTitle>
                <CardDescription className="text-xs">
                  <Badge className="bg-primary/60 text-xs font-medium">
                    {driver.profiles.email}
                  </Badge>
                </CardDescription>
              </div>
            </div>
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="bg-transparent! border-none! shadow-none! cursor-pointer"
                  size={"icon-sm"}
                  onClick={(e) => e.stopPropagation()}
                >
                  <EllipsisVertical className="text-card-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-20">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-xs!"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit();
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <SquarePen className="size-4" />
                      <p>Edit details</p>
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-xs!"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <div className="flex items-center gap-2 ">
                      <Trash2 className="size-4" />
                      <p>Delete Driver</p>
                    </div>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardFooter className="p-0! flex items-center justify-between border-t pt-1!">
          <div className="flex items-center justify-start gap-2 text-xs font-medium text-primary/70">
            <p className="border-r pr-3">#{driver.display_id}</p>
            <p>{driver.profiles.phone_number}</p>
          </div>
          <CircleCheck className="w-4 h-4 stroke-2 text-primary/50 mr-2" />
        </CardFooter>
      </Card>
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent onClick={(e) => e.stopPropagation()}>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete
              <span className="font-semibold text-foreground">
                {" "}
                {driver.profiles.full_name}
              </span>
              from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Deleting..." : "Delete Driver"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default DriverCard;
