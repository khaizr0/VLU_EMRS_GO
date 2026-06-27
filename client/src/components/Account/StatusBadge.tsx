import { Badge } from "@/components/ui/badge";
import { Lock, Unlock } from "lucide-react";

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  if (status === "locked") {
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-600 gap-1 hover:bg-gray-200">
        <Lock size={12} /> Đã khóa
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="bg-blue-50 text-blue-600 gap-1 hover:bg-blue-100">
      <Unlock size={12} /> Hoạt động
    </Badge>
  );
};
