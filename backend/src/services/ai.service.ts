// Each Groq model has its own independent TPM bucket — rotating avoids hitting any single limit.
const GROQ_MODELS = [
  'llama-3.1-8b-instant',
  'llama-3.3-70b-versatile',
  'meta-llama/llama-4-scout-17b-16e-instruct',
  'openai/gpt-oss-20b',
  'qwen/qwen3-32b',
]

async function callGroq(prompt: string, systemPrompt: string, modelId: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 30000)

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: modelId,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0,
        response_format: { type: 'json_object' }
      }),
      signal: controller.signal
    })

    clearTimeout(timeout)

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Groq ${modelId} HTTP ${response.status}: ${err.slice(0, 200)}`)
    }

    const data = await response.json() as any
    const text = data.choices?.[0]?.message?.content
    if (!text) throw new Error(`Groq ${modelId} returned empty content`)

    console.log(`[AI] Groq ${modelId} success, length: ${text.length}`)
    return text.replace(/```json\n?|```\n?/g, '').trim()

  } catch (e: any) {
    clearTimeout(timeout)
    if (e.name === 'AbortError') throw new Error(`Groq ${modelId} timeout after 30s`)
    throw e
  }
}

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  let lastError = ''

  for (const modelId of GROQ_MODELS) {
    try {
      console.log(`[AI] Trying Groq ${modelId}...`)
      const result = await callGroq(prompt, systemPrompt, modelId)
      console.log(`[AI] Success: Groq ${modelId}`)
      return result
    } catch (e: any) {
      lastError = e.message
      console.log(`[AI] Failed Groq ${modelId}:`, e.message.slice(0, 150))
    }
  }

  throw new Error(`All AI providers failed. Last: ${lastError}`)
}
