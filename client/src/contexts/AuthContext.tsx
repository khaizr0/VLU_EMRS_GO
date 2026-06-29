import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AccountInfo } from "@azure/msal-browser";
import type { User } from "@/types";
import {
  clearMicrosoftSession,
  getMicrosoftAccessToken,
  getMicrosoftAccount,
  initializeMicrosoftAuth,
  isMicrosoftTimeoutError,
  loginWithMicrosoft,
  logoutMicrosoft,
} from "@/auth/microsoft";
import { api, setAccessToken } from "@/services/api";

interface AuthContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  microsoftAccount: AccountInfo | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  isSynced: boolean;
  syncError: string | null;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [microsoftAccount, setMicrosoftAccount] = useState<AccountInfo | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const syncingRef = useRef(false);
  const refreshTimerRef = useRef<number | null>(null);

  const isAuthenticated = microsoftAccount !== null;
  const isAdmin = currentUser?.roleName === "Admin";
  const isTeacher = currentUser?.roleName === "Teacher";
  const isStudent = currentUser?.roleName === "Student";

  const getAccessToken = useCallback(async () => {
    const result = await getMicrosoftAccessToken();
    setAccessToken(result.accessToken);

    if (refreshTimerRef.current) {
      window.clearTimeout(refreshTimerRef.current);
    }
    if (result.expiresOn) {
      const refreshIn = Math.max(
        result.expiresOn.getTime() - Date.now() - 5 * 60 * 1000,
        30_000,
      );
      refreshTimerRef.current = window.setTimeout(() => {
        void getAccessToken().catch(console.error);
      }, refreshIn);
    }

    return result.accessToken;
  }, []);

  const login = useCallback(async () => {
    setSyncError(null);
    await loginWithMicrosoft();
  }, []);

  const clearAuthState = useCallback(() => {
    setAccessToken(null);
    setCurrentUser(null);
    setMicrosoftAccount(null);
    setIsSynced(false);
  }, []);

  const clearSyncedUser = useCallback(() => {
    setAccessToken(null);
    setCurrentUser(null);
    setIsSynced(false);
  }, []);

  const logout = useCallback(async () => {
    clearAuthState();
    await logoutMicrosoft();
  }, [clearAuthState]);

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      try {
        await initializeMicrosoftAuth();
        const account = getMicrosoftAccount();
        if (cancelled) return;
        setMicrosoftAccount(account);

        if (!account || syncingRef.current) {
          return;
        }

        syncingRef.current = true;
        const token = await getAccessToken();
        const user = await api.auth.sync(token);
        if (cancelled) return;

        setCurrentUser(user);
        setIsSynced(true);
        setSyncError(null);
      } catch (error) {
        if (cancelled) return;
        console.error("Microsoft authentication failed:", error);

        if (isMicrosoftTimeoutError(error)) {
          clearAuthState();
          await clearMicrosoftSession().catch(console.error);
          window.location.replace("/login");
          return;
        }

        const message =
          error instanceof Error ? error.message : "Không thể đăng nhập.";
        clearSyncedUser();
        setSyncError(message);
      } finally {
        syncingRef.current = false;
        if (!cancelled) setIsLoading(false);
      }
    };

    void initialize();

    return () => {
      cancelled = true;
      if (refreshTimerRef.current) {
        window.clearTimeout(refreshTimerRef.current);
      }
    };
  }, [clearAuthState, clearSyncedUser, getAccessToken]);

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        microsoftAccount,
        isAuthenticated,
        isLoading,
        isAdmin,
        isTeacher,
        isStudent,
        isSynced,
        syncError,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
