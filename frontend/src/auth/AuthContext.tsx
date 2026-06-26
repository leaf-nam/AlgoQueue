import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { authEvent } from "./AuthEvent";
// ── Types ──────────────────────────────────────────────────
export interface AuthUser {
  id: number;
  email: string;
  nickname: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
}

// ── Context ────────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

const USER_KEY = "aq_user";

// ── Provider ───────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleUnauthenticated = () => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  };

  // Restore session on first mount
  useEffect(() => {
    authEvent.subscribe(handleUnauthenticated);
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (raw) {
        setUser(JSON.parse(raw) as AuthUser);
      }
    } catch {
      // corrupted data → treat as logged out
      localStorage.removeItem(USER_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback((user: AuthUser) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));

    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    // TODO: POST /api/auth/logout (invalidate server-side token)
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
