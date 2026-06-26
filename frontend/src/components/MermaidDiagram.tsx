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
    .trim()
}

// Poll until window.mermaid.render is available (CDN loads async)
function waitForMermaid(timeout = 10000): Promise<any> {
  return new Promise((resolve, reject) => {
    const start = Date.now()
    const check = () => {
      const win = window as any
      if (win.mermaid && typeof win.mermaid.render === 'function') {
        resolve(win.mermaid)
        return
      }
      if (Date.now() - start > timeout) {
        reject(new Error('Mermaid load timeout'))
        return
      }
      setTimeout(check, 100)
    }
    check()
  })
}

export default function MermaidDiagram({
  diagram,
  title,
}: {
  diagram: string
  title?: string
}) {
  // Container div is always in the DOM so ref.current is non-null when render() runs.
  // Status controls what's visually shown around it.
  const ref = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState<'loading' | 'success' | 'fallback'>('loading')
  const renderAttempted = useRef(false)

  useEffect(() => {
    if (!diagram?.trim() || renderAttempted.current) return
    renderAttempted.current = true

    // Inject the Mermaid CDN script if not already present
    const win = window as any
    if (!win.mermaid) {
      const existing = document.querySelector('script[data-mermaid="true"]')
      if (!existing) {
        const script = document.createElement('script')
        script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
        script.setAttribute('data-mermaid', 'true')
        document.head.appendChild(script)
      }
    }

    const render = async () => {
      try {
        // Wait until mermaid.render is actually callable (handles async CDN load)
        const mermaid = await waitForMermaid()

        const container = ref.current
        if (!container) { setStatus('fallback'); return }

        // Suppress Mermaid's built-in bomb/error UI
        try {
          if (mermaid?.mermaidAPI?.setConfig) {
            mermaid.mermaidAPI.setConfig({ suppressErrorRendering: true })
          }
        } catch {}

        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          suppressErrorRendering: true,
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
          },
        })

        // Attempt 1: cleaned diagram
        const cleaned = cleanMermaid(diagram)
        const tmp1 = document.createElement('div')
        tmp1.id = 'mmd_' + Math.random().toString(36).slice(2)
        tmp1.style.cssText = 'position:absolute;visibility:hidden;left:-9999px'
        document.body.appendChild(tmp1)
        try {
          const { svg } = await mermaid.render(tmp1.id, cleaned)
          document.body.removeChild(tmp1)
          container.innerHTML = svg
          const svgEl = container.querySelector('svg')
          if (svgEl) { svgEl.style.maxWidth = '100%'; svgEl.style.height = 'auto' }
          setStatus('success')
          return
        } catch {
          if (document.body.contains(tmp1)) document.body.removeChild(tmp1)
        }

        // Attempt 2: strip all non-ASCII
        const ascii = cleaned.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, '')
        const tmp2 = document.createElement('div')
        tmp2.id = 'mmd_' + Math.random().toString(36).slice(2)
        tmp2.style.cssText = 'position:absolute;visibility:hidden;left:-9999px'
        document.body.appendChild(tmp2)
        try {
          const { svg } = await mermaid.render(tmp2.id, ascii)
          document.body.removeChild(tmp2)
          container.innerHTML = svg
          const svgEl = container.querySelector('svg')
          if (svgEl) { svgEl.style.maxWidth = '100%'; svgEl.style.height = 'auto' }
          setStatus('success')
          return
        } catch {
          if (document.body.contains(tmp2)) document.body.removeChild(tmp2)
        }

        // Both attempts failed — show code fallback
        setStatus('fallback')
      } catch {
        // waitForMermaid timed out or unexpected error
        setStatus('fallback')
      }
    }

    render()
  }, [diagram])

  if (!diagram?.trim()) return null

  return (
    <div>
      {title && (
        <div style={{ color: 'rgba(0,212,255,0.4)', fontSize: '9px', fontFamily: 'monospace', letterSpacing: '0.1em', marginBottom: '8px' }}>
          {title}
        </div>
      )}

      {status === 'loading' && (
        <div style={{
          padding: '32px 20px',
          color: 'rgba(0,212,255,0.4)',
          textAlign: 'center',
          border: '1px solid rgba(0,212,255,0.08)',
          borderRadius: '8px',
          background: 'rgba(0,212,255,0.03)',
          fontFamily: 'monospace',
          fontSize: '10px',
        }}>
          Rendering diagram...
        </div>
      )}

      {status === 'fallback' && (
        <div style={{
          background: '#0a0a1a',
          border: '1px solid rgba(0,255,255,0.2)',
          borderRadius: '8px',
          padding: '16px',
          fontFamily: 'monospace',
          fontSize: '11px',
          color: 'rgba(0,255,255,0.8)',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-all',
          maxHeight: '300px',
          overflowY: 'auto',
        }}>
          <div style={{ color: '#00ffff', marginBottom: '8px', fontSize: '12px', fontFamily: 'sans-serif' }}>
            &#x1F4CA; Paste at{' '}
            <a href="https://mermaid.live" target="_blank" rel="noreferrer" style={{ color: '#00ffff' }}>
              mermaid.live
            </a>
            {' '}to view
          </div>
          {cleanMermaid(diagram)}
        </div>
      )}

      {/* Container always in DOM — ref.current is non-null when render() resolves.
          Shown only on success; hidden (not removed) during loading/fallback. */}
      <div
        ref={ref}
        style={{
          display: status === 'success' ? 'block' : 'none',
          maxWidth: '100%',
          overflowX: 'auto',
          borderRadius: '8px',
          padding: '12px',
          background: 'rgba(3,7,18,0.6)',
          border: '1px solid rgba(0,212,255,0.08)',
        }}
      />
    </div>
  )
}
