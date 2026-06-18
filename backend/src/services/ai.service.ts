async function callGroq(prompt: string, systemPrompt: string, model: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) throw new Error('GROQ_API_KEY not set')

  console.log(`[AI] Calling Groq model: ${model}`)

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
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
    throw new Error(`Groq ${model} HTTP ${response.status}: ${err}`)
  }

  const data = await response.json() as any
  const text = data.choices?.[0]?.message?.content
  if (!text) throw new Error(`Groq ${model} empty response`)

  return text.replace(/```json\n?|```\n?/g, '').trim()
}

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  const groqModels = [
    'llama-3.1-8b-instant',
    'llama-3.3-70b-versatile',
    'llama-4-scout-17b-16e-instruct',
    'qwen-qwq-32b'
  ]

  for (const model of groqModels) {
    try {
      console.log(`[AI] Trying Groq: ${model}`)
      const result = await callGroq(prompt, systemPrompt, model)
      console.log(`[AI] Success: ${model}`)
      return result
    } catch (e: any) {
      console.log(`[AI] Groq ${model} failed:`, e.message.slice(0, 150))
    }
  }

  throw new Error('All Groq models failed')
}
