'use client'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  Cpu, Database, Code, DollarSign, Shield, GitBranch,
  Target, BarChart3, TrendingUp, Server, Users, Award,
  ArrowRight, CheckCircle, Zap, Activity, Lock, Globe
} from 'lucide-react'
import { JarvisNav } from '@/components/jarvis/JarvisNav'

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: 'blur(8px)' },
  visible: { opacity: 1, y: 0, filter: 'blur(0px)', transition: { duration: 0.7, ease: [0.23,1,0.32,1] as const } }
}
const stagger = { visible: { transition: { staggerChildren: 0.08 } } }

const PHASES = [
  {
    id: '01', icon: Target, title: 'Founder Mindset Agent', color: '#00D4FF',
    border: 'rgba(0,212,255,0.2)', bg: 'rgba(0,212,255,0.04)',
    desc: 'Thinks like a founder before touching any technology. Analyzes business model, customer personas, revenue milestones, and MVP definition.',
    outputs: ['One-line startup pitch','Primary & secondary customer personas','Revenue model & pricing strategy','Path to first $100, $10K, $100K, $1M ARR','MVP must-have vs must-NOT-build list','TAM / SAM / SOM market sizing','Competitor weakness analysis']
  },
  {
    id: '02', icon: BarChart3, title: 'Product Strategy Agent', color: '#38BDF8',
    border: 'rgba(56,189,248,0.2)', bg: 'rgba(56,189,248,0.04)',
    desc: 'Designs the complete product journey using AARRR framework. Identifies growth loops, network effects, and key metrics.',
    outputs: ['Full AARRR user journey','Core features with user stories','North Star Metric definition','Primary metrics with 3-month & 12-month targets','Viral growth loop design','Network effects analysis','Vanity metrics to avoid']
  },
  {
    id: '03', icon: Cpu, title: 'Architecture Agent', color: '#818CF8',
    border: 'rgba(129,140,248,0.2)', bg: 'rgba(129,140,248,0.04)',
    desc: 'Designs complete system architecture. Justifies every service separation with real reasoning — not just buzzwords.',
    outputs: ['Architecture pattern with justification','All services with why-separate reasoning','Communication patterns (REST/gRPC/Queue)','Third-party integrations with fallbacks','Key technical decisions with confidence scores','Technology alternatives considered','Evolution path for architecture']
  },
  {
    id: '04', icon: Database, title: 'Database Agent', color: '#A78BFA',
    border: 'rgba(167,139,250,0.2)', bg: 'rgba(167,139,250,0.04)',
    desc: 'Designs production-grade data model with GDPR compliance, audit trails, and migration strategy built in from day one.',
    outputs: ['Complete PostgreSQL schema','Column types, constraints & indexes','PII field identification for GDPR','Soft delete & audit trail design','Foreign key relationships','SQL CREATE TABLE preview','Data retention & backup strategy']
  },
  {
    id: '05', icon: Code, title: 'API Design Agent', color: '#60A5FA',
    border: 'rgba(96,165,250,0.2)', bg: 'rgba(96,165,250,0.04)',
    desc: 'Creates production-grade REST API spec with idempotency, versioning, webhook design, and comprehensive error codes.',
    outputs: ['10+ realistic REST endpoints','Authentication strategy','Rate limiting rules per tier','Idempotency flags per endpoint','Webhook event design','Standard error format & codes','Request/response schemas']
  },
  {
    id: '06', icon: TrendingUp, title: 'Scaling Agent', color: '#34D399',
    border: 'rgba(52,211,153,0.2)', bg: 'rgba(52,211,153,0.04)',
    desc: 'Plans infrastructure evolution from 0 to 100M users across 6 stages. Identifies bottlenecks before they happen.',
    outputs: ['6-stage scaling roadmap (0 to 100M users)','Infrastructure per stage','Cost estimate per stage','Bottleneck identification','Migration triggers','RTO / RPO targets','Failure scenario playbooks']
  },
  {
    id: '07', icon: Shield, title: 'Security Agent', color: '#F87171',
    border: 'rgba(248,113,113,0.2)', bg: 'rgba(248,113,113,0.04)',
    desc: 'Thinks like a hacker first, then designs defenses. Covers OWASP Top 10, threat modeling, and compliance roadmap.',
    outputs: ['Threat model with attack surfaces','OWASP Top 10 coverage','Risk score (Low/Medium/High/Critical)','Auth & authorization checklist','API security requirements','Compliance roadmap (GDPR/SOC2/HIPAA)','Security implementation timeline']
  },
  {
    id: '08', icon: Server, title: 'DevOps Agent', color: '#FB923C',
    border: 'rgba(251,146,60,0.2)', bg: 'rgba(251,146,60,0.04)',
    desc: 'Designs complete CI/CD pipeline, deployment strategy, and observability stack. Blue-green, canary, rollback — all covered.',
    outputs: ['CI/CD pipeline with stage durations','Deployment strategy (blue-green/canary)','Repository & branching strategy','Logging, metrics & tracing stack','Alert rules & on-call strategy','Multi-environment setup','Rollback strategy']
  },
  {
    id: '09', icon: DollarSign, title: 'FinOps Agent', color: '#FBBF24',
    border: 'rgba(251,191,36,0.2)', bg: 'rgba(251,191,36,0.04)',
    desc: 'Every dollar of infrastructure cost justified by revenue potential. Calculates break-even users and runway.',
    outputs: ['MVP / Growth / Scale cost tiers','Per-service cost breakdown','Cost per user at 1K / 10K / 100K','Break-even user count','Runway calculation on $10K','Optimization opportunities with savings %','Free tier eligible services']
  },
  {
    id: '10', icon: Users, title: 'Hiring Agent', color: '#A3E635',
    border: 'rgba(163,230,53,0.2)', bg: 'rgba(163,230,53,0.04)',
    desc: 'Plans your engineering team for 3 years. Every hire justified by business need. Contractor vs full-time decisions included.',
    outputs: ['3-year hiring roadmap','Year 1 hires with salary ranges','When to hire each role (trigger-based)','Contractor vs full-time recommendations','Roles NOT to hire early (with reasons)','Total salary burn per year','Team structure evolution']
  },
  {
    id: '11', icon: GitBranch, title: 'Diagram Agent', color: '#F472B6',
    border: 'rgba(244,114,182,0.2)', bg: 'rgba(244,114,182,0.04)',
    desc: 'Generates 3 interactive Mermaid diagrams rendered directly in browser — architecture, ER, and sequence.',
    outputs: ['System architecture diagram (graph TD)','Entity relationship diagram (erDiagram)','Request sequence diagram','Interactive in-browser rendering','Fallback code view with Mermaid.live link','Matches your actual services & tables','Dark JARVIS theme']
  },
  {
    id: '12', icon: Award, title: 'CTO Verdict Agent', color: '#F59E0B',
    border: 'rgba(245,158,11,0.2)', bg: 'rgba(245,158,11,0.04)',
    desc: 'The most important phase. Switches roles to become a ruthless external VC technical advisor. Challenges every decision.',
    outputs: ['Overengineered component identification','Wrong assumptions list','First bottleneck under 100x traffic','Most dangerous architectural decision','What Netflix / Stripe would do differently','Confidence scores for every recommendation','VC investability score (0-100) + verdict']
  },
]

const EXTRAS = [
  { icon: Zap, title: 'JARVIS Voice', desc: 'Text-to-speech reads your blueprint aloud in a British AI voice' },
  { icon: Activity, title: 'Live Generation Timer', desc: 'Cinematic clock shows real-time progress during generation' },
  { icon: Lock, title: 'Email OTP Verification', desc: 'Secure registration with 6-digit code sent to your inbox' },
  { icon: Globe, title: 'PDF Export', desc: 'Download a professional CTO report as PDF' },
  { icon: Database, title: 'Generation History', desc: 'All blueprints saved — search, view, or delete anytime' },
  { icon: Code, title: 'Keyboard Shortcuts', desc: '1-9 tabs, G generate, P PDF, V voice — full keyboard control' },
]

export default function FeaturesPage() {
  return (
    <div className="page-jarvis text-white overflow-x-hidden">
      <div className="fixed inset-0 hud-grid opacity-15 pointer-events-none" />
      <div className="scan-line" />
      <JarvisNav />

      {/* Hero */}
      <section className="pt-32 pb-16 px-6">
        <motion.div variants={stagger} initial="hidden" animate="visible"
          className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{background:'rgba(0,212,255,0.05)', border:'1px solid rgba(0,212,255,0.15)'}}>
            <div className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{background:'#00D4FF', boxShadow:'0 0 6px #00D4FF'}} />
            <span className="text-[10px] font-mono tracking-[0.2em]" style={{color:'#00D4FF'}}>
              12 SPECIALIZED AI AGENTS
            </span>
          </motion.div>

          <motion.h1 variants={fadeUp}
            className="text-5xl sm:text-7xl font-black tracking-tight mb-6 leading-[0.9]">
            Every feature a<br />
            <span className="text-jarvis">real CTO uses</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-base max-w-xl mx-auto mb-8 leading-relaxed"
            style={{color:'rgba(248,250,252,0.35)'}}>
            12 agents work in sequence — each one uses the previous output as context,
            producing deeper and more accurate results than any single AI call.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/auth/register" className="btn-jarvis">
              <Zap className="w-4 h-4" /> START FREE <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/pricing" className="btn-amber">SEE PRICING</Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats bar */}
      <div className="border-y px-6 py-4"
        style={{borderColor:'rgba(0,212,255,0.08)', background:'rgba(0,212,255,0.02)'}}>
        <div className="max-w-4xl mx-auto flex flex-wrap justify-center gap-8">
          {[
            {val:'12', label:'AI AGENTS'},
            {val:'<60s', label:'PER BLUEPRINT'},
            {val:'100%', label:'FREE FOREVER'},
            {val:'40+', label:'EXAMPLE IDEAS'},
            {val:'PDF', label:'EXPORT'},
            {val:'12', label:'RESULT TABS'},
          ].map(({val, label}) => (
            <div key={label} className="text-center">
              <div className="text-xl font-black text-jarvis">{val}</div>
              <div className="text-[9px] font-mono tracking-widest mt-0.5"
                style={{color:'rgba(248,250,252,0.2)'}}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 12 Phases */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once:true}}
            className="mb-14">
            <div className="text-[9px] font-mono tracking-[0.4em] mb-3"
              style={{color:'rgba(0,212,255,0.4)'}}>AGENT PIPELINE</div>
            <h2 className="text-4xl font-black tracking-tight">
              The 12-phase<br /><span className="text-jarvis">intelligence system</span>
            </h2>
          </motion.div>

          <div className="space-y-4">
            {PHASES.map((phase) => (
              <motion.div key={phase.id} variants={fadeUp} initial="hidden"
                whileInView="visible" viewport={{once:true, margin:'-50px'}}
                className="hud-panel rounded-xl overflow-hidden group"
                style={{borderColor: phase.border}}
                whileHover={{y: -2}} transition={{duration:0.3}}>
                <div className="p-6">
                  <div className="flex items-start gap-5">
                    <div className="flex-shrink-0">
                      <div className="text-[9px] font-mono mb-2"
                        style={{color:'rgba(248,250,252,0.15)'}}>PHASE</div>
                      <div className="text-3xl font-black mb-3"
                        style={{color: phase.color, textShadow:`0 0 20px ${phase.color}40`}}>
                        {phase.id}
                      </div>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                        style={{background: phase.bg, border:`1px solid ${phase.border}`}}>
                        <phase.icon className="w-5 h-5" style={{color: phase.color}} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-black mb-2" style={{color:'#F8FAFC'}}>
                        {phase.title}
                      </h3>
                      <p className="text-sm mb-4 leading-relaxed"
                        style={{color:'rgba(248,250,252,0.35)'}}>
                        {phase.desc}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {phase.outputs.map((output, oi) => (
                          <div key={oi} className="flex items-start gap-2 text-xs"
                            style={{color:'rgba(248,250,252,0.45)'}}>
                            <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5"
                              style={{color: phase.color, opacity:0.7}} />
                            {output}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-px"
                  style={{background:`linear-gradient(90deg, transparent, ${phase.color}30, transparent)`}} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Extra Features */}
      <section className="py-20 px-6 border-t" style={{borderColor:'rgba(0,212,255,0.06)'}}>
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once:true}}
            className="mb-12">
            <div className="text-[9px] font-mono tracking-[0.4em] mb-3"
              style={{color:'rgba(0,212,255,0.4)'}}>PLATFORM FEATURES</div>
            <h2 className="text-3xl font-black">Beyond the blueprint</h2>
          </motion.div>

          <motion.div variants={stagger} initial="hidden" whileInView="visible" viewport={{once:true}}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {EXTRAS.map((feat) => (
              <motion.div key={feat.title} variants={fadeUp}
                className="hud-panel rounded-xl p-5 group"
                style={{borderColor:'rgba(0,212,255,0.08)'}}
                whileHover={{y:-3}} transition={{duration:0.3}}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-4"
                  style={{background:'rgba(0,212,255,0.08)', border:'1px solid rgba(0,212,255,0.15)'}}>
                  <feat.icon className="w-4 h-4" style={{color:'#00D4FF'}} />
                </div>
                <h3 className="font-bold text-sm mb-1.5" style={{color:'#F8FAFC'}}>{feat.title}</h3>
                <p className="text-xs leading-relaxed" style={{color:'rgba(248,250,252,0.3)'}}>{feat.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6">
        <motion.div variants={fadeUp} initial="hidden" whileInView="visible" viewport={{once:true}}
          className="max-w-2xl mx-auto text-center hud-panel rounded-2xl p-12"
          style={{borderColor:'rgba(0,212,255,0.15)'}}>
          <div className="text-[9px] font-mono tracking-[0.4em] mb-4"
            style={{color:'rgba(0,212,255,0.4)'}}>READY TO BEGIN</div>
          <h2 className="text-3xl font-black mb-4">
            12 agents.<br /><span className="text-jarvis">One blueprint.</span><br />Zero cost.
          </h2>
          <p className="text-sm mb-8" style={{color:'rgba(248,250,252,0.3)'}}>
            No credit card. No signup fee. No usage limit.
            Just describe your startup idea and let JARVIS_CTO think for you.
          </p>
          <Link href="/auth/register" className="btn-jarvis">
            <Zap className="w-4 h-4" /> INITIALIZE FREE ACCESS <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t px-6 py-8" style={{borderColor:'rgba(0,212,255,0.06)'}}>
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-[9px] font-mono" style={{color:'rgba(248,250,252,0.15)'}}>
            JARVIS_CTO · BUILT BY SHLOK GOHEL · {new Date().getFullYear()}
          </div>
          <div className="flex gap-6 text-[9px] font-mono" style={{color:'rgba(248,250,252,0.2)'}}>
            <Link href="/pricing" className="hover:text-cyan-400 transition-colors">PRICING</Link>
            <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">DASHBOARD</Link>
            <a href="https://github.com/Shlok-2117/AI_CTO" target="_blank"
              rel="noopener noreferrer" className="hover:text-cyan-400 transition-colors">GITHUB</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
