import React from "react";
import { Toaster } from "@/components/ui/sonner";

// Defina os tipos necessários localmente
type ToasterPosition =
  | "top-left"
  | "top-center"
  | "top-right"
  | "bottom-left"
  | "bottom-center"
  | "bottom-right";

interface ToastProviderProps {
  children: React.ReactNode;
  position?: ToasterPosition;
  richColors?: boolean;
  closeButton?: boolean;
  duration?: number;
  theme?: "light" | "dark" | "system";
}

export function ToastProvider({
  children,
  position = "top-right",
  richColors = true,
  closeButton = true,
  duration = 4000,
  theme = "system",
}: ToastProviderProps) {
  return (
    <>
      {children}
      <Toaster
        position={position}
        richColors={richColors}
        closeButton={closeButton}
        duration={duration}
        theme={theme}
      />
    </>
  );
}
