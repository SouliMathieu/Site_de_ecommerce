export const DEVISES = [
  { code: 'USD', label: 'USD — Dollar américain' },
  { code: 'EUR', label: 'EUR — Euro' },
  { code: 'MAD', label: 'MAD — Dirham marocain' },
  { code: 'XOF', label: 'XOF — Franc CFA (UEMOA)' },
  { code: 'NGN', label: 'NGN — Naira nigérian' },
  { code: 'KES', label: 'KES — Shilling kényan' },
  { code: 'GBP', label: 'GBP — Livre sterling' },
] as const

export function formatCurrency(amount: number, devise: string): string {
  try {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: devise,
      maximumFractionDigits: 2,
    }).format(amount)
  } catch {
    return `${amount.toFixed(2)} ${devise}`
  }
}