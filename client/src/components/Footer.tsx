import { HeartPulse, Globe, HelpCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Copyright & Branding */}
          <div className="flex items-center space-x-2">
            <div className="bg-red-50 p-1.5 rounded-full">
              <HeartPulse size={16} className="text-red-600" />
            </div>
            <div className="text-xs text-gray-500">
              <span className="font-bold text-gray-700 block sm:inline mr-1">
                Hồ sơ bệnh án điện tử
              </span>
              <span>&copy; 2026 Nhóm 03 - Nhóm Anh Em văn phòng (Khóa luận tốt nghiệp HK252).</span>
            </div>
          </div>

          {/* Right: Links & Info */}
          <div className="flex items-center space-x-4 text-xs font-medium text-gray-500">
            <a
              href="https://www.vlu.edu.vn/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 transition-colors flex items-center"
            >
              <Globe size={14} className="mr-1" /> Trang chủ
            </a>
            <a
              href="https://www.vlu.edu.vn/life-at-vlu/center/trung-tam-ho-tro-sinh-vien"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 transition-colors flex items-center"
            >
              <HelpCircle size={14} className="mr-1" /> Hỗ trợ
            </a>
            <div className="h-4 w-px bg-gray-200"></div>
            <span className="font-mono text-gray-400">v1.0-Alpha</span>
          </div>
        </div>
      </div>
    </footer>
  );
}