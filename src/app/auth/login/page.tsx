"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { setAuthToken } from "@/utils/authUtils";
import { ROUTES, API_ROUTES } from "@/lib/routes";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

// Schema de Validação para Login
const loginSchema = z.object({
  username: z.string().min(1, "Username é obrigatório"),
  password: z.string().min(1, "Senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {

  const [isLoading, setIsLoading] = useState(false);

  // Configuração do React Hook Form para Login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Correto uso do handleSubmit do React Hook Form
  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      console.log("Login: Enviando requisição de login");
      const response = await fetch(API_ROUTES.AUTH.LOGIN, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values)
      });

      const data = await response.json();
      console.log("Login: Resposta recebida", { ok: response.ok });

      if (response.ok) {
        // Usar a função setAuthToken que configura tanto localStorage quanto cookie
        setAuthToken(data.token);
        
        // Armazenar outros dados do usuário conforme a resposta da API
        localStorage.setItem(LOCAL_STORAGE_KEYS.ROLE, data.role);
        localStorage.setItem(LOCAL_STORAGE_KEYS.HAS_PROFILE, String(data.hasProfile));
        localStorage.setItem(LOCAL_STORAGE_KEYS.IS_TEMPORARY_PASSWORD, String(data.isTemporaryPassword));

        toast.success("Login realizado com sucesso");
        console.log("Login bem-sucedido. Token salvo.");

        // Verificar se precisa alterar senha temporária ou completar perfil
        if (data.isTemporaryPassword) {
          // Redirecionar para página de alteração de senha
          window.location.href = ROUTES.AUTH.PASSWORD;
        } else if (!data.hasProfile) {
          // Redirecionar para página de completar perfil
          window.location.href = ROUTES.AUTH.PROFILE;
        } else {
          // Redirecionamento normal baseado na role
          const redirectUrl = data.role === "admin" ? ROUTES.REDIRECT.ADMIN : ROUTES.REDIRECT.USER;
          console.log(`Login: Redirecionando para ${redirectUrl}`);
          window.location.href = redirectUrl;
        }
      } else {
        console.error("Login: Erro na autenticação", data);
        toast.error(data.message || "Credenciais inválidas");
        loginForm.setError("root", { 
          message: data.message || "Credenciais inválidas" 
        });
      }
    } catch (error) {
      console.error("Login: Erro inesperado", error);
      toast.error("Erro ao fazer login");
      loginForm.setError("root", { 
        message: "Erro ao fazer login. Por favor, tente novamente." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Toaster position="top-right" />
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Login
          </h2>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form
              // Usar o wrapper handleSubmit do React Hook Form
              onSubmit={loginForm.handleSubmit(onSubmit)}
              className="space-y-6"
              autoComplete="off"
            >
              <FormField
                control={loginForm.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Digite seu username"
                        autoComplete="username"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={loginForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite sua senha"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Mostrar erro global de formulário se existir */}
              {loginForm.formState.errors.root && (
                <p className="text-sm font-medium text-red-500">
                  {loginForm.formState.errors.root.message}
                </p>
              )}
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Carregando..." : "Login"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
