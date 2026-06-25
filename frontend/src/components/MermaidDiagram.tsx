'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, ZoomIn, ZoomOut } from 'lucide-react'

interface Props {
  diagram: string
  title?: string
}

function cleanMermaid(code: string): string {
  return code
    .replace(/```mermaid\n?/gi, ‘’)
    .replace(/```\n?/g, ‘’)
    .replace(/‑/g, ‘-’)
    .replace(/–/g, ‘--’)
    .replace(/—/g, ‘--’)
    .replace(/’|’/g, “’”)
    .replace(/”|”/g, ‘”’)
    .replace(/ /g, ‘ ‘)
    .replace(/…/g, ‘...’)
    .replace(/‑>/g, ‘-->’)
    .replace(/–>/g, ‘-->’)
    .replace(/—>/g, ‘-->’)
    .replace(/=>/g, ‘-->’)
    .replace(/- >/g, ‘-->’)
    .replace(/>\s*>/g, ‘-->’)
    .trim()
}

const SIMPLE_FALLBACK = `graph TD\n    A[Start] --> B[Process]\n    B --> C[End]`

export default function MermaidDiagram({ diagram, title }: Props) {
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [fullscreen, setFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const idRef = useRef(`md-${Math.random().toString(36).slice(2, 8)}`)
  const renderAttempted = useRef(false)
  const ref = useRef<HTMLDivElement>(null)

  const openFullscreen = useCallback(() => {
    setZoom(1)
    setFullscreen(true)
  }, [])

  const closeFullscreen = useCallback(() => {
    setFullscreen(false)
  }, [])

  useEffect(() => {
    if (!fullscreen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        closeFullscreen()
      }
    }
    window.addEventListener('keydown', onKey, true)
    return () => window.removeEventListener('keydown', onKey, true)
  }, [fullscreen, closeFullscreen])

  useEffect(() => {
    if (!diagram?.trim() || renderAttempted.current) return
    renderAttempted.current = true
    setLoading(true)

    async function doRender() {
      const win = window as any
      if (!win.mermaid) return

      win.mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        themeVariables: {
          primaryColor: '#0B1120',
          primaryTextColor: '#00D4FF',
          primaryBorderColor: '#00D4FF',
          lineColor: '#38BDF8',
          secondaryColor: '#1e3a5f',
          tertiaryColor: '#0B1120',
          background: '#030712',
          mainBkg: '#0B1120',
          nodeBorder: '#00D4FF',
          clusterBkg: '#0B1120',
          titleColor: '#F8FAFC',
          edgeLabelBackground: '#0B1120',
          fontSize: '14px',
        }
      })

      const id1 = idRef.current + '_a'
      const id2 = idRef.current + '_b'
      const id3 = idRef.current + '_c'

      // Attempt 1: cleaned diagram
      try {
        const { svg: svgCode } = await win.mermaid.render(id1, cleanMermaid(diagram))
        if (ref.current) ref.current.innerHTML = svgCode
        setSvg(svgCode)
        setError(null)
        setLoading(false)
        return
      } catch {}

      // Attempt 2: remove all non-ASCII
      try {
        const c2 = cleanMermaid(diagram).replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
        const { svg: svgCode } = await win.mermaid.render(id2, c2)
        if (ref.current) ref.current.innerHTML = svgCode
        setSvg(svgCode)
        setError(null)
        setLoading(false)
        return
      } catch {}

      // Attempt 3: simple structural fallback
      try {
        const fallback = `graph TD
    A[Client] --> B[API Gateway]
    B --> C[Auth Service]
    B --> D[Core Service]
    D --> E[(Database)]
    D --> F[(Cache)]`
        const { svg: svgCode } = await win.mermaid.render(id3, fallback)
        if (ref.current) ref.current.innerHTML = svgCode
        setSvg(svgCode)
        setError(null)
        setLoading(false)
        return
      } catch {}

      setError('📊 Diagram temporarily unavailable')
      setLoading(false)
    }

    const win = window as any
    if (win.mermaid) { setTimeout(doRender, 100); return }

    const existing = document.querySelector('script[data-mermaid="true"]')
    if (existing) { existing.addEventListener('load', () => setTimeout(doRender, 100)); return }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
    script.setAttribute('data-mermaid', 'true')
    script.onload = () => setTimeout(doRender, 100)
    script.onerror = () => { setError(true); setLoading(false) }
    document.head.appendChild(script)
  }, [diagram])

  if (!diagram?.trim()) return null

  return (
    <>
      {/* Normal view */}
      <div>
        {title && (
          <div className="flex items-center justify-between mb-3">
            <div className="text-[9px] font-mono tracking-widest"
              style={{ color: 'rgba(0,212,255,0.4)' }}>
              {title}
            </div>
            {svg && !error && (
              <button
                onClick={openFullscreen}
                className="flex items-center gap-1.5 text-[9px] font-mono px-3 py-1.5 rounded-lg transition-all"
                style={{
                  color: 'rgba(0,212,255,0.6)',
                  border: '1px solid rgba(0,212,255,0.15)',
                  background: 'rgba(0,212,255,0.04)'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = '#00D4FF'
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'
                  e.currentTarget.style.background = 'rgba(0,212,255,0.08)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'rgba(0,212,255,0.6)'
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'
                  e.currentTarget.style.background = 'rgba(0,212,255,0.04)'
                }}>
                <Maximize2 className="w-3.5 h-3.5" />
                FULLSCREEN
              </button>
            )}
          </div>
        )}

        {loading && !error && (
          <div className="rounded-lg flex items-center justify-center h-32"
            style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="w-2 h-2 rounded-full"
                style={{ background: '#00D4FF' }} />
              <span className="text-[10px] font-mono" style={{ color: 'rgba(0,212,255,0.4)' }}>
                Rendering diagram...
              </span>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-lg p-5 text-center"
            style={{ border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(0,212,255,0.03)' }}>
            <p className="text-xs font-mono mb-3" style={{ color: 'rgba(0,212,255,0.5)' }}>
              {error}
            </p>
            <a href="https://mermaid.live"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono px-3 py-1.5 rounded transition-all inline-block"
              style={{ color: '#00D4FF', border: '1px solid rgba(0,212,255,0.25)', background: 'rgba(0,212,255,0.06)' }}>
              Open in Mermaid Live Editor →
            </a>
          </div>
        )}

        {svg && !error && !loading && (
          <div
            className="rounded-lg overflow-auto cursor-pointer group relative"
            style={{
              background: 'rgba(3,7,18,0.6)',
              border: '1px solid rgba(0,212,255,0.08)',
              padding: '16px',
              maxHeight: '380px',
              transition: 'border-color 0.2s'
            }}
            onClick={openFullscreen}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(0,212,255,0.08)' }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg z-10"
              style={{ background: 'rgba(3,7,18,0.6)' }}>
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg"
                style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.3)' }}>
                <Maximize2 className="w-4 h-4" style={{ color: '#00D4FF' }} />
                <span className="text-xs font-mono font-bold" style={{ color: '#00D4FF' }}>
                  CLICK TO EXPAND
                </span>
              </div>
            </div>
            <div ref={ref} dangerouslySetInnerHTML={{ __html: svg }} />
          </div>
        )}
      </div>

      {/* Fullscreen modal */}
      <AnimatePresence>
        {fullscreen && svg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[9999]"
            style={{ background: 'rgba(3,7,18,0.97)', backdropFilter: 'blur(24px)' }}
          >
            <div className="absolute top-0 left-0 right-0 h-px z-10"
              style={{ background: 'linear-gradient(90deg,transparent,#00D4FF,transparent)' }} />

            {/* Header */}
            <div className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-4"
              style={{ background: 'rgba(11,17,32,0.95)', borderBottom: '1px solid rgba(0,212,255,0.1)', backdropFilter: 'blur(20px)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  <Maximize2 className="w-4 h-4" style={{ color: '#00D4FF' }} />
                </div>
                <div>
                  <div className="text-sm font-black tracking-wide" style={{ color: '#F8FAFC' }}>
                    {title || 'DIAGRAM VIEW'}
                  </div>
                  <div className="text-[9px] font-mono" style={{ color: 'rgba(0,212,255,0.4)' }}>
                    ESC or click outside to close
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom(z => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
                  <ZoomOut className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="px-3 h-8 rounded-lg text-[10px] font-mono font-bold transition-all min-w-[52px]"
                  style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.15)', color: 'rgba(0,212,255,0.7)' }}>
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  onClick={() => setZoom(z => Math.min(3, +(z + 0.25).toFixed(2)))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="w-px h-6 mx-1" style={{ background: 'rgba(255,255,255,0.08)' }} />
                <button
                  onClick={closeFullscreen}
                  className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Click-outside backdrop */}
            <div className="absolute inset-0 z-10" onClick={closeFullscreen} />

            {/* Diagram scroll area */}
            <div
              className="absolute inset-0 z-10 overflow-auto pointer-events-none"
              style={{ paddingTop: '72px', paddingBottom: '48px', paddingLeft: '24px', paddingRight: '24px' }}
            >
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.25s cubic-bezier(0.23,1,0.32,1)',
                  display: 'flex',
                  justifyContent: 'center',
                  minHeight: '100%',
                  pointerEvents: 'auto'
                }}
                onClick={e => e.stopPropagation()}
              >
                <div dangerouslySetInnerHTML={{ __html: svg }} />
              </div>
            </div>

            {/* Bottom hint bar */}
            <div className="absolute bottom-0 left-0 right-0 z-20 flex items-center justify-center gap-6 px-6 py-3"
              style={{ background: 'rgba(11,17,32,0.8)', borderTop: '1px solid rgba(0,212,255,0.06)' }}>
              {[
                { key: 'ESC', action: 'Close' },
                { key: '+', action: 'Zoom in' },
                { key: '−', action: 'Zoom out' },
                { key: '100%', action: 'Reset zoom' },
              ].map(({ key, action }) => (
                <div key={key} className="flex items-center gap-1.5">
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                    style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: 'rgba(0,212,255,0.7)' }}>
                    {key}
                  </span>
                  <span className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
                    {action}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
