"use client";

import * as React from "react";
import { toast } from "sonner";
import { authenticatedFetch } from "@/utils/authUtils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, Check } from "lucide-react";
import Image from "next/image";
import { API_ENDPOINTS } from "@/lib/constants";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";

interface Payment {
  ticketNumber: string;
  userName: string;
  finalValue: number;
  discountApplied: string;  // Por exemplo: "10%"
  repasse: string;          // Por exemplo: "5%" ou "N/A"
  proofUrl: string;  // URL para a imagem de comprovante ou null se não foi fornecida
}

interface Discount {
  _id: string;
  cargo: string;
  desconto: number;
  visivel: boolean;
}

interface PaymentTableProps {
  data: Payment[];
  isLoading: boolean;
  fetchPayments: () => void;
}

interface ConfirmPaymentData {
  ticketId: string;
  finalValue: number;
  newDiscountId?: string;
}

const PaymentTable: React.FC<PaymentTableProps> = ({
  data,
  isLoading,
  fetchPayments,
}) => {
  const [selectedPayment, setSelectedPayment] = React.useState<Payment | null>(
    null,
  );
  const [confirmDialog, setConfirmDialog] = React.useState(false);
  const [selectedDiscount, setSelectedDiscount] =
    React.useState<string>("no-discount");
  const [discounts, setDiscounts] = React.useState<Discount[]>([]);
  const [totalValue, setTotalValue] = React.useState(0);
  const [proofDialogOpen, setProofDialogOpen] = React.useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = React.useState<string | null>(
    null,
  );
  const [calculatedValue, setCalculatedValue] = React.useState<number>(0);
  const [searchValue, setSearchValue] = React.useState<string>("");

  const fetchDiscounts = async () => {
    try {
      // authenticatedFetch already returns parsed JSON data when successful
      const data = await authenticatedFetch<Discount[]>(API_ENDPOINTS.TICKETS.DISCOUNTS.LIST);
      setDiscounts(data.filter((d: Discount) => d.visivel));
    } catch (error) {
      console.error("Error fetching discounts:", error);
      // The authenticatedFetch utility will already handle token errors
      toast.error("Failed to fetch discounts");
    }
  };

  React.useEffect(() => {
    fetchDiscounts();
  }, []);

  // Calcular o valor total sempre que os dados são alterados
  React.useEffect(() => {
    const total = data.reduce((sum, p) => sum + (p.finalValue || 0), 0);
    setTotalValue(total);
  }, [data]);

  const calculateFinalValue = (value: number, discountId?: string) => {
    if (!discountId || discountId === "no-discount") return value;

    const discount = discounts.find((d) => d._id === discountId);
    if (!discount) return value;

    return value * (1 - discount.desconto / 100);
  };

  const handleConfirmPayment = async () => {
    try {
      if (!selectedPayment) return;

      // O authenticatedFetch já lida com o processamento de erros e retorna dados JSON
      await authenticatedFetch<{ success: boolean }>(API_ENDPOINTS.ADMIN.PAYMENTS.CONFIRM, {
        method: "POST",
        body: JSON.stringify({
          ticketId: selectedPayment.ticketNumber,
          finalValue: calculatedValue || selectedPayment.finalValue,
          newDiscountId:
            selectedDiscount !== "no-discount" ? selectedDiscount : undefined,
        } as ConfirmPaymentData),
      });

      toast.success("Payment confirmed successfully");

      fetchPayments();
      setConfirmDialog(false);
      setSelectedPayment(null);
    } catch (error) {
      console.error("Error confirming payment:", error);
      if (!(error instanceof Error && error.message === "Token não encontrado")) {
        toast.error(
          error instanceof Error ? error.message : "Failed to confirm payment"
        );
      }
    }
  };

  const handleViewProof = async (proofUrl: string) => {
    try {
      const encodedFileName = encodeURIComponent(proofUrl);
      
      // Para imagens, precisamos usar fetch diretamente com o cabeçalho de autorização
      // já que authenticatedFetch é otimizado para respostas JSON
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");
      
      const response = await fetch(API_ENDPOINTS.TICKETS.PROOF_IMAGE(encodedFileName), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to load proof image: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setSelectedProofUrl(imageUrl);
      setProofDialogOpen(true);
    } catch (error) {
      console.error("Error loading proof image:", error);
      toast.error("Failed to load proof image");
    }
  };

  // Definindo as colunas para o DataTable
  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "ticketNumber",
      header: "Ticket Number",
      cell: ({ row }) => <div>{row.getValue("ticketNumber")}</div>,
    },
    {
      accessorKey: "userName",
      header: "User",
      cell: ({ row }) => <div>{row.getValue("userName")}</div>,
      filterFn: (row, id, value) => {
        const val = row.getValue(id);
        return typeof val === 'string' && val.toLowerCase().includes(value.toLowerCase());
      },
    },
    {
      accessorKey: "finalValue",
      header: "Value",
      cell: ({ row }) => {
        const value = row.getValue<number>("finalValue");
        return <div>R$ {value.toFixed(2)}</div>;
      },
    },
    {
      accessorKey: "discountApplied",
      header: "Discount",
    },
    {
      accessorKey: "repasse",
      header: "Commission",
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const payment = row.original;
        return (
          <div className="flex gap-2">
            <Button
              onClick={() => {
                setSelectedPayment(payment);
                setSelectedDiscount("no-discount");
                setCalculatedValue(payment.finalValue);
                setConfirmDialog(true);
              }}
            >
              Confirm
            </Button>
            {payment.proofUrl && (
              <Button
                variant="outline"
                size="icon"
                onClick={() => handleViewProof(payment.proofUrl as string)}
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Filter by username..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-[300px]"
        />
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
        </div>
      </div>

      <DataTable 
        columns={columns} 
        data={data}
        isLoading={isLoading}
        searchColumn="userName"
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        pageSize={10}
        pageSizeOptions={[10, 20, 30, 50]}
        ariaLabel="Payment table"
      />

      {/* Confirm Dialog */}
      <Dialog open={confirmDialog} onOpenChange={setConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Payment</DialogTitle>
            <DialogDescription>
              Validate payment details and apply discount if needed
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Original Value</Label>
              <Input
                type="number"
                value={selectedPayment?.finalValue || 0}
                disabled
              />
            </div>

            <div className="grid gap-2">
              <Label>Select Discount</Label>
              <Select
                value={selectedDiscount}
                onValueChange={(value) => {
                  setSelectedDiscount(value);
                  if (selectedPayment) {
                    setCalculatedValue(
                      calculateFinalValue(selectedPayment.finalValue, value),
                    );
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select discount" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no-discount">No Discount</SelectItem>
                  {discounts.map((discount) => (
                    <SelectItem key={discount._id} value={discount._id}>
                      {discount.cargo} ({discount.desconto}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Final Value</Label>
              <Input
                type="number"
                value={calculatedValue || selectedPayment?.finalValue || 0}
                onChange={(e) => setCalculatedValue(Number(e.target.value))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleConfirmPayment}>
              <Check className="mr-2 h-4 w-4" />
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Proof Dialog */}
      <Dialog open={proofDialogOpen} onOpenChange={setProofDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Payment Proof</DialogTitle>
          </DialogHeader>
          {selectedProofUrl && (
            <div className="relative w-full h-full">
              <Image
                src={selectedProofUrl}
                alt="Payment proof"
                width={400}
                height={600}
                className="object-contain w-full h-auto max-h-144"
                onError={() => {
                  toast.error("Failed to load image");
                  setProofDialogOpen(false);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentTable;
