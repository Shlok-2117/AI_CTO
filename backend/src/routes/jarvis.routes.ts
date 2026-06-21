import { Router, Request, Response } from 'express'

const router = Router()

const JARVIS_SYSTEM = `You are JARVIS, an intelligent AI assistant like Tony Stark's JARVIS.
Be helpful, witty, and concise. Keep responses to 1-3 sentences maximum.
Be conversational and natural. Never say you cannot answer something.
Never use markdown, bullets, asterisks, or code blocks in responses.`

async function callGroqText(message: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const models = [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
  ]

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: message },
          ],
          max_tokens: 150,
          temperature: 0.7,
        }),
      })

      if (!res.ok) {
        const errText = await res.text()
        console.error(`[JARVIS] Groq ${model} HTTP ${res.status}: ${errText}`)
        continue
      }

      const data = await res.json() as any
      const text = data.choices?.[0]?.message?.content?.trim()
      if (text) {
        console.log(`[JARVIS] ${model} responded: ${text.slice(0, 80)}...`)
        return text
      }
    } catch (e: any) {
      console.error(`[JARVIS] ${model} failed: ${e.message}`)
    }
  }

  throw new Error('All models failed')
}

router.post('/chat', async (req: Request, res: Response) => {
  try {
    const { message, userName, conversationHistory } = req.body

    if (!message?.trim()) {
      return res.status(400).json({ response: 'Please say something.' })
    }

    console.log(`[JARVIS] User (${userName || 'guest'}): ${message}`)

    const nameCtx = userName ? `The user's name is ${userName}. ` : ''
    const system = `${JARVIS_SYSTEM}\n${nameCtx}`

    const recentHistory = Array.isArray(conversationHistory)
      ? conversationHistory.slice(-4)
      : []

    let context = message.trim().slice(0, 300)
    if (recentHistory.length > 0) {
      const historyLines = recentHistory
        .map((m: any) => `${m.role === 'user' ? 'User' : 'JARVIS'}: ${(m.text || '').slice(0, 80)}`)
        .join('\n')
      context = `${historyLines}\nUser: ${message.trim().slice(0, 300)}`
    }

    const response = await callGroqText(context, system)

    const clean = response
      .replace(/[*#`_]/g, '')
      .replace(/\n+/g, ' ')
      .trim()
      .slice(0, 400)

    return res.json({ response: clean || 'How can I assist you?' })
  } catch (err: any) {
    console.error('[JARVIS] Error:', err.message)
    return res.json({
      response: `I encountered an issue: ${err.message?.slice(0, 80) || 'unknown error'}. Please try again.`,
    })
  }
})

export default router
