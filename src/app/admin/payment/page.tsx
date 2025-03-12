"use client";

import * as React from "react";
import withAuth from "@/components/withAuth";
import PaymentTable from "./payments";

interface Payment {
  _id: string;
  ticketNumber: string;
  userName: string;
  finalValue: number;
  discountApplied: string;
  repasse: string;
  ticket: string;
  client: string;
  value: number;
  status: string;
  proofUrl: string;
}

const PaymentsPage = () => {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch("/api/home/admin/payments/list", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const paymentData = await response.json();
      console.log("Fetched payments:", paymentData); // Debug log
      setPayments(paymentData);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchPayments();
  }, []);

  // Add debug useEffect
  React.useEffect(() => {
    console.log("Current payments:", payments); // Debug log
  }, [payments]);

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-10">
      <div className="mx-auto h-24 w-full max-w-5xl">
        <h1 className="text-3xl font-bold mb-3">Payment Management</h1>
      </div>
      <div className="mx-auto w-full max-w-5xl">
        <PaymentTable
          data={payments}
          isLoading={isLoading}
          fetchPayments={fetchPayments}
        />
      </div>
    </div>
  );
};

export default withAuth(PaymentsPage, { requiredRole: "admin" });
