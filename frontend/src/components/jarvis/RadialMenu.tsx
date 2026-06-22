'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Zap, History, Star, Volume2, Download, Home } from 'lucide-react'

const MENU_ITEMS = [
  { icon: Home,     label: 'HOME',     angle: -90,  color: '#F87171', action: 'home'     },
  { icon: Zap,      label: 'GENERATE', angle: -45,  color: '#00D4FF', action: 'generate' },
  { icon: History,  label: 'HISTORY',  angle: 0,    color: '#38BDF8', action: 'history'  },
  { icon: Star,     label: 'FEEDBACK', angle: 45,   color: '#F59E0B', action: 'feedback' },
  { icon: Download, label: 'PDF',      angle: 90,   color: '#4ADE80', action: 'pdf'      },
  { icon: Volume2,  label: 'VOICE',    angle: 135,  color: '#A78BFA', action: 'voice'    },
] as const

const RADIUS = 90

interface RadialMenuProps {
  onGenerate?: () => void
  onFeedback?: () => void
  onPDF?: () => void
  onVoice?: () => void
}

export function RadialMenu({ onGenerate, onFeedback, onPDF, onVoice }: RadialMenuProps) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  function handleAction(action: string) {
    setOpen(false)
    switch (action) {
      case 'generate': onGenerate?.(); break
      case 'history':  router.push('/history'); break
      case 'feedback': onFeedback?.(); break
      case 'pdf':      onPDF?.(); break
      case 'voice':    onVoice?.(); break
      case 'home':     router.push('/'); break
    }
  }

  return (
    <div className="fixed bottom-6 left-6 z-[998]">
      <AnimatePresence>
        {open && (
          <>
            {/* Dim backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[-1]"
              style={{ background: 'rgba(3,7,18,0.4)', backdropFilter: 'blur(4px)' }}
              onClick={() => setOpen(false)}
            />

            {/* Radial items */}
            {MENU_ITEMS.map((item, i) => {
              const rad = (item.angle * Math.PI) / 180
              const x = Math.cos(rad) * RADIUS
              const y = Math.sin(rad) * RADIUS
              const Icon = item.icon
              return (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  animate={{ opacity: 1, x, y, scale: 1 }}
                  exit={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                  transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 20 }}
                  style={{ position: 'absolute', bottom: 0, left: 0 }}
                >
                  <button
                    onClick={() => handleAction(item.action)}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150"
                      style={{
                        background: `${item.color}15`,
                        border: `1px solid ${item.color}40`,
                        boxShadow: `0 0 20px ${item.color}20`,
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = `${item.color}28`
                        e.currentTarget.style.boxShadow = `0 0 30px ${item.color}50`
                        e.currentTarget.style.transform = 'scale(1.15)'
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = `${item.color}15`
                        e.currentTarget.style.boxShadow = `0 0 20px ${item.color}20`
                        e.currentTarget.style.transform = 'scale(1)'
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: item.color }} />
                    </div>
                    <span
                      className="text-[7px] font-mono font-bold tracking-widest opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ color: item.color }}
                    >
                      {item.label}
                    </span>
                  </button>
                </motion.div>
              )
            })}

            {/* Web thread SVG */}
            <svg
              className="absolute pointer-events-none"
              style={{
                bottom: 24, left: 24,
                width: (RADIUS + 30) * 2,
                height: (RADIUS + 30) * 2,
                transform: 'translate(-50%, 50%)',
                opacity: 0.15,
              }}
              viewBox={`${-(RADIUS + 30)} ${-(RADIUS + 30)} ${(RADIUS + 30) * 2} ${(RADIUS + 30) * 2}`}
            >
              {MENU_ITEMS.map(item => {
                const rad = (item.angle * Math.PI) / 180
                return (
                  <line key={item.label}
                    x1="0" y1="0"
                    x2={Math.cos(rad) * RADIUS}
                    y2={Math.sin(rad) * RADIUS}
                    stroke={item.color} strokeWidth="0.5" strokeDasharray="3 3"
                  />
                )
              })}
              <circle cx="0" cy="0" r={RADIUS}
                fill="none" stroke="rgba(0,212,255,0.3)"
                strokeWidth="0.5" strokeDasharray="4 8" />
            </svg>
          </>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        onClick={() => setOpen(o => !o)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        animate={open ? { rotate: 45 } : { rotate: 0 }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: open ? 'rgba(220,38,38,0.12)' : 'rgba(0,212,255,0.08)',
          border: open ? '1.5px solid rgba(220,38,38,0.5)' : '1.5px solid rgba(0,212,255,0.35)',
          boxShadow: open
            ? '0 0 30px rgba(220,38,38,0.25), 0 0 60px rgba(59,130,246,0.15)'
            : '0 0 30px rgba(0,212,255,0.15)',
        }}
        title="Quick Menu"
      >
        {open && (
          <>
            <motion.div
              animate={{ scale: [1, 2.5], opacity: [0.4, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(220,38,38,0.4)' }}
            />
            <motion.div
              animate={{ scale: [1, 2.5], opacity: [0.3, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(59,130,246,0.3)' }}
            />
          </>
        )}

        {/* Radial web icon */}
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="3"
            fill={open ? 'rgba(220,38,38,0.8)' : 'rgba(0,212,255,0.8)'}
            style={{ filter: `drop-shadow(0 0 4px ${open ? '#dc2626' : '#00D4FF'})` }}
          />
          {[0, 60, 120, 180, 240, 300].map(angle => {
            const rad = (angle * Math.PI) / 180
            return (
              <line key={angle}
                x1={12} y1={12}
                x2={12 + Math.cos(rad) * 10}
                y2={12 + Math.sin(rad) * 10}
                stroke={open ? 'rgba(220,38,38,0.6)' : 'rgba(0,212,255,0.6)'}
                strokeWidth="1"
              />
            )
          })}
          <circle cx="12" cy="12" r="10"
            fill="none"
            stroke={open ? 'rgba(220,38,38,0.3)' : 'rgba(0,212,255,0.3)'}
            strokeWidth="0.5" strokeDasharray="3 3"
          />
        </svg>
      </motion.button>
    </div>
  )
}
