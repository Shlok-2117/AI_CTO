import fetch from 'node-fetch'

async function callGroq(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 4096,
      temperature: 0,
      response_format: { type: 'json_object' }
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Groq HTTP ${response.status}: ${err}`)
  }

  const data = await response.json() as any
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Groq returned empty content')
  return text.replace(/```json\n?|```\n?/g, '').trim()
}

async function callOpenRouter(prompt: string, systemPrompt: string, model: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) throw new Error('OPENROUTER_API_KEY not set')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://ai-cto-two.vercel.app',
      'X-Title': 'AI CTO'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 4096,
      temperature: 0
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`OpenRouter ${model} HTTP ${response.status}: ${err}`)
  }

  const data = await response.json() as any
  if (data.error) throw new Error(`OpenRouter ${model}: ${data.error.message}`)

  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error(`${model} returned empty`)
  return text.replace(/```json\n?|```\n?/g, '').trim()
}

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  const providers = [
    {
      name: 'Groq llama-3.1-8b-instant',
      fn: () => callGroq(prompt, systemPrompt)
    },
    {
      name: 'OpenRouter llama-3.1-8b',
      fn: () => callOpenRouter(prompt, systemPrompt, 'meta-llama/llama-3.1-8b-instruct:free')
    },
    {
      name: 'OpenRouter mistral-7b',
      fn: () => callOpenRouter(prompt, systemPrompt, 'mistralai/mistral-7b-instruct:free')
    },
    {
      name: 'OpenRouter gemma-2-9b',
      fn: () => callOpenRouter(prompt, systemPrompt, 'google/gemma-2-9b-it:free')
    },
  ]

  let lastError = ''
  for (const provider of providers) {
    try {
      console.log(`[AI] Trying ${provider.name}...`)
      const result = await provider.fn()
      console.log(`[AI] Success: ${provider.name}`)
      return result
    } catch (e: any) {
      lastError = e.message
      console.error(`[AI] Failed ${provider.name}:`, e.message)
    }
  }

  throw new Error(`All AI providers failed. Last: ${lastError}`)
}
