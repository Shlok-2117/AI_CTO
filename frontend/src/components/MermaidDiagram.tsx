'use client'
import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Maximize2, ZoomIn, ZoomOut } from 'lucide-react'

interface Props {
  diagram: string
  title?: string
}

export default function MermaidDiagram({ diagram, title }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [svg, setSvg] = useState<string>('')
  const [error, setError] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [zoom, setZoom] = useState(1)
  const idRef = useRef(`mermaid-${Math.random().toString(36).slice(2)}`)

  useEffect(() => {
    if (!diagram?.trim()) return
    renderDiagram()
  }, [diagram])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && fullscreen) setFullscreen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [fullscreen])

  function renderDiagram() {
    const loadAndRender = () => {
      const win = window as any
      if (!win.mermaid) return
      win.mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
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
      win.mermaid.render(idRef.current, diagram)
        .then(({ svg: svgCode }: { svg: string }) => {
          setSvg(svgCode)
          setError(false)
        })
        .catch(() => setError(true))
    }

    const win = window as any
    if (win.mermaid) { loadAndRender(); return }

    const existing = document.querySelector('script[data-mermaid]')
    if (existing) { existing.addEventListener('load', loadAndRender); return }

    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
    script.setAttribute('data-mermaid', 'true')
    script.onload = loadAndRender
    script.onerror = () => setError(true)
    document.head.appendChild(script)
  }

  if (!diagram?.trim()) return null

  return (
    <>
      <div>
        {title && (
          <div className="flex items-center justify-between mb-3">
            <div className="text-[9px] font-mono tracking-widest"
              style={{ color: 'rgba(0,212,255,0.4)' }}>
              {title}
            </div>
            <button
              onClick={() => { setZoom(1); setFullscreen(true) }}
              className="flex items-center gap-1.5 text-[9px] font-mono px-3 py-1.5 rounded-lg transition-all"
              style={{
                color: 'rgba(0,212,255,0.6)',
                border: '1px solid rgba(0,212,255,0.15)',
                background: 'rgba(0,212,255,0.04)',
              }}>
              <Maximize2 className="w-3.5 h-3.5" />
              FULLSCREEN
            </button>
          </div>
        )}

        {error ? (
          <div className="rounded-lg p-4 text-center"
            style={{ background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.1)' }}>
            <p className="text-xs font-mono mb-3" style={{ color: 'rgba(248,113,113,0.6)' }}>
              Could not render diagram
            </p>
            <a href={`https://mermaid.live`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] font-mono px-3 py-1.5 rounded transition-all inline-block"
              style={{
                color: '#00D4FF',
                border: '1px solid rgba(0,212,255,0.25)',
                background: 'rgba(0,212,255,0.06)',
              }}>
              Open in Mermaid Live Editor →
            </a>
          </div>
        ) : svg ? (
          <div
            ref={containerRef}
            className="rounded-lg overflow-auto cursor-zoom-in"
            style={{
              background: 'rgba(3,7,18,0.6)',
              border: '1px solid rgba(0,212,255,0.08)',
              padding: '16px',
              maxHeight: '400px',
            }}
            onClick={() => { setZoom(1); setFullscreen(true) }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="rounded-lg flex items-center justify-center h-32"
            style={{ background: 'rgba(0,212,255,0.03)', border: '1px solid rgba(0,212,255,0.08)' }}>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full animate-ping"
                style={{ background: 'rgba(0,212,255,0.4)' }} />
              <span className="text-[10px] font-mono" style={{ color: 'rgba(0,212,255,0.4)' }}>
                Rendering diagram...
              </span>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {fullscreen && svg && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center"
            style={{ background: 'rgba(3,7,18,0.95)', backdropFilter: 'blur(20px)' }}
            onClick={() => setFullscreen(false)}
          >
            <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10"
              style={{ borderBottom: '1px solid rgba(0,212,255,0.08)', background: 'rgba(11,17,32,0.9)' }}>
              <div>
                <div className="text-xs font-mono font-black tracking-widest" style={{ color: '#00D4FF' }}>
                  {title || 'DIAGRAM'}
                </div>
                <div className="text-[9px] font-mono mt-0.5" style={{ color: 'rgba(248,250,252,0.2)' }}>
                  Click outside or press ESC to close
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={e => { e.stopPropagation(); setZoom(z => Math.max(0.5, z - 0.25)) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
                  <ZoomOut className="w-4 h-4" />
                </button>
                <span className="text-[10px] font-mono w-12 text-center" style={{ color: 'rgba(0,212,255,0.6)' }}>
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={e => { e.stopPropagation(); setZoom(z => Math.min(3, z + 0.25)) }}
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)', color: '#00D4FF' }}>
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setFullscreen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center ml-2"
                  style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div
              className="w-full h-full overflow-auto pt-16 pb-8 px-8"
              onClick={e => e.stopPropagation()}
            >
              <div
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'top center',
                  transition: 'transform 0.2s ease',
                  minHeight: '100%',
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'center',
                }}
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
