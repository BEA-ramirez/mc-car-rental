import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";

interface TablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

export function TablePagination({
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
}: TablePaginationProps) {
  // Prevent displaying "Page 1 of 0" if there are no records
  const safeTotalPages = totalPages > 0 ? totalPages : 1;

  return (
    <div className="border-t border-border p-3 flex items-center justify-between shrink-0 bg-card rounded-b-xl transition-colors">
      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center">
        Page
        <span className="text-foreground mx-1.5 px-1.5 py-0.5 bg-secondary rounded-md border border-border">
          {currentPage}
        </span>
        of {safeTotalPages}
      </span>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-[10px] font-bold tracking-widest shadow-none border-border hover:bg-secondary transition-colors"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || isLoading}
        >
          <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 px-2.5 text-[10px] font-bold tracking-widest shadow-none border-border hover:bg-secondary transition-colors"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages || isLoading}
        >
          Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
        </Button>
      </div>
    </div>
  );
}
