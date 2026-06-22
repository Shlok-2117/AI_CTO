'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function SenseAlert() {
  const [alerts, setAlerts] = useState<{ id: number; x: number; y: number }[]>([])
  const counterRef = useRef(0)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      const id = counterRef.current++
      setAlerts(prev => [...prev, { id, x: e.clientX, y: e.clientY }])
      setTimeout(() => {
        setAlerts(prev => prev.filter(a => a.id !== id))
      }, 1000)
    }
    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-[9990]">
      <AnimatePresence>
        {alerts.map(alert => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0.8, scale: 0 }}
            animate={{ opacity: 0, scale: 3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              left: alert.x - 20,
              top: alert.y - 20,
              width: 40,
              height: 40,
              borderRadius: '50%',
              border: '1px solid rgba(0,212,255,0.6)',
              boxShadow: '0 0 10px rgba(0,212,255,0.4)',
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
