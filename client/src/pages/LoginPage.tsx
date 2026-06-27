import logo from "@/assets/vlu-logo.png";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const { login, isLoading, isAuthenticated, isSynced } = useAuth();

  const handleLogin = () => {
    void login();
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-vlu-red" />
      </div>
    );
  }

  if (isAuthenticated && isSynced) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <Card className="w-full max-w-md border-t-4 border-t-vlu-red shadow-xl">
        <CardHeader className="space-y-4 text-center">
          <div className="flex justify-center">
            <img src={logo} alt="VLU Logo" className="h-20 w-auto object-contain" />
          </div>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 pb-8">
          <Button
            onClick={handleLogin}
            className="flex h-12 w-full items-center justify-center gap-3 bg-[#0078d4] text-white hover:bg-[#006cc1] transition-all font-bold text-lg"
          >
            <svg
              aria-hidden="true"
              width="20"
              height="20"
              viewBox="0 0 21 21"
            >
              <path fill="#f25022" d="M1 1h9v9H1z" />
              <path fill="#7fba00" d="M11 1h9v9h-9z" />
              <path fill="#00a4ef" d="M1 11h9v9H1z" />
              <path fill="#ffb900" d="M11 11h9v9h-9z" />
            </svg>
            Đăng nhập với Microsoft
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
