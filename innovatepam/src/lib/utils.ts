import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy")
}

export function formatDateTime(iso: string): string {
  return format(new Date(iso), "MMM d, yyyy HH:mm")
}
