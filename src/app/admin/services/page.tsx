"use client";

import * as React from "react";
import withAuth from "@/components/withAuth";
import ServiceTable from "./newservice";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { useState } from "react";
import { ServiceFormSheet } from "./ServiceFormSheet";

const ServicesPage = () => {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [open, setOpen] = useState(false);

  const fetchServices = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token found");

      const response = await fetch("/api/tickets/services/list", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch services");
      const services = await response.json();
      setData(services);
    } catch (error) {
      console.error("Error fetching services:", error);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchServices();
  }, []);

  return (
    <AdminLayout 
      title="Available Services"
      description="Manage the services available in the system"
      breadcrumbs={[
        { label: "Dashboard", href: "/admin" },
        { label: "Services", href: "/admin/services" }
      ]}
      actions={
        <Button onClick={() => setOpen(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Service
        </Button>
      }
    >
      <ServiceTable
        data={data}
        isLoading={isLoading}
        fetchServices={fetchServices}
        onCreateNew={() => setOpen(true)}
      />
      
      <ServiceFormSheet
        open={open}
        onOpenChange={setOpen}
        onSuccess={() => {
          fetchServices();
        }}
      />
    </AdminLayout>
  );
};

export default withAuth(ServicesPage, { requiredRole: "admin" });
