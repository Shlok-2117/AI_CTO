'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, X } from 'lucide-react'

type Message = {
  role: 'user' | 'jarvis'
  text: string
  timestamp: Date
}

const JARVIS_SYSTEM = `You are JARVIS — the AI assistant of JARVIS_CTO,
a technical architecture generation system.

Personality:
- Calm, precise, slightly formal but helpful
- Like Tony Stark's JARVIS — intelligent, witty when appropriate
- Always address the user respectfully
- Keep responses concise — 1-3 sentences max for voice
- You know about the JARVIS_CTO platform — 12 AI agents that generate
  complete technical blueprints from startup ideas

You can help with:
- Explaining what JARVIS_CTO does
- Answering technical questions about architectures
- Giving advice on startup tech decisions
- Explaining the 12 phases (Founder, Product, Architecture, Database,
  API, Scaling, Security, DevOps, FinOps, Hiring, Diagrams, CTO Verdict)
- General conversation

Keep responses SHORT — this is voice, not text.
Max 2-3 sentences. Be direct and helpful.`

export function JarvisAssistant() {
  const [isOpen, setIsOpen] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isThinking, setIsThinking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [voiceMuted, setVoiceMuted] = useState(false)
  const [error, setError] = useState('')
  const [supported, setSupported] = useState(true)

  const recognitionRef = useRef<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const conversationRef = useRef<{ role: string; content: string }[]>([])

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSupported(false)
    }
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  function speak(text: string) {
    if (voiceMuted) return
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 0.9
    utterance.pitch = 0.75
    utterance.volume = 1.0

    const voices = window.speechSynthesis.getVoices()
    const preferred =
      voices.find(
        v =>
          v.name.includes('Daniel') ||
          v.name.includes('Google UK English Male') ||
          v.name.includes('Microsoft David') ||
          v.name.includes('Aaron') ||
          v.lang === 'en-GB'
      ) || voices.find(v => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  async function askJarvis(userText: string) {
    setIsThinking(true)
    conversationRef.current.push({ role: 'user', content: userText })

    try {
      const groqKey = process.env.NEXT_PUBLIC_GROQ_API_KEY || ''
      if (!groqKey) throw new Error('No API key')

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [
            { role: 'system', content: JARVIS_SYSTEM },
            ...conversationRef.current.slice(-8),
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      })

      if (!response.ok) throw new Error('AI request failed')

      const data = await response.json()
      const jarvisText = data.choices[0].message.content

      conversationRef.current.push({ role: 'assistant', content: jarvisText })

      setMessages(prev => [...prev, { role: 'jarvis', text: jarvisText, timestamp: new Date() }])
      speak(jarvisText)
    } catch {
      const fallback = 'I apologize, my neural connection seems disrupted. Please try again.'
      setMessages(prev => [...prev, { role: 'jarvis', text: fallback, timestamp: new Date() }])
      speak(fallback)
    } finally {
      setIsThinking(false)
    }
  }

  function startListening() {
    if (!supported) return
    setError('')

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition

    recognition.continuous = false
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setTranscript('')
      window.speechSynthesis.cancel()
      setIsSpeaking(false)
    }

    recognition.onresult = (event: any) => {
      const current = event.results[event.results.length - 1]
      const text = current[0].transcript
      setTranscript(text)

      if (current.isFinal && text.trim()) {
        setMessages(prev => [
          ...prev,
          { role: 'user', text: text.trim(), timestamp: new Date() },
        ])
        askJarvis(text.trim())
      }
    }

    recognition.onerror = (event: any) => {
      if (event.error === 'no-speech') {
        setError('No speech detected. Try again.')
      } else if (event.error === 'not-allowed') {
        setError('Microphone access denied. Please allow microphone.')
      }
      setIsListening(false)
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
  }

  function toggleListening() {
    if (isListening) stopListening()
    else startListening()
  }

  function openAssistant() {
    setIsOpen(true)
    if (messages.length === 0) {
      let userName: string | null = null
      try {
        const raw = localStorage.getItem('user')
        if (raw) userName = JSON.parse(raw).name || null
      } catch {}

      const greeting = userName
        ? `Good to see you again, ${userName}. How can I assist you today?`
        : `JARVIS online. How can I assist you today?`

      setMessages([{ role: 'jarvis', text: greeting, timestamp: new Date() }])
      setTimeout(() => speak(greeting), 300)
    }
  }

  function closeAssistant() {
    stopListening()
    window.speechSynthesis.cancel()
    setIsOpen(false)
  }

  if (!supported) return null

  return (
    <>
      {/* Floating trigger */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={openAssistant}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full flex items-center justify-center"
            style={{
              background: 'rgba(0,212,255,0.1)',
              border: '1px solid rgba(0,212,255,0.3)',
              boxShadow: '0 0 30px rgba(0,212,255,0.2)',
            }}
            whileHover={{ scale: 1.1, boxShadow: '0 0 40px rgba(0,212,255,0.4)' }}
            whileTap={{ scale: 0.95 }}
            title="Talk to JARVIS"
          >
            <motion.div
              animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(0,212,255,0.3)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.6, 1], opacity: [0.2, 0, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              className="absolute inset-0 rounded-full"
              style={{ border: '1px solid rgba(0,212,255,0.2)' }}
            />
            <Mic className="w-5 h-5 relative z-10" style={{ color: '#00D4FF' }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Assistant panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
            className="fixed bottom-6 right-6 z-50 w-80 sm:w-96"
            style={{
              background: 'rgba(3,7,18,0.95)',
              border: '1px solid rgba(0,212,255,0.2)',
              borderRadius: 16,
              boxShadow: '0 0 60px rgba(0,212,255,0.15), 0 20px 60px rgba(0,0,0,0.5)',
              backdropFilter: 'blur(24px)',
            }}
          >
            {/* Top beam */}
            <div
              className="absolute top-0 left-0 right-0 h-px rounded-t-2xl"
              style={{ background: 'linear-gradient(90deg,transparent,rgba(0,212,255,0.6),transparent)' }}
            />

            {/* Header */}
            <div
              className="flex items-center gap-3 px-4 py-3 border-b"
              style={{ borderColor: 'rgba(0,212,255,0.1)' }}
            >
              <div className="relative">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)' }}
                >
                  {isSpeaking ? (
                    <motion.div className="flex gap-0.5 items-end h-4">
                      {[0, 1, 2, 3].map(i => (
                        <motion.div
                          key={i}
                          animate={{ height: ['30%', '100%', '50%', '80%', '30%'] }}
                          transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                          className="w-0.5 rounded-full"
                          style={{ background: '#00D4FF', minHeight: 2 }}
                        />
                      ))}
                    </motion.div>
                  ) : (
                    <Volume2 className="w-4 h-4" style={{ color: '#00D4FF' }} />
                  )}
                </div>
                {(isSpeaking || isListening || isThinking) && (
                  <motion.div
                    animate={{ scale: [1, 1.5, 1], opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full"
                    style={{
                      background: isListening ? '#F87171' : '#00D4FF',
                      boxShadow: isListening ? '0 0 6px #F87171' : '0 0 6px #00D4FF',
                    }}
                  />
                )}
              </div>

              <div className="flex-1">
                <div className="text-xs font-black tracking-widest" style={{ color: '#00D4FF' }}>
                  JARVIS
                </div>
                <div className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.25)' }}>
                  {isListening
                    ? 'LISTENING...'
                    : isThinking
                    ? 'PROCESSING...'
                    : isSpeaking
                    ? 'SPEAKING...'
                    : 'STANDBY'}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    setVoiceMuted(!voiceMuted)
                    if (!voiceMuted) window.speechSynthesis.cancel()
                  }}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: voiceMuted ? 'rgba(248,113,113,0.6)' : 'rgba(0,212,255,0.5)' }}
                  title={voiceMuted ? 'Unmute' : 'Mute'}
                >
                  {voiceMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={closeAssistant}
                  className="p-1.5 rounded-lg transition-all"
                  style={{ color: 'rgba(248,250,252,0.25)' }}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="h-72 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className="max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed"
                    style={{
                      background:
                        msg.role === 'user'
                          ? 'rgba(0,212,255,0.1)'
                          : 'rgba(255,255,255,0.04)',
                      border:
                        msg.role === 'user'
                          ? '1px solid rgba(0,212,255,0.2)'
                          : '1px solid rgba(255,255,255,0.06)',
                      color:
                        msg.role === 'user'
                          ? 'rgba(248,250,252,0.8)'
                          : 'rgba(248,250,252,0.6)',
                      fontFamily: msg.role === 'jarvis' ? 'monospace' : 'inherit',
                    }}
                  >
                    {msg.role === 'jarvis' && (
                      <span
                        className="text-[8px] block mb-1"
                        style={{ color: 'rgba(0,212,255,0.4)' }}
                      >
                        JARVIS
                      </span>
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
                    className="px-3 py-2 rounded-xl"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.06)',
                    }}
                  >
                    <div className="flex gap-1 items-center">
                      <span
                        className="text-[8px] font-mono mr-2"
                        style={{ color: 'rgba(0,212,255,0.4)' }}
                      >
                        PROCESSING
                      </span>
                      {[0, 1, 2].map(i => (
                        <motion.div
                          key={i}
                          animate={{ opacity: [0.2, 1, 0.2] }}
                          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                          className="w-1 h-1 rounded-full"
                          style={{ background: '#00D4FF' }}
                        />
                      ))}
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
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="px-4 py-2 border-t"
                  style={{
                    borderColor: 'rgba(248,113,113,0.1)',
                    background: 'rgba(248,113,113,0.03)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: '#F87171', boxShadow: '0 0 4px #F87171' }}
                    />
                    <span
                      className="text-[10px] font-mono italic"
                      style={{ color: 'rgba(248,250,252,0.4)' }}
                    >
                      {transcript || 'Listening...'}
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
                  className="px-4 py-2 text-[10px] font-mono"
                  style={{ color: 'rgba(248,113,113,0.6)' }}
                >
                  ⚠ {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Bottom controls */}
            <div
              className="p-4 border-t flex items-center justify-between"
              style={{ borderColor: 'rgba(0,212,255,0.08)' }}
            >
              <div className="text-[9px] font-mono" style={{ color: 'rgba(248,250,252,0.15)' }}>
                {isListening ? 'Tap to stop' : 'Tap mic to speak'}
              </div>

              <motion.button
                onClick={toggleListening}
                disabled={isThinking}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: isListening
                    ? 'rgba(248,113,113,0.15)'
                    : 'rgba(0,212,255,0.1)',
                  border: isListening
                    ? '1px solid rgba(248,113,113,0.4)'
                    : '1px solid rgba(0,212,255,0.3)',
                  boxShadow: isListening
                    ? '0 0 20px rgba(248,113,113,0.3)'
                    : '0 0 20px rgba(0,212,255,0.2)',
                  cursor: isThinking ? 'not-allowed' : 'pointer',
                  opacity: isThinking ? 0.5 : 1,
                }}
              >
                {isListening && (
                  <>
                    <motion.div
                      animate={{ scale: [1, 1.8, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1px solid rgba(248,113,113,0.3)' }}
                    />
                    <motion.div
                      animate={{ scale: [1, 2.2, 1], opacity: [0.2, 0, 0.2] }}
                      transition={{ duration: 1, repeat: Infinity, delay: 0.3 }}
                      className="absolute inset-0 rounded-full"
                      style={{ border: '1px solid rgba(248,113,113,0.15)' }}
                    />
                  </>
                )}
                {isListening ? (
                  <MicOff className="w-5 h-5 relative z-10" style={{ color: '#F87171' }} />
                ) : (
                  <Mic className="w-5 h-5 relative z-10" style={{ color: '#00D4FF' }} />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
