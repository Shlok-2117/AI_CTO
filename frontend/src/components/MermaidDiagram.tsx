'use client'

import { useEffect, useRef, useState } from 'react'

function cleanMermaid(code: string): string {
  return code
    .replace(/```mermaid\n?/gi, '')
    .replace(/```\n?/g, '')
    .replace(/‑/g, '-')
    .replace(/–/g, '--')
    .replace(/—/g, '--')
    .replace(/'/g, "'")
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/"/g, '"')
    .replace(/ /g, ' ')
    .replace(/…/g, '...')
    .replace(/‑>/g, '-->')
    .replace(/–>/g, '-->')
    .replace(/—>/g, '-->')
    .replace(/=>/g, '-->')
    .replace(/- >/g, '-->')
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
    .trim()
}

const FALLBACK_DIAGRAM = `graph TD
    Client[Web Client] --> Gateway[API Gateway]
    Gateway --> Auth[Auth Service]
    Gateway --> Core[Core Service]
    Core --> DB[(PostgreSQL)]
    Core --> Cache[(Redis)]`

export default function MermaidDiagram({
  diagram,
  title,
}: {
  diagram: string
  title?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'done' | 'fallback'>('loading')
  const [fallbackCode, setFallbackCode] = useState('')
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [zoom, setZoom] = useState(100)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isFullscreen) return
      if (e.key === 'Escape') {
        setIsFullscreen(false)
        setZoom(100)
      }
      if (e.key === '+' || e.key === '=') {
        setZoom(z => Math.min(300, z + 25))
      }
      if (e.key === '-') {
        setZoom(z => Math.max(25, z - 25))
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isFullscreen])

  useEffect(() => {
    if (!diagram) return

    let cancelled = false

    const tryRender = async (code: string, attempt: number): Promise<boolean> => {
      return new Promise((resolve) => {
        try {
          const win = window as any
          if (!win.mermaid) { resolve(false); return }

          win.mermaid.initialize({
            startOnLoad: false,
            theme: 'dark',
            securityLevel: 'loose',
            suppressErrorRendering: true,
            themeVariables: {
              primaryColor: '#00ffff22',
              primaryTextColor: '#ffffff',
              primaryBorderColor: '#00ffff',
              lineColor: '#00ffff88',
              background: '#0a0a1a',
              mainBkg: '#0d1117',
              nodeBorder: '#00ffff',
              fontSize: '14px',
            },
          })

          const id = `mermaid_${Date.now()}_${attempt}`
          const temp = document.createElement('div')
          temp.id = id
          temp.style.cssText = 'position:fixed;top:-9999px;left:-9999px;'
          document.body.appendChild(temp)

          win.mermaid.render(id, code).then(
            ({ svg }: { svg: string }) => {
              if (document.body.contains(temp)) document.body.removeChild(temp)
              if (!cancelled && containerRef.current) {
                containerRef.current.innerHTML = svg
                const svgEl = containerRef.current.querySelector('svg')
                if (svgEl) {
                  svgEl.style.maxWidth = '100%'
                  svgEl.style.height = 'auto'
                  svgEl.removeAttribute('width')
                  svgEl.removeAttribute('height')
                }
              }
              resolve(true)
            },
            () => {
              if (document.body.contains(temp)) document.body.removeChild(temp)
              resolve(false)
            }
          )
        } catch {
          resolve(false)
        }
      })
    }

    const run = async () => {
      // Wait for mermaid CDN to load (polls every 200ms, up to 8s)
      let waited = 0
      while (!(window as any).mermaid && waited < 8000) {
        await new Promise(r => setTimeout(r, 200))
        waited += 200
      }

      if (cancelled) return

      const cleaned = cleanMermaid(diagram)

      // Attempt 1: cleaned diagram
      const ok1 = await tryRender(cleaned, 1)
      if (ok1) { setStatus('done'); return }

      if (cancelled) return

      // Attempt 2: hardcoded fallback diagram
      const ok2 = await tryRender(FALLBACK_DIAGRAM, 2)
      if (ok2) { setStatus('done'); return }

      if (cancelled) return

      // All failed — show code
      setFallbackCode(cleaned || diagram)
      setStatus('fallback')
    }

    // Inject CDN script if mermaid isn't already loaded
    if (!(window as any).mermaid) {
      const existing = document.querySelector('script[data-mermaid="true"]')
      if (!existing) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
        script.setAttribute('data-mermaid', 'true')
        document.head.appendChild(script)
      }
    }

    run()

    return () => { cancelled = true }
  }, [diagram])

  if (!diagram) return null

  return (
    <>
      <div>
        {title && (
          <div style={{ color: 'rgba(0,212,255,0.4)', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '8px' }}>
            {title}
          </div>
        )}

        {status === 'loading' && (
          <div style={{
            padding: '20px',
            textAlign: 'center',
            color: '#00ffff66',
            border: '1px solid #00ffff22',
            borderRadius: '8px',
            fontSize: '13px',
          }}>
            ⚡ Rendering diagram...
          </div>
        )}

        {status === 'fallback' && (
          <div style={{
            background: '#0a0a1a',
            border: '1px solid rgba(0,255,255,0.2)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{ color: '#00ffff', marginBottom: '8px', fontSize: '12px', fontFamily: 'sans-serif' }}>
              📊 Copy and paste at{' '}
              <a
                href="https://mermaid.live"
                target="_blank"
                rel="noreferrer"
                style={{ color: '#00ffff', textDecoration: 'underline' }}
              >
                mermaid.live
              </a>
              {' '}to view the diagram
            </div>
            <pre style={{
              fontFamily: 'monospace',
              fontSize: '11px',
              color: 'rgba(0,255,255,0.8)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: '250px',
              overflowY: 'auto',
              margin: 0,
            }}>
              {fallbackCode}
            </pre>
          </div>
        )}

        {/*
          The outer div hides/shows based on status. The inner containerRef div is
          ALWAYS in the DOM so containerRef.current is non-null when tryRender's
          .then() callback fires and writes innerHTML (status is still 'loading'
          at that point, so a conditional render would leave the ref unattached).
        */}
        <div style={{ display: status === 'done' ? 'block' : 'none' }}>
          <div
            onClick={() => setIsFullscreen(true)}
            style={{
              position: 'relative',
              cursor: 'zoom-in',
            }}
          >
            <div style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              background: 'rgba(0,255,255,0.1)',
              border: '1px solid rgba(0,255,255,0.3)',
              borderRadius: '4px',
              padding: '2px 8px',
              fontSize: '10px',
              color: '#00ffff99',
              letterSpacing: '1px',
              pointerEvents: 'none',
              zIndex: 1,
            }}>
              CLICK TO EXPAND
            </div>
            <div
              ref={containerRef}
              style={{
                maxWidth: '100%',
                overflowX: 'auto',
                background: '#0d1117',
                borderRadius: '8px',
                padding: '12px',
              }}
            />
          </div>
        </div>
      </div>

      {isFullscreen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsFullscreen(false)
          }}
        >
          {/* TOP BAR */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            borderBottom: '1px solid #00ffff22',
            background: '#0a0a1a',
          }}>
            <span style={{
              color: '#00ffff',
              fontSize: '12px',
              letterSpacing: '2px',
            }}>
              {title || 'DIAGRAM'} — FULLSCREEN
            </span>

            {/* ZOOM CONTROLS */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <button
                onClick={() => setZoom(z => Math.max(25, z - 25))}
                style={{
                  background: 'transparent',
                  border: '1px solid #00ffff44',
                  color: '#00ffff',
                  borderRadius: '4px',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >−</button>

              <span style={{
                color: '#00ffff',
                fontSize: '12px',
                minWidth: '45px',
                textAlign: 'center',
              }}>
                {zoom}%
              </span>

              <button
                onClick={() => setZoom(z => Math.min(300, z + 25))}
                style={{
                  background: 'transparent',
                  border: '1px solid #00ffff44',
                  color: '#00ffff',
                  borderRadius: '4px',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  fontSize: '16px',
                }}
              >+</button>

              <button
                onClick={() => setZoom(100)}
                style={{
                  background: 'transparent',
                  border: '1px solid #00ffff44',
                  color: '#00ffff',
                  borderRadius: '4px',
                  padding: '4px 10px',
                  cursor: 'pointer',
                  fontSize: '11px',
                }}
              >RESET</button>

              {/* CLOSE BUTTON */}
              <button
                onClick={() => {
                  setIsFullscreen(false)
                  setZoom(100)
                }}
                style={{
                  background: 'transparent',
                  border: '1px solid #ff444444',
                  color: '#ff4444',
                  borderRadius: '4px',
                  width: '28px',
                  height: '28px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  marginLeft: '8px',
                }}
              >✕</button>
            </div>
          </div>

          {/* DIAGRAM CONTENT */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}>
            <div
              style={{
                transform: `scale(${zoom / 100})`,
                transformOrigin: 'center center',
                transition: 'transform 0.2s ease',
              }}
              dangerouslySetInnerHTML={{
                __html: containerRef.current?.innerHTML || ''
              }}
            />
          </div>

          {/* BOTTOM HINT */}
          <div style={{
            padding: '8px 20px',
            borderTop: '1px solid #00ffff22',
            background: '#0a0a1a',
            display: 'flex',
            gap: '20px',
            fontSize: '10px',
            color: '#00ffff44',
            letterSpacing: '1px',
          }}>
            <span>ESC — CLOSE</span>
            <span>+ / − — ZOOM</span>
            <span>CLICK OUTSIDE — CLOSE</span>
            <span>CURRENT: {zoom}%</span>
          </div>
        </div>
      )}
    </>
  )
}
