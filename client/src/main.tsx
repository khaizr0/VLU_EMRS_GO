import { createRoot } from "react-dom/client";
import "./global.css";
import { BrowserRouter as Router } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import AppRoutes from "./AppRoutes";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <NotificationProvider>
      <Router>
        <AppRoutes />
        <Toaster position="top-right" richColors closeButton />
      </Router>
    </NotificationProvider>
  </AuthProvider>
);
