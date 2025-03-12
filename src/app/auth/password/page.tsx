"use client";

import React from "react";
import { useRouter } from "next/navigation";
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

// Schema de Validação para Alteração de Senha
const changePasswordSchema = z.object({
  oldPassword: z.string().min(1, "Senha antiga é obrigatória"),
  newPassword: z
    .string()
    .min(8, "A nova senha deve ter pelo menos 8 caracteres"),
});

type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordPage() {
  const router = useRouter();

  // Configuração do React Hook Form para Alteração de Senha
  const changePasswordForm = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
    },
  });

  // Função para lidar com a alteração de senha
  const handleChangePassword = async (values: ChangePasswordFormValues) => {
    try {
      const token = localStorage.getItem("token");

      if (!token) {
        changePasswordForm.setError("root", {
          message: "Token não encontrado. Por favor, faça login novamente.",
        });
        return;
      }

      const response = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage
        if (data.token) {
          localStorage.setItem("token", data.token);
        }
        localStorage.setItem("isTemporaryPassword", "false");

        // Check profile status
        const hasProfile = localStorage.getItem("hasProfile") === "true";
        if (!hasProfile) {
          router.push("/auth/profile");
        } else {
          const role = localStorage.getItem("role");
          router.push(role === "admin" ? "/admin" : "/home");
        }
      } else {
        changePasswordForm.setError("root", { message: data.error });
      }
    } catch (error) {
      console.error("Erro ao alterar a senha:", error);
      changePasswordForm.setError("root", {
        message: "Erro ao alterar a senha. Por favor, tente novamente.",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <h2 className="text-2xl font-bold">Alterar Senha</h2>
        </CardHeader>
        <CardContent>
          <Form {...changePasswordForm}>
            <form
              onSubmit={changePasswordForm.handleSubmit(handleChangePassword)}
              className="space-y-6"
              autoComplete="off"
            >
              <input
                type="text"
                name="fakeusernameremembered"
                className="hidden"
                aria-hidden="true"
                autoComplete="username"
                title="Campo de usuário escondido para prevenir autopreenchimento"
                placeholder="Usuário"
              />
              <input
                type="password"
                name="fakepasswordremembered"
                className="hidden"
                aria-hidden="true"
                autoComplete="new-password"
                title="Campo de senha escondido para prevenir autopreenchimento"
                placeholder="Senha"
              />

              <FormField
                control={changePasswordForm.control}
                name="oldPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Senha Antiga</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite sua senha antiga"
                        autoComplete="current-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={changePasswordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova Senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite sua nova senha"
                        autoComplete="new-password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {changePasswordForm.formState.errors.root && (
                <p className="text-red-500 text-sm">
                  {changePasswordForm.formState.errors.root.message}
                </p>
              )}
              <Button type="submit" className="w-full">
                Alterar Senha
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
