'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Loader2, LogOut, Zap, Moon, Sun, History,
  CheckCircle, Database, Code, DollarSign,
  Shield, GitBranch, Download, RefreshCw, ChevronRight,
  Terminal, Activity, Layers
} from 'lucide-react'
import Link from 'next/link'
import MermaidDiagram from '@/components/MermaidDiagram'

const EXAMPLE_CATEGORIES = [
  { category: 'Food & Delivery', examples: ['Design a food delivery app like Swiggy', 'Build a grocery delivery platform like Blinkit', 'Create a meal kit subscription service'] },
  { category: 'Fintech', examples: ['Build a payment platform like Razorpay', 'Design a stock trading app like Zerodha', 'Create a crypto exchange platform'] },
  { category: 'Social & Chat', examples: ['Create a real-time chat app like Slack', 'Build a video calling platform like Zoom', 'Design a social media app like Instagram'] },
  { category: 'E-Commerce', examples: ['Design a marketplace like Amazon', 'Build a fashion platform like Myntra', 'Create a B2B wholesale platform'] },
  { category: 'Transport', examples: ['Build a ride-sharing app like Uber', 'Design a logistics platform like Delhivery', 'Create a bike rental platform'] },
  { category: 'Health & Education', examples: ['Build a telemedicine platform like Practo', 'Design an ed-tech platform like Unacademy', 'Create a fitness app like Cult.fit'] },
]

const TABS = [
  { id: 'architecture', label: 'Architecture', icon: Layers },
  { id: 'database', label: 'Database', icon: Database },
  { id: 'api', label: 'API Design', icon: Code },
  { id: 'cost', label: 'Cost', icon: DollarSign },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'diagrams', label: 'Diagrams', icon: GitBranch },
]

const AGENT_STEPS = [
  { id: 1, name: 'Architecture Agent', desc: 'Analyzing system components...', icon: Layers, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', dot: 'bg-violet-500' },
  { id: 2, name: 'Database Agent', desc: 'Designing schema & relationships...', icon: Database, color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', dot: 'bg-blue-500' },
  { id: 3, name: 'API Design Agent', desc: 'Generating REST endpoints...', icon: Code, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', dot: 'bg-emerald-500' },
  { id: 4, name: 'Cost Estimator Agent', desc: 'Calculating cloud infrastructure costs...', icon: DollarSign, color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', dot: 'bg-amber-500' },
  { id: 5, name: 'Security Agent', desc: 'Running OWASP security audit...', icon: Shield, color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', dot: 'bg-red-500' },
  { id: 6, name: 'Diagram Agent', desc: 'Rendering architecture diagrams...', icon: GitBranch, color: 'text-pink-400', bg: 'bg-pink-500/10', border: 'border-pink-500/20', dot: 'bg-pink-500' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [problem, setProblem] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [dark, setDark] = useState(true)
  const [activeTab, setActiveTab] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [showExamples, setShowExamples] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const logsRef = useRef<HTMLDivElement>(null)
  const stepTimerRef = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    if (!token) { router.push('/auth/login'); return }
    if (userData) setUser(JSON.parse(userData))
    document.documentElement.classList.add('dark')
  }, [router])

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight
  }, [logs])

  function addLog(msg: string) {
    setLogs(prev => [...prev.slice(-20), `[${new Date().toLocaleTimeString()}] ${msg}`])
  }

  function startAgentSimulation() {
    setCurrentStep(0)
    setCompletedSteps([])
    setLogs([])
    stepTimerRef.current.forEach(t => clearTimeout(t))
    stepTimerRef.current = []
    const stepDuration = 25000
    AGENT_STEPS.forEach((step, i) => {
      const startT = setTimeout(() => {
        setCurrentStep(i + 1)
        addLog(`Initializing ${step.name}...`)
        setTimeout(() => addLog(`${step.name}: ${step.desc}`), 2000)
        setTimeout(() => addLog(`${step.name}: Processing complete ✓`), stepDuration - 3000)
      }, i * stepDuration)
      const completeT = setTimeout(() => {
        setCompletedSteps(prev => [...prev, i + 1])
        addLog(`✓ ${step.name} completed`)
      }, (i + 1) * stepDuration - 2000)
      stepTimerRef.current.push(startT, completeT)
    })
  }

  async function handleGenerate(force = false) {
    if (!problem.trim() || loading) return
    if (problem.trim().length < 10) { setError('Please describe your idea in at least 10 characters'); return }
    setLoading(true)
    setError('')
    setResult(null)
    setActiveTab(0)
    startAgentSimulation()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        credentials: 'include',
        body: JSON.stringify({ problem: problem.trim(), force_regenerate: force })
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Generation failed'); return }
      stepTimerRef.current.forEach(t => clearTimeout(t))
      setCurrentStep(7)
      setCompletedSteps([1,2,3,4,5,6])
      addLog('✓ All agents completed successfully')
      addLog(`✓ Project "${data.projectName}" generated`)
      setResult(data)
    } catch {
      setError('Cannot connect to server. Is the backend running?')
      stepTimerRef.current.forEach(t => clearTimeout(t))
    } finally {
      setLoading(false)
    }
  }

  async function handleDownloadPDF() {
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/generate/${result.id}/pdf`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: 'include'
      })
      if (!res.ok) { alert('PDF generation failed'); return }
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${result.projectName}-CTO-Report.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
    } catch { alert('PDF download failed') }
  }

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
  }

  async function handleLogout() {
    try {
      const token = localStorage.getItem('token')
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/auth/logout`, {
        method: 'POST', headers: { Authorization: `Bearer ${token}` }, credentials: 'include'
      })
    } catch {}
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    window.location.href = '/'
  }

  const arch = result?.result?.architecture
  const db = result?.result?.database
  const api = result?.result?.api
  const cost = result?.result?.cost
  const security = result?.result?.security
  const diagrams = result?.result?.diagrams

  return (
    <div className="page-bg min-h-screen text-white">
      {/* Navbar */}
      <nav className="glass border-b border-white/5 px-6 py-3.5 flex items-center justify-between sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20 group-hover:shadow-violet-500/40 transition-all">
            <Cpu className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="font-black text-sm tracking-tight">AI CTO</span>
        </Link>
        <div className="flex items-center gap-1">
          {user && (
            <div className="hidden sm:flex items-center gap-2 mr-3 px-3 py-1.5 glass rounded-lg border border-white/5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-xs text-white/40">{user.name || user.email}</span>
            </div>
          )}
          <Link href="/history" className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
            <History className="w-3.5 h-3.5" /> History
          </Link>
          <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-white/5 text-white/30 hover:text-white transition-all">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button onClick={handleLogout} className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white px-3 py-2 rounded-lg hover:bg-white/5 transition-all">
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Sign out</span>
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-violet-400 font-semibold uppercase tracking-widest">Generator</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight mb-2">Generate your technical blueprint</h1>
          <p className="text-white/30 text-sm">Describe your product idea and 6 specialized AI agents will design it for you.</p>
        </motion.div>

        {/* Input Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card border border-white/5 mb-6 relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent" />
          <div className="flex items-center gap-2 mb-4">
            <Terminal className="w-4 h-4 text-violet-400" />
            <span className="text-xs text-white/30 font-mono">Describe your startup idea</span>
          </div>
          <textarea
            value={problem}
            onChange={e => setProblem(e.target.value)}
            placeholder="e.g. 'Build a telemedicine platform where doctors video call patients, write prescriptions digitally, and patients can order medicines for home delivery...'"
            className="w-full h-32 bg-transparent border border-white/8 rounded-xl p-4 text-sm text-white placeholder-white/15 resize-none focus:outline-none focus:border-violet-500/40 focus:bg-white/2 transition-all font-mono leading-relaxed"
            disabled={loading}
            onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleGenerate() }}
          />
          <div className="flex items-center justify-between mt-3 mb-4">
            <div className="flex items-center gap-3">
              <span className="text-xs text-white/15 font-mono">Ctrl+Enter to generate</span>
              <span className={`text-xs font-mono ${problem.length >= 10 ? 'text-green-400' : 'text-white/20'}`}>{problem.length} chars</span>
            </div>
            {problem.length > 0 && (
              <button onClick={() => setProblem('')} className="text-xs text-white/20 hover:text-white/50 transition-colors">Clear</button>
            )}
          </div>

          <button
            onClick={() => setShowExamples(!showExamples)}
            className="flex items-center gap-2 text-xs text-white/30 hover:text-white/60 transition-colors mb-3"
          >
            <ChevronRight className={`w-3 h-3 transition-transform ${showExamples ? 'rotate-90' : ''}`} />
            Browse examples · {EXAMPLE_CATEGORIES.reduce((a, c) => a + c.examples.length, 0)} ideas across {EXAMPLE_CATEGORIES.length} categories
          </button>

          <AnimatePresence>
            {showExamples && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mb-4"
              >
                <div className="space-y-3 pt-2">
                  {EXAMPLE_CATEGORIES.map(cat => (
                    <div key={cat.category}>
                      <p className="text-xs font-semibold text-violet-400/60 uppercase tracking-widest mb-2">{cat.category}</p>
                      <div className="flex flex-wrap gap-2">
                        {cat.examples.map(ex => (
                          <button
                            key={ex}
                            onClick={() => { setProblem(ex); setShowExamples(false) }}
                            disabled={loading}
                            className="text-xs px-3 py-1.5 rounded-lg border border-white/8 hover:border-violet-500/30 hover:bg-violet-500/5 text-white/30 hover:text-white/70 transition-all"
                          >
                            {ex}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <button
            onClick={() => handleGenerate()}
            disabled={!problem.trim() || loading || problem.trim().length < 10}
            className="btn-primary w-full"
          >
            {loading
              ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Running AI agents...</span></>
              : <><Zap className="w-4 h-4" /><span>Generate Architecture</span></>
            }
          </button>
        </motion.div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="bg-red-500/8 border border-red-500/15 text-red-400 text-sm rounded-xl px-4 py-3 mb-6 flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-red-400 flex-shrink-0" />
              {error}
              <button onClick={() => setError('')} className="ml-auto text-red-400/50 hover:text-red-400">✕</button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LOADING STATE — Cinematic AI Running UI */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 space-y-4"
            >
              <div className="glass-card border border-violet-500/15 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent animate-beam" />
                <div className="flex items-center gap-3 mb-6">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-violet-400" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-violet-500 animate-pulse" />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm">AI CTO System Running</div>
                    <div className="text-xs text-white/30">6 specialized agents processing your idea</div>
                  </div>
                  <div className="ml-auto text-xs text-white/20 font-mono">{completedSteps.length}/6 complete</div>
                </div>

                <div className="space-y-2">
                  {AGENT_STEPS.map((step, i) => {
                    const isActive = currentStep === step.id
                    const isDone = completedSteps.includes(step.id)
                    return (
                      <motion.div
                        key={step.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-3 p-3 rounded-xl transition-all duration-500 ${
                          isActive ? `${step.bg} border ${step.border}` :
                          isDone ? 'bg-green-500/5 border border-green-500/10' :
                          'border border-transparent opacity-30'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isDone ? 'bg-green-500/10' : isActive ? step.bg : 'bg-white/3'}`}>
                          {isDone
                            ? <CheckCircle className="w-4 h-4 text-green-400" />
                            : isActive
                            ? <step.icon className={`w-4 h-4 ${step.color} animate-pulse`} />
                            : <step.icon className="w-4 h-4 text-white/20" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className={`text-xs font-semibold ${isDone ? 'text-green-400' : isActive ? 'text-white' : 'text-white/30'}`}>{step.name}</div>
                          {isActive && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs text-white/30 mt-0.5">
                              {step.desc}
                            </motion.div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {isDone && <span className="text-xs text-green-400 font-mono">✓</span>}
                          {isActive && (
                            <div className="flex gap-0.5">
                              {[0,1,2].map(j => (
                                <motion.div
                                  key={j}
                                  className={`w-1 h-1 rounded-full ${step.dot}`}
                                  animate={{ opacity: [1, 0.3, 1] }}
                                  transition={{ duration: 0.8, delay: j * 0.2, repeat: Infinity }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>

                <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-violet-600 to-indigo-400 rounded-full"
                    animate={{ width: `${(completedSteps.length / 6) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/20 font-mono">
                  <span>{Math.round((completedSteps.length / 6) * 100)}% complete</span>
                  <span>~{Math.max(0, (6 - completedSteps.length) * 25)}s remaining</span>
                </div>
              </div>

              {/* Live logs terminal */}
              <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/5 bg-white/2">
                  <div className="flex gap-1.5">
                    {['bg-white/10','bg-white/10','bg-white/10'].map((c,i) => <div key={i} className={`w-2.5 h-2.5 rounded-full ${c}`} />)}
                  </div>
                  <span className="text-xs text-white/20 font-mono ml-2">system.log</span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs text-green-400/60 font-mono">live</span>
                  </div>
                </div>
                <div ref={logsRef} className="p-4 h-32 overflow-y-auto">
                  {logs.length === 0 && <div className="text-xs text-white/15 font-mono">Initializing AI agents...</div>}
                  {logs.map((log, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} className="text-xs font-mono text-white/25 leading-relaxed">
                      <span className="text-violet-500/50">❯ </span>{log}
                    </motion.div>
                  ))}
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-violet-500/50 text-xs font-mono">❯</span>
                    <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ duration: 1, repeat: Infinity }} className="text-xs font-mono text-violet-400/50">▊</motion.span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && !loading && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {/* Result header */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <div>
                    <h2 className="font-black text-lg tracking-tight">{result.projectName}</h2>
                    {result.from_cache && (
                      <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">⚡ Cached result</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerate(true)}
                    className="flex items-center gap-1.5 text-xs px-3 py-2 glass rounded-lg border border-white/8 hover:border-white/15 text-white/40 hover:text-white transition-all"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Regenerate
                  </button>
                  <button onClick={handleDownloadPDF} className="btn-primary text-xs py-2 px-4">
                    <Download className="w-3.5 h-3.5" /> PDF Report
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 p-1 glass rounded-2xl border border-white/5 overflow-x-auto">
                {TABS.map((tab, i) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(i)}
                    className={`flex items-center gap-1.5 flex-1 py-2 px-3 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-300 ${
                      activeTab === i
                        ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/20'
                        : 'text-white/30 hover:text-white/60 hover:bg-white/3'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="hidden sm:block">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

                {/* Architecture Tab */}
                {activeTab === 0 && (
                  <div className="space-y-4">
                    <div className="glass-card border border-white/5">
                      <p className="text-sm text-white/40 mb-5 leading-relaxed">{arch?.summary}</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {arch?.services?.map((s: any, i: number) => (
                          <motion.div
                            key={s.name}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white/3 border border-white/5 rounded-xl p-4 hover:border-violet-500/20 transition-all group"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                              <h3 className="font-semibold text-white text-sm group-hover:text-violet-300 transition-colors">{s.name}</h3>
                            </div>
                            <p className="text-xs text-white/30 leading-relaxed mb-2">{s.description}</p>
                            {s.technology && <span className="text-xs px-2 py-1 bg-violet-500/10 text-violet-400 rounded-lg border border-violet-500/15 font-mono">{s.technology}</span>}
                          </motion.div>
                        ))}
                      </div>
                      {arch?.techStack && (
                        <div className="mt-4 pt-4 border-t border-white/5">
                          <p className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-3">Tech Stack</p>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(arch.techStack).map(([k, v]) => (
                              <span key={k} className="text-xs px-2 py-1 glass border border-white/8 rounded-lg">
                                <span className="text-white/30">{k}: </span>
                                <span className="text-violet-300 font-mono">{v as string}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Database Tab */}
                {activeTab === 1 && (
                  <div className="space-y-3">
                    {db?.tables?.map((table: any, i: number) => (
                      <motion.div
                        key={table.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="glass-card border border-white/5"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
                            <Database className="w-4 h-4 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="font-black text-white font-mono">{table.name}</h3>
                            {table.description && <p className="text-xs text-white/30">{table.description}</p>}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          {table.columns?.map((col: any) => (
                            <div key={col.name} className="flex items-center gap-3 p-2.5 bg-white/2 rounded-lg border border-white/3 hover:border-blue-500/15 transition-all group">
                              <code className="text-xs text-blue-300 font-mono flex-shrink-0 group-hover:text-blue-200">{col.name}</code>
                              <span className="text-xs text-amber-400/70 font-mono flex-shrink-0">{col.type}</span>
                              <div className="flex gap-1 ml-auto">
                                {col.primaryKey && <span className="text-xs px-1.5 py-0.5 bg-yellow-500/10 text-yellow-400 rounded border border-yellow-500/20">PK</span>}
                                {col.foreignKey && <span className="text-xs px-1.5 py-0.5 bg-purple-500/10 text-purple-400 rounded border border-purple-500/20">FK</span>}
                                {col.required && <span className="text-xs px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded border border-red-500/20">REQ</span>}
                                {col.unique && <span className="text-xs px-1.5 py-0.5 bg-green-500/10 text-green-400 rounded border border-green-500/20">UNQ</span>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* API Tab */}
                {activeTab === 2 && (
                  <div className="space-y-3">
                    {api?.endpoints?.map((ep: any, i: number) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="glass-card border border-white/5 group hover:border-emerald-500/15 transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <span className={`flex-shrink-0 text-xs font-black px-2.5 py-1 rounded-lg font-mono ${
                            ep.method === 'GET' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            ep.method === 'POST' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            ep.method === 'PUT' || ep.method === 'PATCH' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>{ep.method}</span>
                          <div className="flex-1 min-w-0">
                            <code className="text-sm text-white/70 font-mono group-hover:text-white transition-colors">{ep.path}</code>
                            <p className="text-xs text-white/30 mt-1">{ep.description}</p>
                            {ep.auth && <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-violet-500/10 text-violet-400 rounded border border-violet-500/20">🔐 Auth required</span>}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Cost Tab */}
                {activeTab === 3 && (
                  <div className="space-y-4">
                    {cost?.tiers ? (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {Object.entries(cost.tiers).map(([tier, data]: [string, any], i) => (
                          <motion.div
                            key={tier}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1 }}
                            className={`glass-card border transition-all ${i === 1 ? 'border-violet-500/30 relative' : 'border-white/5'}`}
                          >
                            {i === 1 && <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs px-3 py-1 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-full text-white font-semibold">Recommended</div>}
                            <div className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-2">{tier}</div>
                            <div className="text-2xl font-black gradient-text mb-3">{data.monthly || data.total || '$—'}</div>
                            {data.services && Object.entries(data.services).map(([svc, cost]: [string, any]) => (
                              <div key={svc} className="flex justify-between text-xs py-1 border-b border-white/3 last:border-0">
                                <span className="text-white/30">{svc}</span>
                                <span className="text-white/50 font-mono">{cost}</span>
                              </div>
                            ))}
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="glass-card border border-white/5">
                        <pre className="text-xs text-white/40 whitespace-pre-wrap font-mono">{JSON.stringify(cost, null, 2)}</pre>
                      </div>
                    )}
                    {cost?.savingTips && (
                      <div className="glass-card border border-amber-500/15">
                        <p className="text-xs font-semibold text-amber-400 uppercase tracking-widest mb-3">Cost Saving Tips</p>
                        <ul className="space-y-2">
                          {cost.savingTips.map((tip: string, i: number) => (
                            <li key={i} className="text-sm text-white/40 flex gap-2">
                              <span className="text-amber-400 flex-shrink-0">→</span>{tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 4 && (
                  <div className="space-y-3">
                    {security?.items ? (
                      security.items.map((item: any, i: number) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className={`glass-card border transition-all ${
                            item.severity === 'critical' || item.risk === 'critical' ? 'border-red-500/20 bg-red-500/3' :
                            item.severity === 'high' || item.risk === 'high' ? 'border-orange-500/20 bg-orange-500/3' :
                            item.severity === 'medium' || item.risk === 'medium' ? 'border-yellow-500/20 bg-yellow-500/3' :
                            'border-white/5'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded font-semibold uppercase tracking-wider ${
                              (item.severity || item.risk) === 'critical' ? 'bg-red-500/15 text-red-400 border border-red-500/20' :
                              (item.severity || item.risk) === 'high' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' :
                              (item.severity || item.risk) === 'medium' ? 'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20' :
                              'bg-green-500/15 text-green-400 border border-green-500/20'
                            }`}>{item.severity || item.risk || 'low'}</span>
                            <div>
                              <h3 className="text-sm font-semibold text-white">{item.title || item.check}</h3>
                              <p className="text-xs text-white/30 mt-1">{item.description || item.recommendation}</p>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    ) : (
                      <div className="glass-card border border-white/5">
                        <pre className="text-xs text-white/40 whitespace-pre-wrap font-mono">{JSON.stringify(security, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                )}

                {/* Diagrams Tab */}
                {activeTab === 5 && (
                  <div className="space-y-4">
                    {diagrams?.architecture && (
                      <div className="glass-card border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                          <GitBranch className="w-4 h-4 text-pink-400" />
                          <h3 className="font-semibold text-white text-sm">System Architecture Diagram</h3>
                        </div>
                        <MermaidDiagram diagram={diagrams.architecture} title="System Architecture" />
                      </div>
                    )}
                    {diagrams?.er && (
                      <div className="glass-card border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                          <Database className="w-4 h-4 text-blue-400" />
                          <h3 className="font-semibold text-white text-sm">Entity Relationship Diagram</h3>
                        </div>
                        <MermaidDiagram diagram={diagrams.er} title="ER Diagram" />
                      </div>
                    )}
                    {diagrams?.sequence && (
                      <div className="glass-card border border-white/5">
                        <div className="flex items-center gap-2 mb-4">
                          <Activity className="w-4 h-4 text-emerald-400" />
                          <h3 className="font-semibold text-white text-sm">Sequence Diagram</h3>
                        </div>
                        <MermaidDiagram diagram={diagrams.sequence} title="Sequence Diagram" />
                      </div>
                    )}
                    {!diagrams?.architecture && !diagrams?.er && !diagrams?.sequence && (
                      <div className="glass-card border border-white/5 text-center py-10">
                        <GitBranch className="w-8 h-8 text-white/10 mx-auto mb-3" />
                        <p className="text-sm text-white/20">No diagrams generated</p>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
