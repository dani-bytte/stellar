// app/tickets/page.tsx
"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";
import { flexRender } from "@tanstack/react-table";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";


import { API_ENDPOINTS } from "@/lib/constants";
import { APP_ROUTES } from "@/lib/routes";
import { LOCAL_STORAGE_KEYS } from "@/lib/constants";

// Ticket type definition
type Ticket = {
  _id: string;
  ticket: string;
  service: {
    _id: string;
    name: string;
    category: {
      _id: string;
      name: string;
    };
  };
  client: string;
  email: string;
  startDate: string;
  endDate: string;
  status: "andamento" | "finalizado";
  payment: "pendente" | "completo";
  proofUrl: string | null;
  createdBy: {
    _id: string;
    username: string;
  };
};

type Service = {
  _id: string;
  name: string;
  dueDate: number;
  category: {
    _id: string;
    name: string;
  };
};

interface NewTicket {
  ticket: string;
  serviceId: string;
  client: string;
  email: string;
  startDate: string;
  endDate: string;
  discountId?: string; // Optional discount
  proof?: File;
}


// Add new type for Discount
type Discount = {
  _id: string;
  cargo: string;
  desconto: number;
  visivel: boolean;
};

export function TicketTable() {
  const [data, setData] = useState<Ticket[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    service_name: false,
    startDate: false,
    service: false,
    client: false,
  });

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const [rowSelection, setRowSelection] = React.useState<Record<string, boolean>>({});

  const [discounts, setDiscounts] = useState<Discount[]>([]);

  // Fetch functions
  const fetchTickets = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) throw new Error("No token found");

      // Usar API_ENDPOINTS ao invés da rota hardcoded
      const response = await fetch(API_ENDPOINTS.TICKETS.LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Failed to fetch tickets");

      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchServices = useCallback(async () => {
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) throw new Error("Token não encontrado");

      // Usando a constante centralizada ao invés do URL hardcoded
      const response = await fetch(API_ENDPOINTS.TICKETS.SERVICES.LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expirado, redirecione para login
        localStorage.removeItem(LOCAL_STORAGE_KEYS.TOKEN);
        window.location.href = APP_ROUTES.AUTH.LOGIN;
        return;
      }

      if (!response.ok) {
        throw new Error("Falha ao buscar serviços");
      }

      const servicesData = await response.json();
      setServices(servicesData);
    } catch (error) {
      console.error("Erro ao buscar serviços:", error);
      setServices([]); // Garante que services seja um array
      toast.error("Falha ao carregar serviços");
    }
  }, []);

  // Add fetchDiscounts function
  const fetchDiscounts = useCallback(async () => {
    try {
      const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
      if (!token) throw new Error("Token não encontrado");
      
      // Usar API_ENDPOINTS ao invés da rota hardcoded
      const response = await fetch(API_ENDPOINTS.TICKETS.DISCOUNTS.LIST, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) throw new Error("Failed to fetch discounts");
      const discountData = await response.json();
      setDiscounts(discountData.filter((d: Discount) => d.visivel));
    } catch (error) {
      console.error("Error fetching discounts:", error);
      toast.error("Failed to load discounts");
    }
  }, []);

  // Update useEffect
  useEffect(() => {
    Promise.all([fetchServices(), fetchDiscounts(), fetchTickets()]).catch(
      (error) => {
        console.error("Error loading data:", error);
        setLoading(false);
      },
    );
  }, [fetchServices, fetchDiscounts, fetchTickets]);
  
  // Add pagination state
  const [pagination, setPagination] = React.useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Table definition
  const columns = React.useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: "ticket",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Ticket
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "service",
        header: "Service",
        cell: ({ row }) => row.original.service.name,
      },
      {
        accessorKey: "client",
        header: "Client",
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "startDate",
        header: "Start Date",
        cell: ({ row }) => new Date(row.original.startDate).toLocaleDateString(),
      },
      {
        accessorKey: "endDate",
        header: "End Date",
        cell: ({ row }) => new Date(row.original.endDate).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.status === "andamento" ? "default" : "secondary"}>
            {row.original.status === "andamento" ? "Em andamento" : "Finalizado"}
          </Badge>
        ),
      },
      {
        accessorKey: "payment",
        header: "Payment",
        cell: ({ row }) => (
          <Badge variant={row.original.payment === "pendente" ? "outline" : "default"}>
            {row.original.payment === "pendente" ? "Pendente" : "Completo"}
          </Badge>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      pagination,
    },
    pageCount: Math.ceil(data.length / 10),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });
  
  // Adicionando uma interface adequada para o CreateTicketDialog
  interface CreateTicketDialogProps {
    open: boolean;
    onClose: () => void;
    services: Service[];
    discounts: Discount[];
    onTicketCreated: () => void;
  }

  // Renomeando para não usar underscore no nome (seguindo convenção de React)
  const CreateTicketDialog: React.FC<CreateTicketDialogProps> = ({
    open,
    onClose,
    services,
    discounts,
    onTicketCreated,
  }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newTicket, setNewTicket] = useState<NewTicket>({
      ticket: "",
      serviceId: "",
      client: "",
      email: "",
      startDate: "",
      endDate: "",
      discountId: undefined,
      proof: undefined,
    });

    const handleTicketChange = (
      field: keyof NewTicket,
      value: string | File | undefined,
    ) => {
      setNewTicket((prev: NewTicket) => ({
        ...prev,
        [field]: value,
      }));
    };

    const handleServiceChange = (value: string) => {
      setNewTicket((prev: NewTicket) => ({
        ...prev,
        serviceId: value,
      }));
    };

    const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewTicket((prev: NewTicket) => ({
        ...prev,
        startDate: e.target.value,
      }));
    };

    const handleCreateTicket = async () => {
      setIsSubmitting(true);
      try {
        const token = localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN);
        const formData = new FormData();

        formData.append("ticket", newTicket.ticket);
        formData.append("serviceId", newTicket.serviceId);
        formData.append("client", newTicket.client);
        formData.append("email", newTicket.email);
        formData.append("startDate", newTicket.startDate);

        if (newTicket.discountId) {
          formData.append("discountId", newTicket.discountId);
        }

        if (newTicket.proof) {
          formData.append("proof", newTicket.proof);
        }

        // Submit the form data to the API using o API_ENDPOINTS
        const response = await fetch(API_ENDPOINTS.TICKETS.NEW, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Failed to create ticket");
        }

        // Handle success
        onTicketCreated();
        setNewTicket({
          ticket: "",
          serviceId: "",
          client: "",
          email: "",
          startDate: "",
          endDate: "",
          discountId: undefined,
          proof: undefined,
        });
        toast.success("Ticket created successfully");
        onClose();
      } catch (error) {
        console.error(error);
        toast.error("Error creating ticket");
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
          </DialogHeader>
          <form>
            <div className="grid gap-4 py-4">
              {/* Ticket Number */}
              <div className="space-y-2">
                <Label htmlFor="ticket">Ticket Number</Label>
                <Input
                  id="ticket"
                  value={newTicket.ticket}
                  onChange={(e) => handleTicketChange("ticket", e.target.value)}
                  required
                />
              </div>

              {/* Client Name */}
              <div className="space-y-2">
                <Label htmlFor="client">Client Name</Label>
                <Input
                  id="client"
                  value={newTicket.client}
                  onChange={(e) => handleTicketChange("client", e.target.value)}
                  required
                />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newTicket.email}
                  onChange={(e) => handleTicketChange("email", e.target.value)}
                  required
                />
              </div>

              {/* Start Date */}
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newTicket.startDate}
                  onChange={handleStartDateChange}
                  required
                />
              </div>

              {/* Service Selection */}
              <div className="space-y-2">
                <Label htmlFor="service">Service</Label>
                <Select
                  value={newTicket.serviceId}
                  onValueChange={handleServiceChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service._id} value={service._id}>
                        {service.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Discount Selection */}
              <div className="space-y-2">
                <Label htmlFor="discount">Discount</Label>
                <Select
                  value={newTicket.discountId || "no-discount"}
                  onValueChange={(value) =>
                    handleTicketChange(
                      "discountId",
                      value === "no-discount" ? undefined : value,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a discount" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no-discount">No Discount</SelectItem>
                    {discounts && discounts.map((discount) => (
                      <SelectItem key={discount._id} value={discount._id}>
                        {discount.cargo} ({discount.desconto}%)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Proof File Upload */}
              <div className="space-y-2">
                <Label htmlFor="proof">Proof (Optional)</Label>
                <Input
                  id="proof"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) =>
                    handleTicketChange("proof", e.target.files?.[0])
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                onClick={handleCreateTicket}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Creating..." : "Create Ticket"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <div>
      {/* Create ticket dialog */}
      <CreateTicketDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        services={services}
        discounts={discounts}
        onTicketCreated={fetchTickets}
      />
      
      <div className="flex items-center py-4 space-x-4">
        <Input
          placeholder="Filter tickets..."
          value={(table.getColumn("ticket")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("ticket")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={
            (table.getColumn("service")?.getFilterValue() as string) ?? "all"
          }
          onValueChange={(value) =>
            table.getColumn("service")?.setFilterValue(value)
          }
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by service" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All services</SelectItem>
            {Array.from(new Set(services.map((s) => s.category.name))).map(
              (categoryName) => (
                <SelectGroup key={categoryName}>
                  <SelectLabel>{categoryName}</SelectLabel>
                  {services
                    .filter((service) => service.category.name === categoryName)
                    .map((service) => (
                      <SelectItem key={service._id} value={service._id}>
                        {service.name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              ),
            )}
          </SelectContent>
        </Select>
        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
          Create New Ticket
        </Button>
        
        {/* Column filter dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  Loading tickets...
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Pagination */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
          <Pagination className="mt-4 select-none">
            <PaginationContent>
              <PaginationItem>
                {table.getCanPreviousPage() ? (
                  <PaginationPrevious onClick={() => table.previousPage()} className="cursor-pointer" />
                ) : (
                  <PaginationPrevious
                    onClick={() => {}}
                    className="pointer-events-none opacity-50"
                  />
                )}
              </PaginationItem>
              {Array.from({length: table.getPageCount()}, (_, i) => i + 1)
                .filter(page => {
                  const currentPage = table.getState().pagination.pageIndex + 1;
                  // Show first, last, current, and pages close to current
                  return page === 1 || 
                         page === table.getPageCount() || 
                         Math.abs(page - currentPage) <= 1;
                })
                .map((page, i, array) => {
                  const currentPage = table.getState().pagination.pageIndex + 1;
                  
                  // Add ellipsis if there's a gap in page numbers
                  if (i > 0 && page - array[i-1] > 1) {
                    return (
                      <React.Fragment key={`ellipsis-${page}`}>
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                        <PaginationItem key={page}>
                          <PaginationLink
                            isActive={currentPage === page}
                            onClick={() => table.setPageIndex(page - 1)}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      </React.Fragment>
                    );
                  }
                  
                  return (
                    <PaginationItem key={page}>
                      <PaginationLink
                        isActive={currentPage === page}
                        onClick={() => table.setPageIndex(page - 1)}
                        className="cursor-pointer"
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
              <PaginationItem>
                {table.getCanNextPage() ? (
                  <PaginationNext onClick={() => table.nextPage()} className="cursor-pointer" />
                ) : (
                  <PaginationNext
                    onClick={() => {}}
                    className="pointer-events-none opacity-50"
                  />
                )}
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
