async function callGroq(prompt: string, systemPrompt: string, model: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) {
    console.error('[GROQ] API key missing!')
    throw new Error('GROQ_API_KEY not set')
  }

  console.log(`[GROQ] Key found: ${apiKey.slice(0, 8)}...`)
  console.log(`[GROQ] Calling model: ${model}`)
  console.log(`[GROQ] Prompt length: ${prompt.length}`)

  try {
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

    console.log(`[GROQ] Response status: ${response.status}`)

    if (!response.ok) {
      const err = await response.text()
      console.error(`[GROQ] Error body: ${err}`)
      throw new Error(`Groq ${model} HTTP ${response.status}: ${err}`)
    }

    const data = await response.json() as any
    console.log(`[GROQ] Response received, finish_reason: ${data.choices?.[0]?.finish_reason}`)

    const text = data.choices?.[0]?.message?.content
    if (!text) {
      console.error('[GROQ] Empty content in response:', JSON.stringify(data))
      throw new Error(`Groq ${model} empty response`)
    }

    console.log(`[GROQ] Success! Content length: ${text.length}`)
    return text.replace(/```json\n?|```\n?/g, '').trim()

  } catch (e: any) {
    console.error(`[GROQ] Caught error: ${e.message}`)
    throw e
  }
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
