'use client'
import { motion } from 'framer-motion'

interface HudRingProps {
  size?: number
  color?: string
  duration?: number
  reverse?: boolean
  dashes?: number
  className?: string
}

export function HudRing({
  size = 200,
  color = 'rgba(0,212,255,0.2)',
  duration = 20,
  reverse = false,
  dashes = 12,
  className = ''
}: HudRingProps) {
  const circumference = Math.PI * size
  const dashArray = `${circumference / dashes * 0.6} ${circumference / dashes * 0.4}`

  return (
    <motion.div
      className={`absolute pointer-events-none ${className}`}
      animate={{ rotate: reverse ? -360 : 360 }}
      transition={{ duration, repeat: Infinity, ease: 'linear' }}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={size / 2 - 2}
          fill="none"
          stroke={color}
          strokeWidth="1"
          strokeDasharray={dashArray}
        />
        <circle
          cx={size / 2}
          cy={2}
          r="2.5"
          fill={color}
          style={{ filter: `drop-shadow(0 0 4px ${color})` }}
        />
      </svg>
    </motion.div>
  )
}
