// INTERVIEWER-ANNOTATION-START
// [FE-12 · T1 · a11y] Inputs have no labels, errors are not announced, and the form relies on colour for the error.
//     Look near: placeholder="Email"
// INTERVIEWER-ANNOTATION-END
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch {
      setError('Login failed')
    }
  }

  return (
    <form onSubmit={submit}>
      <h1>Sign in</h1>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
      <button>Sign in</button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  )
}
