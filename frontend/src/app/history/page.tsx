'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Trash2, ArrowRight, Search, Calendar,
  FileText, ChevronLeft
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

export default function HistoryPage() {
  const router = useRouter()
  const [generations, setGenerations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    fetchHistory(token)
  }, [router])

  async function fetchHistory(token: string) {
    try {
      const res = await fetch(`${API}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await res.json()
      setGenerations(data.generations || [])
    } catch {}
    finally { setLoading(false) }
  }

  async function handleDelete(id: string) {
    setDeleting(id)
    const token = localStorage.getItem('token')
    try {
      await fetch(`${API}/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      setGenerations(prev => prev.filter(g => g.id !== id))
    } catch {}
    finally {
      setDeleting(null)
      setConfirmDelete(null)
    }
  }

  function formatDate(dateStr: string) {
    const d = new Date(dateStr)
    return {
      date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    }
  }

  const filtered = generations.filter(g =>
    g.projectName?.toLowerCase().includes(search.toLowerCase()) ||
    g.input?.toLowerCase().includes(search.toLowerCase())
  )

  if (!mounted) return null

  return (
    <div className="page-jarvis min-h-screen text-white">
      <div className="fixed inset-0 hud-grid opacity-15 pointer-events-none" />
      <div className="scan-line" />

      {(['top-4 left-4 border-t border-l', 'top-4 right-4 border-t border-r',
        'bottom-4 left-4 border-b border-l', 'bottom-4 right-4 border-b border-r'] as const).map((cls, i) => (
        <div key={i} className={`fixed w-5 h-5 ${cls} pointer-events-none`}
          style={{ borderColor: 'rgba(0,212,255,0.15)' }} />
      ))}

      {/* Navbar */}
      <nav className="hud-panel border-b px-6 py-3.5 flex items-center justify-between sticky top-0 z-50"
        style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
        <Link href="/dashboard" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.25)' }}>
            <Cpu className="w-4 h-4" style={{ color: '#00D4FF' }} />
          </div>
          <div>
            <div className="text-sm font-black tracking-[0.15em]" style={{ color: '#00D4FF' }}>
              JARVIS<span style={{ color: 'rgba(248,250,252,0.3)' }}>_</span>CTO
            </div>
            <div className="text-[8px] font-mono tracking-widest -mt-0.5"
              style={{ color: 'rgba(248,250,252,0.15)' }}>ARCHITECTURE SYSTEM</div>
          </div>
        </Link>

        <Link href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-[9px] font-mono tracking-widest transition-all"
          style={{ color: 'rgba(248,250,252,0.35)', border: '1px solid rgba(0,212,255,0.1)', background: 'rgba(0,212,255,0.03)' }}
          onMouseEnter={e => { e.currentTarget.style.color = '#00D4FF'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.3)' }}
          onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,250,252,0.35)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.1)' }}>
          <ChevronLeft className="w-3.5 h-3.5" />
          BACK TO SYSTEM
        </Link>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-px h-4" style={{ background: '#00D4FF' }} />
            <span className="text-[9px] font-mono tracking-[0.3em]"
              style={{ color: 'rgba(0,212,255,0.5)' }}>MISSION ARCHIVE</span>
          </div>
          <h1 className="text-3xl font-black tracking-tight mb-1">
            Blueprint <span style={{ color: '#00D4FF' }}>History</span>
          </h1>
          <p className="text-xs font-mono" style={{ color: 'rgba(248,250,252,0.25)' }}>
            {generations.length} BLUEPRINTS GENERATED · CLASSIFIED TECHNICAL RECORDS
          </p>
        </motion.div>

        {/* Search */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="relative mb-6">
          <Search className="absolute left-4 top-3.5 w-4 h-4 pointer-events-none"
            style={{ color: 'rgba(0,212,255,0.3)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search blueprints..."
            className="input-jarvis pl-11 w-full"
          />
          {search && (
            <button onClick={() => setSearch('')}
              className="absolute right-4 top-3.5 text-[10px] font-mono transition-colors"
              style={{ color: 'rgba(248,250,252,0.2)' }}>✕</button>
          )}
        </motion.div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="relative w-16 h-16">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                  className="absolute inset-0 rounded-full"
                  style={{ border: '1px solid rgba(0,212,255,0.2)', borderTopColor: '#00D4FF' }} />
                <div className="absolute inset-3 rounded-full flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.05)' }}>
                  <FileText className="w-4 h-4" style={{ color: '#00D4FF' }} />
                </div>
              </div>
              <div className="text-[10px] font-mono tracking-widest" style={{ color: 'rgba(0,212,255,0.4)' }}>
                ACCESSING MISSION ARCHIVE...
              </div>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center mb-6"
              style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.1)' }}>
              <FileText className="w-10 h-10" style={{ color: 'rgba(0,212,255,0.2)' }} />
            </div>
            <div className="text-[10px] font-mono tracking-[0.3em] mb-2"
              style={{ color: 'rgba(0,212,255,0.3)' }}>
              {search ? 'NO RESULTS FOUND' : 'MISSION ARCHIVE EMPTY'}
            </div>
            <p className="text-xs text-center mb-6" style={{ color: 'rgba(248,250,252,0.2)' }}>
              {search ? `No blueprints match "${search}"` : 'No blueprints generated yet. Start your first mission.'}
            </p>
            <Link href="/dashboard" className="btn-jarvis">START FIRST MISSION</Link>
          </motion.div>
        )}

        {/* Blueprint list */}
        {!loading && filtered.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="space-y-3">
            {filtered.map((gen, i) => {
              const { date, time } = formatDate(gen.createdAt)
              return (
                <motion.div
                  key={gen.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative hud-panel rounded-xl overflow-hidden"
                  style={{ borderColor: 'rgba(0,212,255,0.08)' }}
                >
                  <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.4),transparent)' }} />

                  <div className="flex items-center gap-4 p-5">
                    <div className="text-2xl font-black flex-shrink-0 w-8 text-center"
                      style={{ color: 'rgba(0,212,255,0.08)', userSelect: 'none' }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>

                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)' }}>
                      <Cpu className="w-5 h-5" style={{ color: 'rgba(0,212,255,0.5)' }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm mb-1 truncate" style={{ color: '#F8FAFC' }}>
                        {gen.projectName || 'Unnamed Blueprint'}
                      </div>
                      <div className="text-[10px] font-mono truncate mb-2"
                        style={{ color: 'rgba(248,250,252,0.3)' }}>
                        {gen.input}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3 h-3" style={{ color: 'rgba(0,212,255,0.3)' }} />
                          <span className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
                            {date}
                          </span>
                        </div>
                        <span style={{ color: 'rgba(0,212,255,0.2)' }}>·</span>
                        <span className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
                          {time}
                        </span>
                        <span className="text-[8px] font-mono px-2 py-0.5 rounded ml-1"
                          style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)', color: 'rgba(0,212,255,0.5)' }}>
                          12 PHASES
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <AnimatePresence mode="wait">
                        {confirmDelete === gen.id ? (
                          <motion.div key="confirm" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex items-center gap-2">
                            <span className="text-[9px] font-mono" style={{ color: 'rgba(248,113,113,0.7)' }}>CONFIRM?</span>
                            <button
                              onClick={() => handleDelete(gen.id)}
                              disabled={deleting === gen.id}
                              className="text-[9px] font-mono px-3 py-1.5 rounded transition-all"
                              style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#F87171' }}>
                              {deleting === gen.id ? '...' : 'DELETE'}
                            </button>
                            <button
                              onClick={() => setConfirmDelete(null)}
                              className="text-[9px] font-mono px-3 py-1.5 rounded transition-all"
                              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(248,250,252,0.4)' }}>
                              CANCEL
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div key="actions" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="flex items-center gap-2">
                            <Link
                              href={`/dashboard?id=${gen.id}`}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[9px] font-mono transition-all"
                              style={{ color: 'rgba(0,212,255,0.6)', border: '1px solid rgba(0,212,255,0.15)', background: 'rgba(0,212,255,0.04)' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#00D4FF'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.35)'; e.currentTarget.style.background = 'rgba(0,212,255,0.08)' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(0,212,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'; e.currentTarget.style.background = 'rgba(0,212,255,0.04)' }}>
                              VIEW <ArrowRight className="w-3 h-3" />
                            </Link>
                            <button
                              onClick={() => setConfirmDelete(gen.id)}
                              className="p-2 rounded-lg transition-all"
                              style={{ color: 'rgba(248,250,252,0.15)', border: '1px solid transparent' }}
                              onMouseEnter={e => { e.currentTarget.style.color = '#F87171'; e.currentTarget.style.borderColor = 'rgba(248,113,113,0.2)'; e.currentTarget.style.background = 'rgba(248,113,113,0.06)' }}
                              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,250,252,0.15)'; e.currentTarget.style.borderColor = 'transparent'; e.currentTarget.style.background = 'transparent' }}>
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* Footer stats */}
        {!loading && generations.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
            className="mt-8 pt-6 flex items-center justify-between"
            style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}>
            <div className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
              {filtered.length} OF {generations.length} BLUEPRINTS
              {search && ` MATCHING "${search.toUpperCase()}"`}
            </div>
            <Link href="/dashboard" className="btn-jarvis text-[9px] py-2 px-4">
              NEW MISSION →
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  )
}
