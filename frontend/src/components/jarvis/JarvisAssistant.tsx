'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, X, Send, Cpu } from 'lucide-react'

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
  const trySpeak = () => {
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
  if (window.speechSynthesis.getVoices().length > 0) trySpeak()
  else window.speechSynthesis.onvoiceschanged = trySpeak
}

export function JarvisAssistant() {
  const [open, setOpen] = useState(false)
  const [mode, setMode] = useState<'voice' | 'text'>('voice')
  const [listening, setListening] = useState(false)
  const [speaking, setSpeaking] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [muted, setMuted] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [liveText, setLiveText] = useState('')
  const [textInput, setTextInput] = useState('')
  const [error, setError] = useState('')
  const [userName, setUserName] = useState<string | null>(null)
  const [pulseActive, setPulseActive] = useState(false)

  const recogRef = useRef<any>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const historyRef = useRef<Message[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const mutedRef = useRef(muted)
  mutedRef.current = muted

  useEffect(() => { setUserName(getUser()) }, [])
  useEffect(() => { historyRef.current = messages }, [messages])
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, liveText, thinking])

  async function callJarvis(text: string) {
    setThinking(true)
    try {
      const res = await fetch(`${API}/api/jarvis/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.slice(0, 300),
          userName,
          conversationHistory: historyRef.current.slice(-4).map(m => ({
            role: m.role,
            text: m.text.slice(0, 100),
          })),
        }),
      })
      const data = await res.json()
      const reply = data.response || 'How can I assist you?'
      setMessages(prev => [...prev, { role: 'jarvis', text: reply }])
      setThinking(false)
      setSpeaking(true)
      setPulseActive(true)
      speakText(reply, mutedRef.current, () => {
        setSpeaking(false)
        setPulseActive(false)
      })
    } catch {
      const err = 'Connection disrupted. Please try again.'
      setMessages(prev => [...prev, { role: 'jarvis', text: err }])
      setThinking(false)
    }
  }

  function handleUserMessage(text: string) {
    if (!text.trim()) return
    setMessages(prev => [...prev, { role: 'user', text: text.trim() }])
    callJarvis(text.trim())
  }

  function handleTextSend() {
    if (!textInput.trim() || thinking) return
    handleUserMessage(textInput)
    setTextInput('')
  }

  function startListening() {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SR) {
      setError('Voice not supported. Use text mode.')
      setMode('text')
      return
    }
    setError('')
    setLiveText('')
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPulseActive(false)

    const recog = new SR()
    recogRef.current = recog
    recog.lang = 'en-US'
    recog.continuous = false
    recog.interimResults = true

    recog.onstart = () => { setListening(true); setPulseActive(true) }

    recog.onresult = (e: any) => {
      let interim = '', final = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      setLiveText(interim || final)
      if (final.trim()) {
        setLiveText('')
        setListening(false)
        setPulseActive(false)
        handleUserMessage(final.trim())
      }
    }

    recog.onspeechend = () => { try { recog.stop() } catch {} }

    recog.onerror = (e: any) => {
      setListening(false)
      setLiveText('')
      setPulseActive(false)
      const msgs: Record<string, string> = {
        'not-allowed': 'Mic blocked. Click lock icon in address bar → Allow microphone.',
        'no-speech': 'Nothing heard. Try again or switch to text mode.',
        'network': 'Network error.',
        'audio-capture': 'No microphone found.',
      }
      if (msgs[e.error]) setError(msgs[e.error])
    }

    recog.onend = () => { setListening(false); setPulseActive(false) }

    try { recog.start() } catch {
      setError('Could not start mic.')
      setListening(false)
    }
  }

  function stopListening() {
    try { recogRef.current?.stop() } catch {}
    setListening(false)
    setLiveText('')
    setPulseActive(false)
  }

  function openJarvis() {
    setOpen(true)
    if (messages.length === 0) {
      const name = getUser()
      setUserName(name)
      const greeting = name
        ? `Hello ${name}! I am JARVIS. How can I assist you today?`
        : `JARVIS online. How can I assist you today?`
      setMessages([{ role: 'jarvis', text: greeting }])
      setTimeout(() => {
        setSpeaking(true)
        setPulseActive(true)
        speakText(greeting, mutedRef.current, () => {
          setSpeaking(false)
          setPulseActive(false)
        })
      }, 300)
    }
  }

  function closeJarvis() {
    stopListening()
    window.speechSynthesis.cancel()
    setSpeaking(false)
    setPulseActive(false)
    setOpen(false)
  }

  const orbColor = listening ? '#F87171' :
    speaking ? '#00D4FF' :
    thinking ? '#F59E0B' :
    '#00D4FF'

  const statusText = listening ? 'LISTENING...' :
    thinking ? 'PROCESSING...' :
    speaking ? 'SPEAKING...' :
    'STANDBY'

  return (
    <>
      {/* Floating trigger button */}
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

      {/* Full screen JARVIS chat */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] flex flex-col"
            style={{ background: '#030712' }}
          >
            {/* Animated grid background */}
            <div className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(0,212,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0,212,255,0.03) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }} />

            {/* Ambient glow */}
            <motion.div
              animate={{ opacity: [0.03, 0.08, 0.03] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(ellipse 60% 40% at 50% 50%, ${orbColor}15 0%, transparent 70%)`,
              }}
            />

            {/* Corner HUD decorations */}
            {[
              'top-4 left-4 border-t border-l',
              'top-4 right-4 border-t border-r',
              'bottom-4 left-4 border-b border-l',
              'bottom-4 right-4 border-b border-r',
            ].map((cls, i) => (
              <div key={i} className={`fixed w-8 h-8 ${cls} pointer-events-none`}
                style={{ borderColor: 'rgba(0,212,255,0.2)', zIndex: 1 }} />
            ))}

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 flex-shrink-0 relative z-10"
              style={{ borderBottom: '1px solid rgba(0,212,255,0.08)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.25)' }}>
                  <Cpu className="w-4 h-4" style={{ color: '#00D4FF' }} />
                </div>
                <div>
                  <div className="text-sm font-black tracking-[0.2em]" style={{ color: '#00D4FF' }}>
                    JARVIS
                  </div>
                  <motion.div
                    key={statusText}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-[9px] font-mono"
                    style={{
                      color: listening ? '#F87171' :
                        thinking ? '#F59E0B' :
                        speaking ? '#00D4FF' :
                        'rgba(0,212,255,0.35)',
                    }}>
                    ● {statusText}
                    {userName && !listening && !thinking && !speaking
                      ? ` · ${userName.toUpperCase()}` : ''}
                  </motion.div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setMuted(m => !m); if (!muted) window.speechSynthesis.cancel() }}
                  className="p-2 rounded-lg transition-all"
                  title={muted ? 'Unmute' : 'Mute'}
                  style={{ color: muted ? 'rgba(248,113,113,0.6)' : 'rgba(0,212,255,0.5)' }}>
                  {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <button onClick={closeJarvis} className="p-2 rounded-lg"
                  style={{ color: 'rgba(248,250,252,0.3)' }}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 relative z-10"
              style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(0,212,255,0.2) transparent' }}>
              <div className="max-w-2xl mx-auto w-full space-y-4">

                {messages.map((msg, i) => (
                  <motion.div key={i}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className="max-w-[75%]"
                      style={{
                        background: msg.role === 'user'
                          ? 'rgba(0,212,255,0.08)'
                          : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${msg.role === 'user'
                          ? 'rgba(0,212,255,0.2)'
                          : 'rgba(255,255,255,0.06)'}`,
                        borderRadius: msg.role === 'user'
                          ? '20px 20px 4px 20px'
                          : '20px 20px 20px 4px',
                        padding: '12px 16px',
                      }}>
                      {msg.role === 'jarvis' && (
                        <div className="text-[8px] font-mono font-bold mb-1.5 tracking-widest"
                          style={{ color: 'rgba(0,212,255,0.5)' }}>
                          JARVIS
                        </div>
                      )}
                      <div className="text-sm leading-relaxed"
                        style={{ color: msg.role === 'user' ? 'rgba(248,250,252,0.9)' : 'rgba(248,250,252,0.75)' }}>
                        {msg.text}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Live transcript */}
                {liveText && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-end">
                    <div className="max-w-[75%] px-4 py-3 text-sm italic"
                      style={{
                        background: 'rgba(248,113,113,0.05)',
                        border: '1px solid rgba(248,113,113,0.15)',
                        borderRadius: '20px 20px 4px 20px',
                        color: 'rgba(248,113,113,0.7)',
                      }}>
                      {liveText}...
                    </div>
                  </motion.div>
                )}

                {/* Thinking */}
                {thinking && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                    <div className="px-4 py-3 flex items-center gap-2"
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '20px 20px 20px 4px',
                      }}>
                      <span className="text-[8px] font-mono tracking-widest"
                        style={{ color: 'rgba(0,212,255,0.4)' }}>JARVIS</span>
                      {[0, 1, 2].map(i => (
                        <motion.div key={i}
                          animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                          transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.2 }}
                          className="w-2 h-2 rounded-full"
                          style={{ background: '#00D4FF' }} />
                      ))}
                    </div>
                  </motion.div>
                )}

                <div ref={bottomRef} />
              </div>
            </div>

            {/* Error bar */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-3 px-6 py-3 relative z-10 flex-shrink-0"
                  style={{ background: 'rgba(248,113,113,0.05)', borderTop: '1px solid rgba(248,113,113,0.1)' }}>
                  <span style={{ color: '#F87171' }}>⚠</span>
                  <span className="text-xs font-mono flex-1" style={{ color: 'rgba(248,113,113,0.8)' }}>{error}</span>
                  <button onClick={() => setError('')} style={{ color: 'rgba(248,113,113,0.4)' }}>✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom — orb + controls */}
            <div className="flex-shrink-0 relative z-10 pb-8 pt-4"
              style={{ borderTop: '1px solid rgba(0,212,255,0.06)' }}>
              <div className="max-w-2xl mx-auto px-6">

                {/* Mode tabs */}
                <div className="flex justify-center gap-3 mb-6">
                  {(['voice', 'text'] as const).map(m => (
                    <button key={m}
                      onClick={() => {
                        setMode(m)
                        if (m === 'text') setTimeout(() => inputRef.current?.focus(), 100)
                      }}
                      className="px-5 py-2 rounded-full text-[10px] font-mono tracking-widest transition-all"
                      style={{
                        background: mode === m ? 'rgba(0,212,255,0.1)' : 'transparent',
                        border: `1px solid ${mode === m ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        color: mode === m ? '#00D4FF' : 'rgba(248,250,252,0.2)',
                      }}>
                      {m === 'voice' ? '🎤 VOICE' : '⌨ TYPE'}
                    </button>
                  ))}
                </div>

                {/* Voice mode — big orb */}
                {mode === 'voice' && (
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative flex items-center justify-center">
                      {/* Outer pulse rings */}
                      {pulseActive && (
                        <>
                          <motion.div
                            animate={{ scale: [1, 2.5, 1], opacity: [0.3, 0, 0.3] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="absolute w-24 h-24 rounded-full"
                            style={{ border: `1px solid ${orbColor}40` }} />
                          <motion.div
                            animate={{ scale: [1, 3.5, 1], opacity: [0.15, 0, 0.15] }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.4 }}
                            className="absolute w-24 h-24 rounded-full"
                            style={{ border: `1px solid ${orbColor}20` }} />
                        </>
                      )}

                      {/* Main orb button */}
                      <motion.button
                        onClick={() => listening ? stopListening() : startListening()}
                        disabled={thinking}
                        whileHover={!thinking ? { scale: 1.08 } : {}}
                        whileTap={!thinking ? { scale: 0.94 } : {}}
                        animate={{
                          boxShadow: pulseActive
                            ? [`0 0 30px ${orbColor}40`, `0 0 60px ${orbColor}60`, `0 0 30px ${orbColor}40`]
                            : [`0 0 20px ${orbColor}20`],
                        }}
                        transition={{ duration: 1.5, repeat: pulseActive ? Infinity : 0 }}
                        className="relative w-24 h-24 rounded-full flex items-center justify-center"
                        style={{
                          background: listening ? 'rgba(248,113,113,0.12)' : 'rgba(0,212,255,0.08)',
                          border: `2px solid ${orbColor}50`,
                          cursor: thinking ? 'not-allowed' : 'pointer',
                          opacity: thinking ? 0.5 : 1,
                        }}
                      >
                        {pulseActive && (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-2 rounded-full"
                            style={{ border: `1px solid ${orbColor}30`, borderTopColor: orbColor + '80' }}
                          />
                        )}
                        {listening
                          ? <MicOff className="w-8 h-8 relative z-10" style={{ color: '#F87171' }} />
                          : <Mic className="w-8 h-8 relative z-10" style={{ color: orbColor }} />
                        }
                      </motion.button>
                    </div>

                    <div className="text-[10px] font-mono text-center"
                      style={{ color: 'rgba(248,250,252,0.2)' }}>
                      {listening ? 'LISTENING — Tap to stop'
                        : thinking ? 'PROCESSING YOUR REQUEST...'
                        : speaking ? 'JARVIS IS SPEAKING...'
                        : 'TAP TO SPEAK · Chrome only · Allow mic'}
                    </div>
                  </div>
                )}

                {/* Text mode */}
                {mode === 'text' && (
                  <div className="flex items-center gap-3">
                    <input
                      ref={inputRef}
                      type="text"
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleTextSend()}
                      placeholder="Ask JARVIS anything..."
                      disabled={thinking}
                      className="flex-1 outline-none text-sm"
                      style={{
                        background: 'rgba(0,212,255,0.04)',
                        border: '1px solid rgba(0,212,255,0.2)',
                        borderRadius: 12,
                        padding: '12px 16px',
                        color: '#F8FAFC',
                        fontFamily: 'monospace',
                      }}
                    />
                    <motion.button
                      onClick={handleTextSend}
                      disabled={!textInput.trim() || thinking}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{
                        background: textInput.trim() && !thinking ? 'rgba(0,212,255,0.1)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${textInput.trim() && !thinking ? 'rgba(0,212,255,0.3)' : 'rgba(255,255,255,0.06)'}`,
                        cursor: !textInput.trim() || thinking ? 'not-allowed' : 'pointer',
                        opacity: !textInput.trim() || thinking ? 0.4 : 1,
                      }}>
                      <Send className="w-5 h-5" style={{ color: '#00D4FF' }} />
                    </motion.button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
