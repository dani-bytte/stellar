"use client";

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/data-table/data-table";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatCurrency } from "@/lib/formatters";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface Service {
  _id: string;
  name: string;
  dueDate: number;
  value: number;
  category: {
    _id: string;
    name: string;
  };
}

interface ServiceTableProps {
  data: Service[];
  isLoading: boolean;
  fetchServices: () => void;
  onCreateNew?: () => void;
}

const ServiceTable: React.FC<ServiceTableProps> = ({
  data,
  isLoading,
  fetchServices,
}) => {

  
  // Function to handle service deletion
  const handleDeleteService = async (serviceId: string) => {
    try {
      console.log(`Deleting service with ID: ${serviceId}`); // Placeholder
      toast.success("Service deleted successfully");
      fetchServices();
    } catch (error) {
      console.error("Error deleting service:", error);
      toast.error("Failed to delete service");
    }
  };

  // Define columns
  const columns = React.useMemo<ColumnDef<Service>[]>(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
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
        accessorKey: "name",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "category.name",
        id: "category",
        header: "Category",
        cell: ({ row }) => (
          <StatusBadge status="info" text={row.original.category.name} />
        ),
      },
      {
        accessorKey: "dueDate",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Duration (days)
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => row.original.dueDate.toString(),
      },
      {
        accessorKey: "value",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Value
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => formatCurrency(row.original.value),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const service = row.original;
          
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    // Edit action would be implemented here
                  }}
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleDeleteService(service._id)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    [handleDeleteService]
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner size="lg" text="Loading services..." />
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      <DataTable
        columns={columns}
        data={data}
        filterColumn="name"
        filterPlaceholder="Filter by name..."
        showColumnToggle={true}
        pageSizeOptions={[10, 20, 30, 50]}
        className="w-full"
      />
    </div>
  );
};

export default ServiceTable;
