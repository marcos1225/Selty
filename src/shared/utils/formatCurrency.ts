export function formatCurrency(value: number | null | undefined, currency = 'CRC'): string | null {
  if (value === null || value === undefined) return null

  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 0,
  }).format(value)
}