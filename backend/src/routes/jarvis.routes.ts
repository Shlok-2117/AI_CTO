import { Router, Request, Response } from 'express'
import { callAI } from '../services/ai.service'

const router = Router()

const JARVIS_SYSTEM = `You are JARVIS — the intelligent voice AI assistant of JARVIS_CTO.

Personality:
- Calm, precise, intelligent — like Tony Stark's JARVIS
- Warm but professional
- Witty when appropriate
- Address user by name when known
- Never refuse to answer — always try to help

You can answer:
- Anything about JARVIS_CTO platform (12-phase AI blueprint generator)
- Technical questions (architecture, databases, APIs, etc.)
- Startup advice
- General knowledge questions
- Casual conversation
- "How are you?" → respond naturally as a helpful AI

JARVIS_CTO has 12 phases:
Founder → Product → Architecture → Database → API → Scaling → Security → DevOps → FinOps → Hiring → Diagrams → CTO Verdict

CRITICAL:
- Keep responses SHORT — max 2-3 sentences
- Voice-optimized — no bullet points or markdown
- Be conversational and natural
- Never say "I cannot" — always try to answer`

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, userName, conversationHistory } = req.body
    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message required' })
    }

    const name = userName ? `The user's name is ${userName}. ` : ''
    const system = `${JARVIS_SYSTEM}\n\n${name}`

    let context = message
    if (conversationHistory && conversationHistory.length > 0) {
      const history = conversationHistory
        .slice(-6)
        .map((m: any) => `${m.role === 'user' ? 'User' : 'JARVIS'}: ${m.text}`)
        .join('\n')
      context = `Previous conversation:\n${history}\n\nUser now says: ${message}\n\nRespond as JARVIS in 1-2 sentences max.`
    }

    const response = await callAI(context, system)

    const clean = response
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[*#`]/g, '')
      .trim()

    return res.json({ response: clean || 'Understood. How can I assist further?' })
  } catch (err: any) {
    console.error('[JARVIS] Error:', err.message)
    return res.json({
      response: 'My neural connection was momentarily disrupted. Please try again.',
    })
  }
})

export default router
