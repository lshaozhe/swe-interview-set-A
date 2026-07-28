export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString()
}

export function formatCurrency(value, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(value)
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value)
}

export function truncate(str, maxLen = 80) {
  if (str.length <= maxLen) return str
  return str.slice(0, maxLen) + '...'
}
