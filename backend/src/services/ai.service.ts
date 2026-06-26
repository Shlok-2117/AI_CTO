function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}

// Bulletproof JSON extraction — 5 independent strategies
function extractJSON(text: string): string | null {
  if (!text) return null

  const t = text.trim()

  try { JSON.parse(t); return t } catch {}

  const fenceMatch = t.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenceMatch) {
    const inner = fenceMatch[1].trim()
    try { JSON.parse(inner); return inner } catch {}
  }

  const start = t.indexOf('{')
  const end = t.lastIndexOf('}')
  if (start !== -1 && end > start) {
    const slice = t.slice(start, end + 1)
    try { JSON.parse(slice); return slice } catch {}
  }

  const aStart = t.indexOf('[')
  const aEnd = t.lastIndexOf(']')
  if (aStart !== -1 && aEnd > aStart) {
    const slice = t.slice(aStart, aEnd + 1)
    try { JSON.parse(slice); return slice } catch {}
  }

  // Strategy 5: strip JS comments, trailing commas, control chars then parse
  try {
    const cleaned = t
      .replace(/\/\/[^\n]*/g, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/,(\s*[}\]])/g, '$1')
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
      .trim()
    JSON.parse(cleaned)
    return cleaned
  } catch {}

  // Strategy 6: unicode smart-chars + trailing commas then extract {}
  const unicodeCleaned = text
    .replace(/\u2011/g, '-')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '-')
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201C|\u201D/g, '"')
    .replace(/\u00A0/g, ' ')
    .replace(/\u2026/g, '...')
    .replace(/,(\s*[}\]])/g, '$1')
    .replace(/\/\/[^\n]*/g, '')
  const us = unicodeCleaned.indexOf('{')
  const ue = unicodeCleaned.lastIndexOf('}')
  if (us !== -1 && ue > us) {
    const slice = unicodeCleaned.slice(us, ue + 1)
    try { JSON.parse(slice); return slice } catch {}
  }

  console.error('[extractJSON] All 6 strategies failed. Preview:', text.slice(0, 400))
  return null
}

// Per-provider in-memory cooldown tracking (resets on server restart)
const cooldownUntil = new Map<string, number>()
const ONE_HOUR_MS       = 60 * 60 * 1000
const SIXTY_FIVE_SEC_MS = 65 * 1000
const TWO_MIN_MS        =  2 * 60 * 1000
const ONE_MIN_MS        =  1 * 60 * 1000

function isOnCooldown(provider: string): boolean {
  const until = cooldownUntil.get(provider)
  return until !== undefined && Date.now() < until
}

function setCooldown(provider: string, ms: number): void {
  cooldownUntil.set(provider, Date.now() + ms)
  console.log(`[AI] ${provider} cooldown: ${Math.round(ms / 60000)}min`)
}

function isRateLimit(msg: string): boolean {
  return (
    msg.includes('429') ||
    msg.includes('rate_limit') ||
    msg.includes('rate limit') ||
    msg.includes('RESOURCE_EXHAUSTED')
  )
}

// DeepSeek and Groq have short TPM windows; all others get 1hr on 429.
function cooldownForError(providerName: string, errorMsg: string): number | null {
  if (isRateLimit(errorMsg)) {
    return (providerName === 'Groq' || providerName === 'DeepSeek')
      ? SIXTY_FIVE_SEC_MS
      : ONE_HOUR_MS
  }
  if (errorMsg.includes('404')) return null
  if (errorMsg.includes('500')) return TWO_MIN_MS
  return ONE_MIN_MS
}

// ── CEREBRAS (Primary) ───────────────────────────────────────────────────────
async function callCerebras(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.CEREBRAS_API_KEY
  if (!apiKey) throw new Error('CEREBRAS_API_KEY not set')
  const model = 'gpt-oss-120b'
  console.log(`[Cerebras] Calling ${model}...`)
  const response = await fetch('https://api.cerebras.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  })
  console.log(`[Cerebras] ${model} → HTTP ${response.status}`)
  if (!response.ok) {
    const err = await response.text()
    console.error(`[Cerebras] ${model} error:`, err.slice(0, 300))
    throw new Error(`Cerebras HTTP ${response.status}: ${err.slice(0, 200)}`)
  }
  const data = (await response.json()) as any
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Cerebras returned empty content')
  const extracted = extractJSON(text)
  if (!extracted) throw new Error('Cerebras response not parseable JSON')
  console.log(`[Cerebras] ${model} ✓ (${extracted.length} chars)`)
  return extracted
}

// ── GROQ (Third — llama-3.1-8b has separate TPM quota from 70b) ─────────────
async function callGroq(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')
  const models = [
    { name: 'llama-3.3-70b-versatile', maxTokens: 1500 },
    { name: 'llama-3.1-8b-instant',    maxTokens: 1500 },
  ]
  let lastError: Error = new Error('Groq: no models tried')
  let rateLimitedCount = 0
  for (const { name, maxTokens } of models) {
    try {
      console.log(`[Groq] Calling ${name}...`)
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: name,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: prompt },
          ],
          max_tokens: maxTokens,
          temperature: 0,
          response_format: { type: 'json_object' },
        }),
      })
      console.log(`[Groq] ${name} → HTTP ${response.status}`)
      if (!response.ok) {
        const err = await response.text()
        lastError = new Error(`Groq ${name} HTTP ${response.status}: ${err.slice(0, 200)}`)
        if (response.status === 429) {
          rateLimitedCount++
          console.log(`[Groq] ${name} rate limited — trying next model`)
        }
        continue
      }
      const data = (await response.json()) as any
      const text = data.choices?.[0]?.message?.content
      if (!text) { lastError = new Error(`Groq ${name} empty content`); continue }
      const extracted = extractJSON(text)
      if (!extracted) { lastError = new Error(`Groq ${name} not parseable JSON`); continue }
      console.log(`[Groq] ${name} ✓ (${extracted.length} chars)`)
      return extracted
    } catch (e: any) {
      lastError = e
      if (e.message?.includes('429')) rateLimitedCount++
      console.log(`[Groq] ${name} failed:`, e.message?.slice(0, 150))
    }
  }
  if (rateLimitedCount === models.length) {
    throw new Error(`Groq HTTP 429: all models rate limited`)
  }
  throw lastError
}

// ── GEMINI (Fourth) ──────────────────────────────────────────────────────────
async function callGemini(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')
  console.log('[Gemini] Calling gemini-2.0-flash...')
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          maxOutputTokens: 1500,
          temperature: 0.7,
          responseMimeType: 'application/json',
        },
      }),
    }
  )
  console.log(`[Gemini] HTTP ${response.status}`)
  if (!response.ok) {
    const err = await response.text()
    console.error('[Gemini] Error:', err.slice(0, 300))
    throw new Error(`Gemini HTTP ${response.status}: ${err.slice(0, 200)}`)
  }
  const data = (await response.json()) as any
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned empty content')
  const extracted = extractJSON(text)
  if (!extracted) throw new Error('Gemini response not parseable JSON')
  console.log(`[Gemini] ✓ (${extracted.length} chars)`)
  return extracted
}

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  console.log(
    `\n[AI] 3-provider chain: Cerebras→Groq→Gemini | CEREBRAS=${!!process.env.CEREBRAS_API_KEY} GROQ=${!!process.env.GROQ_API_KEY} GEMINI=${!!process.env.GEMINI_API_KEY}`
  )

  const providers: Array<{ name: string; fn: () => Promise<string> }> = [
    { name: 'Cerebras', fn: () => callCerebras(prompt, systemPrompt) },
    { name: 'Groq',     fn: () => callGroq(prompt, systemPrompt) },
    { name: 'Gemini',   fn: () => callGemini(prompt, systemPrompt) },
  ]

  for (const { name, fn } of providers) {
    if (isOnCooldown(name)) {
      const remaining = Math.ceil(((cooldownUntil.get(name) ?? 0) - Date.now()) / 60000)
      console.log(`[AI] ${name} on cooldown (${remaining}min left) — skipping`)
      continue
    }
    try {
      return await fn()
    } catch (e: any) {
      const msg = e.message ?? ''
      const cd = cooldownForError(name, msg)
      if (cd === null) {
        console.error(`[AI] ${name} config error (no cooldown): ${msg.slice(0, 150)}`)
      } else {
        console.error(`[AI] ${name} failed: ${msg.slice(0, 150)}`)
        setCooldown(name, cd)
      }
    }
  }

  // If all providers are on cooldown, wait for the shortest reset then retry once
  const allCooling = providers.every(({ name }) => isOnCooldown(name))
  if (allCooling) {
    const shortestWait = Math.min(
      ...providers.map(({ name }) => Math.max(0, (cooldownUntil.get(name) ?? 0) - Date.now()))
    ) + 500
    console.log(`[AI] All providers cooling — waiting ${Math.round(shortestWait / 1000)}s for fastest reset`)
    await new Promise(r => setTimeout(r, shortestWait))
    for (const { name, fn } of providers) {
      if (isOnCooldown(name)) continue
      try {
        console.log(`[AI] Retrying ${name} after cooldown wait`)
        return await fn()
      } catch (e: any) {
        console.error(`[AI] ${name} failed after wait: ${(e.message ?? '').slice(0, 150)}`)
      }
    }
  }

  throw new Error('All AI providers failed. Check Render logs and API keys.')
}
