// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest'
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import Dashboard from '../../src/client/components/Dashboard'

afterEach(cleanup)

const user = { id: 1, name: 'Alice Tan', email: 'alice@acme.com', role: 'admin', orgId: 1 }
const data = [
  { id: 1, title: 'Revenue Q1', status: 'published', value: '$100.00', createdAt: '1/5/2026' },
  { id: 2, title: 'Churn analysis', status: 'draft', value: '$50.00', createdAt: '1/6/2026' }
]

describe('Dashboard', () => {
  it('greets the user and lists reports', () => {
    render(<Dashboard user={user} data={data} theme="light" onLogout={() => {}} />)
    expect(screen.getByText('Welcome, Alice Tan')).toBeInTheDocument()
    expect(screen.getByText('Revenue Q1')).toBeInTheDocument()
    expect(screen.getByText('Churn analysis')).toBeInTheDocument()
  })

  it('filters by search text', async () => {
    render(<Dashboard user={user} data={data} theme="light" onLogout={() => {}} />)
    await userEvent.type(screen.getByPlaceholderText('Search reports'), 'churn')
    expect(screen.queryByText('Revenue Q1')).not.toBeInTheDocument()
    expect(screen.getByText('Churn analysis')).toBeInTheDocument()
  })

  it('calls onLogout', async () => {
    const onLogout = vi.fn()
    render(<Dashboard user={user} data={data} theme="light" onLogout={onLogout} />)
    await userEvent.click(screen.getByRole('button', { name: 'Logout' }))
    expect(onLogout).toHaveBeenCalled()
  })
})
