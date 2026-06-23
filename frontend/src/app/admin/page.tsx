'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Star, ThumbsUp, TrendingUp, MessageSquare,
  ChevronDown, ChevronUp, Lock, Eye, EyeOff,
  BarChart3, Cpu, RefreshCw
} from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
const ADMIN_PASSWORD = 'jarvis2117'

function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <Star key={s} className="w-3.5 h-3.5"
          style={{
            color: s <= rating ? '#F59E0B' : 'rgba(255,255,255,0.1)',
            fill: s <= rating ? '#F59E0B' : 'transparent'
          }} />
      ))}
    </div>
  )
}

function StatCard({ label, value, sub, color = '#00D4FF', icon: Icon }: {
  label: string; value: string | number; sub?: string; color?: string; icon: React.ComponentType<any>
}) {
  return (
    <div className="hud-panel rounded-xl p-5" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
      <div className="flex items-start justify-between mb-3">
        <div className="text-[9px] font-mono tracking-widest" style={{ color: 'rgba(248,250,252,0.3)' }}>
          {label}
        </div>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
          <Icon className="w-3.5 h-3.5" style={{ color }} />
        </div>
      </div>
      <div className="text-3xl font-black" style={{ color }}>{value}</div>
      {sub && <div className="text-[10px] font-mono mt-1" style={{ color: 'rgba(248,250,252,0.2)' }}>{sub}</div>}
    </div>
  )
}

const FEATURE_LABELS: Record<string, string> = {
  google_auth: 'Google Sign In',
  share_blueprint: 'Share Blueprint',
  compare_mode: 'Compare 2 Ideas',
  ask_blueprint: 'Chat with Blueprint',
  notion_export: 'Export to Notion',
  pitch_deck: 'Pitch Deck Generator',
  team_collab: 'Team Collaboration',
  mobile_app: 'Mobile App',
  hindi_input: 'Hindi Input',
  regenerate_phase: 'Regenerate Phase',
  api_access: 'Public API',
  custom_domain: 'Custom Domain',
}

const CONTEXT_LABELS: Record<string, string> = {
  student: '🎓 Student',
  founder: '🚀 Founder',
  developer: '💻 Developer',
  freelancer: '🎯 Freelancer',
  pm: '📋 Product Manager',
  other: '✨ Other',
}

export default function AdminPage() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [passError, setPassError] = useState(false)
  const [stats, setStats] = useState<any>(null)
  const [feedbacks, setFeedbacks] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filterRating, setFilterRating] = useState(0)
  const [filterContext, setFilterContext] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'highest' | 'lowest'>('newest')
  const [activeSection, setActiveSection] = useState<'overview' | 'feedbacks' | 'features'>('overview')

  function handleLogin() {
    if (password === ADMIN_PASSWORD) {
      setAuthed(true)
      setPassError(false)
      loadData()
    } else {
      setPassError(true)
      setPassword('')
    }
  }

  async function loadData() {
    setLoading(true)
    try {
      const [statsRes, feedbacksRes] = await Promise.all([
        fetch(`${API}/api/feedback/stats`),
        fetch(`${API}/api/feedback/all`)
      ])
      const statsData = await statsRes.json()
      const feedbacksData = await feedbacksRes.json()
      setStats(statsData)
      setFeedbacks(feedbacksData.feedbacks || [])
    } catch (e) {
      console.error('Failed to load admin data', e)
    } finally {
      setLoading(false)
    }
  }

  const filtered = feedbacks
    .filter(f => filterRating === 0 || f.overallRating === filterRating)
    .filter(f => !filterContext || f.usageContext === filterContext)
    .sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      if (sortBy === 'highest') return b.overallRating - a.overallRating
      return a.overallRating - b.overallRating
    })

  if (!authed) {
    return (
      <div className="page-jarvis min-h-screen flex items-center justify-center p-4 text-white">
        <div className="fixed inset-0 hud-grid opacity-15 pointer-events-none" />
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="w-full max-w-sm"
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4"
              style={{
                background: 'rgba(0,212,255,0.08)',
                border: '1px solid rgba(0,212,255,0.25)',
                boxShadow: '0 0 30px rgba(0,212,255,0.1)'
              }}>
              <Lock className="w-6 h-6" style={{ color: '#00D4FF' }} />
            </div>
            <div className="text-xl font-black" style={{ color: '#00D4FF' }}>JARVIS_CTO</div>
            <div className="text-[9px] font-mono tracking-[0.3em] mt-1"
              style={{ color: 'rgba(248,250,252,0.2)' }}>
              ADMIN CONTROL PANEL
            </div>
          </div>

          <div className="hud-panel rounded-2xl p-7 relative"
            style={{ borderColor: 'rgba(0,212,255,0.15)' }}>
            <div className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.5),transparent)' }} />

            <div className="text-[9px] font-mono tracking-[0.2em] mb-2"
              style={{ color: 'rgba(0,212,255,0.4)' }}>
              ACCESS CODE
            </div>
            <div className="relative mb-4">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => { setPassword(e.target.value); setPassError(false) }}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                placeholder="Enter admin password"
                className="input-jarvis w-full pr-10"
                autoFocus
                style={{ borderColor: passError ? 'rgba(248,113,113,0.4)' : undefined }}
              />
              <button onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-3"
                style={{ color: 'rgba(0,212,255,0.3)' }}>
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <AnimatePresence>
              {passError && (
                <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  className="text-xs font-mono mb-4 px-3 py-2 rounded-lg"
                  style={{
                    background: 'rgba(248,113,113,0.06)', color: '#F87171',
                    border: '1px solid rgba(248,113,113,0.2)'
                  }}>
                  ⚠ Incorrect access code
                </motion.div>
              )}
            </AnimatePresence>

            <button onClick={handleLogin} className="btn-jarvis w-full justify-center">
              <Lock className="w-4 h-4" />
              ACCESS ADMIN PANEL
            </button>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="page-jarvis min-h-screen text-white">
      <div className="fixed inset-0 hud-grid opacity-10 pointer-events-none" />

      {/* Navbar */}
      <nav className="hud-panel border-b px-6 py-3.5 flex items-center justify-between sticky top-0 z-50"
        style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)' }}>
            <Cpu className="w-4 h-4" style={{ color: '#00D4FF' }} />
          </div>
          <div>
            <div className="text-sm font-black tracking-[0.15em]" style={{ color: '#00D4FF' }}>
              JARVIS<span style={{ color: 'rgba(248,250,252,0.3)' }}>_</span>CTO
            </div>
            <div className="text-[8px] font-mono tracking-widest" style={{ color: 'rgba(248,250,252,0.15)' }}>
              ADMIN PANEL
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={loadData} disabled={loading}
            className="flex items-center gap-1.5 text-[9px] font-mono px-3 py-2 rounded-lg transition-all"
            style={{ color: 'rgba(248,250,252,0.3)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            REFRESH
          </button>
          <button onClick={() => setAuthed(false)}
            className="flex items-center gap-1.5 text-[9px] font-mono px-3 py-2 rounded-lg"
            style={{ color: 'rgba(248,113,113,0.6)', border: '1px solid rgba(248,113,113,0.15)' }}>
            <Lock className="w-3.5 h-3.5" />
            LOGOUT
          </button>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Section tabs */}
        <div className="flex gap-2 mb-8">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3 },
            { id: 'feedbacks', label: 'All Feedbacks', icon: MessageSquare },
            { id: 'features', label: 'Feature Requests', icon: TrendingUp },
          ].map(({ id, label, icon: Icon }) => (
            <button key={id}
              onClick={() => setActiveSection(id as 'overview' | 'feedbacks' | 'features')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-mono tracking-widest transition-all"
              style={{
                background: activeSection === id ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${activeSection === id ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                color: activeSection === id ? '#00D4FF' : 'rgba(248,250,252,0.25)'
              }}>
              <Icon className="w-3.5 h-3.5" />
              {label.toUpperCase()}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {activeSection === 'overview' && stats && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
              <StatCard label="TOTAL FEEDBACKS" value={stats.total || 0} icon={MessageSquare} color="#00D4FF" />
              <StatCard label="AVG OVERALL" value={`${stats.avgOverall || 0}★`} icon={Star} color="#F59E0B" sub="out of 5" />
              <StatCard label="OUTPUT QUALITY" value={`${stats.avgQuality || 0}★`} icon={Star} color="#4ADE80" />
              <StatCard label="EASE OF USE" value={`${stats.avgEase || 0}★`} icon={Star} color="#A78BFA" />
              <StatCard label="SPEED RATING" value={`${stats.avgSpeed || 0}★`} icon={Star} color="#38BDF8" />
              <StatCard label="RECOMMEND" value={`${stats.recommendPct || 0}%`} icon={ThumbsUp} color="#4ADE80" sub="would recommend" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
              {/* Rating distribution */}
              <div className="hud-panel rounded-xl p-6" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
                <div className="text-[9px] font-mono tracking-widest mb-4" style={{ color: 'rgba(0,212,255,0.4)' }}>
                  RATING DISTRIBUTION
                </div>
                {[5, 4, 3, 2, 1].map(rating => {
                  const count = feedbacks.filter(f => f.overallRating === rating).length
                  const pct = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0
                  return (
                    <div key={rating} className="flex items-center gap-3 mb-2">
                      <div className="flex items-center gap-1 w-16 flex-shrink-0">
                        <span className="text-xs font-mono" style={{ color: '#F59E0B' }}>{rating}</span>
                        <Star className="w-3 h-3" style={{ color: '#F59E0B', fill: '#F59E0B' }} />
                      </div>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8, delay: 0.1 * (5 - rating) }}
                          className="h-full rounded-full"
                          style={{ background: rating >= 4 ? '#4ADE80' : rating === 3 ? '#F59E0B' : '#F87171' }} />
                      </div>
                      <span className="text-[9px] font-mono w-16 text-right" style={{ color: 'rgba(248,250,252,0.3)' }}>
                        {count} ({Math.round(pct)}%)
                      </span>
                    </div>
                  )
                })}
              </div>

              {/* Usage context */}
              <div className="hud-panel rounded-xl p-6" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
                <div className="text-[9px] font-mono tracking-widest mb-4" style={{ color: 'rgba(0,212,255,0.4)' }}>
                  WHO USES JARVIS_CTO
                </div>
                {Object.entries(CONTEXT_LABELS).map(([key, label]) => {
                  const count = feedbacks.filter(f => f.usageContext === key).length
                  const pct = feedbacks.length > 0 ? (count / feedbacks.length) * 100 : 0
                  if (count === 0) return null
                  return (
                    <div key={key} className="flex items-center gap-3 mb-2">
                      <span className="text-xs w-32 flex-shrink-0" style={{ color: 'rgba(248,250,252,0.5)' }}>{label}</span>
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{ background: '#00D4FF' }} />
                      </div>
                      <span className="text-[9px] font-mono w-8 text-right" style={{ color: 'rgba(248,250,252,0.3)' }}>{count}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Top feature requests */}
            {stats.topFeatures?.length > 0 && (
              <div className="hud-panel rounded-xl p-6" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
                <div className="text-[9px] font-mono tracking-widest mb-4" style={{ color: 'rgba(0,212,255,0.4)' }}>
                  TOP FEATURE REQUESTS
                </div>
                <div className="space-y-3">
                  {stats.topFeatures.map((f: any, i: number) => (
                    <div key={f.feature} className="flex items-center gap-3">
                      <span className="text-[9px] font-mono font-bold w-4" style={{ color: 'rgba(0,212,255,0.4)' }}>{i + 1}</span>
                      <span className="text-sm flex-1" style={{ color: 'rgba(248,250,252,0.6)' }}>
                        {FEATURE_LABELS[f.feature] || f.feature}
                      </span>
                      <div className="flex-1 max-w-xs h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.05)' }}>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(f.count / stats.topFeatures[0].count) * 100}%` }}
                          transition={{ duration: 0.8, delay: i * 0.1 }}
                          className="h-full rounded-full"
                          style={{ background: `hsl(${200 - i * 20},80%,60%)` }} />
                      </div>
                      <span className="text-xs font-mono font-bold w-8 text-right" style={{ color: 'rgba(248,250,252,0.4)' }}>
                        {f.count}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!stats && !loading && (
              <div className="hud-panel rounded-xl p-10 text-center" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
                <p className="text-xs font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>No data yet</p>
              </div>
            )}
          </motion.div>
        )}

        {/* ALL FEEDBACKS */}
        {activeSection === 'feedbacks' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="flex flex-wrap gap-3 mb-6">
              <select value={filterRating} onChange={e => setFilterRating(Number(e.target.value))}
                className="input-jarvis text-xs py-2 px-3" style={{ width: 'auto' }}>
                <option value={0}>All Ratings</option>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
              </select>
              <select value={filterContext} onChange={e => setFilterContext(e.target.value)}
                className="input-jarvis text-xs py-2 px-3" style={{ width: 'auto' }}>
                <option value="">All Users</option>
                {Object.entries(CONTEXT_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value as 'newest' | 'highest' | 'lowest')}
                className="input-jarvis text-xs py-2 px-3" style={{ width: 'auto' }}>
                <option value="newest">Newest First</option>
                <option value="highest">Highest Rated</option>
                <option value="lowest">Lowest Rated</option>
              </select>
              <div className="text-[9px] font-mono self-center" style={{ color: 'rgba(248,250,252,0.25)' }}>
                {filtered.length} feedbacks
              </div>
            </div>

            <div className="space-y-3">
              {filtered.length === 0 ? (
                <div className="hud-panel rounded-xl p-10 text-center" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
                  <p className="text-xs font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>No feedbacks found</p>
                </div>
              ) : filtered.map((fb: any) => (
                <motion.div key={fb.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="hud-panel rounded-xl overflow-hidden" style={{ borderColor: 'rgba(0,212,255,0.08)' }}>
                  <div
                    className="flex items-center gap-4 px-5 py-4 cursor-pointer"
                    onClick={() => setExpanded(expanded === fb.id ? null : fb.id)}
                    style={{ borderBottom: expanded === fb.id ? '1px solid rgba(0,212,255,0.08)' : 'none' }}>
                    <div className="flex-shrink-0">
                      <div className="text-2xl font-black"
                        style={{ color: fb.overallRating >= 4 ? '#4ADE80' : fb.overallRating === 3 ? '#F59E0B' : '#F87171' }}>
                        {fb.overallRating}★
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-semibold" style={{ color: '#F8FAFC' }}>
                          {CONTEXT_LABELS[fb.usageContext] || fb.usageContext}
                        </span>
                        {fb.wouldRecommend ? (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(74,222,128,0.1)', color: '#4ADE80', border: '1px solid rgba(74,222,128,0.2)' }}>
                            👍 Recommends
                          </span>
                        ) : (
                          <span className="text-[8px] font-mono px-1.5 py-0.5 rounded"
                            style={{ background: 'rgba(248,113,113,0.1)', color: '#F87171', border: '1px solid rgba(248,113,113,0.2)' }}>
                            👎 Would not recommend
                          </span>
                        )}
                        {fb.bestThing && (
                          <span className="text-[9px] italic truncate max-w-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>
                            &ldquo;{fb.bestThing.substring(0, 60)}{fb.bestThing.length > 60 ? '...' : ''}&rdquo;
                          </span>
                        )}
                      </div>
                      <div className="text-[9px] font-mono mt-1" style={{ color: 'rgba(248,250,252,0.2)' }}>
                        {new Date(fb.createdAt).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </div>
                    </div>
                    <button style={{ color: 'rgba(248,250,252,0.2)' }}>
                      {expanded === fb.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>

                  <AnimatePresence>
                    {expanded === fb.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden">
                        <div className="px-5 py-4 space-y-4">
                          <div className="grid grid-cols-3 gap-3">
                            {[
                              { label: 'Output Quality', val: fb.outputQuality },
                              { label: 'Ease of Use', val: fb.easeOfUse },
                              { label: 'Speed', val: fb.speedRating },
                            ].map(({ label, val }) => (
                              <div key={label}>
                                <div className="text-[8px] font-mono mb-1" style={{ color: 'rgba(248,250,252,0.2)' }}>
                                  {label.toUpperCase()}
                                </div>
                                <StarDisplay rating={val} />
                              </div>
                            ))}
                          </div>

                          {fb.featureRequests && (() => {
                            try {
                              const feats: string[] = JSON.parse(fb.featureRequests)
                              return feats.length > 0 ? (
                                <div>
                                  <div className="text-[8px] font-mono mb-2" style={{ color: 'rgba(248,250,252,0.2)' }}>FEATURE REQUESTS</div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {feats.map((feat: string) => (
                                      <span key={feat} className="text-[9px] font-mono px-2 py-0.5 rounded"
                                        style={{ background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.12)', color: 'rgba(0,212,255,0.6)' }}>
                                        {FEATURE_LABELS[feat] || feat}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              ) : null
                            } catch { return null }
                          })()}

                          {[
                            { label: 'BEST THING', val: fb.bestThing, color: '#4ADE80' },
                            { label: 'IMPROVEMENT', val: fb.improvementArea, color: '#F59E0B' },
                            { label: 'MESSAGE', val: fb.message, color: '#00D4FF' },
                          ].filter(x => x.val).map(({ label, val, color }) => (
                            <div key={label}>
                              <div className="text-[8px] font-mono mb-1" style={{ color: 'rgba(248,250,252,0.2)' }}>{label}</div>
                              <p className="text-xs leading-relaxed" style={{ color: 'rgba(248,250,252,0.5)' }}>&ldquo;{val}&rdquo;</p>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* FEATURE REQUESTS */}
        {activeSection === 'features' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="hud-panel rounded-xl p-6" style={{ borderColor: 'rgba(0,212,255,0.1)' }}>
              <div className="text-[9px] font-mono tracking-widest mb-6" style={{ color: 'rgba(0,212,255,0.4)' }}>
                ALL FEATURE REQUESTS — RANKED BY VOTES
              </div>
              {stats?.topFeatures?.length > 0 ? (
                <div className="space-y-4">
                  {Object.entries(FEATURE_LABELS).map(([key, label]) => {
                    const found = stats.topFeatures?.find((f: any) => f.feature === key)
                    const count = found?.count || 0
                    const max = stats.topFeatures?.[0]?.count || 1
                    const pct = (count / max) * 100
                    return (
                      <div key={key} className="flex items-center gap-4">
                        <div className="w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-[8px] font-bold"
                          style={{
                            background: count > 0 ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                            color: count > 0 ? '#00D4FF' : 'rgba(255,255,255,0.1)'
                          }}>
                          {count > 0 ? count : '—'}
                        </div>
                        <span className="text-sm flex-shrink-0 w-48"
                          style={{ color: count > 0 ? 'rgba(248,250,252,0.7)' : 'rgba(248,250,252,0.2)' }}>
                          {label}
                        </span>
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.04)' }}>
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8 }}
                            className="h-full rounded-full"
                            style={{ background: count > 0 ? 'linear-gradient(90deg,#00D4FF,#818CF8)' : 'transparent' }} />
                        </div>
                        <span className="text-xs font-mono w-8 text-right" style={{ color: 'rgba(248,250,252,0.25)' }}>
                          {count}
                        </span>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-xs font-mono text-center" style={{ color: 'rgba(248,250,252,0.2)' }}>
                  No feature requests yet
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
}
