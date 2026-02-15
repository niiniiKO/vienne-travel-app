import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Exchange rates (approximate)
export const EXCHANGE_RATES = {
  EUR_JPY: 180,  // 1 EUR = 180 JPY
  EUR_CZK: 25,   // 1 EUR = 25 CZK
} as const;

// Currency symbol helper
export function getCurrencySymbol(currency: 'EUR' | 'JPY' | 'CZK'): string {
  switch (currency) {
    case 'EUR': return '€';
    case 'JPY': return '¥';
    case 'CZK': return 'Kč';
  }
}
