'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Cpu, Loader2, LogOut, History, CheckCircle, Database, Code,
  DollarSign, Shield, GitBranch, Download, Activity,
  Layers, Users, Cloud, Target, Brain, TrendingUp, Award,
  AlertTriangle, ChevronRight, Zap, Lock, RefreshCw,
  Volume2, Keyboard, X
} from 'lucide-react'
import Link from 'next/link'
import MermaidDiagram from '@/components/MermaidDiagram'

const EXAMPLE_CATEGORIES = [
  {
    category: 'FOOD & DELIVERY',
    examples: [
      'Design a food delivery app like Swiggy with real-time tracking',
      'Build a grocery delivery platform like Blinkit for tier-2 cities',
      'Create a cloud kitchen management platform like Rebel Foods',
      'Build a meal kit subscription service like HelloFresh for India',
    ]
  },
  {
    category: 'FINTECH',
    examples: [
      'Build a UPI payment platform like Razorpay for small businesses',
      'Design a stock trading and investment app like Zerodha',
      'Create a buy-now-pay-later platform like LazyPay',
      'Build a digital lending platform like KreditBee for rural India',
      'Design a crypto exchange and wallet platform like CoinDCX',
      'Create a personal finance management app like ET Money',
    ]
  },
  {
    category: 'HEALTH & WELLNESS',
    examples: [
      'Build a telemedicine platform like Practo with video consultations',
      'Design a mental health and therapy platform like YourDOST',
      'Create a fitness and workout tracking app like Cult.fit',
      'Build an online pharmacy and medicine delivery app like PharmEasy',
      'Design a period and fertility tracking app like Flo Health',
    ]
  },
  {
    category: 'EDUCATION',
    examples: [
      'Build a live tutoring platform like Unacademy for competitive exams',
      'Design a skill-based learning platform like Coursera for India',
      'Create a coding education platform like Scaler for engineers',
      'Build a K-12 homework help app like Doubtnut',
    ]
  },
  {
    category: 'SOCIAL & COMMUNICATION',
    examples: [
      'Create a real-time team chat platform like Slack for Indian SMEs',
      'Build a short video platform like Instagram Reels for creators',
      'Design a professional networking platform like LinkedIn for India',
      'Create a community platform like Discord for gaming and creators',
    ]
  },
  {
    category: 'E-COMMERCE & RETAIL',
    examples: [
      'Design a fashion marketplace like Myntra with AR try-on feature',
      'Build a B2B wholesale platform like IndiaMART for manufacturers',
      'Create a reselling platform like Meesho for homemakers',
      'Design a luxury goods authentication and resale platform',
      'Build a hyperlocal marketplace connecting nearby buyers and sellers',
    ]
  },
  {
    category: 'TRANSPORT & LOGISTICS',
    examples: [
      'Build a ride-sharing platform like Uber for auto-rickshaws',
      'Design an intercity bus booking platform like redBus',
      'Create a last-mile delivery platform like Shadowfax for ecommerce',
      'Build a truck aggregation platform like BlackBuck for logistics',
    ]
  },
  {
    category: 'SAAS & ENTERPRISE',
    examples: [
      'Build an AI-powered CRM platform like Salesforce for Indian SMEs',
      'Design a project management tool like Jira for remote teams',
      'Create an HR and payroll management system like Darwinbox',
      'Build a customer support platform like Freshdesk with AI agents',
      'Design an inventory management system for retail chains',
    ]
  },
  {
    category: 'REAL ESTATE & HOME',
    examples: [
      'Build a property rental platform like NoBroker with AI matching',
      'Design a home services marketplace like Urban Company',
      'Create a co-living space management platform like Stanza Living',
    ]
  },
  {
    category: 'AI & DEVELOPER TOOLS',
    examples: [
      'Build an AI code review and quality platform for engineering teams',
      'Design a no-code app builder platform like Bubble for India',
      'Create an AI writing assistant for content creators like Jasper',
      'Build a data analytics platform like Mixpanel for Indian startups',
    ]
  },
]

const TABS = [
  { id: 'founder',      label: 'Founder',     num: '01', icon: Brain },
  { id: 'product',      label: 'Product',      num: '02', icon: Target },
  { id: 'architecture', label: 'Architecture', num: '03', icon: Layers },
  { id: 'database',     label: 'Database',     num: '04', icon: Database },
  { id: 'api',          label: 'API Design',   num: '05', icon: Code },
  { id: 'scaling',      label: 'Scaling',      num: '06', icon: TrendingUp },
  { id: 'security',     label: 'Security',     num: '07', icon: Shield },
  { id: 'devops',       label: 'DevOps',       num: '08', icon: Cloud },
  { id: 'finops',       label: 'FinOps',       num: '09', icon: DollarSign },
  { id: 'hiring',       label: 'Hiring',       num: '10', icon: Users },
  { id: 'diagrams',     label: 'Diagrams',     num: '11', icon: GitBranch },
  { id: 'verdict',      label: 'CTO Verdict',  num: '12', icon: Award },
]

const AGENT_STEPS = [
  { id: 1,  name: 'Founder Mindset',       desc: 'Analyzing business fundamentals...',   icon: Brain,      color: '#8B5CF6' },
  { id: 2,  name: 'Product Strategy',      desc: 'Defining user journeys & metrics...',  icon: Target,     color: '#3B82F6' },
  { id: 3,  name: 'System Architecture',   desc: 'Designing service topology...',        icon: Layers,     color: '#06B6D4' },
  { id: 4,  name: 'Data Modeling',         desc: 'Designing schema & relationships...',  icon: Database,   color: '#10B981' },
  { id: 5,  name: 'API Design',            desc: 'Generating REST endpoints...',         icon: Code,       color: '#22C55E' },
  { id: 6,  name: 'Scaling & Reliability', desc: 'Planning 0→100M user journey...',     icon: TrendingUp, color: '#EAB308' },
  { id: 7,  name: 'Security Review',       desc: 'Running threat model analysis...',     icon: Shield,     color: '#EF4444' },
  { id: 8,  name: 'DevOps Engineering',    desc: 'Designing CI/CD & observability...',   icon: Cloud,      color: '#F97316' },
  { id: 9,  name: 'FinOps Analysis',       desc: 'Calculating cost tiers & savings...',  icon: DollarSign, color: '#F59E0B' },
  { id: 10, name: 'Hiring Plan',           desc: 'Planning 3-year team roadmap...',      icon: Users,      color: '#EC4899' },
  { id: 11, name: 'Diagram Generation',    desc: 'Rendering architecture diagrams...',   icon: GitBranch,  color: '#6366F1' },
  { id: 12, name: 'CTO Verdict',           desc: 'Issuing final investment verdict...',  icon: Award,      color: '#F43F5E' },
]

// ── helpers ──────────────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-widest">{title}</h3>
      {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
    </div>
  )
}

function DataCard({ label, value }: { label: string; value: any }) {
  const display = value === null || value === undefined ? '—' : String(value)
  return (
    <div className="hud-panel rounded-lg p-4">
      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
      <p className="text-sm text-white font-medium">{display}</p>
    </div>
  )
}

function PriorityBadge({ p }: { p: string }) {
  const map: Record<string, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/30',
    high:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
    medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    low:      'bg-green-500/20 text-green-400 border-green-500/30',
    P0:       'bg-red-500/20 text-red-400 border-red-500/30',
    P1:       'bg-orange-500/20 text-orange-400 border-orange-500/30',
    P2:       'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    P3:       'bg-green-500/20 text-green-400 border-green-500/30',
    High:     'bg-orange-500/20 text-orange-400 border-orange-500/30',
    Medium:   'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    Low:      'bg-green-500/20 text-green-400 border-green-500/30',
  }
  const cls = map[p] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${cls} uppercase shrink-0`}>{p}</span>
}

function SafeList({ items }: { items: any }) {
  if (!Array.isArray(items) || items.length === 0) return <p className="text-xs text-gray-500">—</p>
  return (
    <ul className="space-y-1">
      {items.map((item: any, i: number) => (
        <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
          <span className="text-cyan-500 mt-0.5 shrink-0">›</span>
          <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
        </li>
      ))}
    </ul>
  )
}

function EmptyPhase() {
  return (
    <div className="flex items-center justify-center h-40 text-gray-600 text-sm">
      No data for this phase
    </div>
  )
}

// ── tab renderers ─────────────────────────────────────────────────────────────

function FounderTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  return (
    <div className="space-y-8">
      <div>
        <SectionHeader title="Startup Identity" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <DataCard label="One-line Pitch" value={d.startup_identity?.one_line_pitch} />
          <DataCard label="Why Now" value={d.startup_identity?.why_now} />
          <DataCard label="Problem Statement" value={d.startup_identity?.problem_statement} />
          <DataCard label="Unfair Advantage" value={d.startup_identity?.unfair_advantage} />
        </div>
      </div>
      <div>
        <SectionHeader title="Market Size" />
        <div className="grid grid-cols-3 gap-3">
          <DataCard label="TAM (Total)" value={d.market?.tam} />
          <DataCard label="SAM (Serviceable)" value={d.market?.sam} />
          <DataCard label="SOM (Obtainable)" value={d.market?.som} />
        </div>
      </div>
      <div>
        <SectionHeader title="Business Model" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <DataCard label="Primary Model" value={d.business_model?.primary_model} />
          <DataCard label="Pricing Strategy" value={d.business_model?.pricing_strategy} />
          <DataCard label="LTV:CAC Ratio" value={d.business_model?.unit_economics?.ltv_cac_ratio} />
        </div>
        <div className="hud-panel rounded-lg p-4">
          <SectionHeader title="Revenue Streams" />
          <SafeList items={d.business_model?.revenue_streams} />
        </div>
      </div>
      <div>
        <SectionHeader title="Revenue Milestones" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <DataCard label="First $100" value={d.revenue_milestones?.first_100_dollars} />
          <DataCard label="$10K/Month" value={d.revenue_milestones?.first_10k_monthly} />
          <DataCard label="$100K/Month" value={d.revenue_milestones?.first_100k_monthly} />
          <DataCard label="$1M ARR" value={d.revenue_milestones?.first_1m_arr} />
        </div>
      </div>
      <div>
        <SectionHeader title="MVP Definition" sub={`Target: ${d.mvp_definition?.mvp_timeline_weeks ?? '?'} weeks`} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="hud-panel rounded-lg p-4">
            <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Must-Have</p>
            <SafeList items={d.mvp_definition?.must_have_features} />
          </div>
          <div className="hud-panel rounded-lg p-4">
            <p className="text-xs text-yellow-400 uppercase tracking-wider mb-2">Should-Have</p>
            <SafeList items={d.mvp_definition?.should_have_features} />
          </div>
          <div className="hud-panel rounded-lg p-4">
            <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Do NOT Build</p>
            <SafeList items={d.mvp_definition?.must_NOT_build} />
          </div>
        </div>
      </div>
      {Array.isArray(d.market?.competitors) && d.market.competitors.length > 0 && (
        <div>
          <SectionHeader title="Competitor Weaknesses" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {d.market.competitors.map((c: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <p className="text-sm font-semibold text-white mb-1">{c.name}</p>
                <p className="text-xs text-gray-400">{c.weakness}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {d.customer?.primary_persona && (
        <div>
          <SectionHeader title="Customer Personas" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="hud-panel rounded-lg p-4">
              <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Primary — {d.customer.primary_persona.name}</p>
              <p className="text-xs text-gray-500 mb-2">{d.customer.primary_persona.age_range} · WTP: {d.customer.primary_persona.willingness_to_pay}</p>
              <SafeList items={d.customer.primary_persona.pain_points} />
            </div>
            {d.customer.secondary_persona && (
              <div className="hud-panel rounded-lg p-4">
                <p className="text-xs text-purple-400 uppercase tracking-wider mb-2">Secondary — {d.customer.secondary_persona.name}</p>
                <SafeList items={d.customer.secondary_persona.pain_points} />
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function ProductTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  return (
    <div className="space-y-8">
      {d.metrics?.north_star_metric && (
        <div className="hud-panel rounded-lg p-6 border border-cyan-500/20">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-2">North Star Metric</p>
          <p className="text-2xl font-bold text-white">{d.metrics.north_star_metric}</p>
        </div>
      )}
      <div>
        <SectionHeader title="User Journey (AARRR)" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
          {(['awareness','activation','retention','revenue','referral'] as const).map((stage) => (
            <div key={stage} className="hud-panel rounded-lg p-3">
              <p className="text-[10px] text-cyan-400 uppercase tracking-wider mb-1">{stage}</p>
              <p className="text-xs text-gray-300">{d.user_journey?.[stage] || '—'}</p>
            </div>
          ))}
        </div>
      </div>
      {Array.isArray(d.core_features) && (
        <div>
          <SectionHeader title="Core Features" />
          <div className="space-y-2">
            {d.core_features.map((f: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4 flex items-start gap-4">
                <div className="flex flex-col items-center gap-1 shrink-0 w-10">
                  <PriorityBadge p={f.priority} />
                  <span className="text-[10px] text-gray-500">{f.effort}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white mb-0.5">{f.feature}</p>
                  <p className="text-xs text-gray-400">{f.user_story}</p>
                </div>
                <span className="text-[10px] text-green-400 shrink-0">{f.impact}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {d.growth_strategy && (
        <div>
          <SectionHeader title="Growth Strategy" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            <DataCard label="Viral Loop" value={d.growth_strategy.viral_loop} />
            <DataCard label="Network Effects" value={d.growth_strategy.network_effects} />
          </div>
          <div className="hud-panel rounded-lg p-4">
            <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Acquisition Channels</p>
            <SafeList items={d.growth_strategy.acquisition_channels} />
          </div>
        </div>
      )}
      {Array.isArray(d.metrics?.primary_metrics) && (
        <div>
          <SectionHeader title="Primary Metrics" />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left text-xs text-gray-500 uppercase pb-2 pr-4">Metric</th>
                  <th className="text-left text-xs text-gray-500 uppercase pb-2 pr-4">Definition</th>
                  <th className="text-left text-xs text-gray-500 uppercase pb-2 pr-4">Month 3</th>
                  <th className="text-left text-xs text-gray-500 uppercase pb-2">Month 12</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {d.metrics.primary_metrics.map((m: any, i: number) => (
                  <tr key={i}>
                    <td className="py-2 pr-4 text-white font-medium">{m.metric}</td>
                    <td className="py-2 pr-4 text-gray-400 text-xs">{m.definition}</td>
                    <td className="py-2 pr-4 text-cyan-400 text-xs">{m.target_month_3}</td>
                    <td className="py-2 text-green-400 text-xs">{m.target_month_12}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {Array.isArray(d.product_risks) && (
        <div>
          <SectionHeader title="Product Risks" />
          <div className="space-y-2">
            {d.product_risks.map((r: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 mb-1">
                  <p className="text-sm text-white font-medium">{r.risk}</p>
                  <PriorityBadge p={r.likelihood} />
                </div>
                <p className="text-xs text-gray-400">{r.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ArchitectureTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  return (
    <div className="space-y-8">
      {d.architecture_style && (
        <div className="hud-panel rounded-lg p-5 border border-cyan-500/20">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-xs text-cyan-400 uppercase tracking-widest">Pattern</span>
            <span className="text-lg font-bold text-white">{d.architecture_style.pattern}</span>
          </div>
          <p className="text-sm text-gray-300 mb-2">{d.architecture_style.justification}</p>
          <p className="text-xs text-gray-500">Evolution path: {d.architecture_style.evolution_path}</p>
        </div>
      )}
      {Array.isArray(d.services) && (
        <div>
          <SectionHeader title="Services" sub={`${d.services.length} services`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {d.services.map((s: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-white">{s.name}</p>
                    <p className="text-xs text-cyan-400">{s.technology}{s.port ? ` · :${s.port}` : ''}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 bg-white/5 px-2 py-0.5 rounded">{s.type}</span>
                </div>
                <p className="text-xs text-gray-400 mb-2">{s.responsibility}</p>
                {s.why_separate && <p className="text-xs text-gray-500 border-t border-white/10 pt-2">{s.why_separate}</p>}
                <div className="flex items-center gap-3 mt-2 text-[10px]">
                  {s.estimated_rps && <span className="text-green-400">{s.estimated_rps} RPS</span>}
                  {s.scales_independently && <span className="text-blue-400">Scales independently</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(d.communication_patterns) && (
        <div>
          <SectionHeader title="Communication Patterns" />
          <div className="space-y-2">
            {d.communication_patterns.map((c: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-3 flex items-center gap-3 flex-wrap">
                <span className="text-sm text-cyan-300 font-medium shrink-0">{c.from}</span>
                <ChevronRight className="w-3 h-3 text-gray-600 shrink-0" />
                <span className="text-sm text-white shrink-0">{c.to}</span>
                <span className="ml-auto text-[10px] px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20 shrink-0">{c.pattern}</span>
                <p className="text-xs text-gray-500 hidden md:block">{c.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(d.technical_decisions) && (
        <div>
          <SectionHeader title="Technical Decisions (ADRs)" />
          <div className="space-y-3">
            {d.technical_decisions.map((td: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-white">{td.decision}</p>
                  {td.confidence !== undefined && (
                    <div className="flex items-center gap-1 shrink-0">
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-500 rounded-full" style={{ width: `${td.confidence}%` }} />
                      </div>
                      <span className="text-[10px] text-gray-500">{td.confidence}%</span>
                    </div>
                  )}
                </div>
                <p className="text-xs text-cyan-400 mb-1">Chosen: <span className="text-white">{td.chosen}</span></p>
                <p className="text-xs text-gray-400 mb-2">{td.reasoning}</p>
                {Array.isArray(td.options_considered) && (
                  <p className="text-[10px] text-gray-600">Also considered: {td.options_considered.join(', ')}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(d.third_party_integrations) && (
        <div>
          <SectionHeader title="Third-party Integrations" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {d.third_party_integrations.map((t: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <p className="text-sm font-semibold text-white mb-1">{t.service}</p>
                <p className="text-xs text-gray-400 mb-1">{t.purpose}</p>
                {t.fallback && <p className="text-[10px] text-yellow-400">Fallback: {t.fallback}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DatabaseTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  return (
    <div className="space-y-8">
      {Array.isArray(d.tables) && (
        <div>
          <SectionHeader title="Tables" sub={`${d.tables.length} tables`} />
          <div className="space-y-4">
            {d.tables.map((t: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-5">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  {Array.isArray(t.gdpr_fields) && t.gdpr_fields.length > 0 && (
                    <span className="text-[10px] text-yellow-400 border border-yellow-500/30 px-2 py-0.5 rounded">GDPR sensitive</span>
                  )}
                </div>
                {t.purpose && <p className="text-xs text-gray-400 mb-3">{t.purpose}</p>}
                {Array.isArray(t.columns) && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b border-white/10">
                          <th className="text-left text-gray-500 uppercase pb-1 pr-3">Column</th>
                          <th className="text-left text-gray-500 uppercase pb-1 pr-3">Type</th>
                          <th className="text-left text-gray-500 uppercase pb-1">Notes</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {t.columns.map((col: any, ci: number) => (
                          <tr key={ci}>
                            <td className="py-1.5 pr-3 text-cyan-300 font-mono">{typeof col === 'string' ? col : col.name}</td>
                            <td className="py-1.5 pr-3 text-gray-400">{col.type || ''}</td>
                            <td className="py-1.5 text-gray-500">{col.notes || col.constraints || ''}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(d.relationships) && (
        <div>
          <SectionHeader title="Relationships" />
          <div className="space-y-2">
            {d.relationships.map((r: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-3 flex items-center gap-3 flex-wrap">
                <span className="text-cyan-300 font-mono text-sm">{r.from || r.table_a}</span>
                <span className="text-gray-500 text-xs">{r.type || r.relationship}</span>
                <span className="text-white font-mono text-sm">{r.to || r.table_b}</span>
                {r.description && <span className="text-gray-500 text-xs ml-auto">{r.description}</span>}
              </div>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(d.indexes) && d.indexes.length > 0 && (
        <div>
          <SectionHeader title="Indexes" />
          <div className="hud-panel rounded-lg p-4">
            <SafeList items={d.indexes.map((idx: any) => typeof idx === 'string' ? idx : `${idx.table}.${Array.isArray(idx.columns) ? idx.columns.join(', ') : idx.columns}`)} />
          </div>
        </div>
      )}
    </div>
  )
}

function APITab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  const endpoints = d.endpoints || d.api_endpoints || []
  return (
    <div className="space-y-8">
      {(d.strategy || d.api_strategy) && (
        <div className="hud-panel rounded-lg p-5 border border-cyan-500/20">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-2">API Strategy</p>
          <p className="text-sm text-gray-300">{d.strategy || d.api_strategy}</p>
        </div>
      )}
      {Array.isArray(endpoints) && endpoints.length > 0 && (
        <div>
          <SectionHeader title="Endpoints" sub={`${endpoints.length} endpoints`} />
          <div className="space-y-2">
            {endpoints.map((ep: any, i: number) => {
              const mc: Record<string, string> = {
                GET:    'text-green-400 border-green-500/30 bg-green-500/10',
                POST:   'text-blue-400 border-blue-500/30 bg-blue-500/10',
                PUT:    'text-yellow-400 border-yellow-500/30 bg-yellow-500/10',
                PATCH:  'text-orange-400 border-orange-500/30 bg-orange-500/10',
                DELETE: 'text-red-400 border-red-500/30 bg-red-500/10',
              }
              const cls = mc[ep.method?.toUpperCase()] || 'text-gray-400 border-gray-500/30 bg-gray-500/10'
              return (
                <div key={i} className="hud-panel rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded border ${cls} font-mono`}>{ep.method}</span>
                    <span className="font-mono text-sm text-cyan-300">{ep.path}</span>
                    {ep.auth_required && <Lock className="w-3 h-3 text-yellow-400" />}
                  </div>
                  <p className="text-xs text-gray-400">{ep.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
      {d.error_handling && (
        <div>
          <SectionHeader title="Error Handling" />
          <div className="hud-panel rounded-lg p-4">
            <SafeList items={Array.isArray(d.error_handling) ? d.error_handling : Object.entries(d.error_handling as Record<string,string>).map(([k, v]) => `${k}: ${v}`)} />
          </div>
        </div>
      )}
    </div>
  )
}

function ScalingTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  return (
    <div className="space-y-8">
      {d.performance_targets && (
        <div>
          <SectionHeader title="Performance Targets" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DataCard label="API p99" value={d.performance_targets.api_p99_latency_ms ? `${d.performance_targets.api_p99_latency_ms}ms` : '—'} />
            <DataCard label="API p95" value={d.performance_targets.api_p95_latency_ms ? `${d.performance_targets.api_p95_latency_ms}ms` : '—'} />
            <DataCard label="Page Load" value={d.performance_targets.page_load_time_ms ? `${d.performance_targets.page_load_time_ms}ms` : '—'} />
            <DataCard label="DB Query p99" value={d.performance_targets.database_query_p99_ms ? `${d.performance_targets.database_query_p99_ms}ms` : '—'} />
          </div>
        </div>
      )}
      {Array.isArray(d.scaling_stages) && (
        <div>
          <SectionHeader title="Scaling Roadmap" sub="0 → 100M users" />
          <div className="space-y-3">
            {d.scaling_stages.map((s: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <div className="flex items-start justify-between mb-2 flex-wrap gap-2">
                  <div>
                    <p className="text-sm font-semibold text-white">Stage {s.stage}: {s.users}</p>
                    {s.monthly_active_users > 0 && <p className="text-xs text-gray-500">{s.monthly_active_users.toLocaleString()} MAU</p>}
                  </div>
                  {s.estimated_monthly_cost_usd > 0 && (
                    <span className="text-xs text-green-400">${s.estimated_monthly_cost_usd.toLocaleString()}/mo</span>
                  )}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {s.infrastructure && <div><span className="text-gray-500">Infra: </span><span className="text-gray-300">{s.infrastructure}</span></div>}
                  {s.database && <div><span className="text-gray-500">DB: </span><span className="text-gray-300">{s.database}</span></div>}
                  {s.caching && <div><span className="text-gray-500">Cache: </span><span className="text-gray-300">{s.caching}</span></div>}
                  {s.cdn && <div><span className="text-gray-500">CDN: </span><span className="text-gray-300">{s.cdn}</span></div>}
                </div>
                {s.bottleneck && <p className="text-xs text-yellow-400 mt-2">Bottleneck: {s.bottleneck}</p>}
                {s.migration_trigger && <p className="text-xs text-gray-500 mt-1">Migrate when: {s.migration_trigger}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
      {d.reliability && (
        <div>
          <SectionHeader title="Reliability" />
          <div className="grid grid-cols-3 gap-3 mb-4">
            <DataCard label="RTO" value={d.reliability.rto} />
            <DataCard label="RPO" value={d.reliability.rpo} />
            <DataCard label="Target Uptime" value={d.reliability.target_uptime} />
          </div>
          {Array.isArray(d.reliability.failure_scenarios) && (
            <div className="space-y-2">
              {d.reliability.failure_scenarios.map((f: any, i: number) => (
                <div key={i} className="hud-panel rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-sm font-semibold text-white">{f.scenario}</p>
                    <PriorityBadge p={f.probability} />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div><span className="text-gray-500">Detect: </span><span className="text-gray-300">{f.detection}</span></div>
                    <div><span className="text-gray-500">Recover: </span><span className="text-gray-300">{f.recovery}</span></div>
                    <div><span className="text-gray-500">Prevent: </span><span className="text-gray-300">{f.prevention}</span></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function SecurityTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  const cats = d.checklist ? Object.keys(d.checklist) : []
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="hud-panel rounded-lg p-5 border border-red-500/20">
          <p className="text-xs text-red-400 uppercase tracking-widest mb-2">Risk Score</p>
          <p className="text-4xl font-bold text-white">{d.risk_score || '—'}</p>
        </div>
        <div className="hud-panel rounded-lg p-5 md:col-span-2">
          <p className="text-xs text-red-400 uppercase tracking-widest mb-2">Top 3 Risks</p>
          <SafeList items={d.top_3_risks} />
        </div>
      </div>
      {d.threat_model && (
        <div>
          <SectionHeader title="Threat Model" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="hud-panel rounded-lg p-4">
              <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Attack Surfaces</p>
              <SafeList items={d.threat_model.attack_surfaces} />
            </div>
            <div className="hud-panel rounded-lg p-4">
              <p className="text-xs text-yellow-400 uppercase tracking-wider mb-2">Valuable Assets</p>
              <SafeList items={d.threat_model.most_valuable_assets} />
            </div>
            <div className="hud-panel rounded-lg p-4">
              <p className="text-xs text-orange-400 uppercase tracking-wider mb-2">Likely Attackers</p>
              <SafeList items={d.threat_model.likely_attackers} />
            </div>
          </div>
        </div>
      )}
      {Array.isArray(d.owasp_coverage) && (
        <div>
          <SectionHeader title="OWASP Coverage" />
          <div className="space-y-2">
            {d.owasp_coverage.map((o: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-white">{o.threat}</p>
                  <PriorityBadge p={o.risk_level} />
                </div>
                <p className="text-xs text-gray-400">{o.mitigation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {cats.length > 0 && (
        <div>
          <SectionHeader title="Security Checklist" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cats.map((cat) => (
              <div key={cat} className="hud-panel rounded-lg p-4">
                <p className="text-xs text-cyan-400 uppercase tracking-wider mb-3">{cat.replace(/_/g, ' ')}</p>
                <div className="space-y-2">
                  {(d.checklist[cat] || []).map((item: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle className="w-3.5 h-3.5 text-green-400 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-300">{item.item}</p>
                        {item.implementation && <p className="text-[10px] text-gray-500">{item.implementation}</p>}
                      </div>
                      <PriorityBadge p={item.priority} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(d.security_roadmap) && (
        <div>
          <SectionHeader title="Security Roadmap" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {d.security_roadmap.map((phase: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">{phase.phase}</p>
                <SafeList items={phase.actions} />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DevOpsTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  return (
    <div className="space-y-8">
      {d.repository && (
        <div>
          <SectionHeader title="Repository" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DataCard label="Strategy" value={d.repository.strategy} />
            <DataCard label="Branching" value={d.repository.branching_model} />
            <DataCard label="Code Review" value={d.repository.code_review_policy} />
            <div className="hud-panel rounded-lg p-4">
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Branch Protection</p>
              <SafeList items={d.repository.branch_protection} />
            </div>
          </div>
        </div>
      )}
      {d.ci_cd && (
        <div>
          <SectionHeader title="CI/CD" sub={`${d.ci_cd.platform} · ${d.ci_cd.deployment_strategy} · ${d.ci_cd.deployment_frequency}`} />
          {Array.isArray(d.ci_cd.pipeline_stages) && (
            <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
              {d.ci_cd.pipeline_stages.map((stage: any, i: number) => (
                <div key={i} className="hud-panel rounded-lg p-4 flex-1 min-w-[150px] shrink-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-cyan-400">{stage.stage}</p>
                    <span className="text-[10px] text-gray-500">{stage.estimated_duration_mins}m</span>
                  </div>
                  <SafeList items={stage.actions} />
                </div>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <DataCard label="Deployment" value={d.ci_cd.deployment_strategy} />
            <DataCard label="Rollback" value={d.ci_cd.rollback_strategy} />
          </div>
        </div>
      )}
      {d.infrastructure && (
        <div>
          <SectionHeader title="Infrastructure" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <DataCard label="Cloud" value={d.infrastructure.cloud_provider} />
            <DataCard label="Regions" value={Array.isArray(d.infrastructure.regions) ? d.infrastructure.regions.join(', ') : d.infrastructure.regions} />
            <DataCard label="IaC" value={d.infrastructure.iac_tool} />
            <DataCard label="Containers" value={d.infrastructure.container_strategy} />
          </div>
        </div>
      )}
      {d.observability && (
        <div>
          <SectionHeader title="Observability Stack" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {d.observability.logging && (
              <div className="hud-panel rounded-lg p-4">
                <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Logging — {d.observability.logging.tool}</p>
                <p className="text-xs text-gray-500 mb-2">Retention: {d.observability.logging.retention_days} days</p>
                <SafeList items={d.observability.logging.log_levels} />
              </div>
            )}
            {d.observability.metrics && (
              <div className="hud-panel rounded-lg p-4">
                <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Metrics — {d.observability.metrics.tool}</p>
                <SafeList items={d.observability.metrics.key_metrics} />
              </div>
            )}
            {d.observability.alerting && (
              <div className="hud-panel rounded-lg p-4">
                <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Alerting — {d.observability.alerting.tool}</p>
                <p className="text-xs text-gray-500 mb-2">{d.observability.alerting.on_call_strategy}</p>
                <SafeList items={d.observability.alerting.critical_alerts} />
              </div>
            )}
          </div>
        </div>
      )}
      {Array.isArray(d.environments) && (
        <div>
          <SectionHeader title="Environments" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {d.environments.map((env: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <p className="text-sm font-semibold text-white mb-1">{env.name}</p>
                <p className="text-xs text-gray-400 mb-2">{env.purpose}</p>
                <p className="text-xs text-gray-500">Infra: {env.infrastructure}</p>
                <p className="text-xs text-gray-500">Data: {env.data}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function FinOpsTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  const tiers = ['mvp', 'growth', 'scale'] as const
  const tierCls: Record<string, string> = {
    mvp:    'border-green-500/30',
    growth: 'border-blue-500/30',
    scale:  'border-purple-500/30',
  }
  const tierLabel: Record<string, string> = {
    mvp:    'text-green-400',
    growth: 'text-blue-400',
    scale:  'text-purple-400',
  }
  return (
    <div className="space-y-8">
      {d.cost_philosophy && (
        <div className="hud-panel rounded-lg p-5 border border-cyan-500/20">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-2">Cost Philosophy</p>
          <p className="text-sm text-gray-300">{d.cost_philosophy}</p>
        </div>
      )}
      {d.tiers && (
        <div>
          <SectionHeader title="Cost Tiers" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {tiers.map((tier) => {
              const t = d.tiers[tier]
              if (!t) return null
              return (
                <div key={tier} className={`hud-panel rounded-lg p-5 border ${tierCls[tier]}`}>
                  <div className="flex items-center justify-between mb-3">
                    <p className={`text-xs font-bold uppercase tracking-widest ${tierLabel[tier]}`}>{tier}</p>
                    <p className="text-xl font-bold text-white">${t.monthly_usd}<span className="text-xs text-gray-500">/mo</span></p>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">{t.description}</p>
                  {Array.isArray(t.services) && (
                    <div className="space-y-1">
                      {t.services.map((s: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">{s.name}</span>
                          <span className="text-gray-300">${s.cost_usd ?? 0}</span>
                        </div>
                      ))}
                    </div>
                  )}
                  {tier === 'mvp' && Array.isArray(t.free_tier_used) && t.free_tier_used.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-white/10">
                      <p className="text-[10px] text-green-400 uppercase tracking-wider mb-1">Free Tier</p>
                      {t.free_tier_used.map((f: string, i: number) => <p key={i} className="text-[10px] text-gray-500">{f}</p>)}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
      {d.cost_per_user && (
        <div>
          <SectionHeader title="Cost Per User" />
          <div className="grid grid-cols-3 gap-3">
            <DataCard label="1K Users" value={d.cost_per_user.at_1k_users} />
            <DataCard label="10K Users" value={d.cost_per_user.at_10k_users} />
            <DataCard label="100K Users" value={d.cost_per_user.at_100k_users} />
          </div>
        </div>
      )}
      {d.revenue_vs_infra && (
        <div className="grid grid-cols-2 gap-3">
          <DataCard label="Break-even Users" value={d.revenue_vs_infra.break_even_users} />
          <DataCard label="Target Infra % Revenue" value={d.revenue_vs_infra.target_infra_as_percent_revenue} />
        </div>
      )}
      {Array.isArray(d.optimization_opportunities) && d.optimization_opportunities.length > 0 && (
        <div>
          <SectionHeader title="Optimization Opportunities" />
          <div className="space-y-2">
            {d.optimization_opportunities.map((o: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-sm font-semibold text-white">{o.opportunity}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-400">-{o.savings_percent}%</span>
                    <PriorityBadge p={o.effort} />
                  </div>
                </div>
                <div className="flex gap-4 text-xs mb-1">
                  <span className="text-red-400">Before: ${o.current_cost}/mo</span>
                  <span className="text-green-400">After: ${o.optimized_cost}/mo</span>
                </div>
                <p className="text-xs text-gray-500">{o.implementation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(d.cost_saving_tips) && (
        <div>
          <SectionHeader title="Cost Saving Tips" />
          <div className="hud-panel rounded-lg p-4">
            <SafeList items={d.cost_saving_tips} />
          </div>
        </div>
      )}
    </div>
  )
}

function HiringTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  return (
    <div className="space-y-8">
      {d.hiring_philosophy && (
        <div className="hud-panel rounded-lg p-5 border border-cyan-500/20">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-2">Hiring Philosophy</p>
          <p className="text-sm text-gray-300">{d.hiring_philosophy}</p>
        </div>
      )}
      {d.year_1 && (
        <div>
          <SectionHeader title="Year 1" sub={`Team: ${d.year_1.team_size} · Burn: ${d.year_1.total_salary_burn_usd ? `$${Number(d.year_1.total_salary_burn_usd).toLocaleString()}/yr` : '—'}`} />
          <div className="space-y-2 mb-3">
            {(d.year_1.hires || []).map((h: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <div className="flex items-start justify-between mb-1">
                  <p className="text-sm font-semibold text-white">{h.role}</p>
                  <span className="text-xs text-cyan-400 shrink-0 ml-2">{h.salary_range_usd}</span>
                </div>
                <p className="text-xs text-gray-500 mb-1">When: {h.when_to_hire}</p>
                <p className="text-xs text-gray-400 mb-2">{h.why_this_role_now}</p>
                {Array.isArray(h.skills_required) && (
                  <div className="flex flex-wrap gap-1">
                    {h.skills_required.map((s: string, si: number) => (
                      <span key={si} className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded border border-cyan-500/20">{s}</span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      {d.year_2 && (
        <div>
          <SectionHeader title="Year 2" sub={`Team: ${d.year_2.team_size}`} />
          <div className="space-y-2 mb-3">
            {(d.year_2.new_hires || []).map((h: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-3 flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white font-medium">{h.role}</p>
                  <p className="text-xs text-gray-500">{h.trigger}</p>
                </div>
                <span className="text-xs text-cyan-400 shrink-0">{h.salary_range_usd}</span>
              </div>
            ))}
          </div>
          {Array.isArray(d.year_2.teams_formed) && (
            <div className="hud-panel rounded-lg p-4">
              <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Teams Formed</p>
              <SafeList items={d.year_2.teams_formed} />
            </div>
          )}
        </div>
      )}
      {d.year_3 && (
        <div>
          <SectionHeader title="Year 3" sub={`Team: ${d.year_3.team_size}`} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {Array.isArray(d.year_3.specialized_teams) && (
              <div className="hud-panel rounded-lg p-4">
                <p className="text-xs text-cyan-400 uppercase tracking-wider mb-2">Specialized Teams</p>
                <SafeList items={d.year_3.specialized_teams} />
              </div>
            )}
            {Array.isArray(d.year_3.leadership_needs) && (
              <div className="hud-panel rounded-lg p-4">
                <p className="text-xs text-purple-400 uppercase tracking-wider mb-2">Leadership Needs</p>
                <SafeList items={d.year_3.leadership_needs} />
              </div>
            )}
          </div>
        </div>
      )}
      {Array.isArray(d.contractor_vs_fulltime) && (
        <div>
          <SectionHeader title="Contractor vs Full-time" />
          <div className="space-y-2">
            {d.contractor_vs_fulltime.map((c: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4 flex items-start gap-4">
                <span className={`text-xs font-semibold px-2 py-1 rounded border shrink-0 ${c.recommendation === 'contractor' ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10' : 'text-blue-400 border-blue-500/30 bg-blue-500/10'}`}>
                  {c.recommendation}
                </span>
                <div>
                  <p className="text-sm text-white font-medium">{c.function}</p>
                  <p className="text-xs text-gray-400">{c.reasoning}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {Array.isArray(d.avoid_early_hiring) && (
        <div>
          <SectionHeader title="Avoid Hiring Early" />
          <div className="hud-panel rounded-lg p-4">
            <SafeList items={d.avoid_early_hiring} />
          </div>
        </div>
      )}
    </div>
  )
}

function DiagramsTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  return (
    <div className="space-y-8">
      {d.architecture && (
        <div>
          <SectionHeader title="System Architecture" />
          <div className="hud-panel rounded-lg p-4"><MermaidDiagram diagram={d.architecture} title="System Architecture" /></div>
        </div>
      )}
      {d.er_diagram && (
        <div>
          <SectionHeader title="Entity Relationship Diagram" />
          <div className="hud-panel rounded-lg p-4"><MermaidDiagram diagram={d.er_diagram} title="ER Diagram" /></div>
        </div>
      )}
      {d.sequence && (
        <div>
          <SectionHeader title="Sequence Diagram" />
          <div className="hud-panel rounded-lg p-4"><MermaidDiagram diagram={d.sequence} title="Sequence Diagram" /></div>
        </div>
      )}
    </div>
  )
}

function VerdictTab({ d }: { d: any }) {
  if (!d) return <EmptyPhase />
  const ir = d.investor_review
  const verdictCls =
    ir?.verdict?.includes('NOT') ? 'text-red-400' :
    ir?.verdict?.includes('INVEST') ? 'text-green-400' :
    'text-yellow-400'
  return (
    <div className="space-y-8">
      {ir && (
        <div className="hud-panel rounded-lg p-6 border border-cyan-500/20">
          <div className="flex items-start justify-between mb-4 flex-wrap gap-4">
            <div>
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Investor Verdict</p>
              <p className={`text-2xl font-bold ${verdictCls}`}>{ir.verdict?.replace(/_/g, ' ')}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 uppercase tracking-widest mb-1">Investability Score</p>
              <p className="text-4xl font-bold text-white">{ir.investability_score}<span className="text-lg text-gray-500">/100</span></p>
            </div>
          </div>
          <p className="text-sm text-gray-300 mb-4">{ir.reasoning}</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="hud-panel rounded-lg p-3">
              <p className="text-xs text-blue-400 uppercase tracking-wider mb-1">Technical Moat</p>
              <p className="text-xs text-gray-300">{ir.technical_moat}</p>
            </div>
            <div className="hud-panel rounded-lg p-3">
              <p className="text-xs text-green-400 uppercase tracking-wider mb-1">Biggest Strength</p>
              <p className="text-xs text-gray-300">{ir.biggest_technical_strength}</p>
            </div>
            <div className="hud-panel rounded-lg p-3">
              <p className="text-xs text-red-400 uppercase tracking-wider mb-1">Biggest Risk</p>
              <p className="text-xs text-gray-300">{ir.biggest_technical_risk}</p>
            </div>
          </div>
          {Array.isArray(ir.conditions) && ir.conditions.length > 0 && (
            <div>
              <p className="text-xs text-yellow-400 uppercase tracking-wider mb-2">Conditions</p>
              <SafeList items={ir.conditions} />
            </div>
          )}
        </div>
      )}
      {d.final_cto_statement && (
        <div className="hud-panel rounded-lg p-6 border border-cyan-500/30">
          <p className="text-xs text-cyan-400 uppercase tracking-widest mb-3">Final CTO Statement</p>
          <p className="text-sm text-gray-200 leading-relaxed italic">"{d.final_cto_statement}"</p>
        </div>
      )}
      {d.devils_advocate && (
        <div>
          <SectionHeader title="Devil's Advocate" sub="Where this could fail" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
            {Array.isArray(d.devils_advocate.overengineered_components) && (
              <div className="hud-panel rounded-lg p-4">
                <p className="text-xs text-orange-400 uppercase tracking-wider mb-3">Over-engineered</p>
                <div className="space-y-3">
                  {d.devils_advocate.overengineered_components.map((c: any, i: number) => (
                    <div key={i}>
                      <p className="text-sm text-white font-medium">{c.component}</p>
                      <p className="text-xs text-gray-400 mb-0.5">{c.issue}</p>
                      <p className="text-xs text-green-400">→ {c.simpler_alternative}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {Array.isArray(d.devils_advocate.underengineered_components) && (
              <div className="hud-panel rounded-lg p-4">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-3">Under-engineered</p>
                <div className="space-y-3">
                  {d.devils_advocate.underengineered_components.map((c: any, i: number) => (
                    <div key={i}>
                      <p className="text-sm text-white font-medium">{c.component}</p>
                      <p className="text-xs text-gray-400 mb-0.5">{c.issue}</p>
                      <p className="text-xs text-cyan-400">→ {c.recommendation}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
            {d.devils_advocate.first_bottleneck && <DataCard label="First Bottleneck" value={d.devils_advocate.first_bottleneck} />}
            {d.devils_advocate.most_dangerous_decision && <DataCard label="Most Dangerous Decision" value={d.devils_advocate.most_dangerous_decision} />}
          </div>
          {Array.isArray(d.devils_advocate.wrong_assumptions) && (
            <div className="hud-panel rounded-lg p-4">
              <p className="text-xs text-red-400 uppercase tracking-wider mb-2">Wrong Assumptions</p>
              <SafeList items={d.devils_advocate.wrong_assumptions} />
            </div>
          )}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.isArray(d.what_netflix_would_do_differently) && (
          <div className="hud-panel rounded-lg p-4">
            <p className="text-xs text-red-400 uppercase tracking-wider mb-2">What Netflix Would Do Differently</p>
            <SafeList items={d.what_netflix_would_do_differently} />
          </div>
        )}
        {Array.isArray(d.what_stripe_would_do_differently) && (
          <div className="hud-panel rounded-lg p-4">
            <p className="text-xs text-blue-400 uppercase tracking-wider mb-2">What Stripe Would Do Differently</p>
            <SafeList items={d.what_stripe_would_do_differently} />
          </div>
        )}
      </div>
      {Array.isArray(d.confidence_scores) && (
        <div>
          <SectionHeader title="Confidence Scores" />
          <div className="space-y-2">
            {d.confidence_scores.map((cs: any, i: number) => (
              <div key={i} className="hud-panel rounded-lg p-4">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm text-white">{cs.recommendation}</p>
                  <span className="text-sm font-bold text-cyan-400">{cs.confidence}%</span>
                </div>
                <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                  <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full" style={{ width: `${cs.confidence}%` }} />
                </div>
                <p className="text-xs text-gray-500">{cs.reasoning}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {(d.if_only_10k_left || d.if_funding_doubled) && (
        <div>
          <SectionHeader title="Scenario Analysis" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {d.if_only_10k_left && (
              <div className="hud-panel rounded-lg p-4 border border-red-500/20">
                <p className="text-xs text-red-400 uppercase tracking-wider mb-2">If Only $10K Left</p>
                <p className="text-sm text-gray-300">{d.if_only_10k_left}</p>
              </div>
            )}
            {d.if_funding_doubled && (
              <div className="hud-panel rounded-lg p-4 border border-green-500/20">
                <p className="text-xs text-green-400 uppercase tracking-wider mb-2">If Funding Doubled</p>
                <p className="text-sm text-gray-300">{d.if_funding_doubled}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── main component ────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const router = useRouter()
  const [problem, setProblem] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)
  const [activeTab, setActiveTab] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [logs, setLogs] = useState<string[]>([])
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [elapsedTime, setElapsedTime] = useState(0)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const timerRefs = useRef<NodeJS.Timeout[]>([])
  const logsRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (!token) { router.push('/auth/login'); return }
    const u = localStorage.getItem('user')
    if (u) { try { setUser(JSON.parse(u)) } catch {} }
  }, [router])

  useEffect(() => {
    if (loading) {
      setElapsedTime(0)
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1)
      }, 1000)
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [loading])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'TEXTAREA' || tag === 'INPUT') return

      if (e.key >= '1' && e.key <= '9') {
        const tabIndex = parseInt(e.key) - 1
        if (result && tabIndex < 12) { setActiveTab(tabIndex); e.preventDefault() }
      }
      if (e.key === '0') {
        if (result) { setActiveTab(11); e.preventDefault() }
      }
      if (e.key === 'g' || e.key === 'G') {
        if (!loading && problem.trim().length >= 10) { handleGenerate(); e.preventDefault() }
      }
      if (e.key === 'p' || e.key === 'P') {
        if (result) { handleDownloadPDF(); e.preventDefault() }
      }
      if (e.key === 'v' || e.key === 'V') {
        setVoiceEnabled(prev => !prev); e.preventDefault()
      }
      if (e.key === '?' || e.key === '/') {
        setShowShortcuts(prev => !prev); e.preventDefault()
      }
      if (e.key === 'Escape') {
        setShowShortcuts(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [result, loading, problem])

  const startAgentSimulation = () => {
    timerRefs.current.forEach(t => clearTimeout(t))
    timerRefs.current = []
    setCompletedSteps([])
    setLogs(['▸ Booting CTO Intelligence System...', '▸ Loading 12 specialized agents...'])
    setCurrentStep(1)
    AGENT_STEPS.forEach((step, i) => {
      const startT = setTimeout(() => {
        setLogs(prev => [...prev, `▸ [${String(step.id).padStart(2,'0')}] ${step.name} — ${step.desc}`])
        setTimeout(() => {
          if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight
        }, 50)
      }, i * 18000)
      timerRefs.current.push(startT)
      const doneT = setTimeout(() => {
        setCurrentStep(step.id < AGENT_STEPS.length ? step.id + 1 : step.id)
        setCompletedSteps(prev => [...prev, step.id])
        setLogs(prev => [...prev, `✓ [${String(step.id).padStart(2,'0')}] ${step.name} complete`])
        setTimeout(() => {
          if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight
        }, 50)
      }, (i + 1) * 18000)
      timerRefs.current.push(doneT)
    })
  }

  const stopSimulation = () => {
    timerRefs.current.forEach(t => clearTimeout(t))
    timerRefs.current = []
    setLogs([])
  }

  const handleGenerate = async (forceRegenerate = false) => {
    if (!problem.trim() || problem.trim().length < 10) {
      setError('Please describe your startup idea (at least 10 characters)')
      return
    }
    setError('')
    setResult(null)
    setLoading(true)
    setActiveTab(0)
    startAgentSimulation()
    try {
      const token = localStorage.getItem('token')
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ problem: problem.trim(), force_regenerate: forceRegenerate }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      stopSimulation()
      setCurrentStep(0)
      setCompletedSteps(AGENT_STEPS.map(s => s.id))
      setResult(data)
      if (voiceEnabled) {
        setTimeout(() => speakText(
          `Blueprint generation complete. Project: ${data.projectName}. All 12 phases analyzed successfully. Your technical blueprint is ready, sir.`
        ), 500)
      }
    } catch (err: any) {
      stopSimulation()
      setCurrentStep(0)
      setCompletedSteps([])
      setError(err.message || 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!result?.id) return
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/generate/${result.id}/pdf`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) { setError('PDF download failed'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${result.projectName || 'CTO-Blueprint'}.pdf`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/auth/login')
  }

  function formatTime(seconds: number): string {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
  }

  function speakText(text: string) {
    if (!voiceEnabled || !text) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.95
    utterance.pitch = 0.85
    utterance.volume = 0.9
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(v =>
      v.name.includes('Daniel') ||
      v.name.includes('Google UK English Male') ||
      v.name.includes('Microsoft David') ||
      v.name.includes('Alex') ||
      v.lang === 'en-GB'
    )
    if (preferred) utterance.voice = preferred
    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)
    window.speechSynthesis.speak(utterance)
  }

  function stopSpeaking() {
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  function getTabSummary(tabIndex: number, data: any): string {
    if (!data) return ''
    const r = data.result
    switch (tabIndex) {
      case 0:
        return `Founder analysis complete. ${r?.founder?.startup_identity?.one_line_pitch || ''}. The primary customer is ${r?.founder?.customer?.primary_persona?.name || 'identified'}. Business model: ${r?.founder?.business_model?.primary_model || 'defined'}.`
      case 1:
        return `Product strategy ready. North star metric: ${r?.product?.metrics?.north_star_metric || 'defined'}. ${r?.product?.core_features?.length || 0} core features identified.`
      case 2:
        return `System architecture designed using ${r?.architecture?.architecture_style?.pattern || 'microservices'}. ${r?.architecture?.services?.length || 0} services created. ${r?.architecture?.architecture_style?.justification || ''}`
      case 3:
        return `Database schema ready. ${r?.database?.tables?.length || 0} tables designed. Primary database: ${r?.database?.database_strategy?.primary_database || 'PostgreSQL'}. Normalization: ${r?.database?.normalization || '3NF'}.`
      case 4:
        return `API design complete. ${r?.api?.endpoints?.length || 0} endpoints defined. Authentication strategy: ${r?.api?.api_strategy?.authentication || 'JWT'}. Base URL: ${r?.api?.api_strategy?.base_url || '/api/v1'}.`
      case 5:
        return `Scaling roadmap built across ${r?.scaling?.scaling_stages?.length || 6} stages. Target uptime: ${r?.scaling?.reliability?.target_uptime || '99.9 percent'}. RTO: ${r?.scaling?.reliability?.rto || 'defined'}.`
      case 6:
        return `Security audit complete. Risk score: ${r?.security?.risk_score || 'Medium'}. Top risk: ${r?.security?.top_3_risks?.[0] || 'identified'}. Compliance requirements noted.`
      case 7:
        return `DevOps pipeline designed. Platform: ${r?.devops?.ci_cd?.platform || 'GitHub Actions'}. Deployment strategy: ${r?.devops?.ci_cd?.deployment_strategy || 'blue-green'}. Observability stack configured.`
      case 8:
        return `Cost analysis complete. MVP monthly cost: $${r?.finops?.tiers?.mvp?.monthly_usd || 0}. Break-even users: ${r?.finops?.revenue_vs_infra?.break_even_users || 'calculated'}. ${r?.finops?.optimization_opportunities?.length || 0} optimization opportunities found.`
      case 9:
        return `Hiring plan ready for 3 years. Year one team size: ${r?.hiring?.year_1?.team_size || 0} people. Philosophy: ${r?.hiring?.hiring_philosophy || 'generalists first'}.`
      case 10:
        return `Architecture and entity diagrams generated. 3 Mermaid diagrams ready for visualization.`
      case 11:
        return `CTO verdict delivered. Investability score: ${r?.verdict?.investor_review?.investability_score || 0} out of 100. Recommendation: ${(r?.verdict?.investor_review?.verdict || 'pending').replace(/_/g, ' ')}. ${r?.verdict?.investor_review?.reasoning || ''}`
      default:
        return ''
    }
  }

  const r = result?.result || {}

  const tabContent = [
    <FounderTab      key="founder"      d={r.founder} />,
    <ProductTab      key="product"      d={r.product} />,
    <ArchitectureTab key="architecture" d={r.architecture} />,
    <DatabaseTab     key="database"     d={r.database} />,
    <APITab          key="api"          d={r.api} />,
    <ScalingTab      key="scaling"      d={r.scaling} />,
    <SecurityTab     key="security"     d={r.security} />,
    <DevOpsTab       key="devops"       d={r.devops} />,
    <FinOpsTab       key="finops"       d={r.finops} />,
    <HiringTab       key="hiring"       d={r.hiring} />,
    <DiagramsTab     key="diagrams"     d={r.diagrams} />,
    <VerdictTab      key="verdict"      d={r.verdict} />,
  ]

  return (
    <div className="min-h-screen bg-[#050a0f] text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050a0f]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-cyan-400" />
            </div>
            <span className="font-semibold text-sm tracking-wide">AII<span className="text-cyan-400">_CTO</span></span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const next = !voiceEnabled
                setVoiceEnabled(next)
                if (!next) stopSpeaking()
                else speakText('JARVIS voice system activated. I am ready to assist you.')
              }}
              className="p-2 rounded transition-all relative"
              title="Toggle JARVIS Voice (V)"
              style={{
                color: voiceEnabled ? '#00D4FF' : 'rgba(248,250,252,0.3)',
                background: voiceEnabled ? 'rgba(0,212,255,0.08)' : 'transparent',
                border: voiceEnabled ? '1px solid rgba(0,212,255,0.2)' : '1px solid transparent',
                boxShadow: voiceEnabled ? '0 0 12px rgba(0,212,255,0.15)' : 'none'
              }}>
              {isSpeaking ? (
                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.5, repeat: Infinity }}>
                  <Volume2 className="w-4 h-4" />
                </motion.div>
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => setShowShortcuts(true)}
              className="p-2 rounded transition-all"
              title="Keyboard shortcuts (?)"
              style={{ color: 'rgba(248,250,252,0.3)' }}>
              <Keyboard className="w-4 h-4" />
            </button>
            {result && (
              <button
                onClick={handleDownloadPDF}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors"
              >
                <Download className="w-3.5 h-3.5" />PDF
              </button>
            )}
            <Link href="/history" className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-white/10 text-gray-300 hover:text-white hover:border-white/20 transition-colors">
              <History className="w-3.5 h-3.5" />History
            </Link>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded border border-red-500/20 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Input */}
        <div className="mb-10">
          {user && (
            <p className="text-xs text-gray-600 mb-3">Welcome back, <span className="text-cyan-400">{user.name || user.email}</span></p>
          )}
          <div className="hud-panel rounded-xl p-6 mb-4">
            <label className="block text-xs text-cyan-400 uppercase tracking-widest mb-3">Startup Idea</label>
            <textarea
              value={problem}
              onChange={e => setProblem(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && e.metaKey && handleGenerate()}
              placeholder="Describe your startup idea... e.g. 'Build a food delivery app like Swiggy with real-time tracking'"
              className="w-full bg-transparent text-sm text-white placeholder-gray-600 resize-none outline-none h-24 leading-relaxed"
              disabled={loading}
            />
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
              <span className="text-[10px] text-gray-600">{problem.length} chars · ⌘+Enter to generate</span>
              <button
                onClick={() => handleGenerate()}
                disabled={loading || problem.trim().length < 10}
                className="btn-jarvis flex items-center gap-2 text-xs px-5 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
                {loading ? 'Generating...' : 'Generate Blueprint'}
              </button>
            </div>
          </div>
          {!result && !loading && (
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_CATEGORIES.flatMap(c => c.examples).map((ex, i) => (
                <button
                  key={i}
                  onClick={() => setProblem(ex)}
                  className="text-[11px] px-3 py-1 rounded-full border border-white/10 text-gray-500 hover:text-white hover:border-white/20 transition-colors"
                >
                  {ex}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 hud-panel rounded-lg p-4 border border-red-500/30 flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Loading */}
        <AnimatePresence>
          {loading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6"
            >
              <div className="hud-panel rounded-2xl overflow-hidden relative"
                style={{ borderColor: 'rgba(0,212,255,0.12)' }}>

                {/* Top beam */}
                <div className="absolute top-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.6),transparent)' }} />

                <div className="p-8">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                          <Cpu className="w-5 h-5" style={{ color: '#00D4FF' }} />
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.4, 1], opacity: [1, 0, 1] }}
                          transition={{ duration: 1.5, repeat: Infinity }}
                          className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full"
                          style={{ background: '#00D4FF', boxShadow: '0 0 8px #00D4FF' }} />
                      </div>
                      <div>
                        <div className="text-sm font-black tracking-wide" style={{ color: '#F8FAFC' }}>
                          CTO Intelligence System
                        </div>
                        <div className="text-[10px] font-mono" style={{ color: 'rgba(0,212,255,0.5)' }}>
                          {completedSteps.length === 0
                            ? 'INITIALIZING AGENTS...'
                            : completedSteps.length === 12
                            ? 'COMPILING BLUEPRINT...'
                            : `PHASE ${currentStep} OF 12 · ${AGENT_STEPS[currentStep - 1]?.name?.toUpperCase() || ''}`
                          }
                        </div>
                      </div>
                    </div>

                    {/* Phase counter */}
                    <div className="text-right">
                      <div className="text-3xl font-black font-mono text-cyan-400">
                        {String(completedSteps.length).padStart(2, '0')}
                        <span className="text-lg" style={{ color: 'rgba(248,250,252,0.15)' }}>/12</span>
                      </div>
                      <div className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>PHASES DONE</div>
                    </div>
                  </div>

                  {/* JARVIS CLOCK */}
                  <div className="flex flex-col items-center justify-center py-6 mb-8">
                    <div className="relative" style={{ width: 200, height: 200 }}>

                      {/* Outer static dashed ring */}
                      <svg className="absolute inset-0" width="200" height="200">
                        <circle cx="100" cy="100" r="95"
                          fill="none" stroke="rgba(0,212,255,0.06)" strokeWidth="1"
                          strokeDasharray="4 8" />
                      </svg>

                      {/* Rotating outer ring with dot */}
                      <motion.svg className="absolute inset-0" width="200" height="200"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}>
                        <circle cx="100" cy="100" r="90"
                          fill="none" stroke="rgba(0,212,255,0.15)" strokeWidth="1"
                          strokeDasharray="30 10 5 10" />
                        <circle cx="100" cy="10" r="3" fill="#00D4FF"
                          style={{ filter: 'drop-shadow(0 0 4px #00D4FF)' }} />
                      </motion.svg>

                      {/* Counter-rotating middle ring */}
                      <motion.svg className="absolute inset-0" width="200" height="200"
                        animate={{ rotate: -360 }}
                        transition={{ duration: 12, repeat: Infinity, ease: 'linear' }}>
                        <circle cx="100" cy="100" r="74"
                          fill="none" stroke="rgba(56,189,248,0.2)" strokeWidth="1"
                          strokeDasharray="15 8" />
                        <circle cx="100" cy="26" r="2.5" fill="#38BDF8"
                          style={{ filter: 'drop-shadow(0 0 4px #38BDF8)' }} />
                      </motion.svg>

                      {/* Progress arc */}
                      <svg className="absolute inset-0" width="200" height="200"
                        style={{ transform: 'rotate(-90deg)' }}>
                        <circle cx="100" cy="100" r="82"
                          fill="none" stroke="rgba(0,212,255,0.05)" strokeWidth="4" />
                        <motion.circle
                          cx="100" cy="100" r="82"
                          fill="none"
                          stroke="url(#progressGrad)"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeDasharray={`${2 * Math.PI * 82}`}
                          animate={{
                            strokeDashoffset: 2 * Math.PI * 82 * (1 - completedSteps.length / 12)
                          }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
                        />
                        <defs>
                          <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#00D4FF" />
                            <stop offset="100%" stopColor="#818CF8" />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Inner amber ring */}
                      <motion.svg className="absolute inset-0" width="200" height="200"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}>
                        <circle cx="100" cy="100" r="58"
                          fill="none" stroke="rgba(245,158,11,0.12)" strokeWidth="1"
                          strokeDasharray="8 12" />
                        <circle cx="100" cy="42" r="2" fill="#F59E0B"
                          style={{ filter: 'drop-shadow(0 0 3px #F59E0B)' }} />
                      </motion.svg>

                      {/* Center content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-4xl font-black font-mono"
                          style={{ color: '#00D4FF', textShadow: '0 0 20px rgba(0,212,255,0.5)', letterSpacing: '0.05em' }}>
                          {formatTime(elapsedTime)}
                        </div>
                        <div className="text-[9px] font-mono mt-1"
                          style={{ color: 'rgba(0,212,255,0.4)', letterSpacing: '0.2em' }}>
                          ELAPSED
                        </div>
                        <div className="mt-3 px-3 py-1 rounded"
                          style={{ background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.15)' }}>
                          <div className="text-[9px] font-mono text-center"
                            style={{ color: 'rgba(0,212,255,0.6)' }}>
                            {completedSteps.length < 12
                              ? (AGENT_STEPS[Math.max(0, currentStep - 1)]?.name || 'INITIALIZING')
                              : 'ALL COMPLETE'
                            }
                          </div>
                        </div>
                      </div>

                      {/* Cardinal tick marks */}
                      {[0, 90, 180, 270].map(angle => (
                        <div key={angle} className="absolute w-1.5 h-3"
                          style={{
                            background: 'rgba(0,212,255,0.3)',
                            top: '50%', left: '50%',
                            transformOrigin: '0 0',
                            transform: `rotate(${angle}deg) translateX(-0.75px) translateY(-100px)`,
                            borderRadius: 1
                          }} />
                      ))}
                    </div>

                    {/* Phase dots */}
                    <div className="flex items-center gap-2 mt-6">
                      {AGENT_STEPS.map(step => {
                        const isDone = completedSteps.includes(step.id)
                        const isActive = currentStep === step.id
                        return (
                          <motion.div
                            key={step.id}
                            title={step.name}
                            animate={isActive ? { scale: [1, 1.4, 1] } : { scale: 1 }}
                            transition={isActive ? { duration: 1, repeat: Infinity } : {}}
                            className="rounded-full transition-all duration-500"
                            style={{
                              width: isActive ? 10 : isDone ? 8 : 5,
                              height: isActive ? 10 : isDone ? 8 : 5,
                              background: isDone ? '#4ADE80' : isActive ? step.color : 'rgba(255,255,255,0.08)',
                              boxShadow: isDone ? '0 0 6px rgba(74,222,128,0.5)' : isActive ? `0 0 8px ${step.color}` : 'none'
                            }}
                          />
                        )
                      })}
                    </div>
                    <div className="text-[9px] font-mono mt-2" style={{ color: 'rgba(248,250,252,0.15)' }}>
                      {completedSteps.length} / 12 PHASES COMPLETE
                    </div>
                  </div>

                  {/* Bottom progress bar + live log */}
                  <div className="space-y-2">
                    <div className="h-0.5 rounded-full overflow-hidden"
                      style={{ background: 'rgba(255,255,255,0.04)' }}>
                      <motion.div
                        className="h-full rounded-full"
                        animate={{ width: `${(completedSteps.length / 12) * 100}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut' }}
                        style={{ background: 'linear-gradient(90deg,#00D4FF,#38BDF8,#818CF8)', boxShadow: '0 0 8px rgba(0,212,255,0.4)' }}
                      />
                    </div>

                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(0,212,255,0.05)' }}>
                      <motion.div
                        animate={{ opacity: [1, 0.3, 1] }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                        style={{ background: '#00D4FF', boxShadow: '0 0 4px #00D4FF' }} />
                      <span className="text-[10px] font-mono truncate" style={{ color: 'rgba(0,212,255,0.4)' }}>
                        {logs[logs.length - 1] || 'Initializing CTO Intelligence System...'}
                      </span>
                      <span className="text-[9px] font-mono flex-shrink-0 ml-auto"
                        style={{ color: 'rgba(248,250,252,0.15)' }}>
                        {Math.round((completedSteps.length / 12) * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom beam */}
                <div className="absolute bottom-0 left-0 right-0 h-px"
                  style={{ background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.3),transparent)' }} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                  <p className="text-xs text-gray-600 uppercase tracking-widest mb-1">Blueprint Generated</p>
                  <h2 className="text-xl font-bold text-white">{result.projectName}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    {result.from_cache && (
                      <span className="text-[10px] px-2 py-0.5 rounded border border-yellow-500/30 text-yellow-400 bg-yellow-500/10">Cached</span>
                    )}
                    <span className="text-[10px] px-2 py-0.5 rounded border border-green-500/30 text-green-400 bg-green-500/10">12 Phases Complete</span>
                    {elapsedTime > 0 && !result.from_cache && (
                      <span className="text-[10px] font-mono" style={{ color: 'rgba(245,158,11,0.5)' }}>
                        Generated in {formatTime(elapsedTime)}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleGenerate(true)}
                    className="flex items-center gap-1.5 text-[10px] font-mono px-3 py-2 rounded transition-all"
                    style={{ color: 'rgba(248,250,252,0.3)', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#00D4FF'; e.currentTarget.style.borderColor = 'rgba(0,212,255,0.25)' }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(248,250,252,0.3)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)' }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> REGENERATE
                  </button>
                  <button
                    onClick={handleDownloadPDF}
                    className="flex items-center gap-1.5 text-[10px] font-mono px-4 py-2 rounded transition-all"
                    style={{ color: '#F59E0B', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.05)', boxShadow: '0 0 12px rgba(245,158,11,0.1)' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 20px rgba(245,158,11,0.25)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.5)' }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 12px rgba(245,158,11,0.1)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.3)' }}
                  >
                    <Download className="w-3.5 h-3.5" /> DOWNLOAD PDF
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex gap-1 overflow-x-auto pb-2 mb-6">
                {TABS.map((tab, i) => {
                  const Icon = tab.icon
                  const isActive = activeTab === i
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(i)
                        if (voiceEnabled && result) {
                          setTimeout(() => speakText(getTabSummary(i, result)), 300)
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all shrink-0 ${
                        isActive
                          ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                          : 'text-gray-500 border border-transparent hover:text-gray-300 hover:border-white/10'
                      }`}
                    >
                      <span className="text-[10px] opacity-50 font-mono">{tab.num}</span>
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>

              {/* Tab content */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  {tabContent[activeTab]}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ background: 'rgba(3,7,18,0.85)', backdropFilter: 'blur(12px)' }}
            onClick={() => setShowShortcuts(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              className="hud-panel rounded-2xl p-8 max-w-md w-full relative"
              style={{ borderColor: 'rgba(0,212,255,0.2)' }}
              onClick={e => e.stopPropagation()}
            >
              <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
                style={{ background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.5),transparent)' }} />

              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)' }}>
                  <Keyboard className="w-5 h-5" style={{ color: '#00D4FF' }} />
                </div>
                <div>
                  <div className="font-black tracking-widest text-sm" style={{ color: '#00D4FF' }}>KEYBOARD SHORTCUTS</div>
                  <div className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>JARVIS COMMAND INTERFACE</div>
                </div>
                <button onClick={() => setShowShortcuts(false)}
                  className="ml-auto p-1.5 rounded-lg transition-all"
                  style={{ color: 'rgba(248,250,252,0.3)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-1">
                {[
                  { keys: ['1', '–', '9'], action: 'Switch to tab 1–9', color: '#00D4FF' },
                  { keys: ['0'], action: 'Switch to Verdict tab (12)', color: '#00D4FF' },
                  { keys: ['G'], action: 'Generate blueprint', color: '#4ADE80' },
                  { keys: ['P'], action: 'Download PDF report', color: '#F59E0B' },
                  { keys: ['V'], action: 'Toggle JARVIS voice', color: '#A78BFA' },
                  { keys: ['?'], action: 'Show this shortcuts panel', color: 'rgba(248,250,252,0.4)' },
                  { keys: ['Esc'], action: 'Close this panel', color: 'rgba(248,250,252,0.4)' },
                ].map(({ keys, action, color }) => (
                  <div key={action}
                    className="flex items-center justify-between py-2.5 px-3 rounded-lg"
                    style={{ borderBottom: '1px solid rgba(0,212,255,0.05)' }}>
                    <span className="text-xs font-mono" style={{ color: 'rgba(248,250,252,0.4)' }}>{action}</span>
                    <div className="flex gap-1">
                      {keys.map((k, idx) => (
                        <span key={idx}
                          className="text-[10px] font-mono font-bold px-2 py-1 rounded"
                          style={{
                            background: 'rgba(0,212,255,0.08)',
                            border: '1px solid rgba(0,212,255,0.2)',
                            color
                          }}>
                          {k}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-4 text-center text-[9px] font-mono"
                style={{ borderTop: '1px solid rgba(0,212,255,0.08)', color: 'rgba(248,250,252,0.15)' }}>
                PRESS ? OR / ANYTIME TO TOGGLE THIS PANEL
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
