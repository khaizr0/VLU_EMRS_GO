import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecordPaginationProps {
  startIndex: number;
  currentCount: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const RecordPagination = ({
  startIndex,
  currentCount,
  currentPage,
  totalPages,
  onPageChange,
}: RecordPaginationProps) => {
  if (currentCount === 0) return null;

  return (
    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
      <div className="text-xs text-gray-500">
        Hiển thị <span className="font-medium">{startIndex + 1}</span> đến{" "}
        <span className="font-medium">{startIndex + currentCount}</span> trên tổng số bản ghi
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </Button>

        <span className="text-xs font-medium text-gray-700">
          Trang {currentPage} / {totalPages || 1}
        </span>

        <Button
          variant="outline"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
        >
          <ChevronRight size={16} />
        </Button>
      </div>
    </div>
  );
};
