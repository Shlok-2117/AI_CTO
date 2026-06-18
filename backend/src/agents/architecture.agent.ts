import { callAI } from '../services/ai.service'
import { ARCHITECTURE_SYSTEM_PROMPT } from '../prompts/architecture.prompt'

export async function generateArchitecture(problem: string) {
  if (!problem || problem.trim().length < 10) {
    throw new Error('Please describe your idea in more detail (at least 10 characters)')
  }

  const prompt = `Analyze this startup idea and generate the system architecture:

STARTUP IDEA: ${problem.trim()}

Remember: Output ONLY valid JSON. Nothing else.`

  const raw = await callAI(prompt, ARCHITECTURE_SYSTEM_PROMPT)

  try {
    const parsed = JSON.parse(raw)
    return parsed
  } catch (e) {
    console.error('JSON parse error:', raw)
    throw new Error('AI returned invalid response. Please try again.')
  }
}
