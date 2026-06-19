'use client'
import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Loader2, Eye, EyeOff, ArrowRight, CheckCircle, XCircle, Mail, Lock, User, Shield, RefreshCw } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

function getPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[^A-Za-z0-9]/.test(password),
  }
  const score = Object.values(checks).filter(Boolean).length
  const levels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong']
  const colors = ['', '#F87171', '#FB923C', '#F59E0B', '#38BDF8', '#00D4FF']
  const barColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-400', 'bg-cyan-400']
  return { checks, score, level: levels[score], color: colors[score], barColor: barColors[score] }
}

const STEPS = ['details', 'otp', 'success'] as const
type Step = typeof STEPS[number]

export default function RegisterPage() {
  const [step, setStep] = useState<Step>('details')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [otp, setOtp] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [resendTimer, setResendTimer] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const strength = useMemo(() => getPasswordStrength(password), [password])

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(r => r - 1), 1000)
      return () => clearTimeout(t)
    }
  }, [resendTimer])

  async function handleSendOTP() {
    if (!email || !password) { setError('Please fill all fields'); return }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to send OTP'); return }
      setStep('otp')
      setResendTimer(60)
    } catch {
      setError('Cannot connect to server.')
    } finally {
      setLoading(false)
    }
  }

  function handleOtpChange(index: number, value: string) {
    if (value.length > 1) {
      const digits = value.replace(/\D/g, '').slice(0, 6)
      const newOtp = [...otp]
      for (let i = 0; i < digits.length; i++) {
        if (index + i < 6) newOtp[index + i] = digits[i]
      }
      setOtp(newOtp)
      document.getElementById(`otp-${Math.min(index + digits.length, 5)}`)?.focus()
      return
    }
    const newOtp = [...otp]
    newOtp[index] = value.replace(/\D/g, '')
    setOtp(newOtp)
    if (value && index < 5) document.getElementById(`otp-${index + 1}`)?.focus()
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent) {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  async function handleVerifyAndRegister() {
    const otpCode = otp.join('')
    if (otpCode.length !== 6) { setError('Please enter the complete 6-digit code'); return }
    setLoading(true)
    setError('')
    try {
      const verifyRes = await fetch(`${API}/api/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: otpCode })
      })
      const verifyData = await verifyRes.json()
      if (!verifyRes.ok) { setError(verifyData.error || 'Invalid code'); return }

      const regRes = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name })
      })
      const regData = await regRes.json()
      if (!regRes.ok) { setError(regData.error || 'Registration failed'); return }

      localStorage.setItem('token', regData.token)
      localStorage.setItem('user', JSON.stringify(regData.user))
      setStep('success')
      setTimeout(() => { window.location.href = '/dashboard' }, 2000)
    } catch {
      setError('Cannot connect to server.')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendTimer > 0) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch(`${API}/api/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to resend'); return }
      setOtp(['', '', '', '', '', ''])
      setResendTimer(60)
      document.getElementById('otp-0')?.focus()
    } catch {
      setError('Cannot connect to server.')
    } finally {
      setLoading(false)
    }
  }

  if (!mounted) return null

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 text-white relative overflow-hidden"
      style={{ background: '#030712' }}
    >
      <div className="absolute inset-0 hud-grid opacity-30 pointer-events-none" />
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)' }}
      />
      <div className="scan-line" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] as [number,number,number,number] }}
        className="w-full max-w-md relative z-10"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-8">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 20px rgba(0,212,255,0.15)' }}
          >
            <Cpu className="w-5 h-5" style={{ color: '#00D4FF' }} />
          </div>
          <div>
            <div className="font-black text-lg" style={{ color: '#00D4FF', letterSpacing: '0.2em' }}>AI CTO</div>
            <div className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.2)', letterSpacing: '0.3em' }}>JARVIS OS</div>
          </div>
        </Link>

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[
            { id: 'details', label: '01 DETAILS' },
            { id: 'otp',     label: '02 VERIFY'  },
            { id: 'success', label: '03 ACCESS'  },
          ].map((s, i) => {
            const currentIdx = STEPS.indexOf(step)
            const isDone = currentIdx > i
            const isActive = s.id === step
            return (
              <div key={s.id} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div
                    className="w-5 h-5 rounded flex items-center justify-center text-[9px] font-mono font-bold transition-all duration-300"
                    style={{
                      background: isActive ? 'rgba(0,212,255,0.15)' : isDone ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isActive ? 'rgba(0,212,255,0.5)' : isDone ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.08)'}`,
                      color: isActive ? '#00D4FF' : isDone ? 'rgba(0,212,255,0.6)' : 'rgba(255,255,255,0.2)'
                    }}
                  >
                    {isDone ? '✓' : String(i + 1)}
                  </div>
                  <span className="text-[9px] font-mono hidden sm:block" style={{ color: isActive ? '#00D4FF' : 'rgba(255,255,255,0.2)' }}>
                    {s.label}
                  </span>
                </div>
                {i < 2 && <div className="w-6 h-px" style={{ background: 'rgba(0,212,255,0.15)' }} />}
              </div>
            )
          })}
        </div>

        {/* Card */}
        <div className="relative">
          <div
            className="absolute -inset-0.5 rounded-2xl opacity-30"
            style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.3), transparent, rgba(0,212,255,0.1))' }}
          />
          <div className="relative hud-panel rounded-2xl p-8">

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2 px-4 py-3 rounded-lg mb-5"
                  style={{ background: 'rgba(248,113,113,0.06)', border: '1px solid rgba(248,113,113,0.15)', color: '#F87171' }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
                  <span className="text-xs font-mono">{error}</span>
                  <button onClick={() => setError('')} className="ml-auto opacity-50 hover:opacity-100 text-sm">✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence mode="wait">

              {/* ── STEP 1: Details ── */}
              {step === 'details' && (
                <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-6">
                    <div className="text-[10px] font-mono tracking-[0.3em] mb-1" style={{ color: 'rgba(0,212,255,0.5)' }}>STEP 01</div>
                    <h1 className="text-xl font-black tracking-tight">Create your account</h1>
                    <p className="text-xs mt-1" style={{ color: 'rgba(248,250,252,0.3)' }}>We&apos;ll send a verification code to your email</p>
                  </div>

                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="text-[9px] font-mono tracking-widest mb-2 block uppercase" style={{ color: 'rgba(0,212,255,0.4)' }}>Name</label>
                      <div className="relative">
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none" style={{ color: 'rgba(0,212,255,0.3)' }} />
                        <input
                          type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Your name"
                          className="w-full bg-transparent rounded-xl px-4 py-3 pl-10 text-sm outline-none transition-all duration-300"
                          style={{ border: '1px solid rgba(0,212,255,0.15)', color: '#F8FAFC' }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(0,212,255,0.15)')}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label className="text-[9px] font-mono tracking-widest mb-2 block uppercase" style={{ color: 'rgba(0,212,255,0.4)' }}>Email</label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none" style={{ color: 'rgba(0,212,255,0.3)' }} />
                        <input
                          type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                          className="w-full bg-transparent rounded-xl px-4 py-3 pl-10 text-sm outline-none transition-all duration-300"
                          style={{ border: '1px solid rgba(0,212,255,0.15)', color: '#F8FAFC' }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(0,212,255,0.15)')}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div>
                      <label className="text-[9px] font-mono tracking-widest mb-2 block uppercase" style={{ color: 'rgba(0,212,255,0.4)' }}>Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-3.5 w-4 h-4 pointer-events-none" style={{ color: 'rgba(0,212,255,0.3)' }} />
                        <input
                          type={showPass ? 'text' : 'password'} value={password}
                          onChange={e => setPassword(e.target.value)} placeholder="Create strong password"
                          className="w-full bg-transparent rounded-xl px-4 py-3 pl-10 pr-10 text-sm outline-none transition-all duration-300"
                          style={{ border: '1px solid rgba(0,212,255,0.15)', color: '#F8FAFC' }}
                          onFocus={e => (e.target.style.borderColor = 'rgba(0,212,255,0.4)')}
                          onBlur={e => (e.target.style.borderColor = 'rgba(0,212,255,0.15)')}
                          onKeyDown={e => e.key === 'Enter' && handleSendOTP()}
                        />
                        <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-3 p-0.5 transition-colors" style={{ color: 'rgba(0,212,255,0.3)' }}>
                          {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      <AnimatePresence>
                        {password.length > 0 && (
                          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="mt-3 overflow-hidden">
                            <div className="flex gap-1 mb-2">
                              {[1,2,3,4,5].map(i => (
                                <div key={i} className={`h-0.5 flex-1 rounded-full transition-all duration-500 ${i <= strength.score ? strength.barColor : 'bg-white/5'}`} />
                              ))}
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-[10px] font-mono font-semibold" style={{ color: strength.color }}>{strength.level}</span>
                              <span className="text-[10px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>{strength.score}/5</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              {([
                                ['8+ characters', strength.checks.length],
                                ['Uppercase', strength.checks.uppercase],
                                ['Lowercase', strength.checks.lowercase],
                                ['Number', strength.checks.number],
                              ] as [string, boolean][]).map(([label, ok]) => (
                                <div key={label} className="flex items-center gap-1.5 text-[10px] font-mono">
                                  {ok
                                    ? <CheckCircle className="w-3 h-3 flex-shrink-0" style={{ color: '#00D4FF' }} />
                                    : <XCircle className="w-3 h-3 flex-shrink-0" style={{ color: 'rgba(255,255,255,0.1)' }} />
                                  }
                                  <span style={{ color: ok ? 'rgba(248,250,252,0.5)' : 'rgba(248,250,252,0.15)' }}>{label}</span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button onClick={handleSendOTP} disabled={loading || !email || !password} className="btn-jarvis w-full justify-center mt-6">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> SENDING CODE...</>
                      : <><Mail className="w-4 h-4" /> SEND VERIFICATION CODE <ArrowRight className="w-4 h-4" /></>
                    }
                  </button>

                  <p className="text-center text-xs font-mono mt-4" style={{ color: 'rgba(248,250,252,0.2)' }}>
                    Have an account?{' '}
                    <Link href="/auth/login" className="transition-colors" style={{ color: '#00D4FF' }}>SIGN IN</Link>
                  </p>
                </motion.div>
              )}

              {/* ── STEP 2: OTP ── */}
              {step === 'otp' && (
                <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                  <div className="mb-8">
                    <div className="text-[10px] font-mono tracking-[0.3em] mb-1" style={{ color: 'rgba(0,212,255,0.5)' }}>STEP 02</div>
                    <h1 className="text-xl font-black tracking-tight mb-2">Verify your email</h1>
                    <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>
                      6-digit code sent to <span style={{ color: '#00D4FF' }}>{email}</span>
                    </p>
                  </div>

                  <div className="flex gap-2 justify-center mb-6">
                    {otp.map((digit, i) => (
                      <input
                        key={i} id={`otp-${i}`} type="text" inputMode="numeric" maxLength={6} value={digit}
                        onChange={e => handleOtpChange(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        className="w-11 h-14 text-center font-black text-xl font-mono rounded-lg outline-none transition-all duration-300"
                        style={{
                          background: digit ? 'rgba(0,212,255,0.08)' : 'rgba(0,212,255,0.03)',
                          border: digit ? '1px solid rgba(0,212,255,0.4)' : '1px solid rgba(0,212,255,0.12)',
                          color: '#00D4FF',
                          boxShadow: digit ? '0 0 12px rgba(0,212,255,0.15)' : 'none'
                        }}
                      />
                    ))}
                  </div>

                  <div className="flex items-start gap-2 px-4 py-3 rounded-lg mb-6" style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.08)' }}>
                    <Shield className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgba(0,212,255,0.4)' }} />
                    <p className="text-[10px] font-mono" style={{ color: 'rgba(248,250,252,0.3)', lineHeight: 1.6 }}>
                      Check your inbox and spam folder. Code expires in 10 minutes.
                    </p>
                  </div>

                  <button onClick={handleVerifyAndRegister} disabled={loading || otp.join('').length !== 6} className="btn-jarvis w-full justify-center mb-4">
                    {loading
                      ? <><Loader2 className="w-4 h-4 animate-spin" /> VERIFYING...</>
                      : <><CheckCircle className="w-4 h-4" /> VERIFY & CREATE ACCOUNT</>
                    }
                  </button>

                  <div className="flex items-center justify-between text-xs font-mono">
                    <button onClick={() => { setStep('details'); setOtp(['','','','','','']); setError('') }} style={{ color: 'rgba(248,250,252,0.3)' }}>
                      ← CHANGE EMAIL
                    </button>
                    <button
                      onClick={handleResend} disabled={resendTimer > 0 || loading}
                      className="flex items-center gap-1.5 transition-all"
                      style={{ color: resendTimer > 0 ? 'rgba(248,250,252,0.2)' : '#00D4FF', cursor: resendTimer > 0 ? 'not-allowed' : 'pointer' }}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {resendTimer > 0 ? `RESEND IN ${resendTimer}s` : 'RESEND CODE'}
                    </button>
                  </div>
                </motion.div>
              )}

              {/* ── STEP 3: Success ── */}
              {step === 'success' && (
                <motion.div key="success" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-6">
                  <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
                    style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)', boxShadow: '0 0 30px rgba(0,212,255,0.15)' }}
                  >
                    <CheckCircle className="w-8 h-8" style={{ color: '#00D4FF' }} />
                  </motion.div>
                  <div className="text-[10px] font-mono tracking-[0.3em] mb-2" style={{ color: 'rgba(0,212,255,0.5)' }}>ACCESS GRANTED</div>
                  <h2 className="text-2xl font-black mb-2">Account created!</h2>
                  <p className="text-sm mb-6" style={{ color: 'rgba(248,250,252,0.3)' }}>Redirecting to dashboard...</p>
                  <div className="flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#00D4FF' }} />
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
