"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ROUTES } from "@/lib/routes";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

interface WithAuthProps {
  requiredRole?: string;
}

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requiredRole }: WithAuthProps = {}
) => {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          console.log("withAuth: Verificando autenticação");
          const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
          
          if (!token) {
            console.log("withAuth: Token não encontrado");
            throw new Error("No token found");
          }
          
          
          console.log("withAuth: Token verificado com sucesso");
          
          // Verifica requisitos de perfil e senha temporária
          const isTemporaryPassword = localStorage.getItem(LOCAL_STORAGE_KEYS.IS_TEMPORARY_PASSWORD) === "true";
          const hasProfile = localStorage.getItem(LOCAL_STORAGE_KEYS.HAS_PROFILE) === "true";
          
          if (isTemporaryPassword) {
            console.log("withAuth: Usuário com senha temporária, redirecionando");
            router.push(ROUTES.AUTH.PASSWORD);
            return;
          }
          
          if (!hasProfile) {
            console.log("withAuth: Usuário sem perfil, redirecionando");
            router.push(ROUTES.AUTH.PROFILE);
            return;
          }
          
          // Verifica a role se necessário
          if (requiredRole) {
            const userRole = localStorage.getItem(LOCAL_STORAGE_KEYS.ROLE);
            console.log(`withAuth: Verificando role - requerida: ${requiredRole}, atual: ${userRole}`);
            
            if (userRole !== requiredRole && userRole !== "admin") {
              console.log("withAuth: Role inválida, redirecionando para unauthorized");
              router.push(ROUTES.REDIRECT.UNAUTHORIZED);
              return;
            }
          }
          
          setIsAuthenticated(true);
        } catch (error) {
          console.error("withAuth: Erro na verificação", error);
          
          toast.error("Sessão expirada", { 
            description: "Por favor, faça login novamente" 
          });
          
          router.push(ROUTES.REDIRECT.LOGIN);
        } finally {
          setLoading(false);
        }
      };

      checkAuth();
    }, [router, requiredRole]);

    if (loading) {
      return (
        <div className="flex h-screen w-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
    }

    if (!isAuthenticated) {
      return null; // Não renderiza nada enquanto redireciona
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

export default withAuth;
