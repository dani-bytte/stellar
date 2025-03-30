// components/ServiceFormSheet.tsx
import { useState, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { API_ENDPOINTS, LOCAL_STORAGE_KEYS } from "@/lib/constants";
import { fetchWithErrorHandling } from "@/utils/errorHandling";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Category {
  _id: string;
  name: string;
}

interface ServiceFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

// Add helper function for name capitalization
const capitalizeWords = (str: string) => {
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

// Add predefined duration days
const durationOptions = Array.from({ length: 30 }, (_, i) => i + 1);

export function ServiceFormSheet({
  open,
  onOpenChange,
  onSuccess,
}: ServiceFormSheetProps) {
  const [loading, setLoading] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    categoryId: "",
    dueDate: "1", // Default to 1 day
    value: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      if (!open) return;
      
      try {
        setLoadingCategories(true);
        setError(null);
        
        // Usando o fetchWithErrorHandling para tratamento consistente de erros
        const categoriesData = await fetchWithErrorHandling<Category[]>(
          API_ENDPOINTS.TICKETS.CATEGORIES.LIST,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
              "Content-Type": "application/json",
            },
          }
        );
        
        setCategories(categoriesData);
      } catch (error) {
        // Aqui o erro já foi tratado com toast pela nossa função
        setError(error instanceof Error ? error.message : "Failed to load categories");
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Usando o fetchWithErrorHandling para tratamento consistente de erros
      await fetchWithErrorHandling(
        API_ENDPOINTS.SERVICES.NEW,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem(LOCAL_STORAGE_KEYS.TOKEN)}`,
          },
          body: JSON.stringify({
            ...formData,
            dueDate: Number(formData.dueDate),
            value: Number(formData.value),
          }),
        }
      );

      setFormData({
        name: "",
        categoryId: "",
        dueDate: "1", // Default to 1 day
        value: "",
      });
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      // O erro já foi tratado pelo fetchWithErrorHandling
      setError(error instanceof Error ? error.message : "Failed to create service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>New Service</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {error && (
            <div className="text-sm font-medium text-red-500 dark:text-red-400">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <label>Name</label>
            <Input
              required
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  name: capitalizeWords(e.target.value),
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <label>Category</label>
            <Select
              required
              disabled={loadingCategories}
              value={formData.categoryId}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  categoryId: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingCategories
                      ? "Loading categories..."
                      : "Select category"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {loadingCategories ? (
                  <div className="p-2 text-sm text-muted-foreground">
                    Loading categories...
                  </div>
                ) : categories.length > 0 ? (
                  categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-sm text-muted-foreground">
                    No categories available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label>Duration (days)</label>
            <Select
              required
              value={formData.dueDate}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  dueDate: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select duration" />
              </SelectTrigger>
              <SelectContent>
                {durationOptions.map((days) => (
                  <SelectItem key={days} value={days.toString()}>
                    {days} {days === 1 ? "day" : "days"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label>Value</label>
            <Input
              required
              type="number"
              step="0.01"
              min="0"
              value={formData.value}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                if (value >= 0) {
                  setFormData((prev) => ({
                    ...prev,
                    value: e.target.value,
                  }));
                }
              }}
              onBlur={(e) => {
                // Format to 2 decimal places on blur
                const value = parseFloat(e.target.value);
                if (!isNaN(value)) {
                  setFormData((prev) => ({
                    ...prev,
                    value: value.toFixed(2),
                  }));
                }
              }}
            />
          </div>
          <SheetFooter>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Service"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
