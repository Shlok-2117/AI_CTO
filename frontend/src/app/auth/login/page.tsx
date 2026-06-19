'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Loader2, Eye, EyeOff, ArrowRight, Lock, Mail } from 'lucide-react'

const PARTICLES = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 3 + 1,
  duration: Math.random() * 10 + 5,
  delay: Math.random() * 5,
}))

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  async function handleLogin() {
    if (!email || !password) { setError('Please fill all fields'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Invalid credentials'); setLoading(false); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/dashboard'
    } catch {
      setError('Cannot connect to server. Make sure backend is running.')
      setLoading(false)
    }
  }

  return (
    <div className="page-bg min-h-screen flex items-center justify-center p-4 text-white relative overflow-hidden">
      {mounted && PARTICLES.map(p => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-violet-500/20 pointer-events-none"
          style={{ left: `${p.x}%`, top: `${p.y}%`, width: p.size, height: p.size }}
          animate={{ y: [-20, 20, -20], opacity: [0.1, 0.4, 0.1] }}
          transition={{ duration: p.duration, delay: p.delay, repeat: Infinity, ease: 'easeInOut' }}
        />
      ))}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/5 blur-3xl pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-violet-500/10 to-transparent pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-md relative z-10"
      >
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-center mb-8"
        >
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-2xl shadow-violet-500/30 group-hover:shadow-violet-500/50 transition-all group-hover:scale-105">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-black text-lg tracking-tight">AI CTO</div>
              <div className="text-xs text-white/20 -mt-0.5">Architecture Generator</div>
            </div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-600/20 via-indigo-600/20 to-violet-600/20 rounded-3xl blur-xl" />
          <div className="relative glass rounded-2xl p-8 border border-white/8">
            <div className="mb-8">
              <h1 className="text-2xl font-black tracking-tight mb-1">Welcome back</h1>
              <p className="text-white/30 text-sm">Sign in to your AI CTO account</p>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-red-500/8 border border-red-500/15 text-red-400 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button
              onClick={() => alert('Google Sign In — coming soon!')}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all duration-300 text-sm font-medium text-white/70 hover:text-white mb-6 group"
            >
              <svg className="w-4 h-4 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-4 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/8" />
              <span className="text-xs text-white/20 font-medium">or</span>
              <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/8" />
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 block">Email</label>
                <div className={`relative transition-all duration-300 ${focused === 'email' ? 'drop-shadow-[0_0_12px_rgba(124,58,237,0.3)]' : ''}`}>
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-white/20 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused('email')}
                    onBlur={() => setFocused(null)}
                    placeholder="you@example.com"
                    className="input pl-10"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2 block">Password</label>
                <div className={`relative transition-all duration-300 ${focused === 'pass' ? 'drop-shadow-[0_0_12px_rgba(124,58,237,0.3)]' : ''}`}>
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-white/20 pointer-events-none" />
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onFocus={() => setFocused('pass')}
                    onBlur={() => setFocused(null)}
                    placeholder="••••••••"
                    className="input pl-10 pr-10"
                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-3 text-white/20 hover:text-white/60 transition-colors p-0.5"
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>

            <motion.button
              onClick={handleLogin}
              disabled={loading}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="btn-primary w-full mt-6"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /><span>Authenticating...</span></>
              ) : (
                <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>
              )}
            </motion.button>

            <p className="text-center text-sm text-white/20 mt-6">
              No account?{' '}
              <Link href="/auth/register" className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
                Create one free
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
