import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { toast } from "sonner";
import { Loader2, Check, ChevronsUpDown } from "lucide-react";
import type { Department, User } from "@/types";

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  department?: Department; // If provided, we are editing
}

export const DepartmentFormDialog = ({
  open,
  onOpenChange,
  onSuccess,
  department,
}: DepartmentFormDialogProps) => {
  const [name, setName] = useState("");
  const [headUserId, setHeadUserId] = useState<string>("");
  const [openCombobox, setOpenCombobox] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      const fetchData = async () => {
        try {
          const [usersData, deptsData] = await Promise.all([
            api.identities.getAllUsers(),
            api.departments.getAll()
          ]);
          setUsers(usersData);
          setDepartments(deptsData);
        } catch (error) {
          console.error("Failed to fetch users or departments:", error);
        }
      };
      fetchData();
    }
  }, [open]);

  useEffect(() => {
    if (department) {
      setName(department.name);
      setHeadUserId(department.headUserId ? department.headUserId.toString() : "");
    } else {
      setName("");
      setHeadUserId("");
    }
  }, [department, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (!department && !headUserId) {
      toast.error("Vui lòng chọn một Trưởng khoa");
      return;
    }

    setSubmitting(true);
    try {
      if (department) {
        // 1. Always update the department name first as per Swagger
        await api.departments.update(department.id, name);
        
        // 2. Only attempt to assign a new head if the selection has actually changed
        // and we have a valid numeric ID (avoiding the NaN error)
        const newHeadId = parseInt(headUserId, 10);
        const currentHeadId = department.headUserId;
        
        if (!isNaN(newHeadId) && newHeadId !== currentHeadId) {
           await api.departments.assignHead(department.id, newHeadId);
        }
        
        toast.success("Cập nhật thông tin khoa thành công");
        onSuccess();
      } else {
        const newId = await api.departments.create(name);
        const newHeadId = parseInt(headUserId, 10);
        if (!isNaN(newHeadId)) {
          await api.departments.assignHead(newId, newHeadId);
        }
        toast.success("Thêm khoa mới và phân công Trưởng khoa thành công.");
        onSuccess();
      }
      onOpenChange(false);
    } catch (error: any) {
      console.error("Failed to save department:", error);
      toast.error(error.message || "Lỗi khi lưu thông tin khoa");
    } finally {
      setSubmitting(false);
    }
  };

  const selectedUser = users.find((user) => user.id.toString() === headUserId);

  // Filter out users who already belong to a department
  const availableUsers = users.filter(user => {
    const isAssigned = departments.some(dept => 
      dept.headUserId === user.id || 
      dept.users?.some((u: User) => u.id === user.id)
    );
    // If we are editing, we should still show the current head
    if (department && user.id === department.headUserId) return true;
    return !isAssigned;
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-fit min-w-[450px] max-w-[95vw] sm:max-w-none">
        <DialogHeader>
          <DialogTitle>{department ? "Chỉnh sửa Khoa" : "Thêm Khoa Mới"}</DialogTitle>
          <DialogDescription>
            {department ? "Sửa thông tin của khoa đang chọn." : "Điền thông tin để tạo khoa mới."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4 min-w-max">
          <div className="space-y-2">
            <Label htmlFor="name">Tên Khoa <span className="text-red-500">*</span></Label>
            <Input
              id="name"
              placeholder="VD: KHOA XÉT NGHIỆM"
              value={name}
              onChange={(e) => setName(e.target.value.toUpperCase())}
              required
            />
          </div>
          
          {!department && (
            <div className="space-y-2 flex flex-col">
              <Label htmlFor="headUser">Trưởng Khoa <span className="text-red-500">*</span></Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    id="headUser"
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between font-normal"
                  >
                    {selectedUser
                      ? `${selectedUser.name} (${selectedUser.email})`
                      : "Chọn Trưởng khoa..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[375px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Tìm theo tên hoặc email..." />
                    <CommandList>
                    <CommandEmpty>Không tìm thấy nhân sự phù hợp.</CommandEmpty>
                    <CommandGroup>
                      {availableUsers.map((user) => (
                        <CommandItem
                          key={user.id}
                          value={`${user.name} ${user.email}`}
                          onSelect={() => {
                            setHeadUserId(user.id.toString());
                            setOpenCombobox(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              headUserId === user.id.toString() ? "opacity-100" : "opacity-0"
                            )}
                          />
                          <div className="flex flex-col">
                            <span>{user.name}</span>
                            <span className="text-xs text-gray-500">{user.email}</span>
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                  </Command>
                  </PopoverContent>
                  </Popover>
                  </div>
                  )}

                  <DialogFooter>
                  <Button
                  type="button"              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={submitting} className="bg-vlu-red hover:bg-red-700">
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {department ? "Lưu thay đổi" : "Tạo Khoa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

