import { describe, expect, it } from 'vitest'
import { formatCurrency, formatNumber, truncate } from '../../src/client/utils/format'

describe('format', () => {
  it('formats currency', () => {
    expect(formatCurrency(1234.5)).toBe('$1,234.50')
  })
  it('formats numbers', () => {
    expect(formatNumber(1234567)).toBe('1,234,567')
  })
  it('truncates long strings', () => {
    expect(truncate('a'.repeat(100), 10)).toBe('aaaaaaaaaa...')
    expect(truncate('short')).toBe('short')
  })
})
