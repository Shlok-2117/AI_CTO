'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Loader2, Eye, EyeOff, ArrowRight, Lock, Mail, Shield } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [focused, setFocused] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const [showGoogleModal, setShowGoogleModal] = useState(false)

  useEffect(() => setMounted(true), [])

  async function handleLogin() {
    if (!email || !password) { setError('All fields required'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Authentication failed'); setLoading(false); return }
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      window.location.href = '/dashboard'
    } catch {
      setError('Cannot connect to server. Is the backend running?')
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div className="page-jarvis min-h-screen flex items-center justify-center p-4 text-white relative overflow-hidden">

      {/* Grid background */}
      <div className="fixed inset-0 hud-grid opacity-20 pointer-events-none" />
      <div className="scan-line" />

      {/* Corner decorations */}
      {(['top-4 left-4 border-t border-l', 'top-4 right-4 border-t border-r', 'bottom-4 left-4 border-b border-l', 'bottom-4 right-4 border-b border-r'] as const).map((cls, i) => (
        <div key={i} className={`fixed w-6 h-6 ${cls} pointer-events-none`}
          style={{ borderColor: 'rgba(0,212,255,0.2)' }} />
      ))}

      {/* Ambient glow */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.23, 1, 0.32, 1] }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center gap-3 mb-8"
        >
          <Link href="/" className="flex flex-col items-center gap-2 group">
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{
                  background: 'rgba(0,212,255,0.08)',
                  border: '1px solid rgba(0,212,255,0.3)',
                  boxShadow: '0 0 30px rgba(0,212,255,0.15)'
                }}>
                <Cpu className="w-7 h-7" style={{ color: '#00D4FF' }} />
              </div>
              <motion.div
                animate={{ scale: [1, 1.5, 1], opacity: [1, 0.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
                style={{ background: '#00D4FF', boxShadow: '0 0 8px #00D4FF' }} />
            </div>
            <div className="text-center">
              <div className="text-xl font-black tracking-[0.3em]"
                style={{ color: '#00D4FF', textShadow: '0 0 20px rgba(0,212,255,0.4)' }}>
                AI CTO
              </div>
              <div className="text-[9px] font-mono tracking-[0.4em]"
                style={{ color: 'rgba(248,250,252,0.2)' }}>
                JARVIS ARCHITECTURE SYSTEM
              </div>
            </div>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="relative"
        >
          <div className="absolute -inset-px rounded-2xl opacity-50"
            style={{
              background: 'linear-gradient(135deg, rgba(0,212,255,0.15), transparent, rgba(0,212,255,0.08))',
              filter: 'blur(8px)'
            }} />

          <div className="relative hud-panel rounded-2xl"
            style={{ borderColor: 'rgba(0,212,255,0.12)' }}>

            <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.5),transparent)' }} />

            <div className="p-7">
              <div className="mb-6">
                <div className="text-[9px] font-mono tracking-[0.3em] mb-1"
                  style={{ color: 'rgba(0,212,255,0.5)' }}>
                  AUTHENTICATION REQUIRED
                </div>
                <h1 className="text-xl font-black tracking-tight">Access Control</h1>
                <p className="text-xs mt-1" style={{ color: 'rgba(248,250,252,0.25)' }}>
                  Verify identity to enter JARVIS system
                </p>
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg mb-5 text-xs font-mono"
                    style={{
                      background: 'rgba(248,113,113,0.06)',
                      border: '1px solid rgba(248,113,113,0.2)',
                      color: '#F87171'
                    }}>
                    <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                    {error}
                    <button onClick={() => setError('')} className="ml-auto opacity-50 hover:opacity-100">✕</button>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Google button */}
              <button
                onClick={() => setShowGoogleModal(true)}
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl mb-5 text-xs font-mono transition-all duration-300"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(248,250,252,0.5)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.2)'
                  e.currentTarget.style.color = 'rgba(248,250,252,0.8)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'
                  e.currentTarget.style.color = 'rgba(248,250,252,0.5)'
                }}>
                <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                AUTHENTICATE WITH GOOGLE
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3 mb-5">
                <div className="flex-1 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(0,212,255,0.15))' }} />
                <span className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
                  OR MANUAL AUTH
                </span>
                <div className="flex-1 h-px"
                  style={{ background: 'linear-gradient(90deg, rgba(0,212,255,0.15), transparent)' }} />
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-[9px] font-mono tracking-[0.2em] mb-2 block uppercase"
                    style={{ color: 'rgba(0,212,255,0.4)' }}>
                    EMAIL ADDRESS
                  </label>
                  <div className="relative"
                    style={{
                      filter: focused === 'email' ? 'drop-shadow(0 0 8px rgba(0,212,255,0.2))' : 'none',
                      transition: 'filter 0.3s'
                    }}>
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none"
                      style={{ color: focused === 'email' ? '#00D4FF' : 'rgba(0,212,255,0.25)' }} />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      onFocus={() => setFocused('email')}
                      onBlur={() => setFocused(null)}
                      placeholder="operator@system.ai"
                      className="input-jarvis pl-10"
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-mono tracking-[0.2em] mb-2 block uppercase"
                    style={{ color: 'rgba(0,212,255,0.4)' }}>
                    ACCESS CODE
                  </label>
                  <div className="relative"
                    style={{
                      filter: focused === 'pass' ? 'drop-shadow(0 0 8px rgba(0,212,255,0.2))' : 'none',
                      transition: 'filter 0.3s'
                    }}>
                    <Lock className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none"
                      style={{ color: focused === 'pass' ? '#00D4FF' : 'rgba(0,212,255,0.25)' }} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      onFocus={() => setFocused('pass')}
                      onBlur={() => setFocused(null)}
                      placeholder="••••••••••••"
                      className="input-jarvis pl-10 pr-10"
                      onKeyDown={e => e.key === 'Enter' && handleLogin()}
                    />
                    <button
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-3 p-0.5 transition-colors"
                      style={{ color: 'rgba(0,212,255,0.25)' }}>
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
                className="btn-jarvis w-full justify-center mt-6"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" />AUTHENTICATING...</>
                ) : (
                  <><Shield className="w-4 h-4" />AUTHENTICATE<ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>

              <p className="text-center text-[10px] font-mono mt-5"
                style={{ color: 'rgba(248,250,252,0.15)' }}>
                NO CLEARANCE?{' '}
                <Link href="/auth/register"
                  className="transition-colors"
                  style={{ color: 'rgba(0,212,255,0.6)' }}>
                  REQUEST ACCESS →
                </Link>
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center justify-center gap-4 mt-6 text-[9px] font-mono"
          style={{ color: 'rgba(248,250,252,0.1)' }}>
          <span>JARVIS OS v2.0</span>
          <span style={{ color: 'rgba(0,212,255,0.2)' }}>·</span>
          <span>ENCRYPTED</span>
          <span style={{ color: 'rgba(0,212,255,0.2)' }}>·</span>
          <span>SECURE</span>
        </motion.div>
      </motion.div>

      {/* Google Modal */}
      <AnimatePresence>
        {showGoogleModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setShowGoogleModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="hud-panel rounded-2xl p-8 max-w-sm w-full text-center"
              style={{ borderColor: 'rgba(0,212,255,0.2)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4"
                style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
              </div>
              <div className="text-[9px] font-mono tracking-[0.3em] mb-2"
                style={{ color: 'rgba(0,212,255,0.5)' }}>MODULE OFFLINE</div>
              <h3 className="font-black text-lg mb-2">Google Auth</h3>
              <p className="text-xs mb-6" style={{ color: 'rgba(248,250,252,0.3)' }}>
                Google authentication module is currently in development.
                Use email and access code to authenticate.
              </p>
              <button
                onClick={() => setShowGoogleModal(false)}
                className="btn-jarvis w-full justify-center">
                USE MANUAL AUTH
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
