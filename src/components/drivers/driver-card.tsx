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
import { Badge } from "../ui/badge";
import {
  EllipsisVertical,
  RotateCw,
  ScanSearch,
  CircleCheck,
  CircleX,
} from "lucide-react";
import { CompleteDriverType } from "@/lib/schemas/driver";
import { cn } from "@/lib/utils";
import { toTitleCase, getInitials } from "@/actions/helper/format-text";

function DriverCard({
  driver,
  onClick,
  isActive,
}: {
  driver: CompleteDriverType;
  onClick: () => void;
  isActive: boolean;
}) {
  return (
    <Card
      onClick={onClick}
      className={cn(
        "mx-auto w-full max-w-sm p-2 gap-1 cursor-pointer transition-all hover:bg-accent/50",
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
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2">
                    <RotateCw className="size-4" />
                    <p>Refresh</p>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-xs!">
                  <div className="flex items-center gap-2 ">
                    <ScanSearch className="size-4" />
                    <p>Review</p>
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
  );
}

export default DriverCard;
