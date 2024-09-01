import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export const SESSION_COOKIE_NAME = "session";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
