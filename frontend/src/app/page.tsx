'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Cpu, Zap, Database, Code, Shield, DollarSign, ArrowRight, GitBranch, Star, Menu, X, Terminal, Layers, Globe } from 'lucide-react'
import { GridBackground } from '@/components/ui/GridBackground'
import { FloatingOrb } from '@/components/ui/FloatingOrb'
import { Marquee } from '@/components/ui/Marquee'

const MARQUEE_ITEMS = [
  'System Architecture', 'Database Schema', 'API Design', 'Cost Estimation',
  'Security Audit', 'ER Diagrams', 'Sequence Diagrams', 'Scaling Strategy',
  'Tech Stack', 'Infrastructure', 'Microservices', 'Cloud Architecture'
]

const FEATURES = [
  { icon: Cpu, title: 'System Architecture', desc: 'Services, tech stack, communication patterns, and infrastructure — all generated automatically.', color: 'from-violet-500/10 to-violet-500/5', border: 'border-violet-500/20', iconColor: 'text-violet-400' },
  { icon: Database, title: 'Database Schema', desc: 'Complete PostgreSQL schema with tables, indexes, relationships, and normalization.', color: 'from-blue-500/10 to-blue-500/5', border: 'border-blue-500/20', iconColor: 'text-blue-400' },
  { icon: Code, title: 'API Design', desc: 'Full REST API specification with endpoints, auth, request/response shapes.', color: 'from-emerald-500/10 to-emerald-500/5', border: 'border-emerald-500/20', iconColor: 'text-emerald-400' },
  { icon: DollarSign, title: 'Cost Estimation', desc: 'AWS pricing for 3 scale tiers with per-service breakdown and saving tips.', color: 'from-amber-500/10 to-amber-500/5', border: 'border-amber-500/20', iconColor: 'text-amber-400' },
  { icon: Shield, title: 'Security Audit', desc: 'OWASP checklist, risk scoring, and prioritized vulnerability assessment.', color: 'from-red-500/10 to-red-500/5', border: 'border-red-500/20', iconColor: 'text-red-400' },
  { icon: GitBranch, title: 'Diagram Export', desc: 'Architecture, ER, and sequence diagrams rendered from Mermaid syntax.', color: 'from-pink-500/10 to-pink-500/5', border: 'border-pink-500/20', iconColor: 'text-pink-400' },
]

const STATS = [
  { value: '6', label: 'AI Agents', icon: Layers },
  { value: '<60s', label: 'Per Generation', icon: Zap },
  { value: '100%', label: 'Free Forever', icon: Star },
  { value: '∞', label: 'Ideas Supported', icon: Globe },
]

const EXAMPLES = [
  '"Design a food delivery app like Swiggy"',
  '"Build a fintech platform like Razorpay"',
  '"Create a real-time chat app like Slack"',
  '"Design an e-commerce marketplace"',
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.23, 1, 0.32, 1] as any } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } }
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [currentExample, setCurrentExample] = useState(0)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setCurrentExample(p => (p + 1) % EXAMPLES.length), 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div className="page-bg text-white overflow-x-hidden">

      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? 'glass border-b border-white/5' : ''}`}
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-content-center shadow-lg shadow-violet-500/25 group-hover:shadow-violet-500/40 transition-shadow">
              <Cpu className="w-4 h-4 text-white m-auto" />
            </div>
            <span className="font-bold text-lg tracking-tight">AI CTO</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link href="/auth/login" className="text-sm text-white/40 hover:text-white transition-colors duration-200">Sign in</Link>
            <Link href="/auth/register" className="btn-primary text-sm py-2 px-5">Get started free</Link>
          </div>

          <button className="md:hidden text-white/60 hover:text-white" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden glass border-t border-white/5 px-6 py-4 flex flex-col gap-4"
          >
            <Link href="/auth/login" className="text-sm text-white/60 hover:text-white">Sign in</Link>
            <Link href="/auth/register" className="btn-primary text-sm text-center py-2.5">Get started free</Link>
          </motion.div>
        )}
      </motion.nav>

      {/* Hero */}
      <section className="relative pt-36 pb-24 px-6 text-center overflow-hidden">
        <GridBackground />
        <FloatingOrb className="w-96 h-96 bg-violet-600 top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
        <FloatingOrb className="w-64 h-64 bg-indigo-600 top-1/2 right-0 translate-x-1/2" />

        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto relative z-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-medium text-violet-300 mb-8 border border-violet-500/20">
            <div className="glow-dot" />
            6 specialized AI agents working in sequence
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-6xl sm:text-8xl font-black mb-6 leading-[0.9] tracking-tight">
            Your AI<br />
            <span className="gradient-text">Chief Technology</span><br />
            Officer
          </motion.h1>

          <motion.p variants={fadeUp} className="text-lg text-white/40 mb-10 max-w-xl mx-auto leading-relaxed">
            Type any startup idea. Get complete system architecture, database schema,
            API design, cost estimates, and security audit — in under 60 seconds.
          </motion.p>

          <motion.div variants={fadeUp} className="glass border-beam rounded-2xl p-5 max-w-2xl mx-auto mb-10 text-left border border-white/5">
            <div className="flex items-center gap-2 mb-3">
              <Terminal className="w-3.5 h-3.5 text-violet-400" />
              <span className="text-xs text-white/30 font-mono">ai-cto generate</span>
              <span className="ml-auto flex gap-1">
                {(['#ff5f57', '#febc2e', '#28c840'] as const).map((bg, i) => (
                  <span key={i} className="w-2.5 h-2.5 rounded-full" style={{ background: bg }} />
                ))}
              </span>
            </div>
            <motion.p
              key={currentExample}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-white/60 text-sm font-mono min-h-5"
            >
              {EXAMPLES[currentExample]}
            </motion.p>
          </motion.div>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register" className="btn-primary text-sm">
              Start generating for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/auth/login" className="btn-secondary text-sm">
              Sign in to your account
            </Link>
          </motion.div>

          <motion.p variants={fadeUp} className="text-xs text-white/20 mt-5">
            No credit card required · 100% free · Open source
          </motion.p>
        </motion.div>
      </section>

      {/* Marquee */}
      <div className="border-y border-white/5 py-1">
        <Marquee items={MARQUEE_ITEMS} />
      </div>

      {/* Stats */}
      <section className="py-20 px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-4xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-6"
        >
          {STATS.map(({ value, label, icon: Icon }) => (
            <motion.div key={label} variants={fadeUp} className="glass-card text-center group">
              <Icon className="w-5 h-5 text-violet-400 mx-auto mb-3 group-hover:scale-110 transition-transform" />
              <div className="text-3xl font-black gradient-text mb-1">{value}</div>
              <div className="text-xs text-white/30 font-medium uppercase tracking-widest">{label}</div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Features Bento Grid */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <p className="text-xs text-violet-400 font-semibold uppercase tracking-widest mb-4">Everything you need</p>
            <h2 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight">
              A complete technical<br />blueprint in one click
            </h2>
            <p className="text-white/30 max-w-lg mx-auto">
              6 AI agents work in sequence — each one uses the previous output as context for deeper accuracy.
            </p>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {FEATURES.map(({ icon: Icon, title, desc, color, border, iconColor }, i) => (
              <motion.div
                key={title}
                variants={fadeUp}
                className={`glass-card border ${border} bg-gradient-to-br ${color} group cursor-default`}
              >
                <div className="flex items-start gap-4">
                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 group-hover:scale-110 transition-transform">
                    <Icon className={`w-5 h-5 ${iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm mb-1">{title}</h3>
                    <p className="text-xs text-white/30 leading-relaxed">{desc}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-white/5">
                  <div className="flex items-center gap-1.5 text-xs text-white/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                    Agent {i + 1} of 6
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-950/10 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-black mb-4">From idea to blueprint<br />in 3 steps</h2>
          </motion.div>

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-4"
          >
            {[
              { step: '01', title: 'Describe your idea', desc: 'Type any startup concept in plain English — no technical jargon needed.', icon: Terminal },
              { step: '02', title: '6 agents analyze it', desc: 'Architecture → Database → API → Cost → Security → Diagrams, each building on the last.', icon: Layers },
              { step: '03', title: 'Download your blueprint', desc: 'Get a complete technical report with diagrams, schemas, and PDF export.', icon: GitBranch },
            ].map(({ step, title, desc, icon: Icon }) => (
              <motion.div key={step} variants={fadeUp} className="glass-card border border-white/5 flex gap-6 items-start">
                <div className="text-5xl font-black text-white/5 flex-shrink-0 w-16">{step}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-violet-400" />
                    <h3 className="font-semibold text-white">{title}</h3>
                  </div>
                  <p className="text-sm text-white/30">{desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center"
        >
          <div className="glass-card border-beam border border-violet-500/20 relative overflow-hidden">
            <FloatingOrb className="w-64 h-64 bg-violet-600 -top-32 left-1/2 -translate-x-1/2" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs text-violet-300 mb-6 border border-violet-500/20">
                <Star className="w-3 h-3" /> Free forever
              </div>
              <h2 className="text-4xl font-black mb-4 tracking-tight">Ready to build smarter?</h2>
              <p className="text-white/30 mb-8 leading-relaxed">
                Join developers who design complete systems in seconds, not days.
              </p>
              <Link href="/auth/register" className="btn-primary">
                Get started for free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
              <Cpu className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-white/30">AI CTO · Built by Shlok Gohel</span>
          </div>
          <div className="flex gap-8 text-sm text-white/20">
            <Link href="/auth/login" className="hover:text-white/60 transition-colors">Sign in</Link>
            <Link href="/auth/register" className="hover:text-white/60 transition-colors">Register</Link>
            <a href="https://github.com/Shlok-2117/AI_CTO" target="_blank" rel="noreferrer" className="hover:text-white/60 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
