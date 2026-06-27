import { Badge } from "@/components/ui/badge";
import { Shield, User, GraduationCap } from "lucide-react";

interface RoleBadgeProps {
  role: string;
}

export const RoleBadge = ({ role }: RoleBadgeProps) => {
  const normalizedRole = role.toLowerCase();
  
  switch (normalizedRole) {
    case "admin":
      return (
        <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-200 gap-1">
          <Shield size={12} /> Admin
        </Badge>
      );
    case "teacher":
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 border-red-200 gap-1">
          <User size={12} /> Giảng viên
        </Badge>
      );
    case "student":
    default:
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 gap-1">
          <GraduationCap size={12} /> Sinh viên
        </Badge>
      );
  }
};
