export function parseLocalDate(dateStr: string): Date {
  const datePart = dateStr.split('T')[0] || ''
  const parts = datePart.split('-')
  const year = Number(parts[0]) || new Date().getFullYear()
  const month = Number(parts[1]) || 1
  const day = Number(parts[2]) || 1
  return new Date(year, month - 1, day)
}

export function formatLocalDate(
  iso: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'numeric', year: 'numeric' },
): string {
  if (!iso) return '-'
  return parseLocalDate(iso).toLocaleDateString('es-CR', options)
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = parseLocalDate(iso)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffMs / 86_400_000)

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`

  return date.toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'short',
    year: diffDays > 365 ? 'numeric' : undefined,
  })
}
