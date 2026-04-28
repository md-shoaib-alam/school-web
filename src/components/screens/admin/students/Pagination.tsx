import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

// Smart pagination with sliding window from user's code
function PaginationPages({
  currentPage,
  totalPages,
  onPageChange,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [1];

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    pages.push(totalPages);
    return pages;
  };

  return (
    <div className="flex items-center gap-1">
      {getPageNumbers().map((page, idx) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className="px-1.5 text-muted-foreground text-sm select-none"
            >
              ...
            </span>
          );
        }
        return (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            size="icon"
            className={`h-8 w-8 text-sm ${currentPage === page ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
            onClick={() => onPageChange(page)}
          >
            {page}
          </Button>
        );
      })}
    </div>
  );
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onLimitChange,
}: PaginationProps) {
  if (totalItems === 0) return null;

  const handlePageChange = (page: number) => {
    onPageChange(page);
    window.scrollTo(0, 0);
  };

  const handleLimitChange = (limit: number) => {
    onLimitChange?.(limit);
    window.scrollTo(0, 0);
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t gap-3">
      <div className="flex flex-wrap items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}
          </span>
          {" to "}
          <span className="font-medium text-emerald-600 dark:text-emerald-400">
            {Math.min(currentPage * itemsPerPage, totalItems)}
          </span>
          {" of "}
          <span className="font-medium text-foreground">{totalItems}</span> entries
        </p>

        {onLimitChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={(v) => handleLimitChange(parseInt(v))}
            >
              <SelectTrigger className="h-8 w-[70px] bg-transparent border-gray-200 dark:border-gray-800 text-xs">
                <SelectValue placeholder={itemsPerPage.toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage <= 1}
          onClick={() => handlePageChange(currentPage - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <PaginationPages
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          disabled={currentPage >= totalPages}
          onClick={() => handlePageChange(currentPage + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
