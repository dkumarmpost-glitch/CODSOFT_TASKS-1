import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import * as authService from "@/services/auth";
import { AuthUser } from "@/services/auth";

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "college-shop-auth";

interface StoredAuth {
  token: string;
  user: AuthUser;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load auth state from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as StoredAuth;
        setUser(parsed.user);
        setToken(parsed.token);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persistAuth = useCallback((auth: StoredAuth) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(auth));
    setUser(auth.user);
    setToken(auth.token);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const response = await authService.login(email, password);
      persistAuth({ token: response.token, user: response.user });
    },
    [persistAuth]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const response = await authService.register(name, email, password);
      persistAuth({ token: response.token, user: response.user });
    },
    [persistAuth]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
