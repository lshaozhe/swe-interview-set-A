export function formatDate(timestamp: string | number | Date) {
  return new Date(timestamp).toLocaleString()
}

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function truncate(str: string, maxLen = 80) {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}
