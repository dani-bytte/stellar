'use client';

import { useEffect } from 'react';
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

  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/auth/login');
        return;
      }

      try {
        const response = await fetch('/api/auth/validate-token/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          router.push('/auth/login');
        }
      } catch (error) {
        console.error('Failed to verify token:', error);
        router.push('/auth/login');
      }
    };

    checkToken();
  }, [router]);

  return (
    <>
      {isLoginPage ? (
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
