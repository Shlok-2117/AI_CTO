import fetch from 'node-fetch'

async function callGroq(prompt: string, systemPrompt: string): Promise<string> {
  if (!process.env.GROQ_API_KEY) throw new Error('No Groq API key')

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 8192,
      temperature: 0
    })
  })

  const data = await response.json() as any
  if (data.error) throw new Error(`Groq error: ${data.error.message}`)

  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Groq returned empty response')

  return text.replace(/```json\n?|```\n?/g, '').trim()
}

async function callOpenRouter(prompt: string, systemPrompt: string, model: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
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

  const data = await response.json() as any
  if (data.error) throw new Error(`OpenRouter ${model}: ${data.error.message}`)

  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error(`${model} returned empty`)

  return text.replace(/```json\n?|```\n?/g, '').trim()
}

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  const providers = [
    { name: 'Groq Llama', fn: () => callGroq(prompt, systemPrompt) },
    { name: 'llama-3.1-8b', fn: () => callOpenRouter(prompt, systemPrompt, 'meta-llama/llama-3.1-8b-instruct:free') },
    { name: 'mistral-7b', fn: () => callOpenRouter(prompt, systemPrompt, 'mistralai/mistral-7b-instruct:free') },
    { name: 'gemma-2-9b', fn: () => callOpenRouter(prompt, systemPrompt, 'google/gemma-2-9b-it:free') },
    { name: 'qwen-2-7b', fn: () => callOpenRouter(prompt, systemPrompt, 'qwen/qwen-2-7b-instruct:free') },
  ]

  let lastError = ''

  for (const provider of providers) {
    try {
      console.log(`Trying ${provider.name}...`)
      const result = await provider.fn()
      console.log(`Success with ${provider.name}`)
      return result
    } catch (e: any) {
      lastError = e.message
      console.error(`${provider.name} failed:`, e.message)
    }
  }

  throw new Error(`All AI providers failed. Last error: ${lastError}`)
}
