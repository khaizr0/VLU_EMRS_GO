import { useState } from "react";
import { FileText, User, Activity, Stethoscope, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationSidebarProps {
  onScrollTo: (id: string) => void;
}

const NAV_ITEMS = [
  { id: "administrative", label: "I. Hành chính", icon: User },
  { id: "patientManagement", label: "II. Quản lý người bệnh", icon: Activity },
  { id: "diagnosis", label: "III. Chẩn đoán", icon: Stethoscope },
  { id: "discharge", label: "IV. Tình trạng ra viện", icon: LogOut },
  { id: "reason", label: "A. Bệnh án chi tiết", icon: FileText },
];

export const NavigationSidebar = ({ onScrollTo }: NavigationSidebarProps) => {
  const [activeId, setActiveId] = useState<string>("administrative");

  const handleScrollTo = (id: string) => {
    setActiveId(id);
    onScrollTo(id);
  };

  return (
    <nav className="hidden lg:block w-64 flex-shrink-0 sticky top-28 self-start h-fit">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden p-2">
        <div className="px-3 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
          Mục lục
        </div>
        <ul className="space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleScrollTo(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  activeId === item.id
                    ? "bg-red-50 text-red-700 font-bold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-red-700"
                )}
              >
                <item.icon className={cn("h-4 w-4", activeId === item.id ? "text-red-600 opacity-100" : "opacity-70")} />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};
