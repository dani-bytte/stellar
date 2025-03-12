"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { setAuthToken } from "@/utils/authUtils";
import { API_ENDPOINTS } from "@/lib/constants";
import { ROUTES } from "@/lib/routes";

// Defina um tipo para as credenciais
interface LoginCredentials {
  username: string;
  password: string;
}

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: "",
    password: "",
  });

  // Verificar se há um redirecionamento após o login
  useEffect(() => {
    const redirectPath = searchParams.get("redirect");
    if (redirectPath) {
      toast.info("Faça login para continuar", {
        description: "Você será redirecionado após o login"
      });
    }
  }, [searchParams]);

  // Manipulador de mudança para os campos do formulário
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
  };

  // Função de login agora usada dentro do manipulador de submissão
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Usar API_ENDPOINTS ao invés da rota hardcoded
      const response = await fetch(API_ENDPOINTS.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (response.ok) {
        // Armazene o token em localStorage E como cookie
        setAuthToken(data.token);
        
        // Armazene outros dados do usuário conforme necessário
        localStorage.setItem("role", data.role);

        toast.success("Login realizado com sucesso");

        // Verifica se há um redirecionamento específico na URL
        const redirectPath = searchParams.get("redirect");
        
        if (redirectPath) {
          router.push(redirectPath);
        } else {
          // Redireciona com base na role
          if (data.role === "admin") {
            router.push(ROUTES.REDIRECT.ADMIN);
          } else {
            router.push(ROUTES.REDIRECT.USER);
          }
        }
      } else {
        toast.error(data.message || "Credenciais inválidas");
      }
    } catch (error) {
      toast.error("Erro ao fazer login");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={120}
              priority
            />
          </div>
          <CardTitle className="text-2xl text-center font-bold">Login</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Nome de usuário</Label>
              <Input
                id="username"
                name="username"
                placeholder="Digite seu nome de usuário"
                required
                value={credentials.username}
                onChange={handleChange}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Senha</Label>
                <a 
                  href="/forgot-password" 
                  className="text-sm text-blue-500 hover:text-blue-700"
                >
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                required
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}