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
import { CompleteCarType } from "@/lib/schemas/car";

interface UnitsCardProps {
  unit: CompleteCarType;
  onRequestDelete: (unit: CompleteCarType) => void;
  onEdit: () => void;
}

export default function UnitsCard({
  unit,
  onRequestDelete,
  onEdit,
}: UnitsCardProps) {
  const specifications = unit.specifications;
  const primaryImage =
    unit.images?.find((img) => img.is_primary)?.image_url ||
    unit.images?.[0]?.image_url || //fallback to first pic
    "https://placehold.co/600x400?text=No+Image";

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "available":
        return "bg-emerald-600 hover:bg-emerald-700";
      case "maintenance":
        return "bg-orange-600 hover:bg-orange-700";
      case "rented":
        return "bg-blue-600 hover:bg-blue-700";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <Card className="relative w-80 border gap-3 pt-0!">
      <div className="relative w-full aspect-video h-40">
        <div className="absolute inset-0 z-30 bg-black/10 rounded-t-xl" />
        <img
          src={primaryImage}
          alt={`${unit.brand} ${unit.model}`}
          className="h-full w-full object-cover rounded-t-xl brightness-90"
        />
        <Badge className="absolute top-3 right-3 z-40 bg-emerald-600 hover:bg-emerald-700 border-none">
          {unit.availability_status}
        </Badge>
      </div>
      <CardHeader className="border-b border-foreground/20">
        <CardTitle className="flex items-center justify-between">
          <h3 className="text-foreground font-semibold text-xl">
            {unit.brand} {unit.model}
          </h3>
          <p className="text-md font-medium text-foreground/80">{unit.year}</p>
        </CardTitle>
        <Badge variant={"secondary"} className="mb-3">
          {unit.plate_number}
        </Badge>
        <CardDescription className="flex items-center justify-evenly gap-3">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            <p className="text-medium text-foreground-muted">
              {specifications?.transmission || "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Fuel className="w-4 h-4" />
            <p className="text-medium text-foreground-muted">
              {specifications?.fuel_type || "N/A"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            <p className="text-medium text-foreground-muted">
              {specifications?.passenger_capacity
                ? `${specifications.passenger_capacity} Seats`
                : "N/A"}
            </p>
          </div>
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex items-center justify-between">
        <div className="flex flex-col items-start gap-1">
          <h6 className="text-md font-semibold text-foreground/90">
            ₱{unit.rental_rate_per_day.toLocaleString()}
            <span className="text-xs font-normal text-muted-foreground">
              /day
            </span>
          </h6>
          <p className="text-xs font-medium text-foreground/60">
            {unit.owner?.full_name || "Unknown Owner"}
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
              <DropdownMenuItem className="text-xs!" onClick={onEdit}>
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
              <DropdownMenuItem
                className="text-xs!"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestDelete(unit);
                }}
              >
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
