'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HudOrb } from './HudOrb'

export function BootScreen({ onComplete }: { onComplete: () => void }) {
  const [visibleLines, setVisibleLines] = useState<number[]>([])
  const [progress, setProgress] = useState(0)
  const [done, setDone] = useState(false)

  const [userName] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null
    try {
      const stored = localStorage.getItem('user')
      if (stored) {
        const u = JSON.parse(stored)
        return u.name || u.email?.split('@')[0] || null
      }
    } catch {}
    return null
  })

  const bootLines = useMemo(() => {
    if (userName) {
      return [
        { text: 'JARVIS_CTO SYSTEM ONLINE', delay: 200, color: 'text-cyan-400' },
        { text: `WELCOME BACK, ${userName.toUpperCase()}`, delay: 800, color: 'text-amber-400' },
        { text: 'ALL 12 AGENTS: ACTIVE', delay: 1400, color: 'text-green-400' },
        { text: 'GENERATING YOUR DASHBOARD...', delay: 2000, color: 'text-slate-400' },
      ]
    }
    return [
      { text: 'JARVIS_CTO SYSTEM INITIALIZING...', delay: 200, color: 'text-cyan-400' },
      { text: 'AI AGENTS: ONLINE', delay: 800, color: 'text-green-400' },
      { text: 'LOADING INTERFACE...', delay: 1400, color: 'text-slate-400' },
      { text: 'READY', delay: 2000, color: 'text-amber-400' },
    ]
  }, [userName])

  useEffect(() => {
    if (sessionStorage.getItem('jarvis_booted')) {
      onComplete()
      return
    }

    bootLines.forEach((line, i) => {
      setTimeout(() => {
        setVisibleLines(prev => [...prev, i])
        setProgress(Math.round(((i + 1) / bootLines.length) * 100))
      }, line.delay)
    })

    setTimeout(() => {
      setDone(true)
      setTimeout(() => {
        sessionStorage.setItem('jarvis_booted', 'true')
        onComplete()
      }, 800)
    }, 2600)
  }, [onComplete, bootLines])

  return (
    <AnimatePresence>
      {!done ? (
        <motion.div
          className="fixed inset-0 z-[9999] flex items-center justify-center"
          style={{ background: '#030712' }}
          exit={{ opacity: 0, scale: 1.02 }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        >
          <div className="absolute inset-0 hud-grid opacity-50" />
          <div className="scan-line" />

          {['top-6 left-6 border-t border-l', 'top-6 right-6 border-t border-r', 'bottom-6 left-6 border-b border-l', 'bottom-6 right-6 border-b border-r'].map((cls, i) => (
            <div key={i} className={`absolute w-8 h-8 ${cls} border-cyan-400/30`} />
          ))}

          <div className="max-w-2xl w-full px-8 flex flex-col items-center">
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
              className="mb-10"
            >
              <HudOrb size={140} />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center mb-8"
            >
              <div
                className="text-3xl font-black tracking-[0.3em] mb-1 animate-flicker"
                style={{ color: '#00D4FF', textShadow: '0 0 20px rgba(0,212,255,0.5)' }}
              >
                AI CTO
              </div>
              <div className="text-xs font-mono text-slate-500 tracking-[0.4em]">
                JARVIS ARCHITECTURE SYSTEM v1.0
              </div>
            </motion.div>

            <div className="w-full hud-panel rounded-lg p-5 mb-6 border-beam-cyan">
              <div className="flex items-center gap-2 mb-4 pb-3" style={{ borderBottom: '1px solid rgba(0,212,255,0.1)' }}>
                <div className="flex gap-1.5">
                  {['bg-red-500/40', 'bg-amber-500/40', 'bg-green-500/40'].map((c, i) => (
                    <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />
                  ))}
                </div>
                <span className="text-xs font-mono text-slate-600 ml-2">system.boot.log</span>
              </div>
              <div className="space-y-1 min-h-[120px]">
                {bootLines.map((line, i) =>
                  visibleLines.includes(i) && (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`text-xs font-mono leading-relaxed ${line.color}`}
                    >
                      {line.text}
                    </motion.div>
                  )
                )}
                {!done && (
                  <motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-xs font-mono text-cyan-400"
                  >▊</motion.span>
                )}
              </div>
            </div>

            <div className="w-full">
              <div className="flex justify-between text-xs font-mono text-slate-600 mb-2">
                <span>SYSTEM BOOT</span>
                <span style={{ color: '#00D4FF' }}>{progress}%</span>
              </div>
              <div className="h-px bg-slate-800 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: 'linear-gradient(90deg, #00D4FF, #38BDF8)',
                    boxShadow: '0 0 10px rgba(0,212,255,0.5)',
                    width: `${progress}%`
                  }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
