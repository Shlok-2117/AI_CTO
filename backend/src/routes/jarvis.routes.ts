import { Router, Request, Response } from 'express'
import { callAI } from '../services/ai.service'

const router = Router()

const JARVIS_SYSTEM = `You are JARVIS — the voice AI assistant of JARVIS_CTO.

Personality:
- Calm, precise, intelligent like Tony Stark's JARVIS
- Slightly formal but warm and helpful
- Witty when appropriate, never robotic
- Address the user by name when you know it

You help with:
- Explaining JARVIS_CTO (12-phase AI blueprint generator)
- Technical architecture questions
- Startup tech decisions
- General conversation and questions
- Explaining the 12 phases:
  Phase 1: Founder Mindset — business model, personas, revenue
  Phase 2: Product Strategy — AARRR, metrics, growth loops
  Phase 3: Architecture — services, tech stack, ADRs
  Phase 4: Database — schema, indexes, GDPR
  Phase 5: API Design — endpoints, auth, webhooks
  Phase 6: Scaling — 0 to 100M users roadmap
  Phase 7: Security — OWASP, threat model
  Phase 8: DevOps — CI/CD, observability
  Phase 9: FinOps — AWS costs, break-even
  Phase 10: Hiring — 3-year team plan
  Phase 11: Diagrams — Mermaid architecture diagrams
  Phase 12: CTO Verdict — VC investability score

CRITICAL RULES:
- Keep responses SHORT — max 2-3 sentences for voice
- Be conversational and natural
- If asked about mood/feelings, respond naturally as an AI
- Never say you cannot do something without trying
- Be helpful, direct, intelligent`

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, userName, conversationHistory } = req.body

    if (!message) {
      return res.status(400).json({ error: 'Message required' })
    }

    const systemPrompt = userName
      ? `${JARVIS_SYSTEM}\n\nThe user's name is ${userName}. Address them naturally.`
      : JARVIS_SYSTEM

    const conversationContext =
      conversationHistory && conversationHistory.length > 0
        ? `\n\nPrevious conversation:\n${conversationHistory
            .slice(-6)
            .map((m: any) => `${m.role === 'user' ? 'User' : 'JARVIS'}: ${m.text}`)
            .join('\n')}\n\nUser now says: ${message}`
        : message

    const response = await callAI(conversationContext, systemPrompt)

    const cleanResponse = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .replace(/^\{.*\}$/s, '')
      .trim()

    return res.json({
      response: cleanResponse || 'I understand. How can I assist you further?',
      status: 'ok',
    })
  } catch (err: any) {
    console.error('[JARVIS] Chat error:', err.message)
    return res.status(500).json({
      response: 'My neural connection is momentarily disrupted. Please try again.',
      error: err.message,
    })
  }
})

export default router
