"use client";

import { ReactNode } from "react";
import { ThemeProvider } from "next-themes";
import { ToastProvider } from "@/components/providers/toast-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { SidebarProvider } from "@/components/ui/sidebar";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem
      disableTransitionOnChange
      storageKey="theme-preference"
    >
      <ToastProvider />
      <AuthProvider>
        <SidebarProvider defaultCollapsed={false}>
          {children}
        </SidebarProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
