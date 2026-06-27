import { FileText } from "lucide-react";
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from "@/components/ui/table";
import type { Record, User } from "@/types";
import { RecordTableRow } from "./RecordTableRow";
import { RecordPagination } from "./RecordPagination";

interface RecordTableProps {
  records: Record[];
  startIndex: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  user: User | null;
  onEdit: (record: Record) => void;
  onDelete: (record: Record) => void;
}

export const RecordTable = ({
  records,
  startIndex,
  currentPage,
  totalPages,
  onPageChange,
  user,
  onEdit,
  onDelete,
}: RecordTableProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead className="w-24 font-semibold text-gray-700">Mã Lưu trữ</TableHead>
              <TableHead className="font-semibold text-gray-700">Bệnh Nhân</TableHead>
              <TableHead className="font-semibold text-gray-700">Số BHYT</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày Sinh</TableHead>
              <TableHead className="font-semibold text-gray-700">Tuổi / Giới</TableHead>
              <TableHead className="font-semibold text-gray-700">Khoa / Loại</TableHead>
              <TableHead className="font-semibold text-gray-700">Ngày vào viện</TableHead>
              <TableHead className="text-center font-semibold text-gray-700">Trạng Thái</TableHead>
              <TableHead className="text-right font-semibold text-gray-700">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {records.length > 0 ? (
              records.map((record) => (
                <RecordTableRow key={record.id} record={record} user={user} onEdit={onEdit} onDelete={onDelete} />
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    <FileText size={48} className="text-gray-300 mb-4" />
                    <span className="text-lg font-medium text-gray-600">Không tìm thấy hồ sơ phù hợp</span>
                    <span className="text-sm text-gray-400 mt-1">Vui lòng thử lại với từ khóa hoặc bộ lọc khác</span>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <RecordPagination
        startIndex={startIndex}
        currentCount={records.length}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};