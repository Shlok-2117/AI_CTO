'use client'
import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { Cpu } from 'lucide-react'

export default function GoogleSuccessPage() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    const userStr = params.get('user')

    if (!token) {
      window.location.href = '/auth/login?error=google_failed'
      return
    }

    try {
      const user = userStr ? JSON.parse(decodeURIComponent(userStr)) : null
      localStorage.setItem('token', token)
      if (user) localStorage.setItem('user', JSON.stringify(user))
    } catch {
      localStorage.setItem('token', token)
    }

    window.location.href = '/dashboard'
  }, [])

  return (
    <div className="page-jarvis min-h-screen flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
          style={{
            background: 'rgba(0,212,255,0.08)',
            border: '1px solid rgba(0,212,255,0.3)',
            boxShadow: '0 0 30px rgba(0,212,255,0.15)'
          }}>
          <Cpu className="w-8 h-8" style={{ color: '#00D4FF' }} />
        </div>
        <div className="text-sm font-mono" style={{ color: '#00D4FF' }}>
          AUTHENTICATING VIA GOOGLE...
        </div>
        <div className="flex justify-center gap-1.5 mt-4">
          {[0, 1, 2].map(i => (
            <motion.div key={i}
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: '#00D4FF' }} />
          ))}
        </div>
      </motion.div>
    </div>
  )
}
