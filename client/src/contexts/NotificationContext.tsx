import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { useAuth } from "./AuthContext";
import { api } from "@/services/api";
import type { UserNotification } from "@/types";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: UserNotification[];
  unreadCount: number;
  loading: boolean;
  markAsRead: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  fetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isSynced, getAccessToken } = useAuth();
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated || !isSynced) return;
    try {
      setLoading(true);
      const data = await api.notifications.getAll();
      if (Array.isArray(data)) {
        setNotifications(data);
        setUnreadCount(data.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isSynced]);

  const markAsRead = async (id: number) => {
    try {
      await api.notifications.markAsRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error: any) {
      console.warn(`NotificationContext: Could not mark ${id} as read (Backend 403/Error). This is likely a permission sync issue on the server.`);
      // Optionally still update local UI to stop showing the badge for this session
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    }
  };

  const markAllAsRead = async () => {
    const unreadOnes = notifications.filter(n => !n.isRead);
    try {
      await Promise.all(unreadOnes.map(n => api.notifications.markAsRead(n.id)));
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all as read:", error);
    }
  };

  useEffect(() => {
    let activeConnection: signalR.HubConnection | null = null;

    const connectSignalR = async () => {
      if (isAuthenticated && isSynced) {
        fetchNotifications(); // Fetch once on initial load (F5)
        try {
          const token = await getAccessToken();
          console.log("NotificationContext: Connecting to SignalR Hub...");
          
          activeConnection = new signalR.HubConnectionBuilder()
            .withUrl(import.meta.env.VITE_API_HUB_URL, {
              accessTokenFactory: () => token
            })
            .withAutomaticReconnect()
            .build();

          const handleNewNotification = (notification: any) => {
            console.log("NotificationContext: Received realtime notification:", notification);
            setNotifications(prev => {
              if (prev.some(n => n.id === notification.id)) return prev;
              return [notification, ...prev];
            });
            setUnreadCount(prev => prev + 1);
            
            const title = notification.notification?.appTitle || "Thông báo mới";
            const content = notification.notification?.appContent || "";
            const url = notification.notification?.resourceUrl;
            
            const toastOptions: any = {
              description: content,
            };

            if (url) {
                toastOptions.action = {
                    label: "Xem chi tiết",
                    onClick: () => {
                        window.location.href = url;
                    }
                };
            } else if (content.includes("/record/edit/")) {
                const match = content.match(/\/record\/edit\/[^\s]+/);
                if (match) {
                    toastOptions.action = {
                        label: "Xem",
                        onClick: () => {
                            window.location.href = match[0];
                        }
                    };
                }
            }

            toast.info(title, toastOptions);
          };

          activeConnection.on("notification_received", handleNewNotification);
          activeConnection.on("ReceiveNotification", handleNewNotification);

          await activeConnection.start();
          console.log("NotificationContext: SignalR Connected successfully");
          setConnection(activeConnection);
        } catch (err) {
          console.error("NotificationContext: SignalR Connection Error:", err);
        }
      } else {
        if (!isAuthenticated) {
            setNotifications([]);
            setUnreadCount(0);
        }
        if (connection) {
          console.log("NotificationContext: Stopping SignalR connection...");
          connection.stop();
          setConnection(null);
        }
      }
    };

    connectSignalR();

    return () => {
      if (activeConnection) {
        activeConnection.stop();
      }
    };
  }, [isAuthenticated, isSynced, getAccessToken, fetchNotifications]);

  return (
    <NotificationContext.Provider value={{ 
      notifications, 
      unreadCount, 
      loading, 
      markAsRead, 
      markAllAsRead,
      fetchNotifications 
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
};
