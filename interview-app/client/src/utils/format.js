// [FE-T2] Date formatting is not timezone-aware.
//         new Date(ts).toLocaleString() renders in the *browser's* local timezone.
//         Users in different timezones see different timestamps for the same report,
//         and users in Singapore see times 8 hours off from the server's UTC timestamps.

export function formatDate(timestamp) {
  return new Date(timestamp).toLocaleString()
  // Should be:
  // return new Intl.DateTimeFormat('en-GB', {
  //   timeZone: 'UTC', // or user's stored preference
  //   dateStyle: 'medium',
  //   timeStyle: 'short'
  // }).format(new Date(timestamp))
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
