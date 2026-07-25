import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { authEvent } from "./AuthEvent";
import { useToast } from "../hooks/useToast";
import { resetAuthErrorFlag } from "../api";
import { clearGuestHistory } from "../lib/guest";
// ── Types ──────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  email: string;
  nickname: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isGuest: boolean;
  login: (user: AuthUser) => void;
  guestLogin: () => void;
  logout: () => void;
}

// ── Context ────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "aq_user";
const GUEST_FLAG_KEY = "aq_guest";

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const handleUnauthenticated = (reason: string) => {
    toast(reason, "error");
    setUser(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(GUEST_FLAG_KEY);
  };

  // Restore session on first mount
  useEffect(() => {
    authEvent.subscribe(handleUnauthenticated);
    resetAuthErrorFlag();
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as AuthUser);
      }
    } catch {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(GUEST_FLAG_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    localStorage.removeItem(GUEST_FLAG_KEY);
    resetAuthErrorFlag();
    setUser(user);
  }, []);

  const guestLogin = useCallback(() => {
    const guest: AuthUser = { id: 0, email: "guest@algoqueue", nickname: "게스트" };
    localStorage.setItem(USER_KEY, JSON.stringify(guest));
    localStorage.setItem(GUEST_FLAG_KEY, "true");
    resetAuthErrorFlag();
    setUser(guest);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(GUEST_FLAG_KEY);
    clearGuestHistory();
    setUser(null);
  }, []);

  const isGuest = useMemo(
    () => user !== null && localStorage.getItem(GUEST_FLAG_KEY) === "true",
    [user],
  );

  return (
    <AuthContext.Provider value={{ user, isLoading, isGuest, login, guestLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
