'use client'
import { useEffect, useRef } from 'react'

export function WebBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let nodes: { x: number; y: number; vx: number; vy: number }[] = []
    const NODE_COUNT = 60
    const MAX_DIST = 160
    const CYAN = '0,212,255'

    function resize() {
      canvas!.width = window.innerWidth
      canvas!.height = window.innerHeight
    }

    function init() {
      resize()
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * canvas!.width,
        y: Math.random() * canvas!.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
      }))
    }

    function draw() {
      const W = canvas!.width
      const H = canvas!.height
      ctx!.clearRect(0, 0, W, H)

      nodes.forEach(n => {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
      })

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x
          const dy = nodes[i].y - nodes[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < MAX_DIST) {
            const alpha = (1 - dist / MAX_DIST) * 0.12
            ctx!.beginPath()
            ctx!.moveTo(nodes[i].x, nodes[i].y)
            ctx!.lineTo(nodes[j].x, nodes[j].y)
            ctx!.strokeStyle = `rgba(${CYAN},${alpha})`
            ctx!.lineWidth = 0.6
            ctx!.stroke()
          }
        }
      }

      nodes.forEach(n => {
        ctx!.beginPath()
        ctx!.arc(n.x, n.y, 1.5, 0, Math.PI * 2)
        ctx!.fillStyle = `rgba(${CYAN},0.2)`
        ctx!.fill()
      })

      animId = requestAnimationFrame(draw)
    }

    init()
    draw()
    window.addEventListener('resize', init)

    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', init)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="web-bg"
      style={{ zIndex: 0 }}
    />
  )
}
