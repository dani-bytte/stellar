/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import * as React from "react";
import withAuth from "@/components/withAuth";
import DiscountTable from "./discounttable";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { API_ENDPOINTS, LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { authenticatedFetch } from "@/utils/authUtils";

interface Discount {
  _id: string;
  cargo: string;
  desconto: number;
  visivel: boolean;
}

const DiscountsPage = () => {
  const [discounts, setDiscounts] = React.useState<Discount[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchDiscounts = async () => {
    setIsLoading(true);
    try {
      // Usando nosso novo utility para requisições autenticadas
      // Observe como o código ficou mais limpo e simples
      const discountData = await authenticatedFetch<Discount[]>(API_ENDPOINTS.TICKETS.DISCOUNTS.LIST);
      setDiscounts(discountData);
    } catch (_) { // Usando underscore para indicar parâmetro não utilizado
      // Erro já tratado pelo authenticatedFetch/fetchWithErrorHandling
      toast.error("Falha ao carregar os descontos");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchDiscounts();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-10">
      <div className="mx-auto h-24 w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-3">Discount Management</h1>
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <DiscountTable
          data={discounts}
          isLoading={isLoading}
          fetchDiscounts={fetchDiscounts}
        />
      </div>
    </div>
  );
};

export default withAuth(DiscountsPage, { requiredRole: "admin" });
