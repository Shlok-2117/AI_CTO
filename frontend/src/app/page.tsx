'use client'
import { useState, useEffect } from 'react'
import { Cpu, Zap, Database, Code, Shield, DollarSign, Moon, Sun, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const FEATURES = [
  { icon: Cpu, title: 'System Architecture', desc: 'Services, tech stack, communication patterns' },
  { icon: Database, title: 'Database Schema', desc: 'Tables, columns, relationships, indexes' },
  { icon: Code, title: 'API Design', desc: 'REST endpoints, auth, request/response' },
  { icon: DollarSign, title: 'Cost Estimation', desc: 'AWS costs for small, medium, large scale' },
  { icon: Shield, title: 'Security Checklist', desc: 'Auth, encryption, rate limiting, OWASP' },
  { icon: Zap, title: 'Diagram Export', desc: 'Architecture, ER, sequence diagrams' },
]

const EXAMPLES = [
  'Design a food delivery app like Swiggy',
  'Build a fintech payment platform',
  'Create a real-time chat application',
  'Design an e-commerce marketplace',
]

export default function HomePage() {
  const [dark, setDark] = useState(false)
  const [currentExample, setCurrentExample] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('theme')
    if (saved === 'dark') { setDark(true); document.documentElement.classList.add('dark') }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => setCurrentExample(p => (p + 1) % EXAMPLES.length), 2500)
    return () => clearInterval(timer)
  }, [])

  function toggleDark() {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      <nav className="border-b border-gray-100 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
            <Cpu className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-gray-900 dark:text-white">AI CTO</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={toggleDark} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <Link href="/auth/login" className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Sign in</Link>
          <Link href="/auth/register" className="btn-primary text-sm px-4 py-2">Get started</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-50 dark:bg-violet-950 text-violet-700 dark:text-violet-300 rounded-full text-sm mb-6 border border-violet-100 dark:border-violet-800">
          <Zap className="w-3 h-3" /> AI-powered system design
        </div>
        <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
          Generate complete system<br />
          <span className="text-violet-600">architecture in seconds</span>
        </h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
          Type any startup idea. Get architecture diagrams, database schemas, API designs, cost estimates, and a professional PDF report instantly.
        </p>
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 max-w-xl mx-auto mb-8 text-left">
          <p className="text-xs text-gray-400 mb-2 font-mono">Try an example:</p>
          <p className="text-gray-700 dark:text-gray-300 text-sm">"{EXAMPLES[currentExample]}"</p>
        </div>
        <Link href="/auth/register" className="inline-flex items-center gap-2 btn-primary text-base px-6 py-3">
          Start building for free <ArrowRight className="w-4 h-4" />
        </Link>
        <p className="text-sm text-gray-400 mt-3">No credit card required · 100% free</p>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white mb-12">Everything a CTO would design</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="card hover:border-violet-200 dark:hover:border-violet-800 transition-colors">
              <div className="w-9 h-9 bg-violet-50 dark:bg-violet-950 rounded-lg flex items-center justify-center mb-3">
                <Icon className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-1">{title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-100 dark:border-gray-800 py-6 text-center">
        <p className="text-sm text-gray-400">Built with Next.js · Node.js · Google Gemini · Mermaid</p>
      </footer>
    </div>
  )
}
