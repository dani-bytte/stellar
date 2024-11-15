'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const currentYear = new Date().getFullYear();

const formSchema = z
  .object({
    fullName: z.string().min(2, {
      message: 'O nome completo deve ter pelo menos 2 caracteres.',
    }),
    nickname: z.string().min(2, {
      message: 'O apelido deve ter pelo menos 2 caracteres.',
    }),
    birthDay: z.number().min(1, {
      message: 'Selecione o dia.',
    }),
    birthMonth: z.number().min(1, {
      message: 'Selecione o mês.',
    }),
    birthYear: z
      .number()
      .min(currentYear - 59)
      .max(currentYear, {
        message: 'Ano inválido.',
      }),
    pixKey: z.string().min(1, {
      message: 'A chave PIX é obrigatória.',
    }),
    whatsapp: z.string().min(1, {
      message: 'O número do WhatsApp é obrigatório.',
    }),
    email: z.string().email({
      message: 'Endereço de e-mail inválido.',
    }),
  })
  .refine(
    (data) => {
      const { birthDay, birthMonth, birthYear } = data;
      const date = new Date(birthYear, birthMonth - 1, birthDay);
      return (
        date.getFullYear() === birthYear &&
        date.getMonth() + 1 === birthMonth &&
        date.getDate() === birthDay
      );
    },
    {
      message: 'Data de nascimento inválida.',
      path: ['birthDay'],
    }
  );

export default function ProfilePage() {
  const router = useRouter();
  const [dayOptions, setDayOptions] = React.useState<number[]>([]);
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: '',
      nickname: '',
      birthDay: 0,
      birthMonth: 0,
      birthYear: 0,
      pixKey: '',
      whatsapp: '',
      email: '',
    },
  });

  type FormValues = {
    fullName: string;
    nickname: string;
    birthDay: number;
    birthMonth: number;
    birthYear: number;
    pixKey: string;
    whatsapp: string;
    email: string;
  };

  // Função para calcular o número de dias no mês selecionado
  const calculateDaysInMonth = (year: number, month: number) => {
    return new Date(year, month, 0).getDate();
  };

  // Observar as mudanças nos campos birthMonth e birthYear
  const birthMonth = form.watch('birthMonth');
  const birthYear = form.watch('birthYear');

  // Atualizar as opções de dias sempre que o mês ou o ano forem alterados
  React.useEffect(() => {
    if (birthMonth && birthYear) {
      const daysInMonth = calculateDaysInMonth(birthYear, birthMonth);
      const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
      setDayOptions(daysArray);

      // Se o dia selecionado for maior que o número de dias no mês, limpar o campo birthDay
      const currentDay = form.getValues('birthDay');
      if (currentDay && currentDay > daysInMonth) {
        form.setValue('birthDay', 0);
      }
    } else {
      setDayOptions([]);
    }
  }, [birthMonth, birthYear, form]);

  const onSubmit = async (values: FormValues) => {
    try {
      const birthDate = new Date(
        values.birthYear,
        values.birthMonth - 1,
        values.birthDay
      );
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Token não encontrado');
      }

      const response = await fetch('/api/home/admin/register-info', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...values, birthDate: birthDate.toISOString() }),
      });

      if (!response.ok) {
        throw new Error('Falha ao salvar o perfil');
      }
      router.push('/auth/profile');
    } catch {
      console.error('Falha ao salvar o perfil. Por favor, tente novamente.');
      form.setError('root', {
        type: 'manual',
        message: 'Falha ao salvar o perfil. Por favor, tente novamente.',
      });
    }
  };

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-10">
      <div className="mx-auto h-24 w-full max-w-3xl flex items-center justify-center">
        <h3 className="text-xl font-semibold mb-4">Perfil do Usuário</h3>
      </div>

      <div className="mx-auto h-full w-full max-w-3xl p-6">
        <h3 className="text-xl font-semibold mb-4">Complete Seu Perfil</h3>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
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
              control={form.control}
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

            {/* Campos para Dia, Mês e Ano */}
            <div className="flex flex-wrap gap-4">
              <FormField
                control={form.control}
                name="birthDay"
                render={({ field }) => (
                  <FormItem className="w-24">
                    <FormLabel>Dia</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        value={field.value ? field.value.toString() : ''}
                        disabled={!birthMonth || !birthYear}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Dia" />
                        </SelectTrigger>
                        <SelectContent>
                          {dayOptions.map((day) => (
                            <SelectItem key={day} value={day.toString()}>
                              {day}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthMonth"
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel>Mês</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                          form.trigger('birthDay'); // Revalidar o dia
                        }}
                        value={field.value ? field.value.toString() : ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Mês" />
                        </SelectTrigger>
                        <SelectContent>
                          {[...Array(12)].map((_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {new Date(0, i).toLocaleString('default', {
                                month: 'long',
                              })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="birthYear"
                render={({ field }) => (
                  <FormItem className="w-32">
                    <FormLabel>Ano</FormLabel>
                    <FormControl>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(Number(value));
                          form.trigger('birthDay'); // Revalidar o dia
                        }}
                        value={field.value ? field.value.toString() : ''}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Ano" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 60 }, (_, i) => (
                            <SelectItem
                              key={currentYear - i}
                              value={(currentYear - i).toString()}
                            >
                              {currentYear - i}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
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
              control={form.control}
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
              control={form.control}
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
            {form.formState.errors.root && (
              <p className="text-red-500 text-sm">
                {form.formState.errors.root.message}
              </p>
            )}
            <Button type="submit" className="w-full">
              Salvar
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
