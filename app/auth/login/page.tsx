'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardHeader, CardContent } from '@/components/ui/card';

// Schema de Validação para Login
const loginSchema = z.object({
  username: z.string().min(1, 'Username é obrigatório'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage = () => {
  const router = useRouter();
  const [, setUsername] = useState('');

  // Configuração do React Hook Form para Login
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  });

  const handleLogin = async (values: LoginFormValues) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('API Response:', data); // Debug log

        // Store as string explicitly
        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.role);
        localStorage.setItem('hasProfile', String(data.hasProfile)); // Fix: Use String()
        localStorage.setItem(
          'isTemporaryPassword',
          String(data.isTemporaryPassword)
        );

        //console.log('Stored hasProfile:', localStorage.getItem('hasProfile')); // Debug log

        const redirectUrl = data.role === 'admin' ? '/admin' : '/home';
        router.push(redirectUrl);
      } else {
        loginForm.setError('root', { message: data.error });
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      loginForm.setError('root', {
        message: 'Erro ao fazer login. Por favor, tente novamente.',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md p-6">
        <CardHeader>
          <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0">
            Login
          </h2>
        </CardHeader>
        <CardContent>
          <Form {...loginForm}>
            <form
              onSubmit={loginForm.handleSubmit(handleLogin)}
              className="space-y-6"
              autoComplete="off" // Previne preenchimento automático no formulário de login
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
                        autoComplete="username" // Define o autocomplete correto
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
                        autoComplete="current-password" // Define o autocomplete correto
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {loginForm.formState.errors.root && (
                <p className="text-red-500 text-sm">
                  {loginForm.formState.errors.root.message}
                </p>
              )}
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
