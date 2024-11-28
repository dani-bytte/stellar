// components/withAuth.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { NextRouter } from 'next/router';
import type { UseFormReturn } from 'react-hook-form';

interface WithAuthProps {
  requiredRole?: string;
}

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requiredRole }: WithAuthProps
) => {
  const ComponentWithAuth = (props: P) => {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
      const checkAuth = async () => {
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');

        if (!token || (requiredRole && role !== requiredRole)) {
          router.push('/login');
        } else {
          setIsAuthenticated(true);
        }
        setLoading(false);
      };

      checkAuth();
    }, [router]); // Remove `requiredRole` from the dependency array

    if (loading) {
      return <div>Loading...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return ComponentWithAuth;
};

interface LoginFormValues {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  role: string;
  isTemporaryPassword: boolean;
  hasProfile: boolean;
  redirectUrl: string;
  error?: string;
}

const handleLogin = async (
  values: LoginFormValues,
  form: UseFormReturn<LoginFormValues>,
  router: NextRouter
) => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (response.ok) {
      // Armazenar todos os dados necessários
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      localStorage.setItem(
        'isTemporaryPassword',
        data.isTemporaryPassword.toString()
      );
      localStorage.setItem('hasProfile', data.hasProfile.toString());

      // Redirecionar baseado no estado do usuário
      if (data.isTemporaryPassword) {
        router.push('/auth/password');
      } else if (!data.hasProfile) {
        router.push('/auth/profile');
      } else {
        router.push(data.role === 'admin' ? '/admin' : '/home');
      }
    } else {
      form.setError('root', { message: data.error });
    }
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    form.setError('root', {
      message: 'Erro ao fazer login. Por favor, tente novamente.',
    });
  }
};

export default withAuth;
