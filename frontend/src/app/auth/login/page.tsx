'use client'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
import { useState } from 'react'
import { Cpu, Loader2, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [show, setShow] = useState(false)
  const [debug, setDebug] = useState('')

  async function handleLogin() {
    const trimEmail = email.trim()
    const trimPass = password

    setDebug(`Sending → email: "${trimEmail}" | password length: ${trimPass.length}`)

    if (!trimEmail || !trimPass) { setError('Please fill all fields'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: trimEmail, password: trimPass })
      })
      const data = await res.json()
      setDebug(`Server replied → ${res.status}: ${JSON.stringify(data).slice(0, 80)}`)
      if (!res.ok) { setError(data.error || 'Login failed'); setLoading(false); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/dashboard'
    } catch (e: any) {
      setError('Cannot connect to server on port 5000.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-violet-600 rounded-xl flex items-center justify-center">
            <Cpu className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white">AI CTO</span>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 p-6">
          <h1 className="text-xl font-semibold text-white mb-1">Welcome back</h1>
          <p className="text-sm text-gray-400 mb-6">Sign in to generate architectures</p>

          {error && (
            <div className="bg-red-950 border border-red-800 text-red-400 text-sm rounded-lg px-3 py-2 mb-4">
              ⚠ {error}
            </div>
          )}

          {/* Debug panel — shows what is being sent */}
          {debug && (
            <div className="bg-gray-800 border border-gray-700 text-green-400 text-xs rounded-lg px-3 py-2 mb-4 font-mono break-all">
              {debug}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="shlokgohel2117@gmail.com"
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5 block">
                Password
              </label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full px-4 py-3 pr-10 bg-gray-800 border border-gray-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                  onKeyDown={e => e.key === 'Enter' && handleLogin()}
                />
                <button type="button" onClick={() => setShow(!show)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-white">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {/* Show password as dots to confirm it's typed */}
              {password && (
                <p className="text-xs text-gray-600 mt-1">
                  {password.length} characters entered {show ? '' : '— click eye icon to reveal'}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full mt-6 py-3 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white font-semibold rounded-xl flex items-center justify-center gap-2 transition-colors">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : 'Sign in →'}
          </button>

          {/* Quick login hint */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <p className="text-xs text-gray-500 text-center">
              Credentials: <span className="text-gray-300">shlokgohel2117@gmail.com</span> / <span className="text-gray-300">123456</span>
            </p>
          </div>

          <p className="text-center text-sm text-gray-500 mt-4">
            New here?{' '}
            <a href="/auth/register" className="text-violet-400 hover:underline">Create account</a>
          </p>
        </div>
      </div>
    </div>
  )
}
