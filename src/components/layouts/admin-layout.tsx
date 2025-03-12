"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface AdminLayoutProps {
  children: React.ReactNode;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href: string }[];
  actions?: React.ReactNode;
  contentClassName?: string;
}

export function AdminLayout({
  children,
  title,
  description,
  breadcrumbs,
  actions,
  contentClassName,
}: AdminLayoutProps) {
  const router = useRouter();
  const [role, setRole] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const storedRole = localStorage.getItem("role");
    
    if (storedRole !== "admin") {
      router.push("/login");
    } else {
      setRole(storedRole);
      setLoading(false);
    }
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner size="lg" text="Carregando..." />
      </div>
    );
  }

  if (role !== "admin") {
    return null;
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-6">
      <div className="mx-auto w-full max-w-6xl">
        <div className="flex flex-col gap-2 mb-6">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={index}>
                  {index > 0 && <span>/</span>}
                  <button 
                    onClick={() => router.push(crumb.href)} 
                    className="hover:text-foreground hover:underline"
                  >
                    {crumb.label}
                  </button>
                </React.Fragment>
              ))}
            </nav>
          )}
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{title}</h1>
              {description && (
                <p className="text-muted-foreground">{description}</p>
              )}
            </div>
            {actions && (
              <div className="flex items-center gap-2">
                {actions}
              </div>
            )}
          </div>
        </div>
        
        <Card className={cn("shadow-sm", contentClassName)}>
          <CardContent className="p-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}
