'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Cpu, Menu, X } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'FEATURES', href: '/features' },
  { label: 'PRICING', href: '/pricing' },
  { label: 'SIGN IN', href: '/auth/login' },
]

export function JarvisNav() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    window.addEventListener('scroll', onScroll)
    const updateTime = () => setTime(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }))
    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => { window.removeEventListener('scroll', onScroll); clearInterval(timer) }
  }, [])

  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'hud-panel' : ''}`}
      style={scrolled ? { borderBottom: '1px solid rgba(0,212,255,0.1)' } : {}}
    >
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{
                background: 'rgba(0,212,255,0.1)',
                border: '1px solid rgba(0,212,255,0.3)',
                boxShadow: '0 0 20px rgba(0,212,255,0.15)',
              }}
            >
              <Cpu className="w-4 h-4" style={{ color: '#00D4FF' }} />
            </div>
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" style={{ boxShadow: '0 0 6px #00D4FF' }} />
          </div>
          <div>
            <div className="text-sm font-black" style={{ color: '#00D4FF', letterSpacing: '0.2em' }}>AI CTO</div>
            <div className="text-[9px] font-mono text-slate-600 tracking-widest -mt-0.5">JARVIS OS</div>
          </div>
        </Link>

        <div className="hidden lg:flex items-center gap-6">
          <div
            className="flex items-center gap-2 px-3 py-1 rounded"
            style={{ border: '1px solid rgba(0,212,255,0.1)', background: 'rgba(0,212,255,0.03)' }}
          >
            <div className="status-online" />
            <span className="text-[10px] font-mono text-slate-500">ALL AGENTS ONLINE</span>
          </div>
          <div className="text-[10px] font-mono text-slate-600">{time}</div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {NAV_ITEMS.map(item => (
            <Link
              key={item.label}
              href={item.href}
              className="text-[10px] font-mono tracking-[0.15em] px-4 py-2 rounded transition-all duration-300 hover:text-cyan-400 hover:bg-cyan-400/5"
              style={{ color: 'rgba(248,250,252,0.4)' }}
            >
              {item.label}
            </Link>
          ))}
          <Link href="/auth/register" className="btn-jarvis text-[10px] py-2 px-4 ml-2">
            INITIALIZE
          </Link>
        </div>

        <button className="md:hidden" style={{ color: '#00D4FF' }} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden hud-panel px-6 py-4"
            style={{ borderTop: '1px solid rgba(0,212,255,0.1)' }}
          >
            <div className="flex flex-col gap-3">
              {NAV_ITEMS.map(item => (
                <Link key={item.label} href={item.href} className="text-xs font-mono tracking-widest py-2" style={{ color: 'rgba(248,250,252,0.4)' }}>
                  {item.label}
                </Link>
              ))}
              <Link href="/auth/register" className="btn-jarvis text-xs text-center mt-2">INITIALIZE</Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
