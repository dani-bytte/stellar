"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider, SidebarTrigger } from "@/components/ui";
import { AppSidebar } from "@/components/ui/app-sidebar";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthPage = [
    "/auth/login",
    "/auth/password",
    "/auth/profile",
  ].includes(pathname);

  return (
    <>
      {isAuthPage ? (
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
