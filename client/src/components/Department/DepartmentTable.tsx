import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Department } from "@/types";
import { DepartmentTableRow } from "./DepartmentTableRow";

interface DepartmentTableProps {
  departments: Department[];
  onRefresh: () => void;
}

export const DepartmentTable = ({ departments, onRefresh }: DepartmentTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(departments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDepartments = departments.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">Tên Khoa</TableHead>
            <TableHead className="font-semibold text-gray-700">Trưởng Khoa</TableHead>
            <TableHead className="font-semibold text-gray-700">Nhân viên</TableHead>
            <TableHead className="text-right font-semibold text-gray-700">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentDepartments.length > 0 ? (
            currentDepartments.map((dept) => (
              <DepartmentTableRow
                key={dept.id}
                department={dept}
                onRefresh={onRefresh}
              />
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-gray-500">
                Không tìm thấy khoa nào.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {departments.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Hiển thị <span className="font-medium">{startIndex + 1}</span> đến <span className="font-medium">{Math.min(endIndex, departments.length)}</span> trên tổng số <span className="font-medium">{departments.length}</span> bản ghi
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs font-medium text-gray-700">Trang {currentPage} / {totalPages}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add TableCell import fix
import { TableCell } from "@/components/ui/table";
