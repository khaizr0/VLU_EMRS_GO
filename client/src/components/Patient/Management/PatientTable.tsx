import { FileText, ChevronLeft, ChevronRight } from "lucide-react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import type { Patient } from "@/types";
import { PatientTableRow } from "./PatientTableRow";

interface PatientTableProps {
  patients: Patient[];
  onPatientDeleted: () => void;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  itemsPerPage: number;
}

export const PatientTable = ({ 
  patients, 
  onPatientDeleted,
  currentPage,
  totalPages,
  totalCount,
  onPageChange,
  itemsPerPage
}: PatientTableProps) => {
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalCount);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-24 font-semibold text-gray-700">Mã BN</TableHead>
              <TableHead className="font-semibold text-gray-700">Họ và Tên</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày Sinh</TableHead>
              <TableHead className="font-semibold text-gray-700">Tuổi / Giới</TableHead>
              <TableHead className="font-semibold text-gray-700">Dân tộc</TableHead>
              <TableHead className="font-semibold text-gray-700">Số BHYT</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {patients.length > 0 ? (
              patients.map((patient) => (
                <PatientTableRow key={patient.id} patient={patient} onDelete={onPatientDeleted} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FileText size={48} className="text-gray-300 mb-4" />
                    <span className="text-lg font-medium text-gray-600">
                      Không tìm thấy bệnh nhân
                    </span>
                    <span className="text-sm text-gray-400 mt-1">
                      Vui lòng thử lại với từ khóa khác
                    </span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {patients.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Hiển thị <span className="font-medium">{startIndex + 1}</span> đến <span className="font-medium">{endIndex}</span> trên tổng số <span className="font-medium">{totalCount}</span> bản ghi
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8" 
              disabled={currentPage === 1}
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            >
              <ChevronLeft className="size-4" />
            </Button>
            <span className="text-xs font-medium text-gray-700">Trang {currentPage} / {totalPages}</span>
            <Button 
              variant="outline" 
              size="icon" 
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
