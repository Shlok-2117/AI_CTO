'use client'
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react'

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'

type Message = {
  role: 'user' | 'jarvis'
  text: string
}

function getVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices()
  return (
    voices.find(
      v =>
        v.name.includes('Daniel') ||
        v.name.includes('Google UK English Male') ||
        v.name.includes('Microsoft David') ||
        v.name.includes('Aaron') ||
        v.lang === 'en-GB'
    ) ||
    voices.find(v => v.lang.startsWith('en')) ||
    null
  )
}

function getUserName(): string | null {
  try {
    const stored = localStorage.getItem('user')
    if (!stored) return null
    const user = JSON.parse(stored)
    if (user.name && user.name.trim() && !user.name.includes('@')) {
      return user.name.trim()
    }
    return null
  } catch {
    return null
  }
}

export function JarvisAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [voiceMuted, setVoiceMuted] = useState(false)
  const [error, setError] = useState('')
  const [userName, setUserName] = useState<string | null>(null)
  const [supported, setSupported] = useState(false)

  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const voiceMutedRef = useRef(voiceMuted)
  voiceMutedRef.current = voiceMuted

  useEffect(() => {
    const hasSpeech =
      'webkitSpeechRecognition' in window || 'SpeechRecognition' in window
    setSupported(hasSpeech)
    setUserName(getUserName())
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function speak(text: string) {
    if (voiceMutedRef.current || typeof window === 'undefined') return
    window.speechSynthesis.cancel()

    const trySpeak = () => {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.88
      utterance.pitch = 0.75
      utterance.volume = 1.0
      const voice = getVoice()
      if (voice) utterance.voice = voice
      utterance.onstart = () => setIsSpeaking(true)
      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      window.speechSynthesis.speak(utterance)
    }

    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.onvoiceschanged = trySpeak
    } else {
      trySpeak()
    }
  }

  async function askJarvis(userText: string) {
    setIsThinking(true)
    try {
      const res = await fetch(`${API}/api/jarvis/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          userName,
          conversationHistory: messages.slice(-8),
        }),
      })

      const data = await res.json()
      const reply = data.response || 'I apologize, something went wrong.'
      setMessages(prev => [...prev, { role: 'jarvis', text: reply }])
      speak(reply)
    } catch {
      const fallback = 'My connection seems disrupted. Please try again.'
      setMessages(prev => [...prev, { role: 'jarvis', text: fallback }])
      speak(fallback)
    } finally {
      setIsThinking(false)
    }
  }

  function startListening() {
    if (!supported) {
      setError('Speech recognition not supported. Use Chrome.')
      return
    }
    setError('')
    window.speechSynthesis.cancel()
    setIsSpeaking(false)

    const SR =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SR()
    recognitionRef.current = recognition

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
    }

    recognition.onresult = (event: any) => {
      const result = event.results[event.results.length - 1]
      const text = result[0].transcript
      setTranscript(text)

      if (result.isFinal && text.trim()) {
        const finalText = text.trim()
        setMessages(prev => [...prev, { role: 'user', text: finalText }])
        setTranscript('')
        askJarvis(finalText)
      }
    }

    recognition.onerror = (e: any) => {
      setIsListening(false)
      setTranscript('')
      if (e.error === 'not-allowed') {
        setError('Microphone blocked. Allow mic access in browser settings.')
      } else if (e.error === 'no-speech') {
        setError('No speech detected. Please try again.')
      } else {
        setError(`Error: ${e.error}`)
      }
    }

    recognition.onend = () => {
      setIsListening(false)
      setTranscript('')
    }

    recognition.start()
  }

  function stopListening() {
    recognitionRef.current?.stop()
    setIsListening(false)
    setTranscript('')
  }

  function openAssistant() {
    setIsOpen(true)
    if (messages.length === 0) {
      const name = getUserName()
      setUserName(name)
      const greeting = name
        ? `Hello ${name}! JARVIS online and ready. How can I assist you today?`
        : `JARVIS online. How can I assist you today?`
      setMessages([{ role: 'jarvis', text: greeting }])
      setTimeout(() => speak(greeting), 400)
    }
  }

  function closeAssistant() {
    stopListening()
    window.speechSynthesis.cancel()
    setIsOpen(false)
    setIsSpeaking(false)
  }

  return (
    <>
      {/* Floating mic button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={openAssistant}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(0,212,255,0.08)',
              border: '1px solid rgba(0,212,255,0.3)',
              boxShadow: '0 0 30px rgba(0,212,255,0.15)',
            }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(0,212,255,0.35)' }}
            whileTap={{ scale: 0.95 }}
            title="Talk to JARVIS (voice assistant)"
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(0,212,255,0.25)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.8, 1], opacity: [0.15, 0, 0.15] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(0,212,255,0.15)' }}
            />
            <Mic className="w-5 h-5 relative z-10" style={{ color: '#00D4FF' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Assistant panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.85, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.85, y: 30 }}
            transition={{ duration: 0.35, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-6 right-6 z-50"
            style={{
              width: 360,
              background: 'rgba(3,7,18,0.97)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 20,
              boxShadow:
                '0 0 60px rgba(0,212,255,0.12), 0 30px 80px rgba(0,0,0,0.6)',
              backdropFilter: 'blur(30px)',
              overflow: 'hidden',
            }}
          >
            {/* Top glow */}
            <div
              className="absolute top-0 left-0 right-0 h-px"
              style={{
                background:
                  'linear-gradient(90deg,transparent,#00D4FF,transparent)',
              }}
            />

            {/* Header */}
            <div
              className="px-5 py-3.5 border-b flex items-center gap-3"
              style={{ borderColor: 'rgba(0,212,255,0.08)' }}
            >
              <div className="relative flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'rgba(0,212,255,0.1)',
                    border: '1px solid rgba(0,212,255,0.2)',
                  }}
                >
                  {isSpeaking ? (
                    <div className="flex gap-0.5 items-end h-4 px-1">
                      {[0, 1, 2, 3].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: ['20%', '100%', '40%', '80%', '20%'] }}
                          transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.1 }}
                          className="w-0.5 rounded-full flex-shrink-0"
                          style={{ background: '#00D4FF', minHeight: 2 }}
                        />
                      ))}
                    </div>
                  ) : (
                    <Volume2 className="w-4 h-4" style={{ color: '#00D4FF' }} />
                  )}
                </div>
                {(isSpeaking || isListening || isThinking) && (
                  <motion.div
                    animate={{ opacity: [1, 0.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                    style={{
                      background: isListening ? '#F87171' : '#00D4FF',
                      boxShadow: `0 0 6px ${isListening ? '#F87171' : '#00D4FF'}`,
                    }}
                  />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div
                  className="text-xs font-black tracking-[0.2em]"
                  style={{ color: '#00D4FF' }}
                >
                  JARVIS
                </div>
                <motion.div
                  key={
                    isListening
                      ? 'listening'
                      : isThinking
                      ? 'thinking'
                      : isSpeaking
                      ? 'speaking'
                      : 'idle'
                  }
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-[9px] font-mono"
                  style={{ color: 'rgba(248,250,252,0.25)' }}
                >
                  {isListening
                    ? '● LISTENING TO YOU...'
                    : isThinking
                    ? '◈ PROCESSING...'
                    : isSpeaking
                    ? '▶ SPEAKING...'
                    : userName
                    ? `ONLINE · ${userName.toUpperCase()}`
                    : 'ONLINE · STANDBY'}
                </motion.div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setVoiceMuted(v => !v)
                    if (!voiceMuted) window.speechSynthesis.cancel()
                  }}
                  className="p-1.5 rounded-lg transition-all"
                  title={voiceMuted ? 'Unmute JARVIS' : 'Mute JARVIS'}
                  style={{
                    color: voiceMuted
                      ? 'rgba(248,113,113,0.5)'
                      : 'rgba(0,212,255,0.4)',
                  }}
                >
                  {voiceMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={closeAssistant}
                  className="p-1.5 rounded-lg"
                  style={{ color: 'rgba(248,250,252,0.2)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div
              className="h-64 overflow-y-auto p-4 space-y-3"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(0,212,255,0.2) transparent',
              }}
            >
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className="max-w-[88%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed"
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'rgba(0,212,255,0.12)'
                          : 'rgba(255,255,255,0.04)',
                      border:
                        msg.role === 'user'
                          ? '1px solid rgba(0,212,255,0.25)'
                          : '1px solid rgba(255,255,255,0.06)',
                      color:
                        msg.role === 'user'
                          ? 'rgba(248,250,252,0.9)'
                          : 'rgba(248,250,252,0.65)',
                      borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                      borderBottomLeftRadius: msg.role === 'jarvis' ? 4 : 16,
                    }}
                  >
                    {msg.role === 'jarvis' && (
                      <div
                        className="text-[8px] font-mono mb-1.5 font-bold"
                        style={{ color: 'rgba(0,212,255,0.5)' }}
                      >
                        JARVIS
                      </div>
                    )}
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isThinking && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div
                    className="px-3.5 py-2.5 rounded-2xl rounded-bl-sm"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className="text-[8px] font-mono"
                        style={{ color: 'rgba(0,212,255,0.35)' }}
                      >
                        JARVIS
                      </span>
                      <div className="flex gap-1 ml-1">
                        {[0, 1, 2].map(i => (
                          <motion.div
                            key={i}
                            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1, 0.8] }}
                            transition={{
                              duration: 0.7,
                              repeat: Infinity,
                              delay: i * 0.2,
                            }}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: '#00D4FF' }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Live transcript */}
            <AnimatePresence>
              {(isListening || transcript) && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-2.5 border-t overflow-hidden"
                  style={{
                    borderColor: 'rgba(248,113,113,0.1)',
                    background: 'rgba(248,113,113,0.03)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: '#F87171', boxShadow: '0 0 6px #F87171' }}
                    />
                    <span
                      className="text-[10px] font-mono italic truncate"
                      style={{ color: 'rgba(248,250,252,0.4)' }}
                    >
                      {transcript || 'Listening for your voice...'}
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mx-4 mb-2 px-3 py-2 rounded-lg text-[10px] font-mono flex items-center gap-2"
                  style={{
                    background: 'rgba(248,113,113,0.06)',
                    color: 'rgba(248,113,113,0.7)',
                    border: '1px solid rgba(248,113,113,0.1)',
                  }}
                >
                  <span>⚠</span>
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError('')}>✕</button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Controls */}
            <div
              className="px-5 py-4 border-t flex items-center justify-between"
              style={{ borderColor: 'rgba(0,212,255,0.06)' }}
            >
              <div
                className="text-[9px] font-mono"
                style={{ color: 'rgba(248,250,252,0.12)' }}
              >
                {isListening
                  ? '● Tap to stop'
                  : isThinking
                  ? '◈ Processing...'
                  : '○ Tap mic · speak'}
              </div>

              <motion.button
                onClick={() => (isListening ? stopListening() : startListening())}
                disabled={isThinking}
                whileHover={!isThinking ? { scale: 1.08 } : {}}
                whileTap={!isThinking ? { scale: 0.94 } : {}}
                className="relative w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: isListening
                    ? 'rgba(248,113,113,0.12)'
                    : 'rgba(0,212,255,0.1)',
                  border: `1px solid ${
                    isListening
                      ? 'rgba(248,113,113,0.4)'
                      : 'rgba(0,212,255,0.3)'
                  }`,
                  boxShadow: isListening
                    ? '0 0 25px rgba(248,113,113,0.25)'
                    : '0 0 25px rgba(0,212,255,0.15)',
                  cursor: isThinking ? 'not-allowed' : 'pointer',
                  opacity: isThinking ? 0.5 : 1,
                }}
              >
                {isListening && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 2, 1], opacity: [0.3, 0, 0.3] }}
                      transition={{ duration: 1.2, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1px solid rgba(248,113,113,0.3)' }}
                    />
                    <motion.div
                      animate={{ scale: [1, 2.5, 1], opacity: [0.15, 0, 0.15] }}
                      transition={{ duration: 1.2, repeat: Infinity, delay: 0.3 }}
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1px solid rgba(248,113,113,0.15)' }}
                    />
                  </>
                )}
                {isListening ? (
                  <MicOff
                    className="w-5 h-5 relative z-10"
                    style={{ color: '#F87171' }}
                  />
                ) : (
                  <Mic
                    className="w-5 h-5 relative z-10"
                    style={{ color: '#00D4FF' }}
                  />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
