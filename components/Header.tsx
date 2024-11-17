// Header.tsx

'use client';

import React from 'react';
import { ModeToggle } from '@/components/ui/button_thema'; // Ajuste conforme sua implementação

export default function Header() {
  return (
    <header className="sticky top-0 z-50 w-full h-14 border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 dark:border-border">
      <div className="flex h-14 items-center px-4">
        <div className="flex flex-1 items-center justify-between gap-2 md:justify-end">
          <ModeToggle />
        </div>
      </div>
    </header>
  );
}
