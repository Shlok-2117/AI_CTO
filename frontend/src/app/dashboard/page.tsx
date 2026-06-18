'use client'
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  Cpu, Loader2, LogOut, Moon, Sun, History,
  CheckCircle, Download, Server, Database, Globe,
  Shield, DollarSign, GitBranch, Lock, ChevronRight, ChevronDown, X,
} from 'lucide-react'
import Link from 'next/link'
import MermaidDiagram from '@/components/MermaidDiagram'

const EXAMPLE_CATEGORIES = [
  {
    label: 'E-Commerce',
    examples: ['Food delivery marketplace like Swiggy', 'Fashion e-commerce like Myntra', 'B2B wholesale marketplace', 'Subscription box service'],
  },
  {
    label: 'FinTech',
    examples: ['Payment gateway like Razorpay', 'Stock trading platform like Zerodha', 'P2P lending platform', 'Crypto exchange'],
  },
  {
    label: 'HealthTech',
    examples: ['Telemedicine platform like Practo', 'Fitness & workout tracker app', 'Mental health therapy platform', 'Hospital management system'],
  },
  {
    label: 'SaaS Tools',
    examples: ['Project management tool like Jira', 'CRM platform like Salesforce', 'Real-time analytics dashboard', 'Customer support helpdesk'],
  },
  {
    label: 'Social',
    examples: ['Real-time chat app like Slack', 'Short video platform like Instagram Reels', 'Professional networking like LinkedIn', 'Community forum platform'],
  },
  {
    label: 'Transport',
    examples: ['Ride-sharing app like Uber', 'Last-mile delivery platform', 'Fleet management system', 'Inter-city bus booking'],
  },
  {
    label: 'EdTech',
    examples: ['Online learning platform like Udemy', 'Live tutoring marketplace', 'Corporate training & LMS', 'Coding bootcamp platform'],
  },
]

const TABS = [
  { label: 'Architecture', icon: Server },
  { label: 'Database',     icon: Database },
  { label: 'API Design',   icon: Globe },
  { label: 'Cost',         icon: DollarSign },
  { label: 'Security',     icon: Shield },
  { label: 'Diagrams',     icon: GitBranch },
]

const STEPS = [
  'Analyzing your idea',
  'Designing system architecture',
  'Modeling database schema',
  'Defining API endpoints',
  'Estimating cloud costs',
  'Running security audit',
  'Generating diagrams',
]

const METHOD_STYLE: Record<string, string> = {
  GET:    'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950 dark:text-emerald-400 dark:ring-emerald-800',
  POST:   'bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:ring-blue-800',
  PUT:    'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950 dark:text-amber-400 dark:ring-amber-800',
  PATCH:  'bg-orange-50 text-orange-700 ring-orange-200 dark:bg-orange-950 dark:text-orange-400 dark:ring-orange-800',
  DELETE: 'bg-red-50 text-red-700 ring-red-200 dark:bg-red-950 dark:text-red-400 dark:ring-red-800',
}

export default function DashboardPage() {
  const router = useRouter()
  const [problem, setProblem]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [result, setResult]         = useState<any>(null)
  const [error, setError]           = useState('')
  const [user, setUser]             = useState<any>(null)
  const [dark, setDark]             = useState(true)
  const [activeTab, setActiveTab]   = useState(0)
  const [step, setStep]             = useState(0)
  const [pdfLoading, setPdfLoading]   = useState(false)
  const [showExamples, setShowExamples] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    const u = localStorage.getItem('user')
    if (u) setUser(JSON.parse(u))
    const isDark = localStorage.getItem('theme') !== 'light'
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [router])

  useEffect(() => {
    if (!loading) { setStep(0); return }
    setStep(0)
    const t = setInterval(() => setStep(s => Math.min(s + 1, STEPS.length - 1)), 25000)
    return () => clearInterval(t)
  }, [loading])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  async function handleLogout() {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
    } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  async function handleGenerate() {
    if (!problem.trim() || loading) return
    if (problem.trim().length < 10) { setError('Please describe your idea in at least 10 characters.'); return }
    setLoading(true); setError(''); setResult(null); setActiveTab(0)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ problem: problem.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Generation failed. Please try again.'); return }
      setResult(data)
    } catch {
      setError('Cannot connect to the server. Please ensure the backend is running on port 5000.')
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadPDF() {
    if (!result?.id || pdfLoading) return
    setPdfLoading(true)
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${API_URL}/api/generate/${result.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include',
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }))
        setError(`PDF generation failed: ${err.error || res.status}`)
        return
      }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url; a.download = `${result.projectName}-CTO-Report.pdf`
      document.body.appendChild(a); a.click()
      document.body.removeChild(a); window.URL.revokeObjectURL(url)
    } catch {
      setError('PDF download failed. Is the backend running?')
    } finally {
      setPdfLoading(false)
    }
  }

  const arch     = result?.result?.architecture
  const db       = result?.result?.database
  const api      = result?.result?.api
  const cost     = result?.result?.cost
  const security = result?.result?.security
  const diagrams = result?.result?.diagrams

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">

      {/* ── Navbar ───────────────────────────── */}
      <header className="sticky top-0 z-10 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">AI CTO</span>
          </div>

          <nav className="flex items-center gap-1">
            {user && (
              <span className="hidden sm:block text-sm text-zinc-500 dark:text-zinc-400 mr-3">
                {user.name || user.email}
              </span>
            )}
            <Link href="/history"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <History className="w-3.5 h-3.5" /> History
            </Link>
            <button onClick={toggleDark}
              className="p-1.5 rounded-md text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <LogOut className="w-3.5 h-3.5" /> Sign out
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">

        {/* ── Hero ─────────────────────────────── */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 mb-2">
            Generate your technical blueprint
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-base max-w-2xl">
            Describe your product idea and receive a complete architecture, database schema, API design, cost estimate, and security audit — powered by 6 specialized AI agents.
          </p>
        </div>

        {/* ── Input ────────────────────────────── */}
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-6 shadow-sm">
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2">
            Describe your startup idea
          </label>
          <textarea
            value={problem}
            onChange={e => setProblem(e.target.value)}
            placeholder="e.g. A telemedicine platform where doctors can video call patients, manage appointments, and prescribe medication digitally — targeting tier-2 cities in India."
            rows={4}
            disabled={loading}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate() }}
            className="w-full resize-none rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3.5 py-2.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent transition"
          />
          <div className="flex items-center justify-between mt-2 mb-5">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Ctrl+Enter to generate · Be specific for better results</p>
            <div className="flex items-center gap-2">
              {problem && (
                <button onClick={() => setProblem('')} className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 flex items-center gap-1 transition-colors">
                  <X className="w-3 h-3" /> Clear
                </button>
              )}
              <span className={`text-xs tabular-nums ${problem.trim().length >= 10 ? 'text-violet-600 dark:text-violet-400' : 'text-zinc-400'}`}>
                {problem.length} chars
              </span>
            </div>
          </div>

          <div className="mb-5">
            <button onClick={() => setShowExamples(s => !s)}
              className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors mb-3">
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showExamples ? 'rotate-180' : ''}`} />
              {showExamples ? 'Hide examples' : 'Browse examples'} · {EXAMPLE_CATEGORIES.reduce((n, c) => n + c.examples.length, 0)} ideas across {EXAMPLE_CATEGORIES.length} categories
            </button>
            {showExamples && (
              <div className="space-y-3 p-4 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200 dark:border-zinc-700">
                {EXAMPLE_CATEGORIES.map(cat => (
                  <div key={cat.label}>
                    <p className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-1.5">{cat.label}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {cat.examples.map(ex => (
                        <button key={ex} onClick={() => { setProblem(ex); setShowExamples(false) }} disabled={loading}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-zinc-200 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 bg-white dark:bg-zinc-800 hover:border-violet-300 dark:hover:border-violet-600 hover:text-violet-700 dark:hover:text-violet-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
                          <ChevronRight className="w-3 h-3" />{ex}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleGenerate}
            disabled={!problem.trim() || loading || problem.trim().length < 10}
            className="w-full py-2.5 px-4 bg-violet-600 hover:bg-violet-700 disabled:bg-violet-300 dark:disabled:bg-violet-900 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2">
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" />{STEPS[step]}...</>
              : 'Generate Architecture'}
          </button>
        </div>

        {/* ── Error ────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 rounded-lg border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-4 py-3 mb-6 text-sm text-red-700 dark:text-red-400">
            <span className="flex-1">{error}</span>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 transition-colors flex-shrink-0">✕</button>
          </div>
        )}

        {/* ── Loading progress ──────────────────── */}
        {loading && (
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 mb-6 shadow-sm">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Running AI agents</p>
            <div className="space-y-3">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
                    {i < step
                      ? <CheckCircle className="w-5 h-5 text-emerald-500" />
                      : i === step
                      ? <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
                      : <div className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-600" />}
                  </div>
                  <span className={`text-sm ${
                    i < step   ? 'text-zinc-400 dark:text-zinc-500 line-through' :
                    i === step ? 'text-zinc-900 dark:text-zinc-100 font-medium' :
                                 'text-zinc-400 dark:text-zinc-600'
                  }`}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Results ──────────────────────────── */}
        {result && !loading && (
          <div className="space-y-4">

            {/* Result header */}
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-5 py-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                  <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">{result.projectName}</h2>
                </div>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 pl-4">
                  {arch?.services?.length || 0} services · {db?.tables?.length || 0} tables · {api?.endpoints?.length || 0} endpoints
                </p>
              </div>
              <button onClick={handleDownloadPDF} disabled={pdfLoading}
                className="flex items-center gap-2 px-4 py-2 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-700 dark:hover:bg-zinc-300 disabled:opacity-50 text-white dark:text-zinc-900 text-sm font-medium rounded-lg transition-colors">
                {pdfLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Download className="w-3.5 h-3.5" />}
                {pdfLoading ? 'Generating...' : 'Export PDF'}
              </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-zinc-200 dark:border-zinc-800">
              <div className="flex gap-0 overflow-x-auto">
                {TABS.map(({ label, icon: Icon }, i) => (
                  <button key={label} onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                      activeTab === i
                        ? 'border-violet-600 text-violet-600 dark:text-violet-400 dark:border-violet-400'
                        : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}>
                    <Icon className="w-3.5 h-3.5" />{label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Architecture ─────────────────── */}
            {activeTab === 0 && (
              <div className="space-y-4">
                {arch?.summary && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{arch.summary}</p>
                  </div>
                )}

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Services <span className="text-zinc-400 font-normal">({arch?.services?.length || 0})</span>
                    </h3>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {arch?.services?.map((s: any) => (
                      <div key={s.name} className="px-5 py-4 flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-950 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Server className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{s.name}</span>
                            {s.type && (
                              <span className="text-xs px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">{s.type}</span>
                            )}
                            <span className="text-xs text-violet-600 dark:text-violet-400 font-medium">{s.technology}</span>
                          </div>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{s.responsibility}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Tech Stack</h3>
                    <div className="flex flex-wrap gap-2">
                      {arch?.tech_stack && Object.entries(arch.tech_stack).map(([k, v]: any) => (
                        <span key={k} className="text-xs px-2.5 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                          <span className="text-zinc-400 dark:text-zinc-500 capitalize mr-1">{k}:</span>{v}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-3">Infrastructure</h3>
                    <ul className="space-y-2">
                      {arch?.infrastructure?.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <span className="text-violet-500 mt-0.5 flex-shrink-0">—</span>
                          <span className="text-zinc-600 dark:text-zinc-400">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {arch?.scaling_strategy && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-2">Scaling Strategy</h3>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{arch.scaling_strategy}</p>
                  </div>
                )}
              </div>
            )}

            {/* ── Database ─────────────────────── */}
            {activeTab === 1 && (
              <div className="space-y-4">
                {db?.tables?.map((table: any) => (
                  <div key={table.name} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold font-mono text-zinc-900 dark:text-zinc-100">{table.name}</h3>
                        {table.purpose && <p className="text-xs text-zinc-400 mt-0.5">{table.purpose}</p>}
                      </div>
                      <span className="text-xs text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">{table.columns?.length || 0} cols</span>
                    </div>
                    <table className="w-full text-sm">
                      <thead className="bg-zinc-50 dark:bg-zinc-800/50">
                        <tr>
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Column</th>
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Type</th>
                          <th className="text-left px-5 py-2.5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Constraints</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                        {table.columns?.map((col: any) => (
                          <tr key={col.name} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                            <td className="px-5 py-3 font-mono text-sm text-zinc-900 dark:text-zinc-100 font-medium">{col.name}</td>
                            <td className="px-5 py-3 font-mono text-sm text-violet-600 dark:text-violet-400">{col.type}</td>
                            <td className="px-5 py-3 text-xs text-zinc-500 dark:text-zinc-400">{col.constraints?.join(', ')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}

                {db?.sql_preview && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                      <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400" />
                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                        <div className="w-3 h-3 rounded-full bg-green-400" />
                      </div>
                      <span className="text-xs text-zinc-400">SQL Preview</span>
                    </div>
                    <pre className="p-5 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-zinc-950 overflow-x-auto whitespace-pre-wrap leading-relaxed">
                      {db.sql_preview}
                    </pre>
                  </div>
                )}
              </div>
            )}

            {/* ── API Design ───────────────────── */}
            {activeTab === 2 && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <div><span className="text-zinc-400 dark:text-zinc-500 mr-1.5">Base URL</span><code className="font-mono text-violet-600 dark:text-violet-400">{api?.base_url}</code></div>
                  <div><span className="text-zinc-400 dark:text-zinc-500 mr-1.5">Auth</span><span className="text-zinc-700 dark:text-zinc-300">{api?.auth_strategy}</span></div>
                  <div><span className="text-zinc-400 dark:text-zinc-500 mr-1.5">Rate limit</span><span className="text-zinc-700 dark:text-zinc-300">{api?.rate_limiting}</span></div>
                </div>

                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                      Endpoints <span className="text-zinc-400 font-normal">({api?.endpoints?.length || 0})</span>
                    </h3>
                  </div>
                  <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
                    {api?.endpoints?.map((ep: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <span className={`text-xs font-bold font-mono px-2.5 py-1 rounded ring-1 ring-inset flex-shrink-0 w-16 text-center ${METHOD_STYLE[ep.method] || 'bg-zinc-100 text-zinc-600 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700'}`}>
                          {ep.method}
                        </span>
                        <code className="text-sm font-mono text-zinc-900 dark:text-zinc-100 flex-shrink-0">{ep.path}</code>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400 flex-1 truncate hidden sm:block">{ep.description}</span>
                        {ep.auth_required && <Lock className="w-3.5 h-3.5 text-zinc-400 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Cost ─────────────────────────── */}
            {activeTab === 3 && cost && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {Object.entries(cost.tiers || {}).map(([tier, data]: any, i) => (
                    <div key={tier} className={`bg-white dark:bg-zinc-900 border rounded-xl p-5 shadow-sm ${
                      i === 1 ? 'border-violet-300 dark:border-violet-700 ring-1 ring-violet-200 dark:ring-violet-800' : 'border-zinc-200 dark:border-zinc-800'
                    }`}>
                      {i === 1 && (
                        <div className="text-xs font-semibold text-violet-600 dark:text-violet-400 uppercase tracking-wider mb-3">Recommended</div>
                      )}
                      <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1 capitalize">{tier}</p>
                      <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
                        ${data.monthly_usd}
                        <span className="text-sm font-normal text-zinc-400 dark:text-zinc-500">/mo</span>
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-4 leading-relaxed">{data.description}</p>
                      {data.services?.length > 0 && (
                        <div className="space-y-1.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
                          {data.services.map((svc: any, si: number) => (
                            <div key={si} className="flex justify-between text-xs">
                              <span className="text-zinc-500 dark:text-zinc-400">{svc.name}</span>
                              <span className="font-medium text-zinc-700 dark:text-zinc-300">${svc.cost_usd}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {cost.breakdown && (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Cost Breakdown</h3>
                      <div className="space-y-3">
                        {Object.entries(cost.breakdown).map(([k, v]: any) => (
                          <div key={k}>
                            <div className="flex justify-between text-xs mb-1.5">
                              <span className="text-zinc-600 dark:text-zinc-400 capitalize">{k}</span>
                              <span className="font-medium text-zinc-700 dark:text-zinc-300">{v}%</span>
                            </div>
                            <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-violet-500 rounded-full" style={{ width: `${v}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                    <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 mb-4">Cost Saving Tips</h3>
                    <ul className="space-y-2.5">
                      {cost.cost_saving_tips?.map((tip: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {/* ── Security ─────────────────────── */}
            {activeTab === 4 && security && (
              <div className="space-y-4">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex items-center gap-3">
                  <Shield className="w-4 h-4 text-zinc-400 flex-shrink-0" />
                  <span className="text-sm text-zinc-600 dark:text-zinc-400">Overall risk level:</span>
                  <span className={`text-sm font-semibold px-3 py-1 rounded-full ${
                    security.risk_score === 'Critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                    security.risk_score === 'High'     ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                    security.risk_score === 'Medium'   ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400' :
                    'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                  }`}>{security.risk_score}</span>
                </div>

                {security.top_3_risks?.length > 0 && (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Top Risks</h3>
                    </div>
                    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {security.top_3_risks.map((risk: string, i: number) => (
                        <li key={i} className="px-5 py-3.5 flex items-start gap-3 text-sm">
                          <span className="w-5 h-5 flex items-center justify-center rounded-full bg-red-100 dark:bg-red-950 text-red-600 dark:text-red-400 text-xs font-bold flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-zinc-600 dark:text-zinc-400 leading-relaxed">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {Object.entries(security.checklist || {}).map(([cat, items]: any) => (
                  <div key={cat} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm overflow-hidden">
                    <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800">
                      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 capitalize">{cat.replace(/_/g, ' ')}</h3>
                    </div>
                    <ul className="divide-y divide-zinc-100 dark:divide-zinc-800">
                      {items.map((item: any, i: number) => (
                        <li key={i} className="flex items-start gap-3 px-5 py-3.5">
                          <span className={`text-xs px-2 py-0.5 rounded font-semibold uppercase flex-shrink-0 mt-0.5 ${
                            item.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400' :
                            item.priority === 'high'     ? 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-400' :
                            'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400'
                          }`}>{item.priority}</span>
                          <span className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">{item.item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}

            {/* ── Diagrams ─────────────────────── */}
            {activeTab === 5 && diagrams && (
              <div className="space-y-4">
                {[
                  { key: 'architecture', title: 'System Architecture' },
                  { key: 'er_diagram',   title: 'Entity Relationship Diagram' },
                  { key: 'sequence',     title: 'Sequence Diagram' },
                ].map(({ key, title }) => diagrams[key] && (
                  <div key={key} className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
                    <MermaidDiagram diagram={diagrams[key]} title={title} />
                  </div>
                ))}
              </div>
            )}

          </div>
        )}

      </main>
    </div>
  )
}
