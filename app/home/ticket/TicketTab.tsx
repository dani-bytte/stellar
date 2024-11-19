// app/tickets/page.tsx
'use client';

import * as React from 'react';
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
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

// Ticket type definition
type Ticket = {
  _id: string;
  ticket: string;
  service: {
    _id: string;
    name: string;
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

export function TicketTable() {
  const { toast } = useToast();
  const [data, setData] = React.useState<Ticket[]>([]);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      'service.name': false,
      startDate: false,
      'createdBy.username': true,
    });
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [proofUrl, setProofUrl] = React.useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [newTicket, setNewTicket] = React.useState({
    ticket: '',
    serviceId: '',
    client: '',
    email: '',
    startDate: '',
    endDate: '',
  });

  const fetchTickets = React.useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tickets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const tickets = await response.json();
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

  React.useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleCreateTicket = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/tickets', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTicket),
      });

      if (!response.ok) {
        throw new Error('Failed to create ticket');
      }

      setIsDialogOpen(false);
      setNewTicket({
        ticket: '',
        serviceId: '',
        client: '',
        email: '',
        startDate: '',
        endDate: '',
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

  const columns: ColumnDef<Ticket>[] = [
    {
      accessorKey: 'ticket',
      header: 'Ticket',
      enableHiding: true,
    },
    {
      accessorKey: 'service.name',
      header: 'Service',
    },
    {
      accessorKey: 'client',
      header: 'Client',
    },
    {
      accessorKey: 'startDate',
      header: 'Start Date',
      cell: ({ row }) => {
        return new Date(row.getValue('startDate')).toLocaleDateString();
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
            endDate
            <ArrowUpDown />
          </Button>
        );
      },
      enableSorting: true,
      cell: ({ row }) => {
        return new Date(row.getValue('endDate')).toLocaleDateString();
      },
    },
    {
      accessorKey: 'status',
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            status
            <ArrowUpDown />
          </Button>
        );
      },
      enableSorting: true,
      cell: ({ row }) => {
        const status = row.getValue('status') as string;
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm ${
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
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            payment
            <ArrowUpDown />
          </Button>
        );
      },
      enableSorting: true,
      cell: ({ row }) => {
        const payment = row.getValue('payment') as string;
        return (
          <span
            className={`px-2 py-1 rounded-full text-sm ${
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
      accessorKey: 'createdBy.username',
      header: 'Criado Por',
      cell: ({ row }) => {
        return row.getValue('createdBy.username') as string;
      },
      enableSorting: false,
      enableHiding: true,
    },
    {
      id: 'actions',
      cell: ({ row }) => {
        const ticket = row.original;

        const handleViewProof = async () => {
          if (!ticket.proofUrl) return;

          try {
            const token = localStorage.getItem('token');
            const encodedFileName = encodeURIComponent(ticket.proofUrl);

            const response = await fetch(
              `/api/tickets/proof-url/${encodedFileName}`,
              {
                method: 'GET',
                headers: {
                  Accept: 'application/json',
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) throw new Error('Failed to get URL');

            const data = await response.json();
            console.log('Signed URL:', data.signedUrl);

            // Verify that data.signedUrl is a string
            if (typeof data.signedUrl === 'string') {
              setProofUrl(data.signedUrl);
              setDialogOpen(true);
            } else {
              throw new Error('Invalid signed URL');
            }
          } catch (error) {
            console.error('Error:', error);
            toast({
              title: 'Error',
              description: 'Failed to open proof document',
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
              {ticket.proofUrl && (
                <DropdownMenuItem onClick={handleViewProof}>
                  View Proof
                </DropdownMenuItem>
              )}
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
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
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
            <div className="relative w-full h-[500px]">
              <Image
                src={proofUrl}
                alt="Proof document"
                fill
                sizes="(max-width: 768px) 100vw, 800px"
                style={{ objectFit: 'contain' }}
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
      <div className="flex items-center py-4 space-x-4">
        <Input
          placeholder="Filter tickets..."
          value={(table.getColumn('ticket')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('ticket')?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
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
                <label htmlFor="serviceId" className="text-right">
                  Service ID
                </label>
                <Input
                  id="serviceId"
                  value={newTicket.serviceId}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, serviceId: e.target.value })
                  }
                  className="col-span-3"
                />
              </div>
              {/* Client */}
              <div className="grid grid-cols-4 items-center gap-4">
                <label htmlFor="client" className="text-right">
                  Client
                </label>
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
                <label htmlFor="email" className="text-right">
                  Email
                </label>
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
                <label htmlFor="startDate" className="text-right">
                  Start Date
                </label>
                <Input
                  id="startDate"
                  type="date"
                  value={newTicket.startDate}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, startDate: e.target.value })
                  }
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
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, endDate: e.target.value })
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
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
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
                  No tickets found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
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
