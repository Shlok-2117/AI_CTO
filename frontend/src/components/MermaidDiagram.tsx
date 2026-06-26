'use client'

import { useEffect, useRef, useState } from 'react'

function cleanMermaid(code: string): string {
  return code
    .replace(/```mermaid\n?/gi, '')
    .replace(/```\n?/g, '')
    .replace(/‑/g, '-')
    .replace(/–/g, '--')
    .replace(/—/g, '--')
    .replace(/‘/g, "'")
    .replace(/’/g, "'")
    .replace(/“/g, '"')
    .replace(/”/g, '"')
    .replace(/ /g, ' ')
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
        containerRef div is ALWAYS in the DOM (display:none when not 'done').
        This ensures containerRef.current is non-null when tryRender's .then()
        callback fires and writes innerHTML — status is still 'loading' at that
        point, so a conditional render would leave the ref unattached.
      */}
      <div
        ref={containerRef}
        style={{
          display: status === 'done' ? 'block' : 'none',
          maxWidth: '100%',
          overflowX: 'auto',
          background: '#0d1117',
          borderRadius: '8px',
          padding: '12px',
        }}
      />
    </div>
  )
}
