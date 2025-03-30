"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ServiceFormSheet } from "./ServiceFormSheet";
import { API_ENDPOINTS, LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { toast } from "sonner";
import { AlertTriangle, Edit, Loader2, PlusCircle, Trash } from "lucide-react";
import { AdminLayout } from "@/components/layouts/admin-layout";
import withAuth from "@/components/withAuth";

interface Service {
  _id: string;
  name: string;
  category: {
    _id: string;
    name: string;
  };
  dueDate: number;
  value: number;
}

interface ServiceTableProps {
  data: Service[];
  isLoading: boolean;
  fetchServices: () => Promise<void>;
  onCreateNew: () => void;
}

// Componente ServiceTable para exibir os serviços em tabela
const ServiceTable: React.FC<ServiceTableProps> = ({ data, isLoading, onCreateNew }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Serviços</CardTitle>
          <CardDescription>Lista de serviços disponíveis</CardDescription>
        </div>
        <Button onClick={onCreateNew}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Duração (dias)</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                </TableCell>
              </TableRow>
            ) : data.length > 0 ? (
              data.map((service: Service) => (
                <TableRow key={service._id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>{service.category?.name || "Sem categoria"}</TableCell>
                  <TableCell>{service.dueDate} dias</TableCell>
                  <TableCell>{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(service.value)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-destructive">
                      <Trash className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <AlertTriangle className="h-8 w-8 mb-2" />
                    <span>Nenhum serviço encontrado.</span>
                    <Button 
                      variant="link" 
                      onClick={onCreateNew}
                      className="mt-2"
                    >
                      Criar novo serviço
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

const ServicesPage = () => {
  const [data, setData] = React.useState<Service[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [open, setOpen] = useState(false);

  const fetchServices = async (): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await fetch(
        API_ENDPOINTS.TICKETS.SERVICES.LIST, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN)}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error("Falha ao carregar os serviços");
      }
      
      const services = await response.json();
      setData(services);
    } catch (error) {
      toast.error("Falha ao carregar os serviços");
      console.error("Erro ao buscar serviços:", error);
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
