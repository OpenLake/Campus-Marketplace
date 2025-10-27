import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to combine class names using clsx and tailwind-merge.
 * This helps in conditionally applying class names and merging Tailwind CSS classes.
 *
 * @param  {...any} inputs - Class names or objects for conditional classes.
 * @returns {string} - The combined and merged class names.
 */
export function cn(...inputs) {
  return twMerge(clsx(...inputs));
}