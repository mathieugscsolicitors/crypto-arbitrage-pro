import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount);
}

export function formatCrypto(amount: number, symbol: string): string {
  const decimals = symbol === 'BTC' ? 8 : symbol === 'ETH' ? 6 : 2;
  return `${amount.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })} ${symbol}`;
}

export function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;
}

export function generateWalletAddress(asset: string): string {
  const prefixes = {
    BTC: ['1', '3', 'bc1'],
    ETH: ['0x'],
    USDT: ['0x'],
    USDC: ['0x']
  };
  
  const prefix = prefixes[asset as keyof typeof prefixes]?.[0] || '0x';
  const length = asset === 'BTC' ? 34 : 42;
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
  
  let address = prefix;
  for (let i = prefix.length; i < length; i++) {
    address += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return address;
}

export function calculateROI(principal: number, apy: number, days: number): number {
  const dailyRate = apy / 365 / 100;
  return principal * Math.pow(1 + dailyRate, days) - principal;
}

export function getAssetColor(asset: string): string {
  const colors = {
    BTC: 'text-orange-400',
    ETH: 'text-blue-400',
    USDT: 'text-green-400',
    USDC: 'text-blue-400'
  };
  return colors[asset as keyof typeof colors] || 'text-gray-400';
}

export function getStatusColor(status: string): string {
  const colors = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    COMPLETED: 'text-green-400 bg-green-400/10',
    REJECTED: 'text-red-400 bg-red-400/10',
    ACTIVE: 'text-blue-400 bg-blue-400/10',
    SUSPENDED: 'text-red-400 bg-red-400/10',
    CANCELLED: 'text-gray-400 bg-gray-400/10'
  };
  return colors[status as keyof typeof colors] || 'text-gray-400 bg-gray-400/10';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre majuscule');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une lettre minuscule');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}