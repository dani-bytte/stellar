// components/withAuth.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { UseFormReturn } from 'react-hook-form';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';

interface AuthProps {
  requiredRole?: 'admin' | 'user';
}

interface UserAuthState {
  isTemporaryPassword: boolean;
  hasProfile: boolean;
  role: string;
}

const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  { requiredRole }: AuthProps = {}
) => {
  return function WithAuthComponent(props: P) {
    const router = useRouter();
    const pathname = usePathname();
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    const isAuthPage = [
      '/auth/login',
      '/auth/password',
      '/auth/profile',
    ].includes(pathname);

    useEffect(() => {
      const verifyAuth = async () => {
        try {
          if (isAuthPage) {
            setIsAuthorized(true);
            setIsLoading(false);
            return;
          }

          const token = localStorage.getItem('token');
          const storedRole = localStorage.getItem('role');
          const isTemporaryPassword =
            localStorage.getItem('isTemporaryPassword') === 'true';
          const hasProfile = localStorage.getItem('hasProfile') === 'true';

          if (!token) {
            router.push('/auth/login');
            return;
          }

          // Validate token
          const response = await fetch('/api/auth/validate-token', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (!response.ok) {
            throw new Error('Token inválido');
          }

          // Check role permissions
          if (requiredRole && storedRole !== requiredRole) {
            router.push(storedRole === 'admin' ? '/admin' : '/home');
            return;
          }

          // Check required steps in order
          if (isTemporaryPassword && pathname !== '/auth/password') {
            router.push('/auth/password');
            return;
          }

          if (!hasProfile && pathname !== '/auth/profile') {
            router.push('/auth/profile');
            return;
          }

          // If all checks pass
          setIsAuthorized(true);
          setIsLoading(false);
        } catch (error) {
          console.error('Erro:', error);
          localStorage.clear();
          router.push('/auth/login');
        }
      };

      verifyAuth();
    }, [router, pathname, isAuthPage, requiredRole]);

    if (isLoading) return <div>Carregando...</div>;
    if (!isAuthorized) return null;

    return <WrappedComponent {...props} />;
  };
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

// Atualizar handleLogin para armazenar todos os dados necessários
const handleLogin = async (
  values: LoginFormValues,
  form: UseFormReturn<LoginFormValues>,
  router: AppRouterInstance
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
