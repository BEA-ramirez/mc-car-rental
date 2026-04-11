import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define the shape of your data
export type PaymentData = {
  payment_id: string;
  paid_at: string;

  amount: number;
  status: string;
};

export const paymentColumns: ColumnDef<PaymentData>[] = [
  {
    accessorKey: "paid_at",
    // Make the header clickable for sorting
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          className="h-6 px-2 text-[10px] font-bold uppercase tracking-widest hover:bg-transparent -ml-2"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-3 w-3" />
        </Button>
      );
    },
    cell: ({ row }) => {
      return (
        <span className="text-xs font-medium">
          {format(new Date(row.getValue("paid_at")), "MMM dd, yyyy")}
        </span>
      );
    },
  },
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <span className="text-xs font-bold">{row.getValue("title")}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      return (
        <Badge
          variant={status === "COMPLETED" ? "default" : "destructive"}
          className="text-[9px]"
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => <div className="text-right">Amount</div>,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      return (
        <div className="text-right font-mono text-xs font-bold text-emerald-600">
          ₱ {amount.toLocaleString()}
        </div>
      );
    },
  },
];
