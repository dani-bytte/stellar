// app/tickets/page.tsx
'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { flexRender } from '@tanstack/react-table';
import { ArrowUpDown, MoreHorizontal, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import Image from 'next/image';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Label } from '@/components/ui';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
  status: 'andamento' | 'finalizado';
  payment: 'pendente' | 'completo';
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

type NewTicket = {
  ticket: string;
  serviceId: string;
  client: string;
  email: string;
  startDate: string;
  endDate: string;
  proof: File | null;
};

export function TicketTable() {
  const { toast } = useToast();
  const [data, setData] = useState<Ticket[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    service_name: false,
    startDate: false,
    service: false,
    client: false,
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTicket, setNewTicket] = useState<NewTicket>({
    ticket: '',
    serviceId: '',
    client: '',
    email: '',
    startDate: '',
    endDate: '',
    proof: null,
  });
  const [rowSelection, setRowSelection] = React.useState({});
  const [ticketToDelete, setTicketToDelete] = useState<Ticket | null>(null);

  const isMounted = useRef(false);

  const fetchTickets = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tickets/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const tickets = await response.json();

      //console.log('Tickets recebidos:', tickets); // Adicione este log

      setData(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      toast({
        title: 'Error',
        description: 'Failed to load tickets',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchServices = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token não encontrado');

      const response = await fetch('/api/tickets/services/list', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        // Token expirado, redirecione para login ou trate conforme necessário
        console.error('Token expirado');
        // Por exemplo, você pode limpar o token e redirecionar:
        localStorage.removeItem('token');
        window.location.href = '/login';
        return;
      }

      if (!response.ok) {
        throw new Error('Falha ao buscar serviços');
      }

      const servicesData = await response.json();
      setServices(servicesData);
    } catch (error) {
      console.error('Erro ao buscar serviços:', error);
      setServices([]); // Garante que services seja um array
      toast({
        title: 'Erro',
        description: 'Falha ao carregar serviços',
        variant: 'destructive',
      });
    }
  }, [toast]);

  useEffect(() => {
    if (!isMounted.current) {
      fetchTickets();
      fetchServices();
      isMounted.current = true;
    }
  }, [fetchTickets, fetchServices]);

  const handleCreateTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('ticket', newTicket.ticket);
      formData.append('serviceId', newTicket.serviceId);
      formData.append('client', newTicket.client);
      formData.append('email', newTicket.email);
      formData.append('startDate', newTicket.startDate);
      formData.append('endDate', newTicket.endDate);
      if (newTicket.proof) {
        formData.append('proof', newTicket.proof);
      }

      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      const result = await response.json();
      console.log('Ticket criado:', result);

      setIsDialogOpen(false);
      setNewTicket({
        ticket: '',
        serviceId: '',
        client: '',
        email: '',
        startDate: '',
        endDate: '',
        proof: null,
      });
      await fetchTickets();

      toast({
        title: 'Success',
        description: 'Ticket created successfully',
      });
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const handleServiceChange = (value: string) => {
    setNewTicket({ ...newTicket, serviceId: value });
  };

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const startDateStr = e.target.value;
    const selectedService = services.find((s) => s._id === newTicket.serviceId);
    let endDateStr = newTicket.endDate;

    if (selectedService && startDateStr) {
      const startDate = new Date(startDateStr);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + selectedService.dueDate);
      endDateStr = endDate.toISOString().split('T')[0];
    }

    setNewTicket({
      ...newTicket,
      startDate: startDateStr,
      endDate: endDateStr,
    });
  };

  const handleHideTicket = async (ticketId: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/tickets/${ticketId}/hide`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to hide ticket');
      }

      toast({
        title: 'Success',
        description: 'Ticket hidden successfully',
      });

      // Refresh tickets list
      await fetchTickets();
    } catch (error) {
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to hide ticket',
        variant: 'destructive',
      });
    } finally {
      setTicketToDelete(null);
    }
  };

  // Update your column definitions for consistency
  const columns: ColumnDef<Ticket>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: 'ticket',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Ticket
            <ArrowUpDown />
          </Button>
        );
      },
    },
    {
      accessorKey: 'client',
      header: 'Client',
    },
    {
      accessorKey: 'service',
      header: 'Service',
      cell: ({ row }) => {
        const service = row.original.service;
        return (
          <div className="flex flex-col">
            <span>{service?.name}</span>
            <span className="text-xs text-muted-foreground">
              {service?.category?.name}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: 'createdBy',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Created
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        // Acessa `createdBy.username` do objeto aninhado
        const createdBy = row.original.createdBy;
        return createdBy ? createdBy.username : 'Unknown';
      },
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => {
        const startDate = row.original.startDate;
        return startDate
          ? new Date(startDate).toLocaleDateString() // Formata a data
          : 'No Start Date';
      },
    },
    {
      accessorKey: 'endDate',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            End Date
            <ArrowUpDown />
          </Button>
        );
      },
      cell: ({ row }) => {
        const endDate = row.original.endDate;
        return endDate
          ? new Date(endDate).toLocaleDateString() // Formata a data
          : 'No End Date';
      },
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span
            className={`px-2 py-1 rounded-full ${
              status === 'finalizado'
                ? 'bg-green-100 text-green-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}
          >
            {status}
          </span>
        );
      },
    },
    {
      accessorKey: 'payment',
      header: 'Payment',
      cell: ({ row }) => {
        const payment = row.original.payment;
        return (
          <span
            className={`px-2 py-1 rounded-full ${
              payment === 'completo'
                ? 'bg-green-100 text-green-800'
                : 'bg-red-100 text-red-800'
            }`}
          >
            {payment}
          </span>
        );
      },
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const ticket = row.original;

        const handleViewProof = async (ticket: Ticket) => {
          if (!ticket.proofUrl) return;

          try {
            const token = localStorage.getItem('token');
            const encodedFileName = encodeURIComponent(ticket.proofUrl);

            // Faça uma requisição para o endpoint que retorna a imagem
            const response = await fetch(
              `/api/tickets/proof-image/${encodedFileName}`,
              {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error('Erro ao carregar a imagem');
            }

            // Crie um blob da imagem
            const blob = await response.blob();
            const imageUrl = URL.createObjectURL(blob);

            // Exiba a imagem no dialog
            setProofUrl(imageUrl);
            setDialogOpen(true);
          } catch (error) {
            console.error('Erro:', error);
            toast({
              title: 'Erro',
              description: 'Falha ao abrir o comprovante',
              variant: 'destructive',
            });
          }
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(ticket._id)}
              >
                Copy Ticket ID
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {ticket.proofUrl && (
                <DropdownMenuItem onClick={() => handleViewProof(ticket)}>
                  View Proof
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setTicketToDelete(ticket)}
                className="text-red-600"
              >
                Hide Ticket
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    filterFns: {
      service: (row, id, filterValue) => {
        if (filterValue === 'all') return true;
        return row.original.service._id === filterValue;
      },
    },
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  if (loading) {
    return <div>Loading tickets...</div>;
  }

  return (
    <div className="w-full">
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Comprovante</DialogTitle>
            <DialogDescription></DialogDescription>
          </DialogHeader>
          {proofUrl && (
            <div className="relative w-full h-full">
              <Image
                src={proofUrl}
                alt="Proof document"
                width={400}
                height={600}
                className="object-contain w-full h-auto max-h-144"
                onError={() => {
                  toast({
                    title: 'Error',
                    description: 'Failed to load image',
                    variant: 'destructive',
                  });
                  setDialogOpen(false);
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
      {ticketToDelete && (
        <AlertDialog
          open={!!ticketToDelete}
          onOpenChange={() => setTicketToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will hide the ticket{' '}
                <span className="font-semibold">#{ticketToDelete.ticket}</span>.
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => handleHideTicket(ticketToDelete._id)}
                className="bg-red-600 hover:bg-red-700"
              >
                Hide Ticket
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
      <div className="flex items-center py-4 space-x-4">
        <Input
          placeholder="Filter tickets..."
          value={(table.getColumn('ticket')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('ticket')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <Select
          value={
            (table.getColumn('service')?.getFilterValue() as string) ?? 'all'
          }
          onValueChange={(value) =>
            table.getColumn('service')?.setFilterValue(value)
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
              )
            )}
          </SelectContent>
        </Select>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Create New Ticket</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Ticket</DialogTitle>
              <DialogDescription>
                This form allows you to create a new ticket.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {/* Ticket ID */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="ticket" className="text-right">
                  Ticket ID
                </label>
                <Input
                  id="ticket"
                  value={newTicket.ticket}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, ticket: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              {/* Service ID */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="serviceId" className="text-right">
                  Service
                </Label>
                <div className="col-span-3">
                  <Select
                    value={newTicket.serviceId}
                    onValueChange={handleServiceChange}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a service" />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from(
                        new Set(services.map((s) => s.category.name))
                      ).map((categoryName) => (
                        <SelectGroup key={categoryName}>
                          <SelectLabel>{categoryName}</SelectLabel>
                          {services
                            .filter(
                              (service) =>
                                service.category.name === categoryName
                            )
                            .map((service) => (
                              <SelectItem key={service._id} value={service._id}>
                                {service.name}
                              </SelectItem>
                            ))}
                        </SelectGroup>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Client */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="client" className="text-right">
                  Client
                </Label>
                <Input
                  id="client"
                  value={newTicket.client}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, client: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              {/* Email */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  value={newTicket.email}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, email: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              {/* Start Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="startDate" className="text-right">
                  Start Date
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={newTicket.startDate}
                  onChange={handleStartDateChange}
                  className="col-span-3"
                />
              </div>
              {/* End Date */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="endDate" className="text-right">
                  End Date
                </label>
                <Input
                  id="endDate"
                  type="date"
                  value={newTicket.endDate}
                  readOnly
                  className="col-span-3"
                />
              </div>
              {/* Proof */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="proof" className="text-right">
                  Proof
                </label>
                <Input
                  id="proof"
                  type="file"
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      proof: e.target.files?.[0] || null,
                    })
                  }
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" onClick={handleCreateTicket}>
                Submit
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="px-1 py-1 text-center">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Sem resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} of{' '}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

export default TicketTable;
