"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { API_ENDPOINTS } from "@/lib/constants";

interface ProofImageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proofUrl: string | null;
  title?: string;
}

export function ProofImageDialog({
  open,
  onOpenChange,
  proofUrl,
  title = "Comprovante",
}: ProofImageDialogProps) {
  const [loading, setLoading] = useState(true);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!proofUrl || !open) {
      return;
    }
    
    const fetchImage = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const token = localStorage.getItem("token");
        const encodedFileName = encodeURIComponent(proofUrl);

        const response = await fetch(
          API_ENDPOINTS.TICKETS.PROOF_IMAGE(encodedFileName),
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erro ao carregar a imagem");
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrl(url);
      } catch (err) {
        console.error("Erro:", err);
        setError("Falha ao carregar a imagem");
        toast.error("Falha ao carregar a imagem do comprovante");
      } finally {
        setLoading(false);
      }
    };
    
    fetchImage();
    
    return () => {
      // Limpe o URL quando o componente for desmontado ou o diálogo for fechado
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [open, proofUrl, imageUrl]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        
        <div className="relative w-full flex items-center justify-center min-h-[400px]">
          {loading && (
            <LoadingSpinner text="Carregando imagem..." />
          )}
          
          {error && !loading && (
            <div className="text-center text-red-500">
              <p>{error}</p>
              <button 
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  // Forçar recarregar a imagem
                  if (imageUrl) {
                    URL.revokeObjectURL(imageUrl);
                    setImageUrl(null);
                  }
                }}
                className="mt-2 text-sm underline text-primary"
              >
                Tentar novamente
              </button>
            </div>
          )}
          
          {imageUrl && !loading && !error && (
            <Image
              src={imageUrl}
              alt="Comprovante"
              width={600}
              height={800}
              className="object-contain max-h-[70vh]"
              onError={() => {
                setError("Não foi possível exibir a imagem");
                toast.error("Erro ao exibir a imagem");
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
