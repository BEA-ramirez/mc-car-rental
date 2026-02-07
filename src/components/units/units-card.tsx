import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Settings,
  Fuel,
  Users,
  EllipsisVertical,
  Trash2,
  Pen,
  Eye,
  ToolCase,
} from "lucide-react";

export default function UnitsCard() {
  return (
    <Card className="relative w-80 border gap-3 pt-0!">
      <div className="relative w-full aspect-video h-40">
        <div className="absolute inset-0 z-30 bg-black/10 rounded-t-xl" />
        <img
          src="https://avatar.vercel.sh/shadcn1"
          alt="Unit cover"
          className="h-full w-full object-cover rounded-t-xl brightness-90"
        />
        <Badge className="absolute top-3 right-3 z-40 bg-emerald-600 hover:bg-emerald-700 border-none">
          Available
        </Badge>
      </div>
      <CardHeader className="border-b border-foreground/20">
        <CardTitle className="flex items-center justify-between">
          <h3 className="text-foreground font-semibold text-xl">Toyota Vios</h3>
          <p className="text-md font-medium text-foreground/80">2024</p>
        </CardTitle>
        <Badge variant={"secondary"} className="mb-3">
          NAB-4421
        </Badge>
        <CardDescription className="flex items-center justify-evenly gap-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <p className="text-medium text-foreground-muted">Auto</p>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4" />
            <p className="text-medium text-foreground-muted">Gas</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-medium text-foreground-muted">5 Seats</p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <h6 className="text-md font-semibold text-foreground/90">
            ₱2,500/day
          </h6>
          <p className="text-xs font-medium text-foreground/60">
            Owner: J. Dela Cruz
          </p>
        </div>
        <DropdownMenu modal={false}>
          <DropdownMenuTrigger asChild>
            <div className="bg-transparent! border-none p-2 shadow-none! cursor-pointer rounded-md">
              <EllipsisVertical className="text-card-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-20">
            <DropdownMenuGroup>
              <DropdownMenuItem className="text-xs!">
                <div className="flex items-center gap-2">
                  <Pen className="size-4" />
                  <p>Edit details</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs!">
                <div className="flex items-center gap-2 ">
                  <Eye className="size-4" />
                  <p>View History</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-xs!">
                <div className="flex items-center gap-2 ">
                  <ToolCase className="size-4" />
                  <p>Set to Maintenance</p>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-xs!">
                <div className="flex items-center gap-2 ">
                  <Trash2 className="size-4" />
                  <p>Delete Unit</p>
                </div>
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardFooter>
    </Card>
  );
}
