// pages/home/admin/register-info.tsx

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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card"; // Importe o componente Card
import { ROUTES } from "@/lib/routes";
import { API_ENDPOINTS } from "@/lib/constants";

// Update the schema to match ProfileUser model
const registerInfoSchema = z.object({
  fullName: z
    .string()
    .min(2, "O nome completo deve ter pelo menos 2 caracteres."),
  nickname: z.string().min(2, "O apelido deve ter pelo menos 2 caracteres."),
  birthDay: z.number().min(1, "Selecione o dia."),
  birthMonth: z.number().min(1, "Selecione o mês."),
  birthYear: z
    .number()
    .min(1900, "Ano inválido.")
    .max(new Date().getFullYear(), "Ano inválido."),
  pixKey: z.string().min(1, "A chave PIX é obrigatória."),
  whatsapp: z.string().min(1, "O número do WhatsApp é obrigatório."),
  email: z.string().email("Endereço de e-mail inválido."),
});

type RegisterInfoFormValues = z.infer<typeof registerInfoSchema>;

export default function RegisterInfoPage() {
  const router = useRouter();

  // Configuração do React Hook Form para Registro de Informações de Perfil
  const registerInfoForm = useForm<RegisterInfoFormValues>({
    resolver: zodResolver(registerInfoSchema),
    defaultValues: {
      fullName: "",
      nickname: "",
      birthDay: 1,
      birthMonth: 1,
      birthYear: 2000,
      pixKey: "",
      whatsapp: "",
      email: "",
    },
  });

  // Update the handleRegisterInfo function
  const handleRegisterInfo = async (values: RegisterInfoFormValues) => {
    try {
      const token = localStorage.getItem("token");
      const storedRole = localStorage.getItem("role");

      if (!token) {
        registerInfoForm.setError("root", {
          message: "Token não encontrado. Por favor, faça login novamente.",
        });
        return;
      }

      // Create the payload matching the ProfileUser model
      const payload = {
        fullName: values.fullName,
        nickname: values.nickname,
        birthDay: values.birthDay,
        birthMonth: values.birthMonth,
        birthYear: values.birthYear,
        pixKey: values.pixKey,
        whatsapp: values.whatsapp,
        email: values.email,
      };

      // Usar API_ENDPOINTS ao invés da rota hardcoded
      const response = await fetch(API_ENDPOINTS.PROFILE.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Update localStorage after successful profile registration
        localStorage.setItem("hasProfile", "true");
        localStorage.setItem("userProfile", JSON.stringify(payload));

        // Use ROUTES para redirecionamento
        router.push(storedRole === "admin" ? ROUTES.REDIRECT.ADMIN : ROUTES.REDIRECT.USER);
      } else {
        registerInfoForm.setError("root", { message: data.error });
      }
    } catch (error) {
      console.error("Erro ao registrar informações de perfil:", error);
      registerInfoForm.setError("root", {
        message:
          "Erro ao registrar informações de perfil. Por favor, tente novamente.",
      });
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md p-6 shadow-lg">
        <h2 className="text-2xl font-semibold mb-4 text-center">
          Registro de Informações de Perfil
        </h2>
        <Form {...registerInfoForm}>
          <form
            onSubmit={registerInfoForm.handleSubmit(handleRegisterInfo)}
            className="space-y-6"
            autoComplete="off" // Previne preenchimento automático
          >
            <FormField
              control={registerInfoForm.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu nome completo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerInfoForm.control}
              name="nickname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Apelido</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite seu apelido" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex flex-wrap gap-4">
              {/* Campo Dia */}
              <FormField
                control={registerInfoForm.control}
                name="birthDay"
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel>Dia</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Dia" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {[...Array(31)].map((_, i) => (
                              <SelectItem
                                key={i + 1}
                                value={(i + 1).toString()}
                              >
                                {i + 1}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Campo Mês */}
              <FormField
                control={registerInfoForm.control}
                name="birthMonth"
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel>Mês</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {[...Array(12)].map((_, i) => {
                              const month = new Date(0, i).toLocaleString(
                                "default",
                                {
                                  month: "long",
                                },
                              );
                              return (
                                <SelectItem
                                  key={i + 1}
                                  value={(i + 1).toString()}
                                >
                                  {month.charAt(0).toUpperCase() +
                                    month.slice(1)}
                                </SelectItem>
                              );
                            })}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Campo Ano */}
              <FormField
                control={registerInfoForm.control}
                name="birthYear"
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value.toString()}
                        onValueChange={(value) => field.onChange(Number(value))}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            {Array.from(
                              { length: new Date().getFullYear() - 1900 + 1 },
                              (_, i) => 1900 + i,
                            )
                              .reverse()
                              .map((year) => (
                                <SelectItem key={year} value={year.toString()}>
                                  {year}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={registerInfoForm.control}
              name="pixKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chave PIX</FormLabel>
                  <FormControl>
                    <Input placeholder="Digite sua chave PIX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerInfoForm.control}
              name="whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite seu número de WhatsApp"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={registerInfoForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Digite seu e-mail"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {registerInfoForm.formState.errors.root && (
              <p className="text-red-500 text-sm">
                {registerInfoForm.formState.errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full">
              Salvar Informações
            </Button>
          </form>
        </Form>
      </Card>
    </div>
  );
}
