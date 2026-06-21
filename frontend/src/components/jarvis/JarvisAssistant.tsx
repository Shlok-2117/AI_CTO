'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Message = { role: 'user' | 'jarvis'; text: string }

function getUser() {
  try {
    const s = localStorage.getItem('user')
    if (!s) return null
    const u = JSON.parse(s)
    if (u.name && !u.name.includes('@')) return u.name.trim()
    return null
  } catch { return null }
}

function speakText(text: string, muted: boolean, onEnd?: () => void) {
  if (muted || typeof window === 'undefined') { onEnd?.(); return }
  window.speechSynthesis.cancel()

  const utter = new SpeechSynthesisUtterance(text)
  utter.rate = 0.88
  utter.pitch = 0.75
  utter.volume = 1.0

  const setVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    const v = voices.find(v =>
      v.name.includes('Daniel') ||
      v.name.includes('Google UK English Male') ||
      v.name.includes('Microsoft David') ||
      v.lang === 'en-GB'
    ) || voices.find(v => v.lang.startsWith('en'))
    if (v) utter.voice = v
    utter.onend = () => onEnd?.()
    utter.onerror = () => onEnd?.()
    window.speechSynthesis.speak(utter)
  }

  if (window.speechSynthesis.getVoices().length > 0) {
    setVoice()
  } else {
    window.speechSynthesis.onvoiceschanged = setVoice
  }
}

export function JarvisAssistant() {
  const [open, setOpen] = useState(false)
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [muted, setMuted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [liveText, setLiveText] = useState('')
  const [status, setStatus] = useState('STANDBY')
  const [error, setError] = useState('')
  const [userName, setUserName] = useState<string | null>(null)
  const [canUseVoice, setCanUseVoice] = useState(false)

  const recogRef = useRef<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<Message[]>([])
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  useEffect(() => {
    const has = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    setCanUseVoice(has)
    setUserName(getUser())
  }, [])

  useEffect(() => {
    historyRef.current = messages
  }, [messages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, liveText, thinking])

  async function callJarvis(text: string) {
    setThinking(true)
    setStatus('PROCESSING')
    try {
      const res = await fetch(`${API}/api/jarvis/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          userName,
          conversationHistory: historyRef.current.slice(-10),
        }),
      })
      const data = await res.json()
      const reply = data.response || "I'm processing your request. Please try again."
      setMessages(prev => [...prev, { role: 'jarvis', text: reply }])
      setThinking(false)
      setSpeaking(true)
      setStatus('SPEAKING')
      speakText(reply, mutedRef.current, () => {
        setSpeaking(false)
        setStatus('STANDBY')
      })
    } catch {
      const err = 'My neural connection was disrupted. Please try again.'
      setMessages(prev => [...prev, { role: 'jarvis', text: err }])
      setThinking(false)
      speakText(err, mutedRef.current, () => { setSpeaking(false); setStatus('STANDBY') })
    }
  }

  function startListening() {
    if (!canUseVoice) {
      setError('Use Chrome browser for voice support.')
      return
    }
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setError('')
    setLiveText('')

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recog = new SR()
    recogRef.current = recog

    recog.lang = 'en-US'
    recog.continuous = false
    recog.interimResults = true
    recog.maxAlternatives = 1

    recog.onstart = () => {
      setListening(true)
      setStatus('LISTENING')
    }

    recog.onresult = (e: any) => {
      let interim = ''
      let final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      setLiveText(interim || final)
      if (final.trim()) {
        const userMsg = final.trim()
        setLiveText('')
        setListening(false)
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        callJarvis(userMsg)
      }
    }

    recog.onspeechend = () => recog.stop()

    recog.onerror = (e: any) => {
      setListening(false)
      setLiveText('')
      setStatus('STANDBY')
      if (e.error === 'not-allowed') {
        setError('Microphone blocked! Allow mic in browser settings (address bar lock icon).')
      } else if (e.error === 'no-speech') {
        setError('No speech detected. Speak clearly and try again.')
      } else if (e.error === 'network') {
        setError('Network error. Check your internet connection.')
      } else {
        setError(`Error: ${e.error}. Try again.`)
      }
    }

    recog.onend = () => {
      setListening(false)
      if (!thinking) setStatus('STANDBY')
    }

    try {
      recog.start()
    } catch {
      setError('Could not start microphone. Try again.')
      setListening(false)
    }
  }

  function stopListening() {
    try { recogRef.current?.stop() } catch {}
    try { recogRef.current?.abort() } catch {}
    setListening(false)
    setLiveText('')
    setStatus('STANDBY')
  }

  function openJarvis() {
    setOpen(true)
    if (messages.length === 0) {
      const name = getUser()
      setUserName(name)
      const greeting = name
        ? `Hello ${name}! JARVIS online. Tap the mic and speak to me.`
        : `JARVIS online. Tap the mic and ask me anything.`
      setMessages([{ role: 'jarvis', text: greeting }])
      setTimeout(() => {
        setSpeaking(true)
        setStatus('SPEAKING')
        speakText(greeting, mutedRef.current, () => {
          setSpeaking(false)
          setStatus('STANDBY')
        })
      }, 500)
    }
  }

  function closeJarvis() {
    stopListening()
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setOpen(false)
    setStatus('STANDBY')
  }

  const statusColor =
    status === 'LISTENING' ? '#F87171' :
    status === 'SPEAKING'  ? '#00D4FF' :
    status === 'PROCESSING' ? '#F59E0B' :
    'rgba(0,212,255,0.3)'

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={openJarvis}
            className="fixed bottom-6 right-6 z-[999] w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.35)',
              boxShadow: '0 0 30px rgba(0,212,255,0.2)',
            }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.94 }}
            title="Talk to JARVIS"
          >
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(0,212,255,0.3)' }}
            />
            <Mic className="w-5 h-5" style={{ color: '#00D4FF' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, y: 24 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-6 right-6 z-[999] flex flex-col"
            style={{
              width: 360,
              maxHeight: '85vh',
              background: 'rgba(3,7,18,0.97)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 20,
              boxShadow: '0 0 60px rgba(0,212,255,0.12), 0 30px 80px rgba(0,0,0,0.7)',
              backdropFilter: 'blur(30px)',
              overflow: 'hidden',
            }}
          >
            {/* Top glow */}
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{ background: 'linear-gradient(90deg,transparent,#00D4FF,transparent)' }} />

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
              <div className="relative flex-shrink-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.08)', border: '1px solid rgba(0,212,255,0.2)' }}>
                  {speaking ? (
                    <div className="flex gap-0.5 items-end h-4 px-1">
                      {[0, 1, 2, 3].map(i => (
                        <motion.div key={i}
                          animate={{ height: ['20%', '100%', '40%', '80%', '20%'] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                          className="w-0.5 rounded-full"
                          style={{ background: '#00D4FF', minHeight: 2 }} />
                      ))}
                    </div>
                  ) : (
                    <Volume2 className="w-4 h-4" style={{ color: '#00D4FF' }} />
                  )}
                </div>
                <motion.div
                  animate={{ opacity: [1, 0.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                  className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                  style={{ background: statusColor, boxShadow: `0 0 6px ${statusColor}` }}
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-xs font-black tracking-[0.2em]" style={{ color: '#00D4FF' }}>
                  JARVIS
                </div>
                <div className="text-[9px] font-mono" style={{ color: statusColor }}>
                  ● {status}{userName && status === 'STANDBY' ? ` · ${userName.toUpperCase()}` : ''}
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => { setMuted(m => !m); if (!muted) window.speechSynthesis.cancel() }}
                  className="p-1.5 rounded-lg"
                  style={{ color: muted ? 'rgba(248,113,113,0.6)' : 'rgba(0,212,255,0.5)' }}
                  title={muted ? 'Unmute' : 'Mute'}
                >
                  {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <button onClick={closeJarvis} className="p-1.5 rounded-lg"
                  style={{ color: 'rgba(248,250,252,0.2)' }}>
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,212,255,0.2) transparent' }}>
              {messages.map((msg, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className="max-w-[88%] px-3.5 py-2.5 text-xs leading-relaxed"
                    style={{
                      background: msg.role === 'user' ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${msg.role === 'user' ? 'rgba(0,212,255,0.25)' : 'rgba(255,255,255,0.06)'}`,
                      borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      color: msg.role === 'user' ? 'rgba(248,250,252,0.9)' : 'rgba(248,250,252,0.7)',
                    }}>
                    {msg.role === 'jarvis' && (
                      <div className="text-[8px] font-mono font-bold mb-1.5"
                        style={{ color: 'rgba(0,212,255,0.5)' }}>JARVIS</div>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {/* Live transcript bubble */}
              {(listening || liveText) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                  <div className="max-w-[88%] px-3.5 py-2.5 text-xs italic"
                    style={{
                      background: 'rgba(248,113,113,0.08)',
                      border: '1px solid rgba(248,113,113,0.2)',
                      borderRadius: '16px 16px 4px 16px',
                      color: 'rgba(248,113,113,0.7)',
                    }}>
                    {liveText || '...'}
                  </div>
                </motion.div>
              )}

              {/* Thinking dots */}
              {thinking && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="px-3.5 py-2.5 flex items-center gap-2"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: '16px 16px 16px 4px',
                    }}>
                    <span className="text-[8px] font-mono" style={{ color: 'rgba(0,212,255,0.4)' }}>JARVIS</span>
                    {[0, 1, 2].map(i => (
                      <motion.div key={i}
                        animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                        transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ background: '#00D4FF' }} />
                    ))}
                  </div>
                </motion.div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Error bar */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2.5 flex items-start gap-2 flex-shrink-0"
                  style={{ background: 'rgba(248,113,113,0.06)', borderTop: '1px solid rgba(248,113,113,0.1)' }}
                >
                  <span style={{ color: '#F87171', fontSize: 12 }}>⚠</span>
                  <span className="text-[10px] font-mono flex-1"
                    style={{ color: 'rgba(248,113,113,0.8)', lineHeight: 1.5 }}>
                    {error}
                  </span>
                  <button onClick={() => setError('')} style={{ color: 'rgba(248,113,113,0.5)', fontSize: 12 }}>✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div className="px-5 py-4 flex items-center justify-between flex-shrink-0"
              style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}>
              <div className="text-[9px] font-mono space-y-0.5" style={{ color: 'rgba(248,250,252,0.2)' }}>
                <div>
                  {listening ? '● Tap to stop' :
                   thinking  ? '◈ Wait...' :
                   speaking  ? '▶ Speaking...' :
                   '○ Tap mic to speak'}
                </div>
                <div style={{ color: 'rgba(248,250,252,0.1)' }}>Works in Chrome · Allow mic</div>
              </div>

              {/* Mic button */}
              <motion.button
                onClick={() => listening ? stopListening() : startListening()}
                disabled={thinking}
                whileHover={!thinking ? { scale: 1.1 } : {}}
                whileTap={!thinking ? { scale: 0.92 } : {}}
                className="relative w-14 h-14 rounded-full flex items-center justify-center"
                style={{
                  background: listening ? 'rgba(248,113,113,0.15)' : 'rgba(0,212,255,0.1)',
                  border: `1.5px solid ${listening ? 'rgba(248,113,113,0.5)' : 'rgba(0,212,255,0.35)'}`,
                  boxShadow: listening ? '0 0 30px rgba(248,113,113,0.3)' : '0 0 30px rgba(0,212,255,0.2)',
                  cursor: thinking ? 'not-allowed' : 'pointer',
                  opacity: thinking ? 0.4 : 1,
                }}
              >
                {listening && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 2, 1], opacity: [0.35, 0, 0.35] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1px solid rgba(248,113,113,0.3)' }} />
                    <motion.div
                      animate={{ scale: [1, 2.6, 1], opacity: [0.15, 0, 0.15] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1px solid rgba(248,113,113,0.15)' }} />
                  </>
                )}
                {listening
                  ? <MicOff className="w-6 h-6 relative z-10" style={{ color: '#F87171' }} />
                  : <Mic className="w-6 h-6 relative z-10" style={{ color: '#00D4FF' }} />
                }
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
