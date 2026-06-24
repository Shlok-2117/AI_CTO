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

  console.error('[extractJSON] All 4 strategies failed. Preview:', text.slice(0, 400))
  return null
}

// Per-provider in-memory cooldown tracking (resets on server restart)
const cooldownUntil = new Map<string, number>()
const ONE_HOUR_MS    = 60 * 60 * 1000
const NINETY_SEC_MS  = 90 * 1000
const TWO_MIN_MS     =  2 * 60 * 1000
const ONE_MIN_MS     =  1 * 60 * 1000

function isOnCooldown(provider: string): boolean {
  const until = cooldownUntil.get(provider)
  return until !== undefined && Date.now() < until
}

function setCooldown(provider: string, ms: number): void {
  cooldownUntil.set(provider, Date.now() + ms)
  console.log(`[AI] ${provider} cooldown: ${Math.round(ms / 60000)}min`)
}

export function isGroqOnCooldown(): boolean {
  return isOnCooldown('Groq')
}

// Returns cooldown duration in ms, or null for no cooldown (config/404 errors).
// Groq TPM resets every ~60s so its 429 gets a 2min window, not 1hr.
function cooldownForError(providerName: string, errorMsg: string): number | null {
  if (isRateLimit(errorMsg)) {
    return providerName === 'Groq' ? NINETY_SEC_MS : ONE_HOUR_MS
  }
  if (errorMsg.includes('404')) return null       // model not found — no cooldown
  if (errorMsg.includes('500')) return TWO_MIN_MS // server error — short cooldown
  return ONE_MIN_MS                               // network / unknown — short cooldown
}

// ── CEREBRAS (Primary) ──────────────────────────────────────────────────────
async function callCerebras(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.CEREBRAS_API_KEY
  if (!apiKey) throw new Error('CEREBRAS_API_KEY not set')
  // Try 70b first; fall back to 8b which has a separate quota
  const models = ['llama-3.3-70b', 'llama-3.1-8b']
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
        if (response.status === 429) throw lastError // propagate rate limit immediately
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

// ── MISTRAL (Third) ─────────────────────────────────────────────────────────
async function callMistral(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.MISTRAL_API_KEY
  if (!apiKey) throw new Error('MISTRAL_API_KEY not set')
  console.log('[Mistral] Calling mistral-small-latest...')
  const response = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: 'mistral-small-latest',
      messages: [
        { role: 'system', content: 'You are a JSON API. Return ONLY raw valid JSON. No markdown, no explanation, no text before or after the JSON object.' },
        { role: 'user', content: `${systemPrompt}\n\n${prompt}\n\nRespond with ONLY a valid JSON object.` },
      ],
      max_tokens: 1500,
      temperature: 0.7,
      response_format: { type: 'json_object' },
    }),
  })
  console.log(`[Mistral] HTTP ${response.status}`)
  if (!response.ok) {
    const err = await response.text()
    console.error('[Mistral] Error:', err.slice(0, 300))
    throw new Error(`Mistral HTTP ${response.status}: ${err.slice(0, 200)}`)
  }
  const data = (await response.json()) as any
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error('Mistral returned empty content')
  const extracted = extractJSON(text)
  if (!extracted) throw new Error('Mistral response not parseable JSON')
  console.log(`[Mistral] ✓ (${extracted.length} chars)`)
  return extracted
}

// ── GROQ (Fourth) ───────────────────────────────────────────────────────────
// llama-3.1-8b-instant has a separate TPM quota from 70b, so a 429 on 70b
// does NOT mean 8b is also rate limited. Try both before giving up.
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
  // Only surface a 429 to callAI (triggering the 2min cooldown) if every
  // model was rate limited. A single-model 429 is just a quota split issue.
  if (rateLimitedCount === models.length) {
    throw new Error(`Groq HTTP 429: all models rate limited`)
  }
  throw lastError
}

// ── HUGGINGFACE (Emergency) ─────────────────────────────────────────────────
async function callHuggingFace(prompt: string, systemPrompt: string): Promise<string> {
  const apiKey = process.env.HUGGINGFACE_API_KEY
  if (!apiKey) throw new Error('HUGGINGFACE_API_KEY not set')
  const fullPrompt = `<s>[INST] ${systemPrompt}\n\n${prompt} [/INST]`

  const doRequest = async () => {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)
    try {
      return await fetch(
        'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            inputs: fullPrompt,
            parameters: { max_new_tokens: 1000, temperature: 0.7, return_full_text: false },
          }),
          signal: controller.signal,
        }
      )
    } finally {
      clearTimeout(timeout)
    }
  }

  console.log('[HuggingFace] Calling Mistral-7B-Instruct-v0.2...')
  let response = await doRequest()

  if (response.status === 503) {
    console.log('[HuggingFace] Model loading (503) — waiting 20s then retrying...')
    await new Promise(r => setTimeout(r, 20000))
    response = await doRequest()
  }

  console.log(`[HuggingFace] HTTP ${response.status}`)
  if (!response.ok) {
    const err = await response.text()
    console.error('[HuggingFace] Error:', err.slice(0, 300))
    throw new Error(`HuggingFace HTTP ${response.status}: ${err.slice(0, 200)}`)
  }
  const data = (await response.json()) as any
  const text = Array.isArray(data) ? data[0]?.generated_text : data?.generated_text
  if (!text) throw new Error('HuggingFace returned empty content')
  const extracted = extractJSON(text)
  if (!extracted) throw new Error('HuggingFace response not parseable JSON')
  console.log(`[HuggingFace] ✓ (${extracted.length} chars)`)
  return extracted
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
    `\n[AI] 5-provider chain: Cerebras→Gemini→Mistral→Groq→HuggingFace | GROQ=${!!process.env.GROQ_API_KEY} GEMINI=${!!process.env.GEMINI_API_KEY}`
  )

  const providers: Array<{ name: string; fn: () => Promise<string> }> = [
    { name: 'Cerebras',    fn: () => callCerebras(prompt, systemPrompt) },
    { name: 'Gemini',      fn: () => callGemini(prompt, systemPrompt) },
    { name: 'Mistral',     fn: () => callMistral(prompt, systemPrompt) },
    { name: 'Groq',        fn: () => callGroq(prompt, systemPrompt) },
    { name: 'HuggingFace', fn: () => callHuggingFace(prompt, systemPrompt) },
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

  throw new Error('All 5 AI providers failed. Check Render logs and API keys.')
}
