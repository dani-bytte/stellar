"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

// Tipos
interface User {
  id: string;
  username: string;
  role: string;
  hasProfile: boolean;
  isTemporaryPassword: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, role: string, hasProfile: boolean, isTemporaryPassword: boolean) => void;
  logout: () => void;
}

// Contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const login = (
    token: string, 
    role: string, 
    hasProfile: boolean = false, 
    isTemporaryPassword: boolean = false
  ) => {
    localStorage.setItem("token", token);
    localStorage.setItem("role", role);
    localStorage.setItem("hasProfile", hasProfile ? "true" : "false");
    localStorage.setItem("isTemporaryPassword", isTemporaryPassword ? "true" : "false");
    
    // Definir o usuário no estado
    setUser({
      id: "user-id", // Este valor será substituído quando buscarmos o perfil completo
      username: "username", // Este valor será substituído quando buscarmos o perfil completo
      role,
      hasProfile,
      isTemporaryPassword
    });

    // Redirecionar com base nas condições
    if (isTemporaryPassword) {
      router.push(ROUTES.AUTH.PASSWORD);
    } else if (!hasProfile) {
      router.push(ROUTES.AUTH.PROFILE);
    } else {
      router.push(role === "admin" ? ROUTES.ADMIN.DASHBOARD : ROUTES.HOME);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("hasProfile");
    localStorage.removeItem("isTemporaryPassword");
    setUser(null);
    router.push(ROUTES.AUTH.LOGIN);
    toast.info("Sessão encerrada");
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("role");
        const hasProfile = localStorage.getItem("hasProfile") === "true";
        const isTemporaryPassword = localStorage.getItem("isTemporaryPassword") === "true";

        if (!token) {
          setUser(null);
          setIsLoading(false);
          return;
        }

        // Aqui você pode adicionar uma chamada para verificar se o token é válido
        // Por exemplo: buscar informações do usuário da API

        setUser({
          id: "user-id", // Deve ser substituído pelo ID real do usuário
          username: "username", // Deve ser substituído pelo nome real do usuário
          role: role || "",
          hasProfile,
          isTemporaryPassword,
        });
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
        // Em caso de erro, fazer logout
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [router]);

  // Valor do contexto
  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook personalizado para usar o contexto de autenticação
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error("useAuth deve ser usado dentro de um AuthProvider");
  }
  
  return context;
}
