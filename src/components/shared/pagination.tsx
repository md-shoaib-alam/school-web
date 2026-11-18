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

function PaginationPages({
  currentPage,
  totalPages,
  onPageChange,
  isMobile = false,
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isMobile?: boolean;
}) {
  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "ellipsis")[] => {
    if (isMobile) {
      if (totalPages <= 4) {
        return Array.from({ length: totalPages }, (_, i) => i + 1);
      }
      if (currentPage <= 3) {
        return [1, 2, 3, "ellipsis", totalPages];
      }
      if (currentPage >= totalPages - 2) {
        return [1, "ellipsis", totalPages - 2, totalPages - 1, totalPages];
      }
      return [1, "ellipsis", currentPage, "ellipsis", totalPages];
    }

    if (totalPages <= 4) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const pages: (number | "ellipsis")[] = [];

    // Always include page 1
    pages.push(1);

    if (currentPage > 3) {
      pages.push("ellipsis");
    }

    // Pages around current page
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push("ellipsis");
    }

    // Always include last page
    if (totalPages > 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex items-center ${isMobile ? "gap-1" : "gap-1.5"}`}>
      {getPageNumbers().map((page, idx) => {
        if (page === "ellipsis") {
          return (
            <span
              key={`ellipsis-${idx}`}
              className={`${isMobile ? "px-1 text-xs" : "px-1.5 text-sm"} text-muted-foreground select-none`}
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
            className={`${isMobile ? "size-7 text-xs" : "size-8 text-sm"} ${currentPage === page ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
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
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLimitChange = (limit: number) => {
    onLimitChange?.(limit);
    document.querySelector('main')?.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col items-center justify-between py-4 border-t border-border/50 gap-4 sm:gap-5 mt-4">
      {/* Top Row: Rows Selector + Page Navigation (Shared Row on Both Mobile & Desktop) */}
      <div className={`flex items-center ${onLimitChange ? "justify-between" : "justify-center"} w-full gap-3 sm:gap-6`}>
        {onLimitChange && (
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden sm:inline text-xs text-muted-foreground whitespace-nowrap">
              Rows per page:
            </span>
            <Select
              value={(itemsPerPage || 15).toString()}
              onValueChange={(v) => handleLimitChange(parseInt(v))}
            >
              <SelectTrigger className="h-7 sm:h-8 w-[58px] sm:w-[70px] bg-transparent text-xs px-2">
                <SelectValue placeholder={(itemsPerPage || 15).toString()} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Page Navigation */}
        {totalPages > 1 && (
          <>
            {/* Mobile Navigation */}
            <div className="flex items-center gap-1 sm:hidden">
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="size-3.5" />
              </Button>
              <PaginationPages
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
                isMobile={true}
              />
              <Button
                variant="outline"
                size="icon"
                className="size-7"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight className="size-3.5" />
              </Button>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden sm:flex items-center gap-1.5">
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={currentPage <= 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="size-4" />
              </Button>
              <PaginationPages
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
              <Button
                variant="outline"
                size="icon"
                className="size-8"
                disabled={currentPage >= totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Showing entries text: Rendered at the bottom on both Mobile & Desktop with extra spacing */}
      <p className="text-xs sm:text-sm text-muted-foreground text-center pt-2 sm:pt-2.5">
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
    </div>
  );
}
