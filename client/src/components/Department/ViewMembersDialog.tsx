import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User as UserIcon, UserMinus, Loader2, Search, FlagOff } from "lucide-react";
import type { Department } from "@/types";
import { RoleBadge } from "../Account/RoleBadge";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { api } from "@/services/api";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ViewMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department;
  onRefresh: () => void;
}

export const ViewMembersDialog = ({
  open,
  onOpenChange,
  department,
  onRefresh,
}: ViewMembersDialogProps) => {
  const { isAdmin, currentUser } = useAuth();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [unassigningHeadId, setUnassigningHeadId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const members = department.users || [];
  
  const isHeadOfThisDept = department.headUser?.id === currentUser?.id || department.headUserId === currentUser?.id;
  const canManageMembers = isAdmin || isHeadOfThisDept;

  const filteredMembers = members.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Sắp xếp: Trưởng khoa lên đầu
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    const headId = department.headUser?.id || department.headUserId;
    if (a.id === headId) return -1;
    if (b.id === headId) return 1;
    return 0;
  });

  const handleRemoveMember = async (userId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ nhân viên này khỏi khoa?")) return;
    
    setRemovingId(userId);
    try {
      await api.departments.removeUser(department.id, userId);
      toast.success("Đã gỡ thành viên khỏi khoa");
      onRefresh();
    } catch (error: any) {
      toast.error("Lỗi khi gỡ thành viên");
    } finally {
      setRemovingId(null);
    }
  };

  const handleUnassignHead = async (userId: number) => {
    if (!window.confirm("Bạn có chắc chắn muốn gỡ bỏ vai trò trưởng khoa?")) return;
    
    setUnassigningHeadId(userId);
    try {
      await api.departments.unassignHead(department.id, userId);
      toast.success("Đã gỡ bỏ vai trò trưởng khoa thành công");
      onRefresh();
    } catch (error: any) {
      console.error(error);
      toast.error("Lỗi khi gỡ bỏ vai trò trưởng khoa");
    } finally {
      setUnassigningHeadId(null);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) setSearchTerm("");
    }}>
      <DialogContent className="w-[95vw] max-w-[900px] sm:max-w-4xl flex flex-col h-[85vh] p-0 overflow-hidden">
        <div className="p-6 pb-4 border-b border-gray-100 flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              Thành viên khoa: {department.name}
              <span className="text-sm font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                {members.length} nhân sự
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <Input
              placeholder="Tìm kiếm theo tên hoặc email..."
              className="pl-9 bg-gray-50/50"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ScrollArea className="flex-1 bg-gray-50/30">
          <div className="p-6 pt-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50 hover:bg-gray-50">
                    <TableHead className="w-[60px] text-center font-semibold text-gray-700">STT</TableHead>
                    <TableHead className="font-semibold text-gray-700">Nhân sự</TableHead>
                    <TableHead className="font-semibold text-gray-700">Vai trò</TableHead>
                    {canManageMembers && (
                      <TableHead className="text-right font-semibold text-gray-700 w-[100px]">Thao tác</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedMembers.length > 0 ? (
                    sortedMembers.map((user, index) => {
                      const headId = department.headUser?.id || department.headUserId;
                      const isHead = headId === user.id;
                      return (
                        <TableRow 
                          key={user.id}
                          className={isHead ? "bg-red-50/30 hover:bg-red-50/50" : ""}
                        >
                          <TableCell className="text-center text-gray-500 font-medium">
                            {index + 1}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div className={`h-10 w-10 shrink-0 rounded-full flex items-center justify-center ${
                                isHead ? "bg-red-100 text-red-600" : "bg-gray-100 text-gray-500"
                              }`}>
                                <UserIcon size={20} />
                              </div>
                              <div className="flex flex-col">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "font-medium line-clamp-1",
                                    isHead ? "text-red-600" : "text-gray-900"
                                  )}>
                                    {user.name}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">{user.email}</span>
                              </div>
                            </div>
                          </TableCell>

                          <TableCell>
                            <div className="flex flex-col gap-1 items-start">
                              <RoleBadge role={user.roleName} />
                              {isHead && (
                                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white uppercase tracking-wider shrink-0">
                                  Trưởng khoa
                                </div>
                              )}
                            </div>
                          </TableCell>
                          {canManageMembers && (
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-1">
                                {isHead && isAdmin && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleUnassignHead(user.id)}
                                    disabled={unassigningHeadId !== null || removingId !== null}
                                    className="h-8 w-8 text-orange-500 hover:text-orange-700 hover:bg-orange-50"
                                    title="Gỡ bỏ vai trò trưởng khoa"
                                  >
                                    {unassigningHeadId === user.id ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <FlagOff size={16} />
                                    )}
                                  </Button>
                                )}

                                {(isAdmin || (isHeadOfThisDept && !isHead)) && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleRemoveMember(user.id)}
                                    disabled={removingId !== null || unassigningHeadId !== null}
                                    className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                                    title="Gỡ khỏi khoa"
                                  >
                                    {removingId === user.id ? (
                                      <Loader2 size={16} className="animate-spin" />
                                    ) : (
                                      <UserMinus size={16} />
                                    )}
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          )}
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell 
                        colSpan={canManageMembers ? 4 : 3} 
                        className="h-32 text-center"
                      >
                        <div className="flex flex-col items-center justify-center text-gray-400">
                          <UserIcon size={40} strokeWidth={1} className="mb-3 opacity-20" />
                          <p>{searchTerm ? "Không tìm thấy nhân sự phù hợp." : "Khoa này chưa có nhân sự nào."}</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
