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

async function callGemini(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY not set')
  }

  console.log('[Gemini] Calling gemini-1.5-flash...')

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 2000,
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    }
  )

  console.log(`[Gemini] HTTP ${response.status}`)

  if (!response.ok) {
    const errText = await response.text()
    console.error('[Gemini] Error:', errText.slice(0, 300))
    throw new Error(`Gemini HTTP ${response.status}: ${errText.slice(0, 200)}`)
  }

  const data = (await response.json()) as any
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text

  if (!text) {
    console.error('[Gemini] Empty content. Full response:', JSON.stringify(data).slice(0, 300))
    throw new Error('Gemini returned empty content')
  }

  const extracted = extractJSON(text)
  if (!extracted) {
    throw new Error('Gemini response is not parseable JSON')
  }

  console.log(`[Gemini] ✓ (${extracted.length} chars extracted)`)
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
  { name: 'llama-3.3-70b-versatile', maxTokens: 6000 }, // primary — best quality, 128K ctx
  { name: 'llama-3.1-8b-instant',    maxTokens: 3000 }, // fast fallback, 128K ctx
  { name: 'llama-3.1-8b-instant',    maxTokens: 2000 }, // emergency — reduced tokens
]

function isRateLimit(msg: string) {
  return msg.includes('429') || msg.includes('rate_limit') || msg.includes('rate limit') || msg.includes('RESOURCE_EXHAUSTED')
}

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  console.log(
    `\n[AI] Chain: Groq → Gemini → OpenRouter | keys: GROQ=${!!process.env.GROQ_API_KEY} GEMINI=${!!process.env.GEMINI_API_KEY} OR=${!!process.env.OPENROUTER_API_KEY}`
  )

  // 1. Try Groq models. Any 429 immediately skips the rest of the Groq chain.
  for (const { name, maxTokens } of GROQ_MODELS) {
    try {
      return await callGroqModel(prompt, systemPrompt, name, maxTokens)
    } catch (e: any) {
      if (isRateLimit(e.message ?? '')) {
        console.log(`[AI] Groq rate limited on ${name} — jumping to Gemini`)
        break
      }
      console.log(`[AI] Groq ${name} failed:`, e.message?.slice(0, 150))
    }
  }

  // 2. Try Gemini (1M tokens/day free). 429 skips straight to OpenRouter.
  try {
    return await callGemini(prompt, systemPrompt)
  } catch (e: any) {
    if (isRateLimit(e.message ?? '')) {
      console.log('[AI] Gemini rate limited — jumping to OpenRouter')
    } else {
      console.error('[AI] Gemini failed:', e.message)
    }
  }

  // 3. Final fallback: OpenRouter free tier.
  try {
    return await callOpenRouter(prompt, systemPrompt)
  } catch (e: any) {
    console.error('[AI] OpenRouter failed:', e.message)
  }

  throw new Error('All AI providers failed (Groq + Gemini + OpenRouter). Check API keys in Render env vars.')
}
