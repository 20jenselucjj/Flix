import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/';

export function getImageUrl(path: string | null, size: 'w500' | 'original' | 'w1280' = 'w500') {
  if (!path) return '/placeholder.png'; // You might want to add a placeholder image
  return `${IMAGE_BASE_URL}${size}${path}`;
}
