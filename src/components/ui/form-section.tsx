import * as React from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface FormSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  submitText?: string;
  cancelText?: string;
  onCancel?: () => void;
  isSubmitting?: boolean;
  className?: string;
  readOnly?: boolean;
  extraActions?: React.ReactNode;
  layout?: "vertical" | "horizontal";
}

export function FormSection({
  title,
  description,
  children,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  onCancel,
  isSubmitting = false,
  className = "",
  readOnly = false,
  extraActions,
  layout = "vertical",
}: FormSectionProps) {
  const contentClass =
    layout === "horizontal" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "";

  return (
    <Card className={className}>
      <form onSubmit={readOnly ? (e) => e.preventDefault() : onSubmit}>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
        <CardContent className={contentClass}>
          {readOnly
            ? React.Children.map(children, (child) =>
                React.isValidElement(child)
                  ? React.cloneElement(child, {
                      disabled: true,
                    } as React.HTMLAttributes<HTMLElement>)
                  : child,
              )
            : children}
        </CardContent>
        <CardFooter className="flex justify-end space-x-2">
          {extraActions}
          {!readOnly && (
            <>
              {onCancel && (
                <Button
                  variant="outline"
                  type="button"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  {cancelText}
                </Button>
              )}
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : submitText}
              </Button>
            </>
          )}
          {readOnly && onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Close
            </Button>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
