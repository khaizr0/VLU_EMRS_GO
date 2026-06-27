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
import type { User as UserType } from "@/types";
import { AccountTableRow } from "./AccountTableRow";

interface AccountTableProps {
  users: UserType[];
  onRefresh: () => void;
}

export const AccountTable = ({ users, onRefresh }: AccountTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [prevUsersLength, setPrevUsersLength] = useState(users.length);
  const itemsPerPage = 10;

  if (users.length !== prevUsersLength) {
    setPrevUsersLength(users.length);
    setCurrentPage(1);
  }

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentUsers = users.slice(startIndex, endIndex);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 hover:bg-gray-50">
            <TableHead className="font-semibold text-gray-700">Người dùng</TableHead>
            <TableHead className="font-semibold text-gray-700">Khoa</TableHead>
            <TableHead className="font-semibold text-gray-700">Vai trò</TableHead>
            <TableHead className="font-semibold text-gray-700">Trạng thái</TableHead>
            <TableHead className="text-right font-semibold text-gray-700">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {currentUsers.map((user) => (
            <AccountTableRow
              key={user.id}
              user={user}
              onRefresh={onRefresh}
            />
          ))}
        </TableBody>
      </Table>
      {users.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <div className="text-xs text-gray-500">
            Hiển thị <span className="font-medium">{startIndex + 1}</span> đến <span className="font-medium">{Math.min(endIndex, users.length)}</span> trên tổng số <span className="font-medium">{users.length}</span> bản ghi
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
              disabled={currentPage === totalPages}
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
