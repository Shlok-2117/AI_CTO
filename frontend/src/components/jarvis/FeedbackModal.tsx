'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Send, ChevronRight, Heart } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

const FEATURE_OPTIONS = [
  { id: 'google_auth', label: 'Google Sign In', icon: '🔐' },
  { id: 'share_blueprint', label: 'Share Blueprint Link', icon: '🔗' },
  { id: 'compare_mode', label: 'Compare 2 Ideas', icon: '⚖️' },
  { id: 'ask_blueprint', label: 'Chat with Blueprint', icon: '💬' },
  { id: 'notion_export', label: 'Export to Notion', icon: '📝' },
  { id: 'pitch_deck', label: 'Pitch Deck Generator', icon: '📊' },
  { id: 'team_collab', label: 'Team Collaboration', icon: '👥' },
  { id: 'mobile_app', label: 'Mobile App', icon: '📱' },
  { id: 'hindi_input', label: 'Hindi / Regional Input', icon: '🌐' },
  { id: 'regenerate_phase', label: 'Regenerate Single Phase', icon: '🔄' },
  { id: 'api_access', label: 'Public API Access', icon: '⚡' },
  { id: 'custom_domain', label: 'Custom Domain', icon: '🌍' },
]

const USAGE_CONTEXTS = [
  { id: 'student', label: 'Student', icon: '🎓' },
  { id: 'founder', label: 'Startup Founder', icon: '🚀' },
  { id: 'developer', label: 'Developer', icon: '💻' },
  { id: 'freelancer', label: 'Freelancer', icon: '🎯' },
  { id: 'pm', label: 'Product Manager', icon: '📋' },
  { id: 'other', label: 'Other', icon: '✨' },
]

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent']

function StarRow({ value, onChange, label, color = '#00D4FF' }: {
  value: number; onChange: (v: number) => void; label: string; color?: string
}) {
  const [hovered, setHovered] = useState(0)
  const active = hovered || value
  return (
    <div>
      <div className="text-[9px] font-mono tracking-widest mb-2" style={{ color: 'rgba(248,250,252,0.4)' }}>
        {label}
      </div>
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map(s => (
          <button key={s}
            onClick={() => onChange(s)}
            onMouseEnter={() => setHovered(s)}
            onMouseLeave={() => setHovered(0)}
            style={{ transform: active >= s ? 'scale(1.2)' : 'scale(1)', transition: 'transform 0.15s' }}>
            <Star className="w-5 h-5" style={{
              color: active >= s ? color : 'rgba(255,255,255,0.1)',
              fill: active >= s ? color : 'transparent',
              filter: active >= s ? `drop-shadow(0 0 4px ${color}80)` : 'none',
              transition: 'all 0.15s'
            }} />
          </button>
        ))}
        {value > 0 && (
          <span className="text-xs font-mono ml-1" style={{ color }}>{STAR_LABELS[value]}</span>
        )}
      </div>
    </div>
  )
}

export function FeedbackModal({ onClose, generationId }: {
  onClose: () => void
  generationId?: string
}) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const [overallRating, setOverallRating] = useState(0)
  const [outputQuality, setOutputQuality] = useState(0)
  const [easeOfUse, setEaseOfUse] = useState(0)
  const [speedRating, setSpeedRating] = useState(0)

  const [usageContext, setUsageContext] = useState('')
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([])
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null)

  const [bestThing, setBestThing] = useState('')
  const [improvementArea, setImprovementArea] = useState('')
  const [message, setMessage] = useState('')

  function toggleFeature(id: string) {
    setSelectedFeatures(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id])
  }

  async function handleSubmit() {
    if (!overallRating) return
    setLoading(true)
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      await fetch(`${API}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          overallRating, outputQuality: outputQuality || 3,
          easeOfUse: easeOfUse || 3, speedRating: speedRating || 3,
          featureRequests: selectedFeatures,
          wouldRecommend: wouldRecommend ?? true,
          usageContext: usageContext || 'other',
          bestThing, improvementArea, message, generationId
        })
      })
      setDone(true)
    } catch {
      setDone(true)
    } finally {
      setLoading(false)
    }
  }

  const canNext1 = overallRating > 0
  const canNext2 = usageContext !== '' && wouldRecommend !== null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(3,7,18,0.88)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
        className="relative w-full max-w-lg overflow-hidden"
        style={{
          background: 'rgba(11,17,32,0.98)',
          border: '1px solid rgba(0,212,255,0.2)',
          borderRadius: 20,
          boxShadow: '0 0 80px rgba(0,212,255,0.08), 0 40px 100px rgba(0,0,0,0.7)',
          maxHeight: '92vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Top beam */}
        <div className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'linear-gradient(90deg,transparent,#00D4FF,transparent)' }} />

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}>
              <Heart className="w-4 h-4" style={{ color: '#00D4FF' }} />
            </div>
            <div>
              <div className="text-sm font-black tracking-wide" style={{ color: '#F8FAFC' }}>
                Share Your Feedback
              </div>
              <div className="text-[9px] font-mono" style={{ color: 'rgba(0,212,255,0.4)' }}>
                JARVIS_CTO · OPERATOR REVIEW SYSTEM
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'rgba(248,250,252,0.3)' }}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Progress */}
        {!done && (
          <div className="px-6 pt-4 pb-1">
            <div className="flex items-center gap-2 mb-1">
              {[1, 2, 3].map(s => (
                <div key={s} className="flex-1 h-0.5 rounded-full overflow-hidden"
                  style={{ background: 'rgba(255,255,255,0.05)' }}>
                  <motion.div className="h-full rounded-full"
                    animate={{ width: step >= s ? '100%' : '0%' }}
                    transition={{ duration: 0.4 }}
                    style={{ background: '#00D4FF', boxShadow: '0 0 6px rgba(0,212,255,0.5)' }} />
                </div>
              ))}
            </div>
            <div className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.2)' }}>
              STEP {step} OF 3
            </div>
          </div>
        )}

        {/* Scrollable content */}
        <div className="overflow-y-auto px-6 py-5" style={{ maxHeight: 'calc(92vh - 120px)' }}>
          <AnimatePresence mode="wait">

            {/* SUCCESS */}
            {done && (
              <motion.div key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1 }}
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{
                    background: 'rgba(0,212,255,0.08)',
                    border: '1px solid rgba(0,212,255,0.25)',
                    boxShadow: '0 0 40px rgba(0,212,255,0.12)'
                  }}>
                  <span style={{ fontSize: 36 }}>🎉</span>
                </motion.div>
                <div className="text-[9px] font-mono tracking-[0.3em] mb-2"
                  style={{ color: 'rgba(0,212,255,0.5)' }}>TRANSMISSION RECEIVED</div>
                <h3 className="text-xl font-black mb-3" style={{ color: '#F8FAFC' }}>
                  Thank you, Operator!
                </h3>
                <p className="text-sm mb-6" style={{ color: 'rgba(248,250,252,0.4)' }}>
                  Your feedback helps JARVIS_CTO improve. Every review makes the system smarter.
                </p>
                <div className="flex flex-col gap-2 items-center mb-6">
                  {[
                    `⭐ You rated JARVIS_CTO ${overallRating}/5 stars`,
                    '✓ Feature requests recorded',
                    '💬 Message sent to the team',
                  ].map(text => (
                    <div key={text} className="text-xs font-mono" style={{ color: 'rgba(0,212,255,0.5)' }}>
                      {text}
                    </div>
                  ))}
                </div>
                <button onClick={onClose}
                  className="px-6 py-2.5 rounded-xl text-xs font-mono font-bold transition-all"
                  style={{
                    background: 'rgba(0,212,255,0.1)',
                    border: '1px solid rgba(0,212,255,0.3)',
                    color: '#00D4FF'
                  }}>
                  CLOSE
                </button>
              </motion.div>
            )}

            {/* STEP 1 — RATINGS */}
            {!done && step === 1 && (
              <motion.div key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="text-base font-black mb-1" style={{ color: '#F8FAFC' }}>Rate Your Experience</h3>
                  <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>
                    How would you rate different aspects of JARVIS_CTO?
                  </p>
                </div>

                {/* Overall stars — big */}
                <div className="p-5 rounded-xl"
                  style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.1)' }}>
                  <div className="text-[9px] font-mono tracking-widest mb-3"
                    style={{ color: 'rgba(0,212,255,0.5)' }}>OVERALL RATING *</div>
                  <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3, 4, 5].map(s => (
                      <OverallStar key={s} s={s} value={overallRating} onChange={setOverallRating} />
                    ))}
                  </div>
                  {overallRating > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="text-sm font-black" style={{ color: '#F59E0B' }}>
                      {['', '⭐ Poor', '⭐⭐ Fair', '⭐⭐⭐ Good', '⭐⭐⭐⭐ Great', '⭐⭐⭐⭐⭐ Excellent!'][overallRating]}
                    </motion.div>
                  )}
                </div>

                <div className="space-y-4">
                  <StarRow value={outputQuality} onChange={setOutputQuality}
                    label="OUTPUT QUALITY — How good were the blueprints?" color="#00D4FF" />
                  <StarRow value={easeOfUse} onChange={setEaseOfUse}
                    label="EASE OF USE — How easy was it to use?" color="#4ADE80" />
                  <StarRow value={speedRating} onChange={setSpeedRating}
                    label="SPEED — Satisfied with generation time?" color="#A78BFA" />
                </div>

                <button onClick={() => setStep(2)} disabled={!canNext1}
                  className="w-full py-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: canNext1 ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${canNext1 ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
                    color: canNext1 ? '#00D4FF' : 'rgba(255,255,255,0.2)',
                    cursor: canNext1 ? 'pointer' : 'not-allowed'
                  }}>
                  NEXT — ABOUT YOU <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>
            )}

            {/* STEP 2 — CONTEXT + FEATURES */}
            {!done && step === 2 && (
              <motion.div key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-base font-black mb-1" style={{ color: '#F8FAFC' }}>About You & Features</h3>
                  <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>
                    Help us understand who uses JARVIS_CTO and what to build next.
                  </p>
                </div>

                {/* Who are you */}
                <div>
                  <div className="text-[9px] font-mono tracking-widest mb-3"
                    style={{ color: 'rgba(0,212,255,0.4)' }}>I AM A...</div>
                  <div className="grid grid-cols-3 gap-2">
                    {USAGE_CONTEXTS.map(ctx => (
                      <button key={ctx.id} onClick={() => setUsageContext(ctx.id)}
                        className="flex flex-col items-center gap-1 py-3 px-2 rounded-xl transition-all"
                        style={{
                          background: usageContext === ctx.id ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${usageContext === ctx.id ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
                          boxShadow: usageContext === ctx.id ? '0 0 15px rgba(0,212,255,0.08)' : 'none'
                        }}>
                        <span style={{ fontSize: 20 }}>{ctx.icon}</span>
                        <span className="text-[9px] font-mono"
                          style={{ color: usageContext === ctx.id ? '#00D4FF' : 'rgba(248,250,252,0.3)' }}>
                          {ctx.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Would recommend */}
                <div>
                  <div className="text-[9px] font-mono tracking-widest mb-3"
                    style={{ color: 'rgba(0,212,255,0.4)' }}>WOULD YOU RECOMMEND JARVIS_CTO?</div>
                  <div className="flex gap-3">
                    {([
                      { val: true, label: '👍 Yes, definitely!', color: '#4ADE80' },
                      { val: false, label: '👎 Not yet', color: '#F87171' },
                    ] as const).map(opt => (
                      <button key={String(opt.val)} onClick={() => setWouldRecommend(opt.val)}
                        className="flex-1 py-3 rounded-xl text-xs font-mono transition-all"
                        style={{
                          background: wouldRecommend === opt.val ? `${opt.color}18` : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${wouldRecommend === opt.val ? opt.color + '50' : 'rgba(255,255,255,0.06)'}`,
                          color: wouldRecommend === opt.val ? opt.color : 'rgba(248,250,252,0.3)'
                        }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feature requests */}
                <div>
                  <div className="text-[9px] font-mono tracking-widest mb-3"
                    style={{ color: 'rgba(0,212,255,0.4)' }}>
                    WHAT SHOULD WE BUILD NEXT? (select all that apply)
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {FEATURE_OPTIONS.map(feat => (
                      <button key={feat.id} onClick={() => toggleFeature(feat.id)}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-left transition-all"
                        style={{
                          background: selectedFeatures.includes(feat.id) ? 'rgba(0,212,255,0.08)' : 'rgba(255,255,255,0.02)',
                          border: `1px solid ${selectedFeatures.includes(feat.id) ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.05)'}`,
                        }}>
                        <span style={{ fontSize: 14 }}>{feat.icon}</span>
                        <span className="text-[9px] font-mono flex-1"
                          style={{ color: selectedFeatures.includes(feat.id) ? '#00D4FF' : 'rgba(248,250,252,0.35)' }}>
                          {feat.label}
                        </span>
                        {selectedFeatures.includes(feat.id) && (
                          <span className="text-[8px]" style={{ color: '#00D4FF' }}>✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(1)}
                    className="px-5 py-3 rounded-xl text-xs font-mono transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(248,250,252,0.3)' }}>
                    ← BACK
                  </button>
                  <button onClick={() => setStep(3)} disabled={!canNext2}
                    className="flex-1 py-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: canNext2 ? 'rgba(0,212,255,0.12)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${canNext2 ? 'rgba(0,212,255,0.35)' : 'rgba(255,255,255,0.06)'}`,
                      color: canNext2 ? '#00D4FF' : 'rgba(255,255,255,0.2)',
                      cursor: canNext2 ? 'pointer' : 'not-allowed'
                    }}>
                    NEXT — YOUR THOUGHTS <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 3 — OPEN TEXT */}
            {!done && step === 3 && (
              <motion.div key="step3"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
              >
                <div>
                  <h3 className="text-base font-black mb-1" style={{ color: '#F8FAFC' }}>Tell Us More</h3>
                  <p className="text-xs" style={{ color: 'rgba(248,250,252,0.3)' }}>
                    Optional — but every word helps us improve.
                  </p>
                </div>

                {[
                  { label: '💚 BEST THING ABOUT JARVIS_CTO', value: bestThing, onChange: setBestThing, placeholder: 'What did you love most about it?' },
                  { label: '🔧 WHAT NEEDS IMPROVEMENT', value: improvementArea, onChange: setImprovementArea, placeholder: 'What would make it better?' },
                  { label: '💬 ANYTHING ELSE?', value: message, onChange: setMessage, placeholder: 'Feature ideas, bugs, general thoughts...' },
                ].map(({ label, value, onChange, placeholder }) => (
                  <div key={label}>
                    <div className="text-[9px] font-mono tracking-widest mb-2"
                      style={{ color: 'rgba(248,250,252,0.3)' }}>{label}</div>
                    <textarea value={value} onChange={e => onChange(e.target.value)}
                      placeholder={placeholder} rows={2}
                      className="w-full resize-none rounded-xl px-4 py-3 text-xs font-mono outline-none transition-all"
                      style={{
                        background: 'rgba(0,212,255,0.03)',
                        border: '1px solid rgba(0,212,255,0.12)',
                        color: '#F8FAFC', lineHeight: 1.6,
                      }}
                      onFocus={e => { e.target.style.borderColor = 'rgba(0,212,255,0.3)' }}
                      onBlur={e => { e.target.style.borderColor = 'rgba(0,212,255,0.12)' }}
                    />
                  </div>
                ))}

                {/* Summary */}
                <div className="p-4 rounded-xl"
                  style={{ background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.08)' }}>
                  <div className="text-[9px] font-mono tracking-widest mb-2"
                    style={{ color: 'rgba(0,212,255,0.4)' }}>REVIEW SUMMARY</div>
                  <div className="flex items-center gap-4 flex-wrap">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-3.5 h-3.5" style={{
                          color: overallRating >= s ? '#F59E0B' : 'rgba(255,255,255,0.1)',
                          fill: overallRating >= s ? '#F59E0B' : 'transparent'
                        }} />
                      ))}
                      <span className="text-[9px] font-mono ml-1" style={{ color: '#F59E0B' }}>{overallRating}/5</span>
                    </div>
                    <span className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.3)' }}>
                      {USAGE_CONTEXTS.find(c => c.id === usageContext)?.label || ''}
                    </span>
                    {selectedFeatures.length > 0 && (
                      <span className="text-[9px] font-mono" style={{ color: 'rgba(0,212,255,0.4)' }}>
                        {selectedFeatures.length} features requested
                      </span>
                    )}
                    <span className="text-[9px] font-mono"
                      style={{ color: wouldRecommend ? '#4ADE80' : '#F87171' }}>
                      {wouldRecommend ? '👍 Recommends' : '👎 Would not recommend'}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => setStep(2)}
                    className="px-5 py-3 rounded-xl text-xs font-mono transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(248,250,252,0.3)' }}>
                    ← BACK
                  </button>
                  <button onClick={handleSubmit} disabled={loading}
                    className="flex-1 py-3 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all"
                    style={{
                      background: 'rgba(0,212,255,0.12)',
                      border: '1px solid rgba(0,212,255,0.35)',
                      color: '#00D4FF',
                      boxShadow: '0 0 20px rgba(0,212,255,0.08)'
                    }}>
                    {loading
                      ? <><span className="animate-spin inline-block">⟳</span> SENDING...</>
                      : <><Send className="w-4 h-4" /> SUBMIT FEEDBACK</>
                    }
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

function OverallStar({ s, value, onChange }: { s: number; value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(false)
  const active = value >= s || hovered
  return (
    <button
      onClick={() => onChange(s)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ transform: active ? 'scale(1.3)' : 'scale(1)', transition: 'transform 0.15s' }}>
      <Star className="w-8 h-8" style={{
        color: value >= s ? '#F59E0B' : hovered ? '#F59E0B80' : 'rgba(255,255,255,0.1)',
        fill: value >= s ? '#F59E0B' : 'transparent',
        filter: value >= s ? 'drop-shadow(0 0 6px #F59E0B)' : 'none',
        transition: 'all 0.15s'
      }} />
    </button>
  )
}
