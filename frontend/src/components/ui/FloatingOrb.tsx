'use client'

export function FloatingOrb({ className = '' }: { className?: string }) {
  return (
    <div className={`absolute rounded-full blur-3xl opacity-20 animate-float pointer-events-none ${className}`} />
  )
}
