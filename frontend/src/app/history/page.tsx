'use client'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Cpu, Clock, Trash2, ArrowRight, Moon, Sun, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function HistoryPage() {
  const router = useRouter()
  const [generations, setGenerations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [dark, setDark] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    document.documentElement.classList.add('dark')
    fetchHistory(token)
  }, [router])

  async function fetchHistory(token: string) {
    try {
      const res = await fetch(`${API_URL}/api/history`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Failed to load history'); return }
      setGenerations(data.generations || [])
    } catch {
      setError('Cannot connect to server. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (deletingId) return
    setDeletingId(id)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      if (!res.ok) { setError('Failed to delete. Please try again.'); return }
      setGenerations(prev => prev.filter(g => g.id !== id))
    } catch {
      setError('Cannot connect to server.')
    } finally {
      setDeletingId(null)
    }
  }

  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.replace('/auth/login')
  }

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <nav className="bg-slate-900 border-b border-white/10 px-6 py-3 flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <Cpu className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-semibold text-white">AI CTO</span>
        </Link>
        <div className="flex items-center gap-3">
          <button onClick={toggleDark} className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href="/dashboard" className="text-sm text-violet-400 hover:text-violet-300">
            ← Back to Dashboard
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-400 hover:text-red-400 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-white/10 hover:border-red-500/30">
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-white mb-2">Generation History</h1>
        <p className="text-slate-400 text-sm mb-8">Your past architecture generations</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl px-4 py-3 mb-6 flex items-center justify-between gap-2">
            <span>⚠ {error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-300 font-medium text-xs">Dismiss</button>
          </div>
        )}

        {loading && (
          <div className="text-center py-16 text-slate-500">Loading history...</div>
        )}

        {!loading && generations.length === 0 && (
          <div className="text-center py-16">
            <p className="text-slate-500 mb-4">No generations yet</p>
            <Link href="/dashboard" className="text-violet-400 hover:underline text-sm">
              Generate your first architecture →
            </Link>
          </div>
        )}

        <div className="space-y-3">
          {generations.map(gen => (
            <div key={gen.id} className="bg-slate-900 rounded-2xl border border-white/10 p-5 flex items-center gap-4">
              <div className="w-10 h-10 bg-violet-950 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cpu className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white truncate">{gen.projectName}</p>
                <p className="text-sm text-slate-500 truncate mt-0.5">{gen.input}</p>
                <div className="flex items-center gap-1 mt-1 text-xs text-slate-600">
                  <Clock className="w-3 h-3" />
                  {new Date(gen.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link href={`/dashboard?id=${gen.id}`}
                  className="p-2 text-violet-400 hover:bg-violet-950 rounded-lg transition-colors">
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <button onClick={() => handleDelete(gen.id)} disabled={!!deletingId}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-950 rounded-lg transition-colors disabled:opacity-40">
                  <Trash2 className={`w-4 h-4 ${deletingId === gen.id ? 'animate-pulse text-red-400' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
