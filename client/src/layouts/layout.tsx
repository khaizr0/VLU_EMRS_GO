import { Outlet } from "react-router-dom";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, LogOut, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

const Layout = () => {
  const { isSynced, syncError, logout } = useAuth();

  if (syncError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg border border-red-100 text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Truy cập bị từ chối</h2>
          <p className="text-gray-600 mb-6">
            {syncError.includes("Email không được phép") 
              ? "Tài khoản của bạn không thuộc tên miền được phép truy cập vào hệ thống này (vlu.edu.vn hoặc vanlanguni.vn)."
              : syncError}
          </p>
          <Button 
            onClick={() => void logout()}
            variant="destructive"
            className="w-full flex items-center justify-center gap-2"
          >
            <LogOut size={18} /> Đăng xuất
          </Button>
        </div>
      </div>
    );
  }

  if (!isSynced) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-vlu-red mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Đang đồng bộ thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex-1">
        <div className="w-full py-6">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
