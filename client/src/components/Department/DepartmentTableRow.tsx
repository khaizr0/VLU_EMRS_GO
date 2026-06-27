import { useState } from "react";
import type { Department } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Edit, 
  Trash2, 
  UserPlus, 
  UserCheck, 
  Users as UsersIcon,
  MoreHorizontal,
  FlagOff
} from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { DepartmentFormDialog } from "./DepartmentFormDialog";
import { AssignUserDialog } from "./AssignUserDialog";
import { ViewMembersDialog } from "./ViewMembersDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DepartmentTableRowProps {
  department: Department;
  onRefresh: () => void;
}

export const DepartmentTableRow = ({ department, onRefresh }: DepartmentTableRowProps) => {
  const { isAdmin, currentUser } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [isViewMembersOpen, setIsViewMembersOpen] = useState(false);

  const isHeadOfThisDept = Boolean(
    currentUser?.id && (
      department.headUserId === currentUser.id || 
      department.headUser?.id === currentUser.id
    )
  );
  const canAssignUser = isAdmin || isHeadOfThisDept;
  const [assignMode, setAssignMode] = useState<"member" | "head">("member");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.departments.delete(department.id);
      toast.success("Xóa bỏ khoa thành công");
      onRefresh();
    } catch (error: any) {
      console.error("Failed to delete department:", error);
      toast.error(error.message || "Lỗi khi xóa bỏ khoa");
    } finally {
      setDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  const openAssignMember = () => {
    setAssignMode("member");
    setIsAssignDialogOpen(true);
  };

  const openAssignHead = () => {
    setAssignMode("head");
    setIsAssignDialogOpen(true);
  };

  const handleUnassignHead = async () => {
    const headId = department.headUser?.id || department.headUserId;
    if (!headId) return;
    if (!window.confirm(`Bạn có chắc chắn muốn gỡ bỏ vai trò trưởng khoa cho ${department.headUser?.name}?`)) return;
    
    try {
      await api.departments.unassignHead(department.id, headId);
      toast.success("Gỡ bỏ vai trò trưởng khoa thành công");
      onRefresh();
    } catch (error: any) {
      console.error("Failed to unassign head:", error);
      toast.error(error.message || "Lỗi khi gỡ bỏ vai trò trưởng khoa");
    }
  };

  return (
    <>
      <TableRow>
        <TableCell className="py-4 font-medium text-gray-900">
          {department.name}
        </TableCell>
        <TableCell>
          {department.headUser ? (
            <div className="flex flex-col">
              <span className="font-semibold text-gray-800">{department.headUser.name}</span>
              <span className="text-xs text-gray-500">{department.headUser.email}</span>
            </div>
          ) : (
            <span className="text-gray-400 italic text-sm">Chưa có trưởng khoa</span>
          )}
        </TableCell>
        <TableCell>
          <button 
            onClick={() => setIsViewMembersOpen(true)}
            className="flex items-center gap-2 hover:bg-gray-100 px-2 py-1 rounded-md transition-colors group"
          >
            <UsersIcon size={16} className="text-gray-400 group-hover:text-vlu-red" />
            <span className="text-sm text-gray-600 group-hover:text-vlu-red font-medium">
              {department.users?.length || 0} nhân viên
            </span>
          </button>
        </TableCell>
        <TableCell className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsViewMembersOpen(true)}>
                <UsersIcon size={14} className="mr-2" /> Xem thành viên
              </DropdownMenuItem>
              
              {canAssignUser && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={openAssignMember}>
                    <UserPlus size={14} className="mr-2" /> Thêm thành viên
                  </DropdownMenuItem>
                </>
              )}

              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                    <Edit size={14} className="mr-2" /> Chỉnh sửa thông tin khoa
                  </DropdownMenuItem>
                  {!department.headUser?.id && !department.headUserId && (
                    <DropdownMenuItem onClick={openAssignHead}>
                      <UserCheck size={14} className="mr-2" /> Phân công trưởng khoa
                    </DropdownMenuItem>
                  )}
                  {(department.headUser?.id || department.headUserId) && (
                    <DropdownMenuItem onClick={handleUnassignHead} className="text-orange-600 focus:text-orange-600">
                      <FlagOff size={14} className="mr-2" /> Gỡ bỏ vai trò trưởng khoa
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600 focus:text-red-600"
                    onClick={() => setIsDeleteDialogOpen(true)}
                  >
                    <Trash2 size={14} className="mr-2" /> Xóa bỏ khoa
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </TableCell>
      </TableRow>

      <DepartmentFormDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        onSuccess={onRefresh}
        department={department}
      />

      <AssignUserDialog 
        open={isAssignDialogOpen}
        onOpenChange={setIsAssignDialogOpen}
        onSuccess={onRefresh}
        departmentId={department.id}
        mode={assignMode}
      />

      <ViewMembersDialog 
        open={isViewMembersOpen}
        onOpenChange={setIsViewMembersOpen}
        department={department}
        onRefresh={onRefresh}
      />

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận xóa bỏ khoa?</AlertDialogTitle>
            <AlertDialogDescription>
              Hành động này không thể hoàn tác. Khoa <strong>{department.name}</strong> sẽ bị xóa khỏi hệ thống.
              Các nhân viên thuộc khoa này sẽ chuyển về trạng thái không thuộc khoa nào.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDelete();
              }}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? "Đang xóa..." : "Xác nhận xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
