'use client';

import { useEffect, useLayoutEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider, SidebarTrigger } from '@/components/ui';
import { AppSidebar } from '@/components/ui/app-sidebar';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const isLoginPage = pathname === '/auth/login';
  const isPasswordPage = pathname === '/auth/password';
  const isProfilePage = pathname === '/auth/profile';

  useLayoutEffect(() => {
    const handleDOMReady = () => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach((input) => {
        input.addEventListener('animationstart', (e) => {
          if (e.animationName.includes('autofill')) {
            // Handle autofill here
          }
        });
      });
    };

    if (document.readyState === 'complete') {
      handleDOMReady();
    } else {
      window.addEventListener('load', handleDOMReady);
    }

    return () => {
      window.removeEventListener('load', handleDOMReady);
    };
  }, []);

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/validate-token', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            const data = await response.json();
            if (
              data.message ===
              'Token expirado. Por favor, faça login novamente.'
            ) {
              localStorage.removeItem('token');
              router.push('/auth/login');
            } else if (data.message === 'Token inválido.') {
              localStorage.removeItem('token');
              router.push('/auth/login');
            } else {
              console.error('Erro de autenticação:', data.message);
            }
          } else {
            router.push('/auth/login');
            console.error('Erro ao validar o token:', response.status);
          }
        }
      } catch (error) {
        console.error('Erro ao validar o token:', error);
      }
    };

    checkToken();
  }, [router]);

  return (
    <>
      {isLoginPage || isPasswordPage || isProfilePage ? (
        <main>{children}</main>
      ) : (
        <SidebarProvider>
          <AppSidebar />
          <main className="relative flex min-h-svh flex-1 flex-col bg-background peer-data-[variant=inset]:min-h-[calc(100svh-theme(spacing.4))] md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow">
            <SidebarTrigger />
            {children}
          </main>
        </SidebarProvider>
      )}
    </>
  );
}
