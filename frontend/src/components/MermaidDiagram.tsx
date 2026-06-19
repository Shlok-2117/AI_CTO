'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  diagram: string
  title: string
}

export default function MermaidDiagram({ diagram, title }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'fallback'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (!diagram) { setStatus('fallback'); return }

    const cleanDiagram = diagram
      .replace(/\\n/g, '\n')
      .replace(/```mermaid\n?/gi, '')
      .replace(/```\n?/g, '')
      .trim()

    if (!cleanDiagram) { setStatus('fallback'); return }

    function render(mermaid: any) {
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        themeVariables: {
          darkMode: true,
          background: '#030712',
          primaryColor: '#0B1120',
          primaryTextColor: '#F8FAFC',
          primaryBorderColor: '#00D4FF',
          lineColor: '#00D4FF',
          secondaryColor: '#0B1120',
          tertiaryColor: '#0B1120',
        },
        er: { diagramPadding: 20, layoutDirection: 'TB', minEntityWidth: 100 },
        flowchart: { curve: 'basis' },
      })

      const id = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)
      mermaid.render(id, cleanDiagram)
        .then(({ svg }: { svg: string }) => {
          if (ref.current) {
            ref.current.innerHTML = svg
            const svgEl = ref.current.querySelector('svg')
            if (svgEl) {
              svgEl.style.maxWidth = '100%'
              svgEl.style.background = 'transparent'
            }
          }
          setStatus('success')
        })
        .catch((err: any) => {
          console.error('Mermaid render error:', err)
          setErrorMsg(err?.message || 'Parse error')
          setStatus('fallback')
        })
    }

    const win = window as any
    if (win.mermaid) { render(win.mermaid); return }

    const existing = document.getElementById('mermaid-cdn') as HTMLScriptElement | null
    if (existing) {
      const wait = () => { if (win.mermaid) render(win.mermaid); else setTimeout(wait, 100) }
      setTimeout(wait, 100)
      return
    }

    const script = document.createElement('script')
    script.id = 'mermaid-cdn'
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10.6.1/dist/mermaid.min.js'
    script.onload = () => setTimeout(() => { if (win.mermaid) render(win.mermaid) }, 200)
    script.onerror = () => { setStatus('error'); setErrorMsg('Failed to load Mermaid from CDN') }
    document.head.appendChild(script)
  }, [diagram])

  const cleanForDisplay = diagram?.replace(/\\n/g, '\n') || ''
  const liveUrl = `https://mermaid.live/edit#${typeof window !== 'undefined' ? btoa(unescape(encodeURIComponent(cleanForDisplay))) : ''}`

  return (
    <div>
      {title && (
        <div className="text-[10px] font-mono tracking-widest mb-4 uppercase"
          style={{color: 'rgba(0,212,255,0.5)'}}>
          {title}
        </div>
      )}

      {status === 'loading' && (
        <div className="flex items-center gap-3 p-4 rounded"
          style={{background: 'rgba(0,212,255,0.02)', border: '1px solid rgba(0,212,255,0.08)'}}>
          <div className="w-3 h-3 rounded-full animate-spin"
            style={{border: '2px solid rgba(0,212,255,0.2)', borderTopColor: '#00D4FF'}} />
          <span className="text-xs font-mono" style={{color: 'rgba(0,212,255,0.5)'}}>
            RENDERING DIAGRAM...
          </span>
        </div>
      )}

      {status === 'error' && (
        <div className="p-4 rounded" style={{background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.15)'}}>
          <p className="text-xs font-mono mb-2" style={{color: 'rgba(248,113,113,0.6)'}}>
            RENDER ERROR: {errorMsg}
          </p>
          <pre className="text-xs font-mono whitespace-pre-wrap" style={{color: 'rgba(0,212,255,0.4)', maxHeight: 200, overflow: 'auto'}}>
            {cleanForDisplay}
          </pre>
        </div>
      )}

      {status === 'fallback' && (
        <div className="p-4 rounded" style={{background: 'rgba(0,212,255,0.02)', border: '1px solid rgba(0,212,255,0.08)'}}>
          <div className="text-[9px] font-mono mb-2" style={{color: 'rgba(0,212,255,0.3)'}}>
            MERMAID SYNTAX — PASTE AT mermaid.live TO RENDER
          </div>
          <pre className="text-xs font-mono whitespace-pre-wrap overflow-auto" style={{color: 'rgba(0,212,255,0.5)', maxHeight: 300}}>
            {cleanForDisplay}
          </pre>
          <a
            href={liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-3 text-[10px] font-mono uppercase tracking-widest px-3 py-1.5 rounded"
            style={{color: '#00D4FF', border: '1px solid rgba(0,212,255,0.2)', background: 'rgba(0,212,255,0.05)'}}
          >
            ↗ OPEN IN MERMAID LIVE
          </a>
        </div>
      )}

      <div
        ref={ref}
        className={status === 'success' ? 'block' : 'hidden'}
        style={{
          background: 'rgba(0,0,0,0.2)',
          borderRadius: 8,
          padding: 16,
          border: '1px solid rgba(0,212,255,0.08)',
          overflowX: 'auto'
        }}
      />
    </div>
  )
}
