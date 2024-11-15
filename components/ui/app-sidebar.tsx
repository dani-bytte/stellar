'use client';

import * as React from 'react';
import {
  AudioWaveform,
  Bot,
  Command,
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

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  interface User {
    fullName: string;
    email: string;
    avatar?: string;
  }

  const [user, setUser] = React.useState<User | null>(null);

  React.useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
          return;
        }

        const token = localStorage.getItem('token');
        const response = await fetch('/api/home/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Erro ao obter informações do perfil');
        }

        const data = await response.json();
        setUser(data);
        localStorage.setItem('user', JSON.stringify(data));
      } catch (error) {
        console.error('Erro ao obter informações do perfil:', error);
      }
    };

    fetchUserProfile();
  }, []);

  if (!user) {
    return <div>Carregando...</div>;
  }

  const data = {
    user: {
      name: user.fullName,
      email: user.email,
      avatar: user.avatar || '',
    },
    teams: [
      {
        name: 'Acme Inc',
        logo: GalleryVerticalEnd,
        plan: 'Enterprise',
      },
      {
        name: 'Acme Corp.',
        logo: AudioWaveform,
        plan: 'Startup',
      },
      {
        name: 'Evil Corp.',
        logo: Command,
        plan: 'Free',
      },
    ],
    navMain: [
      {
        title: 'Tickets',
        url: '#',
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: 'History',
            url: '/tickets',
          },
          {
            title: 'New Ticket',
            url: '/tickets/new',
          },
        ],
      },
      {
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
          {
            title: 'New User',
            url: '/admin/users/new',
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
    ],
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
          {/* Conteúdo do Dialog */}
        </DialogContent>
      </Dialog>
    </Sidebar>
  );
}
