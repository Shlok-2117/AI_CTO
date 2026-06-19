'use client'

export function AnimatedCounter({ value, suffix = '' }: { value: string; suffix?: string }) {
  return <span>{value}{suffix}</span>
}
