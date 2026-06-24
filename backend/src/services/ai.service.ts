function sleep(ms: number) {
  return new Promise<void>(r => setTimeout(r, ms))
}

// Bulletproof JSON extraction — 4 independent strategies
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

  console.error('[extractJSON] All 5 strategies failed. Preview:', text.slice(0, 400))
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

// Returns cooldown duration in ms, or null for no cooldown (config/404 errors).
function cooldownForError(providerName: string, errorMsg: string): number | null {
  if (isRateLimit(errorMsg)) {
    return providerName === 'Groq' ? SIXTY_FIVE_SEC_MS : ONE_HOUR_MS
  }
  if (errorMsg.includes('404')) return null
  if (errorMsg.includes('500')) return TWO_MIN_MS
  return ONE_MIN_MS
}

// ── CEREBRAS (Primary) ──────────────────────────────────────────────────────
// Model list from GET /v1/models as of 2026-06-24: gpt-oss-120b, zai-glm-4.7
async function callCerebras(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.CEREBRAS_API_KEY
  if (!apiKey) throw new Error('CEREBRAS_API_KEY not set')
  const models = ['gpt-oss-120b', 'zai-glm-4.7']
  let lastError: Error = new Error('Cerebras: no models tried')
  for (const model of models) {
    try {
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
        lastError = new Error(`Cerebras HTTP ${response.status}: ${err.slice(0, 200)}`)
        if (response.status === 429) throw lastError
        continue
      }
      const data = (await response.json()) as any
      const text = data.choices?.[0]?.message?.content
      if (!text) { lastError = new Error(`Cerebras ${model} empty content`); continue }
      const extracted = extractJSON(text)
      if (!extracted) { lastError = new Error(`Cerebras ${model} not parseable JSON`); continue }
      console.log(`[Cerebras] ${model} ✓ (${extracted.length} chars)`)
      return extracted
    } catch (e: any) {
      if (e.message?.includes('429')) throw e
      lastError = e
      console.log(`[Cerebras] ${model} failed:`, e.message?.slice(0, 150))
    }
  }
  throw lastError
}

// ── GEMINI (Secondary) ──────────────────────────────────────────────────────
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

// ── MISTRAL helpers ──────────────────────────────────────────────────────────
// No system message — Mistral ignores response_format when system prompt is
// long. Merge everything into user message with explicit JSON instruction.
async function callMistralModel(
  prompt: string,
  systemPrompt: string,
  model: string,
  apiKey: string
): Promise<string> {
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'user',
          content: systemPrompt + '\n\n' + prompt + '\n\nReturn ONLY a valid JSON object. No comments, no trailing commas, no explanation. Start with { end with }.',
        },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })
  console.log(`[Mistral] ${model} → HTTP ${response.status}`)
  if (!response.ok) {
    const err = await response.text()
    console.error(`[Mistral] ${model} error:`, err.slice(0, 300))
    throw new Error(`Mistral HTTP ${response.status}: ${err.slice(0, 200)}`)
  }
  const data = (await response.json()) as any
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error(`Mistral ${model} returned empty content`)
  const extracted = extractJSON(text)
  if (!extracted) throw new Error(`Mistral ${model} response not parseable JSON`)
  console.log(`[Mistral] ${model} ✓ (${extracted.length} chars)`)
  return extracted
}

// ── MISTRAL (Third) ─────────────────────────────────────────────────────────
async function callMistral(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set')
  console.log('[Mistral] Calling mistral-small-latest...')
  return callMistralModel(prompt, systemPrompt, 'mistral-small-latest', apiKey)
}

// ── GROQ (Fourth) ───────────────────────────────────────────────────────────
// llama-3.1-8b-instant has a separate TPM quota from 70b.
// Only set Groq cooldown if BOTH models return 429.
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

// ── SAMBANOVA (Fifth) ────────────────────────────────────────────────────────
async function callSambaNova(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.SAMBANOVA_API_KEY
  if (!apiKey) throw new Error('SAMBANOVA_API_KEY not set')
  console.log('[SambaNova] Calling Meta-Llama-3.3-70B-Instruct...')
  const response = await fetch('https://api.sambanova.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'Meta-Llama-3.3-70B-Instruct',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
      max_tokens: 1500,
      temperature: 0.7,
    }),
  })
  console.log(`[SambaNova] HTTP ${response.status}`)
  if (!response.ok) {
    const err = await response.text()
    console.error('[SambaNova] Error:', err.slice(0, 300))
    throw new Error(`SambaNova HTTP ${response.status}: ${err.slice(0, 200)}`)
  }
  const data = (await response.json()) as any
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('SambaNova returned empty content')
  const extracted = extractJSON(text)
  if (!extracted) throw new Error('SambaNova response not parseable JSON')
  console.log(`[SambaNova] ✓ (${extracted.length} chars)`)
  return extracted
}

// ── MISTRAL FALLBACK (Sixth) — open-mistral-7b, separate quota ──────────────
async function callMistralFallback(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set')
  console.log('[MistralFallback] Calling open-mistral-7b...')
  return callMistralModel(prompt, systemPrompt, 'open-mistral-7b', apiKey)
}

function isRateLimit(msg: string): boolean {
  return (
    msg.includes('429') ||
    msg.includes('rate_limit') ||
    msg.includes('rate limit') ||
    msg.includes('RESOURCE_EXHAUSTED')
  )
}

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  console.log(
    `\n[AI] 6-provider chain: Cerebras→Gemini→Mistral→Groq→SambaNova→MistralFallback | GROQ=${!!process.env.GROQ_API_KEY} GEMINI=${!!process.env.GEMINI_API_KEY}`
  )

  const providers: Array<{ name: string; fn: () => Promise<string> }> = [
    { name: 'Cerebras',       fn: () => callCerebras(prompt, systemPrompt) },
    { name: 'Gemini',         fn: () => callGemini(prompt, systemPrompt) },
    { name: 'Mistral',        fn: () => callMistral(prompt, systemPrompt) },
    { name: 'Groq',           fn: () => callGroq(prompt, systemPrompt) },
    { name: 'SambaNova',      fn: () => callSambaNova(prompt, systemPrompt) },
    { name: 'MistralFallback',fn: () => callMistralFallback(prompt, systemPrompt) },
  ]

  if (!process.env.SAMBANOVA_API_KEY) {
    console.warn('[AI] REMINDER: Add SAMBANOVA_API_KEY from cloud.sambanova.ai to Render env vars')
  }

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
