import { toast } from "@heroui/react";

export function toastError(message: string, description?: string) {
  toast.danger(message, description ? { description } : undefined);
}
