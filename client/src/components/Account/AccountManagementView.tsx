import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";
import { AccountTable } from "./AccountTable";
import { Input } from "@/components/ui/input";
import type { User } from "@/types";
import { api } from "@/services/api";
import { toast } from "sonner";

export const AccountManagementView = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // 1. Fetch both users and departments in parallel
      const [usersData, departmentsData] = await Promise.all([
        api.identities.getAllUsers(),
        api.departments.getAll()
      ]);

      // 2. Enrich users with department information
      const enrichedUsers = usersData.map(user => {
        const dept = departmentsData.find(d => 
          d.users?.some((u: User) => u.id === user.id) || d.headUserId === user.id
        );
        return {
          ...user,
          departmentId: dept?.id,
          departmentName: dept?.name
        };
      });

      setUsers(enrichedUsers);
    } catch (error: any) {
      console.error("Failed to fetch accounts data:", error);
      toast.error("Không thể tải danh sách tài khoản");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-vlu-red" />
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-6 space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Quản Lý Tài Khoản</h1>
        </div>

        <div className="relative w-full md:w-72">
           <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <AccountTable 
        users={filteredUsers} 
        onRefresh={fetchUsers}
      />
    </div>
  );
};
