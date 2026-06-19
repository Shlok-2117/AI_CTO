'use client'
import { HudRing } from './HudRing'

export function HudOrb({ size = 300 }: { size?: number }) {
  return (
    <div
      className="relative pointer-events-none"
      style={{ width: size, height: size }}
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background: `radial-gradient(circle at 35% 35%, rgba(0,212,255,0.15) 0%, rgba(0,212,255,0.05) 40%, transparent 70%)`,
          border: '1px solid rgba(0,212,255,0.15)',
          boxShadow: '0 0 60px rgba(0,212,255,0.1), inset 0 0 60px rgba(0,212,255,0.05)',
        }}
      />
      <div
        className="absolute rounded-full animate-pulse-cyan"
        style={{
          inset: '25%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.2) 0%, transparent 70%)',
        }}
      />
      <HudRing size={size} color="rgba(0,212,255,0.15)" duration={25} dashes={16} className="inset-0" />
      <HudRing size={size * 0.75} color="rgba(56,189,248,0.2)" duration={18} reverse dashes={10} className="inset-[12.5%]" />
      <HudRing size={size * 0.5} color="rgba(245,158,11,0.15)" duration={12} dashes={8} className="inset-[25%]" />
      <svg className="absolute inset-0" width={size} height={size}>
        <line x1={size/2} y1={0} x2={size/2} y2={size} stroke="rgba(0,212,255,0.08)" strokeWidth="1" strokeDasharray="4 8" />
        <line x1={0} y1={size/2} x2={size} y2={size/2} stroke="rgba(0,212,255,0.08)" strokeWidth="1" strokeDasharray="4 8" />
      </svg>
    </div>
  )
}
