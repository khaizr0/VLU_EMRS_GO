import { useNavigate } from "react-router-dom";
import { Eye, Trash2, FilePenLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import type { Record, User } from "@/types";
import { getTypeName, getStatusColor, getStatusLabel } from "./utils";
import { formatDate } from "@/lib/utils";

interface RecordTableRowProps {
  record: Record;
  user: User | null;
  onEdit: (record: Record) => void;
  onDelete: (record: Record) => void;
}

export const RecordTableRow = ({ record, user, onDelete }: RecordTableRowProps) => {
  const navigate = useNavigate();

  return (
    <TableRow className="hover:bg-gray-50 transition group">
      <TableCell className="font-mono text-xs text-gray-600 font-medium">{record.id}</TableCell>
      <TableCell>
        <div className="font-medium text-gray-900 group-hover:text-red-700 transition">
          {record.patientName}
        </div>
      </TableCell>
      <TableCell className="text-gray-600 font-mono text-xs">{record.insuranceNumber || "---"}</TableCell>
      <TableCell className="text-gray-600">{formatDate(record.dob)}</TableCell>
      <TableCell className="text-gray-600">{record.age} / {record.gender}</TableCell>
      <TableCell>
        <Badge variant="secondary" className={record.type === "internal" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800"}>
          {getTypeName(record.type)}
        </Badge>
      </TableCell>
      <TableCell className="text-gray-600">{formatDate(record.admissionDate)}</TableCell>
      <TableCell className="text-center">
        <Badge variant="outline" className={getStatusColor(record)}>
          {getStatusLabel(record)}
        </Badge>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" onClick={() => navigate(`/record/${record.id}`)} className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 h-8 w-8" title="Xem chi tiết">
            <Eye size={16} />
          </Button>
          {user?.roleName !== "Student" && (
            <>
              <Button variant="ghost" size="icon" onClick={() => navigate(`/record/edit/${record.id}`)} className="text-green-600 hover:text-green-800 hover:bg-green-50 h-8 w-8" title="Chỉnh sửa HSBA & Tài liệu">
                <FilePenLine size={16} />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => onDelete(record)} className="text-red-600 hover:text-red-800 hover:bg-red-50 h-8 w-8" title="Xóa hồ sơ">
                <Trash2 size={16} />
              </Button>
            </>
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};