'use client';

import * as React from 'react';
import {
  Bot,
  GalleryVerticalEnd,
  Settings2,
  SquareTerminal,
} from 'lucide-react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { TeamSwitcher } from '@/components/team-switcher';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar';
import { useRouter } from 'next/navigation';

interface User {
  fullName: string;
  email: string;
  avatar?: string;
  role: string;
}

import { LucideIcon } from 'lucide-react';

interface MenuItem {
  title: string;
  url: string;
  icon?: LucideIcon;
  isActive?: boolean;
  items?: {
    title: string;
    url: string;
  }[];
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [user, setUser] = React.useState<User | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const router = useRouter();
  const mounted = React.useRef(false);

  React.useEffect(() => {
    mounted.current = true;

    const checkUserStatus = async () => {
      try {
        if (!mounted.current) return;

        const token = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role');
        const hasProfile = localStorage.getItem('hasProfile') === 'true';
        const isTemporaryPassword =
          localStorage.getItem('isTemporaryPassword') === 'true';

        if (!token || !storedRole) {
          router.push('/auth/login');
          return;
        }

        // Check mandatory steps first
        if (isTemporaryPassword) {
          router.push('/auth/password');
          return;
        }

        if (!hasProfile) {
          router.push('/auth/profile');
          return;
        }

        // Only fetch profile if all checks pass
        const response = await fetch('/api/home/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao obter informações do perfil');
        }

        const profileData = await response.json();
        if (mounted.current) {
          setUser({
            fullName: profileData.fullName,
            email: profileData.email,
            avatar: profileData.avatar,
            role: storedRole,
          });
        }
      } catch (error) {
        console.error('Erro:', error);
        if (mounted.current) {
          setError(
            error instanceof Error ? error.message : 'Erro desconhecido'
          );
        }
      } finally {
        if (mounted.current) {
          setIsLoading(false);
        }
      }
    };

    checkUserStatus();

    return () => {
      mounted.current = false;
    };
  }, [router]);

  const getNavigationItems = React.useCallback(
    (user: User | null): MenuItem[] => {
      if (!user) return [];

      const baseItems: MenuItem[] = [
        {
          title: 'Tickets',
          url: '#',
          icon: SquareTerminal,
          isActive: true,
          items: [
            {
              title: 'History',
              url: '/home/ticket',
            },
          ],
        },
        {
          title: 'Settings',
          url: '#',
          icon: Settings2,
          items: [
            {
              title: 'General',
              url: '/settings',
            },
            {
              title: 'Team',
              url: '/settings/team',
            },
          ],
        },
      ];

      if (user.role === 'admin') {
        baseItems.splice(1, 0, {
          title: 'Admin',
          url: '#',
          icon: Bot,
          items: [
            {
              title: 'Painel',
              url: '/admin',
            },
            {
              title: 'Users',
              url: '/admin/users',
            },
          ],
        });
      }

      return baseItems;
    },
    []
  );

  if (isLoading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  if (!user) return null;

  const data = {
    user: {
      name: user.fullName,
      email: user.email,
      avatar: user.avatar || '',
    },
    teams: [
      {
        name: 'Stellar',
        logo: GalleryVerticalEnd,
        plan: 'Enterprise',
      },
    ],
    navMain: getNavigationItems(user),
  };

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
      <Dialog>
        <DialogContent>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
