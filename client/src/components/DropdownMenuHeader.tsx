import { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell } from "lucide-react";
import { api } from "@/services/api";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

interface DropdownMenuHeaderProps {
  user: {
    name: string;
    email?: string;
    avatar: string;
    isReceivedEmail?: boolean;
  };
}

export function DropdownMenuHeader({ user }: DropdownMenuHeaderProps) {
  const { currentUser, setCurrentUser } = useAuth();
  const [isEmailEnabled, setIsEmailEnabled] = useState(user.isReceivedEmail ?? true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    setIsEmailEnabled(user.isReceivedEmail ?? true);
  }, [user.isReceivedEmail]);

  const handleToggleEmail = async (checked: boolean) => {
    if (!currentUser?.id) return;
    
    setIsUpdating(true);
    // Optimistic update for UI feel
    setIsEmailEnabled(checked);
    
    try {
      await api.identities.updateSettings(currentUser.id, checked);
      setCurrentUser({ ...currentUser, isReceivedEmail: checked });
      toast.success(checked ? "Đã bật nhận thông báo qua email" : "Đã tắt nhận thông báo qua email");
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật cài đặt");
      // Revert on error
      setIsEmailEnabled(!checked);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity outline-none">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-medium text-foreground">{user.name}</span>
            {user.email && <span className="text-[10px] text-muted-foreground">{user.email}</span>}
          </div>
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-red-700 text-white font-bold text-xs">
              {user.name.split(" ").pop()?.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </div>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Cài đặt tài khoản</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <div className="flex items-center justify-between px-2 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-gray-500" />
            <Label htmlFor="email-notifications" className="text-sm font-medium cursor-pointer">
              Nhận email thông báo
            </Label>
          </div>
          <Switch 
            id="email-notifications" 
            checked={isEmailEnabled}
            onCheckedChange={handleToggleEmail}
            disabled={isUpdating}
            className="data-[state=checked]:bg-vlu-red"
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}