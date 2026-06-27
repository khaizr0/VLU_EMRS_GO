import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, parseISO, isValid } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";

  // Nếu đã đúng format dd/mm/yyyy thì giữ nguyên
  const ddMmYyyyRegex = /^\d{2}\/\d{2}\/\d{4}$/;
  if (ddMmYyyyRegex.test(dateString)) {
    return dateString;
  }

  try {
    const date = parseISO(dateString);
    if (isValid(date)) {
      return format(date, "dd/MM/yyyy");
    }
    // Fallback cho trường hợp parseISO không được nhưng có thể là new Date() string khác
    const d = new Date(dateString);
    if (isValid(d)) {
        return format(d, "dd/MM/yyyy");
    }
  } catch (error) {
    console.warn("Invalid date format:", dateString);
  }

  return dateString;
}
