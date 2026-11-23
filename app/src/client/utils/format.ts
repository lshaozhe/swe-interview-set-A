// INTERVIEWER-ANNOTATION-START
// [FE-08 · T2 · correctness] Dates render in the viewer's timezone, so the same report shows different times to different users.
//     Look near: toLocaleString()
// INTERVIEWER-ANNOTATION-END
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
