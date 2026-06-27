import { useState } from "react";
import type { User as UserType } from "@/types";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Save, X, Loader2 } from "lucide-react";
import { RoleBadge } from "./RoleBadge";
import { StatusBadge } from "./StatusBadge";
import { api } from "@/services/api";
import { toast } from "sonner";

interface AccountTableRowProps {
  user: UserType;
  onRefresh: () => void;
}

export const AccountTableRow = ({ user, onRefresh }: AccountTableRowProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRole, setSelectedRole] = useState(user.roleName);
  const [selectedStatus, setSelectedStatus] = useState(user.active ? "active" : "locked");

  const isTargetAdmin = user.roleName === "Admin";

  const handleSave = async () => {
    setSubmitting(true);
    try {
      // 1. Update status if changed
      const isCurrentlyActive = user.active ? "active" : "locked";
      if (selectedStatus !== isCurrentlyActive) {
        await api.identities.changeActiveStatus(user.id, selectedStatus === "active");
      }

      // 2. Update role if changed
      if (selectedRole !== user.roleName) {
        await api.identities.changeRole(user.id, selectedRole);
      }

      toast.success("Cập nhật tài khoản thành công");
      setIsEditing(false);
      onRefresh();
    } catch (error: any) {
      console.error("Failed to update account:", error);
      toast.error("Lỗi khi cập nhật tài khoản");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setSelectedRole(user.roleName);
    setSelectedStatus(user.active ? "active" : "locked");
    setIsEditing(false);
  };

  return (
    <TableRow>
      <TableCell className="py-4">
        <div className="flex flex-col">
          <span className="font-bold text-gray-900">{user.name}</span>
          <span className="text-xs text-gray-500">{user.email}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-gray-600">
          {user.departmentName || <span className="text-gray-400 italic">Chưa gán khoa</span>}
        </span>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Chọn vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Student">Sinh Viên</SelectItem>
              <SelectItem value="Teacher">Giảng Viên</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <RoleBadge role={user.roleName} />
        )}
      </TableCell>
      <TableCell>
        {isEditing ? (
          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[140px] h-8">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Hoạt động</SelectItem>
              <SelectItem value="locked">Khóa</SelectItem>
            </SelectContent>
          </Select>
        ) : (
          <StatusBadge status={user.active ? "active" : "locked"} />
        )}
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end items-center gap-2">
          {isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSave}
                disabled={submitting}
                className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                title="Lưu"
              >
                {submitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                disabled={submitting}
                className="h-8 w-8 text-gray-500 hover:text-gray-600 hover:bg-gray-100"
                title="Hủy"
              >
                <X size={16} />
              </Button>
            </>
          ) : (
            !isTargetAdmin && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                title="Sửa thông tin"
              >
                <Edit size={16} />
              </Button>
            )
          )}
        </div>
      </TableCell>
    </TableRow>
  );
};
