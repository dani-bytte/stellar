"use client";

import * as React from "react";
import { toast } from "sonner";
import { authenticatedFetch } from "@/utils/authUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import Image from "next/image";
import { Eye, Check } from "lucide-react"; // For view icon
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_ENDPOINTS } from "@/lib/constants";

interface Payment {
  _id: string;
  ticketNumber: string;
  userName: string;
  finalValue: number;
  discountApplied: string;
  repasse: string;
  proofUrl: string;
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
  const [pageSize, setPageSize] = React.useState(10);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [userFilter, setUserFilter] = React.useState("all");
  const [totalValue, setTotalValue] = React.useState(0);
  const [proofDialogOpen, setProofDialogOpen] = React.useState(false);
  const [selectedProofUrl, setSelectedProofUrl] = React.useState<string | null>(
    null,
  );
  const [calculatedValue, setCalculatedValue] = React.useState<number>(0);

  const fetchDiscounts = async () => {
    try {
      // Usar API_ENDPOINTS ao invés da rota hardcoded
      const response = await authenticatedFetch(API_ENDPOINTS.TICKETS.DISCOUNTS.LIST);
      
      if (!response.ok) throw new Error("Failed to fetch discounts");
      
      const data: Discount[] = await response.json();
      setDiscounts(data.filter((d: Discount) => d.visivel));
    } catch (error) {
      console.error("Error:", error);
      // A mensagem de erro de token será mostrada pelo authenticatedFetch
    }
  };

  React.useEffect(() => {
    fetchDiscounts();
  }, []);

  const calculateFinalValue = (value: number, discountId?: string) => {
    if (!discountId || discountId === "no-discount") return value;

    const discount = discounts.find((d) => d._id === discountId);
    if (!discount) return value;

    return value * (1 - discount.desconto / 100);
  };

  const handleConfirmPayment = async () => {
    try {
      if (!selectedPayment) return;

      // Usar API_ENDPOINTS ao invés da rota hardcoded
      const response = await authenticatedFetch(API_ENDPOINTS.ADMIN.PAYMENTS.CONFIRM, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: selectedPayment.ticketNumber,
          finalValue: calculatedValue || selectedPayment.finalValue,
          newDiscountId:
            selectedDiscount !== "no-discount" ? selectedDiscount : undefined,
        } as ConfirmPaymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to confirm payment");
      }

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

      // Usar API_ENDPOINTS ao invés da rota hardcoded
      const response = await authenticatedFetch(
        API_ENDPOINTS.TICKETS.PROOF_IMAGE(encodedFileName),
        { method: "GET" }
      );

      if (!response.ok) {
        throw new Error("Failed to load proof image");
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setSelectedProofUrl(imageUrl);
      setProofDialogOpen(true);
    } catch (error) {
      console.error("Error:", error);
      if (!(error instanceof Error && error.message === "Token não encontrado")) {
        toast.error("Failed to load proof image");
      }
    }
  };

  // Get unique users for filter
  const uniqueUsers = React.useMemo(() => {
    return ["all", ...Array.from(new Set(data.map((p) => p.userName)))];
  }, [data]);

  // Filter and paginate data
  const filteredData = React.useMemo(() => {
    let filtered = data;
    if (userFilter !== "all") {
      filtered = data.filter((p) => p.userName === userFilter);
    }

    // Calculate total value
    const total = filtered.reduce((sum, p) => sum + (p.finalValue || 0), 0);
    setTotalValue(total);

    // Paginate
    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [data, userFilter, currentPage, pageSize]);

  if (isLoading) {
    return <div>Loading payments...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Select value={userFilter} onValueChange={setUserFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filter by user" />
          </SelectTrigger>
          <SelectContent>
            {uniqueUsers.map((user) => (
              <SelectItem key={user} value={user}>
                {user}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Value</p>
          <p className="text-2xl font-bold">R$ {totalValue.toFixed(2)}</p>
        </div>
      </div>

      <>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket Number</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Discount</TableHead>
              <TableHead>Commission</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  No payments found
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((payment) => (
                <TableRow key={payment._id}>
                  <TableCell>{payment.ticketNumber}</TableCell>
                  <TableCell>{payment.userName}</TableCell>
                  <TableCell>
                    {payment.finalValue
                      ? `R$ ${payment.finalValue.toFixed(2)}`
                      : "N/A"}
                  </TableCell>
                  <TableCell>{payment.discountApplied}</TableCell>
                  <TableCell>{payment.repasse}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          setSelectedPayment(payment);
                          setConfirmDialog(true);
                        }}
                      >
                        Confirm
                      </Button>
                      {payment.proofUrl && (
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => handleViewProof(payment.proofUrl)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </>

      <div className="flex justify-between items-center">
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => setPageSize(Number(value))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[10, 20, 30, 50].map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size} rows
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              {currentPage > 1 && (
                <PaginationPrevious
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                />
              )}
            </PaginationItem>
            <PaginationItem>
              {currentPage * pageSize < data.length && (
                <PaginationNext onClick={() => setCurrentPage((p) => p + 1)} />
              )}
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>

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
