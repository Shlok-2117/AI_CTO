'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Cpu, Database, Code, DollarSign, Shield, GitBranch, Zap, Activity, Layers, Terminal } from 'lucide-react'
import { JarvisNav } from '@/components/jarvis/JarvisNav'
import { HudOrb } from '@/components/jarvis/HudOrb'
import { BootScreen } from '@/components/jarvis/BootScreen'

const FEATURES = [
  { icon: Cpu, id: '01', title: 'Architecture Agent', desc: 'Generates complete system architecture with services, communication patterns, and infrastructure recommendations.', color: '#00D4FF', border: 'rgba(0,212,255,0.15)' },
  { icon: Database, id: '02', title: 'Database Agent', desc: 'Designs normalized PostgreSQL schema with tables, indexes, foreign keys, and SQL preview.', color: '#38BDF8', border: 'rgba(56,189,248,0.15)' },
  { icon: Code, id: '03', title: 'API Design Agent', desc: 'Creates complete REST API spec with endpoints, auth strategy, and request/response shapes.', color: '#818CF8', border: 'rgba(129,140,248,0.15)' },
  { icon: DollarSign, id: '04', title: 'Cost Estimator', desc: 'Estimates monthly AWS costs across small, medium, and large scale tiers with saving tips.', color: '#F59E0B', border: 'rgba(245,158,11,0.15)' },
  { icon: Shield, id: '05', title: 'Security Agent', desc: 'Runs OWASP security audit with risk scoring and prioritized vulnerability checklist.', color: '#F87171', border: 'rgba(248,113,113,0.15)' },
  { icon: GitBranch, id: '06', title: 'Diagram Agent', desc: 'Renders architecture, ER, and sequence diagrams automatically from Mermaid syntax.', color: '#A78BFA', border: 'rgba(167,139,250,0.15)' },
]

const MARQUEE_ITEMS = [
  '▸ SYSTEM ARCHITECTURE', '▸ DATABASE SCHEMA', '▸ API DESIGN', '▸ COST ESTIMATION',
  '▸ SECURITY AUDIT', '▸ ER DIAGRAMS', '▸ SEQUENCE DIAGRAMS', '▸ SCALING STRATEGY',
  '▸ TECH STACK', '▸ INFRASTRUCTURE', '▸ MICROSERVICES', '▸ CLOUD PLANNING'
]

const STATS = [
  { value: '6', label: 'AI AGENTS', sub: 'specialized' },
  { value: '<60s', label: 'GENERATION', sub: 'per blueprint' },
  { value: '100%', label: 'FREE TIER', sub: 'forever' },
  { value: '∞', label: 'IDEAS', sub: 'supported' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 40, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.8, ease: [0.23, 1, 0.32, 1] as [number, number, number, number] } }
}

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }

export default function LandingPage() {
  const [booted, setBooted] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [currentStat, setCurrentStat] = useState(0)
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 500], [0, -100])
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0])

  useEffect(() => {
    setMounted(true)
    if (typeof window !== 'undefined' && sessionStorage.getItem('jarvis_booted')) {
      setBooted(true)
    }
  }, [])

  useEffect(() => {
    const t = setInterval(() => setCurrentStat(p => (p + 1) % STATS.length), 2000)
    return () => clearInterval(t)
  }, [])

  const handleBootComplete = useCallback(() => setBooted(true), [])

  if (!mounted) return null

  return (
    <>
      {!booted && <BootScreen onComplete={handleBootComplete} />}

      {booted && (
        <motion.div
          className="page-jarvis text-white overflow-x-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="scan-line" />
          <div className="fixed inset-0 hud-grid pointer-events-none opacity-40" />

          <JarvisNav />

          {/* HERO */}
          <motion.section
            style={{ y: heroY, opacity: heroOpacity }}
            className="relative min-h-screen flex items-center justify-center px-6 pt-20 overflow-hidden"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
              <HudOrb size={500} />
            </div>
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.04) 0%, transparent 70%)' }}
            />

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="visible"
              className="relative z-10 text-center max-w-5xl mx-auto"
            >
              <motion.div variants={fadeUp} className="inline-flex items-center gap-3 mb-10">
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-full"
                  style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)' }}
                >
                  <div className="status-online" />
                  <span className="text-[10px] font-mono tracking-[0.2em]" style={{ color: '#00D4FF' }}>
                    JARVIS SYSTEM ONLINE · 6 AGENTS READY
                  </span>
                </div>
              </motion.div>

              <motion.div variants={fadeUp} className="mb-4">
                <div className="text-xs font-mono tracking-[0.4em] mb-4" style={{ color: 'rgba(0,212,255,0.5)' }}>
                  INITIALIZING...
                </div>
                <h1 className="font-black leading-[0.85] tracking-tighter">
                  <span className="block text-6xl sm:text-8xl lg:text-9xl" style={{ color: '#F8FAFC' }}>Your AI</span>
                  <span className="block text-6xl sm:text-8xl lg:text-9xl text-jarvis animate-flicker">CTO</span>
                  <span className="block text-xl sm:text-2xl lg:text-3xl font-light mt-4" style={{ color: 'rgba(248,250,252,0.4)', letterSpacing: '0.1em' }}>
                    THINKS AT THE SPEED OF ARCHITECTURE
                  </span>
                </h1>
              </motion.div>

              <motion.p variants={fadeUp} className="text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: 'rgba(248,250,252,0.35)' }}>
                Describe any startup idea. Six specialized AI agents generate your complete
                technical blueprint — architecture, database, APIs, costs, security, and diagrams.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link href="/auth/register" className="btn-jarvis">
                  <Zap className="w-4 h-4" />
                  INITIALIZE SYSTEM
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/auth/login" className="btn-amber">
                  SIGN IN
                </Link>
              </motion.div>

              <motion.p variants={fadeUp} className="text-xs font-mono mt-6" style={{ color: 'rgba(248,250,252,0.15)' }}>
                NO CREDIT CARD · 100% FREE · OPEN SOURCE
              </motion.p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 8, 0], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
            >
              <div className="text-[9px] font-mono tracking-[0.3em]" style={{ color: 'rgba(0,212,255,0.4)' }}>SCROLL</div>
              <div className="w-px h-8" style={{ background: 'linear-gradient(to bottom, rgba(0,212,255,0.4), transparent)' }} />
            </motion.div>
          </motion.section>

          {/* MARQUEE */}
          <div className="border-y overflow-hidden" style={{ borderColor: 'rgba(0,212,255,0.08)', background: 'rgba(0,212,255,0.02)' }}>
            <div className="flex animate-marquee whitespace-nowrap py-3">
              {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
                <span key={i} className="text-[10px] font-mono flex-shrink-0 px-6" style={{ color: 'rgba(0,212,255,0.35)' }}>
                  {item}
                </span>
              ))}
            </div>
          </div>

          {/* STATS */}
          <section className="py-20 px-6">
            <motion.div
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {STATS.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  variants={fadeUp}
                  className="hud-panel hud-corners rounded-lg p-6 text-center"
                  style={{ borderColor: i === currentStat ? 'rgba(0,212,255,0.3)' : 'rgba(0,212,255,0.12)' }}
                >
                  <div className="text-4xl font-black mb-1 text-jarvis">{stat.value}</div>
                  <div className="text-[10px] font-mono tracking-widest mb-1" style={{ color: 'rgba(0,212,255,0.6)' }}>
                    {stat.label}
                  </div>
                  <div className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>{stat.sub}</div>
                </motion.div>
              ))}
            </motion.div>
          </section>

          {/* FEATURES */}
          <section className="py-20 px-6">
            <div className="max-w-6xl mx-auto">
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
                <div className="text-[10px] font-mono tracking-[0.4em] mb-3" style={{ color: 'rgba(0,212,255,0.5)' }}>
                  AGENT MODULES
                </div>
                <h2 className="text-4xl sm:text-5xl font-black tracking-tight">
                  Six specialized<br />
                  <span className="text-jarvis">intelligence cores</span>
                </h2>
              </motion.div>

              <motion.div
                variants={stagger}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
              >
                {FEATURES.map((f) => (
                  <motion.div
                    key={f.id}
                    variants={fadeUp}
                    className="hud-panel hud-corners rounded-lg p-6 group cursor-default border-beam-cyan"
                    whileHover={{ y: -4 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className="text-[10px] font-mono mb-2" style={{ color: 'rgba(248,250,252,0.2)' }}>
                          MODULE.{f.id}
                        </div>
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ background: `${f.color}18`, border: `1px solid ${f.border}` }}
                        >
                          <f.icon className="w-5 h-5" style={{ color: f.color }} />
                        </div>
                      </div>
                      <div>
                        <h3 className="font-bold text-sm mb-2" style={{ color: '#F8FAFC' }}>{f.title}</h3>
                        <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.3)' }}>{f.desc}</p>
                      </div>
                    </div>
                    <div className="mt-4 pt-4 flex items-center gap-2" style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}>
                      <div className="status-online" style={{ width: 5, height: 5 }} />
                      <span className="text-[9px] font-mono" style={{ color: f.color, opacity: 0.7 }}>AGENT ONLINE</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="py-20 px-6">
            <div className="max-w-4xl mx-auto">
              <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="mb-16">
                <div className="text-[10px] font-mono tracking-[0.4em] mb-3" style={{ color: 'rgba(0,212,255,0.5)' }}>MISSION PROTOCOL</div>
                <h2 className="text-4xl font-black">Three steps to<br /><span className="text-jarvis">full deployment</span></h2>
              </motion.div>

              <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{ once: true }} className="space-y-4">
                {[
                  { num: 'MISSION 01', title: 'State your objective', desc: 'Describe any startup idea in plain English. No technical jargon. No templates. Just your vision.', icon: Terminal },
                  { num: 'MISSION 02', title: 'Agents engage', desc: 'All 6 AI agents activate in sequence. Each one uses the previous output as context for deeper accuracy.', icon: Activity },
                  { num: 'MISSION 03', title: 'Blueprint delivered', desc: 'Download your complete technical blueprint — architecture diagrams, schemas, APIs, costs, security audit, and PDF report.', icon: Layers },
                ].map((step, i) => (
                  <motion.div key={step.num} variants={fadeUp} className="hud-panel rounded-lg p-6 flex items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="text-[9px] font-mono tracking-[0.2em] mb-1" style={{ color: 'rgba(0,212,255,0.4)' }}>{step.num}</div>
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}
                      >
                        <step.icon className="w-5 h-5" style={{ color: '#00D4FF' }} />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-2">{step.title}</h3>
                      <p className="text-sm leading-relaxed" style={{ color: 'rgba(248,250,252,0.35)' }}>{step.desc}</p>
                    </div>
                    <div className="flex-shrink-0 text-5xl font-black" style={{ color: 'rgba(0,212,255,0.05)' }}>
                      {String(i + 1).padStart(2, '0')}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-24 px-6">
            <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true }} className="max-w-3xl mx-auto text-center">
              <div className="hud-panel rounded-2xl p-12 border-beam-cyan relative overflow-hidden">
                <div
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)' }}
                />
                <div className="relative z-10">
                  <div className="text-[10px] font-mono tracking-[0.4em] mb-6" style={{ color: 'rgba(0,212,255,0.5)' }}>
                    SYSTEM READY
                  </div>
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
                    Ready to think<br /><span className="text-jarvis">like a CTO?</span>
                  </h2>
                  <p className="mb-10 leading-relaxed" style={{ color: 'rgba(248,250,252,0.3)' }}>
                    Initialize your access. Design complete systems in under 60 seconds.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/auth/register" className="btn-jarvis">
                      <Zap className="w-4 h-4" />
                      INITIALIZE FREE ACCESS
                    </Link>
                    <Link href="/auth/login" className="btn-amber">
                      SIGN IN
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* FOOTER */}
          <footer className="px-6 py-10" style={{ borderTop: '1px solid rgba(0,212,255,0.08)' }}>
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}
                >
                  <Cpu className="w-3 h-3" style={{ color: '#00D4FF' }} />
                </div>
                <div>
                  <div className="text-xs font-mono tracking-widest" style={{ color: 'rgba(0,212,255,0.6)' }}>AI CTO</div>
                  <div className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>BUILT BY SHLOK GOHEL</div>
                </div>
              </div>
              <div className="flex gap-8 text-[10px] font-mono tracking-widest" style={{ color: 'rgba(248,250,252,0.2)' }}>
                <Link href="/auth/login" className="hover:text-cyan-400 transition-colors">SIGN IN</Link>
                <Link href="/auth/register" className="hover:text-cyan-400 transition-colors">REGISTER</Link>
                <a href="https://github.com/Shlok-2117/AI_CTO" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors">GITHUB</a>
              </div>
            </div>
          </footer>
        </motion.div>
      )}
    </>
  )
}
