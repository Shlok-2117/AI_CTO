import { Router, Request, Response } from 'express'
import { callAI } from '../services/ai.service'

const router = Router()

const JARVIS_SYSTEM = `You are JARVIS — voice AI assistant of JARVIS_CTO.
Be helpful, intelligent, concise like Tony Stark's JARVIS.
Answer in 1-2 sentences max — this is voice output.
Never use markdown, bullets, or code blocks in responses.
Be natural and conversational.`

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, userName, conversationHistory } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ error: 'Message required' })
    }

    const nameContext = userName ? `User's name: ${userName}. ` : ''

    // Keep ONLY last 3 exchanges to prevent token overflow
    const recentHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-6)
      : []

    // Build minimal context
    let context = ''
    if (recentHistory.length > 0) {
      const historyText = recentHistory
        .map((m: any) => {
          const role = m.role === 'user' ? 'User' : 'JARVIS'
          // Truncate each message to 100 chars max
          const text = (m.text || '').slice(0, 100)
          return `${role}: ${text}`
        })
        .join('\n')
      context = `Recent chat:\n${historyText}\n\nUser: ${message.slice(0, 200)}`
    } else {
      context = message.slice(0, 200)
    }

    const fullSystem = `${JARVIS_SYSTEM}\n${nameContext}Reply in 1-2 sentences only.`

    const response = await callAI(context, fullSystem)

    // Clean response - remove markdown
    const clean = response
      .replace(/```[\s\S]*?```/g, '')
      .replace(/[*#`_]/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 300) // Max 300 chars for voice

    return res.json({
      response: clean || 'Understood. How can I assist you further?',
    })
  } catch (err: any) {
    console.error('[JARVIS] Error:', err.message)
    return res.json({
      response: 'My connection was disrupted. Please try again.',
    })
  }
})

export default router
