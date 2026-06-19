'use client'

export function Marquee({ items }: { items: string[] }) {
  return (
    <div className="overflow-hidden py-3">
      <div className="flex animate-marquee whitespace-nowrap gap-8">
        {[...items, ...items].map((item, i) => (
          <span key={i} className="text-sm text-white/20 font-mono flex-shrink-0">
            <span className="text-violet-500 mr-2">✦</span>{item}
          </span>
        ))}
      </div>
    </div>
  )
}
