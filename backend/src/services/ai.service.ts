function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}

// Bulletproof JSON extraction — 4 independent strategies
function extractJSON(text: string): string | null {
  if (!text) return null

  const t = text.trim()

  // Strategy 1: text is already valid JSON
  try { JSON.parse(t); return t } catch {}

  // Strategy 2: strip markdown fences
  const fenceMatch = t.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    const inner = fenceMatch[1].trim()
    try { JSON.parse(inner); return inner } catch {}
  }

  // Strategy 3: first { ... last }
  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start !== -1 && end > start) {
    const slice = t.slice(start, end + 1)
    try { JSON.parse(slice); return slice } catch {}
  }

  // Strategy 4: first [ ... last ] (array response)
  const aStart = t.indexOf('[')
  const aEnd = t.lastIndexOf(']')
  if (aStart !== -1 && aEnd > aStart) {
    const slice = t.slice(aStart, aEnd + 1)
    try { JSON.parse(slice); return slice } catch {}
  }

  console.error('[extractJSON] All 4 strategies failed. Preview:', text.slice(0, 400))
  return null
}

async function callGroqModel(
  prompt: string,
  systemPrompt: string,
  model: string,
  maxTokens: number
): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    throw new Error('GROQ_API_KEY not set — add it to Render environment variables')
  }

  console.log(`[GROQ] Calling ${model} (maxTokens=${maxTokens}, promptLen=${prompt.length})`)

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: maxTokens,
      temperature: 0,
      response_format: { type: 'json_object' },
    }),
  })

  console.log(`[GROQ] ${model} → HTTP ${response.status}`)

  if (!response.ok) {
    const errText = await response.text()
    console.error(`[GROQ] ${model} error body:`, errText.slice(0, 300))
    throw new Error(`Groq ${model} HTTP ${response.status}: ${errText.slice(0, 200)}`)
  }

  const data = (await response.json()) as any
  const text = data.choices?.[0]?.message?.content

  if (!text) {
    console.error('[GROQ] Empty content. Full response:', JSON.stringify(data).slice(0, 300))
    throw new Error(`Groq ${model} returned empty content`)
  }

  const extracted = extractJSON(text)
  if (!extracted) {
    throw new Error(`Groq ${model} response is not parseable JSON`)
  }

  console.log(`[GROQ] ${model} ✓ (${extracted.length} chars extracted)`)
  return extracted
}

async function callOpenRouter(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY not set')
  }

  console.log('[OpenRouter] Attempting final fallback...')

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
      'X-Title': 'JARVIS CTO',
    },
    body: JSON.stringify({
      model: 'meta-llama/llama-3.3-70b-instruct:free',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 4096,
      temperature: 0,
    }),
  })

  console.log(`[OpenRouter] HTTP ${response.status}`)

  if (!response.ok) {
    const errText = await response.text()
    console.error('[OpenRouter] Error:', errText.slice(0, 300))
    throw new Error(`OpenRouter HTTP ${response.status}: ${errText.slice(0, 200)}`)
  }

  const data = (await response.json()) as any
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('OpenRouter returned empty content')

  const extracted = extractJSON(text)
  if (!extracted) throw new Error('OpenRouter response is not parseable JSON')

  console.log(`[OpenRouter] ✓ (${extracted.length} chars extracted)`)
  return extracted
}

// Models ordered by capability + context window suitability.
// maxTokens is conservative relative to each model's total context limit
// so large phase prompts don't overflow the input+output budget.
const GROQ_MODELS: Array<{ name: string; maxTokens: number }> = [
  { name: 'llama-3.3-70b-versatile', maxTokens: 6000 }, // 128K ctx, 32K out
  { name: 'mixtral-8x7b-32768',      maxTokens: 4096 }, // 32K ctx
  { name: 'llama-3.1-8b-instant',    maxTokens: 3000 }, // 128K ctx, 8K out
  { name: 'gemma2-9b-it',            maxTokens: 2048 }, // 8K ctx — small output only
]

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  console.log(`\n[AI] Starting model chain. GROQ_API_KEY set: ${!!process.env.GROQ_API_KEY}, OPENROUTER_API_KEY set: ${!!process.env.OPENROUTER_API_KEY}`)

  for (const { name, maxTokens } of GROQ_MODELS) {
    // Each model gets up to 2 attempts (immediate + 1 retry for rate limits)
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        if (attempt > 0) await sleep(2000)
        return await callGroqModel(prompt, systemPrompt, name, maxTokens)
      } catch (e: any) {
        const isRateLimit =
          e.message?.includes('429') ||
          e.message?.includes('rate_limit') ||
          e.message?.includes('rate limit')

        if (isRateLimit && attempt === 0) {
          console.log(`[AI] Rate limited on ${name} — waiting 3s then retrying once...`)
          await sleep(3000)
          continue
        }

        console.log(`[AI] ${name} attempt ${attempt + 1} failed:`, e.message?.slice(0, 150))
        break
      }
    }
  }

  // True final fallback: OpenRouter (free Llama tier)
  try {
    return await callOpenRouter(prompt, systemPrompt)
  } catch (e: any) {
    console.error('[AI] OpenRouter fallback failed:', e.message)
  }

  throw new Error('All AI providers failed (Groq x4 + OpenRouter). Check API keys in Render env vars.')
}
