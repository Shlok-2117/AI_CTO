import fetch from 'node-fetch'

const FREE_MODELS = [
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'openai/gpt-oss-20b:free',
  'mistralai/mistral-7b-instruct:free',
  'microsoft/phi-3-mini-128k-instruct:free',
  'meta-llama/llama-3.2-3b-instruct:free',
]

async function callModel(model: string, prompt: string, systemPrompt: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      'HTTP-Referer': 'http://localhost:3000',
      'X-Title': 'AI CTO'
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      max_tokens: 8192,
      temperature: 0.7
    })
  })

  const data = await response.json() as any

  if (!response.ok) {
    throw new Error(`${response.status}: ${data?.error?.message || 'Provider error'}`)
  }

  const content = data.choices?.[0]?.message?.content
  if (!content) {
    console.error('Empty response from', model, JSON.stringify(data))
    throw new Error('Empty response')
  }

  return content
}

export async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  let lastError: Error = new Error('No models tried')

  for (const model of FREE_MODELS) {
    try {
      console.log(`Trying model: ${model}`)
      const text = await callModel(model, prompt, systemPrompt)
      console.log(`Success with: ${model}`)
      const cleaned = text.replace(/```json|```/g, '').trim()
      return cleaned
    } catch (e: any) {
      console.error(`Model ${model} failed:`, e.message)
      lastError = e
    }
  }

  throw new Error(`All AI models failed. Last error: ${lastError.message}`)
}
