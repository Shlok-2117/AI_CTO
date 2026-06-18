'use client'
import { useEffect, useRef, useState } from 'react'

interface Props {
  diagram: string
  title: string
}

export default function MermaidDiagram({ diagram, title }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [error, setError] = useState('')
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (!diagram || !ref.current) return

    const existingScript = document.getElementById('mermaid-script')

    function renderDiagram() {
      const win = window as any
      if (!win.mermaid) {
        setError('Mermaid not loaded')
        return
      }

      win.mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        securityLevel: 'loose',
        darkMode: true,
        background: 'transparent',
      })

      const id = 'mermaid-' + Math.random().toString(36).slice(2, 8)

      win.mermaid.render(id, diagram)
        .then(({ svg }: { svg: string }) => {
          if (ref.current) {
            ref.current.innerHTML = svg
            setLoaded(true)
          }
        })
        .catch((e: any) => {
          console.error('Mermaid render error:', e)
          if (ref.current) {
            ref.current.innerHTML = `<pre style="color:#a78bfa;font-size:11px;white-space:pre-wrap;padding:8px">${diagram}</pre>`
          }
        })
    }

    if (existingScript && (window as any).mermaid) {
      renderDiagram()
    } else {
      const script = document.createElement('script')
      script.id = 'mermaid-script'
      script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js'
      script.onload = () => {
        setTimeout(renderDiagram, 100)
      }
      script.onerror = () => {
        setError('Failed to load diagram library')
        if (ref.current) {
          ref.current.innerHTML = `<pre style="color:#a78bfa;font-size:11px;white-space:pre-wrap;padding:8px">${diagram}</pre>`
        }
      }
      document.head.appendChild(script)
    }
  }, [diagram])

  return (
    <div>
      <h3 className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">{title}</h3>
      {!loaded && !error && (
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <div className="w-3 h-3 border border-gray-600 border-t-violet-400 rounded-full animate-spin"></div>
          Rendering diagram...
        </div>
      )}
      {error && (
        <p className="text-xs text-red-400 mb-2">{error}</p>
      )}
      <div
        ref={ref}
        className="bg-gray-950 rounded-xl p-4 overflow-auto min-h-48"
        style={{ maxWidth: '100%' }}
      />
    </div>
  )
}
