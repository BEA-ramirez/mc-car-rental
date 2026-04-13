import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// lib/utils.ts

export const formatDisplayId = (
  uuid: string | null | undefined,
  prefix: string = "REF",
) => {
  if (!uuid) return "---";

  // Takes the first 6 characters of the UUID and uppercases them
  const shortHash = uuid.substring(0, 6).toUpperCase();

  return `${prefix}-${shortHash}`;
};
