'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CheckCircle, Zap, ArrowRight, Star } from 'lucide-react'
import { JarvisNav } from '@/components/jarvis/JarvisNav'

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.23,1,0.32,1] as const } }
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

const FREE_FEATURES = [
  '12 AI agents — Founder to CTO Verdict',
  'Unlimited blueprint generations',
  'System architecture design',
  'PostgreSQL database schema',
  'REST API specification',
  'AWS cost estimation (3 tiers)',
  'Security audit & OWASP checklist',
  'DevOps & CI/CD pipeline design',
  'FinOps cost analysis',
  '3-year hiring plan',
  'Mermaid diagrams (Architecture, ER, Sequence)',
  'CTO Verdict with investability score',
  'PDF report export',
  'Generation history',
  'JARVIS Voice text-to-speech',
  'Keyboard shortcuts',
  'Email OTP verification',
  'Dark JARVIS UI',
]

const COMPARISON = [
  { feature: 'Architecture generation',         us: true,        others: 'Basic only' },
  { feature: 'Business & founder analysis',     us: true,        others: false },
  { feature: 'Product strategy (AARRR)',        us: true,        others: false },
  { feature: 'Database schema design',          us: true,        others: 'Partial' },
  { feature: 'API specification',               us: true,        others: 'Partial' },
  { feature: 'Scaling roadmap (0-100M users)',  us: true,        others: false },
  { feature: 'Security audit (OWASP)',          us: true,        others: false },
  { feature: 'DevOps pipeline design',          us: true,        others: false },
  { feature: 'Cloud cost estimation',           us: true,        others: 'Basic' },
  { feature: 'Hiring plan (3 years)',           us: true,        others: false },
  { feature: 'CTO self-critique & verdict',     us: true,        others: false },
  { feature: 'VC investability score',          us: true,        others: false },
  { feature: 'PDF export',                      us: true,        others: 'Paid' },
  { feature: 'Price',                           us: '$0 forever', others: '$20-99/mo' },
]

const FAQS = [
  {
    q: 'Is it really free forever?',
    a: 'Yes. JARVIS_CTO is 100% free. No credit card required, no usage limits, no hidden fees. We run on free-tier AI models and want to make CTO-level thinking accessible to every founder.'
  },
  {
    q: 'How is this different from ChatGPT?',
    a: 'ChatGPT gives you one generic response. JARVIS_CTO runs 12 specialized agents in sequence — each one uses the previous output as context. The result is a connected, coherent technical blueprint, not disconnected answers.'
  },
  {
    q: 'How long does generation take?',
    a: 'Typically 2-4 minutes for a complete 12-phase blueprint. Each agent makes one AI call, and results are saved so the same idea returns instantly from cache.'
  },
  {
    q: 'Can I use this for my actual startup?',
    a: 'Absolutely. Many founders use JARVIS_CTO as a starting point for investor decks, technical interviews, and architecture planning. The output is meant to be a starting blueprint, not a rigid specification.'
  },
  {
    q: 'What happens to my blueprints?',
    a: 'All blueprints are saved to your account history. You can view, download as PDF, or delete them anytime.'
  },
  {
    q: 'Will there be a paid plan?',
    a: 'We plan to add a Pro tier with GPT-4o powered agents, team collaboration, and API access. The free tier will always remain free with full 12-agent access.'
  },
]

export default function PricingPage() {
  return (
    <div className="page-jarvis text-white overflow-x-hidden">
      <div className="fixed inset-0 hud-grid opacity-15 pointer-events-none" />
      <div className="scan-line" />
      <JarvisNav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="max-w-3xl mx-auto text-center">
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{background:'rgba(245,158,11,0.06)', border:'1px solid rgba(245,158,11,0.2)'}}>
            <Star className="w-3.5 h-3.5" style={{color:'#F59E0B'}} />
            <span className="text-[10px] font-mono tracking-[0.2em]" style={{color:'#F59E0B'}}>
              100% FREE — NO CREDIT CARD
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="text-5xl sm:text-7xl font-black tracking-tight mb-4 leading-[0.9]">
            Simple,<br /><span className="text-jarvis">transparent</span><br />pricing.
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base leading-relaxed"
            style={{color:'rgba(248,250,252,0.35)'}}>
            Everything. Unlimited. Free.
          </motion.p>
        </motion.div>
      </section>

      {/* Pricing cards */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6">

          {/* Free card */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            className="hud-panel rounded-2xl overflow-hidden relative"
            style={{borderColor:'rgba(0,212,255,0.25)'}}>
            <div className="absolute top-0 left-0 right-0 h-0.5"
              style={{background:'linear-gradient(90deg,transparent,#00D4FF,transparent)'}} />
            <div className="p-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-6 text-[9px] font-mono font-bold tracking-widest"
                style={{background:'rgba(0,212,255,0.1)', border:'1px solid rgba(0,212,255,0.25)', color:'#00D4FF'}}>
                ✓ CURRENT PLAN
              </div>
              <div className="mb-2">
                <div className="text-[9px] font-mono tracking-widest mb-1"
                  style={{color:'rgba(248,250,252,0.3)'}}>JARVIS_CTO</div>
                <div className="text-6xl font-black text-jarvis">$0</div>
                <div className="text-sm font-mono mt-1" style={{color:'rgba(248,250,252,0.3)'}}>/ month · forever</div>
              </div>
              <p className="text-xs mb-6 leading-relaxed" style={{color:'rgba(248,250,252,0.3)'}}>
                Full access to all 12 AI agents, unlimited generations,
                PDF export, and every feature — completely free.
              </p>
              <Link href="/auth/register"
                className="btn-jarvis w-full justify-center mb-6 block text-center">
                <Zap className="w-4 h-4 inline mr-2" />START FREE NOW
              </Link>
              <div className="space-y-2">
                {FREE_FEATURES.map((feat, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs"
                    style={{color:'rgba(248,250,252,0.5)'}}>
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                      style={{color:'#00D4FF'}} />
                    {feat}
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Pro card — coming soon */}
          <motion.div variants={fadeUp} initial="hidden" animate="visible"
            transition={{delay:0.1}}
            className="hud-panel rounded-2xl p-8 relative overflow-hidden"
            style={{borderColor:'rgba(255,255,255,0.06)', opacity:0.6}}>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="px-4 py-2 rounded font-black"
                style={{
                  background:'rgba(245,158,11,0.1)',
                  border:'1px solid rgba(245,158,11,0.3)',
                  color:'#F59E0B',
                  transform:'rotate(-15deg)',
                  fontSize:'14px',
                  letterSpacing:'0.2em'
                }}>
                COMING SOON
              </div>
            </div>
            <div className="mb-2">
              <div className="text-[9px] font-mono tracking-widest mb-1"
                style={{color:'rgba(248,250,252,0.2)'}}>JARVIS_CTO PRO</div>
              <div className="text-6xl font-black" style={{color:'rgba(248,250,252,0.1)'}}>$?</div>
              <div className="text-sm font-mono mt-1" style={{color:'rgba(248,250,252,0.15)'}}>/ month</div>
            </div>
            <p className="text-xs mb-6" style={{color:'rgba(248,250,252,0.2)'}}>
              Premium features for serious founders and engineering teams.
            </p>
            <div className="space-y-2">
              {['Everything in Free','GPT-4o powered agents','Team collaboration','Custom tech stack preferences','API access','Priority generation queue','Slack & Notion integration','White-label PDF export'].map((feat, i) => (
                <div key={i} className="flex items-start gap-2.5 text-xs"
                  style={{color:'rgba(248,250,252,0.2)'}}>
                  <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                    style={{color:'rgba(248,250,252,0.1)'}} />
                  {feat}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison table */}
      <section className="py-20 px-6">
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once:true}}
            className="mb-10">
            <div className="text-[9px] font-mono tracking-[0.4em] mb-3"
              style={{color:'rgba(0,212,255,0.4)'}}>COMPARISON</div>
            <h2 className="text-3xl font-black">vs other AI architecture tools</h2>
          </motion.div>

          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once:true}}
            className="hud-panel rounded-xl overflow-hidden"
            style={{borderColor:'rgba(0,212,255,0.1)'}}>
            <div className="grid grid-cols-3 px-5 py-3 border-b"
              style={{borderColor:'rgba(0,212,255,0.08)', background:'rgba(0,212,255,0.03)'}}>
              <div className="text-[9px] font-mono" style={{color:'rgba(248,250,252,0.3)'}}>FEATURE</div>
              <div className="text-[9px] font-mono text-center" style={{color:'#00D4FF'}}>JARVIS_CTO</div>
              <div className="text-[9px] font-mono text-center" style={{color:'rgba(248,250,252,0.2)'}}>OTHERS</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} className="grid grid-cols-3 px-5 py-3"
                style={{borderBottom: i < COMPARISON.length-1 ? '1px solid rgba(0,212,255,0.04)' : 'none'}}>
                <div className="text-xs" style={{color:'rgba(248,250,252,0.4)'}}>{row.feature}</div>
                <div className="text-center">
                  {row.us === true
                    ? <CheckCircle className="w-4 h-4 mx-auto" style={{color:'#00D4FF'}} />
                    : <span className="text-xs font-mono" style={{color:'#00D4FF'}}>{row.us}</span>
                  }
                </div>
                <div className="text-center">
                  {row.others === false
                    ? <span className="text-lg" style={{color:'rgba(248,113,113,0.5)'}}>✕</span>
                    : <span className="text-xs font-mono" style={{color:'rgba(248,250,252,0.25)'}}>{row.others}</span>
                  }
                </div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 px-6 border-t" style={{borderColor:'rgba(0,212,255,0.06)'}}>
        <div className="max-w-3xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once:true}}
            className="mb-12">
            <div className="text-[9px] font-mono tracking-[0.4em] mb-3"
              style={{color:'rgba(0,212,255,0.4)'}}>FAQ</div>
            <h2 className="text-3xl font-black">Common questions</h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{once:true}}
            className="space-y-3">
            {FAQS.map((faq, i) => (
              <motion.div key={i} variants={fadeUp}
                className="hud-panel rounded-xl p-6"
                style={{borderColor:'rgba(0,212,255,0.08)'}}>
                <div className="flex items-start gap-3">
                  <span className="text-[9px] font-mono font-bold flex-shrink-0 mt-1"
                    style={{color:'rgba(0,212,255,0.4)'}}>
                    {String(i+1).padStart(2,'0')}
                  </span>
                  <div>
                    <h3 className="font-bold text-sm mb-2" style={{color:'#F8FAFC'}}>{faq.q}</h3>
                    <p className="text-xs leading-relaxed" style={{color:'rgba(248,250,252,0.4)'}}>{faq.a}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once:true}}
          className="max-w-2xl mx-auto text-center hud-panel rounded-2xl p-12"
          style={{borderColor:'rgba(0,212,255,0.15)'}}>
          <div className="text-[9px] font-mono tracking-[0.4em] mb-4"
            style={{color:'rgba(0,212,255,0.4)'}}>NO CATCH</div>
          <h2 className="text-3xl font-black mb-4">
            Free today.<br /><span className="text-jarvis">Free tomorrow.</span><br />Free forever.
          </h2>
          <p className="text-sm mb-8" style={{color:'rgba(248,250,252,0.3)'}}>
            Start generating professional technical blueprints right now.
            No signup fee. No credit card. No limits.
          </p>
          <Link href="/auth/register" className="btn-jarvis">
            <Zap className="w-4 h-4" /> INITIALIZE FREE ACCESS <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-[9px] font-mono mt-4" style={{color:'rgba(248,250,252,0.15)'}}>
            JOIN 100% FREE · NO CREDIT CARD · INSTANT ACCESS
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{borderColor:'rgba(0,212,255,0.06)'}}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[9px] font-mono" style={{color:'rgba(248,250,252,0.15)'}}>
            JARVIS_CTO · BUILT BY SHLOK GOHEL · {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 text-[9px] font-mono" style={{color:'rgba(248,250,252,0.2)'}}>
            <Link href="/features" className="hover:text-cyan-400 transition-colors">FEATURES</Link>
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">DASHBOARD</Link>
            <a href="https://github.com/Shlok-2117/AI_CTO" target="_blank"
              rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">GITHUB</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
